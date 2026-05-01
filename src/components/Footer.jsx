import Link from 'next/link';

const SOCIAL_ICONS = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
  ),
};

export default function Footer({ settings }) {
  const s = settings || {};
  const social = s.social || {};
  const offices = s.offices || [];
  const logoUrl = s.logoUrl || '/brand/logo-transparent.png';
  const name = s.name || 'Prime Realty';

  return (
    <footer className="bg-navy-950 text-navy-200 mt-24">
      <div className="container-x py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt={name} className="h-20 w-auto bg-white rounded p-2" />
          </div>
          <p className="mt-4 text-sm leading-relaxed">{s.tagline}. Helping families find homes for over {s.yearsInBusiness} years.</p>
          {Object.entries(social).filter(([, url]) => url).length > 0 ? (
            <div className="mt-5 flex items-center gap-3">
              {Object.entries(social).map(([key, url]) => (url && SOCIAL_ICONS[key]) ? (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key}
                   className="w-9 h-9 rounded-full bg-navy-900 hover:bg-gold-400 hover:text-navy-950 text-navy-200 flex items-center justify-center transition">
                  {SOCIAL_ICONS[key]}
                </a>
              ) : null)}
            </div>
          ) : null}
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/properties" className="hover:text-gold-300">All properties</Link></li>
            <li><Link href="/properties?listing_type=buy" className="hover:text-gold-300">Buy</Link></li>
            <li><Link href="/properties?listing_type=rent" className="hover:text-gold-300">Rent</Link></li>
            <li><Link href="/agents" className="hover:text-gold-300">Our agents</Link></li>
            <li><Link href="/open-houses" className="hover:text-gold-300">Open houses</Link></li>
            <li><Link href="/favorites" className="hover:text-gold-300">Saved properties</Link></li>
            <li><Link href="/saved-searches" className="hover:text-gold-300">Saved searches</Link></li>
            <li><Link href="/compare" className="hover:text-gold-300">Compare</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-gold-300">About us</Link></li>
            <li><Link href="/blog" className="hover:text-gold-300">Insights & reports</Link></li>
            <li><Link href="/faq" className="hover:text-gold-300">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-gold-300">Contact</Link></li>
            <li><Link href="/admin" className="hover:text-gold-300">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Get in touch</h4>
          <ul className="space-y-2 text-sm">
            {s.phone ? <li><a href={`tel:${s.phone}`} className="hover:text-gold-300">{s.phone}</a></li> : null}
            {s.email ? <li><a href={`mailto:${s.email}`} className="hover:text-gold-300">{s.email}</a></li> : null}
            {s.address ? <li>{s.address}</li> : null}
            {s.whatsapp ? <li><a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300">WhatsApp: +{s.whatsapp}</a></li> : null}
          </ul>
          {offices.length > 1 ? (
            <div className="mt-4 text-xs text-navy-400">{offices.length} offices worldwide.</div>
          ) : null}
        </div>
      </div>
      <div className="border-t border-navy-800">
        <div className="container-x py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-navy-400">
          <div>&copy; {new Date().getFullYear()} {name}. All rights reserved.</div>
          <div>Boutique real estate, exceptional service.</div>
        </div>
      </div>
    </footer>
  );
}
