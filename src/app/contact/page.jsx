import { getSiteSettings } from '@/lib/settings';
import EnquiryForm from '@/components/EnquiryForm';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  const s = getSiteSettings();
  const offices = s.offices || [];
  const officeMap = `https://maps.google.com/maps?q=${encodeURIComponent(s.address)}&z=14&output=embed`;
  return (
    <>
      <section className="bg-navy-950 text-white py-16">
        <div className="container-x">
          <div className="text-gold-300 font-semibold tracking-widest uppercase text-sm">Get in touch</div>
          <h1 className="font-display text-5xl font-semibold mt-2">Contact us</h1>
          <p className="mt-3 max-w-2xl text-navy-200">Whether you are buying, renting, or selling, our offices around the world are here to help. A member of our team will respond within one business day.</p>
        </div>
      </section>

      <section className="container-x py-12 grid lg:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-3xl font-semibold text-navy-900">Our offices</h2>
          {offices.length > 0 ? (
            <p className="text-navy-500 mt-1">{offices.length} location{offices.length === 1 ? '' : 's'}.</p>
          ) : (
            <p className="text-navy-500 mt-1">Reach us at {s.email}.</p>
          )}

          <div className="mt-6 space-y-4">
            {offices.map((o, i) => (
              <div key={i} className="bg-white border border-navy-100 rounded-lg p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-gold-500 font-semibold tracking-widest uppercase text-xs">Office</div>
                    <div className="font-display text-xl font-semibold text-navy-900">{o.city}</div>
                  </div>
                  {o.address ? (
                    <a href={`https://maps.google.com/maps?q=${encodeURIComponent(o.address)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-navy-700 hover:text-gold-500">View on map &rarr;</a>
                  ) : null}
                </div>
                <div className="mt-3 text-sm text-navy-700 space-y-1.5">
                  {o.address ? (
                    <div className="flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {o.address}
                    </div>
                  ) : null}
                  {o.phone ? (
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <a href={`tel:${o.phone}`} className="hover:text-gold-500">{o.phone}</a>
                    </div>
                  ) : null}
                  {o.email ? (
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
                      <a href={`mailto:${o.email}`} className="hover:text-gold-500">{o.email}</a>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {s.address ? (
            <div className="mt-8 rounded-lg overflow-hidden border border-navy-100">
              <iframe src={officeMap} width="100%" height="320" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
            </div>
          ) : null}
        </div>

        <div className="bg-white border border-navy-100 rounded-lg p-7 h-fit">
          <h2 className="font-display text-3xl font-semibold text-navy-900">Send us a message</h2>
          <p className="text-navy-600 mt-1">We typically respond within a few hours.</p>
          <EnquiryForm />
        </div>
      </section>
    </>
  );
}
