import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://primeforge-homes.demo';

export default function sitemap() {
  const db = getDb();
  const properties = db.prepare(`SELECT slug, created_at FROM properties WHERE status NOT IN ('sold', 'draft')`).all();
  const agents = db.prepare(`SELECT slug FROM agents`).all();

  const staticRoutes = ['', '/properties', '/about', '/contact', '/agents', '/blog', '/faq', '/open-houses', '/privacy', '/terms'];
  const now = new Date();

  return [
    ...staticRoutes.map(path => ({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: path === '' || path === '/properties' ? 'daily' : 'monthly',
      priority: path === '' ? 1 : 0.8,
    })),
    ...properties.map(p => ({
      url: `${BASE_URL}/properties/${p.slug}`,
      lastModified: new Date(p.created_at * 1000),
      changeFrequency: 'weekly',
      priority: 0.9,
    })),
    ...agents.map(a => ({
      url: `${BASE_URL}/agents/${a.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ];
}
