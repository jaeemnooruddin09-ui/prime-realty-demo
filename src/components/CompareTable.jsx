'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { COMPARE_KEY, getList, removeItem, clearList } from '@/lib/storage';

const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function parsePhotos(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export default function CompareTable() {
  const [ids, setIds] = useState([]);
  const [props, setProps] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHydrated(true);
    const refresh = () => setIds(getList(COMPARE_KEY));
    refresh();
    window.addEventListener(`storage:${COMPARE_KEY}`, refresh);
    return () => window.removeEventListener(`storage:${COMPARE_KEY}`, refresh);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!hydrated) return;
    if (ids.length === 0) { setProps([]); setLoading(false); return; }
    setLoading(true);
    fetch(`/api/properties/by-ids?ids=${ids.join(',')}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setProps(data.properties || []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ids, hydrated]);

  if (!hydrated || loading) return <div className="text-navy-500 text-center py-12">Loading…</div>;

  if (props.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-navy-200 rounded-lg bg-navy-50/50">
        <h2 className="font-display text-2xl text-navy-900 font-semibold">Nothing to compare yet</h2>
        <p className="text-navy-500 mt-2 max-w-md mx-auto">Tap "Compare" on any listing card to add it here. You can compare up to four properties at once.</p>
        <Link href="/properties" className="btn-gold mt-5 inline-block">Browse properties</Link>
      </div>
    );
  }

  const rows = [
    { label: 'Price', render: p => p.listing_type === 'rent' ? `${fmtUSD.format(p.price)} / mo` : fmtUSD.format(p.price) },
    { label: 'Type', render: p => p.type.charAt(0).toUpperCase() + p.type.slice(1) },
    { label: 'Listing', render: p => p.listing_type === 'rent' ? 'For Rent' : 'For Sale' },
    { label: 'Bedrooms', render: p => p.bedrooms },
    { label: 'Bathrooms', render: p => p.bathrooms },
    { label: 'Size', render: p => `${p.size_sqft.toLocaleString()} sqft` },
    { label: 'Price per sqft', render: p => fmtUSD.format(Math.round(p.price / p.size_sqft)) },
    { label: 'City', render: p => p.city },
    { label: 'Country', render: p => p.country || '' },
    { label: 'Status', render: p => p.status.charAt(0).toUpperCase() + p.status.slice(1) },
    { label: 'Featured', render: p => p.featured ? 'Yes' : 'No' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-navy-500 text-sm">{props.length} {props.length === 1 ? 'property' : 'properties'} in comparison</p>
        <button onClick={() => clearList(COMPARE_KEY)} className="text-sm text-navy-500 hover:text-rose-600">Clear all</button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-navy-100">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-navy-50">
              <th className="text-left p-4 text-sm font-semibold text-navy-700 sticky left-0 bg-navy-50 z-10 min-w-[140px]">&nbsp;</th>
              {props.map(p => {
                const cover = parsePhotos(p.photos)[0];
                return (
                  <th key={p.id} className="p-4 text-left min-w-[260px] align-top">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/properties/${p.slug}`} className="font-semibold text-navy-900 hover:text-gold-500 line-clamp-2">{p.title}</Link>
                        <button onClick={() => removeItem(COMPARE_KEY, p.id)} aria-label="Remove" className="text-navy-400 hover:text-rose-500 shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      {cover ? <img src={cover} alt={p.title} className="aspect-[4/3] object-cover rounded" /> : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-navy-50/50'}>
                <td className="p-4 text-sm font-semibold text-navy-700 sticky left-0 bg-inherit z-10">{row.label}</td>
                {props.map(p => (
                  <td key={p.id} className="p-4 text-sm text-navy-800">{row.render(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
