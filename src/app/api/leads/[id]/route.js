import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { logAudit, LEAD_STATUSES } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const db = getDb();
  const lead = db.prepare(`SELECT * FROM leads WHERE id = ?`).get(id);
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const updates = [];
  const args = [];
  if (body.status !== undefined) {
    if (!LEAD_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    updates.push('status = ?'); args.push(body.status);
  }
  if (body.assigned_agent_id !== undefined) {
    const v = body.assigned_agent_id == null ? null : parseInt(body.assigned_agent_id, 10);
    updates.push('assigned_agent_id = ?'); args.push(Number.isFinite(v) ? v : null);
  }
  if (body.notes !== undefined) {
    updates.push('notes = ?'); args.push(String(body.notes).slice(0, 8000));
  }
  updates.push("updated_at = strftime('%s','now')");

  args.push(id);
  db.prepare(`UPDATE leads SET ${updates.join(', ')} WHERE id = ?`).run(...args);

  logAudit({
    action: 'lead_update',
    resourceType: 'lead',
    resourceId: id,
    details: body,
  });

  const updated = db.prepare(`SELECT * FROM leads WHERE id = ?`).get(id);
  return NextResponse.json({ ok: true, lead: updated });
}
