import Link from 'next/link';
import { getDb } from '@/lib/db';
import { LEAD_STATUSES, leadStatusColor } from '@/lib/audit';
import LeadRow from '@/components/admin/LeadRow';

export default function AdminLeads({ searchParams = {} }) {
  const filterStatus = (searchParams.status || '').toString();
  const where = filterStatus && LEAD_STATUSES.includes(filterStatus) ? `WHERE l.status = ?` : '';
  const args = filterStatus && LEAD_STATUSES.includes(filterStatus) ? [filterStatus] : [];

  const db = getDb();

  const counts = db.prepare(`SELECT status, COUNT(*) as c FROM leads GROUP BY status`).all();
  const countByStatus = Object.fromEntries(counts.map(r => [r.status, r.c]));
  const totalCount = counts.reduce((acc, r) => acc + r.c, 0);

  const rows = db.prepare(`
    SELECT l.*, e.name, e.email, e.phone, e.message, e.created_at as enquiry_created_at,
           p.title as property_title, p.slug as property_slug,
           a.name as agent_name
    FROM leads l
    JOIN enquiries e ON e.id = l.enquiry_id
    LEFT JOIN properties p ON p.id = e.property_id
    LEFT JOIN agents a ON a.id = l.assigned_agent_id
    ${where}
    ORDER BY l.updated_at DESC, e.created_at DESC
  `).all(...args);

  const agents = db.prepare('SELECT id, name FROM agents ORDER BY name').all();

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy-900">Leads</h1>
          <p className="text-navy-500 mt-1">Pipeline of enquiries that came through the site.</p>
        </div>
        <Link href="/admin/audit-log" className="text-sm text-navy-600 hover:text-gold-500">View audit log &rarr;</Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/admin/leads" className={`px-3 py-1.5 rounded-full text-sm font-medium ${!filterStatus ? 'bg-navy-900 text-white' : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50'}`}>
          All <span className="ml-1 opacity-70">{totalCount}</span>
        </Link>
        {LEAD_STATUSES.map(s => (
          <Link key={s} href={`/admin/leads?status=${s}`} className={`px-3 py-1.5 rounded-full text-sm font-medium ${filterStatus === s ? 'bg-navy-900 text-white' : `${leadStatusColor(s)} hover:opacity-80`}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)} <span className="ml-1 opacity-70">{countByStatus[s] || 0}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {rows.length === 0 ? (
          <div className="bg-white border border-navy-100 rounded p-8 text-navy-500 text-center">No leads in this view.</div>
        ) : null}
        {rows.map(row => (
          <LeadRow key={row.id} lead={row} agents={agents} />
        ))}
      </div>
    </>
  );
}
