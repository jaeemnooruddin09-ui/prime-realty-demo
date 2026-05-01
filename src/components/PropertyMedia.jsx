'use client';
import { useState } from 'react';

function youtubeEmbed(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export default function PropertyMedia({ description, floorPlans = [], virtualTourUrl }) {
  const tabs = [{ key: 'about', label: 'About' }];
  if (floorPlans.length > 0) tabs.push({ key: 'plans', label: `Floor plans (${floorPlans.length})` });
  if (virtualTourUrl) tabs.push({ key: 'tour', label: 'Virtual tour' });

  const [active, setActive] = useState('about');
  const tourEmbed = youtubeEmbed(virtualTourUrl);

  return (
    <div className="mt-10">
      <div className="border-b border-navy-100 flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`whitespace-nowrap px-4 py-3 -mb-px font-semibold text-sm border-b-2 transition ${active === t.key ? 'text-navy-900 border-gold-400' : 'text-navy-500 border-transparent hover:text-navy-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-6">
        {active === 'about' ? (
          <p className="text-navy-700 leading-relaxed whitespace-pre-line">{description}</p>
        ) : null}

        {active === 'plans' ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {floorPlans.map((p, i) => (
              <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="block bg-navy-50 rounded-lg overflow-hidden border border-navy-100 hover:shadow">
                <img src={p} alt={`Floor plan ${i + 1}`} className="w-full aspect-[4/3] object-contain bg-white" />
                <div className="p-3 text-sm font-medium text-navy-700">Floor plan {i + 1} - click to enlarge</div>
              </a>
            ))}
          </div>
        ) : null}

        {active === 'tour' && tourEmbed ? (
          <div className="aspect-video rounded-lg overflow-hidden border border-navy-100">
            <iframe src={tourEmbed} width="100%" height="100%" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; xr-spatial-tracking" allowFullScreen className="w-full h-full" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
