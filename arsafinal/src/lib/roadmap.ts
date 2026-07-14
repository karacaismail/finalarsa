// Yol Haritası adaptörü (v2) — YENİDEN TASARIM.
// SADECE proje ilerleyişi (aksiyon/çıktı) türetir; FİNANSAL VERİ İÇERMEZ.
// Kaynak: master_plan "İK PLANI" sekmesi (canlı gviz CSV). Bir rolün aylık TRUE/FALSE
// matrisinde İLK TRUE olduğu ay = o rolün ekibe "katıldığı" ay. Fazlar ve GTM aksiyonları
// proje mantığından sabit tanımlı (baraj: koda gömülü + doğru ay eşlemesi). Bkz. roadmap.test.ts.
//
// İK PLANI sekme yapısı (gviz CSV, 0-index):
//   satır 0: başlık · satır 1: "Aylık Net Maaş tutarı" · satır 2: kolon başlıkları
//   A/0 Rol Kodu · B/1 Rol Adı · C/2 Job Family · F/5 Kademe · G/6 Ünvan · H/7 Aday · I/8 net maaş
//   J/9'dan itibaren aylık TRUE/FALSE matrisi. Sheet'te J+ başlıkları BOŞ → ay ekseni POZİSYONEL.
import { parseCsv, MP_SHEET_ID, mpNum } from "./masterplan";

