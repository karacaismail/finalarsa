// Build-time snapshot üreticisi (Node, ESM). ÜÇ snapshot yazar — hepsi TEK sheet'ten (gviz CSV):
//   1) roadmap-snapshot.json          ← "İK PLANI"        (yol haritası rolleri)
//   2) roadmap-revenue-snapshot.json  ← "GELİR SENARYOSU" (SMART hedefler: gelir/ilan/model, ≤Mar27)
//   3) masterplan-snapshot.json       ← OPEX + DİJİTAL PAZARLAMA + CAPEX (finansal sayfa başlangıç verisi)
//
// NEDEN: runtime canlı gviz fetch yavaş/kırılgan. Snapshot'lar commit edilir; uygulama ANINDA
// gerçek sheet verisiyle render eder, sonra arka planda canlı ile tazeler. Fetch patlarsa
// snapshot'ta KALIR (bayat ama gerçek) — hardcoded base'e SESSİZCE düşmez.
//
// DAYANIKLILIK: her fetch/parse bağımsız try/catch; biri patlarsa DİĞERLERİNİ engellemez ve
// build'i KIRMAZ. Bir çıktı üretilemezse MEVCUT snapshot KORUNUR (varsa). HER ZAMAN exit 0.

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ── Sabitler (roadmap.ts / masterplan.ts ile senkron) ────────────────────────
const MP_SHEET_ID = "1BVY3JGHnFM52CSwNBFlrg7VCBgGi0vIIVKJ68YW6RTk";
const IK_SHEET_NAME = "İK PLANI";
const GELIR_SHEET_NAME = "GELİR SENARYOSU";
const IK_ANCHOR_COL = 9;        // J sütunu
const IK_ANCHOR_YM = "2026-09"; // col9 = Eyl 2026
const TIMELINE_END_YM = "2027-03";
const IK_COLS = { kod: 0, ad: 1, jobFamily: 2, kademe: 5 };
const FETCH_TIMEOUT_MS = 20000;

// GELİR SENARYOSU ay ekseni: col1 = Tem 2026; SMART penceresi = ≤ Mar 2027 (ilk 9 ay).
const GELIR_ANCHOR_COL = 1;
const GELIR_ANCHOR_YM = "2026-07";
const AY_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_IK = resolve(__dirname, "../src/data/roadmap-snapshot.json");
const OUT_REV = resolve(__dirname, "../src/data/roadmap-revenue-snapshot.json");
const OUT_MP = resolve(__dirname, "../src/data/masterplan-snapshot.json");

