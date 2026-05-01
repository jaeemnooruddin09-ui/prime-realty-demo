import { getDb } from './db';

export function logAudit({ actor = 'admin', action, resourceType, resourceId = null, details = null }) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO audit_log (actor, action, resource_type, resource_id, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      String(actor).slice(0, 120),
      String(action).slice(0, 60),
      String(resourceType).slice(0, 60),
      resourceId ? Number(resourceId) : null,
      details ? (typeof details === 'string' ? details : JSON.stringify(details)).slice(0, 4000) : null
    );
  } catch {
    /* swallow audit failures, do not break primary action */
  }
}

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'viewing', 'offer', 'won', 'lost'];

export function leadStatusColor(status) {
  return {
    new: 'bg-sky-100 text-sky-800',
    contacted: 'bg-indigo-100 text-indigo-800',
    qualified: 'bg-violet-100 text-violet-800',
    viewing: 'bg-amber-100 text-amber-800',
    offer: 'bg-orange-100 text-orange-800',
    won: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-rose-100 text-rose-800',
  }[status] || 'bg-navy-100 text-navy-700';
}
