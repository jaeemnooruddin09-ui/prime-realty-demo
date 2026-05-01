import { getDb } from '@/lib/db';

export default function TestimonialsSection() {
  const db = getDb();
  const items = db.prepare(`SELECT * FROM testimonials WHERE featured = 1 ORDER BY created_at DESC LIMIT 6`).all();
  if (items.length === 0) return null;
  return (
    <section className="bg-navy-50 border-y border-navy-100">
      <div className="container-x py-16">
        <div className="text-center mb-10">
          <div className="text-sm uppercase tracking-wider text-gold-600 font-semibold">In their own words</div>
          <h2 className="font-display text-3xl md:text-4xl text-navy-900 font-semibold mt-2">What our clients say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(t => (
            <figure key={t.id} className="bg-white rounded-lg border border-navy-100 p-6 flex flex-col">
              <div className="flex gap-0.5 text-gold-500 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <blockquote className="text-navy-700 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                {t.photo ? <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" /> : null}
                <div>
                  <div className="font-semibold text-navy-900">{t.name}</div>
                  <div className="text-xs text-navy-500">{t.title}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
