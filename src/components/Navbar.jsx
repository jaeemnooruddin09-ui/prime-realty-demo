'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from './LocaleProvider';
import LocaleSwitcher from './LocaleSwitcher';
import SavedNavBadge from './SavedNavBadge';

export default function Navbar({ brand = {} }) {
  const [open, setOpen] = useState(false);
  const { dict } = useLocale();
  const logoUrl = brand.logoUrl || '/brand/logo-transparent.png';
  const name = brand.name || 'PrimeForge Homes';
  const phone = brand.phone || '';

  return (
    <header className="bg-white border-b border-navy-100 sticky top-0 z-40">
      <div className="container-x flex items-center justify-between h-16 sm:h-20 gap-3">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt={name} className="h-14 sm:h-16 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-navy-700">
          <Link href="/" className="hover:text-gold-500">{dict.nav.home}</Link>
          <Link href="/properties" className="hover:text-gold-500">{dict.nav.properties}</Link>
          <Link href="/agents" className="hover:text-gold-500">{dict.nav.agents}</Link>
          <Link href="/open-houses" className="hover:text-gold-500">Open houses</Link>
          <Link href="/blog" className="hover:text-gold-500">Insights</Link>
          <Link href="/about" className="hover:text-gold-500">{dict.nav.about}</Link>
          <Link href="/contact" className="hover:text-gold-500">{dict.nav.contact}</Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <SavedNavBadge />
          <LocaleSwitcher />
          <Link href="/properties" className="btn-gold !py-2 !px-4 text-sm">{dict.nav.browse}</Link>
        </div>

        <div className="md:hidden flex items-center gap-1">
          <SavedNavBadge />
          <LocaleSwitcher />
          <button onClick={() => setOpen(o => !o)} aria-label={dict.nav.menu} className="w-10 h-10 flex items-center justify-center text-navy-900">
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div className="md:hidden border-t border-navy-100 bg-white">
          <nav className="container-x py-4 flex flex-col gap-1 text-navy-700 font-medium">
            <Link href="/" onClick={() => setOpen(false)} className="py-2 hover:text-gold-500">{dict.nav.home}</Link>
            <Link href="/properties" onClick={() => setOpen(false)} className="py-2 hover:text-gold-500">{dict.nav.properties}</Link>
            <Link href="/agents" onClick={() => setOpen(false)} className="py-2 hover:text-gold-500">{dict.nav.agents}</Link>
            <Link href="/open-houses" onClick={() => setOpen(false)} className="py-2 hover:text-gold-500">Open houses</Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="py-2 hover:text-gold-500">Insights</Link>
            <Link href="/about" onClick={() => setOpen(false)} className="py-2 hover:text-gold-500">{dict.nav.about}</Link>
            <Link href="/faq" onClick={() => setOpen(false)} className="py-2 hover:text-gold-500">FAQ</Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="py-2 hover:text-gold-500">{dict.nav.contact}</Link>
            <Link href="/favorites" onClick={() => setOpen(false)} className="py-2 hover:text-gold-500">Saved properties</Link>
            <Link href="/compare" onClick={() => setOpen(false)} className="py-2 hover:text-gold-500">Compare</Link>
            {phone ? (
              <a href={`tel:${phone}`} className="mt-3 flex items-center gap-2 py-2 text-navy-700 font-medium">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {phone}
              </a>
            ) : null}
            <Link href="/properties" onClick={() => setOpen(false)} className="btn-gold mt-2">{dict.nav.browse}</Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
