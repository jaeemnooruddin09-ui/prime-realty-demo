'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function del() {
    if (!confirm('Delete this property? This cannot be undone.')) return;
    setLoading(true);
    const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert('Could not delete.');
  }

  return (
    <button onClick={del} disabled={loading} className="text-red-600 hover:underline font-semibold text-sm">
      {loading ? '...' : 'Delete'}
    </button>
  );
}
