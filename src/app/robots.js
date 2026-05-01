const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://primeforgehomes.example';

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/admin/', '/login', '/api/'] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
