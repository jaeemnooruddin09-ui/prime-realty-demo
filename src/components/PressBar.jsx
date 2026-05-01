const PRESS = [
  { name: 'Financial Times', label: 'FINANCIAL TIMES' },
  { name: 'The Wall Street Journal', label: 'WSJ.' },
  { name: 'Bloomberg', label: 'Bloomberg' },
  { name: 'Robb Report', label: 'ROBB REPORT' },
  { name: 'Mansion Global', label: 'Mansion Global' },
  { name: 'Architectural Digest', label: 'AD' },
];

export default function PressBar({ headline = 'As featured in' }) {
  return (
    <section className="bg-white border-y border-navy-100">
      <div className="container-x py-10">
        <div className="text-center text-xs uppercase tracking-[0.2em] text-navy-500 font-semibold mb-6">{headline}</div>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-5 opacity-80">
          {PRESS.map(p => (
            <span key={p.name} title={p.name} className="font-display text-xl text-navy-900 font-semibold whitespace-nowrap">{p.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
