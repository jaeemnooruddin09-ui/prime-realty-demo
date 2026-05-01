'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SortSelect({ value }) {
  const router = useRouter();
  const sp = useSearchParams();

  function change(e) {
    const params = new URLSearchParams(sp.toString());
    params.set('sort', e.target.value);
    params.delete('page');
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort" className="text-sm font-medium text-navy-700">Sort by</label>
      <select id="sort" value={value} onChange={change} className="input !py-2 !text-sm w-auto">
        <option value="newest">Newest first</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
    </div>
  );
}
