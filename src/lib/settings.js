import 'server-only';
import { getDb, getSetting } from './db';
import { SITE, DEFAULT_RATES } from './site';

export const SETTING_KEYS = [
  'site_name', 'site_tagline', 'logo_url',
  'phone', 'email', 'address', 'whatsapp',
  'years_in_business', 'properties_sold', 'happy_clients',
  'offices_json', 'social_json',
  'exchange_rates_json',
  'hero_eyebrow', 'hero_headline', 'hero_subtext', 'hero_image',
  'hero_cta1_label', 'hero_cta1_link', 'hero_cta2_label', 'hero_cta2_link',
  'enquiry_email',
  'seo_title', 'seo_description', 'seo_og_image',
  'mortgage_rate', 'mortgage_default_term', 'mortgage_default_down_pct',
];

function safeParseJSON(value, fallback) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

export function getSiteSettings() {
  getDb();
  const g = (k, d) => getSetting(k, d);
  const offices = safeParseJSON(g('offices_json', ''), SITE.offices);
  const social = safeParseJSON(g('social_json', ''), SITE.social);
  const rates = safeParseJSON(g('exchange_rates_json', ''), DEFAULT_RATES);

  const name = g('site_name', SITE.name);
  const tagline = g('site_tagline', SITE.tagline);

  return {
    name,
    tagline,
    logoUrl: g('logo_url', '/brand/logo-transparent.png'),

    phone: g('phone', SITE.phone),
    email: g('email', SITE.email),
    address: g('address', SITE.address),
    whatsapp: g('whatsapp', SITE.whatsapp),

    yearsInBusiness: parseInt(g('years_in_business', String(SITE.yearsInBusiness)), 10) || SITE.yearsInBusiness,
    propertiesSold: parseInt(g('properties_sold', String(SITE.propertiesSold)), 10) || SITE.propertiesSold,
    happyClients: parseInt(g('happy_clients', String(SITE.happyClients)), 10) || SITE.happyClients,

    offices,
    social,
    exchangeRates: rates,

    hero: {
      eyebrow: g('hero_eyebrow', name),
      headline: g('hero_headline', tagline),
      subtext: g('hero_subtext', `From beachfront villas to downtown lofts, our boutique agents have spent ${SITE.yearsInBusiness} years matching exceptional homes with the people who love them.`),
      image: g('hero_image', 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920'),
      cta1Label: g('hero_cta1_label', 'Browse properties'),
      cta1Link: g('hero_cta1_link', '/properties'),
      cta2Label: g('hero_cta2_label', 'Book a viewing'),
      cta2Link: g('hero_cta2_link', '/contact'),
    },

    enquiryEmail: g('enquiry_email', SITE.email),

    seo: {
      title: g('seo_title', `${name} | ${tagline}`),
      description: g('seo_description', `${name} has helped families find homes for over ${SITE.yearsInBusiness} years. Browse properties for sale and rent.`),
      ogImage: g('seo_og_image', ''),
    },

    mortgage: {
      rate: parseFloat(g('mortgage_rate', '6.5')) || 6.5,
      defaultTerm: parseInt(g('mortgage_default_term', '30'), 10) || 30,
      defaultDownPct: parseFloat(g('mortgage_default_down_pct', '20')) || 20,
    },
  };
}
