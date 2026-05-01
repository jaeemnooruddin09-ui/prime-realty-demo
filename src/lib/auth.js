import { cookies } from 'next/headers';
import { SITE } from './site';

const COOKIE_NAME = 'pr_admin';

export function setAdminCookie() {
  cookies().set(COOKIE_NAME, '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminCookie() {
  cookies().set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export function isAdmin() {
  return cookies().get(COOKIE_NAME)?.value === '1';
}

export function checkPassword(pw) {
  return pw === SITE.adminPassword;
}
