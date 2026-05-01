import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';
import ShareButtons from '@/components/ShareButtons';

export async function generateMetadata({ params }) {
  const db = getDb();
  const p = db.prepare(`SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'`).get(params.slug);
  const s = getSiteSettings();
  if (!p) return { title: `Post not found | ${s.name}` };
  return {
    title: p.title,
    description: p.excerpt,
    openGraph: { title: p.title, description: p.excerpt, images: [p.cover], type: 'article' },
    twitter: { card: 'summary_large_image', title: p.title, description: p.excerpt, images: [p.cover] },
  };
}

export default function BlogPostPage({ params }) {
  const db = getDb();
  const post = db.prepare(`SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'`).get(params.slug);
  if (!post) notFound();
  const related = db.prepare(`
    SELECT * FROM blog_posts WHERE id != ? AND status = 'published'
    ORDER BY (category = ?) DESC, published_at DESC LIMIT 3
  `).all(post.id, post.category);

  const date = new Date(post.published_at * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: [post.cover],
    datePublished: new Date(post.published_at * 1000).toISOString(),
    author: { '@type': 'Person', name: post.author },
    articleSection: post.category,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article>
        <div className="container-x py-6 text-sm text-navy-500">
          <Link href="/" className="hover:text-gold-500">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-gold-500">Insights</Link>
          <span className="mx-2">/</span>
          <span className="text-navy-900 truncate">{post.title}</span>
        </div>

        <div className="container-x max-w-3xl">
          <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">{post.category}</div>
          <h1 className="font-display text-4xl md:text-5xl text-navy-900 font-semibold mt-2 leading-tight">{post.title}</h1>
          <p className="text-lg text-navy-600 mt-4">{post.excerpt}</p>
          <div className="mt-5 flex items-center gap-3 text-sm text-navy-500 flex-wrap">
            <span>{post.author}</span>
            <span>·</span>
            <span>{date}</span>
            <span>·</span>
            <span>{post.reading_minutes} min read</span>
            <span className="ml-auto"><ShareButtons title={post.title} /></span>
          </div>
        </div>

        <div className="container-x mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt={post.title} className="w-full max-h-[520px] object-cover rounded-lg" />
        </div>

        <div className="container-x max-w-3xl py-12">
          <div className="prose prose-navy max-w-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-navy-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:text-navy-700 [&_p]:leading-7 [&_p]:mb-4" dangerouslySetInnerHTML={{ __html: post.body }} />
        </div>
      </article>

      {related.length > 0 ? (
        <section className="bg-navy-50 border-t border-navy-100">
          <div className="container-x py-12">
            <h2 className="font-display text-2xl text-navy-900 font-semibold mb-6">Related reading</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(p => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="card block group">
                  <div className="aspect-[4/3] overflow-hidden bg-navy-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <div className="p-5">
                    <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">{p.category}</div>
                    <h3 className="font-display text-lg text-navy-900 font-semibold mt-2 group-hover:text-gold-600 line-clamp-2">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
