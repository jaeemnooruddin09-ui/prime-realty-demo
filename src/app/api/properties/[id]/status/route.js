import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!['available', 'sold', 'rented', 'draft'].includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const id = parseInt(params.id);
  const db = getDb();
  db.prepare('UPDATE properties SET status = ? WHERE id = ?').run(body.status, id);
  logAudit({ action: 'property_status', resourceType: 'property', resourceId: id, details: { status: body.status } });
  return NextResponse.json({ ok: true });
}
