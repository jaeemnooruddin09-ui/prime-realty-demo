'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

const COOKIE_KEY = 'pr_cookie_consent';

export default function CookieConsent({ gaId }) {
  const [decision, setDecision] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(COOKIE_KEY);
      if (stored === 'accept' || stored === 'reject') {
        setDecision(stored);
      } else {
        setDecision('pending');
      }
    } catch {
      setDecision('pending');
    }
  }, []);

  function persist(choice) {
    try { window.localStorage.setItem(COOKIE_KEY, choice); } catch {}
    setDecision(choice);
  }

  return (
    <>
      {gaId && decision === 'accept' ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}

      {decision === 'pending' ? (
        <div role="dialog" aria-label="Cookie consent" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[60] bg-white border border-navy-200 shadow-2xl rounded-lg p-5">
          <div className="font-semibold text-navy-900">Cookies on this site</div>
          <p className="text-sm text-navy-600 mt-2 leading-relaxed">
            We use a small admin-session cookie when you log in, plus optional analytics cookies to help us understand how visitors use the site.
            See our <Link href="/privacy" className="text-gold-600 underline">Privacy Policy</Link>.
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <button onClick={() => persist('reject')} className="px-3 py-2 border border-navy-300 rounded text-sm font-medium hover:bg-navy-50">Essential only</button>
            <button onClick={() => persist('accept')} className="px-3 py-2 bg-navy-900 text-white rounded text-sm font-semibold hover:bg-navy-800">Accept all</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
