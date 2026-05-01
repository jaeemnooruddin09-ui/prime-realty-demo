import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { PROPERTY_TYPES } from '@/lib/site';
import { logAudit } from '@/lib/audit';

function makeSlug(s) {
  return s.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const required = ['title', 'description', 'price', 'type', 'bedrooms', 'bathrooms', 'size_sqft', 'address', 'city'];
    for (const k of required) {
      if (!body[k] && body[k] !== 0) return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
    }
    if (!PROPERTY_TYPES.includes(body.type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    const photos = Array.isArray(body.photos) ? body.photos : [];
    if (photos.length === 0) return NextResponse.json({ error: 'At least one photo required' }, { status: 400 });
    const slug = body.slug ? makeSlug(body.slug) : makeSlug(body.title) + '-' + Date.now().toString(36);
    const db = getDb();
    const r = db.prepare(`
      INSERT INTO properties (slug, title, description, price, type, listing_type, bedrooms, bathrooms, size_sqft, address, city, lat, lng, featured, status, photos, agent_id, floor_plans, virtual_tour_url)
      VALUES (@slug, @title, @description, @price, @type, @listing_type, @bedrooms, @bathrooms, @size_sqft, @address, @city, @lat, @lng, @featured, @status, @photos, @agent_id, @floor_plans, @virtual_tour_url)
    `).run({
      slug,
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
      status: ['available', 'sold', 'rented', 'draft'].includes(body.status) ? body.status : 'available',
      photos: JSON.stringify(photos),
      agent_id: parseInt(body.agent_id) || 1,
      floor_plans: JSON.stringify(Array.isArray(body.floor_plans) ? body.floor_plans : []),
      virtual_tour_url: (body.virtual_tour_url || '').toString().trim() || null,
    });
    logAudit({ action: 'property_create', resourceType: 'property', resourceId: r.lastInsertRowid, details: { slug, title: body.title, status: body.status } });
    return NextResponse.json({ ok: true, id: r.lastInsertRowid, slug });
  } catch (err) {
    console.error('[properties:post]', err);
    return NextResponse.json({ error: 'Could not create property.' }, { status: 500 });
  }
}
