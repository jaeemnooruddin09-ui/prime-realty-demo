import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';

export const metadata = {
  title: 'Insights & Market Reports',
  description: 'Latest market reports, buyer guides, and insider tips from Prime Realty agents.',
};

export default function BlogIndexPage() {
  const db = getDb();
  const posts = db.prepare(`SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC`).all();
  const s = getSiteSettings();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <section className="bg-navy-50 border-b border-navy-100">
        <div className="container-x py-14">
          <div className="text-sm uppercase tracking-wider text-gold-600 font-semibold">{s.name} Insights</div>
          <h1 className="font-display text-4xl md:text-5xl text-navy-900 font-semibold mt-2">Market reports, guides, and insider tips</h1>
          <p className="text-navy-600 mt-3 max-w-2xl">Quarterly market data, practical guides for buyers, and the inside-baseball takes you can only hear from agents who close 100+ luxury transactions a year.</p>
        </div>
      </section>

      {featured ? (
        <section className="container-x py-12">
          <Link href={`/blog/${featured.slug}`} className="block group">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-navy-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.cover} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">{featured.category}</div>
                <h2 className="font-display text-3xl md:text-4xl text-navy-900 font-semibold mt-2 group-hover:text-gold-600">{featured.title}</h2>
                <p className="text-navy-600 mt-3">{featured.excerpt}</p>
                <div className="mt-5 text-sm text-navy-500">{featured.author} · {featured.reading_minutes} min read · {new Date(featured.published_at * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section className="container-x pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map(p => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="card block group">
                <div className="aspect-[4/3] overflow-hidden bg-navy-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-5">
                  <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">{p.category}</div>
                  <h3 className="font-display text-xl text-navy-900 font-semibold mt-2 group-hover:text-gold-600 line-clamp-2">{p.title}</h3>
                  <p className="text-sm text-navy-600 mt-2 line-clamp-3">{p.excerpt}</p>
                  <div className="mt-4 text-xs text-navy-500">{p.author} · {p.reading_minutes} min read</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
