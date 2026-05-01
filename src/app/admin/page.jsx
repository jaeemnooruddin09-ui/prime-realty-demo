import Link from 'next/link';
import { getDb } from '@/lib/db';

export default function AdminDashboard() {
  const db = getDb();
  const totals = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM properties) as total,
      (SELECT COUNT(*) FROM properties WHERE status='available') as available,
      (SELECT COUNT(*) FROM properties WHERE status='sold') as sold,
      (SELECT COUNT(*) FROM properties WHERE status='rented') as rented,
      (SELECT COUNT(*) FROM enquiries) as enquiries
  `).get();

  const recent = db.prepare(`SELECT * FROM properties ORDER BY created_at DESC LIMIT 5`).all();
  const recentEnquiries = db.prepare(`
    SELECT e.*, p.title FROM enquiries e LEFT JOIN properties p ON p.id = e.property_id ORDER BY e.created_at DESC LIMIT 5
  `).all();

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-navy-900">Dashboard</h1>
      <p className="text-navy-500 mt-1">Manage listings, photos, and enquiries.</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Stat label="Total" v={totals.total} />
        <Stat label="Available" v={totals.available} />
        <Stat label="Sold" v={totals.sold} />
        <Stat label="Rented" v={totals.rented} />
        <Stat label="Enquiries" v={totals.enquiries} />
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/admin/properties/new" className="btn-primary">+ Add property</Link>
        <Link href="/admin/properties" className="btn-outline">Manage all</Link>
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-xl font-semibold text-navy-900">Recent listings</h2>
          <ul className="mt-3 divide-y divide-navy-100 bg-white border border-navy-100 rounded">
            {recent.map(p => (
              <li key={p.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <Link href={`/properties/${p.slug}`} className="font-medium text-navy-900 hover:text-gold-500">{p.title}</Link>
                  <div className="text-xs text-navy-500">{p.city} - {p.status}</div>
                </div>
                <Link href={`/admin/properties/${p.id}`} className="text-sm font-semibold text-navy-700 hover:text-gold-500">Edit</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-navy-900">Recent enquiries</h2>
          <ul className="mt-3 divide-y divide-navy-100 bg-white border border-navy-100 rounded">
            {recentEnquiries.length === 0 ? <li className="p-4 text-navy-500 text-sm">No enquiries yet.</li> : recentEnquiries.map(e => (
              <li key={e.id} className="p-4">
                <div className="font-medium text-navy-900">{e.name} <span className="text-navy-400 text-sm font-normal">({e.email})</span></div>
                <div className="text-xs text-navy-500">{e.title || 'General contact'} - {new Date(e.created_at * 1000).toLocaleString()}</div>
                <p className="text-sm text-navy-700 mt-1 line-clamp-2">{e.message}</p>
              </li>
            ))}
          </ul>
          <Link href="/admin/enquiries" className="text-sm font-semibold text-navy-700 hover:text-gold-500 mt-2 inline-block">View all enquiries &rarr;</Link>
        </div>
      </div>
    </>
  );
}

function Stat({ label, v }) {
  return (
    <div className="bg-white border border-navy-100 rounded p-5">
      <div className="text-3xl font-bold text-navy-900">{v}</div>
      <div className="text-xs uppercase tracking-wider text-navy-500 mt-1">{label}</div>
    </div>
  );
}
