import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/core/db';
import { getStripeClient } from '@/core/payment';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Record<string, unknown> | null = null;
    const stripe = getStripeClient();

    if (stripe && signature && webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret) as unknown as Record<string, unknown>;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Invalid signature';
        console.error('Webhook signature verification failed:', errorMsg);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Allow internal or manual JSON webhook if secret is not set (e.g. dev/testing)
      try {
        event = JSON.parse(rawBody) as Record<string, unknown>;
      } catch {
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
      }
    }

    if (!event) {
      return NextResponse.json({ error: 'No event received' }, { status: 400 });
    }

    // Handle completed checkout session
    if (event.type === 'checkout.session.completed' || event.event === 'order.paid') {
      const eventData = event.data as Record<string, unknown> | undefined;
      const sessionObj = (eventData?.object || event) as Record<string, unknown>;
      const metadata = sessionObj.metadata as Record<string, string> | undefined;
      const orderNo = (metadata?.orderNo || sessionObj.orderNo) as string | undefined;
      const userId = (metadata?.userId || sessionObj.userId) as string | undefined;
      const transactionId = ((sessionObj.id || sessionObj.transactionId) as string) || nanoid();

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
                subscriptionId: (sessionObj.subscription as string) || transactionId,
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
              subscriptionId: (sessionObj.subscription as string) || transactionId,
              currentPeriodStart: new Date(),
              currentPeriodEnd: periodEnd,
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Payment webhook error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Webhook processing failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
