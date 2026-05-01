'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CURRENCY_KEYS = ['USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD'];

export default function SettingsForm({ initial }) {
  const router = useRouter();
  const [s, setS] = useState({
    site_name: initial.name || '',
    site_tagline: initial.tagline || '',
    logo_url: initial.logoUrl || '',

    phone: initial.phone || '',
    email: initial.email || '',
    address: initial.address || '',
    whatsapp: initial.whatsapp || '',

    years_in_business: String(initial.yearsInBusiness ?? ''),
    properties_sold: String(initial.propertiesSold ?? ''),
    happy_clients: String(initial.happyClients ?? ''),

    offices: initial.offices || [],
    social: { instagram: '', facebook: '', linkedin: '', tiktok: '', ...(initial.social || {}) },
    rates: { ...CURRENCY_KEYS.reduce((a, k) => ({ ...a, [k]: 1 }), {}), ...(initial.exchangeRates || {}) },

    hero_eyebrow: initial.hero?.eyebrow || '',
    hero_headline: initial.hero?.headline || '',
    hero_subtext: initial.hero?.subtext || '',
    hero_image: initial.hero?.image || '',
    hero_cta1_label: initial.hero?.cta1Label || '',
    hero_cta1_link: initial.hero?.cta1Link || '',
    hero_cta2_label: initial.hero?.cta2Label || '',
    hero_cta2_link: initial.hero?.cta2Link || '',

    enquiry_email: initial.enquiryEmail || '',

    seo_title: initial.seo?.title || '',
    seo_description: initial.seo?.description || '',
    seo_og_image: initial.seo?.ogImage || '',

    mortgage_rate: String(initial.mortgage?.rate ?? '6.5'),
    mortgage_default_term: String(initial.mortgage?.defaultTerm ?? '30'),
    mortgage_default_down_pct: String(initial.mortgage?.defaultDownPct ?? '20'),
  });

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [uploadingKey, setUploadingKey] = useState('');

  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }));

  function setOffice(idx, key, value) {
    setS(prev => {
      const list = [...prev.offices];
      list[idx] = { ...list[idx], [key]: value };
      return { ...prev, offices: list };
    });
  }
  function addOffice() {
    setS(prev => ({ ...prev, offices: [...prev.offices, { city: '', address: '', phone: '', email: '' }] }));
  }
  function removeOffice(idx) {
    setS(prev => ({ ...prev, offices: prev.offices.filter((_, i) => i !== idx) }));
  }

  async function uploadImage(file, key) {
    if (!file) return;
    setUploadingKey(key);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const j = await res.json();
      if (res.ok && j.urls?.[0]) {
        set(key, j.urls[0]);
      } else {
        setError(j.error || 'Upload failed.');
      }
    } catch (e) {
      setError(e.message || 'Upload failed.');
    } finally {
      setUploadingKey('');
    }
  }

  async function submit(e) {
    e.preventDefault();
    setStatus('saving');
    setError('');

    const payload = {
      site_name: s.site_name,
      site_tagline: s.site_tagline,
      logo_url: s.logo_url,
      phone: s.phone,
      email: s.email,
      address: s.address,
      whatsapp: s.whatsapp,
      years_in_business: s.years_in_business,
      properties_sold: s.properties_sold,
      happy_clients: s.happy_clients,
      offices_json: JSON.stringify(s.offices.filter(o => o.city || o.address || o.phone || o.email)),
      social_json: JSON.stringify(s.social),
      exchange_rates_json: JSON.stringify(
        CURRENCY_KEYS.reduce((acc, k) => ({ ...acc, [k]: parseFloat(s.rates[k]) || 0 }), {})
      ),
      hero_eyebrow: s.hero_eyebrow,
      hero_headline: s.hero_headline,
      hero_subtext: s.hero_subtext,
      hero_image: s.hero_image,
      hero_cta1_label: s.hero_cta1_label,
      hero_cta1_link: s.hero_cta1_link,
      hero_cta2_label: s.hero_cta2_label,
      hero_cta2_link: s.hero_cta2_link,
      enquiry_email: s.enquiry_email,
      seo_title: s.seo_title,
      seo_description: s.seo_description,
      seo_og_image: s.seo_og_image,
      mortgage_rate: s.mortgage_rate,
      mortgage_default_term: s.mortgage_default_term,
      mortgage_default_down_pct: s.mortgage_default_down_pct,
    };

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setStatus('saved');
      router.refresh();
      setTimeout(() => setStatus('idle'), 1800);
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || 'Could not save.');
      setStatus('idle');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8 max-w-4xl">
      <Section title="Brand identity" subtitle="Your site name, tagline, and logo. Shown across the navbar, footer, and SEO previews.">
        <Field label="Site name">
          <input value={s.site_name} onChange={e => set('site_name', e.target.value)} className="input" />
        </Field>
        <Field label="Tagline">
          <input value={s.site_tagline} onChange={e => set('site_tagline', e.target.value)} className="input" />
        </Field>
        <Field label="Logo">
          <div className="flex items-center gap-4">
            {s.logo_url ? <img src={s.logo_url} alt="Logo" className="h-16 w-auto bg-white border border-navy-100 rounded p-2" /> : null}
            <label className="btn-outline cursor-pointer">
              {uploadingKey === 'logo_url' ? 'Uploading...' : 'Upload logo'}
              <input type="file" accept="image/*" className="hidden" onChange={e => uploadImage(e.target.files?.[0], 'logo_url')} />
            </label>
            {s.logo_url ? <button type="button" onClick={() => set('logo_url', '')} className="text-sm text-red-600 hover:underline">Remove</button> : null}
          </div>
          <input value={s.logo_url} onChange={e => set('logo_url', e.target.value)} placeholder="Or paste image URL" className="input mt-3 text-xs" />
        </Field>
      </Section>

      <Section title="Contact details" subtitle="Phone, email, head office address, WhatsApp. Used in the footer, contact page, and structured data.">
        <Field label="Phone"><input value={s.phone} onChange={e => set('phone', e.target.value)} className="input" /></Field>
        <Field label="Email"><input type="email" value={s.email} onChange={e => set('email', e.target.value)} className="input" /></Field>
        <Field label="Head office address"><input value={s.address} onChange={e => set('address', e.target.value)} className="input" /></Field>
        <Field label="WhatsApp number"><input value={s.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="Digits only, e.g. 15552341000" className="input" /></Field>
      </Section>

      <Section title="Office locations" subtitle="Listed on the Contact page. Add one entry per office.">
        <div className="space-y-4">
          {s.offices.map((o, i) => (
            <div key={i} className="border border-navy-100 rounded-lg p-4 bg-navy-50/40">
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={o.city || ''} onChange={e => setOffice(i, 'city', e.target.value)} placeholder="City" className="input" />
                <input value={o.phone || ''} onChange={e => setOffice(i, 'phone', e.target.value)} placeholder="Phone" className="input" />
                <input value={o.email || ''} onChange={e => setOffice(i, 'email', e.target.value)} placeholder="Email" className="input" />
                <input value={o.address || ''} onChange={e => setOffice(i, 'address', e.target.value)} placeholder="Street address" className="input" />
              </div>
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={() => removeOffice(i)} className="text-sm text-red-600 hover:underline">Remove this office</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addOffice} className="btn-outline">+ Add office</button>
        </div>
      </Section>

      <Section title="Social links" subtitle="Leave blank to hide. Will appear in the footer.">
        <Field label="Instagram URL"><input value={s.social.instagram || ''} onChange={e => set('social', { ...s.social, instagram: e.target.value })} className="input" /></Field>
        <Field label="Facebook URL"><input value={s.social.facebook || ''} onChange={e => set('social', { ...s.social, facebook: e.target.value })} className="input" /></Field>
        <Field label="LinkedIn URL"><input value={s.social.linkedin || ''} onChange={e => set('social', { ...s.social, linkedin: e.target.value })} className="input" /></Field>
        <Field label="TikTok URL"><input value={s.social.tiktok || ''} onChange={e => set('social', { ...s.social, tiktok: e.target.value })} className="input" /></Field>
      </Section>

      <Section title="Statistics" subtitle="Numbers shown in the homepage stats band.">
        <Field label="Years in business"><input type="number" min="0" value={s.years_in_business} onChange={e => set('years_in_business', e.target.value)} className="input" /></Field>
        <Field label="Properties sold"><input type="number" min="0" value={s.properties_sold} onChange={e => set('properties_sold', e.target.value)} className="input" /></Field>
        <Field label="Happy clients"><input type="number" min="0" value={s.happy_clients} onChange={e => set('happy_clients', e.target.value)} className="input" /></Field>
      </Section>

      <Section title="Hero section" subtitle="The headline area on the homepage.">
        <Field label="Eyebrow text (small uppercase)"><input value={s.hero_eyebrow} onChange={e => set('hero_eyebrow', e.target.value)} className="input" /></Field>
        <Field label="Headline"><input value={s.hero_headline} onChange={e => set('hero_headline', e.target.value)} className="input" /></Field>
        <Field label="Subtext"><textarea value={s.hero_subtext} onChange={e => set('hero_subtext', e.target.value)} rows={3} className="input" /></Field>
        <Field label="Background image">
          <div className="flex items-center gap-4">
            {s.hero_image ? <img src={s.hero_image} alt="Hero" className="h-20 w-32 object-cover border border-navy-100 rounded" /> : null}
            <label className="btn-outline cursor-pointer">
              {uploadingKey === 'hero_image' ? 'Uploading...' : 'Upload image'}
              <input type="file" accept="image/*" className="hidden" onChange={e => uploadImage(e.target.files?.[0], 'hero_image')} />
            </label>
          </div>
          <input value={s.hero_image} onChange={e => set('hero_image', e.target.value)} placeholder="Or paste image URL" className="input mt-3 text-xs" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Primary button label"><input value={s.hero_cta1_label} onChange={e => set('hero_cta1_label', e.target.value)} className="input" /></Field>
          <Field label="Primary button link"><input value={s.hero_cta1_link} onChange={e => set('hero_cta1_link', e.target.value)} className="input" /></Field>
          <Field label="Secondary button label"><input value={s.hero_cta2_label} onChange={e => set('hero_cta2_label', e.target.value)} className="input" /></Field>
          <Field label="Secondary button link"><input value={s.hero_cta2_link} onChange={e => set('hero_cta2_link', e.target.value)} className="input" /></Field>
        </div>
      </Section>

      <Section title="Currency exchange rates" subtitle="Conversion rates from USD. Used to display prices in other currencies. 1 USD = ?">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CURRENCY_KEYS.map(k => (
            <Field key={k} label={`1 USD = ? ${k}`}>
              <input type="number" step="0.0001" min="0" value={s.rates[k] ?? ''} onChange={e => set('rates', { ...s.rates, [k]: e.target.value })} className="input" />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Notifications" subtitle="Email address that receives copies of new enquiry submissions. Falls back to the contact email if blank.">
        <Field label="Enquiry notification email"><input type="email" value={s.enquiry_email} onChange={e => set('enquiry_email', e.target.value)} className="input" /></Field>
      </Section>

      <Section title="SEO & social previews" subtitle="How the site appears in search results and link previews.">
        <Field label="Default title"><input value={s.seo_title} onChange={e => set('seo_title', e.target.value)} className="input" /></Field>
        <Field label="Meta description"><textarea value={s.seo_description} onChange={e => set('seo_description', e.target.value)} rows={3} className="input" /></Field>
        <Field label="Open Graph image">
          <div className="flex items-center gap-4">
            {s.seo_og_image ? <img src={s.seo_og_image} alt="OG" className="h-20 w-32 object-cover border border-navy-100 rounded" /> : null}
            <label className="btn-outline cursor-pointer">
              {uploadingKey === 'seo_og_image' ? 'Uploading...' : 'Upload image'}
              <input type="file" accept="image/*" className="hidden" onChange={e => uploadImage(e.target.files?.[0], 'seo_og_image')} />
            </label>
          </div>
          <input value={s.seo_og_image} onChange={e => set('seo_og_image', e.target.value)} placeholder="Or paste image URL" className="input mt-3 text-xs" />
        </Field>
      </Section>

      <Section title="Mortgage calculator defaults" subtitle="Defaults shown to buyers on every listing.">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Default interest rate (%)"><input type="number" min="0" max="30" step="0.05" value={s.mortgage_rate} onChange={e => set('mortgage_rate', e.target.value)} className="input" /></Field>
          <Field label="Default loan term (years)"><input type="number" min="1" max="50" value={s.mortgage_default_term} onChange={e => set('mortgage_default_term', e.target.value)} className="input" /></Field>
          <Field label="Default down payment (%)"><input type="number" min="0" max="100" step="0.5" value={s.mortgage_default_down_pct} onChange={e => set('mortgage_default_down_pct', e.target.value)} className="input" /></Field>
        </div>
      </Section>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div> : null}

      <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-navy-100 -mx-4 px-4 py-4 sm:-mx-6 sm:px-6 flex items-center gap-3">
        <button type="submit" disabled={status === 'saving'} className="btn-primary">
          {status === 'saving' ? 'Saving...' : 'Save all settings'}
        </button>
        {status === 'saved' ? <span className="text-emerald-700 text-sm">Saved.</span> : null}
        <span className="text-xs text-navy-400 ml-auto">Tip: mark properties as Featured in the property editor to control which appear on the homepage.</span>
      </div>
    </form>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="bg-white border border-navy-100 rounded-lg p-6">
      <h3 className="font-display text-xl font-semibold text-navy-900">{title}</h3>
      {subtitle ? <p className="text-sm text-navy-500 mt-1">{subtitle}</p> : null}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
