'use client';
import { useEffect, useState } from 'react';

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          className={`transition ${n <= value ? 'text-gold-500' : 'text-navy-200'} ${onChange ? 'hover:text-gold-400 cursor-pointer' : 'cursor-default'}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function timeAgo(unixSeconds) {
  const diff = Math.max(0, Math.floor(Date.now() / 1000 - unixSeconds));
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CustomerComments() {
  const [comments, setComments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function load() {
    try {
      const res = await fetch('/api/comments', { cache: 'no-store' });
      const j = await res.json();
      setComments(j.comments || []);
    } catch {
      // leave list empty if fetch fails
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, rating, message }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Could not post comment.');
      setComments(prev => [j.comment, ...prev]);
      setName('');
      setLocation('');
      setRating(5);
      setMessage('');
      setStatus('sent');
      setTimeout(() => setStatus('idle'), 3500);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  return (
    <section className="bg-white border-b border-navy-100">
      <div className="container-x py-16">
        <div className="text-center mb-10">
          <div className="text-sm uppercase tracking-wider text-gold-600 font-semibold">Share your experience</div>
          <h2 className="font-display text-3xl md:text-4xl text-navy-900 font-semibold mt-2">Customer comments</h2>
          <p className="text-navy-600 mt-3 max-w-2xl mx-auto">Worked with one of our agents, viewed a property, or just want to share a thought? Leave a comment below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <form onSubmit={submit} className="lg:col-span-2 bg-navy-50 border border-navy-100 rounded-lg p-6 h-fit">
            <h3 className="font-display text-xl text-navy-900 font-semibold mb-4">Leave a comment</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Your name</label>
                <input required value={name} onChange={e => setName(e.target.value)} maxLength={80} className="input" />
              </div>
              <div>
                <label className="label">Where are you based <span className="text-navy-400 font-normal">(optional)</span></label>
                <input value={location} onChange={e => setLocation(e.target.value)} maxLength={80} className="input" placeholder="e.g. Brooklyn, NY" />
              </div>
              <div>
                <label className="label">Your rating</label>
                <Stars value={rating} onChange={setRating} />
              </div>
              <div>
                <label className="label">Comment</label>
                <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={4} maxLength={1500} className="input" placeholder="What did you think?" />
              </div>
              <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
                {status === 'sending' ? 'Posting...' : 'Post comment'}
              </button>
              {status === 'sent' ? <div className="text-sm text-emerald-700">Thanks. Your comment is now live below.</div> : null}
              {error ? <div className="text-sm text-red-600">{error}</div> : null}
            </div>
          </form>

          <div className="lg:col-span-3 space-y-4">
            {!loaded ? (
              <div className="text-navy-500 text-sm">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="bg-navy-50 border border-dashed border-navy-200 rounded-lg p-8 text-center text-navy-600">
                No comments yet. Be the first to share your thoughts.
              </div>
            ) : (
              comments.map(c => (
                <article key={c.id} className="bg-white border border-navy-100 rounded-lg p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-navy-900">{c.name}</div>
                      {c.location ? <div className="text-xs text-navy-500">{c.location}</div> : null}
                    </div>
                    <Stars value={c.rating} />
                  </div>
                  <p className="mt-3 text-navy-700 leading-relaxed whitespace-pre-line">{c.message}</p>
                  <div className="mt-3 text-xs text-navy-400">{timeAgo(c.created_at)}</div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
