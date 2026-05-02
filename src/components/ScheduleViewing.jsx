'use client';
import { useMemo, useState } from 'react';
import { readSafeError, networkErrorMessage } from '@/lib/safe-error';

function nextDays(n) {
  const out = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 1; i <= n; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(d);
  }
  return out;
}

const SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];

export default function ScheduleViewing({ propertyId, agentName, onSent }) {
  const days = useMemo(() => nextDays(10), []);
  const [day, setDay] = useState(days[0]);
  const [slot, setSlot] = useState('14:30');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function submit(e) {
    e.preventDefault();
    setState({ status: 'loading', message: '' });
    const dateStr = day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const message = `Viewing request for ${dateStr} at ${slot}. Submitted via the schedule-a-viewing widget.`;
    let r;
    try {
      r = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message, property_id: propertyId }),
      });
    } catch {
      setState({ status: 'error', message: networkErrorMessage() });
      return;
    }
    if (!r.ok) {
      setState({ status: 'error', message: await readSafeError(r, 'Could not send your viewing request. Please try again.') });
      return;
    }
    setState({ status: 'ok', message: `Thanks. ${agentName ? agentName + ' will' : 'Our team will'} confirm within one business day.` });
    setName(''); setEmail(''); setPhone('');
    onSent?.();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Pick a day</label>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {days.map(d => {
            const active = d.toDateString() === day.toDateString();
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => setDay(d)}
                className={`flex-shrink-0 px-3 py-2 rounded-md text-center min-w-[64px] ${active ? 'bg-navy-900 text-white' : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50'}`}
              >
                <div className="text-[11px] uppercase tracking-wider opacity-80">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="font-semibold">{d.getDate()}</div>
                <div className="text-[10px] opacity-70">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="label">Pick a time</label>
        <div className="grid grid-cols-3 gap-2">
          {SLOTS.map(s => {
            const active = s === slot;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={`py-2 rounded-md text-sm font-semibold ${active ? 'bg-gold-400 text-navy-950' : 'bg-white border border-navy-200 text-navy-700 hover:bg-navy-50'}`}
              >{s}</button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="input" />
      </div>

      <button disabled={state.status === 'loading'} className="btn-gold w-full">
        {state.status === 'loading' ? 'Sending…' : 'Request this viewing'}
      </button>
      {state.message ? <p className={`text-sm ${state.status === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>{state.message}</p> : null}
    </form>
  );
}
