'use client';
import { useState } from 'react';

export default function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);

  const link = url || (typeof window !== 'undefined' ? window.location.href : '');
  const text = title ? `${title} | PrimeForge Homes` : 'PrimeForge Homes listing';

  function copy() {
    if (typeof navigator === 'undefined') return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }

  function nativeShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: text, url: link }).catch(() => {});
    } else {
      copy();
    }
  }

  const enc = encodeURIComponent;
  const wa = `https://wa.me/?text=${enc(text + ' ' + link)}`;
  const tw = `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(link)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${enc(link)}`;
  const mail = `mailto:?subject=${enc(text)}&body=${enc('Take a look at this listing: ' + link)}`;

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button onClick={copy} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold border border-navy-200 bg-white text-navy-700 hover:bg-navy-50">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="w-9 h-9 grid place-items-center rounded-md border border-navy-200 bg-white text-emerald-600 hover:bg-emerald-50">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/></svg>
      </a>
      <a href={tw} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="w-9 h-9 grid place-items-center rounded-md border border-navy-200 bg-white text-navy-700 hover:bg-navy-50">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="w-9 h-9 grid place-items-center rounded-md border border-navy-200 bg-white text-blue-600 hover:bg-blue-50">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
      </a>
      <a href={mail} aria-label="Share by email" className="w-9 h-9 grid place-items-center rounded-md border border-navy-200 bg-white text-navy-700 hover:bg-navy-50">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
      </a>
      <button onClick={nativeShare} aria-label="Share" className="w-9 h-9 grid place-items-center rounded-md border border-navy-200 bg-white text-navy-700 hover:bg-navy-50 sm:hidden">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      </button>
    </div>
  );
}
