// v3 · canlı master_plan adaptörü (RAW export CSV — gviz başlık birleştirmesi YOK).
// v2'den farkları:
//   1) Sekmeler export?format=csv&gid= ile HAM okunur (ay başlıkları satır olarak görünür).
//   2) Kalem = OPEX bölüm toplulaştırması; alt-detaylar alt_detay sekmesinden modalda gösterilir.
//   3) CAPEX: kalem = bölüm (Ofis kurulumu, Mutfak…); TOPLAM/Birim/paren satırları elenir (çift sayım yok).
//   4) Personel HİBRİT: İK satırları (Aylık Brüt Maaş + Ödül) o ay doluysa sheet; boşsa motor korunur.
//   5) Pazarlama = kanal yapraklarının toplamı (sheet'in TOPLAM satırı değil).
// SAF fonksiyon: buildMasterplanV3(base, raw) — motor çıktısını ezer, base'i değiştirmez.
import type { Hesap, Kume, Kalem } from "./clusters";
import { KUME_RENK } from "./clusters";
import { parseCsv, mpNum } from "./masterplan";
import { MP3_SHEET_ID } from "./subdetails";

export interface MpRaw { opex: string[][]; paz: string[][]; capex: string[][]; }

export const MP3_GID = { opex: "621418176", paz: "1015200603", capex: "1074510486" } as const;
const expUrl = (gid: string) =>
  `https://docs.google.com/spreadsheets/d/${MP3_SHEET_ID}/export?format=csv&gid=${gid}`;

export async function fetchMasterplanRaw(): Promise<MpRaw> {
  const get = (gid: string) => fetch(expUrl(gid), { cache: "no-store" }).then((r) => r.text()).then(parseCsv);
  const [opex, paz, capex] = await Promise.all([get(MP3_GID.opex), get(MP3_GID.paz), get(MP3_GID.capex)]);
  return { opex, paz, capex };
}

// TR diakritik sadeleştirme (sheet "Agu"/"Sub", uygulama "Ağu"/"Şub" yazabilir)
const nrm = (s: string) =>
  (s || "").trim().toLocaleLowerCase("tr")
    .replace(/ğ/g, "g").replace(/ş/g, "s").replace(/ı/g, "i").replace(/i̇/g, "i")
    .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c");

const AY_NRM = ["oca", "sub", "mar", "nis", "may", "haz", "tem", "agu", "eyl", "eki", "kas", "ara"];

// Ay başlık satırını bul: "tem 26" gibi hücreler içeren ilk satır → { headerIdx, ym→kolon }
function monthCols(grid: string[][]): { hi: number; cols: Record<string, number> } {
  for (let hi = 0; hi < Math.min(6, grid.length); hi++) {
    const cols: Record<string, number> = {};
    grid[hi].forEach((cell, j) => {
      const m = nrm(cell).match(/^([a-z]{3})\s*(\d{2})$/);
      if (!m) return;
      const mi = AY_NRM.indexOf(m[1]);
      if (mi >= 0) cols[`20${m[2]}-${String(mi + 1).padStart(2, "0")}`] = j;
    });
    if (Object.keys(cols).length) return { hi, cols };
  }
  return { hi: -1, cols: {} };
}

const rowIdx = (grid: string[][], key: string, from = 0): number => {
  const k = nrm(key);
  for (let i = from; i < grid.length; i++) if (grid[i][0] && nrm(grid[i][0]).includes(k)) return i;
  return -1;
};

const K = (key: string, ad: string, kalemler: Kalem[]): Kume =>
  ({ key, ad, renk: KUME_RENK[key], tl: kalemler.reduce((s, x) => s + x.tl, 0), kalemler });

// v3 kalem tanımı: uygulama kalem adı → OPEX yaprak satır anahtarları
// (alt_detay üreticisiyle birebir aynı listeler — bütünlük buradan gelir)
const OPEX_KALEM: Array<{ kume: string; ad: string; keys: string[] }> = [
  { kume: "surekli", ad: "Ofis işletim (elektrik/su/internet/temizlik)", keys: ["elektrik", "internet", "temizlik (aylik"] },
  { kume: "surekli", ad: "Genel tüketim & ikram", keys: ["cay & kahve", "temizlik malzeme", "ofis kirtasiye", "yemek & ikram", "ulasim"] },
  { kume: "yazilim", ad: "Dijital altyapı (AWS/CDN/API)", keys: ["aws", "cdn", "email", "maps", "sms provider"] },
  { kume: "yazilim", ad: "AI & yazılım araçları", keys: ["llm kisisel", "code ai", "tasarim bireysel", "platform paylasimli"] },
  { kume: "yazilim", ad: "Platform AI & Agent (API)", keys: ["anthropic", "diger ai"] },
  { kume: "yazilim", ad: "Agile/SAFe araçları", keys: ["jira", "confluence", "miro", "slack", "figma"] },
  { kume: "profesyonel", ad: "Hukuki & idari", keys: ["mali musavir", "hukuk danis", "sigorta (genel)", "muhasebe yazilimi"] },
];

