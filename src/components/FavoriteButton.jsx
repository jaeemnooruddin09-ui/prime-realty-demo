'use client';
import { useEffect, useState } from 'react';
import { FAVORITES_KEY, hasItem, toggleItem } from '@/lib/storage';

export default function FavoriteButton({ propertyId, variant = 'overlay' }) {
  const [active, setActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setActive(hasItem(FAVORITES_KEY, propertyId));
    const handler = () => setActive(hasItem(FAVORITES_KEY, propertyId));
    window.addEventListener(`storage:${FAVORITES_KEY}`, handler);
    return () => window.removeEventListener(`storage:${FAVORITES_KEY}`, handler);
  }, [propertyId]);

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    const list = toggleItem(FAVORITES_KEY, propertyId);
    setActive(list.includes(Number(propertyId)));
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={active}
        aria-label={active ? 'Remove from favorites' : 'Save to favorites'}
        className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold border transition ${active ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'}`}
      >
        <Heart filled={active} />
        {active ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Save to favorites'}
      className={`absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center transition shadow-md backdrop-blur ${active ? 'bg-rose-500 text-white' : 'bg-white/90 text-navy-700 hover:bg-white'}`}
      style={{ visibility: hydrated ? 'visible' : 'hidden' }}
    >
      <Heart filled={active} />
    </button>
  );
}

function Heart({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
