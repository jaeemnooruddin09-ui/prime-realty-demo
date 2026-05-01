import Link from 'next/link';
import { getDb } from '@/lib/db';
import { SITE } from '@/lib/site';

export const metadata = { title: 'Agents' };

export default function AgentsPage() {
  const db = getDb();
  const agents = db.prepare(`
    SELECT a.*, COUNT(p.id) as listing_count
    FROM agents a
    LEFT JOIN properties p ON p.agent_id = a.id AND p.status = 'available'
    GROUP BY a.id
    ORDER BY a.name
  `).all();

  return (
    <>
      <section className="bg-navy-950 text-white py-16">
        <div className="container-x">
          <div className="text-gold-300 font-semibold tracking-widest uppercase text-sm">Our team</div>
          <h1 className="font-display text-5xl font-semibold mt-2">Meet our agents</h1>
          <p className="mt-3 max-w-2xl text-navy-200">Real people, real expertise. Our agents have decades of combined experience across every market we serve.</p>
        </div>
      </section>
      <section className="container-x py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {agents.map(a => (
            <Link key={a.id} href={`/agents/${a.slug}`} className="card group block">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={a.photo} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-5">
                <div className="font-display text-2xl text-navy-900 font-semibold">{a.name}</div>
                <div className="text-navy-500 text-sm">{a.title}</div>
                <div className="mt-3 text-sm font-semibold text-gold-600">{a.listing_count} active {a.listing_count === 1 ? 'listing' : 'listings'}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
