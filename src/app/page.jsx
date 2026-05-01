import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';
import SearchHero from '@/components/SearchHero';
import PropertyCard from '@/components/PropertyCard';
import RecentlyViewed from '@/components/RecentlyViewed';
import TestimonialsSection from '@/components/TestimonialsSection';
import PressBar from '@/components/PressBar';
import LeadMagnetSection from '@/components/LeadMagnetSection';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const s = getSiteSettings();
  const db = getDb();
  const featured = db.prepare(`SELECT * FROM properties WHERE featured = 1 AND status = 'available' ORDER BY created_at DESC LIMIT 6`).all();
  const totalCount = db.prepare(`SELECT COUNT(*) as c FROM properties`).get().c;
  const heroImage = s.hero.image;

  return (
    <>
      <section className="relative min-h-[640px] flex items-center">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/60 to-navy-950/30" />
        </div>
        <div className="container-x relative py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="text-gold-300 font-semibold tracking-widest uppercase text-sm">{s.hero.eyebrow}</div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white font-semibold leading-tight mt-3">{s.hero.headline}.</h1>
            <p className="mt-5 text-lg text-navy-100 max-w-2xl">{s.hero.subtext}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={s.hero.cta1Link || '/properties'} className="btn-gold">{s.hero.cta1Label}</Link>
              <Link href={s.hero.cta2Link || '/contact'} className="btn-outline !text-white !border-white hover:!bg-white hover:!text-navy-900">{s.hero.cta2Label}</Link>
            </div>
          </div>
          <div className="mt-12">
            <SearchHero />
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat n={`${s.yearsInBusiness}+`} label="Years in business" />
          <Stat n={`${s.propertiesSold.toLocaleString()}+`} label="Properties sold" />
          <Stat n={`${s.happyClients.toLocaleString()}+`} label="Happy clients" />
          <Stat n={`${totalCount}`} label="Active listings" />
        </div>
      </section>

      <section className="container-x py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-gold-500 font-semibold tracking-wider uppercase text-sm">Curated for you</div>
            <h2 className="font-display text-4xl text-navy-900 font-semibold mt-1">Featured Properties</h2>
          </div>
          <Link href="/properties" className="hidden sm:inline text-navy-900 font-semibold hover:text-gold-500">View all &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {featured.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      </section>

      <section className="bg-navy-950 text-white py-20 mt-16">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-gold-300 font-semibold tracking-wider uppercase text-sm">Why {s.name}</div>
            <h2 className="font-display text-4xl font-semibold mt-2">A different kind of agency.</h2>
            <p className="mt-4 text-navy-200 leading-relaxed">We are a boutique team that takes on a small number of clients each season, allowing us to give every transaction the attention it deserves. From the first viewing to the final signature, you work with the same agent: someone who knows the neighborhood, the inspectors, and the right schools.</p>
            <ul className="mt-6 space-y-3">
              {['Hand-picked listings vetted by our team', 'Local-market expertise in every city we serve', 'Transparent fees, no hidden surprises', 'Concierge service from offer to keys'].map(t => (
                <li key={t} className="flex items-start gap-3"><span className="text-gold-300 mt-0.5">&#10003;</span>{t}</li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <Link href="/about" className="btn-gold">Learn more</Link>
              <Link href="/contact" className="btn-outline !text-white !border-white hover:!bg-white hover:!text-navy-900">Talk to an agent</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=900" className="rounded-lg w-full h-72 object-cover" alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=900" className="rounded-lg w-full h-72 object-cover mt-8" alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=900" className="rounded-lg w-full h-72 object-cover -mt-8" alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=900" className="rounded-lg w-full h-72 object-cover" alt="" />
          </div>
        </div>
      </section>

      <PressBar />

      <TestimonialsSection />

      <RecentlyViewed title="Recently viewed" />

      <LeadMagnetSection />

      <section className="container-x py-20 text-center">
        <h2 className="font-display text-4xl text-navy-900 font-semibold">Ready to find your next home?</h2>
        <p className="mt-3 text-navy-600 max-w-2xl mx-auto">Whether you are looking for your first apartment, a forever family home, or a luxury investment property, our agents are here to guide you.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/properties" className="btn-primary">Browse Properties</Link>
          <Link href="/contact" className="btn-gold">Book a Viewing</Link>
        </div>
      </section>
    </>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="font-display text-4xl md:text-5xl font-semibold text-navy-900">{n}</div>
      <div className="mt-2 text-sm uppercase tracking-wider text-navy-500">{label}</div>
    </div>
  );
}
