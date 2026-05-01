'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RouteError({ error, reset }) {
  useEffect(() => {
    if (error) console.error('[route-error]', error);
  }, [error]);

  return (
    <main className="container-x py-24 text-center">
      <div className="text-sm uppercase tracking-wider text-gold-600 font-semibold">Something went wrong</div>
      <h1 className="font-display text-4xl text-navy-900 font-semibold mt-3">We could not load this page.</h1>
      <p className="text-navy-600 mt-3 max-w-xl mx-auto">An unexpected issue interrupted your visit. Our team has been notified. Please try again, or head back to the homepage.</p>
      <div className="mt-7 flex justify-center gap-3">
        <button onClick={() => reset()} className="btn-primary">Try again</button>
        <Link href="/" className="btn-gold">Go to homepage</Link>
      </div>
    </main>
  );
}
