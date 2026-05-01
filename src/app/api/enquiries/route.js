import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';

export async function POST(req) {
  try {
    const body = await req.json();
    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const phone = (body.phone || '').toString().trim();
    const message = (body.message || '').toString().trim();
    const propertyId = body.property_id ? parseInt(body.property_id) : null;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO enquiries (property_id, name, email, phone, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(propertyId, name, email, phone, message);

    let assignedAgent = null;
    if (propertyId) {
      const owner = db.prepare(`SELECT agent_id FROM properties WHERE id = ?`).get(propertyId);
      if (owner) assignedAgent = owner.agent_id;
    }
    db.prepare(`
      INSERT OR IGNORE INTO leads (enquiry_id, status, assigned_agent_id)
      VALUES (?, 'new', ?)
    `).run(result.lastInsertRowid, assignedAgent);

    const notifyTo = getSiteSettings().enquiryEmail;
    if (propertyId) {
      const prop = db.prepare(`SELECT p.title, a.email as agent_email, a.name as agent_name FROM properties p JOIN agents a ON p.agent_id = a.id WHERE p.id = ?`).get(propertyId);
      console.log(`[ENQUIRY] Property "${prop?.title}" - agent ${prop?.agent_name} <${prop?.agent_email}> + admin <${notifyTo}> notified about ${name} <${email}>`);
    } else {
      console.log(`[ENQUIRY] Contact form from ${name} <${email}> -> notify <${notifyTo}>`);
    }

    return NextResponse.json({ ok: true, id: result.lastInsertRowid });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
