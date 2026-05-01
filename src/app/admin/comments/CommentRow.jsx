'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommentRow({ comment }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function approve(approved) {
    setBusy(true);
    await fetch(`/api/admin/comments/${comment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm('Delete this comment? This cannot be undone.')) return;
    setBusy(true);
    await fetch(`/api/admin/comments/${comment.id}`, { method: 'DELETE' });
    setBusy(false);
    router.refresh();
  }

  const isApproved = comment.approved === 1;

  return (
    <article className="bg-white border border-navy-100 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-navy-900">{comment.name}</div>
          <div className="text-xs text-navy-500">
            {comment.location ? `${comment.location} · ` : ''}rating {comment.rating}/5 · {new Date(comment.created_at * 1000).toLocaleString()}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
          {isApproved ? 'Approved' : 'Pending'}
        </span>
      </div>
      <p className="mt-2 text-navy-700 leading-relaxed whitespace-pre-line text-sm">{comment.message}</p>
      <div className="mt-3 flex gap-2">
        {isApproved ? (
          <button disabled={busy} onClick={() => approve(0)} className="px-3 py-1.5 text-xs rounded border border-navy-200 hover:bg-navy-50 disabled:opacity-50">Unapprove</button>
        ) : (
          <button disabled={busy} onClick={() => approve(1)} className="px-3 py-1.5 text-xs rounded bg-navy-900 text-white hover:bg-navy-800 disabled:opacity-50">Approve</button>
        )}
        <button disabled={busy} onClick={remove} className="px-3 py-1.5 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button>
      </div>
    </article>
  );
}
