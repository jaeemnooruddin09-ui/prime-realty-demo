const FRIENDLY_DEFAULT = 'Something went wrong. Please try again in a moment.';
const FRIENDLY_RATE_LIMIT = 'Too many requests. Please wait a moment and try again.';
const FRIENDLY_NETWORK = 'We could not reach the server. Please check your connection and try again.';

export async function readSafeError(res, fallback = FRIENDLY_DEFAULT) {
  if (!res) return FRIENDLY_NETWORK;
  if (res.status === 429) return FRIENDLY_RATE_LIMIT;
  if (res.status === 400) {
    try {
      const j = await res.clone().json();
      const msg = typeof j?.error === 'string' ? j.error.trim() : '';
      if (msg && msg.length <= 200) return msg;
    } catch {}
  }
  return fallback;
}

export function networkErrorMessage() {
  return FRIENDLY_NETWORK;
}
