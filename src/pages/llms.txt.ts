// llms.txt (https://llmstxt.org): a plain-text site summary that AI assistants can read quickly.
import type { APIRoute } from 'astro';
import { url, SITE_ORIGIN, company, products, services, facts } from '../lib/site';
import { referenceCount, migrations, migratedFrom, caseStudies } from '../lib/proof';

const abs = (path: string) => SITE_ORIGIN + url(path);

export const GET: APIRoute = () => {
  const body = `# ${company.name}

> ${company.about}

${company.legalName} Ankara merkezli; açık kaynaklı kütüphane, arşiv, müze, e-öğrenme, akademik yayıncılık ve konferans yönetim sistemlerinin kurulumu, özelleştirilmesi, veri aktarımı, eğitimi, barındırılması ve teknik desteğini sağlar. ${facts.yearsExperience}+ yıllık tecrübe, ${facts.customers}+ kurumsal müşteri; bunların ${referenceCount}'sı yapılan işle birlikte Referanslar sayfasında listelenir (üniversiteler, bakanlıklar, kamu kütüphaneleri, belediyeler, kültür kuruluşları).

İletişim: ${company.phone} · ${company.email} · ${company.address}

## Öne çıkan projeler

${caseStudies.map((c) => `- ${c.name}: ${c.desc}`).join('\n')}
- Sistem göçü: ${migrations.length} kurumun verisi eski sisteminden aktarıldı; kaynak sistemler arasında ${migratedFrom.join(', ')} var.

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
