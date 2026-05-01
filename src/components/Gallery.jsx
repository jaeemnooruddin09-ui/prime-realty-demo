'use client';
import { useState } from 'react';

export default function Gallery({ photos = [], title = '' }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-lg overflow-hidden">
        <button onClick={() => setLightbox(true)} className="md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto block">
          <img src={photos[0]} alt={title} className="w-full h-full object-cover hover:opacity-95 transition" />
        </button>
        {photos.slice(1, 5).map((p, i) => (
          <button key={i} onClick={() => { setActive(i + 1); setLightbox(true); }} className="aspect-[4/3] block">
            <img src={p} alt={`${title} ${i + 2}`} className="w-full h-full object-cover hover:opacity-95 transition" />
          </button>
        ))}
      </div>
      {photos.length > 1 ? (
        <button onClick={() => setLightbox(true)} className="mt-3 text-sm font-semibold text-navy-700 hover:text-gold-500">View all {photos.length} photos &rarr;</button>
      ) : null}

      {lightbox ? (
        <div className="fixed inset-0 z-50 bg-navy-950/95 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center text-white mb-4">
              <div className="text-sm">{active + 1} / {photos.length}</div>
              <button onClick={() => setLightbox(false)} className="text-white text-2xl hover:text-gold-300">&times;</button>
            </div>
            <div className="relative">
              <img src={photos[active]} alt="" className="w-full max-h-[75vh] object-contain rounded" />
              {photos.length > 1 ? (
                <>
                  <button onClick={() => setActive((active - 1 + photos.length) % photos.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-navy-900 w-10 h-10 rounded-full flex items-center justify-center">&lsaquo;</button>
                  <button onClick={() => setActive((active + 1) % photos.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-navy-900 w-10 h-10 rounded-full flex items-center justify-center">&rsaquo;</button>
                </>
              ) : null}
            </div>
            {photos.length > 1 ? (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {photos.map((p, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden ${i === active ? 'ring-2 ring-gold-400' : 'opacity-70 hover:opacity-100'}`}>
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
