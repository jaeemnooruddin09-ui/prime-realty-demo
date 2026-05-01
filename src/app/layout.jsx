import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LocaleProvider } from '@/components/LocaleProvider';
import { getSiteSettings } from '@/lib/settings';
import LiveChatWidget from '@/components/LiveChatWidget';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://primerealty.example';

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
        </LocaleProvider>
      </body>
    </html>
  );
}
