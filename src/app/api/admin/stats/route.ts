import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/core/auth';
import { db, schema } from '@/core/db';
import { desc, eq } from 'drizzle-orm';
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
    const { targetUserId, action, value } = body;

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
    }

    return NextResponse.json({ success: true, targetUserId, action, value });
  } catch (err: unknown) {
    console.error('Admin action error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

