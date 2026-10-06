// Shared site data: contact details, product catalogue, navigation.

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** Prefix a site-relative path ("koha.html", "assets/x.png", "index.html#faq") with the deploy base. */
export function url(path = ''): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  return BASE + path.replace(/^\//, '');
}

export const SITE_ORIGIN = 'https://mehmetfatruk.github.io';

export const company = {
  name: 'MirAkıl Veri İşleme',
  legalName: 'MirAkıl Veri İşleme Yazılım Donanım Eğitim Danışmanlık Tic. Ltd. Şti.',
  about:
    'Müze, arşiv ve kütüphane yönetim sistemleri alanında yazılım, donanım, eğitim ve danışmanlık hizmetleri sunan teknoloji şirketi.',
  address: 'Kızılırmak Mah. 1445 Sok. No:2/1-113 The Paragon Kat:23, Çukurambar, Çankaya/Ankara',
  phone: '0312 258 64 57',
  phoneHref: 'tel:+903122586457',
  fax: '0850 762 69 82',
  email: 'info@mirakil.com',
  emailHref: 'mailto:info@mirakil.com',
  whatsapp: '+90 531 982 46 72',
  whatsappHref: 'https://wa.me/905319824672',
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.785169455246!2d32.81053097648836!3d39.9089977863845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d338ecd5d92eff%3A0xcbcf471654064c20!2zTWlyYWvEsWwgVmVyaSDEsMWfbGVtZQ!5e1!3m2!1str!2str!4v1779253215666!5m2!1str!2str',
};

// Public Supabase anon credentials (same values the legacy pages shipped).
export const supabase = {
  url: 'https://myhsoingsoufkugiqmjj.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15aHNvaW5nc291Zmt1Z2lxbWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTU3NjYsImV4cCI6MjA4OTgzMTc2Nn0.0Nnr0UBl5z9DhymkRKDda3DI20g2h1NJIeE5gLYK8LA',
};

export interface ProductSummary {
  slug: string;
  name: string;
  short?: string;
  icon: string;
  /** official product logo (public/assets/products) */
  logo: string;
  color: string;
  category: string;
  summary: string;
}

// Order and copy follow the legacy home page product grid.
export const products: ProductSummary[] = [
  { slug: 'koha', logo: 'assets/products/koha.svg', name: 'Koha', icon: 'fas fa-book-open', color: '#408540', category: 'Kütüphane Otomasyon Sistemi', summary: 'Kütüphaneler için entegre bir kütüphane otomasyon sistemidir.' },
  { slug: 'vufind', logo: 'assets/products/vufind.webp', name: 'VuFind', icon: 'fas fa-search', color: '#619144', category: 'Kütüphane Arama Arayüzü', summary: 'Kütüphane katalogları için kullanıcı dostu bir arama arayüzü sunar.' },
  { slug: 'dspace', logo: 'assets/products/dspace.webp', name: 'DSpace', icon: 'fas fa-database', color: '#44a340', category: 'Dijital Arşiv Sistemi', summary: 'Akademik kurumlar için dijital arşiv ve kurumsal içerik yönetim sistemi sağlar.' },
  { slug: 'omeka', logo: 'assets/products/omeka.webp', name: 'Omeka', icon: 'fas fa-landmark', color: '#CD5C28', category: 'Dijital Sergi Platformu', summary: 'Dijital sergiler ve kültürel miras projeleri için içerik yönetim platformudur.' },
  { slug: 'moodle', logo: 'assets/products/moodle.svg', name: 'Moodle', icon: 'fas fa-graduation-cap', color: '#F98012', category: 'Öğrenme Yönetim Sistemi', summary: 'Uzaktan eğitim ve e-öğrenme için açık kaynaklı bir öğrenme yönetim sistemidir.' },
  { slug: 'ojs', logo: 'assets/products/ojs.svg', name: 'OJS', icon: 'fas fa-newspaper', color: '#002B5C', category: 'Akademik Dergi Yayıncılığı', summary: 'Akademik dergi yayıncılığı için tasarlanmış bir sistemdir.' },
  { slug: 'indico', logo: 'assets/products/indico.svg', name: 'Indico', icon: 'fas fa-calendar-alt', color: '#29ABE2', category: 'Konferans Yönetim Sistemi', summary: 'Akademik konferansların yönetimi ve organizasyonu için kullanılır.' },
  { slug: 'collectiveaccess', logo: 'assets/products/collectiveaccess.svg', name: 'CollectiveAccess', short: 'CA', icon: 'fas fa-archive', color: '#5b7e3d', category: 'Müze ve Arşiv Yönetimi', summary: 'Müze ve arşiv koleksiyonlarının kataloglanması ve yönetilmesi için kullanılır.' },
];

// Nav dropdown / footer order (legacy nav order).
export const navProductOrder = ['koha', 'vufind', 'dspace', 'omeka', 'moodle', 'collectiveaccess', 'ojs', 'indico'];
export const productsInNavOrder = navProductOrder.map((s) => products.find((p) => p.slug === s)!);

export const services = [
  { icon: 'fas fa-cogs', title: 'Kurulum ve Yapılandırma', text: 'Sistemlerin sunucu kurulumu, yapılandırması ve kurumunuza özel ayarlanması.' },
  { icon: 'fas fa-code', title: 'Özel Yazılım Geliştirme', text: 'İhtiyaçlarınıza özel modül, eklenti ve entegrasyon çözümleri.' },
  { icon: 'fas fa-graduation-cap', title: 'Eğitim ve Danışmanlık', text: 'Personelinize yönelik kapsamlı eğitim programları ve süreç danışmanlığı.' },
  { icon: 'fas fa-cloud', title: 'Hosting ve Bakım', text: 'Güvenilir bulut hosting, düzenli yedekleme ve 7/24 teknik destek.' },
  { icon: 'fas fa-exchange-alt', title: 'Veri Aktarımı ve Göç', text: 'Mevcut verilerinizin güvenli şekilde yeni platformlara aktarılması.' },
  { icon: 'fas fa-headset', title: 'Teknik Destek', text: 'Sistem sorunlarının hızlı çözümü ve performans optimizasyonu.' },
];

export type NavKey = 'home' | 'products' | 'references' | 'support' | 'none';
