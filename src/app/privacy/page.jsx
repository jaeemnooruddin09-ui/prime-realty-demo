import { getSiteSettings } from '@/lib/settings';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How PrimeForge Homes collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  const s = getSiteSettings();
  const updated = 'May 2026';
  return (
    <main className="container-x py-14 max-w-3xl">
      <div className="text-gold-500 font-semibold tracking-widest uppercase text-sm">Legal</div>
      <h1 className="font-display text-4xl text-navy-900 font-semibold mt-2">Privacy Policy</h1>
      <p className="text-navy-500 mt-2">Last updated {updated}</p>

      <div className="prose prose-navy mt-8 space-y-5 text-navy-700 leading-relaxed">
        <p>{s.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This page explains what we collect when you use our website, why we collect it, and the rights you have over your information.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">What we collect</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Information you give us</strong>: name, email, phone, message text, and viewing preferences when you submit a contact form, schedule a viewing, subscribe to our newsletter, or comment on a listing.</li>
          <li><strong>Information collected automatically</strong>: IP address, browser type, device, pages visited, and approximate location from standard server logs. Used for security, rate-limiting, and to spot abuse.</li>
          <li><strong>Cookies</strong>: a small admin-session cookie (only set if you log into the admin panel) and an optional analytics cookie if you accept it via the cookie banner.</li>
        </ul>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">Why we collect it</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>To respond to your enquiries and arrange viewings.</li>
          <li>To send the marketing material you have specifically requested (e.g. our market reports). You can unsubscribe at any time.</li>
          <li>To prevent fraud, brute-force login attempts, and form spam.</li>
          <li>To understand which listings and pages perform well, in aggregate, so we can improve the site.</li>
        </ul>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">Who we share it with</h2>
        <p>We do not sell your information. We share only with: (a) the agent assigned to your enquiry, so they can reply, (b) infrastructure providers strictly as needed to run the site (hosting, email delivery), and (c) authorities when legally required.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">How long we keep it</h2>
        <p>Enquiry and lead data is retained for up to 36 months from your last interaction. Newsletter subscriptions are kept until you unsubscribe. Server logs are kept for 90 days.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">Your rights</h2>
        <p>You have the right to access, correct, export, or delete the personal information we hold about you. To exercise any of these rights, email <a href={`mailto:${s.email}`} className="text-gold-600 underline">{s.email}</a>. If you are based in the EEA or UK, you also have the right to lodge a complaint with your local data-protection authority.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">Changes</h2>
        <p>We may revise this policy as the site evolves. Material changes will be highlighted at the top of this page. Continuing to use the site after the change confirms your acceptance.</p>

        <h2 className="font-display text-2xl text-navy-900 font-semibold mt-8">Contact</h2>
        <p>Questions? Write to <a href={`mailto:${s.email}`} className="text-gold-600 underline">{s.email}</a> or {s.address}.</p>
      </div>
    </main>
  );
}