const CAPEX_BOLUM: Array<[string, string]> = [
  ["ofis kurulumu", "Ofis kurulumu"], ["mutfak", "Mutfak ekipmanları"],
  ["bilgisayar", "Bilgisayar & ekipman"], ["pazarlama & marka", "Pazarlama & marka"],
  ["hosgeldin", "Hoşgeldin paketi"], ["yillik yazilim", "Yıllık yazılım lisansları"],
];

export function buildMasterplanV3(base: Hesap, raw: MpRaw): Hesap {
  const o = monthCols(raw.opex), p = monthCols(raw.paz);
  const oVal = (key: string, ym: string): number => {
    const c = o.cols[ym]; if (c === undefined) return 0;
    const i = rowIdx(raw.opex, key, o.hi + 1);
    return i < 0 ? 0 : mpNum(raw.opex[i][c] ?? "");
  };

  const aylar = base.aylar.map((ay) => {
    const ym = ay.ym;

    // --- personel: HİBRİT (İK satırları doluysa sheet, boşsa motor) ---
    const ikBrut = oVal("aylik brut maas", ym);
    const ikOdul = oVal("odul + sosyal", ym);
    const motorPersonel = ay.kumeler.find((k) => k.key === "personel");
    const personel: Kume | undefined = ikBrut + ikOdul > 0
      ? K("personel", "Personel giderleri", [
          { ad: "Aylık Brüt Maaş Toplamı", tl: ikBrut, detay: motorPersonel ? `Sheet İK verisi · motor hesabı: ${Math.round(motorPersonel.tl).toLocaleString("tr-TR")} ₺ (karşılaştırma)` : undefined },
          { ad: "Ödül + Sosyal + Eğitim", tl: ikOdul },
        ])
      : motorPersonel;

    // --- OPEX toplulaştırılmış kalemler ---
    const byKume = new Map<string, Kalem[]>();
    for (const t of OPEX_KALEM) {
      const tl = t.keys.reduce((s, k) => s + oVal(k, ym), 0);
      const list = byKume.get(t.kume) ?? [];
      list.push({ ad: t.ad, tl });
      byKume.set(t.kume, list);
    }
    const ofis = K("ofis", "Ofis & kira", [{ ad: "Ofis Kirası", tl: oVal("ofis kira", ym) }]);
    const surekli = K("surekli", "Sürekli giderler", byKume.get("surekli")!);
    const yazilim = K("yazilim", "Yazılım / SaaS & AI", byKume.get("yazilim")!);
    const profesyonel = K("profesyonel", "Profesyonel hizmetler",
      [...byKume.get("profesyonel")!, { ad: "Güvenlik & Sigorta", tl: oVal("guvenlik", ym) }]);

    // --- pazarlama: kanal yapraklarının toplamı (başlıklar boş, TOPLAM satırı elenir) ---
    let pazTl = 0;
    if (p.hi >= 0 && p.cols[ym] !== undefined) {
      for (let i = p.hi + 1; i < raw.paz.length; i++) {
        const a = raw.paz[i][0] || "";
        if (!a.trim() || nrm(a).includes("toplam")) continue;
        pazTl += mpNum(raw.paz[i][p.cols[ym]] ?? "");
      }
    }
    const pazarlama = K("pazarlama", "Pazarlama", [{ ad: "Dijital reklam / medya", tl: pazTl }]);

    const kumeler = [personel, ofis, surekli, pazarlama, yazilim, profesyonel]
      .filter((k): k is Kume => !!k && k.tl > 0);
    return { ...ay, kumeler, toplamTl: kumeler.reduce((s, k) => s + k.tl, 0) };
  });

  // --- CAPEX: bölüm → kalem; yapraklar bölüm sınırları (indeks) içinde toplanır ---
  const cHead = rowIdx(raw.capex, "kalem");
  const starts = CAPEX_BOLUM
    .map(([k, ad]) => ({ ad, i: rowIdx(raw.capex, k, cHead + 1) }))
    .filter((s) => s.i >= 0)
    .sort((a, b) => a.i - b.i);
  const capexKalemler: Kalem[] = [];
  starts.forEach((s, si) => {
    const end = si + 1 < starts.length ? starts[si + 1].i : raw.capex.length;
    let tl = 0;
    for (let i = s.i + 1; i < end; i++) {
      const a = (raw.capex[i][0] || "").trim();
      if (!a || a.startsWith("(")) continue;
      const na = nrm(a);
      if (na.includes("toplam") || na.startsWith("birim")) continue;
      tl += mpNum(raw.capex[i][1] ?? "");
    }
    if (tl > 0) capexKalemler.push({ ad: s.ad, tl });
  });
  const capexToplam = capexKalemler.reduce((s, k) => s + k.tl, 0);

  return { ...base, aylar, capex: capexToplam > 0 ? { toplamTl: capexToplam, kalemler: capexKalemler } : base.capex };
}
