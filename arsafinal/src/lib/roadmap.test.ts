import { describe, it, expect } from "vitest";
import {
  monthAxis, ikColumn, hiresByMonth, buildTimeline,
  PHASES, phaseForYm, showRoadmap, selectTab, IK_ANCHOR_COL, IK_ANCHOR_YM,
} from "./roadmap";
import type { IkGrid } from "./roadmap";

// ─── İK PLANI fixture (gerçek sheet yapısı) ────────────────────────────────
// Satır 0: başlık; satır 1: net maaş etiketi; satır 2: kolon başlıkları
// (Rol Kodu=A/0, Rol Adı=B/1, Job Family=C/2, Kademe=F/5, Ünvan=G/6, Aday=H/7);
// satır 3+: rol satırları — I/8 = net maaş, J/9'dan itibaren TRUE/FALSE matrisi.
// Sheet'te J+ başlıkları BOŞ → ay ekseni POZİSYONEL: col 9 = Eyl 26 (2026-09).
const pad = (n: number) => Array(n).fill("");
// col:        0        1                       2         3  4  5            6         7      8          9(J)    10      11      12      13      14
const head0 = ["ARSAM.NET — İSTİHDAM TAKVİMİ", ...pad(7), "Asgari Ücret"];
const head1 = ["Aylık Net Maaş tutarı"];
const head2 = ["Rol Kodu", "Rol Adı", "Job Family", "", "", "Kademe", "Ünvan", "Aday"];
// R-CPO: kuruluştan itibaren TRUE (col9 = Eyl 26)
const rCPO   = ["R-CPO", "CPO / Strateji", "Product / Stratejik Planlama", "", "", "C-Level", "C-Level", "N/A", "200.000",
  "TRUE", "TRUE", "TRUE", "TRUE", "TRUE", "TRUE"];
// R-PO: yine col9 (Eyl 26)
const rPO    = ["R-PO", "Product Owner", "Product / UX / Program", "", "", "Ürün", "Senior", "N/A", "77.208",
  "TRUE", "TRUE", "TRUE", "TRUE", "TRUE", "TRUE"];
// R-DEV1: ilk TRUE col10 (Eki 26) — Eyl'de FALSE
const rDEV1  = ["R-DEV1", "Backend Dev #1", "Engineering & Platform", "", "", "Teknik", "Mid", "N/A", "56.151",
  "FALSE", "TRUE", "TRUE", "TRUE", "TRUE", "TRUE"];
// R-QA: ilk TRUE col11 (Kas 26)
const rQA    = ["R-QA", "QA Mühendisi", "Engineering & Platform", "", "", "Teknik", "Mid", "N/A", "56.151",
  "FALSE", "FALSE", "TRUE", "TRUE", "TRUE", "TRUE"];
// R-CS1: ilk TRUE col12 (Ara 26)
const rCS1   = ["R-CS1", "CS Rep #1", "Customer & Seller Support / CX", "", "", "Operasyonel", "Junior", "N/A", "33.030",
  "FALSE", "FALSE", "FALSE", "TRUE", "TRUE", "TRUE"];
// R-QAX: ilk TRUE col13 (Oca 27) — resmî lansman ayı
const rQAX   = ["R-QAX", "QA #2", "Engineering & Platform", "", "", "Teknik", "Mid", "N/A", "56.151",
  "FALSE", "FALSE", "FALSE", "FALSE", "TRUE", "TRUE"];
// Hiç TRUE olmayan rol → hiçbir aya katılmaz
const rNONE  = ["R-NONE", "Boş rol", "Admin / PR / Office", "", "", "Idari", "Mid", "N/A", "42.113",
  "FALSE", "FALSE", "FALSE", "FALSE", "FALSE", "FALSE"];

const grid: IkGrid = [head0, head1, head2, rCPO, rPO, rDEV1, rQA, rCS1, rQAX, rNONE];

