import { NextResponse } from 'next/server';
import { checkPassword, setAdminCookie } from '@/lib/auth';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const password = (body.password || '').toString();
  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  setAdminCookie();
  return NextResponse.json({ ok: true });
}
