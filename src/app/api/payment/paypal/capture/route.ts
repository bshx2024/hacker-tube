import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/core/db';
import { capturePayPalPayment, getPaymentGatewayConfig } from '@/core/payment';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paypalToken = searchParams.get('token'); // PayPal Order ID
  const orderNo = searchParams.get('orderNo');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.hacker-tube.net';

  if (!paypalToken || !orderNo) {
    return NextResponse.redirect(`${appUrl}/?payment=error&reason=missing_paypal_params`);
  }

  try {
    const gatewayConfig = await getPaymentGatewayConfig();
    const result = await capturePayPalPayment({
      paypalOrderId: paypalToken,
      clientId: gatewayConfig.paypalClientId,
      clientSecret: gatewayConfig.paypalClientSecret,
      mode: gatewayConfig.paypalMode || 'live',
    });

    if (!result.success) {
      console.error('PayPal capture error:', result.error);
      return NextResponse.redirect(`${appUrl}/?payment=error&reason=capture_failed`);
    }

    // 1. Update Order
    const [existingOrder] = await db
      .select()
      .from(schema.order)
      .where(eq(schema.order.orderNo, orderNo))
      .limit(1);

    if (existingOrder) {
      await db
        .update(schema.order)
        .set({
          status: 'paid',
          transactionId: result.transactionId || paypalToken,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.order.orderNo, orderNo));

      // 2. Upgrade User to Pro
      await db
        .update(schema.user)
        .set({
          plan: 'pro',
          credits: 99999,
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, existingOrder.userId));

      // 3. Upsert Subscription
      const [existingSub] = await db
        .select()
        .from(schema.subscription)
        .where(eq(schema.subscription.userId, existingOrder.userId))
        .limit(1);

      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      if (existingSub) {
        await db
          .update(schema.subscription)
          .set({
            status: 'active',
            paymentProvider: 'paypal',
            subscriptionId: result.transactionId || paypalToken,
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
          })
          .where(eq(schema.subscription.userId, existingOrder.userId));
      } else {
        await db.insert(schema.subscription).values({
          id: `sub_${Date.now()}`,
          userId: existingOrder.userId,
          plan: 'pro',
          status: 'active',
          paymentProvider: 'paypal',
          subscriptionId: result.transactionId || paypalToken,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.redirect(`${appUrl}/?payment=success&order_no=${orderNo}&provider=paypal`);
  } catch (err: unknown) {
    console.error('PayPal capture route error:', err);
    return NextResponse.redirect(`${appUrl}/?payment=error&reason=server_error`);
  }
}

