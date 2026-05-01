'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DuplicateButton({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function duplicate() {
    if (!confirm('Create a draft copy of this property?')) return;
    setLoading(true);
    const r = await fetch(`/api/properties/${id}/duplicate`, { method: 'POST' });
    setLoading(false);
    if (r.ok) {
      const j = await r.json();
      router.push(`/admin/properties/${j.id}`);
    } else {
      const j = await r.json().catch(() => ({}));
      alert(j.error || 'Could not duplicate.');
    }
  }

  return (
    <button onClick={duplicate} disabled={loading} className="text-navy-700 hover:text-gold-500 font-semibold mr-3 disabled:opacity-50">
      {loading ? 'Copying…' : 'Duplicate'}
    </button>
  );
}
