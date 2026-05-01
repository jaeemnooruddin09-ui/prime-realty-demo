export const SITE = {
  name: 'PrimeForge Homes',
  tagline: 'Find the home you have always imagined',
  phone: '+1 (555) 234-1000',
  email: 'hello@primeforgehomes.example',
  address: '120 Park Avenue, Suite 800, New York, NY 10017',
  whatsapp: '15552341000',
  yearsInBusiness: 22,
  propertiesSold: 3400,
  happyClients: 2800,
  awards: ['Best Boutique Agency 2023', 'Top 100 Brokers 2022', 'Five-star Service 2024'],
  press: [
    { name: 'Architectural Digest', quote: 'A boutique force redefining how high-end homes are sold.' },
    { name: 'Financial Times', quote: 'Discreet, knowledgeable, and unfailingly professional.' },
    { name: 'Robb Report', quote: 'The agency every serious collector knows by name.' },
    { name: 'Wall Street Journal', quote: 'Quietly setting the standard in cross-border luxury.' },
  ],
  offices: [
    { city: 'New York', address: '120 Park Avenue, Suite 800, New York, NY 10017', phone: '+1 (212) 555-1000', email: 'newyork@primeforgehomes.example' },
    { city: 'London', address: '40 Berkeley Square, Mayfair, London W1J 5AL', phone: '+44 20 7946 1000', email: 'london@primeforgehomes.example' },
    { city: 'Dubai', address: 'Boulevard Plaza Tower 1, 27th Fl, Downtown Dubai', phone: '+971 4 555 1000', email: 'dubai@primeforgehomes.example' },
    { city: 'Singapore', address: '1 Raffles Place, Tower 2, Level 36, Singapore 048616', phone: '+65 6555 1000', email: 'singapore@primeforgehomes.example' },
    { city: 'Paris', address: '15 Avenue Montaigne, 75008 Paris, France', phone: '+33 1 5555 1000', email: 'paris@primeforgehomes.example' },
  ],
  social: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    linkedin: 'https://linkedin.com',
  },
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
};

export const PROPERTY_TYPES = ['house', 'apartment', 'villa', 'condo', 'mansion', 'townhouse', 'penthouse'];

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', label: 'US Dollar', flag: 'US' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro', flag: 'EU' },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound', flag: 'GB' },
  AED: { code: 'AED', symbol: 'AED ', label: 'UAE Dirham', flag: 'AE' },
  SGD: { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', flag: 'SG' },
  AUD: { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', flag: 'AU' },
};

export const DEFAULT_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SGD: 1.34,
  AUD: 1.52,
};

export const LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

export function formatPrice(amount, listingType = 'buy', currency = 'USD', rate = 1) {
  const cur = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = amount * rate;
  const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(converted);
  const out = `${cur.symbol}${fmt}`;
  return listingType === 'rent' ? `${out}/mo` : out;
}

export function parsePhotos(photosField) {
  if (!photosField) return [];
  try {
    return typeof photosField === 'string' ? JSON.parse(photosField) : photosField;
  } catch {
    return [];
  }
}
