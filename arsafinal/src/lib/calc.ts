// Saf hesap fonksiyonları — UI'dan bağımsız, test edilebilir.
import type { CatKey, Currency, MonthEntry, Rates } from "../data/finansal";

export function rate(rates: Rates, c: Currency): number {
  return c === "TRY" ? rates.TRY : c === "USD" ? rates.USD : rates.EUR;
}

// TL → seçilen para birimi
export function trToDisp(tl: number, disp: Currency, rates: Rates): number {
  return tl / rate(rates, disp);
}
// Seçilen para birimi → TL
export function dispToTr(d: number, disp: Currency, rates: Rates): number {
  return d * rate(rates, disp);
}

// Bir ayın 7 kategori toplamı (TL)
export function ayToplam(entry: MonthEntry): number {
  const v = entry.values;
  return v.personel + v.pazarlama + v.saha + v.dijital + v.ofis + v.yazilim + v.capex;
}

// Kategori bazında tüm ayların alt toplamı (TL)
export function kategoriAltToplam(months: MonthEntry[]): Record<CatKey, number> {
  const acc: Record<CatKey, number> = {
    personel: 0, pazarlama: 0, saha: 0, dijital: 0, ofis: 0, yazilim: 0, capex: 0,
  };
  for (const m of months) {
    (Object.keys(acc) as CatKey[]).forEach((k) => { acc[k] += m.values[k]; });
  }
  return acc;
}

// Genel toplam (tüm ay, tüm kategori) — TL
export function genelToplam(months: MonthEntry[]): number {
  return months.reduce((s, m) => s + ayToplam(m), 0);
}

// Aylık toplam serisi (grafik için) — TL
export function aylikSeri(months: MonthEntry[]): { ym: string; toplam: number }[] {
  return months.map((m) => ({ ym: m.ym, toplam: ayToplam(m) }));
}

// Kümülatif (artan) toplam serisi — TL
export function kumulatifSeri(months: MonthEntry[]): { ym: string; toplam: number }[] {
  let acc = 0;
  return months.map((m) => { acc += ayToplam(m); return { ym: m.ym, toplam: acc }; });
}