const gvizUrl = (name) =>
  `https://docs.google.com/spreadsheets/d/${MP_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;

// masterplan.ts parseCsv ile birebir (RFC-4180 tarzı; tırnak-içi virgül/newline destekli).
function parseCsv(csv) {
  const R = []; let f = [], c = "", q = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (q) { if (ch === '"') { if (csv[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ",") { f.push(c); c = ""; }
    else if (ch === "\n") { f.push(c); R.push(f); f = []; c = ""; }
    else if (ch !== "\r") c += ch;
  }
  if (c !== "" || f.length) { f.push(c); R.push(f); }
  return R;
}

// TR diakritik sadeleştirme (masterplan.ts/roadmap.ts nrm ile birebir; i̇→i dahil).
const nrm = (s) =>
  (s || "").trim().toLocaleLowerCase("tr")
    .replace(/ğ/g, "g").replace(/ş/g, "s").replace(/ı/g, "i").replace(/i̇/g, "i")
    .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c");

// TR sayı → number (masterplan.ts mpNum ile birebir).
function mpNum(s) {
  const t = (s || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(t); return isNaN(n) ? 0 : n;
}
function gnum(s) { return mpNum((s || "").replace(/%/g, "")); }
function gpct(s) {
  const t = (s || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(t); return isNaN(n) ? 0 : n;
}
const ymLabel = (ym) => { const [y, m] = ym.split("-").map(Number); return `${AY_KISA[m - 1]} ${String(y).slice(2)}`; };

// ── Ortak dosya yardımcıları ─────────────────────────────────────────────────
function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}
// Bir çıktı üretilemezse mevcut snapshot'u KORU (varsa); yoksa emptyValue yaz. Build'i asla kırma.
function keepExistingOr(path, emptyValue, label, reason) {
  if (existsSync(path)) { console.warn(`[snapshot:${label}] ${reason} — mevcut ${path.split("/").pop()} KORUNUYOR.`); return; }
  console.warn(`[snapshot:${label}] ${reason} — mevcut yok, BOŞ yazılıyor.`);
  try { writeJson(path, emptyValue); } catch (e) { console.warn(`[snapshot:${label}] boş yazım başarısız: ${e?.message || e}`); }
}

// Bir sekmeyi gviz CSV olarak çek → grid (parse). Hata → null (çağıran fallback yapar).
async function fetchGrid(sheetName, label) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(gvizUrl(sheetName), { cache: "no-store", signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) { console.warn(`[snapshot:${label}] gviz HTTP ${res.status}`); return null; }
    return parseCsv(await res.text());
  } catch (e) {
    console.warn(`[snapshot:${label}] gviz fetch başarısız (${e?.name === "AbortError" ? "zaman aşımı" : e?.message || e})`);
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 1) İK PLANI → roadmap-snapshot.json  (roadmap.ts deriveSnapshot ile birebir)
// ════════════════════════════════════════════════════════════════════════════
const [IK_Y, IK_M] = IK_ANCHOR_YM.split("-").map(Number);
function ikYmFromOffset(offset) {
  const total = IK_Y * 12 + (IK_M - 1) + offset;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}
const isTrue = (s) => (s || "").trim().toUpperCase() === "TRUE";

function deriveIkSnapshot(grid) {
  const rows = [];
  for (let r = 3; r < grid.length; r++) {
    const row = grid[r];
    const kod = (row?.[IK_COLS.kod] || "").trim();
    if (!kod) continue;
    let firstCol = -1;
    for (let j = IK_ANCHOR_COL; j < row.length; j++) { if (isTrue(row[j])) { firstCol = j; break; } }
    if (firstCol < 0) continue;
    const joinYm = ikYmFromOffset(firstCol - IK_ANCHOR_COL);
    if (joinYm > TIMELINE_END_YM) continue;
    rows.push({
      kod, ad: (row[IK_COLS.ad] || "").trim() || kod,
      jobFamily: (row[IK_COLS.jobFamily] || "").trim(), kademe: (row[IK_COLS.kademe] || "").trim(), joinYm,
    });
  }
  rows.sort((a, b) => (a.joinYm < b.joinYm ? -1 : a.joinYm > b.joinYm ? 1 : a.kod < b.kod ? -1 : a.kod > b.kod ? 1 : 0));
  return rows;
}

async function snapshotIk() {
  const grid = await fetchGrid(IK_SHEET_NAME, "ik");
  if (!grid) return keepExistingOr(OUT_IK, [], "ik", "İK PLANI çekilemedi");
  let rows;
  try { rows = deriveIkSnapshot(grid); } catch (e) { return keepExistingOr(OUT_IK, [], "ik", `türetim hatası (${e?.message || e})`); }
  if (rows.length === 0) return keepExistingOr(OUT_IK, [], "ik", "türetilen snapshot BOŞ (0 rol)");
  try { writeJson(OUT_IK, rows); console.log(`[snapshot:ik] OK — ${rows.length} rol (ilk: ${rows[0]?.kod} ${rows[0]?.joinYm}).`); }
  catch (e) { keepExistingOr(OUT_IK, [], "ik", `dosya yazımı başarısız (${e?.message || e})`); }
}

// ════════════════════════════════════════════════════════════════════════════
// 2) GELİR SENARYOSU → roadmap-revenue-snapshot.json (roadmap.ts deriveRevenueSnapshot ile birebir)
// ════════════════════════════════════════════════════════════════════════════
const [GEL_Y, GEL_M] = GELIR_ANCHOR_YM.split("-").map(Number);
function gelirYmFromCol(col) {
  const total = GEL_Y * 12 + (GEL_M - 1) + (col - GELIR_ANCHOR_COL);
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}
const GELIR_ROWS = {
  aylikGelir: "toplam aylik gelir", kumulatif: "kumulatif gelir",
  ilanArsa: "toplam ilan sayisi (arsa)", ilanEmlak: "toplam ilan sayisi (emlak)",
  gelirArsa: "arsa/arazi toplam gelir", gelirEmlak: "emlak toplam gelir",
  somArsa: "arsa hedef pazar payi",
};
function gelirRow(grid, labelKey) { const k = nrm(labelKey); return grid.find((r) => nrm(r?.[0] || "").includes(k)) ?? null; }
function seriesFromRow(row, conv) {
  if (!row) return [];
  const out = []; for (let c = GELIR_ANCHOR_COL; gelirYmFromCol(c) <= TIMELINE_END_YM; c++) out.push(conv(row[c] ?? ""));
  return out;
}
function deriveRevenueSnapshot(grid) {
  const aylik = seriesFromRow(gelirRow(grid, GELIR_ROWS.aylikGelir), gnum);
  const kum = seriesFromRow(gelirRow(grid, GELIR_ROWS.kumulatif), gnum);
  const iA = seriesFromRow(gelirRow(grid, GELIR_ROWS.ilanArsa), gnum);
  const iE = seriesFromRow(gelirRow(grid, GELIR_ROWS.ilanEmlak), gnum);
  const gA = seriesFromRow(gelirRow(grid, GELIR_ROWS.gelirArsa), gnum);
  const gE = seriesFromRow(gelirRow(grid, GELIR_ROWS.gelirEmlak), gnum);
  const som = seriesFromRow(gelirRow(grid, GELIR_ROWS.somArsa), gpct);
  const n = Math.max(aylik.length, kum.length, iA.length, iE.length, gA.length, gE.length, som.length);
  const at = (a, i) => (i < a.length ? a[i] : 0);
  const rows = [];
  for (let i = 0; i < n; i++) {
    const ym = gelirYmFromCol(GELIR_ANCHOR_COL + i);
    if (ym > TIMELINE_END_YM) break;
    rows.push({
      ym, label: ymLabel(ym), aylikGelir: at(aylik, i), kumulatif: at(kum, i),
      ilanArsa: at(iA, i), ilanEmlak: at(iE, i), gelirArsa: at(gA, i), gelirEmlak: at(gE, i), somArsa: at(som, i),
    });
  }
  return rows;
}

async function snapshotRevenue() {
  const grid = await fetchGrid(GELIR_SHEET_NAME, "revenue");
  if (!grid) return keepExistingOr(OUT_REV, [], "revenue", "GELİR SENARYOSU çekilemedi");
  let rows;
  try { rows = deriveRevenueSnapshot(grid); } catch (e) { return keepExistingOr(OUT_REV, [], "revenue", `türetim hatası (${e?.message || e})`); }
  // Şüpheli boş/sıfır: Mar-27 aylık gelir 0 ise sheet düzeni bozulmuş olabilir → iyi snapshot'u ezme.
  const mar = rows.find((r) => r.ym === TIMELINE_END_YM);
  if (!rows.length || !mar || (mar.aylikGelir === 0 && mar.kumulatif === 0)) {
    return keepExistingOr(OUT_REV, [], "revenue", "türetilen gelir snapshot BOŞ/ŞÜPHELİ (Mar-27 gelir 0)");
  }
  try { writeJson(OUT_REV, rows); console.log(`[snapshot:revenue] OK — ${rows.length} ay (Mar-27 aylık: ${mar.aylikGelir}, kümülatif: ${mar.kumulatif}).`); }
  catch (e) { keepExistingOr(OUT_REV, [], "revenue", `dosya yazımı başarısız (${e?.message || e})`); }
}

// ════════════════════════════════════════════════════════════════════════════
// 3) OPEX + DİJİTAL PAZARLAMA + CAPEX → masterplan-snapshot.json (HAM satırlar)
// masterplan.ts buildMasterplan bu üç grid'i olduğu gibi (string[][]) tüketir; ham sakla.
// ════════════════════════════════════════════════════════════════════════════
async function snapshotMasterplan() {
  const empty = { opex: [], paz: [], capex: [], meta: { builtAt: "" } };
  const [opex, paz, capex] = await Promise.all([
    fetchGrid("OPEX", "mp-opex"), fetchGrid("DİJİTAL PAZARLAMA", "mp-paz"), fetchGrid("CAPEX", "mp-capex"),
  ]);
  // Hepsi null ise mevcut korunur; en az biri geldiyse yaz.
  if (!opex && !paz && !capex) return keepExistingOr(OUT_MP, empty, "masterplan", "hiçbir sekme çekilemedi");
  const out = {
    opex: opex ?? [], paz: paz ?? [], capex: capex ?? [],
    meta: { builtAt: new Date().toISOString().slice(0, 10) },
  };
  if (!opex?.length || !capex?.length) console.warn("[snapshot:masterplan] UYARI: OPEX veya CAPEX boş/eksik geldi.");
  try {
    writeJson(OUT_MP, out);
    console.log(`[snapshot:masterplan] OK — OPEX ${out.opex.length} / PAZ ${out.paz.length} / CAPEX ${out.capex.length} satır (build ${out.meta.builtAt}).`);
  } catch (e) { keepExistingOr(OUT_MP, empty, "masterplan", `dosya yazımı başarısız (${e?.message || e})`); }
}

// ── Ana: üç snapshot'ı bağımsız çalıştır; biri patlasa diğerleri devam eder ──
async function main() {
  await Promise.allSettled([snapshotIk(), snapshotRevenue(), snapshotMasterplan()]);
}
main().catch((e) => { console.warn(`[snapshot] beklenmedik üst-düzey hata, build kırılmıyor: ${e?.message || e}`); });
