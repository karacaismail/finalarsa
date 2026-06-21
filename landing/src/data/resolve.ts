import { getFile, rawFiles } from "./db";
import type { Metric, Section } from "./types";

/** shared/metrics.json — tüm rakamların tek kaynağı. */
const metricsDoc = getFile<{ metrics: Record<string, Metric> }>("shared/metrics.json");
export const metrics: Record<string, Metric> = metricsDoc.metrics;

export function getMetric(key: string): Metric | undefined {
  const m = metrics[key];
  if (!m && import.meta.env.DEV) console.warn(`[metrics] eksik anahtar: ${key}`);
  return m;
}

/** Metnin içindeki display değerini döndürür ({{metric:key}} -> metric.display). */
export const METRIC_TOKEN = /\{\{metric:([a-zA-Z0-9_.]+)\}\}/g;
export function interpolate(text: string): string {
  return text.replace(METRIC_TOKEN, (_, k: string) => getMetric(k)?.display ?? `«${k}»`);
}

/** Bölümler, order'a göre sıralı. */
export const sections: Section[] = Object.entries(rawFiles)
  .filter(([p]) => p.startsWith("sections/"))
  .map(([, v]) => v as Section)
  .sort((a, b) => a.order - b.order);

/** Paylaşılan kümeler. */
export const brand = getFile<Record<string, unknown>>("shared/brand.json");
export const glossary = getFile<{ terms: Record<string, string> }>("shared/glossary.json");
export const sources = getFile<{ items: Record<string, { label: string; full: string }> }>(
  "shared/sources.json",
);
// NOT: shared/design-tokens.json artık LEGACY belge; UI runtime'ı onu tüketmez.
// Renk/tema tek kaynağı: landing/src/theme/palette.ts (+ semantic/components/charts).

/** data/<name>.json */
export function getData<T = unknown>(name: string): T {
  return getFile<T>(`data/${name}.json`);
}
