'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const KEY = 'pr_saved_searches';
const MAX = 10;

function readSaved() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function writeSaved(arr) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(arr));
  window.dispatchEvent(new CustomEvent(`storage:${KEY}`));
}

function describeQuery(params) {
  const parts = [];
  if (params.q) parts.push(`"${params.q}"`);
  if (params.country) parts.push(params.country);
  if (params.listing_type) parts.push(params.listing_type === 'rent' ? 'rent' : 'buy');
  if (params.type) parts.push(params.type);
  if (params.min_beds) parts.push(`${params.min_beds}+ beds`);
  if (params.max_price) parts.push(`under $${Number(params.max_price).toLocaleString()}`);
  if (params.min_price) parts.push(`from $${Number(params.min_price).toLocaleString()}`);
  return parts.join(' · ') || 'All properties';
}

export default function SaveSearchButton() {
  const sp = useSearchParams();
  const [saved, setSaved] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const queryString = sp.toString();
  const params = Object.fromEntries(sp.entries());
  const label = describeQuery(params);

  useEffect(() => {
    setHydrated(true);
    const refresh = () => setSaved(readSaved());
    refresh();
    window.addEventListener(`storage:${KEY}`, refresh);
    return () => window.removeEventListener(`storage:${KEY}`, refresh);
  }, []);

  const isSaved = saved.find(s => s.query === queryString);

  function toggle() {
    const list = readSaved();
    if (isSaved) {
      writeSaved(list.filter(s => s.query !== queryString));
    } else {
      list.unshift({ id: Date.now(), label, query: queryString, createdAt: Date.now() });
      if (list.length > MAX) list.length = MAX;
      writeSaved(list);
    }
  }

  if (!hydrated) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold border transition ${isSaved ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      {isSaved ? 'Search saved' : 'Save this search'}
    </button>
  );
}
