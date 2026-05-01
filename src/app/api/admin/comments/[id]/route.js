import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const approved = body.approved ? 1 : 0;
  try {
    const db = getDb();
    const r = db.prepare(`UPDATE customer_comments SET approved = ? WHERE id = ?`).run(approved, id);
    if (r.changes === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin-comments:patch]', err);
    return NextResponse.json({ error: 'Could not update comment.' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const db = getDb();
    const r = db.prepare(`DELETE FROM customer_comments WHERE id = ?`).run(id);
    if (r.changes === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin-comments:delete]', err);
    return NextResponse.json({ error: 'Could not delete comment.' }, { status: 500 });
  }
}
