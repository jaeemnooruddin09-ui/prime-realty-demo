import Link from 'next/link';

export const metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to the questions our buyers, sellers, and renters ask most often.',
};

const FAQS = [
  {
    section: 'Buying',
    items: [
      { q: 'Do you have off-market properties?', a: 'Yes. Roughly 30 percent of our annual transaction volume happens off-market. Reach out to an agent to discuss what you are looking for, and we will share opportunities not on this site.' },
      { q: 'What does the buying process look like?', a: 'After identifying properties, we arrange viewings (in person or by video), advise on price and structure, then handle offer letter, inspection coordination, contract review with your solicitor, and closing logistics. The full cycle typically runs 6 to 12 weeks.' },
      { q: 'Can you assist international buyers?', a: 'Yes. We work routinely with buyers in seven countries and our agents speak six languages between them. We coordinate with local solicitors, tax advisers, and FX specialists as needed.' },
      { q: 'What fees does a buyer pay?', a: 'In most markets, the seller pays the agent commission and there is no buyer-side fee. Other costs vary by jurisdiction: stamp duty, notary fees, and inspection costs typically range from 4 to 12 percent of the purchase price.' },
    ],
  },
  {
    section: 'Selling',
    items: [
      { q: 'How do you market a luxury property?', a: 'Each listing receives professional photography, drone, and video, plus a tailored launch plan combining our database, off-market network, partner brokerages, and select press. We never use generic listing portals as a primary channel.' },
      { q: 'What commission do you charge?', a: 'Commissions are negotiable and depend on the market, the property, and the marketing scope. Our fees are competitive with full-service luxury brokerages globally. We are happy to share a written fee proposal.' },
      { q: 'How long does it take to sell?', a: 'Average days on market across our 2025 transactions was 71 days. The strongest markets (London Mayfair, Manhattan Park Avenue) ran tighter at 50 to 60 days; the broadest (rural country estates) longer at 90 to 130.' },
    ],
  },
  {
    section: 'Renting',
    items: [
      { q: 'Do you handle long-term rentals?', a: 'Yes. We maintain a curated portfolio of long-term rentals from $4,000 a month upwards. Filter our properties page by "Rent" or contact an agent for off-market options.' },
      { q: 'Do you do short-term and holiday rentals?', a: 'We selectively manage premium short-term rentals for owners we already represent. We do not operate as a general short-term let agency.' },
    ],
  },
  {
    section: 'Working with us',
    items: [
      { q: 'How do I book a viewing?', a: 'You can request a viewing from any property page using the contact form, or call our agents directly. Most viewings are scheduled within 24 to 48 hours of request, subject to availability.' },
      { q: 'Can I work with a specific agent?', a: 'Absolutely. Browse our agents page and use the contact details on each profile. We assign a single point of contact through the entire transaction.' },
      { q: 'Are you really available 24/7?', a: 'Senior agents respond outside business hours for active clients. For initial enquiries, we aim to respond within one business day.' },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="bg-navy-50 border-b border-navy-100">
        <div className="container-x py-14">
          <h1 className="font-display text-4xl md:text-5xl text-navy-900 font-semibold">Frequently Asked Questions</h1>
          <p className="text-navy-600 mt-3 max-w-2xl">If you do not find what you are looking for, get in touch and an agent will respond within one business day.</p>
        </div>
      </section>

      <section className="container-x py-12 max-w-3xl">
        {FAQS.map(group => (
          <div key={group.section} className="mb-10">
            <h2 className="font-display text-2xl text-navy-900 font-semibold mb-4">{group.section}</h2>
            <div className="space-y-3">
              {group.items.map(item => (
                <details key={item.q} className="group rounded-lg border border-navy-200 bg-white">
                  <summary className="cursor-pointer p-5 font-semibold text-navy-900 hover:bg-navy-50 list-none flex justify-between items-center">
                    <span>{item.q}</span>
                    <span className="text-gold-500 group-open:rotate-45 transition">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-navy-700 leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-navy-50 rounded-lg p-6 text-center mt-12">
          <h3 className="font-display text-xl text-navy-900 font-semibold">Still have a question?</h3>
          <p className="text-navy-600 mt-2">An agent typically responds within one business day.</p>
          <Link href="/contact" className="btn-gold mt-5 inline-block">Contact us</Link>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.flatMap(g => g.items.map(i => ({
          '@type': 'Question',
          name: i.q,
          acceptedAnswer: { '@type': 'Answer', text: i.a },
        }))),
      })}} />
    </>
  );
}
