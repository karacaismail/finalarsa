// Saf hesap fonksiyonları — UI'dan bağımsız, test edilebilir.
// ZİNCİR: roller + maliyet parametreleri → aylık personel; + 6 manuel kalem → aylık toplam.
import type { CostParams, Currency, ManualCatKey, MonthEntry, Rates, Role } from "../data/finansal";
import { MANUAL_CATEGORIES } from "../data/finansal";

export interface Resolvable { roles: Role[]; costParams: CostParams; months: MonthEntry[]; }

export function rate(rates: Rates, c: Currency): number {
  return c === "TRY" ? rates.TRY : c === "USD" ? rates.USD : rates.EUR;
}
export function trToDisp(tl: number, disp: Currency, rates: Rates): number { return tl / rate(rates, disp); }
export function dispToTr(d: number, disp: Currency, rates: Rates): number { return d * rate(rates, disp); }

// Bir rolün AYLIK yüklü maliyeti (TL): brüt × SGK çarpanı × (1 + ikramiye/12) + yemek + yan haklar.
export function roleMonthlyCost(r: Role, p: CostParams): number {
  return r.brutMaas * p.isverenSgkCarpan * (1 + p.ikramiyeMaasYil / 12) + p.yemekAylik + p.yanHaklarAylik;
}
// Rol o ay aktif mi? (işe alım ayı ≤ o ay)
export function aktif(r: Role, ym: string): boolean { return r.istihdamYm <= ym; }
// O ay aktif rol sayısı
export function aktifSayi(roles: Role[], ym: string): number { return roles.reduce((s, r) => (aktif(r, ym) ? s + 1 : s), 0); }
// O ayın PERSONEL gideri (TL) = aktif rollerin yüklü maliyet toplamı
export function personelAy(roles: Role[], p: CostParams, ym: string): number {
  return roles.reduce((s, r) => (aktif(r, ym) ? s + roleMonthlyCost(r, p) : s), 0);
}

// 6 manuel kalemin o ay toplamı (TL)
export function manuelToplam(m: MonthEntry): number {
  return MANUAL_CATEGORIES.reduce((s, c) => s + (m.values[c.key] || 0), 0);
}
// O ayın TOPLAM gideri (TL) = personel (rollerden) + 6 manuel kalem
export function ayToplamTL(d: Resolvable, m: MonthEntry): number {
  return personelAy(d.roles, d.costParams, m.ym) + manuelToplam(m);
}

// Tüm kategorilerin (personel + 6 manuel) tüm-ay alt toplamı (TL)
export function kategoriAltToplam(d: Resolvable): { personel: number } & Record<ManualCatKey, number> {
  const acc = { personel: 0, pazarlama: 0, saha: 0, dijital: 0, ofis: 0, yazilim: 0, capex: 0 };
  for (const m of d.months) {
    acc.personel += personelAy(d.roles, d.costParams, m.ym);
    for (const c of MANUAL_CATEGORIES) acc[c.key] += m.values[c.key] || 0;
  }
  return acc;
}
export function genelToplam(d: Resolvable): number {
  return d.months.reduce((s, m) => s + ayToplamTL(d, m), 0);
}
export function aylikSeri(d: Resolvable): { ym: string; toplam: number }[] {
  return d.months.map((m) => ({ ym: m.ym, toplam: ayToplamTL(d, m) }));
}
export function kumulatifSeri(d: Resolvable): { ym: string; toplam: number }[] {
  let acc = 0;
  return d.months.map((m) => { acc += ayToplamTL(d, m); return { ym: m.ym, toplam: acc }; });
}
export function headcountSeri(d: Resolvable): { ym: string; sayi: number }[] {
  return d.months.map((m) => ({ ym: m.ym, sayi: aktifSayi(d.roles, m.ym) }));
}
