import { cookies } from 'next/headers';
import crypto from 'crypto';
import { SITE } from './site';

const COOKIE_NAME = 'pr_admin';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || `pr-fallback-${SITE.adminPassword}`;
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

function makeToken() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const nonce = crypto.randomBytes(16).toString('base64url');
  const payload = `${expires}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [expiresStr, nonce, signature] = parts;
  const payload = `${expiresStr}.${nonce}`;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;
  const expires = parseInt(expiresStr, 10);
  if (!Number.isFinite(expires) || expires <= Math.floor(Date.now() / 1000)) return false;
  return true;
}

export function setAdminCookie() {
  cookies().set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAdminCookie() {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function isAdmin() {
  const value = cookies().get(COOKIE_NAME)?.value;
  return verifyToken(value);
}

export function checkPassword(pw) {
  const expected = String(SITE.adminPassword || '');
  const provided = String(pw || '');
  const a = Buffer.from(expected.padEnd(64, '\0'));
  const b = Buffer.from(provided.padEnd(64, '\0'));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b) && expected.length === provided.length;
}
