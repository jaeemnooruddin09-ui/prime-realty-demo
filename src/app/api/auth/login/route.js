import { NextResponse } from 'next/server';
import { checkPassword, setAdminCookie } from '@/lib/auth';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export async function POST(req) {
  const ip = clientIp(req);
  const limit = rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in a minute.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }
  const body = await req.json().catch(() => ({}));
  const password = (body.password || '').toString();
  if (!checkPassword(password)) {
    try { logAudit({ action: 'login_failed', resourceType: 'auth', resourceId: 0, details: { ip } }); } catch {}
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  setAdminCookie();
  return NextResponse.json({ ok: true });
}