// ─── Ay ekseni / kolon anahtarları ─────────────────────────────────────────
describe("monthAxis / ikColumn — pozisyonel ay ekseni (col9 = Eyl 26)", () => {
  it("anchor sabitleri: col 9 = 2026-09", () => {
    expect(IK_ANCHOR_COL).toBe(9);
    expect(IK_ANCHOR_YM).toBe("2026-09");
  });
  it("col 9 → 2026-09 (Eyl 26), col 10 → 2026-10, col 13 → 2027-01", () => {
    const ax = monthAxis(grid);
    const at = (c: number) => ax.find((a) => a.col === c)!;
    expect(at(9).ym).toBe("2026-09");
    expect(at(9).label).toBe("Eyl 26");
    expect(at(10).ym).toBe("2026-10");
    expect(at(13).ym).toBe("2027-01");
    expect(at(13).label).toBe("Oca 27");
  });
  it("eksen J sütunundan başlar ve matris genişliğince sürer (6 ay fixture)", () => {
    const ax = monthAxis(grid);
    expect(ax[0].col).toBe(9);
    expect(ax.map((a) => a.ym)).toEqual([
      "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02",
    ]);
  });
  it("ikColumn: Rol Kodu=0, Rol Adı=1, Kademe=5, netMaaş=8", () => {
    expect(ikColumn("kod")).toBe(0);
    expect(ikColumn("ad")).toBe(1);
    expect(ikColumn("kademe")).toBe(5);
    expect(ikColumn("net")).toBe(8);
  });
});

// ─── İşe alım türetimi: ilk TRUE = katıldığı ay ────────────────────────────
describe("hiresByMonth — bir rol ilk TRUE olduğu ay 'katıldı'", () => {
  const byM = hiresByMonth(grid);
  const on = (ym: string) => byM.get(ym) ?? [];
  const codes = (ym: string) => on(ym).map((h) => h.kod);

  it("R-CPO Eyl 2026'da katılır (kuruluş çekirdek ekip)", () => {
    expect(codes("2026-09")).toContain("R-CPO");
  });
  it("Eyl 2026 çekirdek ekip = R-CPO + R-PO (col9 TRUE)", () => {
    expect(codes("2026-09").sort()).toEqual(["R-CPO", "R-PO"]);
  });
  it("R-DEV1 Eki 2026'da katılır (col10 ilk TRUE)", () => {
    expect(codes("2026-10")).toEqual(["R-DEV1"]);
  });
  it("R-QA Kas 2026, R-CS1 Ara 2026", () => {
    expect(codes("2026-11")).toEqual(["R-QA"]);
    expect(codes("2026-12")).toEqual(["R-CS1"]);
  });
  it("R-QAX Oca 2027'de katılır (resmî lansman ayı işe alımı)", () => {
    expect(codes("2027-01")).toEqual(["R-QAX"]);
  });
  it("hiç TRUE olmayan rol (R-NONE) hiçbir aya eklenmez", () => {
    const all = [...byM.values()].flat().map((h) => h.kod);
    expect(all).not.toContain("R-NONE");
  });
  it("her işe alım kaydında rol adı + kademe taşınır (para YOK)", () => {
    const cpo = on("2026-09").find((h) => h.kod === "R-CPO")!;
    expect(cpo.ad).toBe("CPO / Strateji");
    expect(cpo.kademe).toBe("C-Level");
    expect(cpo).not.toHaveProperty("maas");
    expect(cpo).not.toHaveProperty("tl");
    expect(cpo).not.toHaveProperty("brut");
  });
});

// ─── Fazlar / kilometre taşları (kod sabiti + ay eşlemesi) ─────────────────
describe("PHASES / phaseForYm — proje fazları koda gömülü", () => {
  it("kuruluş fazı Tem–Ağu 2026", () => {
    expect(phaseForYm("2026-07")!.key).toBe("kurulus");
    expect(phaseForYm("2026-08")!.key).toBe("kurulus");
  });
  it("çekirdek ekip / geliştirme Eyl 2026", () => {
    expect(phaseForYm("2026-09")!.key).toBe("cekirdek");
  });
  it("Oca 2027 = RESMÎ LANSMAN (B2B satış başlar)", () => {
    const ph = phaseForYm("2027-01")!;
    expect(ph.key).toBe("lansman");
    expect(ph.ad.toLocaleLowerCase("tr")).toContain("lansman");
    expect((ph.ad + " " + ph.aciklama).toLocaleLowerCase("tr")).toContain("b2b");
  });
  it("2027 (lansman sonrası) = ölçekleme", () => {
    expect(phaseForYm("2027-06")!.key).toBe("olcekleme");
  });
  it("2028+ = plateau / istikrar", () => {
    expect(phaseForYm("2028-03")!.key).toBe("plato");
    expect(phaseForYm("2030-01")!.key).toBe("plato");
  });
  it("PHASES sıralı ve her fazın açıklaması var; FİNANSAL rakam içermez", () => {
    expect(PHASES.length).toBeGreaterThanOrEqual(5);
    for (const p of PHASES) {
      expect(p.aciklama.length).toBeGreaterThan(0);
      // para/₺/gelir sızıntısı olmasın
      expect(p.aciklama).not.toMatch(/₺|\$|gelir|pazarlama bütçe/i);
    }
    const keys = PHASES.map((p) => p.key);
    expect(keys).toEqual([...keys].sort((a, b) => {
      const ord = PHASES.find((p) => p.key === a)!.baslaYm;
      const ord2 = PHASES.find((p) => p.key === b)!.baslaYm;
      return ord < ord2 ? -1 : 1;
    }));
  });
});

