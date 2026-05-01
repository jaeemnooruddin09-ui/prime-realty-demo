import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const db = getDb();
  const src = db.prepare(`SELECT * FROM properties WHERE id = ?`).get(id);
  if (!src) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  let baseSlug = `${src.slug}-copy`;
  let candidate = baseSlug;
  let suffix = 2;
  while (db.prepare(`SELECT 1 FROM properties WHERE slug = ?`).get(candidate)) {
    candidate = `${baseSlug}-${suffix++}`;
  }

  const result = db.prepare(`
    INSERT INTO properties
    (slug, title, description, price, type, listing_type, bedrooms, bathrooms, size_sqft, address, city, country, lat, lng, featured, status, photos, agent_id, floor_plans, virtual_tour_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'draft', ?, ?, ?, ?)
  `).run(
    candidate,
    `${src.title} (copy)`,
    src.description,
    src.price,
    src.type,
    src.listing_type,
    src.bedrooms,
    src.bathrooms,
    src.size_sqft,
    src.address,
    src.city,
    src.country || 'United States',
    src.lat,
    src.lng,
    src.photos,
    src.agent_id,
    src.floor_plans || '[]',
    src.virtual_tour_url || null
  );

  logAudit({
    action: 'property_duplicate',
    resourceType: 'property',
    resourceId: result.lastInsertRowid,
    details: { source_id: id, source_title: src.title, new_slug: candidate },
  });

  return NextResponse.json({ ok: true, id: result.lastInsertRowid, slug: candidate });
}
