import { NextResponse } from 'next/server';
import { setSetting } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { SETTING_KEYS } from '@/lib/settings';

const ALLOWED = new Set(SETTING_KEYS);

const NUMERIC_BOUNDS = {
  mortgage_rate: { min: 0, max: 30, decimals: 3 },
  mortgage_default_term: { min: 1, max: 50, decimals: 0 },
  mortgage_default_down_pct: { min: 0, max: 100, decimals: 2 },
  years_in_business: { min: 0, max: 200, decimals: 0 },
  properties_sold: { min: 0, max: 1_000_000, decimals: 0 },
  happy_clients: { min: 0, max: 1_000_000, decimals: 0 },
};

const JSON_KEYS = new Set(['offices_json', 'social_json', 'exchange_rates_json']);

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const updates = {};
  const errors = [];

  for (const [k, raw] of Object.entries(body)) {
    if (!ALLOWED.has(k)) continue;

    if (NUMERIC_BOUNDS[k]) {
      const n = parseFloat(raw);
      const b = NUMERIC_BOUNDS[k];
      if (!Number.isFinite(n) || n < b.min || n > b.max) {
        errors.push(`${k} must be between ${b.min} and ${b.max}.`);
        continue;
      }
      updates[k] = n.toFixed(b.decimals);
    } else if (JSON_KEYS.has(k)) {
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        updates[k] = JSON.stringify(parsed);
      } catch {
        errors.push(`${k} must be valid JSON.`);
      }
    } else {
      const s = raw == null ? '' : String(raw).trim();
      updates[k] = s;
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid settings provided.' }, { status: 400 });
  }

  Object.entries(updates).forEach(([k, v]) => setSetting(k, v));
  return NextResponse.json({ ok: true, count: Object.keys(updates).length });
}
