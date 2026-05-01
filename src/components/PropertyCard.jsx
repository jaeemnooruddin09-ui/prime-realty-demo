'use client';
import Link from 'next/link';
import { parsePhotos } from '@/lib/site';
import { useLocale } from './LocaleProvider';
import FavoriteButton from './FavoriteButton';

export default function PropertyCard({ property }) {
  const { formatPrice, dict } = useLocale();
  const photos = parsePhotos(property.photos);
  const cover = photos[0] || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600';
  const sold = property.status === 'sold';
  const rented = property.status === 'rented';

  return (
    <Link href={`/properties/${property.slug}`} className="card group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-100">
        <img src={cover} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <FavoriteButton propertyId={property.id} variant="overlay" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${property.listing_type === 'rent' ? 'bg-navy-900 text-white' : 'bg-gold-400 text-navy-950'}`}>
            {property.listing_type === 'rent' ? dict.property.forRent : dict.property.forSale}
          </span>
          {property.featured ? <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-navy-900">Featured</span> : null}
        </div>
        {(sold || rented) ? (
          <div className="absolute inset-0 bg-navy-950/60 flex items-center justify-center">
            <span className="bg-white text-navy-950 font-bold px-4 py-2 rounded uppercase tracking-wider">{sold ? 'Sold' : 'Rented'}</span>
          </div>
        ) : null}
      </div>
      <div className="p-5">
        <div className="text-2xl font-bold text-navy-900">{formatPrice(property.price, property.listing_type)}</div>
        <div className="mt-1 text-lg font-semibold text-navy-800 line-clamp-2">{property.title}</div>
        <div className="text-sm text-navy-500 mt-1 line-clamp-1 flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {property.city}{property.country ? `, ${property.country}` : ''}
        </div>
        <div className="mt-4 pt-4 border-t border-navy-100 flex items-center gap-4 text-sm text-navy-700">
          <span className="flex items-center gap-1.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>{property.bedrooms}</span>
          <span className="flex items-center gap-1.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="7" x2="7" y1="19" y2="21"/><line x1="17" x2="17" y1="19" y2="21"/></svg>{property.bathrooms}</span>
          <span className="flex items-center gap-1.5 ml-auto"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z"/></svg>{property.size_sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </Link>
  );
}
