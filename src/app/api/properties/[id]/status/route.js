import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function POST(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!['available', 'sold', 'rented'].includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const db = getDb();
  db.prepare('UPDATE properties SET status = ? WHERE id = ?').run(body.status, parseInt(params.id));
  return NextResponse.json({ ok: true });
}
