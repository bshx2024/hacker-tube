import Stripe from 'stripe';
import { db, schema } from '../db';

export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  amount: number; // in cents, e.g. 400 = $4.00
  currency: string;
  type: 'subscription' | 'one_time';
  interval?: 'month' | 'year';
  credits?: number;
}

export const PLANS: Record<string, PlanConfig> = {
  pro_monthly: {
    id: 'pro_monthly',
    name: 'HackerTube Pro (Monthly Coffee Plan)',
    description: 'Unlimited AI lecture notes & LaTeX derivations, Obsidian Sync, ad-free stream',
    amount: 400, // $4.00
    currency: 'USD',
    type: 'subscription',
    interval: 'month',
    credits: 99999,
  },
  micro_pack: {
    id: 'micro_pack',
    name: 'HackerTube On-Demand Derivation Pack',
    description: '10 on-demand AI math & code derivations for any YouTube talk ($0.10/lecture)',
    amount: 100, // $1.00
    currency: 'USD',
    type: 'one_time',
    credits: 10,
  },
};

export async function getPaymentGatewayConfig() {
  let dbSettings = new Map<string, string>();
  try {
    const rows = await db.select().from(schema.systemSetting);
    dbSettings = new Map(rows.map((r) => [r.key, r.value]));
  } catch {}

  const stripeSecretKey = dbSettings.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY || '';
  const stripeWebhookSecret = dbSettings.get('STRIPE_WEBHOOK_SECRET') || process.env.STRIPE_WEBHOOK_SECRET || '';
  const creemApiKey = dbSettings.get('CREEM_API_KEY') || process.env.CREEM_API_KEY || '';
  const creemWebhookSecret = dbSettings.get('CREEM_WEBHOOK_SECRET') || process.env.CREEM_WEBHOOK_SECRET || '';
  const paypalClientId = dbSettings.get('PAYPAL_CLIENT_ID') || process.env.PAYPAL_CLIENT_ID || '';
  const paypalClientSecret = dbSettings.get('PAYPAL_CLIENT_SECRET') || process.env.PAYPAL_CLIENT_SECRET || '';
  const paypalMode = dbSettings.get('PAYPAL_MODE') || process.env.PAYPAL_MODE || 'live';
  const waffoApiKey = dbSettings.get('WAFFO_API_KEY') || process.env.WAFFO_API_KEY || '';
  const waffoSecretKey = dbSettings.get('WAFFO_SECRET_KEY') || process.env.WAFFO_SECRET_KEY || '';
  const waffoStoreId = dbSettings.get('WAFFO_STORE_ID') || process.env.WAFFO_STORE_ID || '';
  const waffoMode = dbSettings.get('WAFFO_MODE') || process.env.WAFFO_MODE || 'live';

  const activeProvider =
    dbSettings.get('ACTIVE_PAYMENT_PROVIDER') ||
    (stripeSecretKey ? 'stripe' : paypalClientId ? 'paypal' : waffoApiKey ? 'waffo' : creemApiKey ? 'creem' : 'stripe');

  return {
    stripeSecretKey,
    stripeWebhookSecret,
    creemApiKey,
    creemWebhookSecret,
    paypalClientId,
    paypalClientSecret,
    paypalMode,
    waffoApiKey,
    waffoSecretKey,
    waffoStoreId,
    waffoMode,
    activeProvider,
  };
}

export async function createPayPalCheckoutOrder(params: {
  plan: PlanConfig;
  orderNo: string;
  appUrl: string;
  clientId: string;
  clientSecret: string;
  mode: string;
}): Promise<string | null> {
  const isLive = params.mode === 'live';
  const baseUrl = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  const authHeader = Buffer.from(`${params.clientId}:${params.clientSecret}`).toString('base64');
  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`PayPal Auth Error: ${err}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.orderNo,
          description: params.plan.name,
          amount: {
            currency_code: params.plan.currency || 'USD',
            value: (params.plan.amount / 100).toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'HackerTube',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${params.appUrl}/api/payment/paypal/capture?orderNo=${params.orderNo}`,
        cancel_url: `${params.appUrl}/?payment=cancelled`,
      },
    }),
  });

  if (!orderRes.ok) {
    const err = await orderRes.text();
    throw new Error(`PayPal Create Order Error: ${err}`);
  }

  const orderData = await orderRes.json();
  const links = orderData.links as { rel: string; href: string }[] | undefined;
  const approveLink = links?.find((l) => l.rel === 'approve')?.href;

  return approveLink || null;
}

export async function capturePayPalPayment(params: {
  paypalOrderId: string;
  clientId: string;
  clientSecret: string;
  mode: string;
}): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  const isLive = params.mode === 'live';
  const baseUrl = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  const authHeader = Buffer.from(`${params.clientId}:${params.clientSecret}`).toString('base64');
  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenRes.ok) {
    return { success: false, error: 'Failed to authenticate with PayPal' };
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${params.paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const captureData = await captureRes.json();
  if (captureData.status === 'COMPLETED') {
    const purchaseUnit = captureData.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const transactionId = capture?.id || captureData.id;
    return { success: true, transactionId };
  }

  return { success: false, error: captureData.message || 'Payment not completed' };
}

export async function getStripeClientAsync(): Promise<Stripe | null> {
  const config = await getPaymentGatewayConfig();
  if (!config.stripeSecretKey) return null;
  return new Stripe(config.stripeSecretKey);
}

export async function createWaffoCheckoutOrder(params: {
  plan: PlanConfig;
  orderNo: string;
  userEmail: string;
  userId: string;
  appUrl: string;
  apiKey: string;
  secretKey?: string;
  storeId?: string;
  mode?: string;
}): Promise<string | null> {
  const isLive = params.mode !== 'sandbox';
  const baseUrl = isLive ? 'https://api.waffo.com' : 'https://api-sandbox.waffo.com';

  const bodyData = {
    paymentRequestId: params.orderNo,
    merchantOrderId: params.orderNo,
    orderAmount: (params.plan.amount / 100).toFixed(2),
    orderCurrency: params.plan.currency || 'USD',
    orderDescription: params.plan.name,
    notifyUrl: `${params.appUrl}/api/payment/notify`,
    successRedirectUrl: `${params.appUrl}/?payment=success&order_no=${params.orderNo}&provider=waffo`,
    failedRedirectUrl: `${params.appUrl}/?payment=cancelled`,
    userInfo: {
      userId: params.userId,
      userEmail: params.userEmail,
      userTerminal: 'WEB',
    },
    paymentInfo: {
      productName: params.plan.type === 'subscription' ? 'SUBSCRIPTION' : 'ONE_TIME_PAYMENT',
    },
    goodsInfo: {
      goodsName: params.plan.name,
      goodsUrl: `${params.appUrl}/pricing`,
    },
  };

  const rawBody = JSON.stringify(bodyData);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-KEY': params.apiKey,
    'X-API-VERSION': '1.0.0',
  };

  if (params.storeId) {
    headers['X-Merchant-Id'] = params.storeId;
  }

  // Handle optional RSA or HMAC signature if secretKey provided
  if (params.secretKey) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    headers['X-Timestamp'] = timestamp;

    try {
      const crypto = await import('crypto');
      if (params.secretKey.includes('PRIVATE KEY')) {
        const bodyHash = crypto.createHash('sha256').update(rawBody).digest('base64');
        const canonical = `POST /api/v1/order/create ${timestamp} ${bodyHash}`;
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(canonical);
        headers['X-Signature'] = sign.sign(params.secretKey, 'base64');
      } else {
        headers['X-Signature'] = crypto.createHmac('sha256', params.secretKey).update(rawBody).digest('hex');
      }
    } catch (e) {
      console.warn('Waffo signature creation warning:', e);
    }
  }

  try {
    const res = await fetch(`${baseUrl}/api/v1/order/create`, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    if (res.ok) {
      const resData = await res.json();
      if (resData.data?.orderAction) {
        try {
          const action =
            typeof resData.data.orderAction === 'string'
              ? JSON.parse(resData.data.orderAction)
              : resData.data.orderAction;
          if (action.webUrl) return action.webUrl;
          if (action.deeplinkUrl) return action.deeplinkUrl;
        } catch {
          if (typeof resData.data.orderAction === 'string' && resData.data.orderAction.startsWith('http')) {
            return resData.data.orderAction;
          }
        }
      }
      if (resData.data?.webUrl) return resData.data.webUrl;
      if (resData.data?.checkoutUrl) return resData.data.checkoutUrl;
    } else {
      const errText = await res.text();
      console.warn('Waffo API order create returned status:', res.status, errText);
    }
  } catch (err) {
    console.warn('Waffo API request failed:', err);
  }

  // Hosted checkout fallback
  return `https://checkout.waffo.com/pay/${params.plan.id}?merchantOrderId=${params.orderNo}&amount=${(params.plan.amount / 100).toFixed(2)}&currency=${params.plan.currency}&email=${encodeURIComponent(params.userEmail)}`;
}

export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}
