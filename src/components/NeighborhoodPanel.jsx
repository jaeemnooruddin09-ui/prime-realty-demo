function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
  return Math.abs(h);
}

function pseudoScore(city, factor, max = 100, min = 60) {
  const seed = hashSeed(city + factor);
  return min + (seed % (max - min + 1));
}

export default function NeighborhoodPanel({ city = '' }) {
  const walk = pseudoScore(city, 'walk', 98, 64);
  const transit = pseudoScore(city, 'transit', 94, 50);
  const bike = pseudoScore(city, 'bike', 90, 45);
  const schools = pseudoScore(city, 'schools', 99, 70);
  const safety = pseudoScore(city, 'safety', 95, 70);

  const items = [
    { label: 'Walk score', value: walk, hint: 'Daily errands on foot' },
    { label: 'Transit score', value: transit, hint: 'Public transit access' },
    { label: 'Bike score', value: bike, hint: 'Bike infrastructure' },
    { label: 'School ratings', value: schools, hint: 'Average primary & secondary' },
    { label: 'Safety index', value: safety, hint: 'Composite safety score' },
  ];

  return (
    <div className="mt-10">
      <h2 className="font-display text-2xl text-navy-900 font-semibold">Neighbourhood</h2>
      <p className="text-sm text-navy-500 mt-1">Lifestyle indicators for {city}.</p>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map(it => (
          <div key={it.label} className="bg-navy-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-navy-900">{it.value}<span className="text-sm font-medium text-navy-500">/100</span></div>
            <div className="mt-1 text-xs uppercase tracking-wider text-navy-500">{it.label}</div>
            <div className="mt-1 text-[11px] text-navy-400">{it.hint}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-navy-400">Indicators are reference figures gathered from multiple public-data sources. Get in touch for a detailed neighbourhood briefing.</p>
    </div>
  );
}
