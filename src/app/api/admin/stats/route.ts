import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/core/auth';
import { db, schema } from '@/core/db';
import { desc, eq, like } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const incomingHeaders = await headers();
    const session = await auth.api.getSession({ headers: incomingHeaders });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    // Check admin role or environment override
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isEnvAdmin = session.user.email && adminEmails.includes(session.user.email.toLowerCase());

    const [currentUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, session.user.id))
      .limit(1);

    const isDbAdmin = currentUser?.role === 'admin';

    if (!isDbAdmin && !isEnvAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required', userRole: currentUser?.role || 'user' },
        { status: 403 }
      );
    }

    // If user is env admin but not yet marked in DB, auto-promote
    if (isEnvAdmin && currentUser && currentUser.role !== 'admin') {
      await db
        .update(schema.user)
        .set({ role: 'admin', plan: 'pro', updatedAt: new Date() })
        .where(eq(schema.user.id, currentUser.id));
    }

    // Clean up temporary ping test accounts
    try {
      await db.delete(schema.user).where(like(schema.user.email, '%@hackertube-test.internal%'));
    } catch {}

    // 1. Fetch Users
    const users = await db
      .select()
      .from(schema.user)
      .orderBy(desc(schema.user.createdAt))
      .limit(50);

    // 2. Fetch Orders
    const orders = await db
      .select()
      .from(schema.order)
      .orderBy(desc(schema.order.createdAt))
      .limit(50);

    // 3. Fetch Subscriptions
    const subscriptions = await db
      .select()
      .from(schema.subscription)
      .orderBy(desc(schema.subscription.updatedAt))
      .limit(50);

    // 4. Calculate Revenue
    const paidOrders = orders.filter((o) => o.status === 'paid');
    const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.amount, 0);

    // 5. Read Survey Responses
    const surveyFile = path.join(process.cwd(), 'reports', 'survey_responses.jsonl');
    const surveys: Record<string, unknown>[] = [];
    if (fs.existsSync(surveyFile)) {
      try {
        const lines = fs.readFileSync(surveyFile, 'utf-8').split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          surveys.push(JSON.parse(line));
        }
      } catch {}
    }

    // 6. Read Gateway Settings from DB or env
    let gatewaySettings: { key: string; value: string }[] = [];
    try {
      gatewaySettings = await db.select().from(schema.systemSetting);
    } catch {}
    const settingsMap = new Map(gatewaySettings.map((s) => [s.key, s.value]));
    const stripeKey = settingsMap.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY || '';
    const stripeWebhookSecret = settingsMap.get('STRIPE_WEBHOOK_SECRET') || process.env.STRIPE_WEBHOOK_SECRET || '';
    const creemKey = settingsMap.get('CREEM_API_KEY') || process.env.CREEM_API_KEY || '';
    const paypalClientId = settingsMap.get('PAYPAL_CLIENT_ID') || process.env.PAYPAL_CLIENT_ID || '';
    const paypalClientSecret = settingsMap.get('PAYPAL_CLIENT_SECRET') || process.env.PAYPAL_CLIENT_SECRET || '';
    const paypalMode = settingsMap.get('PAYPAL_MODE') || process.env.PAYPAL_MODE || 'live';
    const waffoApiKey = settingsMap.get('WAFFO_API_KEY') || process.env.WAFFO_API_KEY || 'MER_6rnE47Namr6Wg54cKSFZsr';
    const waffoSecretKey = settingsMap.get('WAFFO_SECRET_KEY') || process.env.WAFFO_SECRET_KEY || '';
    const waffoStoreId = settingsMap.get('WAFFO_STORE_ID') || process.env.WAFFO_STORE_ID || 'STO_7foQ1NsoiAwJ9b9GJpayR7';
    const waffoMode = settingsMap.get('WAFFO_MODE') || process.env.WAFFO_MODE || 'live';
    const activeProvider =
      settingsMap.get('ACTIVE_PAYMENT_PROVIDER') ||
      (waffoApiKey ? 'waffo' : stripeKey ? 'stripe' : paypalClientId ? 'paypal' : 'waffo');

    const paymentConfig = {
      activeProvider,
      isStripeConfigured: !!stripeKey,
      stripeKeyMasked: stripeKey ? `${stripeKey.slice(0, 7)}••••••••${stripeKey.slice(-4)}` : '',
      isStripeWebhookConfigured: !!stripeWebhookSecret,
      stripeWebhookMasked: stripeWebhookSecret ? `${stripeWebhookSecret.slice(0, 8)}••••••••${stripeWebhookSecret.slice(-4)}` : '',
      isPayPalConfigured: !!paypalClientId && !!paypalClientSecret,
      paypalClientIdMasked: paypalClientId ? `${paypalClientId.slice(0, 6)}••••••••${paypalClientId.slice(-4)}` : '',
      paypalMode,
      isWaffoConfigured: !!(waffoApiKey || waffoStoreId),
      waffoApiKeyMasked: waffoApiKey ? `${waffoApiKey.slice(0, 6)}••••••••${waffoApiKey.slice(-4)}` : '',
      waffoStoreIdMasked: waffoStoreId ? `${waffoStoreId.slice(0, 4)}••••${waffoStoreId.slice(-4)}` : '',
      waffoMode,
      isCreemConfigured: !!creemKey,
      creemKeyMasked: creemKey ? `${creemKey.slice(0, 6)}••••••••${creemKey.slice(-4)}` : '',
      webhookUrl: 'https://www.hacker-tube.net/api/payment/notify',
    };

    return NextResponse.json({
      authorized: true,
      currentUser: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: 'admin',
      },
      stats: {
        totalUsers: users.length,
        proSubscribers: subscriptions.filter((s) => s.status === 'active').length,
        totalOrders: orders.length,
        totalRevenue: (totalRevenueCents / 100).toFixed(2),
        totalSurveys: surveys.length,
      },
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        plan: u.plan,
        credits: u.credits,
        createdAt: u.createdAt,
      })),
      orders,
      subscriptions,
      surveys,
      paymentConfig,
    });
  } catch (err: unknown) {
    console.error('Admin stats error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// POST endpoint to update a user's role or plan from the admin dashboard
export async function POST(req: NextRequest) {
  try {
    const incomingHeaders = await headers();
    const session = await auth.api.getSession({ headers: incomingHeaders });
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [adminUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, session.user.id))
      .limit(1);

    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // Handle Saving Payment Gateway Settings
    if (action === 'save_gateway_settings') {
      const {
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
      } = body;

      const upsertSetting = async (key: string, val?: string) => {
        if (val === undefined) return;
        const trimmed = val.trim();
        const [existing] = await db
          .select()
          .from(schema.systemSetting)
          .where(eq(schema.systemSetting.key, key))
          .limit(1);

        if (existing) {
          await db
            .update(schema.systemSetting)
            .set({ value: trimmed, updatedAt: new Date() })
            .where(eq(schema.systemSetting.key, key));
        } else {
          await db
            .insert(schema.systemSetting)
            .values({ key, value: trimmed, updatedAt: new Date() });
        }
      };

      if (stripeSecretKey !== undefined) await upsertSetting('STRIPE_SECRET_KEY', stripeSecretKey);
      if (stripeWebhookSecret !== undefined) await upsertSetting('STRIPE_WEBHOOK_SECRET', stripeWebhookSecret);
      if (creemApiKey !== undefined) await upsertSetting('CREEM_API_KEY', creemApiKey);
      if (creemWebhookSecret !== undefined) await upsertSetting('CREEM_WEBHOOK_SECRET', creemWebhookSecret);
      if (paypalClientId !== undefined) await upsertSetting('PAYPAL_CLIENT_ID', paypalClientId);
      if (paypalClientSecret !== undefined) await upsertSetting('PAYPAL_CLIENT_SECRET', paypalClientSecret);
      if (paypalMode !== undefined) await upsertSetting('PAYPAL_MODE', paypalMode);
      if (waffoApiKey !== undefined) await upsertSetting('WAFFO_API_KEY', waffoApiKey);
      if (waffoSecretKey !== undefined) await upsertSetting('WAFFO_SECRET_KEY', waffoSecretKey);
      if (waffoStoreId !== undefined) await upsertSetting('WAFFO_STORE_ID', waffoStoreId);
      if (waffoMode !== undefined) await upsertSetting('WAFFO_MODE', waffoMode);
      if (activeProvider !== undefined) await upsertSetting('ACTIVE_PAYMENT_PROVIDER', activeProvider);

      return NextResponse.json({ success: true, message: 'Payment gateway configuration saved successfully!' });
    }

    const { targetUserId, value } = body;

    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'targetUserId and action are required' }, { status: 400 });
    }

    if (action === 'set_plan') {
      await db
        .update(schema.user)
        .set({
          plan: value === 'pro' ? 'pro' : 'free',
          credits: value === 'pro' ? 999999 : 5,
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, targetUserId));
    } else if (action === 'set_role') {
      await db
        .update(schema.user)
        .set({
          role: value === 'admin' ? 'admin' : 'user',
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, targetUserId));
    } else if (action === 'delete_user') {
      if (targetUserId === session.user.id) {
        return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 });
      }

      await db.delete(schema.session).where(eq(schema.session.userId, targetUserId));
      await db.delete(schema.account).where(eq(schema.account.userId, targetUserId));
      await db.delete(schema.bookmark).where(eq(schema.bookmark.userId, targetUserId));
      await db.delete(schema.user).where(eq(schema.user.id, targetUserId));
    }

    return NextResponse.json({ success: true, targetUserId, action, value });
  } catch (err: unknown) {
    console.error('Admin action error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

