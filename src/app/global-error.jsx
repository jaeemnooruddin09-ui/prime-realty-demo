'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (error) console.error('[global-error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: '4rem 1.5rem', textAlign: 'center', color: '#0b1322', background: '#ffffff' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: '#a07a1f', fontWeight: 600 }}>Something went wrong</div>
          <h1 style={{ fontSize: '2.25rem', margin: '0.75rem 0 0.5rem' }}>PrimeForge Homes is briefly unavailable.</h1>
          <p style={{ color: '#4a5568', lineHeight: 1.6 }}>We are looking into the issue. Please try again in a moment.</p>
          <button
            onClick={() => reset()}
            style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#0b1322', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
