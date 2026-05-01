import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('ids') || '';
  const ids = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
  if (ids.length === 0) return NextResponse.json({ properties: [] });

  const placeholders = ids.map(() => '?').join(',');
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM properties WHERE id IN (${placeholders})`).all(...ids);

  const order = new Map(ids.map((id, i) => [id, i]));
  rows.sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));

  return NextResponse.json({ properties: rows });
}
