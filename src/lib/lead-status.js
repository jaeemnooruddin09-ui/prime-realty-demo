export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'viewing', 'offer', 'won', 'lost'];

export function leadStatusColor(status) {
  return {
    new: 'bg-sky-100 text-sky-800',
    contacted: 'bg-indigo-100 text-indigo-800',
    qualified: 'bg-violet-100 text-violet-800',
    viewing: 'bg-amber-100 text-amber-800',
    offer: 'bg-orange-100 text-orange-800',
    won: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-rose-100 text-rose-800',
  }[status] || 'bg-navy-100 text-navy-700';
}
