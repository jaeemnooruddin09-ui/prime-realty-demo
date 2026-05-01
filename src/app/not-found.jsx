import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container-x py-24 text-center">
      <div className="text-sm uppercase tracking-wider text-gold-600 font-semibold">404</div>
      <h1 className="font-display text-4xl text-navy-900 font-semibold mt-3">We could not find that page.</h1>
      <p className="text-navy-600 mt-3 max-w-xl mx-auto">The link may be broken or the page may have moved. Try our homepage or browse our latest listings.</p>
      <div className="mt-7 flex justify-center gap-3">
        <Link href="/" className="btn-primary">Go to homepage</Link>
        <Link href="/properties" className="btn-gold">Browse properties</Link>
      </div>
    </main>
  );
}
