import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import PropertyCard from '@/components/PropertyCard';
import { SITE } from '@/lib/site';

export async function generateMetadata({ params }) {
  const db = getDb();
  const a = db.prepare('SELECT * FROM agents WHERE slug = ?').get(params.slug);
  if (!a) return { title: 'Agent not found' };
  return {
    title: a.name,
    description: `${a.name}, ${a.title} at ${SITE.name}. ${a.bio.slice(0, 150)}`,
    openGraph: { title: a.name, description: a.bio, images: [a.photo] },
  };
}

export default function AgentProfile({ params }) {
  const db = getDb();
  const agent = db.prepare('SELECT * FROM agents WHERE slug = ?').get(params.slug);
  if (!agent) notFound();
  const listings = db.prepare(`SELECT * FROM properties WHERE agent_id = ? AND status = 'available' ORDER BY featured DESC, created_at DESC`).all(agent.id);
  const sold = db.prepare(`SELECT COUNT(*) as c FROM properties WHERE agent_id = ? AND status = 'sold'`).get(agent.id).c;

  return (
    <>
      <section className="bg-navy-950 text-white py-16">
        <div className="container-x grid md:grid-cols-[260px,1fr] gap-10 items-center">
          <img src={agent.photo} alt={agent.name} className="w-60 h-60 rounded-lg object-cover ring-4 ring-gold-400" />
          <div>
            <div className="text-gold-300 font-semibold tracking-widest uppercase text-sm">{agent.title}</div>
            <h1 className="font-display text-5xl font-semibold mt-2">{agent.name}</h1>
            <p className="mt-4 text-navy-200 max-w-2xl leading-relaxed">{agent.bio}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={`tel:${agent.phone}`} className="btn-gold">Call {agent.phone}</a>
              <a href={`mailto:${agent.email}`} className="btn-outline !text-white !border-white hover:!bg-white hover:!text-navy-900">Email</a>
            </div>
            <div className="mt-6 flex gap-8 text-sm">
              <div><span className="text-2xl font-bold text-white">{listings.length}</span><div className="text-navy-300 uppercase tracking-wider text-xs">Active listings</div></div>
              <div><span className="text-2xl font-bold text-white">{sold}</span><div className="text-navy-300 uppercase tracking-wider text-xs">Sold</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-12">
        <h2 className="font-display text-3xl text-navy-900 font-semibold mb-6">Active listings by {agent.name.split(' ')[0]}</h2>
        {listings.length === 0 ? (
          <p className="text-navy-600">No active listings right now. Get in touch with {agent.name.split(' ')[0]} to discuss what's coming up.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>
    </>
  );
}
