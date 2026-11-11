import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/auth';
import { db, schema } from '@/core/db';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await db
      .select()
      .from(schema.bookmark)
      .where(eq(schema.bookmark.userId, session.user.id));

    return NextResponse.json({ bookmarks: items.map((i) => i.videoId) });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userId = session.user.id;

    // Support batch sync from localStorage
    if (Array.isArray(body.videoIds)) {
      const existing = await db
        .select()
        .from(schema.bookmark)
        .where(eq(schema.bookmark.userId, userId));
      const existingIds = new Set(existing.map((e) => e.videoId));

      const toInsert = body.videoIds
        .filter((vid: string) => typeof vid === 'string' && vid.trim() && !existingIds.has(vid))
        .map((vid: string) => ({
          id: nanoid(),
          userId,
          videoId: vid.trim(),
        }));

      if (toInsert.length > 0) {
        await db.insert(schema.bookmark).values(toInsert);
      }

      const all = await db
        .select()
        .from(schema.bookmark)
        .where(eq(schema.bookmark.userId, userId));

      return NextResponse.json({
        success: true,
        syncedCount: toInsert.length,
        bookmarks: all.map((b) => b.videoId),
      });
    }

    // Single bookmark add
    const { videoId } = body;
    if (!videoId || typeof videoId !== 'string') {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(schema.bookmark)
      .where(and(eq(schema.bookmark.userId, userId), eq(schema.bookmark.videoId, videoId)))
      .limit(1);

    if (!existing) {
      await db.insert(schema.bookmark).values({
        id: nanoid(),
        userId,
        videoId,
      });
    }

    return NextResponse.json({ success: true, videoId });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');
    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    await db
      .delete(schema.bookmark)
      .where(and(eq(schema.bookmark.userId, session.user.id), eq(schema.bookmark.videoId, videoId)));

    return NextResponse.json({ success: true, videoId });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
