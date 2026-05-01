import Link from 'next/link';
import { getDb } from '@/lib/db';
import { SITE } from '@/lib/site';

export const metadata = { title: 'About' };
export const dynamic = 'force-dynamic';

export default function AboutPage() {
  const db = getDb();
  const agents = db.prepare('SELECT * FROM agents ORDER BY id').all();

  return (
    <>
      <section className="bg-navy-950 text-white py-20">
        <div className="container-x">
          <div className="text-gold-300 font-semibold tracking-widest uppercase text-sm">About {SITE.name}</div>
          <h1 className="font-display text-5xl md:text-6xl font-semibold mt-2">Real estate, with a personal touch.</h1>
          <p className="mt-4 max-w-3xl text-navy-200 text-lg leading-relaxed">For over {SITE.yearsInBusiness} years, {SITE.name} has helped families, professionals, and investors find homes they truly love. We believe a great agent listens first, advises honestly, and treats every client like their only one.</p>
        </div>
      </section>

      <section className="container-x py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-gold-500 font-semibold tracking-wider uppercase text-sm">Our story</div>
          <h2 className="font-display text-4xl text-navy-900 font-semibold mt-2">A boutique agency, built on relationships.</h2>
          <p className="mt-5 text-navy-700 leading-relaxed">We opened our doors in {new Date().getFullYear() - SITE.yearsInBusiness} with a single mission: to make the property journey easier and more transparent. Today, we are still small enough to know every client by name, but seasoned enough to navigate any market. Our agents have closed transactions across {SITE.propertiesSold.toLocaleString()}+ properties, from urban studios to private estates.</p>
          <p className="mt-3 text-navy-700 leading-relaxed">We believe in three things: clarity over jargon, advocacy over commission, and homes over houses.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <img src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=900" className="rounded-lg w-full h-64 object-cover" alt="" />
          <img src="https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=900" className="rounded-lg w-full h-64 object-cover mt-6" alt="" />
        </div>
      </section>

      <section className="bg-navy-50 py-16">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            [`${SITE.yearsInBusiness}+`, 'Years in business'],
            [`${SITE.propertiesSold.toLocaleString()}+`, 'Properties sold'],
            [`${SITE.happyClients.toLocaleString()}+`, 'Happy clients'],
            ['98%', 'Client retention'],
          ].map(([n, l]) => (
            <div key={l} className="bg-white rounded-lg p-7">
              <div className="font-display text-4xl text-navy-900 font-semibold">{n}</div>
              <div className="mt-2 text-sm uppercase tracking-wider text-navy-500">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-16">
        <div className="text-gold-500 font-semibold tracking-wider uppercase text-sm">Awards & Recognition</div>
        <h2 className="font-display text-4xl text-navy-900 font-semibold mt-2">Recognized by the industry.</h2>
        <div className="mt-7 grid sm:grid-cols-3 gap-5">
          {SITE.awards.map((a, i) => (
            <div key={i} className="bg-white border border-navy-100 rounded-lg p-6">
              <div className="w-12 h-12 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center text-xl font-display font-bold">&#9733;</div>
              <div className="mt-3 font-semibold text-navy-900">{a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-950 text-white py-16">
        <div className="container-x">
          <div className="text-gold-300 font-semibold tracking-wider uppercase text-sm">In the press</div>
          <h2 className="font-display text-4xl font-semibold mt-2">What the world says about us.</h2>
          <div className="mt-7 grid sm:grid-cols-2 gap-5">
            {SITE.press.map((p, i) => (
              <figure key={i} className="bg-navy-900/60 border border-navy-800 rounded-lg p-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-gold-300 mb-3"><path d="M9 7H5a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h2v3l4-3v-7a3 3 0 0 0-2-2.83V7zm10 0h-4a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h2v3l4-3v-7a3 3 0 0 0-2-2.83V7z"/></svg>
                <blockquote className="text-lg leading-relaxed">{p.quote}</blockquote>
                <figcaption className="mt-4 text-sm font-semibold tracking-wider uppercase text-gold-300">{p.name}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-items-center opacity-80">
            {SITE.press.map(p => (
              <div key={p.name} className="font-display text-xl text-navy-200 text-center">{p.name}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="text-gold-500 font-semibold tracking-wider uppercase text-sm">Meet the team</div>
        <h2 className="font-display text-4xl text-navy-900 font-semibold mt-2">Our agents.</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {agents.map(a => (
            <Link key={a.id} href={`/agents/${a.slug}`} className="card group block">
              <div className="aspect-[4/5] overflow-hidden bg-navy-50">
                <img src={a.photo} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-5">
                <div className="font-display text-2xl text-navy-900 font-semibold">{a.name}</div>
                <div className="text-navy-500 text-sm">{a.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
