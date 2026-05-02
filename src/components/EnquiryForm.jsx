'use client';
import { useState } from 'react';
import { readSafeError, networkErrorMessage } from '@/lib/safe-error';

export default function EnquiryForm({ propertyId = null, agentName = 'us' }) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    if (propertyId) data.property_id = propertyId;
    let res;
    try {
      res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      setStatus('error');
      setError(networkErrorMessage());
      return;
    }
    if (!res.ok) {
      setStatus('error');
      setError(await readSafeError(res, 'Could not send your enquiry. Please try again.'));
      return;
    }
    setStatus('sent');
    e.target.reset();
  }

  if (status === 'sent') {
    return (
      <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded p-4 text-emerald-800">
        Thanks. {agentName} has been notified and will be in touch shortly.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div>
        <label className="label">Your name</label>
        <input required name="name" className="input" />
      </div>
      <div>
        <label className="label">Email</label>
        <input required type="email" name="email" className="input" />
      </div>
      <div>
        <label className="label">Phone</label>
        <input name="phone" className="input" />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea required name="message" rows="4" className="input" placeholder={propertyId ? "I'd like to schedule a viewing..." : "How can we help?"} />
      </div>
      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
        {status === 'sending' ? 'Sending...' : 'Send enquiry'}
      </button>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </form>
  );
}
