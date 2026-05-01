'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { CURRENCIES, DEFAULT_RATES, LANGUAGES, formatPrice as fmtBase } from '@/lib/site';
import { getDict } from '@/lib/i18n';

const LocaleContext = createContext(null);

export function LocaleProvider({ children, exchangeRates }) {
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const rates = { ...DEFAULT_RATES, ...(exchangeRates || {}) };

  useEffect(() => {
    try {
      const l = localStorage.getItem('lang');
      const c = localStorage.getItem('currency');
      if (l && LANGUAGES[l]) setLang(l);
      if (c && CURRENCIES[c]) setCurrency(c);
    } catch {}
  }, []);

  function changeLang(l) {
    if (!LANGUAGES[l]) return;
    setLang(l);
    try { localStorage.setItem('lang', l); } catch {}
  }
  function changeCurrency(c) {
    if (!CURRENCIES[c]) return;
    setCurrency(c);
    try { localStorage.setItem('currency', c); } catch {}
  }

  const dict = getDict(lang);
  const rate = rates[currency] || 1;
  function formatPrice(amount, listingType = 'buy') {
    return fmtBase(amount, listingType, currency, rate);
  }

  return (
    <LocaleContext.Provider value={{ lang, currency, dict, rate, changeLang, changeCurrency, formatPrice }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      lang: 'en', currency: 'USD', dict: getDict('en'), rate: 1,
      changeLang: () => {}, changeCurrency: () => {},
      formatPrice: (a, l) => fmtBase(a, l, 'USD', 1),
    };
  }
  return ctx;
}
