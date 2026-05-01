'use client';

const KEYS = {
  favorites: 'pr_favorites',
  recent: 'pr_recent',
  compare: 'pr_compare',
};

export const FAVORITES_KEY = KEYS.favorites;
export const RECENT_KEY = KEYS.recent;
export const COMPARE_KEY = KEYS.compare;

export const COMPARE_MAX = 4;
export const RECENT_MAX = 8;

function read(key) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(n => Number.isFinite(Number(n))).map(Number) : [];
  } catch {
    return [];
  }
}

function write(key, ids) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(`storage:${key}`, { detail: ids }));
  } catch {
    /* quota or privacy mode */
  }
}

export function getList(key) { return read(key); }
export function hasItem(key, id) { return read(key).includes(Number(id)); }

export function toggleItem(key, id, max = Infinity) {
  const numId = Number(id);
  const list = read(key);
  const idx = list.indexOf(numId);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.unshift(numId);
    if (list.length > max) list.length = max;
  }
  write(key, list);
  return list;
}

export function pushRecent(id) {
  const numId = Number(id);
  const list = read(RECENT_KEY).filter(x => x !== numId);
  list.unshift(numId);
  if (list.length > RECENT_MAX) list.length = RECENT_MAX;
  write(RECENT_KEY, list);
  return list;
}

export function removeItem(key, id) {
  const numId = Number(id);
  const list = read(key).filter(x => x !== numId);
  write(key, list);
  return list;
}

export function clearList(key) { write(key, []); }
