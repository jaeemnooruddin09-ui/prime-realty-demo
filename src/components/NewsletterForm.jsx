'use client';
import { useState } from 'react';
import { readSafeError, networkErrorMessage } from '@/lib/safe-error';

export default function NewsletterForm({ source = 'newsletter', placeholder = 'Your email', cta = 'Subscribe', className = '' }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function submit(e) {
    e.preventDefault();
    setState({ status: 'loading', message: '' });
    let r;
    try {
      r = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
    } catch {
      setState({ status: 'error', message: networkErrorMessage() });
      return;
    }
    if (!r.ok) {
      setState({ status: 'error', message: await readSafeError(r, 'Could not save your subscription. Please try again.') });
      return;
    }
    let data = {};
    try { data = await r.json(); } catch {}
    setState({ status: 'ok', message: data.message || 'You are subscribed.' });
    setEmail('');
  }

  return (
    <form onSubmit={submit} className={className}>
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="input flex-1 min-w-0"
          disabled={state.status === 'loading'}
        />
        <button type="submit" disabled={state.status === 'loading'} className="btn-gold whitespace-nowrap disabled:opacity-60">
          {state.status === 'loading' ? 'Subscribing…' : cta}
        </button>
      </div>
      {state.message ? (
        <p className={`text-sm mt-2 ${state.status === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
