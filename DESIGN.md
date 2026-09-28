---
name: MirAkıl design system (v2)
description: "Kurumsal, sıcak ve hareketli. Müşterinin seçtiği referanslardan (Orex, Lightwave Library, Catalyst, Open Fifth, Theke, Egyptian Prime Vision) türetildi: kalın başlıklar, yuvarlatılmış kartlar ve yumuşak gölgeler, logo mavisi tek baskın renk, aydınlık zeminler, gerçek müze/arşiv/kütüphane fotoğrafları ve gerçek ürün logoları."

colors:                      # logo: #0F4A74 (yazı), #0050A4 (royal), #0088C8 (camgöbeği)
  brand: "#0055a4"
  brand-hover: "#004689"
  brand-pressed: "#003a72"
  brand-bright: "#0a8fd6"
  brand-tint: "#eaf3fc"
  brand-tint-2: "#cfe4f7"
  grad-brand: "linear-gradient(135deg, #0a63b8, #0055a4, #0f4a74)"   # CTA / iletişim panelleri
  navy: "#0c3b5e"            # yalnızca footer
  navy-2: "#0f4a74"          # üst bilgi bandı
  ink: "#122033"
  ink-muted: "#4f5d6e"
  canvas: "#ffffff"
  surface-1: "#f4f7fb"
  hairline: "#e1e8f0"

typography:
  display: "Archivo 700/800 (başlıklar, rakamlar) — eski sitenin ve Orex'in başlık fontu"
  body: "Figtree 400-700"
  source: "@fontsource ile self-host, latin-ext (Türkçe) dahil"

shape:
  radius: "10px buton/input, 16px kart, 24px panel/görsel, pill etiketler"
  shadow: "mavi tonlu yumuşak gölgeler (--shadow-sm, --shadow-md, --shadow-brand)"

imagery:
  - "Hero: müze galerisi, kütüphane, arşiv deposu (Unsplash) — açık mavi karartma"
  - "Ürünler: resmi ürün logoları (public/assets/products)"
  - "Neden MirAkıl: arşiv rafları fotoğrafı"

motion: "Motion (motion.dev) ile yaylı giriş animasyonları, sayaçlar, hero slider, modül sekmeleri, referans logo bandı (durdur düğmeli), hover lift; prefers-reduced-motion'a uyar"
---

## Kurallar

- **Tek baskın renk: logo mavisi.** Ürün renkleri kullanılmaz; ürün kimliği resmi logolarla verilir.
- **Aydınlık sayfa.** Koyu zemin yalnızca footer'da. Paneller mavi degrade, siyahımsı değil.
- **Eşit gridler** (4/3/2), bento yok. Kartlar: beyaz, 1px çizgi, 16px köşe, hover'da yukarı kalkar.
- **Başlıklar** Archivo 800, altında 56px mavi çizgi (`.section-head`).
- **Butonlar:** `.btn` (mavi), `.btn--tertiary` (beyaz çerçeveli), `.btn--outline-light` (koyu/mavi zemin üstü), `.btn--on-brand` (mavi panel üstü beyaz).
- **Görseller:** müze, arşiv ve kütüphane fotoğrafları birlikte kullanılır.

Tokenların kaynağı: `src/styles/global.css` (`:root`). Paylaşılan parçalar: `src/styles/components.css`.
