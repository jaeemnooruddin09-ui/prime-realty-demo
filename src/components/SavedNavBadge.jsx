'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FAVORITES_KEY, COMPARE_KEY, getList } from '@/lib/storage';

export default function SavedNavBadge({ mobile = false }) {
  const [favCount, setFavCount] = useState(0);
  const [cmpCount, setCmpCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const refresh = () => {
      setFavCount(getList(FAVORITES_KEY).length);
      setCmpCount(getList(COMPARE_KEY).length);
    };
    refresh();
    window.addEventListener(`storage:${FAVORITES_KEY}`, refresh);
    window.addEventListener(`storage:${COMPARE_KEY}`, refresh);
    return () => {
      window.removeEventListener(`storage:${FAVORITES_KEY}`, refresh);
      window.removeEventListener(`storage:${COMPARE_KEY}`, refresh);
    };
  }, []);

  if (!hydrated) return null;
  if (mobile) {
    return (
      <>
        <Link href="/favorites" className="py-2 hover:text-gold-500 flex items-center gap-2">
          <Heart /> Saved {favCount > 0 ? <span className="text-xs bg-rose-500 text-white px-1.5 py-0.5 rounded-full">{favCount}</span> : null}
        </Link>
        <Link href="/compare" className="py-2 hover:text-gold-500 flex items-center gap-2">
          <CompareIcon /> Compare {cmpCount > 0 ? <span className="text-xs bg-navy-900 text-white px-1.5 py-0.5 rounded-full">{cmpCount}</span> : null}
        </Link>
      </>
    );
  }
  return (
    <>
      <Link href="/favorites" aria-label="Saved properties" className="relative w-9 h-9 grid place-items-center rounded-md hover:bg-navy-50 text-navy-700">
        <Heart />
        {favCount > 0 ? <span className="absolute -top-1 -right-1 text-[10px] bg-rose-500 text-white min-w-[16px] h-4 px-1 grid place-items-center rounded-full">{favCount}</span> : null}
      </Link>
      <Link href="/compare" aria-label="Compare properties" className="relative w-9 h-9 grid place-items-center rounded-md hover:bg-navy-50 text-navy-700">
        <CompareIcon />
        {cmpCount > 0 ? <span className="absolute -top-1 -right-1 text-[10px] bg-navy-900 text-white min-w-[16px] h-4 px-1 grid place-items-center rounded-full">{cmpCount}</span> : null}
      </Link>
    </>
  );
}

function Heart() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
function CompareIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v3a2 2 0 0 1-2 2h-7"/></svg>;
}
