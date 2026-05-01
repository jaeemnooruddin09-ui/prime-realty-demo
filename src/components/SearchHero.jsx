'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PROPERTY_TYPES } from '@/lib/site';

export default function SearchHero() {
  const router = useRouter();
  const [listingType, setListingType] = useState('buy');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (listingType) params.set('listing_type', listingType);
    if (query) params.set('q', query);
    if (type) params.set('type', type);
    if (maxPrice) params.set('max_price', maxPrice);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl shadow-2xl p-6 md:p-7 max-w-5xl">
      <div className="flex gap-2 mb-5">
        <button type="button" onClick={() => setListingType('buy')} className={`px-5 py-2 rounded-md font-semibold transition ${listingType === 'buy' ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-700 hover:bg-navy-100'}`}>Buy</button>
        <button type="button" onClick={() => setListingType('rent')} className={`px-5 py-2 rounded-md font-semibold transition ${listingType === 'rent' ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-700 hover:bg-navy-100'}`}>Rent</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <label className="label">Location or keyword</label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="input" placeholder="e.g. New York, beachfront" />
        </div>
        <div>
          <label className="label">Property type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input">
            <option value="">Any type</option>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{listingType === 'rent' ? 'Max rent / mo' : 'Max price'}</label>
          <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input">
            <option value="">Any price</option>
            {listingType === 'rent' ? (
              <>
                <option value="2000">Up to $2,000</option>
                <option value="4000">Up to $4,000</option>
                <option value="6000">Up to $6,000</option>
                <option value="10000">Up to $10,000</option>
                <option value="20000">Up to $20,000</option>
              </>
            ) : (
              <>
                <option value="500000">Up to $500K</option>
                <option value="1000000">Up to $1M</option>
                <option value="2000000">Up to $2M</option>
                <option value="5000000">Up to $5M</option>
                <option value="10000000">Up to $10M</option>
              </>
            )}
          </select>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <button type="submit" className="btn-gold">Search Properties</button>
      </div>
    </form>
  );
}
