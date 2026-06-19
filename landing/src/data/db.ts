/**
 * Veri tek kaynağı: ../../../database (sonbirarsa/database).
 * Tüm JSON'lar build sırasında import.meta.glob ile paketlenir. Kanonik kaynak
 * database/ klasörüdür; bu modül onu salt-okunur tüketir (kopya yok).
 */
const modules = import.meta.glob("../../../database/**/*.json", { eager: true });

export const rawFiles: Record<string, unknown> = {};
for (const [path, mod] of Object.entries(modules)) {
  // path: "../../../database/sections/01-hero.json" -> "sections/01-hero.json"
  const rel = path.replace(/^.*\/database\//, "");
  rawFiles[rel] = (mod as { default?: unknown }).default ?? mod;
}

export const fileCount = Object.keys(rawFiles).length;

export function getFile<T = unknown>(rel: string): T {
  const f = rawFiles[rel];
  if (f === undefined) throw new Error(`Veri dosyası bulunamadı: ${rel}`);
  return f as T;
}
