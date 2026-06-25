// arsam.net — Finansal gider takibi (v2) — TEK KAYNAK.
// Mimari: aylık girişler (months) tek doğru kaynaktır; tüm toplam/grafikler bundan türetilir.
// Para değerleri TL (TRY) tabanında saklanır; ekranda seçilen para birimine çevrilir.

export type Currency = "TRY" | "USD" | "EUR";

// 7 sabit kategori (giriş formu satırları). group: hangi üst kaleme ait.
export type CatKey = "personel" | "pazarlama" | "saha" | "dijital" | "ofis" | "yazilim" | "capex";

export interface Category {
  key: CatKey;
  label: string;
  group: "opex" | "pazarlama" | "capex";
}

export interface MonthEntry {
  ym: string; // "2026-07"
  values: Record<CatKey, number>; // TL
}

export interface Rates {
  TRY: number;
  USD: number;
  EUR: number;
}

export interface Benchmarks {
  editable: false;
  title: string;
  disclaimer: string;
  softwareSalaries: { role: string; min: number; max: number; region: string }[];
  professions: { role: string; min: number; max: number; region: string }[];
  cLevel: { company: string; min: number; max: number; note: string }[];
}

export interface Cpo {
  editable: boolean;
  title: string;
  note: string;
  salary: { period: string; payUsd: number }[];
  car: { period: string; segment: string }[];
  fuel: string;
  health: string;
  leave: string;
}

export interface FinansalData {
  meta: {
    schemaVersion: string;
    updatedAt: string;
    baseCurrency: Currency;
    rates: Rates; // 1 birim = kaç TRY
  };
  categories: Category[];
  months: MonthEntry[];
  benchmarks: Benchmarks;
  cpo: Cpo;
}

export const SCHEMA_VERSION = "2.0.0";

export const CATEGORIES: Category[] = [
  { key: "personel", label: "Personel (SGK dahil)", group: "opex" },
  { key: "pazarlama", label: "Pazarlama", group: "pazarlama" },
  { key: "saha", label: "Saha operasyonu", group: "opex" },
  { key: "dijital", label: "Dijital altyapı & AI", group: "opex" },
  { key: "ofis", label: "Ofis & idari", group: "opex" },
  { key: "yazilim", label: "Yazılım & AI araçları", group: "opex" },
  { key: "capex", label: "CAPEX (yatırım)", group: "capex" },
];

// OPEX toplamını 5 alt kaleme bölen oranlar (olgun-dönem 2031 kompozisyonu, pazarlama hariç).
export const OPEX_RATIOS: Record<"personel" | "saha" | "dijital" | "ofis" | "yazilim", number> = (() => {
  const base = { personel: 18453600, saha: 2280000, dijital: 5658813, ofis: 2580000, yazilim: 1398000 };
  const sum = base.personel + base.saha + base.dijital + base.ofis + base.yazilim;
  return {
    personel: base.personel / sum,
    saha: base.saha / sum,
    dijital: base.dijital / sum,
    ofis: base.ofis / sum,
    yazilim: base.yazilim / sum,
  };
})();

// Kaynak aylık model (gerçek): 18 ay (Tem 2026 → Ara 2027). opex = pazarlama hariç OPEX toplamı.
const SOURCE_18: { opex: number; pazarlama: number; capex: number }[] = [
  { opex: 1727733, pazarlama: 128205, capex: 2955408 },
  { opex: 1901088, pazarlama: 143590, capex: 103385 },
  { opex: 2074444, pazarlama: 158974, capex: 114462 },
  { opex: 2247799, pazarlama: 174359, capex: 125538 },
  { opex: 2421155, pazarlama: 189744, capex: 136615 },
  { opex: 2594511, pazarlama: 205128, capex: 147692 },
  { opex: 5401875, pazarlama: 769231, capex: 64615 },
  { opex: 5610667, pazarlama: 811189, capex: 68140 },
  { opex: 5819458, pazarlama: 853147, capex: 71664 },
  { opex: 6028249, pazarlama: 895105, capex: 75189 },
  { opex: 6237041, pazarlama: 937063, capex: 78713 },
  { opex: 6445832, pazarlama: 979021, capex: 82238 },
  { opex: 6654623, pazarlama: 1020979, capex: 85762 },
  { opex: 6863415, pazarlama: 1062937, capex: 89287 },
  { opex: 7072206, pazarlama: 1104895, capex: 92811 },
  { opex: 7280997, pazarlama: 1146853, capex: 96336 },
  { opex: 7489789, pazarlama: 1188811, capex: 99860 },
  { opex: 7698580, pazarlama: 1230769, capex: 103385 },
];

export const DEFAULT_MONTH_COUNT = 24;
const START_YEAR = 2026;
const START_MONTH = 7; // Temmuz

const AYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

