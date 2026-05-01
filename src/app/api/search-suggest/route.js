import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  const db = getDb();
  const like = `%${q}%`;

  const cities = db.prepare(`
    SELECT DISTINCT city as label, country, 'city' as kind
    FROM properties WHERE LOWER(city) LIKE ? LIMIT 5
  `).all(like);

  const countries = db.prepare(`
    SELECT DISTINCT country as label, '' as country, 'country' as kind
    FROM properties WHERE LOWER(country) LIKE ? LIMIT 3
  `).all(like);

  const titles = db.prepare(`
    SELECT title as label, slug, city, 'property' as kind
    FROM properties WHERE LOWER(title) LIKE ? OR LOWER(address) LIKE ? LIMIT 5
  `).all(like, like);

  const suggestions = [
    ...titles.map(t => ({ kind: t.kind, label: t.label, hint: t.city, href: `/properties/${t.slug}` })),
    ...cities.map(c => ({ kind: c.kind, label: c.label, hint: c.country || '', href: `/properties?q=${encodeURIComponent(c.label)}` })),
    ...countries.map(c => ({ kind: c.kind, label: c.label, hint: 'Country', href: `/properties?country=${encodeURIComponent(c.label)}` })),
  ];

  const seen = new Set();
  const dedup = [];
  for (const s of suggestions) {
    const key = `${s.kind}:${s.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(s);
    if (dedup.length >= 8) break;
  }

  return NextResponse.json({ suggestions: dedup });
}
