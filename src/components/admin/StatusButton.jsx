'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StatusButton({ id, status }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(newStatus) {
    setLoading(true);
    const res = await fetch(`/api/properties/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert('Could not update status.');
  }

  const colors = {
    available: 'bg-emerald-100 text-emerald-700',
    sold: 'bg-red-100 text-red-700',
    rented: 'bg-purple-100 text-purple-700',
    draft: 'bg-amber-100 text-amber-700',
  };

  return (
    <select disabled={loading} value={status} onChange={(e) => update(e.target.value)} className={`text-xs font-semibold px-2 py-1 rounded ${colors[status] || 'bg-navy-100 text-navy-700'} border-0`}>
      <option value="draft">Draft</option>
      <option value="available">Available</option>
      <option value="sold">Sold</option>
      <option value="rented">Rented</option>
    </select>
  );
}
