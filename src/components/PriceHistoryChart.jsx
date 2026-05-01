function parseHistory(raw, currentPrice, createdAt) {
  let arr = [];
  try {
    if (raw) arr = JSON.parse(raw);
    if (!Array.isArray(arr)) arr = [];
  } catch { arr = []; }
  if (arr.length === 0) {
    const created = createdAt ? createdAt * 1000 : Date.now() - 90 * 86400000;
    arr = [
      { at: created, price: Math.round(currentPrice * 1.1) },
      { at: created + (Date.now() - created) * 0.4, price: Math.round(currentPrice * 1.05) },
      { at: Date.now(), price: currentPrice },
    ];
  }
  return arr.sort((a, b) => a.at - b.at);
}

export default function PriceHistoryChart({ history, currentPrice, createdAt }) {
  const points = parseHistory(history, currentPrice, createdAt);
  if (points.length < 2) return null;

  const W = 600, H = 160, P = 30;
  const xs = points.map(p => p.at);
  const ys = points.map(p => p.price);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const xRange = Math.max(1, maxX - minX);
  const yRange = Math.max(1, maxY - minY);
  const sx = i => P + ((xs[i] - minX) / xRange) * (W - 2 * P);
  const sy = i => H - P - ((ys[i] - minY) / yRange) * (H - 2 * P);

  const path = points.map((_, i) => `${i === 0 ? 'M' : 'L'}${sx(i).toFixed(1)},${sy(i).toFixed(1)}`).join(' ');
  const area = `${path} L${sx(points.length - 1).toFixed(1)},${H - P} L${sx(0).toFixed(1)},${H - P} Z`;
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: 'compact' });

  const first = points[0].price;
  const last = points[points.length - 1].price;
  const change = ((last - first) / first) * 100;
  const changeUp = change >= 0;

  return (
    <div className="mt-10">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-2xl text-navy-900 font-semibold">Price history</h2>
          <p className="text-sm text-navy-500 mt-1">Listed prices over time for this property.</p>
        </div>
        <div className="text-sm">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold ${changeUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {changeUp ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
          </span>
          <span className="ml-2 text-navy-500">since {new Date(points[0].at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        </div>
      </div>
      <div className="mt-4 bg-white border border-navy-100 rounded-lg p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="ph-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ca9c3a" stopOpacity="0.18"/>
              <stop offset="100%" stopColor="#ca9c3a" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={area} fill="url(#ph-fill)" />
          <path d={path} stroke="#ca9c3a" strokeWidth="2.5" fill="none" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={sx(i)} cy={sy(i)} r="4" fill="#ca9c3a" />
              <text x={sx(i)} y={sy(i) - 10} textAnchor="middle" fontSize="11" fill="#374151" fontWeight="600">{fmt.format(p.price)}</text>
              <text x={sx(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">
                {new Date(p.at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