const gvizUrl = (name: string) =>
  `https://docs.google.com/spreadsheets/d/${MP_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;

const AY_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const AY_NRM = ["oca", "sub", "mar", "nis", "may", "haz", "tem", "agu", "eyl", "eki", "kas", "ara"];

// TR diakritik sadeleştirme (masterplan.ts ile aynı kural).
const nrm = (s: string) =>
  (s || "").trim().toLocaleLowerCase("tr")
    .replace(/ğ/g, "g").replace(/ş/g, "s").replace(/ı/g, "i").replace(/i̇/g, "i")
    .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c");

export type IkGrid = string[][];

// ── Sabit ay ekseni bağlantısı ──────────────────────────────────────────────
// İK PLANI matrisi J sütunundan (index 9) başlar ve o sütun Eyl 2026'ya (2026-09) denk gelir.
// (roles.ts istihdamYm ile mutabık: R-CPO=2026-09, ilk TRUE'su col9.) Sheet başlık satırında
// ay adı yoksa POZİSYONEL eksen kullanılır; bir gün başlık ay adı taşırsa monthAxis onu tercih eder.
export const IK_ANCHOR_COL = 9;
export const IK_ANCHOR_YM = "2026-09";
// Timeline penceresi: yol haritası SADECE 2026-07 … 2027-03 aylarını gösterir.
// (Nisan 2027 ve sonrası dahil edilmez; 2028+ fazlar timeline'a girmez.) Bkz. roadmap.test.ts.
export const TIMELINE_END_YM = "2027-03";
const [ANCHOR_Y, ANCHOR_M] = IK_ANCHOR_YM.split("-").map(Number); // 2026, 9

// "2026-09" → "Eyl 26"
export function ymLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${AY_KISA[m - 1]} ${String(y).slice(2)}`;
}
// (yıl, ay0-based) ekle: anchor + offset ay → "YYYY-MM"
function ymFromOffset(offset: number): string {
  const total = (ANCHOR_Y * 12 + (ANCHOR_M - 1)) + offset;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

// İK PLANI'ndaki sabit kolon indeksleri (metin başlığından bağımsız, konumsal).
const IK_COLS = { kod: 0, ad: 1, jobFamily: 2, kademe: 5, unvan: 6, aday: 7, net: 8 } as const;
export function ikColumn(which: keyof typeof IK_COLS): number { return IK_COLS[which]; }

export interface AyKolon { ym: string; col: number; label: string; }

// Ay eksenini kur. Öncelik: başlık satırında (satır 2) ay-formatlı hücre varsa onu kullan.
// Aksi halde POZİSYONEL: J sütunundan (IK_ANCHOR_COL) matris genişliğince, col9 = anchor ay.
export function monthAxis(grid: IkGrid): AyKolon[] {
  const header = grid[2] || [];
  // 1) Başlıkta ay adı var mı? ("Eyl 26" gibi) — varsa ADIYLA eşle.
  const labelled: AyKolon[] = [];
  header.forEach((cell, j) => {
    if (j < IK_ANCHOR_COL) return;
    const m = nrm(cell).match(/^([a-z]{3})\s*(\d{2})$/);
    if (!m) return;
    const mi = AY_NRM.indexOf(m[1]);
    if (mi < 0) return;
    const y = 2000 + Number(m[2]);
    labelled.push({ ym: `${y}-${String(mi + 1).padStart(2, "0")}`, col: j, label: `${AY_KISA[mi]} ${m[2]}` });
  });
  if (labelled.length) return labelled;

  // 2) Pozisyonel: matris genişliğini rol satırlarından (satır 3+) sapta.
  let maxCol = IK_ANCHOR_COL - 1;
  for (let r = 3; r < grid.length; r++) {
    const row = grid[r];
    if (!row || !(row[IK_COLS.kod] || "").trim()) continue;
    for (let j = row.length - 1; j >= IK_ANCHOR_COL; j--) {
      const v = (row[j] || "").trim().toUpperCase();
      if (v === "TRUE" || v === "FALSE") { if (j > maxCol) maxCol = j; break; }
    }
  }
  const out: AyKolon[] = [];
  for (let j = IK_ANCHOR_COL; j <= maxCol; j++) {
    const ym = ymFromOffset(j - IK_ANCHOR_COL);
    out.push({ ym, col: j, label: ymLabel(ym) });
  }
  return out;
}

// Bir işe alım kaydı — SADECE kimlik/rol bilgisi (PARA YOK).
export interface Hire { kod: string; ad: string; kademe: string; jobFamily: string; }

const isTrue = (s: string) => (s || "").trim().toUpperCase() === "TRUE";

// Her ay için o ay İLK KEZ TRUE olan (ekibe yeni katılan) rollerin listesi.
export function hiresByMonth(grid: IkGrid): Map<string, Hire[]> {
  const axis = monthAxis(grid);
  const colToYm = new Map(axis.map((a) => [a.col, a.ym]));
  const byMonth = new Map<string, Hire[]>();
  for (let r = 3; r < grid.length; r++) {
    const row = grid[r];
    const kod = (row?.[IK_COLS.kod] || "").trim();
    if (!kod) continue;
    // İlk TRUE olan ay kolonunu bul (eksen sırasıyla).
    let firstCol = -1;
    for (const a of axis) { if (isTrue(row[a.col])) { firstCol = a.col; break; } }
    if (firstCol < 0) continue; // hiç TRUE yok → hiçbir aya katılmaz
    const ym = colToYm.get(firstCol)!;
    const hire: Hire = {
      kod,
      ad: (row[IK_COLS.ad] || "").trim() || kod,
      kademe: (row[IK_COLS.kademe] || "").trim(),
      jobFamily: (row[IK_COLS.jobFamily] || "").trim(),
    };
    const arr = byMonth.get(ym) ?? [];
    arr.push(hire);
    byMonth.set(ym, arr);
  }
  return byMonth;
}

// ── Build-time snapshot ─────────────────────────────────────────────────────
// Yol haritasının İHTİYACI OLAN MİNİMAL veri: her rol için kimlik + katılım ayı.
// PARA YOK. Snapshot build-anında bir kez türetilip src/data/roadmap-snapshot.json'a
// yazılır (bkz. scripts/roadmap-snapshot.mjs) ve runtime'da ANINDA import edilir —
// böylece sayfa canlı gviz fetch'ini beklemek zorunda kalmaz, asla "yükleniyor"da takılmaz.
export interface RoadmapSnapshotRow {
  kod: string;
  ad: string;
  jobFamily: string;
  kademe: string;
  joinYm: string; // rolün ilk aktif (TRUE) ayı, "YYYY-MM"
}

// SAF: İK PLANI ızgarasından snapshot satırları türet.
// Bir rolün joinYm'i = matriste İLK TRUE olduğu ay sütunu (pozisyonel eksen, col9 = 2026-09).
// Yalnız joinYm <= TIMELINE_END_YM (Mar 2027) roller alınır; kronolojik (joinYm) sıralı döner.
export function deriveSnapshot(grid: IkGrid): RoadmapSnapshotRow[] {
  const byMonth = hiresByMonth(grid);
  const rows: RoadmapSnapshotRow[] = [];
  for (const [joinYm, hires] of byMonth) {
    if (joinYm > TIMELINE_END_YM) continue; // pencere dışı roller snapshot'a girmez
    for (const h of hires) {
      rows.push({ kod: h.kod, ad: h.ad, jobFamily: h.jobFamily, kademe: h.kademe, joinYm });
    }
  }
  // joinYm'e göre kronolojik, aynı ay içinde kod'a göre kararlı sıralama.
  rows.sort((a, b) => (a.joinYm < b.joinYm ? -1 : a.joinYm > b.joinYm ? 1 : a.kod < b.kod ? -1 : a.kod > b.kod ? 1 : 0));
  return rows;
}

// ── Proje fazları (koda gömülü sabit + ay eşlemesi) ─────────────────────────
// FİNANSAL RAKAM İÇERMEZ. Her faz bir başlangıç ayından (baslaYm) başlar; bir ay,
// başlangıcı kendisinden küçük/eşit son faza aittir (phaseForYm).
export interface Phase {
  key: string;
  ad: string;
  aciklama: string;
  baslaYm: string;    // fazın başladığı ay (dahil)
  vurgu?: boolean;    // öne çıkan kilometre taşı (resmî lansman)
}
export const PHASES: Phase[] = [
  {
    key: "kurulus", ad: "Kuruluş", baslaYm: "2026-07",
    aciklama: "Şirket kuruluşu, ofis kurulumu, çekirdek ekip toplama ve yazılım geliştirmenin başlangıcı (Tem–Ağu 2026).",
  },
  {
    key: "cekirdek", ad: "Çekirdek ekip & ürün geliştirme", baslaYm: "2026-09",
    aciklama: "İlk kilit roller işe alınır (strateji, ürün, mühendislik, tasarım); platformun MVP geliştirmesi tam hızda ilerler.",
  },
  {
    key: "soft", ad: "Soft-launch (2026 H2)", baslaYm: "2026-11",
    aciklama: "Kapalı/sınırlı yayına alma: ilk ilanlar, erken kullanıcı geri bildirimi ve platform doğrulaması. Ekip mühendislik ve operasyonla genişler.",
  },
  {
    key: "lansman", ad: "Resmî Lansman — B2B satış başlar", baslaYm: "2027-01", vurgu: true,
    aciklama: "Platform kamuya açık resmî lansmana geçer; B2B satış motoru devreye girer. Satış, growth ve müşteri operasyonları ekipleri kurulur.",
  },
  {
    key: "olcekleme", ad: "Ölçekleme (2027)", baslaYm: "2027-02",
    aciklama: "Ekip hızla büyür (mühendislik, ürün, growth, CX); ürün yetenekleri ve pazar kapsamı genişletilir, saha operasyonları ölçeklenir.",
  },
  {
    key: "plato", ad: "Plateau / İstikrar (2028+)", baslaYm: "2028-01",
    aciklama: "Organizasyon olgunlaşır; büyüme dengeli bir istikrara oturur, işe alım hızı yavaşlar, operasyonel verimlilik ve ürün derinliği önceliklenir.",
  },
];

// Bir ym'nin ait olduğu faz: başlangıcı ≤ ym olan SON faz.
export function phaseForYm(ym: string): Phase | null {
  let cur: Phase | null = null;
  for (const p of PHASES) { if (p.baslaYm <= ym) cur = p; else break; }
  return cur;
}

// ── GTM (go-to-market) aksiyonları — sabit tanım, lansman civarı aylara ─────
// Ege yıldız ilçeleri + araçlı saha keşif + saha satış ekipleri.
interface GtmDef { ym: string; aksiyonlar: string[]; }
const GTM_DEFS: GtmDef[] = [
  {
    ym: "2026-12", aksiyonlar: [
      "Ege yıldız ilçeleri hedef listesi: Bodrum, Çeşme, Urla, Didim, Kuşadası.",
      "Araçlı saha keşif ekibi hazırlığı: bölge envanteri ve arsa sahibi haritalama.",
    ],
  },
  {
    ym: "2027-01", aksiyonlar: [
      "Bodrum & Çeşme'de saha satış ekipleri sahaya çıkar (resmî lansmanla eşzamanlı B2B satış).",
      "Araçlı saha keşif turları başlar: yerinde arsa doğrulama ve ilan toplama.",
    ],
  },
  {
    ym: "2027-03", aksiyonlar: [
      "Urla, Didim ve Kuşadası'na saha satış yayılımı; bölgesel emlak ofisi iş birlikleri.",
    ],
  },
];

// ── Aylık aksiyon çizelgesi (zigzag timeline için) ─────────────────────────
export interface TimelineMonth {
  ym: string;
  label: string;         // "Eyl 26"
  index: number;         // 0-based sıra (zigzag)
  side: "left" | "right"; // çift index sol, tek sağ
  phase: Phase | null;   // o ayın fazı (yalnız faz BAŞLADIĞI ayda dolu → kilometre taşı)
  phaseStart: boolean;   // bu ay bir fazın başlangıç ayı mı
  hires: Hire[];         // o ay ekibe katılan roller
  gtm: string[];         // o ayın GTM aksiyonları
}
export interface RoadmapTimeline {
  months: TimelineMonth[];
  toplamRol: number;     // türetilen toplam işe alım (rol) sayısı
  ilkYm: string | null;
  sonYm: string | null;
}

// ── Ortak timeline kurucu ────────────────────────────────────────────────────
// Aylık işe-alım tablosundan (ym → Hire[]) faz + GTM overlay'i ile zigzag çizelge kur.
// buildTimeline (canlı grid) ve buildTimelineFromSnapshot (build-time snapshot) bunu paylaşır.
function assembleTimeline(hiresByYm: Map<string, Hire[]>, toplamRol: number): RoadmapTimeline {
  const gtmByYm = new Map(GTM_DEFS.map((g) => [g.ym, g.aksiyonlar]));

  // İçerikli tüm ayları topla: faz başlangıçları + işe-alım ayları + GTM ayları.
  const ymSet = new Set<string>();
  for (const p of PHASES) ymSet.add(p.baslaYm);
  for (const ym of hiresByYm.keys()) ymSet.add(ym);
  for (const g of GTM_DEFS) ymSet.add(g.ym);

  // Timeline penceresi: yalnız 2027-03 (dahil) ve öncesi aylar. Nis 2027+ ile 2028+ fazlar düşer.
  const sorted = [...ymSet].filter((ym) => ym <= TIMELINE_END_YM).sort();
  const seenPhase = new Set<string>();
  const months: TimelineMonth[] = sorted.map((ym, i) => {
    const ph = phaseForYm(ym);
    // Faz kartı YALNIZ fazın başladığı ilk görünen ayda (kilometre taşı) işaretlenir.
    const phaseStart = !!ph && ph.baslaYm === ym && !seenPhase.has(ph.key);
    if (phaseStart) seenPhase.add(ph!.key);
    return {
      ym,
      label: ymLabel(ym),
      index: i,
      side: i % 2 === 0 ? "left" : "right",
      phase: phaseStart ? ph : null,
      phaseStart,
      hires: hiresByYm.get(ym) ?? [],
      gtm: gtmByYm.get(ym) ?? [],
    };
  });

  return {
    months,
    toplamRol,
    ilkYm: sorted[0] ?? null,
    sonYm: sorted[sorted.length - 1] ?? null,
  };
}

// SAF: İK PLANI ızgarasından aylık aksiyon çizelgesi kur (canlı gviz yolu).
export function buildTimeline(grid: IkGrid): RoadmapTimeline {
  const hires = hiresByMonth(grid);
  const total = [...hires.values()].reduce((s, arr) => s + arr.length, 0);
  return assembleTimeline(hires, total);
}

// SAF: build-time snapshot satırlarından aynı çizelgeyi kur (runtime fetch beklemeden).
// Snapshot zaten yalnız pencere içi (joinYm <= 2027-03) rolleri taşır; toplamRol = rol sayısı.
export function buildTimelineFromSnapshot(rows: RoadmapSnapshotRow[]): RoadmapTimeline {
  const byYm = new Map<string, Hire[]>();
  for (const r of rows) {
    const arr = byYm.get(r.joinYm) ?? [];
    arr.push({ kod: r.kod, ad: r.ad, kademe: r.kademe, jobFamily: r.jobFamily });
    byYm.set(r.joinYm, arr);
  }
  return assembleTimeline(byYm, rows.length);
}

// ── Fetch ──────────────────────────────────────────────────────────────────
export async function fetchIkGrid(): Promise<IkGrid> {
  return fetch(gvizUrl("İK PLANI"), { cache: "no-store" }).then((r) => r.text()).then(parseCsv);
}

// ── İki-tab navigasyon durum yardımcıları (App.tsx tab state için saf mantık) ──
export type TabKey = "finansal" | "roadmap";
// Roadmap sayfası yalnız v2 (sheetMode) + roadmap sekmesi seçiliyken gösterilir.
export function showRoadmap(sheetMode: boolean, tab: TabKey): boolean {
  return sheetMode && tab === "roadmap";
}
// Tab'a tıklandığında yeni aktif tab (idempotent).
export function selectTab(_current: TabKey, next: TabKey): TabKey {
  return next;
}

// ── Hash tabanlı deep-link routing (static GitHub Pages — path routing 404 verir) ──
// URL fragment'ı (#...) ile sekme derin-bağlantısı: #yolharitasi → roadmap,
// #finansalplan / boş / tanınmayan → finansal. WhatsApp linkleri her cihazda çalışsın diye
// SAF eşleme (App.tsx bunu window.location.hash + history.replaceState + hashchange'e bağlar).
export const HASH: Record<TabKey, string> = {
  finansal: "#finansalplan",
  roadmap: "#yolharitasi",
};

// Baştaki '#' ve büyük/küçük harf sadeleştirilir; "#YolHaritasi", "yolharitasi" hepsi eşleşir.
const normHash = (h: string) => (h || "").replace(/^#/, "").trim().toLocaleLowerCase("en");

// window.location.hash → aktif tab. Yalnız "yolharitasi" roadmap açar; diğer her şey finansal.
export function tabFromHash(hash: string): TabKey {
  return normHash(hash) === normHash(HASH.roadmap) ? "roadmap" : "finansal";
}

// Aktif tab → yazılacak hash (history.replaceState için).
export function hashForTab(tab: TabKey): string {
  return HASH[tab];
}

// ════════════════════════════════════════════════════════════════════════════
// SMART HEDEFLER — GELİR SENARYOSU türetimi (GETİRİ/HEDEF çerçevesi, MALİYET DEĞİL)
// ════════════════════════════════════════════════════════════════════════════
// Kaynak: master_plan "GELİR SENARYOSU" sekmesi (gviz CSV). Ay ekseni POZİSYONEL:
// başlık satırı (satır 0) col1 = "Tem 26" (2026-07); her sonraki sütun +1 ay. Yol haritası
// yalnız ilk 9 ayı (Tem 26 … Mar 27, TIMELINE ufkuyla aynı) kullanır. Bu veri build-time
// snapshot'a yazılır (src/data/roadmap-revenue-snapshot.json) ve runtime'da ANINDA render
// edilir — canlı gviz fetch beklenmez, sayfa asla takılmaz. Bkz. roadmap-snapshot.mjs.

// GELİR SENARYOSU ay ekseni: col1 = ilk gelir ayı (Tem 2026). İK PLANI'ndan (col9=Eyl26)
// bağımsız, kendi sabit çıpası vardır.
export const GELIR_ANCHOR_COL = 1;
export const GELIR_ANCHOR_YM = "2026-07";
// SMART penceresi = timeline ufku (Mar 2027). İlk 9 ay: Tem26 … Mar27.
export const SMART_END_YM = TIMELINE_END_YM; // "2027-03"

const [GEL_Y, GEL_M] = GELIR_ANCHOR_YM.split("-").map(Number);
function gelirYmFromCol(col: number): string {
  const total = GEL_Y * 12 + (GEL_M - 1) + (col - GELIR_ANCHOR_COL);
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

// GELİR SENARYOSU satır etiketleri (nrm'li, "içerir" eşleşmesi — sheet düzeni değişse de tutar).
export const GELIR_ROWS = {
  aylikGelir: "toplam aylik gelir",       // "TOPLAM AYLIK GELİR (Arsa + Emlak)"
  kumulatif: "kumulatif gelir",           // "KÜMÜLATİF GELİR"
  ilanArsa: "toplam ilan sayisi (arsa)",  // "Toplam İlan Sayısı (Arsa)"
  ilanEmlak: "toplam ilan sayisi (emlak)",// "Toplam İlan Sayısı (Emlak)"
  gelirArsa: "arsa/arazi toplam gelir",   // "Arsa/Arazi Toplam Gelir"
  gelirEmlak: "emlak toplam gelir",       // "Emlak Toplam Gelir (Arsa × 1/10)"
  somArsa: "arsa hedef pazar payi",       // "Arsa Hedef Pazar Payı (SOM %)"
} as const;

// TR sayı → number. mpNum'u yeniden kullanır (thousands '.', decimal ','), '%' temizler.
function gnum(s: string): number { return mpNum((s || "").replace(/%/g, "")); }
// TR yüzde → oran değil, yüzde SAYISI ("4,4%" → 4.4). Ondalık ',' korunur.
function gpct(s: string): number {
  const t = (s || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(t); return isNaN(n) ? 0 : n;
}

// GELİR SENARYOSU ızgarasında bir etiketi (nrm 'içerir') taşıyan satırı bul.
function gelirRow(grid: IkGrid, labelKey: string): string[] | null {
  const key = nrm(labelKey);
  return grid.find((r) => nrm(r?.[0] || "").includes(key)) ?? null;
}

// Bir satırı ay dizisine çevir: col1..(col1+8) = Tem26..Mar27 (9 ay). conv ile sayıya map'le.
function seriesFromRow(row: string[] | null, conv: (s: string) => number): number[] {
  if (!row) return [];
  const out: number[] = [];
  for (let c = GELIR_ANCHOR_COL; gelirYmFromCol(c) <= SMART_END_YM; c++) {
    out.push(conv(row[c] ?? ""));
  }
  return out;
}

// Snapshot'a yazılan/okunan aylık gelir görünümü — PENCERE İÇİ (Tem26..Mar27).
export interface RevenueMonth {
  ym: string;              // "2026-07"
  label: string;           // "Tem 26"
  aylikGelir: number;      // o ay toplam aylık gelir (run-rate)
  kumulatif: number;       // o aya kadar kümülatif gelir
  ilanArsa: number;        // aktif arsa ilan sayısı
  ilanEmlak: number;       // aktif emlak ilan sayısı
  gelirArsa: number;       // arsa/arazi aylık gelir
  gelirEmlak: number;      // emlak aylık gelir (1/10 çarpanı)
  somArsa: number;         // arsa hedef pazar payı (SOM %) — yüzde SAYISI
}

// SAF: GELİR SENARYOSU ızgarasından pencere-içi (≤ Mar 2027) aylık gelir dizisi türet.
// Snapshot üreticisi (roadmap-snapshot.mjs) ile BİREBİR aynı çıktı verir.
export function deriveRevenueSnapshot(grid: IkGrid): RevenueMonth[] {
  const aylik = seriesFromRow(gelirRow(grid, GELIR_ROWS.aylikGelir), gnum);
  const kum = seriesFromRow(gelirRow(grid, GELIR_ROWS.kumulatif), gnum);
  const iArsa = seriesFromRow(gelirRow(grid, GELIR_ROWS.ilanArsa), gnum);
  const iEmlak = seriesFromRow(gelirRow(grid, GELIR_ROWS.ilanEmlak), gnum);
  const gArsa = seriesFromRow(gelirRow(grid, GELIR_ROWS.gelirArsa), gnum);
  const gEmlak = seriesFromRow(gelirRow(grid, GELIR_ROWS.gelirEmlak), gnum);
  const som = seriesFromRow(gelirRow(grid, GELIR_ROWS.somArsa), gpct);

  // En uzun diziyi baz al (satırlar aynı genişlikte olmalı ama savunmacı davran).
  const n = Math.max(aylik.length, kum.length, iArsa.length, iEmlak.length, gArsa.length, gEmlak.length, som.length);
  const at = (arr: number[], i: number) => (i < arr.length ? arr[i] : 0);
  const rows: RevenueMonth[] = [];
  for (let i = 0; i < n; i++) {
    const ym = gelirYmFromCol(GELIR_ANCHOR_COL + i);
    if (ym > SMART_END_YM) break;
    rows.push({
      ym, label: ymLabel(ym),
      aylikGelir: at(aylik, i), kumulatif: at(kum, i),
      ilanArsa: at(iArsa, i), ilanEmlak: at(iEmlak, i),
      gelirArsa: at(gArsa, i), gelirEmlak: at(gEmlak, i),
      somArsa: at(som, i),
    });
  }
  return rows;
}

// Yatırımın KARŞILIĞI — Mar 2027 hedef özeti (kart için). GETİRİ, maliyet değil.
export interface SmartTargets {
  ufukYm: string;              // "2027-03"
  ufukLabel: string;           // "Mar 27"
  kumulatifGelir: number;      // Tem26→Mar27 kümülatif gelir
  aylikRunRate: number;        // Mar-27 aylık gelir (yıllık run-rate göstergesi)
  ilanArsa: number;            // Mar-27 aktif arsa ilan
  ilanEmlak: number;           // Mar-27 aktif emlak ilan
  ilanToplam: number;          // arsa + emlak
  gelirArsa: number;           // Mar-27 arsa aylık gelir
  gelirEmlak: number;          // Mar-27 emlak aylık gelir
  arsaPayPct: number;          // gelir modeli kırılımı: arsa % (aylık gelire göre)
  emlakPayPct: number;         // emlak %
  somArsaPct: number;          // arsa SOM pazar payı hedefi (yüzde sayısı)
}

// SAF: aylık gelir dizisinden Mar 2027 hedef özetini hesapla. Boş dizi → sıfırlı özet.
export function buildSmartTargets(months: RevenueMonth[]): SmartTargets {
  const empty: SmartTargets = {
    ufukYm: SMART_END_YM, ufukLabel: ymLabel(SMART_END_YM),
    kumulatifGelir: 0, aylikRunRate: 0, ilanArsa: 0, ilanEmlak: 0, ilanToplam: 0,
    gelirArsa: 0, gelirEmlak: 0, arsaPayPct: 0, emlakPayPct: 0, somArsaPct: 0,
  };
  if (!months.length) return empty;
  // Ufuk ayı = SMART_END_YM (varsa); yoksa son ay.
  const last = months.find((m) => m.ym === SMART_END_YM) ?? months[months.length - 1];
  const toplamGelir = last.gelirArsa + last.gelirEmlak;
  const arsaPay = toplamGelir > 0 ? (last.gelirArsa / toplamGelir) * 100 : 0;
  return {
    ufukYm: last.ym, ufukLabel: last.label,
    // Kümülatif = ufuk ayının kümülatif değeri (satır zaten kümülatiftir).
    kumulatifGelir: last.kumulatif,
    aylikRunRate: last.aylikGelir,
    ilanArsa: last.ilanArsa, ilanEmlak: last.ilanEmlak, ilanToplam: last.ilanArsa + last.ilanEmlak,
    gelirArsa: last.gelirArsa, gelirEmlak: last.gelirEmlak,
    arsaPayPct: arsaPay, emlakPayPct: toplamGelir > 0 ? 100 - arsaPay : 0,
    somArsaPct: last.somArsa,
  };
}

// Timeline'a işlemek için: ym → o aya kadar kümülatif hedef gelir (kart altına "o aya dek hedef").
export function cumulativeByYm(months: RevenueMonth[]): Map<string, number> {
  return new Map(months.map((m) => [m.ym, m.kumulatif]));
}
