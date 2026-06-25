// arsam.net — Finansal gider takibi (v3) — TEK KAYNAK.
// ZİNCİR: Kadro (roller) → aylık personel gideri (o ay aktif rollerin yüklü maliyeti)
//          → aylık toplam (+ 6 manuel kalem) → Özet/grafik.
// Personel kalemi ARTIK rollerden TÜRETİLİR (Giriş'te salt-okunur). Diğer 6 kalem elle düzenlenir.
// Para değerleri TL tabanında saklanır; ekranda seçilen para birimine çevrilir.

import { ROLES } from "./roles";

export type Currency = "TRY" | "USD" | "EUR";

// Kadro rolü (Kaynak: İK PLANI tablosu). brutMaas = aylık brüt ₺; istihdamYm = "2026-08".
export interface Role {
  sira: number;
  kod: string;
  ad: string;
  departman: string;
  kademe: string;
  unvan: string;
  brutMaas: number;
  istihdamYm: string;
}

// Maaş→toplam personel maliyeti modeli (düzenlenebilir politika parametreleri).
export interface CostParams {
  isverenSgkCarpan: number; // brüt × bu = brüt + işveren SGK/vergi (ör. 1.225 ≈ %22.5 işveren payı)
  yemekAylik: number;       // ₺/ay/kişi yemek
  yanHaklarAylik: number;   // ₺/ay/kişi yan haklar (ulaşım, sağlık vb.)
  ikramiyeMaasYil: number;  // yılda kaç maaş ikramiye (aylığa /12 yansır)
}

// 6 manuel (personel-dışı) kategori.
export type ManualCatKey = "pazarlama" | "saha" | "dijital" | "ofis" | "yazilim" | "capex";
export interface ManualCategory { key: ManualCatKey; label: string; }
export interface MonthEntry { ym: string; values: Record<ManualCatKey, number>; } // TL

export interface Rates { TRY: number; USD: number; EUR: number; }

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
  fuel: string; health: string; leave: string;
}

export interface FinansalData {
  meta: { schemaVersion: string; updatedAt: string; baseCurrency: Currency; rates: Rates };
  costParams: CostParams;
  roles: Role[];
  categories: ManualCategory[];
  months: MonthEntry[];
  benchmarks: Benchmarks;
  cpo: Cpo;
}

export const SCHEMA_VERSION = "3.0.0";

export const MANUAL_CATEGORIES: ManualCategory[] = [
  { key: "pazarlama", label: "Pazarlama (reklam/medya harcaması)" },
  { key: "saha", label: "Saha operasyonu" },
  { key: "dijital", label: "Dijital altyapı & AI" },
  { key: "ofis", label: "Ofis & idari" },
  { key: "yazilim", label: "Yazılım & AI araçları" },
  { key: "capex", label: "CAPEX (yatırım)" },
];

// Personel-dışı kalemler için oranlar (eski OPEX kompozisyonu; tahmini, düzenlenebilir).
export const OPEX_RATIOS = { saha: 0.0751, dijital: 0.1863, ofis: 0.0850, yazilim: 0.0460 };

// Personel-dışı aylık kaynak (gerçek modelden; pazarlama+capex birebir, diğerleri OPEX oranı).
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
const START_MONTH = 9; // Eylül 2026 (kullanıcı kararı)
const SRC_OFFSET = 2;  // SOURCE_18[0]=Tem2026 → Eyl2026 = index 2

const AYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export function ayLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${AYLAR[(m - 1 + 12) % 12]} ${y}`;
}
export function ymList(n: number = DEFAULT_MONTH_COUNT): string[] {
  const out: string[] = [];
  let y = START_YEAR, m = START_MONTH;
  for (let i = 0; i < n; i++) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
}

// 6 manuel kalemin 24 aylık tohumu (Eyl2026→Ağu2028). Tahmini; kullanıcı düzenler.
export function seedManual(): MonthEntry[] {
  const src = SOURCE_18.slice();
  const dO = src[17].opex - src[16].opex, dP = src[17].pazarlama - src[16].pazarlama, dC = src[17].capex - src[16].capex;
  while (src.length < DEFAULT_MONTH_COUNT + SRC_OFFSET) {
    const p = src[src.length - 1];
    src.push({ opex: p.opex + dO, pazarlama: p.pazarlama + dP, capex: p.capex + dC });
  }
  return ymList(DEFAULT_MONTH_COUNT).map((ym, i) => {
    const s = src[i + SRC_OFFSET];
    return {
      ym,
      values: {
        pazarlama: Math.round(s.pazarlama),
        saha: Math.round(s.opex * OPEX_RATIOS.saha),
        dijital: Math.round(s.opex * OPEX_RATIOS.dijital),
        ofis: Math.round(s.opex * OPEX_RATIOS.ofis),
        yazilim: Math.round(s.opex * OPEX_RATIOS.yazilim),
        capex: Math.round(s.capex),
      },
    };
  });
}

const BENCHMARKS: Benchmarks = {
  editable: false,
  title: "Piyasa istatistikleri (referans · KİLİTLİ)",
  disclaimer:
    "Bağlam içindir; piyasa tahminidir, resmî/kesin değildir (C-level ücretleri kamuya kapalıdır). Düzenlenemez. Değerler aylık ve seçilen para biriminde.",
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
    { company: "sahibinden.com — C-level", min: 600000, max: 1500000, note: "aylık brüt + hisse (tahmini)" },
    { company: "Trendyol — C-level", min: 800000, max: 2500000, note: "aylık brüt + hisse/opsiyon (tahmini)" },
    { company: "amazon.com.tr — C-level", min: 700000, max: 2000000, note: "aylık brüt + RSU (tahmini)" },
  ],
};

const CPO: Cpo = {
  editable: true,
  title: "CPO — özel/sosyal haklar (referans)",
  note: "Maaş USD-endekslidir; ay-sonu kuru ile TL ödenir. Model varsayımı.",
  salary: [
    { period: "2026 (taban)", payUsd: 7500 },
    { period: "2027 başı", payUsd: 10000 },
    { period: "1 Haziran 2027", payUsd: 15000 },
  ],
  car: [
    { period: "2026–2027", segment: "Škoda Superb · Toyota Camry · VW Passat · Audi A5" },
    { period: "2027 Haziran", segment: "Volvo S60 — bir üst segment" },
    { period: "2028", segment: "BMW 520+ · Mercedes-Benz E 220+ · Audi A6 · Volvo S90" },
  ],
  fuel: "Yılda 25.000 km'ye kadar yakıt şirketçe (anlaşmalı istasyon, yakıt kartı).",
  health: "Aile dahil, tam kapsamlı özel sağlık sigortası.",
  leave: "Senelik izne ek 1 hafta kış tatili; izin ve kış tatili için aile dahil tatil bütçesi.",
};

export const DEFAULT_DATA: FinansalData = {
  meta: { schemaVersion: SCHEMA_VERSION, updatedAt: "2026-06-25", baseCurrency: "TRY", rates: { TRY: 1, USD: 45.2, EUR: 49.0 } },
  costParams: { isverenSgkCarpan: 1.225, yemekAylik: 6000, yanHaklarAylik: 4000, ikramiyeMaasYil: 1 },
  roles: ROLES,
  categories: MANUAL_CATEGORIES,
  months: seedManual(),
  benchmarks: BENCHMARKS,
  cpo: CPO,
};
