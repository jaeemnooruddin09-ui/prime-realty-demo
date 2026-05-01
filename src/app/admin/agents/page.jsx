import Link from 'next/link';
import { getDb } from '@/lib/db';

const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: 'compact' });

export default function AdminAgentsPage() {
  const db = getDb();
  const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 86400;
  const rows = db.prepare(`
    SELECT a.*,
      (SELECT COUNT(*) FROM properties WHERE agent_id = a.id AND status = 'available') as listings,
      (SELECT COALESCE(SUM(price), 0) FROM properties WHERE agent_id = a.id AND status = 'available') as portfolio_value,
      (SELECT COUNT(*) FROM properties WHERE agent_id = a.id AND status = 'sold') as sold_total,
      (SELECT COUNT(*) FROM properties WHERE agent_id = a.id AND status = 'sold' AND created_at >= ?) as sold_recent,
      (SELECT COUNT(*) FROM enquiries e LEFT JOIN properties p ON p.id = e.property_id WHERE p.agent_id = a.id) as enquiries_count,
      (SELECT COUNT(*) FROM leads l JOIN enquiries e ON e.id = l.enquiry_id LEFT JOIN properties p ON p.id = e.property_id WHERE p.agent_id = a.id AND l.status = 'won') as wins
    FROM agents a
    ORDER BY portfolio_value DESC
  `).all(ninetyDaysAgo);

  const totals = rows.reduce((acc, r) => ({
    listings: acc.listings + r.listings,
    value: acc.value + r.portfolio_value,
    enquiries: acc.enquiries + r.enquiries_count,
    sold_recent: acc.sold_recent + r.sold_recent,
  }), { listings: 0, value: 0, enquiries: 0, sold_recent: 0 });

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-navy-900">Agent performance</h1>
      <p className="text-navy-500 mt-1">Live snapshot per agent, computed from current data.</p>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Tile label="Total listings" value={totals.listings} />
        <Tile label="Total portfolio value" value={fmtUSD.format(totals.value)} />
        <Tile label="Sold (90d)" value={totals.sold_recent} />
        <Tile label="Enquiries" value={totals.enquiries} />
      </div>

      <div className="mt-6 hidden md:block bg-white border border-navy-100 rounded">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy-700">
            <tr>
              <th className="text-left p-3">Agent</th>
              <th className="text-right p-3">Listings</th>
              <th className="text-right p-3">Portfolio value</th>
              <th className="text-right p-3">Sold (90d)</th>
              <th className="text-right p-3">Sold (all time)</th>
              <th className="text-right p-3">Enquiries</th>
              <th className="text-right p-3">Wins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {rows.map(a => (
              <tr key={a.id}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={a.photo} alt={a.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <Link href={`/agents/${a.slug}`} className="font-medium text-navy-900 hover:text-gold-500">{a.name}</Link>
                      <div className="text-xs text-navy-500 truncate">{a.title}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-right text-navy-900 font-semibold">{a.listings}</td>
                <td className="p-3 text-right text-navy-900 font-semibold whitespace-nowrap">{fmtUSD.format(a.portfolio_value)}</td>
                <td className="p-3 text-right text-navy-700">{a.sold_recent}</td>
                <td className="p-3 text-right text-navy-700">{a.sold_total}</td>
                <td className="p-3 text-right text-navy-700">{a.enquiries_count}</td>
                <td className="p-3 text-right text-emerald-700 font-semibold">{a.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 md:hidden space-y-3">
        {rows.map(a => (
          <div key={a.id} className="bg-white border border-navy-100 rounded p-3">
            <div className="flex items-center gap-3">
              <img src={a.photo} alt={a.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <Link href={`/agents/${a.slug}`} className="font-medium text-navy-900 hover:text-gold-500 block truncate">{a.name}</Link>
                <div className="text-xs text-navy-500 truncate">{a.title}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Cell label="Listings" value={a.listings} />
              <Cell label="Portfolio" value={fmtUSD.format(a.portfolio_value)} />
              <Cell label="Sold (90d)" value={a.sold_recent} />
              <Cell label="Sold (all)" value={a.sold_total} />
              <Cell label="Enquiries" value={a.enquiries_count} />
              <Cell label="Wins" value={a.wins} accent />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Tile({ label, value }) {
  return (
    <div className="bg-white border border-navy-100 rounded-lg p-5">
      <div className="text-xs uppercase tracking-wider text-navy-500">{label}</div>
      <div className="font-display text-3xl text-navy-900 font-semibold mt-1">{value}</div>
    </div>
  );
}

function Cell({ label, value, accent }) {
  return (
    <div className="bg-navy-50 rounded px-2.5 py-1.5">
      <div className="text-[11px] uppercase tracking-wider text-navy-500">{label}</div>
      <div className={`font-semibold ${accent ? 'text-emerald-700' : 'text-navy-900'} truncate`}>{value}</div>
    </div>
  );
}
