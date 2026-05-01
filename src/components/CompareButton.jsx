'use client';
import { useEffect, useState } from 'react';
import { COMPARE_KEY, COMPARE_MAX, hasItem, toggleItem, getList } from '@/lib/storage';

export default function CompareButton({ propertyId, variant = 'inline' }) {
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const refresh = () => {
      const list = getList(COMPARE_KEY);
      setActive(list.includes(Number(propertyId)));
      setCount(list.length);
    };
    refresh();
    window.addEventListener(`storage:${COMPARE_KEY}`, refresh);
    return () => window.removeEventListener(`storage:${COMPARE_KEY}`, refresh);
  }, [propertyId]);

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!active && count >= COMPARE_MAX) {
      alert(`You can compare up to ${COMPARE_MAX} properties at a time. Remove one first.`);
      return;
    }
    toggleItem(COMPARE_KEY, propertyId, COMPARE_MAX);
  }

  if (!hydrated) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold border transition ${active ? 'bg-navy-900 border-navy-900 text-white' : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v3a2 2 0 0 1-2 2h-7"/></svg>
      {active ? 'Added to compare' : 'Compare'}
    </button>
  );
}
