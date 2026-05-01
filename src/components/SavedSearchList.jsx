'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY = 'pr_saved_searches';

function read() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function write(list) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(`storage:${KEY}`));
}

export default function SavedSearchList() {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const refresh = () => setItems(read());
    refresh();
    window.addEventListener(`storage:${KEY}`, refresh);
    return () => window.removeEventListener(`storage:${KEY}`, refresh);
  }, []);

  function remove(id) {
    write(read().filter(s => s.id !== id));
  }

  if (!hydrated) return <div className="text-navy-500 text-center py-12">Loading…</div>;

  if (items.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-navy-200 rounded-lg bg-navy-50/50">
        <h2 className="font-display text-2xl text-navy-900 font-semibold">No saved searches yet</h2>
        <p className="text-navy-500 mt-2 max-w-md mx-auto">Filter the properties page however you like, then click "Save this search". Use it to come back to your shortlist faster.</p>
        <Link href="/properties" className="btn-gold mt-5 inline-block">Browse properties</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="bg-white border border-navy-100 rounded-lg p-5 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-navy-900">{item.label}</div>
            <div className="text-xs text-navy-500 mt-1">Saved {new Date(item.createdAt).toLocaleDateString()}</div>
          </div>
          <Link href={`/properties${item.query ? '?' + item.query : ''}`} className="btn-outline !py-2 !px-4 !text-sm">Run search</Link>
          <button onClick={() => remove(item.id)} className="text-navy-400 hover:text-rose-500" aria-label="Remove">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
