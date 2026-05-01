import Link from 'next/link';
import { getDb } from '@/lib/db';

export default function AdminEnquiries() {
  const db = getDb();
  const enquiries = db.prepare(`
    SELECT e.*, p.title, p.slug FROM enquiries e
    LEFT JOIN properties p ON p.id = e.property_id
    ORDER BY e.created_at DESC
  `).all();

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-navy-900">Enquiries</h1>
      <p className="text-navy-500 mt-1">{enquiries.length} {enquiries.length === 1 ? 'message' : 'messages'} received.</p>

      <div className="mt-6 space-y-4">
        {enquiries.length === 0 ? <div className="bg-white border border-navy-100 rounded p-8 text-navy-500 text-center">No enquiries yet.</div> : null}
        {enquiries.map(e => (
          <div key={e.id} className="bg-white border border-navy-100 rounded p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="font-semibold text-navy-900">{e.name}</div>
                <div className="text-sm text-navy-500">
                  <a href={`mailto:${e.email}`} className="hover:text-gold-500">{e.email}</a>
                  {e.phone ? <> &middot; <a href={`tel:${e.phone}`} className="hover:text-gold-500">{e.phone}</a></> : null}
                </div>
              </div>
              <div className="text-xs text-navy-400">{new Date(e.created_at * 1000).toLocaleString()}</div>
            </div>
            <p className="mt-3 text-navy-700 whitespace-pre-line">{e.message}</p>
            {e.title ? (
              <div className="mt-3 text-sm">
                Re: <Link href={`/properties/${e.slug}`} className="font-semibold text-navy-900 hover:text-gold-500">{e.title}</Link>
              </div>
            ) : <div className="mt-3 text-sm text-navy-500">General contact form</div>}
          </div>
        ))}
      </div>
    </>
  );
}
