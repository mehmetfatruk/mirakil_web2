// Generated at build time so new pages and lastmod dates never go stale.
import type { APIRoute } from 'astro';
import { url, SITE_ORIGIN, products } from '../lib/site';

const pages: { path: string; changefreq: string; priority: string }[] = [
  { path: 'index.html', changefreq: 'weekly', priority: '1.0' },
  ...products.map((p) => ({ path: `${p.slug}.html`, changefreq: 'monthly', priority: '0.8' })),
  { path: 'referanslar.html', changefreq: 'monthly', priority: '0.7' },
  { path: 'destek.html', changefreq: 'monthly', priority: '0.6' },
];

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((p) => `  <url>
    <loc>${SITE_ORIGIN + url(p.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`)
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
