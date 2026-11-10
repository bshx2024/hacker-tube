import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/core/db';
import { getStripeClient } from '@/core/payment';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any = null;
    const stripe = getStripeClient();

    if (stripe && signature && webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Allow internal or manual JSON webhook if secret is not set (e.g. dev/testing)
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
      }
    }

    if (!event) {
      return NextResponse.json({ error: 'No event received' }, { status: 400 });
    }

    // Handle completed checkout session
    if (event.type === 'checkout.session.completed' || event.event === 'order.paid') {
      const sessionObj = event.data?.object || event;
      const orderNo = sessionObj.metadata?.orderNo || sessionObj.orderNo;
      const userId = sessionObj.metadata?.userId || sessionObj.userId;
      const transactionId = sessionObj.id || sessionObj.transactionId || nanoid();

      if (orderNo) {
        const [existingOrder] = await db
          .select()
          .from(schema.order)
          .where(eq(schema.order.orderNo, orderNo))
          .limit(1);

        // Idempotency check: if already paid, return 200 immediately
        if (existingOrder && existingOrder.status === 'paid') {
          return NextResponse.json({ received: true, note: 'Already processed' });
        }

        // Update order status
        if (existingOrder) {
          await db
            .update(schema.order)
            .set({
              status: 'paid',
              transactionId,
              paidAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(schema.order.orderNo, orderNo));
        }

        // Upgrade user to Pro
        const targetUserId = userId || existingOrder?.userId;
        if (targetUserId) {
          await db
            .update(schema.user)
            .set({
              plan: 'pro',
              credits: 99999,
              updatedAt: new Date(),
            })
            .where(eq(schema.user.id, targetUserId));

          // Upsert subscription
          const [existingSub] = await db
            .select()
            .from(schema.subscription)
            .where(eq(schema.subscription.userId, targetUserId))
            .limit(1);

          const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days later

          if (existingSub) {
            await db
              .update(schema.subscription)
              .set({
                status: 'active',
                subscriptionId: sessionObj.subscription || transactionId,
                currentPeriodEnd: periodEnd,
                updatedAt: new Date(),
              })
              .where(eq(schema.subscription.id, existingSub.id));
          } else {
            await db.insert(schema.subscription).values({
              id: nanoid(),
              userId: targetUserId,
              plan: 'pro',
              status: 'active',
              paymentProvider: 'stripe',
              subscriptionId: sessionObj.subscription || transactionId,
              currentPeriodStart: new Date(),
              currentPeriodEnd: periodEnd,
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Payment webhook error:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
