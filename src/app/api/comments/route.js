import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT id, name, location, rating, message, created_at
      FROM customer_comments
      WHERE approved = 1
      ORDER BY created_at DESC
      LIMIT 50
    `).all();
    return NextResponse.json({ comments: rows });
  } catch (err) {
    console.error('[comments:get]', err);
    return NextResponse.json({ error: 'Could not load comments.' }, { status: 500 });
  }
}

export async function POST(req) {
  const ip = clientIp(req);
  const limit = rateLimit(`comments:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (body && typeof body.company === 'string' && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true, comment: null });
  }

  const name = (body.name || '').toString().trim().slice(0, 80);
  const location = (body.location || '').toString().trim().slice(0, 80);
  const message = (body.message || '').toString().trim().slice(0, 1500);
  const ratingRaw = parseInt(body.rating, 10);
  const rating = Number.isFinite(ratingRaw) ? Math.min(5, Math.max(1, ratingRaw)) : 5;

  if (!name || !message) {
    return NextResponse.json({ error: 'Name and comment are required.' }, { status: 400 });
  }
  if (message.length < 4) {
    return NextResponse.json({ error: 'Please write a bit more in your comment.' }, { status: 400 });
  }

  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO customer_comments (name, location, rating, message, approved)
      VALUES (?, ?, ?, ?, 0)
    `).run(name, location || null, rating, message);

    return NextResponse.json({
      ok: true,
      message: 'Thanks. Your comment was received and will appear here once reviewed.',
    });
  } catch (err) {
    console.error('[comments:post]', err);
    return NextResponse.json({ error: 'Could not save your comment.' }, { status: 500 });
  }
}
