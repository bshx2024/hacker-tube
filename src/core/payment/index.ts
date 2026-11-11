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
  const activeProvider = dbSettings.get('ACTIVE_PAYMENT_PROVIDER') || (stripeSecretKey ? 'stripe' : creemApiKey ? 'creem' : 'stripe');

  return {
    stripeSecretKey,
    stripeWebhookSecret,
    creemApiKey,
    creemWebhookSecret,
    activeProvider,
  };
}

export async function getStripeClientAsync(): Promise<Stripe | null> {
  const config = await getPaymentGatewayConfig();
  if (!config.stripeSecretKey) return null;
  return new Stripe(config.stripeSecretKey);
}

export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}
