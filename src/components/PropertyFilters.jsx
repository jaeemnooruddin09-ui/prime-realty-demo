'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PROPERTY_TYPES } from '@/lib/site';

export default function PropertyFilters({ countries = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [listingType, setListingType] = useState(searchParams.get('listing_type') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [minBeds, setMinBeds] = useState(searchParams.get('min_beds') || '');

  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setCountry(searchParams.get('country') || '');
    setListingType(searchParams.get('listing_type') || '');
    setType(searchParams.get('type') || '');
    setMinPrice(searchParams.get('min_price') || '');
    setMaxPrice(searchParams.get('max_price') || '');
    setMinBeds(searchParams.get('min_beds') || '');
  }, [searchParams]);

  function buildUrl(overrides = {}) {
    const merged = {
      q, country, listing_type: listingType, type,
      min_price: minPrice, max_price: maxPrice, min_beds: minBeds,
      ...overrides,
    };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== '' && v != null) params.set(k, v);
    });
    const sort = searchParams.get('sort');
    if (sort) params.set('sort', sort);
    const view = searchParams.get('view');
    if (view) params.set('view', view);
    return `/properties?${params.toString()}`;
  }

  function applyImmediately(overrides) {
    Object.entries(overrides).forEach(([k, v]) => {
      const map = { q: setQ, country: setCountry, listing_type: setListingType, type: setType, min_price: setMinPrice, max_price: setMaxPrice, min_beds: setMinBeds };
      const setter = map[k];
      if (setter) setter(v);
    });
    router.push(buildUrl(overrides));
  }

  function applyAll(e) {
    e?.preventDefault();
    router.push(buildUrl());
  }

  function reset() {
    setQ(''); setCountry(''); setListingType(''); setType(''); setMinPrice(''); setMaxPrice(''); setMinBeds('');
    router.push('/properties');
  }

  return (
    <form onSubmit={applyAll} className="bg-white rounded-lg border border-navy-100 p-5 h-fit lg:sticky lg:top-24">
      <h3 className="font-display text-xl font-semibold text-navy-900 mb-4">Filters</h3>

      <div className="space-y-4">
        <div>
          <label className="label">Keyword / location</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input" placeholder="e.g. London, beachfront" />
          <div className="text-xs text-navy-400 mt-1">Press Enter or click Apply.</div>
        </div>

        <div>
          <label className="label">Country</label>
          <select value={country} onChange={(e) => applyImmediately({ country: e.target.value })} className="input">
            <option value="">Any country</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Listing</label>
          <div className="grid grid-cols-3 gap-1">
            {[['', 'Any'], ['buy', 'Buy'], ['rent', 'Rent']].map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => applyImmediately({ listing_type: v })}
                className={`text-sm py-2 rounded ${listingType === v ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-700 hover:bg-navy-100'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Property type</label>
          <select value={type} onChange={(e) => applyImmediately({ type: e.target.value })} className="input">
            <option value="">Any</option>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Min bedrooms</label>
          <select value={minBeds} onChange={(e) => applyImmediately({ min_beds: e.target.value })} className="input">
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Min price</label>
            <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input" placeholder="0" inputMode="numeric" />
          </div>
          <div>
            <label className="label">Max price</label>
            <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input" placeholder="Any" inputMode="numeric" />
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button type="submit" className="btn-primary !py-2 flex-1">Apply</button>
        <button type="button" onClick={reset} className="btn-outline !py-2">Reset</button>
      </div>
    </form>
  );
}
