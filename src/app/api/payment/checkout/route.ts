import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { db, schema } from '@/core/db';
import { PLANS, createPayPalCheckoutOrder, createWaffoCheckoutOrder, getPaymentGatewayConfig, getStripeClientAsync } from '@/core/payment';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please sign in to upgrade' }, { status: 401 });
    }

    const gatewayConfig = await getPaymentGatewayConfig();
    const { planId = 'pro_monthly', provider = gatewayConfig.activeProvider || 'stripe' } = await req.json();
    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const orderNo = `HT-${Date.now()}-${nanoid(6).toUpperCase()}`;
    const orderId = nanoid();

    // Record created order in DB
    await db.insert(schema.order).values({
      id: orderId,
      orderNo,
      userId: session.user.id,
      userEmail: session.user.email,
      status: 'created',
      amount: plan.amount,
      currency: plan.currency,
      productId: plan.id,
      productName: plan.name,
      paymentType: plan.type,
      paymentProvider: provider,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.hacker-tube.net';
    const stripe = await getStripeClientAsync();

    if (provider === 'stripe' && stripe) {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer_email: session.user.email,
        line_items: [
          {
            price_data: {
              currency: plan.currency.toLowerCase(),
              product_data: {
                name: plan.name,
                description: plan.description,
              },
              unit_amount: plan.amount,
              ...(plan.type === 'subscription' ? { recurring: { interval: plan.interval || 'month' } } : {}),
            },
            quantity: 1,
          },
        ],
        mode: plan.type === 'subscription' ? 'subscription' : 'payment',
        success_url: `${appUrl}/?payment=success&order_no=${orderNo}`,
        cancel_url: `${appUrl}/?payment=cancelled`,
        metadata: {
          orderNo,
          userId: session.user.id,
          planId: plan.id,
        },
      });

      return NextResponse.json({
        success: true,
        orderNo,
        checkoutUrl: checkoutSession.url,
      });
    }

    // PayPal Checkout Integration
    if (provider === 'paypal' && gatewayConfig.paypalClientId && gatewayConfig.paypalClientSecret) {
      const approvalUrl = await createPayPalCheckoutOrder({
        plan,
        orderNo,
        appUrl,
        clientId: gatewayConfig.paypalClientId,
        clientSecret: gatewayConfig.paypalClientSecret,
        mode: gatewayConfig.paypalMode || 'live',
      });

      if (approvalUrl) {
        return NextResponse.json({
          success: true,
          orderNo,
          checkoutUrl: approvalUrl,
        });
      }
    }

    // Waffo Checkout Integration
    if (provider === 'waffo' && (gatewayConfig.waffoApiKey || gatewayConfig.waffoStoreId)) {
      const checkoutUrl = await createWaffoCheckoutOrder({
        plan,
        orderNo,
        userEmail: session.user.email,
        userId: session.user.id,
        appUrl,
        apiKey: gatewayConfig.waffoApiKey,
        secretKey: gatewayConfig.waffoSecretKey,
        storeId: gatewayConfig.waffoStoreId,
        mode: gatewayConfig.waffoMode || 'live',
      });

      if (checkoutUrl) {
        return NextResponse.json({
          success: true,
          orderNo,
          checkoutUrl,
        });
      }
    }

    // Creem Checkout (MoR) fallback or sandbox checkout URL
    if (provider === 'creem' && (gatewayConfig.creemApiKey || process.env.CREEM_API_KEY)) {
      // If Creem SDK / endpoint configured
      const creemCheckoutUrl = `https://checkout.creem.io/pay/${plan.id}?order_no=${orderNo}&email=${encodeURIComponent(session.user.email)}`;
      return NextResponse.json({
        success: true,
        orderNo,
        checkoutUrl: creemCheckoutUrl,
      });
    }

    // Sandbox / Mock fallback when keys are not yet configured in production
    return NextResponse.json({
      success: true,
      orderNo,
      checkoutUrl: `${appUrl}/?payment=sandbox_demo&order_no=${orderNo}&amount=${plan.amount / 100}`,
      notice: 'Sandbox simulation mode: Live payment keys not set.',
    });
  } catch (err: unknown) {
    console.error('Checkout error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Failed to initiate checkout';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
