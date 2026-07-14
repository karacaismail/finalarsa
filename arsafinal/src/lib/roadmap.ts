// Yol Haritası adaptörü — master_plan'ın "DİJİTAL PAZARLAMA" ve "GELİR SENARYOSU"
// sekmelerini (public, gviz CSV) okuyup proje yol haritası verisine çevirir.
// SAF fonksiyonlar: fetch → parse → türet. Kümülatif toplamlar KENDİMİZ hesaplanır
// ve sheet'in KÜMÜLATİF satırıyla mutabakat testinden geçer (roadmap.test.ts).
//
// Kaynak satırlar:
//   DİJİTAL PAZARLAMA → "TOPLAM DİJİTAL PAZARLAMA" (aylık pazarlama bütçesi)
//   GELİR SENARYOSU   → "TOPLAM AYLIK GELİR (Arsa + Emlak)" (aylık gelir),
//                       "KÜMÜLATİF GELİR" (mutabakat referansı),
//                       "Toplam İlan Sayısı (Arsa)" (kilometre taşı eşiği),
//                       "Arsa Hedef Pazar Payı (SOM %)" (pay hedefi).
import { parseCsv, mpNum, MP_SHEET_ID } from "./masterplan";

const gvizUrl = (name: string) =>
  `https://docs.google.com/spreadsheets/d/${MP_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;

// TR diakritik sadeleştirme (masterplan.ts ile aynı kural; sheet "Agu"/"Sub" yazar).
const nrm = (s: string) =>
  (s || "").trim().toLocaleLowerCase("tr")
    .replace(/ğ/g, "g").replace(/ş/g, "s").replace(/ı/g, "i").replace(/i̇/g, "i")
    .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c");

const AY_NRM = ["oca", "sub", "mar", "nis", "may", "haz", "tem", "agu", "eyl", "eki", "kas", "ara"];
const AY_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

// Yüzde metnini sayıya çevir: "15,0%" → 15, "0,6%" → 0.6, "" → 0.
export function mpPct(s: string): number {
  const t = (s || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(t);
  return isNaN(n) ? 0 : n;
}

// Ay başlık satırından ym listesi çıkar: header[j] "Tem 26" → { ym:"2026-07", col:j }.
// Yalnız ay-formatlı sütunlar döner (baştaki başlık hücresi ve boş kuyruk elenir).
export interface AyKolon { ym: string; col: number; label: string; }
export function monthColumns(header: string[]): AyKolon[] {
  const out: AyKolon[] = [];
  header.forEach((cell, j) => {
    const m = nrm(cell).match(/^([a-z]{3})\s*(\d{2})$/);
    if (!m) return;
    const mi = AY_NRM.indexOf(m[1]);
    if (mi < 0) return;
    const y = 2000 + Number(m[2]);
    out.push({ ym: `${y}-${String(mi + 1).padStart(2, "0")}`, col: j, label: `${AY_KISA[mi]} ${m[2]}` });
  });
  return out;
}

// Etiketi içeren ilk satırı bul (toleranslı; nrm ile).
function findRow(grid: string[][], labelIncludes: string): string[] | undefined {
  const key = nrm(labelIncludes);
  return grid.find((r) => nrm(r[0] || "").includes(key));
}

export interface RoadmapTabs { paz: string[][]; gelir: string[][]; }

export async function fetchRoadmapTabs(): Promise<RoadmapTabs> {
  const get = (name: string) => fetch(gvizUrl(name), { cache: "no-store" }).then((r) => r.text()).then(parseCsv);
  const [paz, gelir] = await Promise.all([get("DİJİTAL PAZARLAMA"), get("GELİR SENARYOSU")]);
  return { paz, gelir };
}

// Bir aylık nokta: pazarlama + gelir (aylık ve kümülatif) + ilan + SOM pay.
export interface RoadmapPoint {
  ym: string;             // "2026-07"
  label: string;          // "Tem 26"
  pazAy: number;          // aylık pazarlama bütçesi (₺)
  pazKum: number;         // kümülatif pazarlama (₺) — kendimiz hesapladık
  gelirAy: number;        // aylık gelir (₺)
  gelirKum: number;       // kümülatif gelir (₺) — kendimiz hesapladık
  ilan: number;           // Toplam İlan Sayısı (Arsa)
  somPct: number;         // Arsa Hedef Pazar Payı (SOM %) — 0..100
}

// Kilometre taşı: sheet verisinden türetilen bir eşiğe İLK ulaşılan ay.
export interface Milestone {
  key: string;
  ad: string;             // kısa başlık
  ym: string | null;      // ulaşıldığı ay (null = veri içinde ulaşılamadı)
  label: string | null;
  not: string;            // eşiğin nasıl türetildiği / varsayım notu
}

export interface RoadmapModel {
  points: RoadmapPoint[];
  milestones: Milestone[];
  toplamPazarlama: number;   // tüm dönem kümülatif pazarlama (son nokta)
  toplamGelir: number;       // tüm dönem kümülatif gelir (son nokta)
  sonSomPct: number;         // plateau SOM payı (max)
  // Mutabakat için sheet'in KÜMÜLATİF GELİR satırının son değeri (varsa).
  sheetGelirKumSon: number;
}

// Eşiğe ilk ulaşan noktayı döndür (predicate true olan ilk ay).
function firstWhere(points: RoadmapPoint[], pred: (p: RoadmapPoint) => boolean): RoadmapPoint | undefined {
  return points.find(pred);
}

// SAF: sheet sekmelerinden yol haritası modelini kur. Kümülatifleri KENDİMİZ toplarız.
export function buildRoadmap(tabs: RoadmapTabs): RoadmapModel {
  const pHead = tabs.paz[0] || [];
  const gHead = tabs.gelir[0] || [];
  // Ay eksenini GELİR sekmesinden al (asıl zaman çizgisi); pazarlama aynı ay başlıklarını taşır.
  const cols = monthColumns(gHead.length ? gHead : pHead);

  const pazT = findRow(tabs.paz, "toplam dijital pazarlama");
  const gelirT = findRow(tabs.gelir, "toplam aylik gelir");
  const gelirKumRow = findRow(tabs.gelir, "kumulatif gelir");
  const ilanRow = findRow(tabs.gelir, "toplam ilan sayisi (arsa");
  const somRow = findRow(tabs.gelir, "arsa hedef pazar payi");

  // Pazarlama sekmesinin kendi ay kolonları (başlık aynı desende ama ayrı ızgara).
  const pCols = monthColumns(pHead);
  const pColByYm = new Map(pCols.map((c) => [c.ym, c.col]));

  let pazKum = 0, gelirKum = 0;
  const points: RoadmapPoint[] = cols.map((c) => {
    const pCol = pColByYm.get(c.ym);
    const pazAy = pazT && pCol !== undefined ? mpNum(pazT[pCol]) : 0;
    const gelirAy = gelirT ? mpNum(gelirT[c.col]) : 0;
    pazKum += pazAy;
    gelirKum += gelirAy;
    return {
      ym: c.ym,
      label: c.label,
      pazAy,
      pazKum,
      gelirAy,
      gelirKum,
      ilan: ilanRow ? mpNum(ilanRow[c.col]) : 0,
      somPct: somRow ? mpPct(somRow[c.col]) : 0,
    };
  });

  const sonSomPct = points.reduce((m, p) => Math.max(m, p.somPct), 0);
  const sheetGelirKumSon = gelirKumRow
    ? mpNum(gelirKumRow[cols[cols.length - 1]?.col ?? -1] ?? "")
    : 0;

  // ---- Kilometre taşları (sheet verisinden türetilir) ----
  // Soft-launch: ilk anlamlı ilan (Arsa ilan sayısı ilk kez > 0 olan ay) — 2026 H2 minimal aktivite.
  const soft = firstWhere(points, (p) => p.ilan > 0);
  // Resmî lansman: aylık gelir ilk kez 1.000.000 ₺ eşiğini aşan ay (B2B satış sinyali; ~Oca 2027).
  const resmi = firstWhere(points, (p) => p.gelirAy >= 1_000_000);
  // Plateau: SOM payı hedef tavanına (%15) ilk ulaşan ay (2028+ istikrarlı dönem).
  const plateau = firstWhere(points, (p) => p.somPct >= 15);
  // Ara SOM hedefleri: %5 ve %10 paya ilk ulaşılan aylar.
  const som5 = firstWhere(points, (p) => p.somPct >= 5);
  const som10 = firstWhere(points, (p) => p.somPct >= 10);

  const milestones: Milestone[] = [
    {
      key: "soft",
      ad: "Soft-launch (2026 H2)",
      ym: soft?.ym ?? null,
      label: soft?.label ?? null,
      not: "İlk Arsa ilanı yayına girer (İlan Sayısı > 0). 2026 ikinci yarısı: sınırlı gelir, platform doğrulama dönemi.",
    },
    {
      key: "som5",
      ad: "SOM %5 payı",
      ym: som5?.ym ?? null,
      label: som5?.label ?? null,
      not: "Arsa Hedef Pazar Payı ilk kez %5. Erken büyüme aşaması.",
    },
    {
      key: "resmi",
      ad: "Resmî lansman (Oca 2027)",
      ym: resmi?.ym ?? null,
      label: resmi?.label ?? null,
      not: "Aylık gelir ilk kez 1.000.000 ₺ eşiğini aşar (B2B satışların başlangıç sinyali).",
    },
    {
      key: "som10",
      ad: "SOM %10 payı",
      ym: som10?.ym ?? null,
      label: som10?.label ?? null,
      not: "Arsa Hedef Pazar Payı ilk kez %10. Ölçeklenme aşaması.",
    },
    {
      key: "plateau",
      ad: "Plateau — SOM tavanı (2028+)",
      ym: plateau?.ym ?? null,
      label: plateau?.label ?? null,
      not: "Arsa Hedef Pazar Payı hedef tavanına (%15) ulaşır ve sabitlenir; büyüme yavaşlar, gelir istikrarlı seyreder.",
    },
  ];

  return {
    points,
    milestones,
    toplamPazarlama: points.length ? points[points.length - 1].pazKum : 0,
    toplamGelir: points.length ? points[points.length - 1].gelirKum : 0,
    sonSomPct,
    sheetGelirKumSon,
  };
}

// ---- İki-tab navigasyon durum yardımcıları (App.tsx tab state için saf mantık) ----
export type TabKey = "finansal" | "roadmap";

// Roadmap sayfası yalnız v2 (sheetMode) + roadmap sekmesi seçiliyken gösterilir.
export function showRoadmap(sheetMode: boolean, tab: TabKey): boolean {
  return sheetMode && tab === "roadmap";
}
// Tab'a tıklandığında yeni aktif tab (idempotent — aynı tab'a tıklamak durumu korur).
export function selectTab(_current: TabKey, next: TabKey): TabKey {
  return next;
}
