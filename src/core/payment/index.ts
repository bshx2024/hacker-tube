import Stripe from 'stripe';

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

export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}
