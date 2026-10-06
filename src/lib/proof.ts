// Evidence derived from the reference list (src/data/references.json), so the numbers on
// the site always match the institutions people (and AI assistants) can check.
import references from '../data/references.json';

type Ref = (typeof references.items)[number];
const items: Ref[] = references.items;
const has = (r: Ref, tag: string) => r.tag.includes(tag);

export const referenceCount = items.length;

/** Projects that moved data out of another library system. */
export const migrations = items.filter((r) => has(r, 'Sistem göçü') || /sisteminden veri aktarımı/.test(r.desc));

/** Legacy systems we migrated from, most frequent first ("Milas sisteminden" -> "Milas"). */
export const migratedFrom: string[] = (() => {
  const counts = new Map<string, number>();
  for (const r of items) {
    const m = r.desc.match(/(\S+) sisteminden/);
    if (m && m[1] !== 'yerel') counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
})();

const byName = (name: string) => {
  const r = items.find((i) => i.name === name);
  if (!r) throw new Error(`references.json: "${name}" not found`);
  return r;
};

/** Hand-picked case studies; the result text and figures come from references.json. */
export const caseStudies = [
  { ref: byName('Tapu ve Kadastro Genel Müdürlüğü'), figure: '30 milyon', unit: 'sayfa', icon: 'fas fa-copy' },
  { ref: byName('Milli Savunma Üniversitesi'), figure: '160.000', unit: 'materyal', icon: 'fas fa-layer-group' },
  { ref: byName('Strateji ve Bütçe Başkanlığı'), figure: 'Koha + VuFind', unit: "SirsiDynix'ten geçiş", icon: 'fas fa-right-left' },
  { ref: byName('Tarım ve Orman Bakanlığı'), figure: '5 yıllık', unit: 'bakım sözleşmesi', icon: 'fas fa-seedling' },
].map((c) => ({ ...c, name: c.ref.name, desc: c.ref.desc, tag: c.ref.tag }));
