import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const ip = clientIp(request);
  const limit = rateLimit(`subscribe:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (body && typeof body.company === 'string' && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const email = (body.email || '').toString().trim().toLowerCase();
  const source = (body.source || 'newsletter').toString().slice(0, 60);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }

  const db = getDb();
  try {
    db.prepare(`INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, ?)`).run(email, source);
  } catch (err) {
    console.error('[subscribe:post]', err);
    return NextResponse.json({ error: 'Could not save your subscription. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'You are subscribed. Watch your inbox for our next market report.' });
}
