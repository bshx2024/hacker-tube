import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { db, schema } from '@/core/db';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [dbUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, session.user.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [sub] = await db
      .select()
      .from(schema.subscription)
      .where(eq(schema.subscription.userId, session.user.id))
      .limit(1);

    const bookmarks = await db
      .select()
      .from(schema.bookmark)
      .where(eq(schema.bookmark.userId, session.user.id));

    return NextResponse.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        role: dbUser.role,
        plan: dbUser.plan,
        credits: dbUser.credits,
        createdAt: dbUser.createdAt,
      },
      subscription: sub || null,
      bookmarks: bookmarks.map((b) => b.videoId),
    });
  } catch (err: unknown) {
    console.error('Failed to get user profile:', err);
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
