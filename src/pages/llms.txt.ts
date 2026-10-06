// llms.txt (https://llmstxt.org): a plain-text site summary that AI assistants can read quickly.
import type { APIRoute } from 'astro';
import { url, SITE_ORIGIN, company, products, services } from '../lib/site';
import references from '../data/references.json';

const abs = (path: string) => SITE_ORIGIN + url(path);

export const GET: APIRoute = () => {
  const body = `# ${company.name}

> ${company.about}

${company.legalName} Ankara merkezli; açık kaynaklı kütüphane, arşiv, müze, e-öğrenme, akademik yayıncılık ve konferans yönetim sistemlerinin kurulumu, özelleştirilmesi, veri aktarımı, eğitimi, barındırılması ve teknik desteğini sağlar. ${references.items.length} referans kurum listelenmektedir (üniversiteler, kamu kurumları, kütüphaneler, belediyeler).

İletişim: ${company.phone} · ${company.email} · ${company.address}

## Ürünler

${products.map((p) => `- [${p.name}](${abs(`${p.slug}.html`)}): ${p.category}. ${p.summary}`).join('\n')}

## Hizmetler

${services.map((s) => `- ${s.title}: ${s.text}`).join('\n')}

## Sayfalar

- [Ana sayfa](${abs('index.html')}): ürünler, hizmetler, neden MirAkıl, SSS ve iletişim
- [Referanslar](${abs('referanslar.html')}): referans kurumlar ve yapılan işler
- [Destek](${abs('destek.html')}): müşteri destek talebi formu
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
