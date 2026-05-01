import NewsletterForm from './NewsletterForm';

export default function LeadMagnetSection() {
  return (
    <section className="bg-navy-900 text-white">
      <div className="container-x py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold-400 font-semibold">Free download</div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3">2026 Luxury Market Report</h2>
          <p className="text-white/80 mt-3 max-w-md">52 pages on London, New York, Marbella, Tuscany, Manhattan, Dubai, and Singapore. Pricing benchmarks, days-on-market, and where the smart capital is moving in 2026.</p>
          <ul className="mt-5 space-y-2 text-white/80">
            <li className="flex gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400 flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
              Q1 2026 transaction data across seven primary markets
            </li>
            <li className="flex gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400 flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
              Per-square-foot pricing by neighbourhood
            </li>
            <li className="flex gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-400 flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
              Outlook from our seven senior agents on H2 2026
            </li>
          </ul>
        </div>
        <div className="bg-white text-navy-900 rounded-lg p-6 md:p-7">
          <div className="font-display text-xl font-semibold">Get the report</div>
          <p className="text-sm text-navy-500 mt-1">Drop your email and we will send you the PDF immediately.</p>
          <NewsletterForm
            source="lead-magnet-2026-report"
            placeholder="you@example.com"
            cta="Send me the report"
            className="mt-4"
          />
          <p className="text-xs text-navy-400 mt-3">By submitting, you consent to receive occasional emails from Prime Realty. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  );
}
