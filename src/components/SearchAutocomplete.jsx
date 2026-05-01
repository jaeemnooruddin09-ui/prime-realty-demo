'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchAutocomplete({ value, onChange, placeholder, className = '', name = 'q' }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const debounceRef = useRef();

  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!value || value.trim().length < 2) {
      setItems([]); setOpen(false); return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/search-suggest?q=${encodeURIComponent(value)}`)
        .then(r => r.json())
        .then(data => { setItems(data.suggestions || []); setOpen(true); setActive(-1); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(debounceRef.current);
  }, [value]);

  function pick(item) {
    setOpen(false);
    if (item.href) router.push(item.href);
  }

  function onKey(e) {
    if (!open || items.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(items.length - 1, a + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(items[active]); }
    if (e.key === 'Escape') { setOpen(false); }
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { if (items.length > 0) setOpen(true); }}
        onKeyDown={onKey}
        placeholder={placeholder}
        className="input"
        autoComplete="off"
      />
      {open && items.length > 0 ? (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-navy-200 rounded-lg shadow-lg z-30 max-h-80 overflow-y-auto">
          {items.map((it, i) => (
            <button
              key={`${it.kind}-${it.label}-${i}`}
              type="button"
              onClick={() => pick(it)}
              onMouseEnter={() => setActive(i)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 ${i === active ? 'bg-navy-50' : 'hover:bg-navy-50'}`}
            >
              <span className="w-7 h-7 rounded grid place-items-center bg-navy-100 text-navy-600 shrink-0">
                {it.kind === 'property' ? <Home /> : it.kind === 'city' ? <Pin /> : <Globe />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium text-navy-900 truncate">{it.label}</span>
                {it.hint ? <span className="block text-xs text-navy-500 truncate">{it.hint}</span> : null}
              </span>
              <span className="text-xs uppercase tracking-wider text-navy-400">{it.kind}</span>
            </button>
          ))}
        </div>
      ) : null}
      {loading && open ? <div className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 text-xs">…</div> : null}
    </div>
  );
}

function Home() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function Pin() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function Globe() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }
