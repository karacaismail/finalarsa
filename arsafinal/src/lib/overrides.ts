// Google Sheet (canlı) → ay-bazlı override. v2 sayfası çalışma-anında CSV okur ve
// motor çıktısını (Hesap) EZER (hibrit model). Sheet yok/hatalıysa motor olduğu gibi kalır.
// CSV başlık satırı: ay,küme,kalem,değer
//   ay    : "2026-09" veya "Eyl 2026"
//   küme  : personel | ofis | surekli | pazarlama | yazilim | profesyonel | saha  (ya da küme adının bir parçası)
//   kalem : (opsiyonel) tam kalem adı — boşsa tüm küme tek değere indirgenir
//   değer : ₺ tutar (5000 / 5.000 / 5000,50)
import type { Hesap } from "./clusters";

export interface Override { ym: string; kume: string; kalem?: string; tl: number; }

// Boş = sabit URL yok; v2 ?sheet=<CSV_URL> query parametresinden okur.
export const OVERRIDE_CSV_URL = "";

const AY_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export function normYm(s: string): string | null {
  const t = (s || "").trim();
  if (/^\d{4}-\d{1,2}$/.test(t)) { const [y, m] = t.split("-"); return `${y}-${m.padStart(2, "0")}`; }
  const m = t.match(/^([A-Za-zçÇğĞıİöÖşŞüÜ]{3})\S*\s+(\d{4})$/);
  if (m) {
    const idx = AY_KISA.findIndex((a) => a.toLocaleLowerCase("tr").startsWith(m[1].toLocaleLowerCase("tr").slice(0, 3)));
    if (idx >= 0) return `${m[2]}-${String(idx + 1).padStart(2, "0")}`;
  }
  return null;
}

export function parseNum(s: string): number | null {
  const t = (s || "").replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
  if (t === "" || t === "-" || t === ".") return null;
  const n = Number(t);
  return isNaN(n) ? null : n;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []; let cur = ""; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

export function parseOverridesCsv(csv: string): Override[] {
  const lines = (csv || "").trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const out: Override[] = [];
  for (const line of lines.slice(1)) {
    const c = splitCsvLine(line);
    const ym = normYm(c[0] ?? "");
    const kume = (c[1] ?? "").trim();
    const kalem = (c[2] ?? "").trim();
    const tl = parseNum(c[3] ?? "");
    if (ym && kume && tl != null) out.push({ ym, kume, kalem: kalem || undefined, tl });
  }
  return out;
}

// Motor çıktısını override'larla ezer; küme ve ay toplamlarını yeniden hesaplar. SAF fonksiyon.
export function applyOverrides(h: Hesap, ovs: Override[]): Hesap {
  if (!ovs.length) return h;
  const byYm = new Map<string, Override[]>();
  for (const o of ovs) { const a = byYm.get(o.ym) ?? []; a.push(o); byYm.set(o.ym, a); }
  const aylar = h.aylar.map((ay) => {
    const list = byYm.get(ay.ym);
    if (!list) return ay;
    const kumeler = ay.kumeler.map((k) => ({ ...k, kalemler: k.kalemler.map((x) => ({ ...x })) }));
    for (const o of list) {
      const kume = kumeler.find((k) => k.key === o.kume || k.ad.toLocaleLowerCase("tr").includes(o.kume.toLocaleLowerCase("tr")));
      if (!kume) continue;                                  // bilinmeyen/gizli küme → güvenli yok say
      if (o.kalem) {
        const kalem = kume.kalemler.find((x) => x.ad === o.kalem || x.ad.toLocaleLowerCase("tr").includes(o.kalem!.toLocaleLowerCase("tr")));
        if (kalem) kalem.tl = o.tl; else kume.kalemler.push({ ad: o.kalem, tl: o.tl });
      } else {
        kume.kalemler = [{ ad: kume.ad + " (sheet)", tl: o.tl }];   // küme geneli override
      }
      kume.tl = kume.kalemler.reduce((s, x) => s + x.tl, 0);
    }
    const filt = kumeler.filter((k) => k.tl > 0);
    return { ...ay, kumeler: filt, toplamTl: filt.reduce((s, k) => s + k.tl, 0) };
  });
  return { ...h, aylar };
}
