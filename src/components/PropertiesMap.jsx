'use client';
import { useEffect, useRef } from 'react';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

let leafletPromise;
function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    if (document.querySelector(`script[src="${LEAFLET_JS}"]`)) {
      const wait = setInterval(() => {
        if (window.L) { clearInterval(wait); resolve(window.L); }
      }, 50);
      return;
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return leafletPromise;
}

function priceLabel(price, listingType) {
  if (listingType === 'rent') return `$${(price / 1000).toFixed(1)}k/mo`;
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(price >= 10_000_000 ? 0 : 1)}M`;
  if (price >= 1000) return `$${Math.round(price / 1000)}k`;
  return `$${price}`;
}

export default function PropertiesMap({ properties = [] }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then(L => {
      if (cancelled || !L || !containerRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const map = L.map(containerRef.current, { scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const markers = [];
      properties.forEach(p => {
        if (!p.lat || !p.lng) return;
        const icon = L.divIcon({
          className: '',
          html: `<div style="background:#102a43;color:#f3c947;padding:4px 10px;border-radius:999px;font-weight:700;font-size:13px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25);border:2px solid white;">${priceLabel(p.price, p.listing_type)}</div>`,
          iconSize: [60, 28],
          iconAnchor: [30, 14],
        });
        const m = L.marker([p.lat, p.lng], { icon }).addTo(map);
        const popupHtml = `
          <div style="font-family:Inter,system-ui,sans-serif;width:200px;">
            <a href="/properties/${p.slug}" style="display:block;text-decoration:none;color:inherit;">
              <img src="${(JSON.parse(p.photos || '[]')[0]) || ''}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;" alt="" />
              <div style="font-weight:700;color:#102a43;margin-top:6px;font-size:15px;">${priceLabel(p.price, p.listing_type)}</div>
              <div style="font-size:13px;color:#243b53;font-weight:600;line-height:1.2;">${p.title}</div>
              <div style="font-size:12px;color:#627d98;margin-top:2px;">${p.bedrooms}bd, ${p.bathrooms}ba</div>
            </a>
          </div>
        `;
        m.bindPopup(popupHtml);
        markers.push(m);
      });

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
      } else {
        map.setView([39.8283, -98.5795], 4);
      }

      mapRef.current = map;
    });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [properties]);

  return <div ref={containerRef} className="w-full h-[600px] rounded-lg border border-navy-100 bg-navy-50" />;
}
