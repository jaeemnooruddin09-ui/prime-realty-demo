'use client';
import { useState, useRef, useEffect } from 'react';
import { useLocale } from './LocaleProvider';
import { CURRENCIES, LANGUAGES } from '@/lib/site';

export default function LocaleSwitcher({ inverted = false }) {
  const { lang, currency, changeLang, changeCurrency } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded transition ${inverted ? 'text-white hover:bg-white/10' : 'text-navy-700 hover:bg-navy-50'}`}
      >
        <span className="uppercase">{lang}</span>
        <span className="opacity-60">|</span>
        <span>{currency}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-navy-100 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-navy-100">
            <div className="text-xs uppercase tracking-wider text-navy-500 mb-2">Language</div>
            <div className="grid grid-cols-3 gap-1">
              {Object.entries(LANGUAGES).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => { changeLang(code); }}
                  className={`text-sm py-1.5 px-2 rounded ${lang === code ? 'bg-navy-900 text-white' : 'text-navy-700 hover:bg-navy-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs uppercase tracking-wider text-navy-500 mb-2">Currency</div>
            <div className="grid grid-cols-3 gap-1">
              {Object.values(CURRENCIES).map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { changeCurrency(c.code); }}
                  className={`text-sm py-1.5 px-2 rounded text-left ${currency === c.code ? 'bg-navy-900 text-white' : 'text-navy-700 hover:bg-navy-50'}`}
                >
                  <span className="font-semibold">{c.code}</span>
                  <span className="ml-1 opacity-70">{c.symbol.trim()}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-navy-400 mt-2">Approx. conversion. Final price quoted by agent.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
