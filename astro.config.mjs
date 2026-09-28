// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages: https://mehmetfatruk.github.io/mirakil_web2/
// build.format 'file' keeps the legacy URLs (koha.html, destek.html ...) stable for SEO.
export default defineConfig({
  site: 'https://mehmetfatruk.github.io',
  base: '/mirakil_web2',
  build: { format: 'file' },
  trailingSlash: 'ignore',
});
