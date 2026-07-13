// Canlı master_plan adaptörü (v2). master_plan sheet'inin OPEX + DİJİTAL PAZARLAMA + CAPEX
// sekmelerini (public, gviz CSV) okuyup app'in ay→küme→kalem yapısına çevirir.
// Personel kümesi motordan (İK-türevli bordro) korunur; diğer giderler master_plan'dan gelir.
// Sekme yapısı: OPEX = kalem satırı × ay sütunu (sütun 1'den itibaren "Tem 26", "Agu 26"…).
import type { Hesap, Kume, Kalem } from "./clusters";
import { KUME_RENK } from "./clusters";

// 2026-07-08: master_plan native Google Sheet'e taşındı (eski xlsx: 1DNBT0Pe_VyZgDrSut7dISk9MiFX70NTl).
// v2 ve v3 aynı dosyayı okur; kullanıcı düzenlemeleri artık bu dosyada.
export const MP_SHEET_ID = "1BVY3JGHnFM52CSwNBFlrg7VCBgGi0vIIVKJ68YW6RTk";
const gvizUrl = (name: string) =>
  `https://docs.google.com/spreadsheets/d/${MP_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;

const AY_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
// Türkçe diakritikleri sadeleştir (sheet "Agu"/"Sub" yazıyor, app "Ağu"/"Şub").
const nrm = (s: string) =>
  (s || "").trim().toLocaleLowerCase("tr")
    .replace(/ğ/g, "g").replace(/ş/g, "s").replace(/ı/g, "i").replace(/i̇/g, "i")
    .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c");

export function parseCsv(csv: string): string[][] {
  const R: string[][] = []; let f: string[] = [], c = "", q = false;
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
export function mpNum(s: string): number {
  const t = (s || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(t);
  return isNaN(n) ? 0 : n;
}
function ymShort(ym: string): string { const [y, m] = ym.split("-").map(Number); return AY_KISA[m - 1] + " " + String(y).slice(2); }
function monthCol(header: string[], ym: string): number { const t = nrm(ymShort(ym)); return header.findIndex((h) => nrm(h) === t); }
function rowVal(rows: string[][], header: string[], labelIncludes: string, ym: string): number {
  const col = monthCol(header, ym); if (col < 1) return 0;
  const key = nrm(labelIncludes);
  const row = rows.find((r) => nrm(r[0]).includes(key));
  return row ? mpNum(row[col]) : 0;
}
const sumVal = (rows: string[][], header: string[], labels: string[], ym: string) =>
  labels.reduce((s, l) => s + rowVal(rows, header, l, ym), 0);

const K = (key: string, ad: string, kalemler: Kalem[]): Kume =>
  ({ key, ad, renk: KUME_RENK[key], tl: kalemler.reduce((s, x) => s + x.tl, 0), kalemler });

export interface MpTabs { opex: string[][]; paz: string[][]; capex: string[][]; }

// CAPEX 4 kume: Kategori/Donem'e gore. Yillik lisanslar -> Yazilim; Mutfak/Bilgisayar kendi kumesi; kalan -> Kurulus.
const CAPEX_KUME_DEF: Record<string, { ad: string; renk: string }> = {
  capexKurulus: { ad: "Kurulus", renk: "#a16207" },
  capexBilgisayar: { ad: "Bilgisayar", renk: "#1f6feb" },
  capexMutfak: { ad: "Mutfak", renk: "#0e7490" },
  capexYazilim: { ad: "Yazilim", renk: "#be123c" },
};
const CAPEX_KUME_SIRA = ["capexKurulus", "capexBilgisayar", "capexMutfak", "capexYazilim"];
function capexKumeKey(kat: string, donem: string): string {
  const k = nrm(kat), d = nrm(donem);
  if (d.includes("yil")) return "capexYazilim";
  if (k.includes("mutfak")) return "capexMutfak";
  if (k.includes("bilgisayar")) return "capexBilgisayar";
  return "capexKurulus";
}
function groupCapex(rows: { ad: string; tl: number; donem: string; kat: string }[]): Kume[] {
  const m = new Map<string, Kume>();
  for (const r of rows) {
    const key = capexKumeKey(r.kat, r.donem);
    let g = m.get(key);
    if (!g) { const def = CAPEX_KUME_DEF[key]; g = { key, ad: def.ad, renk: def.renk, tl: 0, kalemler: [] }; m.set(key, g); }
    g.kalemler.push({ ad: r.ad, tl: r.tl }); g.tl += r.tl;
  }
  return CAPEX_KUME_SIRA.filter((k) => m.has(k)).map((k) => m.get(k)!);
}

export async function fetchMasterplanTabs(): Promise<MpTabs> {
  const [opex, paz, capex] = await Promise.all([
    fetch(gvizUrl("OPEX"), { cache: "no-store" }).then((r) => r.text()).then(parseCsv),
    fetch(gvizUrl("DİJİTAL PAZARLAMA"), { cache: "no-store" }).then((r) => r.text()).then(parseCsv),
    fetch(gvizUrl("CAPEX"), { cache: "no-store" }).then((r) => r.text()).then(parseCsv),
  ]);
  return { opex, paz, capex };
}

// SAF: motor çıktısı (base) + master_plan sekmeleri → giderleri master_plan'dan alan Hesap.
export function buildMasterplan(base: Hesap, tabs: MpTabs): Hesap {
  const oHead = tabs.opex[0] || [];
  const pHead = tabs.paz[0] || [];
  const pazTotal = tabs.paz.find((r) => nrm(r[0]).includes("toplam"));
  const pazVal = (ym: string) => { const c = monthCol(pHead, ym); return pazTotal && c > 0 ? mpNum(pazTotal[c]) : 0; };

  const aylar = base.aylar.map((ay) => {
    const ym = ay.ym;
    const personel = ay.kumeler.find((k) => k.key === "personel"); // motordan korunur
    const ofis = K("ofis", "Ofis & kira", [{ ad: "Ofis kirası", tl: rowVal(tabs.opex, oHead, "ofis kira", ym) }]);
    const surekli = K("surekli", "Sürekli giderler", [
      { ad: "Elektrik & Su", tl: rowVal(tabs.opex, oHead, "elektrik", ym) },
      { ad: "İnternet & Telefon", tl: rowVal(tabs.opex, oHead, "internet", ym) },
      { ad: "Temizlik", tl: rowVal(tabs.opex, oHead, "temizlik", ym) },
    ]);
    const yazilim = K("yazilim", "Yazılım / SaaS & AI", [
      { ad: "Dijital altyapı (AWS/CDN/API)", tl: sumVal(tabs.opex, oHead, ["aws", "cdn", "email", "maps", "sms"], ym) },
      { ad: "AI & yazılım araçları", tl: sumVal(tabs.opex, oHead, ["llm", "copilot", "tasarim", "platform payla"], ym) },
    ]);
    const profesyonel = K("profesyonel", "Profesyonel hizmetler", [{ ad: "Güvenlik & sigorta", tl: rowVal(tabs.opex, oHead, "guvenlik", ym) }]);
    const pazarlama = K("pazarlama", "Pazarlama", [{ ad: "Dijital reklam / medya", tl: pazVal(ym) }]);
    const kumeler = [personel, ofis, surekli, pazarlama, yazilim, profesyonel].filter((k): k is Kume => !!k && k.tl > 0);
    return { ...ay, kumeler, toplamTl: kumeler.reduce((s, k) => s + k.tl, 0) };
  });

  // CAPEX sekmesi: Kalem (sütun 0) + Tutar (sütun 1). Başlık/boş satırlar elenir.
  // ÇİFT-SAYIM KORUMASI (v3 ile aynı kural): "TOPLAM …", "… Toplamı", "Birim: …" ve
  // "(paren)" satırları ELENİR. Bunlar detayların toplamı/açıklaması olduğundan, sayılırlarsa
  // her kalem iki kez sayılır ve bir hücre değişince toplam 2× oynar.
  const capexRows = tabs.capex.slice(1)
    .map((r) => ({ ad: (r[0] || "").trim(), tl: mpNum(r[1]), donem: (r[2] || "").trim(), kat: (r[3] || "").trim() }))
    .filter((k) => {
      if (!k.ad || k.tl <= 0) return false;
      if (k.ad.startsWith("(")) return false;
      const na = nrm(k.ad);
      if (na.includes("toplam") || na.startsWith("birim")) return false;
      return true;
    });
  const capexKalemler: Kalem[] = capexRows.map((r) => ({ ad: r.ad, tl: r.tl }));
  const capexToplam = capexKalemler.reduce((s, k) => s + k.tl, 0);
  const capexKumeler = groupCapex(capexRows);

  return { ...base, aylar, capex: capexToplam > 0 ? { toplamTl: capexToplam, kalemler: capexKalemler, kumeler: capexKumeler } : base.capex };
}
