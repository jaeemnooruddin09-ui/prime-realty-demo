import { getSiteSettings } from '@/lib/settings';

export const metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of the PrimeForge Homes website.',
};

export default function TermsPage() {
  const s = getSiteSettings();
  const updated = 'May 2026';
  return (
    <main className="container-x py-14 max-w-3xl">
      <div className="text-gold-500 font-semibold tracking-widest uppercase text-sm">Legal</div>
      <h1 className="font-display text-4xl text-navy-900 font-semibold mt-2">Terms of Service</h1>
      <p className="text-navy-500 mt-2">Last updated {updated}</p>

      <div className="prose prose-navy mt-8 space-y-5 text-navy-700 leading-relaxed">
        <p>By using {s.name} (&ldquo;the site&rdquo;), you agree to these terms. If you do not agree, please do not use the site.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">Use of the site</h2>
        <p>The site is provided for personal, non-commercial information about properties listed by {s.name}. You may not scrape listings, attempt to access non-public areas, interfere with security mechanisms, or impersonate another user.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">Listings and pricing</h2>
        <p>All listings, prices, photographs, and descriptions are provided for information only. They are not offers to sell, do not form part of any contract, and may change at any time without notice. Property details should be verified directly with us before any decision to view, offer, or transact.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">User submissions</h2>
        <p>When you submit comments, enquiries, or other content, you grant {s.name} a non-exclusive licence to use that content to respond to you and to operate the site. You confirm the content is yours to share and contains nothing unlawful, defamatory, or infringing.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">Intellectual property</h2>
        <p>The site, its content, and the {s.name} brand are protected by copyright and trademark. You may share links to public pages. You may not copy substantial portions, redistribute photographs, or reproduce the design without our written permission.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">No warranty</h2>
        <p>The site is provided &ldquo;as is&rdquo;. We make no warranty of accuracy, availability, or fitness for any particular purpose. We do our best to keep the site running and the data correct, but errors and downtime can happen.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">Limitation of liability</h2>
        <p>To the maximum extent permitted by law, {s.name} is not liable for any indirect, incidental, or consequential loss arising from your use of the site, including loss of opportunity to view or transact on a listing.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">Governing law</h2>
        <p>These terms are governed by the laws of the State of New York, without regard to conflict-of-law principles. Disputes will be heard in the courts of New York County.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">Contact</h2>
        <p>Questions about these terms? Write to <a href={`mailto:${s.email}`} className="text-gold-600 underline">{s.email}</a>.</p>
      </div>
    </main>
  );
}
