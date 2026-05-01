import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { formatPrice, parsePhotos } from '@/lib/site';
import { getSiteSettings } from '@/lib/settings';
import PropertyCard from '@/components/PropertyCard';
import EnquiryForm from '@/components/EnquiryForm';
import Gallery from '@/components/Gallery';
import MortgageCalculator from '@/components/MortgageCalculator';
import PropertyMedia from '@/components/PropertyMedia';
import Price from '@/components/Price';

export async function generateMetadata({ params }) {
  const db = getDb();
  const p = db.prepare('SELECT * FROM properties WHERE slug = ?').get(params.slug);
  const s = getSiteSettings();
  if (!p) return { title: `Property not found | ${s.name}` };
  const photos = parsePhotos(p.photos);
  const desc = `${p.bedrooms} bed, ${p.bathrooms} bath ${p.type} in ${p.city}. ${formatPrice(p.price, p.listing_type)}. ${p.description.slice(0, 140)}`;
  return {
    title: p.title,
    description: desc,
    openGraph: {
      title: p.title,
      description: desc,
      images: photos.length ? [photos[0]] : [],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: p.title, description: desc, images: photos.length ? [photos[0]] : [] },
  };
}

export default function PropertyDetail({ params }) {
  const db = getDb();
  const property = db.prepare('SELECT * FROM properties WHERE slug = ?').get(params.slug);
  if (!property) notFound();

  const settings = getSiteSettings();
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(property.agent_id);
  const photos = parsePhotos(property.photos);
  const floorPlans = parsePhotos(property.floor_plans);

  const similar = db.prepare(
    `SELECT * FROM properties WHERE id != ? AND type = ? AND status = 'available' ORDER BY ABS(price - ?) ASC LIMIT 3`
  ).all(property.id, property.type, property.price);

  const mapQuery = property.address ? encodeURIComponent(property.address) : `${property.lat},${property.lng}`;
  const mapEmbed = `https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`;
  const waText = encodeURIComponent(`Hi ${agent.name}, I'm interested in "${property.title}" listed at ${formatPrice(property.price, property.listing_type)}. Could we arrange a viewing?`);
  const waLink = `https://wa.me/${settings.whatsapp}?text=${waText}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': property.listing_type === 'rent' ? 'RentAction' : 'Product',
    name: property.title,
    description: property.description,
    image: photos,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'USD',
      availability: property.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
    },
    geo: { '@type': 'GeoCoordinates', latitude: property.lat, longitude: property.lng },
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: { '@type': 'QuantitativeValue', value: property.size_sqft, unitCode: 'FTK' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-white border-b border-navy-100">
        <div className="container-x py-6 text-sm text-navy-500">
          <Link href="/" className="hover:text-gold-500">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/properties" className="hover:text-gold-500">Properties</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-900">{property.title}</span>
        </div>
      </section>

      <section className="container-x pt-4">
        <Gallery photos={photos} title={property.title} />
      </section>

      <section className="container-x py-8 grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-10">
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${property.listing_type === 'rent' ? 'bg-navy-900 text-white' : 'bg-gold-400 text-navy-950'}`}>
                {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
              <h1 className="font-display text-4xl text-navy-900 font-semibold mt-3">{property.title}</h1>
              <div className="text-navy-500 mt-2 flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {property.address}
              </div>
            </div>
            <Price amount={property.price} listingType={property.listing_type} className="text-3xl font-bold text-navy-900" />
          </div>

          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Bedrooms" value={property.bedrooms} />
            <Stat label="Bathrooms" value={property.bathrooms} />
            <Stat label="Size (sqft)" value={property.size_sqft.toLocaleString()} />
            <Stat label="Property type" value={property.type.charAt(0).toUpperCase() + property.type.slice(1)} />
          </div>

          <PropertyMedia
            description={property.description}
            floorPlans={floorPlans}
            virtualTourUrl={property.virtual_tour_url}
          />

          <div className="mt-10">
            <h2 className="font-display text-2xl text-navy-900 font-semibold">Location</h2>
            <div className="mt-4 rounded-lg overflow-hidden border border-navy-100">
              <iframe src={mapEmbed} width="100%" height="380" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <p className="mt-2 text-sm text-navy-500">{property.address}</p>
          </div>

          {property.listing_type === 'buy' ? (
            <div className="mt-10">
              <MortgageCalculator
                price={property.price}
                rate={settings.mortgage.rate}
                defaultTerm={settings.mortgage.defaultTerm}
                defaultDownPct={settings.mortgage.defaultDownPct}
              />
            </div>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white border border-navy-100 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <img src={agent.photo} className="w-16 h-16 rounded-full object-cover" alt={agent.name} />
              <div>
                <div className="font-semibold text-navy-900">{agent.name}</div>
                <div className="text-sm text-navy-500">{agent.title}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-navy-700 hover:text-gold-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {agent.phone}
              </a>
              <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-navy-700 hover:text-gold-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
                {agent.email}
              </a>
            </div>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/></svg>
              Chat on WhatsApp
            </a>
          </div>

          <div className="bg-white border border-navy-100 rounded-lg p-6">
            <h3 className="font-display text-xl font-semibold text-navy-900">Make an enquiry</h3>
            <p className="text-sm text-navy-500 mt-1">{agent.name} will respond within one business day.</p>
            <EnquiryForm propertyId={property.id} agentName={agent.name} />
          </div>
        </aside>
      </section>

      {similar.length > 0 ? (
        <section className="container-x py-12">
          <h2 className="font-display text-3xl text-navy-900 font-semibold mb-6">Similar Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      ) : null}
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-navy-50 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-navy-900">{value}</div>
      <div className="text-xs uppercase tracking-wider text-navy-500 mt-1">{label}</div>
    </div>
  );
}
