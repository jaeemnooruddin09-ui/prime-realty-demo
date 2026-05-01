'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Could not log in.');
    }
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center py-12">
      <form onSubmit={submit} className="bg-white border border-navy-100 rounded-lg p-8 max-w-md w-full">
        <h1 className="font-display text-3xl font-semibold text-navy-900">Admin login</h1>
        <p className="text-sm text-navy-500 mt-1">Enter the admin password to manage listings.</p>
        <div className="mt-6">
          <label className="label">Password</label>
          <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
        <button type="submit" disabled={loading} className="btn-primary w-full mt-5">{loading ? 'Signing in...' : 'Sign in'}</button>
        <p className="text-xs text-navy-400 mt-4 text-center">Default password: <code className="bg-navy-50 px-1 rounded">admin123</code>. Change it via the ADMIN_PASSWORD env var.</p>
      </form>
    </section>
  );
}
