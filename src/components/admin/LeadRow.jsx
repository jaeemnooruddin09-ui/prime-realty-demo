'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LEAD_STATUSES, leadStatusColor } from '@/lib/audit';

export default function LeadRow({ lead, agents = [] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(lead.notes || '');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [open, setOpen] = useState(false);

  async function patch(payload) {
    setSaving(true);
    const r = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (r.ok) {
      setSavedAt(Date.now());
      router.refresh();
    } else {
      const j = await r.json().catch(() => ({}));
      alert(j.error || 'Could not update lead.');
    }
  }

  return (
    <div className="bg-white border border-navy-100 rounded-lg p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="font-semibold text-navy-900 text-lg">{lead.name}</div>
          <div className="text-sm text-navy-500 mt-0.5">
            <a href={`mailto:${lead.email}`} className="hover:text-gold-500">{lead.email}</a>
            {lead.phone ? <> · <a href={`tel:${lead.phone}`} className="hover:text-gold-500">{lead.phone}</a></> : null}
          </div>
          <div className="text-xs text-navy-400 mt-1">
            Submitted {new Date(lead.enquiry_created_at * 1000).toLocaleString()}
            {' · '}Last updated {new Date(lead.updated_at * 1000).toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={lead.status}
            onChange={(e) => patch({ status: e.target.value })}
            disabled={saving}
            className={`text-xs font-semibold px-2 py-1.5 rounded border-0 ${leadStatusColor(lead.status)}`}
          >
            {LEAD_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>

          <select
            value={lead.assigned_agent_id || ''}
            onChange={(e) => patch({ assigned_agent_id: e.target.value || null })}
            disabled={saving}
            className="text-xs font-semibold px-2 py-1.5 rounded bg-navy-50 text-navy-700 border-0"
          >
            <option value="">Unassigned</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      <p className="mt-3 text-navy-700 whitespace-pre-line line-clamp-3">{lead.message}</p>

      <div className="mt-3 flex items-center gap-3 text-sm flex-wrap">
        {lead.property_slug ? (
          <Link href={`/properties/${lead.property_slug}`} className="text-navy-600 hover:text-gold-500">Re: {lead.property_title}</Link>
        ) : (
          <span className="text-navy-500">General contact form</span>
        )}
        <button type="button" onClick={() => setOpen(o => !o)} className="ml-auto text-sm text-navy-600 hover:text-gold-500">
          {open ? 'Hide notes' : 'Notes & actions'}
        </button>
      </div>

      {open ? (
        <div className="mt-4 pt-4 border-t border-navy-100">
          <label className="label">Internal notes</label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did the agent learn from the call? Next step?"
            className="input"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => patch({ notes })}
              disabled={saving}
              className="btn-primary !py-2 !px-4 !text-sm"
            >
              {saving ? 'Saving…' : 'Save notes'}
            </button>
            {savedAt ? <span className="text-xs text-emerald-600">Saved.</span> : null}
            <a href={`mailto:${lead.email}`} className="ml-auto btn-outline !py-2 !px-4 !text-sm">Reply by email</a>
            {lead.phone ? <a href={`tel:${lead.phone}`} className="btn-outline !py-2 !px-4 !text-sm">Call</a> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
