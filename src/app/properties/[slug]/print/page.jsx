import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { parsePhotos, formatPrice } from '@/lib/site';
import { getSiteSettings } from '@/lib/settings';

export const metadata = { title: 'Print listing' };

export default function PrintListingPage({ params }) {
  const db = getDb();
  const property = db.prepare('SELECT * FROM properties WHERE slug = ?').get(params.slug);
  if (!property) notFound();
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(property.agent_id);
  const photos = parsePhotos(property.photos);
  const settings = getSiteSettings();

  return (
    <div className="bg-white text-navy-900 p-8 max-w-[800px] mx-auto print:p-0 print:max-w-full">
      <div className="border-b border-navy-200 pb-4 mb-6 flex items-center justify-between">
        <div className="font-display text-2xl font-semibold">{settings.name}</div>
        <div className="text-sm text-navy-500">{settings.phone} · {settings.email}</div>
      </div>

      <h1 className="font-display text-3xl font-semibold leading-tight">{property.title}</h1>
      <div className="text-navy-600 mt-1">{property.address}, {property.city}{property.country ? `, ${property.country}` : ''}</div>
      <div className="text-3xl font-bold mt-2">{formatPrice(property.price, property.listing_type)}</div>

      {photos[0] ? <img src={photos[0]} alt={property.title} className="w-full max-h-[420px] object-cover rounded-md mt-4" /> : null}

      <div className="mt-6 grid grid-cols-4 gap-3 text-center">
        {[
          ['Bedrooms', property.bedrooms],
          ['Bathrooms', property.bathrooms],
          ['Size (sqft)', property.size_sqft.toLocaleString()],
          ['Type', property.type.charAt(0).toUpperCase() + property.type.slice(1)],
        ].map(([l, v]) => (
          <div key={l} className="bg-navy-50 rounded p-3">
            <div className="text-2xl font-semibold">{v}</div>
            <div className="text-xs uppercase tracking-wider text-navy-500 mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl font-semibold mt-6">Description</h2>
      <p className="mt-2 text-navy-700 leading-relaxed">{property.description}</p>

      {photos.length > 1 ? (
        <>
          <h2 className="font-display text-xl font-semibold mt-6 break-before-page print:break-before-page">Gallery</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {photos.slice(1, 7).map((p, i) => (
              <img key={i} src={p} alt="" className="w-full aspect-[4/3] object-cover rounded" />
            ))}
          </div>
        </>
      ) : null}

      {agent ? (
        <div className="mt-8 pt-4 border-t border-navy-200 flex items-center gap-4">
          {agent.photo ? <img src={agent.photo} alt={agent.name} className="w-16 h-16 rounded-full object-cover" /> : null}
          <div>
            <div className="font-semibold text-lg">{agent.name}</div>
            <div className="text-sm text-navy-500">{agent.title}</div>
            <div className="text-sm mt-1">{agent.phone} · {agent.email}</div>
          </div>
        </div>
      ) : null}

      <div className="mt-8 text-xs text-navy-400 print:fixed print:bottom-4 print:left-0 print:right-0 print:text-center">
        Listing for {property.title} prepared by {settings.name}. Information believed accurate but not guaranteed; verify before relying on.
      </div>

      <div className="print:hidden mt-6 flex gap-3">
        <button onClick={() => typeof window !== 'undefined' && window.print()} className="btn-primary">Print this listing</button>
        <a href={`/properties/${property.slug}`} className="btn-outline">Back to listing</a>
      </div>
    </div>
  );
}
