// arsam.net — Aylık Gider Modeli (v6) — TEK KAYNAK.
// "Her ay ne harcayacağız?" → kümeler (personel/capex/sürekli/…) + kalem kırılımı, accordion.
// Personel kümesi 256 rolden + bordro motorundan TÜRETİLİR (kurucu: net-hedef, kümülatif vergi).
// OPEX kümeleri (sürekli/ofis/yazılım/pazarlama/profesyonel/saha) ARTIK ym-bazlı MUTLAK değerlerden gelir
//   (kaynak: master_plan OPEX + DİJİTAL PAZARLAMA sayfaları). Eski headcount-ölçekleme (olgun×fac) KALDIRILDI.

import { ROLES } from "./roles";
import { PARAMS_2026 } from "../lib/payroll";
import type { BordroParams } from "../lib/payroll";

export type Currency = "TRY" | "USD" | "EUR";

export interface Role {
  sira: number; kod: string; ad: string; departman: string;
  kademe: string; unvan: string; brutMaas: number; istihdamYm: string;
}

// Maaş→maliyet ve yan hak parametreleri (düzenlenebilir politika).
export interface Params {
  usd: number; eur: number;            // 1 birim = kaç TL
  isverenSgkOran: number;              // 0,2375 teşviksiz | 0,2175 (2 puan)
  yemekAylik: number;                  // yemek BAZ ₺/ay/kişi (herkes)
  yemekTeamLead: number;               // yemek — Team Lead ₺/ay
  yemekClevel: number;                 // yemek — C-level ₺/ay
  yolAylik: number;                    // ₺/ay/kişi
  hosgeldinKisi: number;               // ₺/yeni işe alım (tek sefer)
  perHireCapex: number;                // ₺/yeni işe alım ekipman
  yazilimGelistirmeUsd: number;        // CAPEX'e USD-bazlı yazılım geliştirme ücreti (kura bağlı)
  kuruculKod: string;                  // net-hedefli rol kodu (R-CPO)
}

export interface FounderStep { fromYm: string; netUsd: number; }
export interface AracStep { fromYm: string; segment: string; aylikTl: number; } // CPO araç kiralama (operasyonel, aylık)
// İkramiye olayı: belirli ayda, brüt maaşın pct'i kadar prim (bayram öncesi/yıl-sonu öderler).
export interface IkramiyeOlay { ym: string; pct: number; ad: string; }

// ym-bazlı OPEX (mutlak ₺/ay). Her ay kendi gerçek bütçesiyle gösterilir (ölçekleme yok).
export interface OpexAy {
  ym: string;
  internet: number; elektrik: number; su: number; dogalgaz: number;       // sürekli giderler
  mutfak: number; sarf: number; kirtasiye: number; temizlik: number;       // sürekli giderler
  guvenlik: number;                                                        // güvenlik & sigorta (profesyonel)
  dijitalAltyapi: number; aiAraclar: number;                               // yazılım / SaaS & AI
  pazarlama: number;                                                       // dijital reklam / medya
  muhasebeHukuk: number; isg: number; saha: number;                        // profesyonel + saha
}
export interface CapexKalem { ad: string; tl: number; }

export interface FinansalData {
  meta: { schemaVersion: string; updatedAt: string; baseCurrency: Currency };
  params: Params;
  bordro: BordroParams;
  founder: FounderStep[];
  arac: AracStep[];
  ikramiye: IkramiyeOlay[];
  roles: Role[];
  capex: CapexKalem[];                 // ilk-ay yatırım kalemleri
  kira: number;                        // ofis kirası ₺/ay (sabit)
  depozito: number;                    // ilk ay depozito (2 ay)
  opex: OpexAy[];                      // ym-bazlı mutlak OPEX
}

export const SCHEMA_VERSION = "6.1.3";

const AYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
export function ayLabel(ym: string): string { const [y, m] = ym.split("-").map(Number); return `${AYLAR[(m - 1 + 12) % 12]} ${y}`; }

export const DEFAULT_MONTH_COUNT = 24;
const START_YEAR = 2026, START_MONTH = 9; // Eylül 2026
export function ymList(n = DEFAULT_MONTH_COUNT): string[] {
  const out: string[] = []; let y = START_YEAR, m = START_MONTH;
  for (let i = 0; i < n; i++) { out.push(`${y}-${String(m).padStart(2, "0")}`); m++; if (m > 12) { m = 1; y++; } }
  return out;
}

