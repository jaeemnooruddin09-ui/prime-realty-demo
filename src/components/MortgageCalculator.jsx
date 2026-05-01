'use client';
import { useMemo, useState } from 'react';

export default function MortgageCalculator({ price = 500000, rate = 6.5, defaultTerm = 30, defaultDownPct = 20 }) {
  const [homePrice, setHomePrice] = useState(price);
  const [downPct, setDownPct] = useState(defaultDownPct);
  const [years, setYears] = useState(defaultTerm);

  const result = useMemo(() => {
    const principal = homePrice - (homePrice * downPct) / 100;
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    if (principal <= 0 || months <= 0) return { monthly: 0, total: 0, interest: 0, principal: 0 };
    const monthly = monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const total = monthly * months;
    return { monthly, total, interest: total - principal, principal };
  }, [homePrice, downPct, years, rate]);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  function clampDown(v) {
    const n = parseFloat(v);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  return (
    <div className="bg-white border border-navy-100 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-navy-900">Mortgage calculator</h3>
          <p className="text-xs text-navy-500">Estimate your monthly payment.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="label">Home price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500">$</span>
            <input type="number" min="0" step="1000" value={homePrice} onChange={(e) => setHomePrice(Math.max(0, parseInt(e.target.value) || 0))} className="input !pl-8" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="label !mb-0">Down payment</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={downPct}
                onChange={(e) => setDownPct(clampDown(e.target.value))}
                className="w-20 border border-navy-200 rounded-md px-2 py-1.5 text-navy-900 text-right text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
              <span className="text-sm text-navy-700 font-medium">%</span>
            </div>
          </div>
          <input type="range" min="0" max="50" step="0.5" value={downPct} onChange={(e) => setDownPct(parseFloat(e.target.value))} className="w-full mt-2" />
          <div className="text-sm text-navy-500 mt-1">{fmt((homePrice * downPct) / 100)}</div>
        </div>

        <div>
          <label className="label">Loan term</label>
          <div className="grid grid-cols-4 gap-2">
            {[10, 15, 20, 30].map(y => (
              <button
                key={y}
                type="button"
                onClick={() => setYears(y)}
                className={`py-2 rounded-md text-sm font-semibold transition ${years === y ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-700 hover:bg-navy-100'}`}
              >
                {y} yr
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-navy-50 rounded-md px-4 py-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-navy-500">Interest rate</div>
            <div className="text-xs text-navy-400 mt-0.5">Set by our agency, current market rate.</div>
          </div>
          <div className="font-display text-2xl font-semibold text-navy-900">{rate.toFixed(2)}%</div>
        </div>
      </div>

      <div className="mt-6 bg-navy-50 rounded-lg p-5">
        <div className="text-center sm:text-left pb-4 sm:pb-5 border-b border-navy-200">
          <div className="text-xs uppercase tracking-wider text-navy-500">Estimated monthly payment</div>
          <div className="font-display text-3xl sm:text-4xl font-semibold text-navy-900 mt-1">{fmt(result.monthly)}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-navy-500">Total interest</div>
            <div className="font-display text-xl font-semibold text-navy-900 mt-1 break-words">{fmt(result.interest)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-navy-500">Total payable</div>
            <div className="font-display text-xl font-semibold text-navy-900 mt-1 break-words">{fmt(result.total)}</div>
          </div>
        </div>
      </div>
      <p className="text-xs text-navy-400 mt-3">Estimate only. Excludes taxes, insurance, HOA fees. Confirm with your lender.</p>
    </div>
  );
}
