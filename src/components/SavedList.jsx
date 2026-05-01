'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PropertyCard from './PropertyCard';
import { FAVORITES_KEY, COMPARE_KEY, RECENT_KEY, getList, clearList } from '@/lib/storage';

const KEY_NAMES = {
  [FAVORITES_KEY]: 'favorites',
  [COMPARE_KEY]: 'compare',
  [RECENT_KEY]: 'recent',
};

export default function SavedList({ storageKey, emptyTitle, emptyText, ctaHref = '/properties', ctaLabel = 'Browse properties' }) {
  const [ids, setIds] = useState([]);
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const refresh = () => setIds(getList(storageKey));
    refresh();
    window.addEventListener(`storage:${storageKey}`, refresh);
    return () => window.removeEventListener(`storage:${storageKey}`, refresh);
  }, [storageKey]);

  useEffect(() => {
    let cancelled = false;
    if (!hydrated) return;
    if (ids.length === 0) {
      setProps([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/properties/by-ids?ids=${ids.join(',')}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setProps(data.properties || []);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ids, hydrated]);

  if (!hydrated || loading) {
    return <div className="text-navy-500 text-center py-12">Loading…</div>;
  }

  if (props.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-navy-200 rounded-lg bg-navy-50/50">
        <h2 className="font-display text-2xl text-navy-900 font-semibold">{emptyTitle}</h2>
        <p className="text-navy-500 mt-2 max-w-md mx-auto">{emptyText}</p>
        <Link href={ctaHref} className="btn-gold mt-5 inline-block">{ctaLabel}</Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p className="text-navy-500 text-sm">{props.length} {props.length === 1 ? 'property' : 'properties'} saved</p>
        <button onClick={() => clearList(storageKey)} className="text-sm text-navy-500 hover:text-rose-600">Clear all</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {props.map(p => <PropertyCard key={p.id} property={p} />)}
      </div>
    </>
  );
}