// ym-bazlı OPEX tablosu (Eyl 2026 → Ağu 2028). Kaynak: master_plan OPEX + DİJİTAL PAZARLAMA.
// Eylül pazarlama = 0 (lansman öncesi). Doğalgaz mevsimsel (yaz 0). Saha lansman sonrası rampalanır.
export const OPEX: OpexAy[] = [
  { ym: "2026-09", internet: 3000, elektrik: 3284, su: 1847, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 41500, aiAraclar: 76989, pazarlama: 207000, muhasebeHukuk: 20000, isg: 8000, saha: 0 },
  { ym: "2026-10", internet: 3000, elektrik: 3327, su: 1871, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 49500, aiAraclar: 126496, pazarlama: 343000, muhasebeHukuk: 21500, isg: 8000, saha: 0 },
  { ym: "2026-11", internet: 3000, elektrik: 3370, su: 1895, dogalgaz: 4000, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 59000, aiAraclar: 146470, pazarlama: 391000, muhasebeHukuk: 23000, isg: 8000, saha: 0 },
  { ym: "2026-12", internet: 3000, elektrik: 3414, su: 1920, dogalgaz: 8000, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 71000, aiAraclar: 160000, pazarlama: 658000, muhasebeHukuk: 24500, isg: 8000, saha: 0 },
  { ym: "2027-01", internet: 3000, elektrik: 3441, su: 1935, dogalgaz: 8000, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 84000, aiAraclar: 212475, pazarlama: 782000, muhasebeHukuk: 26000, isg: 8000, saha: 0 },
  { ym: "2027-02", internet: 3000, elektrik: 3468, su: 1951, dogalgaz: 8000, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 99000, aiAraclar: 216461, pazarlama: 914000, muhasebeHukuk: 27500, isg: 8000, saha: 0 },
  { ym: "2027-03", internet: 3000, elektrik: 3496, su: 1967, dogalgaz: 4000, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 117000, aiAraclar: 232985, pazarlama: 1160000, muhasebeHukuk: 29000, isg: 8000, saha: 20000 },
  { ym: "2027-04", internet: 3000, elektrik: 3524, su: 1982, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 138000, aiAraclar: 258480, pazarlama: 1291000, muhasebeHukuk: 30500, isg: 8000, saha: 40000 },
  { ym: "2027-05", internet: 3000, elektrik: 3552, su: 1998, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 162000, aiAraclar: 275371, pazarlama: 1423000, muhasebeHukuk: 32000, isg: 8000, saha: 60000 },
  { ym: "2027-06", internet: 3000, elektrik: 3581, su: 2014, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 189000, aiAraclar: 333530, pazarlama: 1627000, muhasebeHukuk: 33500, isg: 8000, saha: 80000 },
  { ym: "2027-07", internet: 3000, elektrik: 3610, su: 2030, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 216000, aiAraclar: 352811, pazarlama: 1757000, muhasebeHukuk: 35000, isg: 8000, saha: 100000 },
  { ym: "2027-08", internet: 3000, elektrik: 3638, su: 2047, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 245000, aiAraclar: 369406, pazarlama: 1770000, muhasebeHukuk: 36500, isg: 8000, saha: 120000 },
  { ym: "2027-09", internet: 3000, elektrik: 3668, su: 2063, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 273000, aiAraclar: 387985, pazarlama: 1940000, muhasebeHukuk: 38000, isg: 8000, saha: 140000 },
  { ym: "2027-10", internet: 3000, elektrik: 3697, su: 2079, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 302000, aiAraclar: 394965, pazarlama: 1987000, muhasebeHukuk: 39500, isg: 8000, saha: 160000 },
  { ym: "2027-11", internet: 3000, elektrik: 3726, su: 2096, dogalgaz: 4000, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 331000, aiAraclar: 436170, pazarlama: 2078000, muhasebeHukuk: 41000, isg: 8000, saha: 180000 },
  { ym: "2027-12", internet: 3000, elektrik: 3756, su: 2113, dogalgaz: 8000, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 362000, aiAraclar: 455183, pazarlama: 2196000, muhasebeHukuk: 42500, isg: 8000, saha: 200000 },
  { ym: "2028-01", internet: 3000, elektrik: 3786, su: 2130, dogalgaz: 8000, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 363740, aiAraclar: 466123, pazarlama: 2220624, muhasebeHukuk: 44000, isg: 8000, saha: 220000 },
  { ym: "2028-02", internet: 3000, elektrik: 3816, su: 2147, dogalgaz: 8000, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 365488, aiAraclar: 470784, pazarlama: 2295267, muhasebeHukuk: 45500, isg: 8000, saha: 240000 },
  { ym: "2028-03", internet: 3000, elektrik: 3847, su: 2164, dogalgaz: 4000, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 367245, aiAraclar: 475492, pazarlama: 2304448, muhasebeHukuk: 47000, isg: 8000, saha: 260000 },
  { ym: "2028-04", internet: 3000, elektrik: 3878, su: 2181, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 369010, aiAraclar: 484634, pazarlama: 2313666, muhasebeHukuk: 48500, isg: 8000, saha: 280000 },
  { ym: "2028-05", internet: 3000, elektrik: 3908, su: 2199, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 370784, aiAraclar: 489480, pazarlama: 2322920, muhasebeHukuk: 50000, isg: 8000, saha: 300000 },
  { ym: "2028-06", internet: 3000, elektrik: 3940, su: 2216, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 372566, aiAraclar: 495495, pazarlama: 2332211, muhasebeHukuk: 51500, isg: 8000, saha: 320000 },
  { ym: "2028-07", internet: 3000, elektrik: 3971, su: 2234, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 374358, aiAraclar: 504969, pazarlama: 2341539, muhasebeHukuk: 53000, isg: 8000, saha: 340000 },
  { ym: "2028-08", internet: 3000, elektrik: 4003, su: 2252, dogalgaz: 0, mutfak: 5000, sarf: 5000, kirtasiye: 5000, temizlik: 5000, guvenlik: 4000, dijitalAltyapi: 376158, aiAraclar: 510019, pazarlama: 2350905, muhasebeHukuk: 54500, isg: 8000, saha: 360000 },
];

