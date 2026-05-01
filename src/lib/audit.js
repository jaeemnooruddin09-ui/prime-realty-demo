import 'server-only';
import { getDb } from './db';

export { LEAD_STATUSES, leadStatusColor } from './lead-status';

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
