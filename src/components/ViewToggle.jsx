'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ViewToggle({ value }) {
  const router = useRouter();
  const sp = useSearchParams();

  function setView(v) {
    const params = new URLSearchParams(sp.toString());
    if (v === 'grid') params.delete('view');
    else params.set('view', v);
    router.push(`/properties?${params.toString()}`);
  }

  const v = value === 'map' ? 'map' : 'grid';
  return (
    <div className="inline-flex rounded-md border border-navy-200 overflow-hidden">
      <button onClick={() => setView('grid')} className={`px-3 py-2 text-sm font-semibold flex items-center gap-1.5 ${v === 'grid' ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 hover:bg-navy-50'}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Grid
      </button>
      <button onClick={() => setView('map')} className={`px-3 py-2 text-sm font-semibold flex items-center gap-1.5 ${v === 'map' ? 'bg-navy-900 text-white' : 'bg-white text-navy-700 hover:bg-navy-50'}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
        Map
      </button>
    </div>
  );
}