export const DEFAULT_DATA: FinansalData = {
  meta: { schemaVersion: SCHEMA_VERSION, updatedAt: "2026-06-26", baseCurrency: "TRY" },
  params: {
    usd: 46.52, eur: 50,
    isverenSgkOran: 0.2375, yemekAylik: 9000, yemekTeamLead: 10000, yemekClevel: 15000, yolAylik: 3300, hosgeldinKisi: 5950,
    perHireCapex: 24000, yazilimGelistirmeUsd: 18000, kuruculKod: "R-CPO",
  },
  bordro: PARAMS_2026,
  founder: [
    { fromYm: "2026-08", netUsd: 7500 },
    { fromYm: "2027-01", netUsd: 10000 },
    { fromYm: "2027-06", netUsd: 15000 },
  ],
  // CPO araç tahsisi — operasyonel kiralama (aylık ödeme). CPO Eylül'de başlar → araç Eylül'den itibaren.
  arac: [
    { fromYm: "2026-09", segment: "Škoda Superb / Camry / VW Passat B9 / Audi A5 / Mercedes C (W206)", aylikTl: 95000 },
    { fromYm: "2027-06", segment: "Volvo S60 (üst segment)", aylikTl: 110000 },
    { fromYm: "2028-01", segment: "BMW 520+ / Mercedes E 220+ / Audi A6 / Volvo S90", aylikTl: 160000 },
  ],
  ikramiye: [
    { ym: "2026-03", pct: 0.25, ad: "Ramazan Bayramı primi" },
    { ym: "2026-05", pct: 0.25, ad: "Kurban Bayramı primi" },
    { ym: "2026-12", pct: 0.30, ad: "Yılsonu performans primi" },
    { ym: "2026-12", pct: 0.20, ad: "Yılbaşı primi" },
    { ym: "2027-03", pct: 0.25, ad: "Ramazan Bayramı primi" },
    { ym: "2027-05", pct: 0.25, ad: "Kurban Bayramı primi" },
    { ym: "2027-12", pct: 0.30, ad: "Yılsonu performans primi" },
    { ym: "2027-12", pct: 0.20, ad: "Yılbaşı primi" },
    { ym: "2028-02", pct: 0.25, ad: "Ramazan Bayramı primi" },
    { ym: "2028-05", pct: 0.25, ad: "Kurban Bayramı primi" },
    { ym: "2028-12", pct: 0.30, ad: "Yılsonu performans primi" },
    { ym: "2028-12", pct: 0.20, ad: "Yılbaşı primi" },
  ],
  roles: ROLES,
  capex: [
    { ad: "Bilgisayar & ekipman", tl: 1265000 },
    { ad: "Ofis kurulumu", tl: 1100000 },
    { ad: "Mutfak & sosyal alan", tl: 173000 },
    { ad: "Marka & logo", tl: 110000 },
    { ad: "Diğer (donanım/sarf)", tl: 86200 },
    { ad: "Şirket kuruluş & hukuk", tl: 50000 },
    { ad: "İlk kampanya materyali", tl: 20000 },
    { ad: "Obsbot Tail Air 4K PTZ Webcam (3 toplantı odası · tahmini)", tl: 60000 },
    { ad: "Yaka mikrofonu seti", tl: 25000 },
    { ad: "Toplantı bilgisayarı (1 masaüstü + 2 laptop)", tl: 150000 },
    { ad: "Beyaz tahtalar", tl: 20000 },
    { ad: "Hava temizleyici", tl: 75000 },
  ],
  kira: 150000,
  depozito: 300000,
  opex: OPEX,
};
