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
  waffoProductId?: string;
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
    waffoProductId: 'PROD_7N7SuPcO0cQJqfhYwSOgxH',
  },
  micro_pack: {
    id: 'micro_pack',
    name: 'HackerTube On-Demand Derivation Pack',
    description: '10 on-demand AI math & code derivations for any YouTube talk ($0.10/lecture)',
    amount: 100, // $1.00
    currency: 'USD',
    type: 'one_time',
    credits: 10,
    waffoProductId: 'PROD_71r71wO1C7mecLBoewx7Cm',
  },
};

export const DEFAULT_WAFFO_CONFIG = {
  merchantId: 'MER_6rnE47Namr6Wg54cKSFZsr',
  storeId: 'STO_7foQ1NsoiAwJ9b9GJpayR7',
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQClob5O83A9YRwA
AlRk7ExBu3Scic1slMlvPXtgjKOGQQaR5Rb48fB0gL6Xg2Tq2CMkGv7Ww9VXTMpe
aUvSuzJZxpEdxd52hIyL5tqPT8CbnxukJho79BSp61Ll2U9v4QS1kAVFgc0r5eWJ
r0gQ8X8Peo9vhbSRXj3dIuJHUA7t5EysSppaQKp+EFWUTV1z5oJWhR6EoQIgsON0
njB7rnuKbPX3isNRRRHW8RN1E9nTmoolEin+xb039yeT99jbid6lrbiSr0onjloG
fJQqLtFYwNrcfoB+M/aG5as4/39JXisX6Xn0JVOAnKT+jPHK+jnAEatF1/3va+2v
VUDhKHlLAgMBAAECggEAF7mc5Hs7YxdjZt7ujsxIOgwrbnbQvZJsbio8334VuFfd
JI3PphYlztJYOqTAEmGmWvgg88t2ZjxiKnbjvQpCcpieVcjvjkN7TFjjiq6uVLxM
Pc2VaWwTf6ltJO5lUg3F2moIT0YCCR0zrW61oHOvMxznqd5ZmI8Kxn/GMNfXY5za
inbAB9RkuLfU4T+8Ux5RYumtzFpe4vBMtaDJTR2iMGoFEBlALreZtgW+ka3B4j/1
NiEWpEoMp7Gj5dWiLI6dEyCKzjg0VxOBKgkZqVNQ8+4tM17rtBWJDw23FVuyUhcg
5+zbp8Jrpwa9yho5Bkl6cbHhkxv5WrS2oES42o/2WQKBgQDY5H/7rw3A9EEgKvE1
VxZbqPRtTqFNa6fJEt9u0LuMugMf5POTiFDIr8mQd4kDJrmMGNyf/6IXaETnbDmJ
Kx6RDLyS+37XyhMvL+woy2r3VY/rEtSzBqTzbaKOVOYLQbGW/dsqtXi/HXQCmXlU
fgIRdwrgTU5RJmHrGKPDGl5rUwKBgQDDfxuxz3F0jy4iR3yzqJ/CggNDPhfxUhSG
eDrIptG8kTjw8bwk1jonfAHSVeAm6wFEkPrmhzMAnWNeZhGfMMXLyMHcqaMoXAo/
gghZTj1mwuzW0guseEZYsp91w1AZGlsN1cAOIj4mo7JhtsO1gLb2Hec/VWDTNEqX
PVUqE4FzKQKBgHyzY6IhE5dM1+TWy7gPShuJGH+AJd2Nd/pzj2L3P925VPKRgDni
tg+sggc9stjM+wFBihezsk4i9PrZjnr+/6QF3qXjUxpeZIlM1ErgKa/q0cQmH4SO
3WfYMQ4EYf821hQqAEid7b50AK897jRV/npsJySvTcf6eXHhyMXz8zVhAoGBAJm3
eUQ/s5sN9h14DmKJpUzgw8X8rgDPJFpzcO1S1jmqCpbRzLk+RS3EwP3tDjorsKyE
PvRCvGSwXHDeWt7MD8rjiSODs0nJzTkQepYWAguqG2XydMFhNRcLJH0JXRLP+WaQ
etniLPJe5qUUeyBdG/+7lZfj/yUyya/PxwY1niS5AoGBANSRQ7QwySTggi4aZZCJ
rYo0QqvkWDbeTnGyPDPpY4+un8Onjzx5jzcYO/x0XatgGHKcURzPNHppOm8NoRP3
SivUJMqZ586JGUFeDW6RN75hFr8uqXDtjk8+ClvN0FZIXsAv5NkvUq3Y4sMukYVA
vKBv2o4iR18wNKk/ls2blStx
-----END RSA PRIVATE KEY-----`,
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
  const waffoApiKey =
    dbSettings.get('WAFFO_API_KEY') || process.env.WAFFO_API_KEY || DEFAULT_WAFFO_CONFIG.merchantId;
  const waffoSecretKey =
    dbSettings.get('WAFFO_SECRET_KEY') || process.env.WAFFO_SECRET_KEY || DEFAULT_WAFFO_CONFIG.privateKey;
  const waffoStoreId =
    dbSettings.get('WAFFO_STORE_ID') || process.env.WAFFO_STORE_ID || DEFAULT_WAFFO_CONFIG.storeId;
  const waffoMode = dbSettings.get('WAFFO_MODE') || process.env.WAFFO_MODE || 'live';

  const activeProvider =
    dbSettings.get('ACTIVE_PAYMENT_PROVIDER') ||
    (waffoApiKey ? 'waffo' : stripeSecretKey ? 'stripe' : paypalClientId ? 'paypal' : 'waffo');

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
  const merchantId = params.apiKey || DEFAULT_WAFFO_CONFIG.merchantId;
  const privateKey = params.secretKey || DEFAULT_WAFFO_CONFIG.privateKey;
  const productId =
    params.plan.waffoProductId ||
    (params.plan.id === 'pro_monthly' ? 'PROD_7N7SuPcO0cQJqfhYwSOgxH' : 'PROD_71r71wO1C7mecLBoewx7Cm');

  // Try official Waffo Pancake SDK
  if (merchantId && privateKey) {
    try {
      const { WaffoPancake } = await import('@waffo/pancake-ts');
      const client = new WaffoPancake({
        merchantId,
        privateKey,
      });

      const session = await client.checkout.authenticated.create({
        productId,
        currency: (params.plan.currency || 'USD') as 'USD',
        buyerIdentity: params.userEmail,
        buyerEmail: params.userEmail,
      });

      if (session?.checkoutUrl) {
        return session.checkoutUrl;
      }
    } catch (err: unknown) {
      console.warn('Waffo Pancake SDK create session notice:', err);
    }
  }

  // Hosted checkout fallback URL (pre-filled with user context)
  return `https://checkout.waffo.com/pay/${productId}?merchantOrderId=${params.orderNo}&email=${encodeURIComponent(params.userEmail)}&userId=${encodeURIComponent(params.userId)}`;
}

export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}
