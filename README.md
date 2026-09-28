# MirAkıl Web (v2)

MirAkıl Veri İşleme kurumsal web sitesi: müze, arşiv ve kütüphane yönetim çözümleri (Koha, VuFind, DSpace, Omeka, Moodle, OJS, Indico, CollectiveAccess).

- **Teknoloji:** [Astro](https://astro.build) (statik çıktı), Motion (animasyon), Supabase (iletişim formu, destek talepleri, admin paneli)
- **Yayın:** GitHub Pages, `.github/workflows/deploy.yml` ile `master` dalına her push'ta otomatik
- **Tasarım sistemi:** [`DESIGN.md`](DESIGN.md), tokenlar `src/styles/global.css`

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:4321/mirakil_web2/
npm run build    # dist/
npm run preview
```

## Yapı

| Yol | İçerik |
|---|---|
| `src/pages/index.astro` | Ana sayfa |
| `src/pages/[product].astro` | 8 ürün sayfası (tek şablon) |
| `src/data/products/*.json` | Ürün sayfalarının içeriği |
| `src/data/references.json` | Referans kurumlar |
| `src/lib/site.ts` | İletişim bilgileri, ürün listesi, hizmetler |
| `src/components/` | Header, Footer, hero, ürün bölümleri |
| `src/scripts/` | Site geneli etkileşim, Motion ayarları, destek/admin betikleri |
| `public/assets/` | Logolar, ürün logoları, ekran görüntüleri |
| `supabase/functions/` | E-posta bildirimi Edge Function |

İçerik güncellemek için genellikle yalnızca `src/data/` altındaki JSON dosyalarını veya `src/lib/site.ts` dosyasını düzenlemek yeterlidir.
