import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, name, location, rating, message, created_at
    FROM customer_comments
    ORDER BY created_at DESC
    LIMIT 50
  `).all();
  return NextResponse.json({ comments: rows });
}

export async function POST(req) {
  try {
    const body = await req.json();
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

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO customer_comments (name, location, rating, message)
      VALUES (?, ?, ?, ?)
    `).run(name, location || null, rating, message);

    const created = db.prepare(`
      SELECT id, name, location, rating, message, created_at
      FROM customer_comments WHERE id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({ ok: true, comment: created });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
