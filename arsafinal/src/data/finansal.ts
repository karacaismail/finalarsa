// arsam.net — Aylık Gider Modeli (v4) — TEK KAYNAK.
// "Her ay ne harcayacağız?" → kümeler (personel/capex/sürekli/…) + kalem kırılımı, accordion.
// Personel kümesi 256 rolden + bordro motorundan TÜRETİLİR (kurucu: net-hedef, kümülatif vergi).
// Diğer kümeler geçmiş veriden tohumlanır, hepsi düzenlenebilir parametredir.

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
  yemekAylik: number;                  // ₺/ay/kişi
  yolAylik: number;                    // ₺/ay/kişi
  hosgeldinKisi: number;               // ₺/yeni işe alım (tek sefer)
  ikramiyeMaasYil: number;             // yılda kaç maaş
  perHireCapex: number;                // ₺/yeni işe alım ekipman
  kuruculKod: string;                  // net-hedefli rol kodu (R-CPO)
}

export interface FounderStep { fromYm: string; netUsd: number; }
export interface AracStep { fromYm: string; segment: string; aylikTl: number; } // CPO araç kiralama (operasyonel, aylık)

// Olgun (256 kişi) aylık küme değerleri — headcount ile ölçeklenir. Hepsi düzenlenebilir.
export interface OlgunDegerler {
  kira: number; depozito: number;      // ofis (kira sabit; depozito ilk ay)
  utilities: number;                   // internet+elektrik+su+… toplam (256 kişi)
  yazilim: number;                     // dijital altyapı + yazılım araçları (256 kişi)
  saha: number;                        // saha operasyonu (256 kişi)
  profesyonel: number;                 // muhasebe+hukuk+danışmanlık (256, İSG hariç)
  isgAylik: number;                    // İSG/OSGB (sabit, ≥1 çalışan)
}
export interface UtilSplit { internet: number; elektrik: number; su: number; dogalgaz: number; mutfak: number; sarf: number; kirtasiye: number; temizlik: number; }
export interface CapexKalem { ad: string; tl: number; }

export interface FinansalData {
  meta: { schemaVersion: string; updatedAt: string; baseCurrency: Currency };
  params: Params;
  bordro: BordroParams;
  founder: FounderStep[];
  arac: AracStep[];
  roles: Role[];
  capex: CapexKalem[];                 // ilk-ay yatırım kalemleri
  olgun: OlgunDegerler;
  utilSplit: UtilSplit;                // sürekli giderlerin yüzde dağılımı (toplamı 1)
  pazarlama: { ym: string; tl: number }[]; // aya göre pazarlama (reklam) harcaması
}

export const SCHEMA_VERSION = "5.1.0";
export const MATURE_HC = 256;

const AYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
export function ayLabel(ym: string): string { const [y, m] = ym.split("-").map(Number); return `${AYLAR[(m - 1 + 12) % 12]} ${y}`; }

export const DEFAULT_MONTH_COUNT = 24;
const START_YEAR = 2026, START_MONTH = 9; // Eylül 2026
export function ymList(n = DEFAULT_MONTH_COUNT): string[] {
  const out: string[] = []; let y = START_YEAR, m = START_MONTH;
  for (let i = 0; i < n; i++) { out.push(`${y}-${String(m).padStart(2, "0")}`); m++; if (m > 12) { m = 1; y++; } }
  return out;
}

// Pazarlama (reklam) aylık — geçmiş modelden (128.205 → 1.230.769), pencereye re-key + uzatma.
const PAZ_SRC = [128205, 143590, 158974, 174359, 189744, 205128, 769231, 811189, 853147, 895105, 937063, 979021, 1020979, 1062937, 1104895, 1146853, 1188811, 1230769];
function seedPazarlama(): { ym: string; tl: number }[] {
  const src = PAZ_SRC.slice(); const d = src[17] - src[16];
  while (src.length < DEFAULT_MONTH_COUNT + 2) src.push(src[src.length - 1] + d);
  return ymList().map((ym, i) => ({ ym, tl: Math.round(src[i + 2]) })); // Eyl2026 = src index 2
}

export const DEFAULT_DATA: FinansalData = {
  meta: { schemaVersion: SCHEMA_VERSION, updatedAt: "2026-06-25", baseCurrency: "TRY" },
  params: {
    usd: 46.52, eur: 50,
    isverenSgkOran: 0.2375, yemekAylik: 6000, yolAylik: 3000, hosgeldinKisi: 5950,
    ikramiyeMaasYil: 1, perHireCapex: 24000, kuruculKod: "R-CPO",
  },
  bordro: PARAMS_2026,
  founder: [
    { fromYm: "2026-09", netUsd: 7500 },
    { fromYm: "2027-01", netUsd: 10000 },
    { fromYm: "2027-06", netUsd: 15000 },
  ],
  // CPO araç tahsisi — operasyonel kiralama (aylık ödeme). Segment ~yılda bir yükselir (eski proje verisi).
  // Aylık kira KDV hariç temsilî; 2026'da kiranın yalnız 46.000 ₺'lik kısmı gider yazılabilir (kalanı KKEG).
  arac: [
    { fromYm: "2026-09", segment: "Insignia / Škoda Superb / Camry / Passat / Audi A5", aylikTl: 95000 },
    { fromYm: "2027-06", segment: "Volvo S60 (üst segment)", aylikTl: 110000 },
    { fromYm: "2028-01", segment: "BMW 520+ / Mercedes E 220+ / Audi A6 / Volvo S90", aylikTl: 160000 },
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
  ],
  olgun: { kira: 150000, depozito: 450000, utilities: 2430000, yazilim: 7056813, saha: 2280000, profesyonel: 200000, isgAylik: 8000 },
  utilSplit: { internet: 0.10, elektrik: 0.22, su: 0.06, dogalgaz: 0.10, mutfak: 0.24, sarf: 0.12, kirtasiye: 0.06, temizlik: 0.10 },
  pazarlama: seedPazarlama(),
};
