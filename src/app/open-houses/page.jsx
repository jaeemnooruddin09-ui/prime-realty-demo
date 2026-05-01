import Link from 'next/link';
import { getDb } from '@/lib/db';
import { parsePhotos } from '@/lib/site';

export const metadata = {
  title: 'Upcoming Open Houses',
  description: 'Upcoming open house viewings. By appointment.',
};

function formatRange(startsAt, endsAt) {
  const start = new Date(startsAt * 1000);
  const end = new Date(endsAt * 1000);
  const dateStr = start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStart = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const timeEnd = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { dateStr, timeStart, timeEnd };
}

export default function OpenHousesPage() {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const rows = db.prepare(`
    SELECT oh.*, p.slug as property_slug, p.title as property_title, p.address, p.city, p.country, p.price, p.listing_type, p.bedrooms, p.bathrooms, p.size_sqft, p.photos,
           a.name as agent_name, a.photo as agent_photo, a.phone as agent_phone, a.email as agent_email
    FROM open_houses oh
    JOIN properties p ON p.id = oh.property_id
    LEFT JOIN agents a ON a.id = oh.host_agent_id
    WHERE oh.starts_at >= ?
    ORDER BY oh.starts_at ASC
  `).all(now);

  const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <>
      <section className="bg-navy-50 border-b border-navy-100">
        <div className="container-x py-14">
          <h1 className="font-display text-4xl md:text-5xl text-navy-900 font-semibold">Upcoming open houses</h1>
          <p className="text-navy-600 mt-3 max-w-2xl">Visit our most-requested properties without booking ahead. Bring questions, your agent, your spouse, or your favourite shoes.</p>
        </div>
      </section>

      <section className="container-x py-12">
        {rows.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-navy-200 rounded-lg bg-navy-50/50">
            <p className="text-navy-500">No upcoming open houses are scheduled. Check back soon, or contact an agent for a private viewing.</p>
            <Link href="/contact" className="btn-gold mt-5 inline-block">Request a private viewing</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {rows.map(oh => {
              const photos = parsePhotos(oh.photos);
              const cover = photos[0];
              const { dateStr, timeStart, timeEnd } = formatRange(oh.starts_at, oh.ends_at);
              return (
                <div key={oh.id} className="bg-white border border-navy-100 rounded-lg overflow-hidden grid md:grid-cols-[280px,1fr] hover:shadow-lg transition">
                  <Link href={`/properties/${oh.property_slug}`} className="aspect-[4/3] md:aspect-auto md:h-full overflow-hidden bg-navy-100 block">
                    {cover ? <img src={cover} alt={oh.property_title} className="w-full h-full object-cover" /> : null}
                  </Link>
                  <div className="p-6 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <Link href={`/properties/${oh.property_slug}`} className="font-display text-2xl text-navy-900 font-semibold hover:text-gold-600">{oh.property_title}</Link>
                        <div className="text-sm text-navy-500 mt-1">{oh.address}, {oh.city}{oh.country ? `, ${oh.country}` : ''}</div>
                      </div>
                      <div className="text-2xl font-bold text-navy-900">{fmtUSD.format(oh.price)}{oh.listing_type === 'rent' ? <span className="text-sm font-medium"> / mo</span> : null}</div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-navy-700 border-t border-navy-100 pt-3">
                      <span><span className="font-semibold">{dateStr}</span></span>
                      <span>{timeStart} to {timeEnd}</span>
                      <span>{oh.bedrooms} bed · {oh.bathrooms} bath · {oh.size_sqft.toLocaleString()} sqft</span>
                    </div>

                    {oh.notes ? <p className="text-sm text-navy-600 italic">{oh.notes}</p> : null}

                    <div className="flex items-center gap-3 mt-auto pt-2">
                      {oh.agent_photo ? <img src={oh.agent_photo} alt={oh.agent_name} className="w-9 h-9 rounded-full object-cover" /> : null}
                      <div className="text-sm">
                        <div className="font-semibold text-navy-900">{oh.agent_name}</div>
                        <div className="text-navy-500">Hosting</div>
                      </div>
                      <Link href={`/properties/${oh.property_slug}`} className="ml-auto btn-gold !py-2 !px-4 text-sm">Book your slot</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
