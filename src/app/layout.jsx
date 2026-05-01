import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LocaleProvider } from '@/components/LocaleProvider';
import { getSiteSettings } from '@/lib/settings';
import LiveChatWidget from '@/components/LiveChatWidget';
import CookieConsent from '@/components/CookieConsent';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://primeforge-homes.demo';

export async function generateMetadata() {
  const s = getSiteSettings();
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: s.seo.title,
      template: `%s | ${s.name}`,
    },
    description: s.seo.description,
    openGraph: {
      siteName: s.name,
      type: 'website',
      locale: 'en_US',
      images: s.seo.ogImage ? [{ url: s.seo.ogImage }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
    icons: s.logoUrl ? { icon: s.logoUrl } : undefined,
    manifest: '/manifest.json',
  };
}

export default function RootLayout({ children }) {
  if (process.env.MAINTENANCE_MODE === '1') {
    return (
      <html lang="en">
        <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: '4rem 1.5rem', textAlign: 'center', color: '#0b1322', background: '#ffffff' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: '#a07a1f', fontWeight: 600 }}>Scheduled maintenance</div>
            <h1 style={{ fontSize: '2.25rem', margin: '0.75rem 0 0.5rem' }}>We will be back shortly.</h1>
            <p style={{ color: '#4a5568', lineHeight: 1.6 }}>The site is briefly unavailable while we make improvements. Thank you for your patience.</p>
          </div>
        </body>
      </html>
    );
  }
  const s = getSiteSettings();
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: s.name,
    description: `Boutique real estate agency operating for ${s.yearsInBusiness}+ years.`,
    url: BASE_URL,
    telephone: s.phone,
    email: s.email,
    address: { '@type': 'PostalAddress', streetAddress: s.address },
  };

  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <LocaleProvider exchangeRates={s.exchangeRates}>
          <Navbar brand={{ name: s.name, logoUrl: s.logoUrl, phone: s.phone }} />
          <main>{children}</main>
          <Footer settings={s} />
          <LiveChatWidget />
          <CookieConsent gaId={process.env.NEXT_PUBLIC_GA_ID} />
        </LocaleProvider>
      </body>
    </html>
  );
}