// ─── buildTimeline: aylık aksiyon kartları (işe alım + faz + GTM) ──────────
describe("buildTimeline — aylık proje aksiyon çizelgesi", () => {
  const tl = buildTimeline(grid);
  const month = (ym: string) => tl.months.find((m) => m.ym === ym);

  it("her ayın işe alımı sheet'ten gelir; Eyl 2026 çekirdek ekibi", () => {
    const m = month("2026-09")!;
    expect(m.hires.map((h) => h.kod).sort()).toEqual(["R-CPO", "R-PO"]);
    expect(m.phase!.key).toBe("cekirdek");
  });
  it("Oca 2027 ayı resmî lansman fazı + o ay işe alınan R-QAX", () => {
    const m = month("2027-01")!;
    expect(m.phase!.key).toBe("lansman");
    expect(m.hires.map((h) => h.kod)).toContain("R-QAX");
  });
  it("GTM aksiyonları lansman civarı aylara yerleşir (Ege yıldız ilçeleri)", () => {
    const gtmMonths = tl.months.filter((m) => m.gtm.length > 0).map((m) => m.ym);
    // en az bir GTM ayı resmî lansman (2027-01) veya komşusu olmalı
    expect(gtmMonths.length).toBeGreaterThan(0);
    const allGtm = tl.months.flatMap((m) => m.gtm).join(" ").toLocaleLowerCase("tr");
    expect(allGtm).toMatch(/bodrum|çeşme|urla|didim|kuşadası/);
    expect(allGtm).toMatch(/saha/); // araçlı saha keşif / saha satış
  });
  it("kuruluş ayları (Tem–Ağu 2026) işe alım yoksa da faz kartı olarak görünür", () => {
    // Timeline kuruluştan başlar; Tem/Ağu 2026 fazlı ama işe-alımsız olabilir
    expect(month("2026-07")).toBeTruthy();
    expect(month("2026-07")!.phase!.key).toBe("kurulus");
  });
  it("kartlar zigzag için index taşır (0-based; çift=sol, tek=sağ)", () => {
    tl.months.forEach((m, i) => expect(m.index).toBe(i));
    // side yardımcı: çift index sol, tek sağ
    expect(tl.months[0].side).toBe("left");
    expect(tl.months[1].side).toBe("right");
    expect(tl.months[2].side).toBe("left");
  });
  it("timeline yalnız içerikli ayları (faz/işe-alım/GTM) barındırır; boş ay yok", () => {
    for (const m of tl.months) {
      const hasContent = !!m.phase || m.hires.length > 0 || m.gtm.length > 0;
      expect(hasContent).toBe(true);
    }
  });
  it("toplam işe alınan rol sayısı = matriste ≥1 TRUE olan rol sayısı (6)", () => {
    const total = tl.months.reduce((s, m) => s + m.hires.length, 0);
    expect(total).toBe(6); // R-NONE hariç 6 rol
  });
  it("MODELDE FİNANSAL ALAN YOK (gelir/pazarlama/kümülatif/₺)", () => {
    const json = JSON.stringify(tl);
    expect(json).not.toMatch(/gelirKum|pazKum|somPct|toplamGelir|toplamPazarlama/);
  });
});

// ─── iki-tab navigasyon (değişmeden korunur) ───────────────────────────────
describe("iki-tab navigasyon durumu (showRoadmap / selectTab)", () => {
  it("roadmap yalnız sheetMode + roadmap sekmesinde gösterilir", () => {
    expect(showRoadmap(true, "roadmap")).toBe(true);
    expect(showRoadmap(true, "finansal")).toBe(false);
    expect(showRoadmap(false, "roadmap")).toBe(false);
    expect(showRoadmap(false, "finansal")).toBe(false);
  });
  it("selectTab tıklanan sekmeyi aktifleştirir (idempotent)", () => {
    expect(selectTab("finansal", "roadmap")).toBe("roadmap");
    expect(selectTab("roadmap", "finansal")).toBe("finansal");
    expect(selectTab("roadmap", "roadmap")).toBe("roadmap");
  });
});
