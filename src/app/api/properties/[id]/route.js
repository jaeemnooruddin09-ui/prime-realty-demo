import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { PROPERTY_TYPES } from '@/lib/site';

function makeSlug(s) {
  return s.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function PUT(req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const id = parseInt(params.id);
    if (!PROPERTY_TYPES.includes(body.type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    const photos = Array.isArray(body.photos) ? body.photos : [];
    if (photos.length === 0) return NextResponse.json({ error: 'At least one photo required' }, { status: 400 });
    const db = getDb();
    db.prepare(`
      UPDATE properties SET
        slug = @slug,
        title = @title,
        description = @description,
        price = @price,
        type = @type,
        listing_type = @listing_type,
        bedrooms = @bedrooms,
        bathrooms = @bathrooms,
        size_sqft = @size_sqft,
        address = @address,
        city = @city,
        lat = @lat,
        lng = @lng,
        featured = @featured,
        status = @status,
        photos = @photos,
        agent_id = @agent_id,
        floor_plans = @floor_plans,
        virtual_tour_url = @virtual_tour_url
      WHERE id = @id
    `).run({
      id,
      slug: makeSlug(body.slug || body.title),
      title: body.title,
      description: body.description,
      price: parseInt(body.price),
      type: body.type,
      listing_type: body.listing_type === 'rent' ? 'rent' : 'buy',
      bedrooms: parseInt(body.bedrooms),
      bathrooms: parseInt(body.bathrooms),
      size_sqft: parseInt(body.size_sqft),
      address: body.address,
      city: body.city,
      lat: parseFloat(body.lat) || 0,
      lng: parseFloat(body.lng) || 0,
      featured: body.featured ? 1 : 0,
      status: ['available', 'sold', 'rented'].includes(body.status) ? body.status : 'available',
      photos: JSON.stringify(photos),
      agent_id: parseInt(body.agent_id) || 1,
      floor_plans: JSON.stringify(Array.isArray(body.floor_plans) ? body.floor_plans : []),
      virtual_tour_url: (body.virtual_tour_url || '').toString().trim() || null,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  db.prepare('DELETE FROM properties WHERE id = ?').run(parseInt(params.id));
  return NextResponse.json({ ok: true });
}