// "2026-07" -> "Tem 2026"
export function ayLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${AYLAR[(m - 1 + 12) % 12]} ${y}`;
}

// Başlangıç ayından itibaren n ay üret: ["2026-07", ...]
export function ymList(n: number = DEFAULT_MONTH_COUNT): string[] {
  const out: string[] = [];
  let y = START_YEAR;
  let m = START_MONTH;
  for (let i = 0; i < n; i++) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return out;
}

// OPEX toplamını 5 alt kaleme böl; yuvarlama kalanı en büyük kaleme (personel) eklenir → toplam birebir korunur.
export function dagitOpex(opexToplam: number): Record<"personel" | "saha" | "dijital" | "ofis" | "yazilim", number> {
  const o = Math.round(opexToplam);
  const saha = Math.round(o * OPEX_RATIOS.saha);
  const dijital = Math.round(o * OPEX_RATIOS.dijital);
  const ofis = Math.round(o * OPEX_RATIOS.ofis);
  const yazilim = Math.round(o * OPEX_RATIOS.yazilim);
  const personel = o - saha - dijital - ofis - yazilim; // kalan en büyük kaleme
  return { personel, saha, dijital, ofis, yazilim };
}

// 24 aylık default veriyi gerçek modelden üret (19-24. ay son artış hızıyla uzatılır).
export function seedDefault(): MonthEntry[] {
  const src = SOURCE_18.slice();
  const dOpex = src[17].opex - src[16].opex;
  const dPaz = src[17].pazarlama - src[16].pazarlama;
  const dCap = src[17].capex - src[16].capex;
  for (let i = 18; i < DEFAULT_MONTH_COUNT; i++) {
    const prev = src[i - 1];
    src.push({ opex: prev.opex + dOpex, pazarlama: prev.pazarlama + dPaz, capex: prev.capex + dCap });
  }
  const yms = ymList(DEFAULT_MONTH_COUNT);
  return src.map((row, i) => {
    const sub = dagitOpex(row.opex);
    return {
      ym: yms[i],
      values: {
        personel: sub.personel,
        saha: sub.saha,
        dijital: sub.dijital,
        ofis: sub.ofis,
        yazilim: sub.yazilim,
        pazarlama: Math.round(row.pazarlama),
        capex: Math.round(row.capex),
      },
    };
  });
}

const BENCHMARKS: Benchmarks = {
  editable: false,
  title: "Piyasa istatistikleri (referans · KİLİTLİ)",
  disclaimer:
    "Aşağıdaki rakamlar bağlam içindir; piyasa tahminidir, resmî/kesin değildir (C-level ücretleri kamuya kapalıdır). Bu bölüm düzenlenemez. Değerler aylık ve seçilen para biriminde gösterilir.",
  softwareSalaries: [
    { role: "Yazılımcı — Junior", min: 35000, max: 65000, region: "Türkiye · aylık net (tahmini)" },
    { role: "Yazılımcı — Mid", min: 65000, max: 120000, region: "Türkiye · aylık net (tahmini)" },
    { role: "Yazılımcı — Senior", min: 120000, max: 220000, region: "Türkiye · aylık net (tahmini)" },
    { role: "Yazılımcı — Lead/Principal", min: 200000, max: 350000, region: "Türkiye · aylık net (tahmini)" },
  ],
  professions: [
    { role: "Kıdemli avukat", min: 50000, max: 150000, region: "Türkiye · aylık (tahmini)" },
    { role: "Mali müşavir (SMMM)", min: 60000, max: 180000, region: "Türkiye · aylık (tahmini)" },
    { role: "Harita mühendisi", min: 40000, max: 90000, region: "Türkiye · aylık (tahmini)" },
    { role: "Uzman doktor (özel)", min: 100000, max: 300000, region: "Türkiye · aylık (tahmini)" },
  ],
  cLevel: [
    { company: "sahibinden.com — C-level", min: 600000, max: 1500000, note: "aylık brüt + hisse (tahmini · kamuya kapalı)" },
    { company: "Trendyol — C-level", min: 800000, max: 2500000, note: "aylık brüt + hisse/opsiyon (tahmini · kamuya kapalı)" },
    { company: "amazon.com.tr (Amazon TR) — C-level", min: 700000, max: 2000000, note: "aylık brüt + RSU (tahmini · kamuya kapalı)" },
  ],
};

const CPO: Cpo = {
  editable: true,
  title: "CPO — özel/sosyal haklar ve yan haklar",
  note: "Maaş USD-endekslidir; ay-sonu USD/TL kuru ile TL ödenir. Diğer kalemler model varsayımıdır.",
  salary: [
    { period: "2026 (mevcut taban)", payUsd: 7500 },
    { period: "2027 başı (zam)", payUsd: 10000 },
    { period: "1 Haziran 2027", payUsd: 15000 },
  ],
  car: [
    { period: "2026–2027 başlangıç", segment: "Škoda Superb · Toyota Camry · VW Passat · Audi A5" },
    { period: "2027 Haziran", segment: "Volvo S60 — bir üst segment" },
    { period: "2028", segment: "BMW 520+ · Mercedes-Benz E 220+ · Audi A6 · Volvo S90" },
  ],
  fuel: "Yılda 25.000 km'ye kadar yakıt şirketçe karşılanır; şirket yakıt kartıyla anlaşmalı istasyonlarda ücretsiz.",
  health: "Aile dahil, genel ve tam kapsamlı özel sağlık sigortası.",
  leave: "Yıllık senelik izne ek 1 hafta kış tatili; senelik izin ve kış tatili için aile dahil tatil bütçesi.",
};

export const DEFAULT_DATA: FinansalData = {
  meta: {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: "2026-06-25",
    baseCurrency: "TRY",
    rates: { TRY: 1, USD: 45.2, EUR: 49.0 },
  },
  categories: CATEGORIES,
  months: seedDefault(),
  benchmarks: BENCHMARKS,
  cpo: CPO,
};
