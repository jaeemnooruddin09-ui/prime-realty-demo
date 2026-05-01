'use client';
import { useEffect, useState } from 'react';
import PropertyCard from './PropertyCard';
import { RECENT_KEY, getList } from '@/lib/storage';

export default function RecentlyViewed({ excludeId, max = 4, title = 'Recently viewed' }) {
  const [ids, setIds] = useState([]);
  const [props, setProps] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const refresh = () => setIds(getList(RECENT_KEY).filter(id => id !== Number(excludeId)).slice(0, max));
    refresh();
    window.addEventListener(`storage:${RECENT_KEY}`, refresh);
    return () => window.removeEventListener(`storage:${RECENT_KEY}`, refresh);
  }, [excludeId, max]);

  useEffect(() => {
    if (!hydrated || ids.length === 0) { setProps([]); return; }
    let cancelled = false;
    fetch(`/api/properties/by-ids?ids=${ids.join(',')}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) setProps(data.properties || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [ids, hydrated]);

  if (!hydrated || props.length === 0) return null;

  return (
    <section className="container-x py-12">
      <h2 className="font-display text-3xl text-navy-900 font-semibold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {props.slice(0, max).map(p => <PropertyCard key={p.id} property={p} />)}
      </div>
    </section>
  );
}
