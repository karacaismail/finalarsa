// v3 · alt-detay katmanı. master_plan'daki alt_detay sekmesini (GENİŞ düzen) okur:
//   satır = alt-kalem (küme,kalem,alt_detay,not) · sütun = ay (ISO "2026-09" başlıklar)
//   değer hücreleri OPEX/DİJİTAL PAZARLAMA/CAPEX kaynak hücrelerine formülle bağlıdır (canlı).
// Uygulama yalnız OKUR; sekme yok/erişilemezse modal "yüklenemedi" der, uygulama çökmez.
import { parseCsv, mpNum } from "./masterplan";

export interface AltDetay { ad: string; tl: number; not?: string; }
export type SubMap = Map<string, AltDetay[]>;

export const MP3_SHEET_ID = "1BVY3JGHnFM52CSwNBFlrg7VCBgGi0vIIVKJ68YW6RTk";
export const SUBDETAILS_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${MP3_SHEET_ID}/export?format=csv&gid=1664340550`;

const trLow = (s: string) => (s || "").trim().toLocaleLowerCase("tr");

export const subKey = (ym: string, kume: string, kalem: string) => `${ym}|${kume}|${kalem}`;

export function parseSubdetailsCsv(csv: string): SubMap {
  const map: SubMap = new Map();
  const rows = parseCsv(csv || "");
  if (rows.length < 2) return map;
  const hdr = rows[0];
  const aylar: Array<{ ym: string; j: number }> = [];
  hdr.forEach((h, j) => { if (/^\d{4}-\d{2}$/.test((h || "").trim())) aylar.push({ ym: h.trim(), j }); });
  if (!aylar.length) return map;
  for (const r of rows.slice(1)) {
    const kume = (r[0] || "").trim(), kalem = (r[1] || "").trim(), ad = (r[2] || "").trim();
    const not = (r[3] || "").trim() || undefined;
    if (!kume || !kalem || !ad) continue;
    for (const { ym, j } of aylar) {
      const tl = mpNum(r[j] ?? "");
      if (tl <= 0) continue;
      const key = subKey(ym, kume, kalem);
      const list = map.get(key) ?? [];
      list.push({ ad, tl, not });
      map.set(key, list);
    }
  }
  return map;
}

// Toleranslı kalem eşleşmesi: önce birebir anahtar; yoksa aynı ym|küme altında
// TR-lower substring (uygulama adı ⊂ sheet adı ya da tersi).
export function findSubdetails(map: SubMap, ym: string, kume: string, kalemAd: string): AltDetay[] | null {
  const exact = map.get(subKey(ym, kume, kalemAd));
  if (exact?.length) return exact;
  const hedef = trLow(kalemAd);
  const prefix = `${ym}|${kume}|`;
  for (const [key, rows] of map) {
    if (!key.startsWith(prefix)) continue;
    const sheetAd = trLow(key.slice(prefix.length));
    if (sheetAd.includes(hedef) || hedef.includes(sheetAd)) return rows;
  }
  return null;
}

export async function fetchSubdetails(url: string = SUBDETAILS_CSV_URL): Promise<SubMap> {
  const res = await fetch(url, { cache: "no-store" });
  return parseSubdetailsCsv(await res.text());
}
