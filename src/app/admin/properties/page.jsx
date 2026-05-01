import Link from 'next/link';
import { getDb } from '@/lib/db';
import { formatPrice, parsePhotos } from '@/lib/site';
import DeleteButton from '@/components/admin/DeleteButton';
import StatusButton from '@/components/admin/StatusButton';

export default function AdminProperties() {
  const db = getDb();
  const properties = db.prepare(`
    SELECT p.*, a.name as agent_name FROM properties p
    LEFT JOIN agents a ON p.agent_id = a.id
    ORDER BY p.created_at DESC
  `).all();

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy-900">Properties</h1>
          <p className="text-navy-500 mt-1">{properties.length} listings.</p>
        </div>
        <Link href="/admin/properties/new" className="btn-primary">+ Add property</Link>
      </div>

      <div className="mt-6 hidden md:block bg-white border border-navy-100 rounded overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-navy-50 text-navy-700">
            <tr>
              <th className="text-left p-3">Property</th>
              <th className="text-left p-3 hidden lg:table-cell">Agent</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Status</th>
              <th className="p-3 w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {properties.map(p => {
              const photos = parsePhotos(p.photos);
              return (
                <tr key={p.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={photos[0]} alt="" className="w-14 h-14 object-cover rounded flex-shrink-0" />
                      <div>
                        <Link href={`/properties/${p.slug}`} className="font-medium text-navy-900 hover:text-gold-500">{p.title}</Link>
                        <div className="text-xs text-navy-500">{p.city} - {p.bedrooms}bd, {p.bathrooms}ba, {p.size_sqft.toLocaleString()} sqft</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden lg:table-cell text-navy-700">{p.agent_name}</td>
                  <td className="p-3 text-navy-900 font-semibold whitespace-nowrap">{formatPrice(p.price, p.listing_type)}</td>
                  <td className="p-3"><StatusButton id={p.id} status={p.status} /></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Link href={`/admin/properties/${p.id}`} className="text-navy-700 hover:text-gold-500 font-semibold mr-3">Edit</Link>
                    <DeleteButton id={p.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 md:hidden space-y-3">
        {properties.map(p => {
          const photos = parsePhotos(p.photos);
          return (
            <div key={p.id} className="bg-white border border-navy-100 rounded p-3">
              <div className="flex items-start gap-3">
                <img src={photos[0]} alt="" className="w-20 h-20 object-cover rounded flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link href={`/properties/${p.slug}`} className="font-medium text-navy-900 hover:text-gold-500 block truncate">{p.title}</Link>
                  <div className="text-xs text-navy-500 mt-0.5">{p.city} - {p.bedrooms}bd, {p.bathrooms}ba</div>
                  <div className="font-semibold text-navy-900 mt-1">{formatPrice(p.price, p.listing_type)}</div>
                  <div className="text-xs text-navy-500 mt-0.5">{p.agent_name}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-navy-100 flex items-center justify-between gap-2">
                <StatusButton id={p.id} status={p.status} />
                <div className="flex items-center gap-3">
                  <Link href={`/admin/properties/${p.id}`} className="text-navy-700 hover:text-gold-500 font-semibold text-sm">Edit</Link>
                  <DeleteButton id={p.id} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
