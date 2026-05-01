import { getDb } from '@/lib/db';
import CommentRow from './CommentRow';

export const dynamic = 'force-dynamic';

export default function AdminCommentsPage() {
  const db = getDb();
  const pending = db.prepare(`SELECT * FROM customer_comments WHERE approved = 0 ORDER BY created_at DESC`).all();
  const approved = db.prepare(`SELECT * FROM customer_comments WHERE approved = 1 ORDER BY created_at DESC LIMIT 50`).all();

  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-navy-900">Customer comments</h1>
      <p className="text-navy-500 mt-1">Review submissions before they appear on the homepage.</p>

      <section className="mt-8">
        <h2 className="font-display text-xl text-navy-900 font-semibold mb-3">Pending review ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="bg-navy-50 border border-dashed border-navy-200 rounded p-6 text-navy-600 text-sm">No pending comments right now.</div>
        ) : (
          <div className="space-y-3">{pending.map(c => <CommentRow key={c.id} comment={c} />)}</div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-navy-900 font-semibold mb-3">Approved ({approved.length})</h2>
        {approved.length === 0 ? (
          <div className="bg-navy-50 border border-dashed border-navy-200 rounded p-6 text-navy-600 text-sm">Nothing approved yet.</div>
        ) : (
          <div className="space-y-3">{approved.map(c => <CommentRow key={c.id} comment={c} />)}</div>
        )}
      </section>
    </>
  );
}
