import { getDb } from '@/lib/db';

export default function AuditLogPage({ searchParams = {} }) {
  const page = Math.max(1, parseInt(searchParams.page) || 1);
  const PER = 50;
  const offset = (page - 1) * PER;

  const db = getDb();
  const total = db.prepare(`SELECT COUNT(*) as c FROM audit_log`).get().c;
  const rows = db.prepare(`SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(PER, offset);
  const totalPages = Math.max(1, Math.ceil(total / PER));

  function fmtDetails(d) {
    if (!d) return '';
    try {
      const parsed = JSON.parse(d);
      return JSON.stringify(parsed, null, 0).slice(0, 240);
    } catch {
      return String(d).slice(0, 240);
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-navy-900">Audit log</h1>
      <p className="text-navy-500 mt-1">{total} {total === 1 ? 'entry' : 'entries'}. Newest first.</p>

      <div className="mt-6 bg-white border border-navy-100 rounded overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-navy-50 text-navy-700">
            <tr>
              <th className="text-left p-3">When</th>
              <th className="text-left p-3">Actor</th>
              <th className="text-left p-3">Action</th>
              <th className="text-left p-3">Resource</th>
              <th className="text-left p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {rows.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-navy-500">No entries yet.</td></tr>
            ) : null}
            {rows.map(r => (
              <tr key={r.id}>
                <td className="p-3 text-navy-700 whitespace-nowrap">{new Date(r.created_at * 1000).toLocaleString()}</td>
                <td className="p-3 text-navy-700 whitespace-nowrap">{r.actor}</td>
                <td className="p-3"><span className="text-xs font-semibold bg-navy-100 text-navy-700 rounded px-2 py-0.5">{r.action}</span></td>
                <td className="p-3 text-navy-700">{r.resource_type}{r.resource_id ? ` · #${r.resource_id}` : ''}</td>
                <td className="p-3 text-xs text-navy-600 font-mono break-words">{fmtDetails(r.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <a key={p} href={`/admin/audit-log?page=${p}`} className={`px-3 py-1.5 rounded ${p === page ? 'bg-navy-900 text-white' : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50'}`}>
                {p}
              </a>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
