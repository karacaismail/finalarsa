import { describe, it, expect } from "vitest";
import {
  deriveSnapshot, buildTimelineFromSnapshot, buildTimeline,
  TIMELINE_END_YM,
} from "./roadmap";
import type { IkGrid, RoadmapSnapshotRow } from "./roadmap";
import snapshot from "../data/roadmap-snapshot.json";

// ─── İK PLANI fixture (gerçek sheet yapısı, roadmap.test.ts ile aynı) ──────
// Satır 2 başlıkları gerçek sheet ile birebir: Donanım col3, boş col4, Kademe col5.
// Sheet'te J+ (col9) başlıkları BOŞ → ay ekseni POZİSYONEL: col 9 = Eyl 26 (2026-09).
const pad = (n: number) => Array(n).fill("");
const head0 = ["ARSAM.NET — İSTİHDAM TAKVİMİ", ...pad(7), "Asgari Ücret"];
const head1 = ["Aylık Net Maaş tutarı"];
const head2 = ["Rol Kodu", "Rol Adı", "Job Family", "Donanım", "", "Kademe", "Ünvan", "Aday"];
// R-CPO: col9 = Eyl 26 ilk TRUE
const rCPO  = ["R-CPO", "CPO / Strateji", "Product / Stratejik Planlama", "MacBook", "300000", "C-Level", "C-Level", "N/A", "200.000",
  "TRUE", "TRUE", "TRUE", "TRUE", "TRUE", "TRUE"];
const rPO   = ["R-PO", "Product Owner", "Product / UX / Program", "MacBook", "150000", "Ürün", "Senior", "N/A", "77.208",
  "TRUE", "TRUE", "TRUE", "TRUE", "TRUE", "TRUE"];
// R-DEV1: ilk TRUE col10 (Eki 26)
const rDEV1 = ["R-DEV1", "Backend Dev #1", "Engineering & Platform", "MacBook", "150000", "Teknik", "Mid", "N/A", "56.151",
  "FALSE", "TRUE", "TRUE", "TRUE", "TRUE", "TRUE"];
// R-QAX: ilk TRUE col13 (Oca 27 = resmî lansman)
const rQAX  = ["R-QAX", "QA #2", "Engineering & Platform", "MacBook", "150000", "Teknik", "Mid", "N/A", "56.151",
  "FALSE", "FALSE", "FALSE", "FALSE", "TRUE", "TRUE"];
// Hiç TRUE yok → snapshot'a girmez
const rNONE = ["R-NONE", "Boş rol", "Admin / PR / Office", "MacBook", "100000", "Idari", "Mid", "N/A", "42.113",
  "FALSE", "FALSE", "FALSE", "FALSE", "FALSE", "FALSE"];

const grid: IkGrid = [head0, head1, head2, rCPO, rPO, rDEV1, rQAX, rNONE];

// Pencere dışı rol (2027-04) içeren ayrı fixture — geniş matris.
// col9=Eyl26 … col16=Nis27 (offset 7). İlk TRUE col16 → joinYm 2027-04 → FİLTRELENMELİ.
const rLATE = ["R-LATE", "Geç rol", "Engineering & Platform", "MacBook", "150000", "Teknik", "Mid", "N/A", "56.151",
  "FALSE", "FALSE", "FALSE", "FALSE", "FALSE", "FALSE", "FALSE", "TRUE"];
const gridWide: IkGrid = [head0, head1, head2,
  ["R-CPO", "CPO / Strateji", "Product / Stratejik Planlama", "MacBook", "300000", "C-Level", "C-Level", "N/A", "200.000",
    "TRUE", ...pad(7)],
  rLATE,
];

describe("deriveSnapshot — İK PLANI ızgarasından minimal snapshot türetimi", () => {
  it("her rol için { kod, ad, jobFamily, kademe, joinYm } üretir (PARA YOK)", () => {
    const rows = deriveSnapshot(grid);
    const cpo = rows.find((r) => r.kod === "R-CPO")!;
    expect(cpo).toEqual({
      kod: "R-CPO",
      ad: "CPO / Strateji",
      jobFamily: "Product / Stratejik Planlama",
      kademe: "C-Level",
      joinYm: "2026-09",
    });
    // finansal alan sızmaz
    expect(cpo).not.toHaveProperty("maas");
    expect(cpo).not.toHaveProperty("net");
    expect(cpo).not.toHaveProperty("tl");
  });

  it("R-CPO joinYm = 2026-09 (ilk TRUE col9 = anchor ay)", () => {
    const rows = deriveSnapshot(grid);
    expect(rows.find((r) => r.kod === "R-CPO")!.joinYm).toBe("2026-09");
  });

  it("joinYm = rolün İLK TRUE olduğu ay sütunu (R-DEV1 col10 → 2026-10, R-QAX col13 → 2027-01)", () => {
    const rows = deriveSnapshot(grid);
    expect(rows.find((r) => r.kod === "R-DEV1")!.joinYm).toBe("2026-10");
    expect(rows.find((r) => r.kod === "R-QAX")!.joinYm).toBe("2027-01");
  });

  it("hiç TRUE olmayan rol (R-NONE) snapshot'a girmez", () => {
    const rows = deriveSnapshot(grid);
    expect(rows.map((r) => r.kod)).not.toContain("R-NONE");
  });

  it("SADECE joinYm <= 2027-03 roller; pencere dışı (2027-04) rol filtrelenir", () => {
    const rows = deriveSnapshot(gridWide);
    const codes = rows.map((r) => r.kod);
    expect(codes).toContain("R-CPO");        // 2026-09 → kalır
    expect(codes).not.toContain("R-LATE");   // 2027-04 → düşer
    for (const r of rows) expect(r.joinYm <= TIMELINE_END_YM).toBe(true);
  });

  it("boş matris → boş liste (asla patlamaz)", () => {
    expect(deriveSnapshot([])).toEqual([]);
    expect(deriveSnapshot([head0, head1, head2])).toEqual([]);
  });

  it("snapshot joinYm'e göre kronolojik sıralı", () => {
    const rows = deriveSnapshot(grid);
    const yms = rows.map((r) => r.joinYm);
    expect(yms).toEqual([...yms].sort());
  });
});

describe("buildTimelineFromSnapshot — snapshot satırlarından zigzag timeline", () => {
  it("snapshot rollerini joinYm ayına 'işe alım' olarak yerleştirir", () => {
    const rows = deriveSnapshot(grid);
    const tl = buildTimelineFromSnapshot(rows);
    const m = tl.months.find((x) => x.ym === "2026-09")!;
    expect(m.hires.map((h) => h.kod).sort()).toEqual(["R-CPO", "R-PO"]);
  });

  it("faz + GTM aksiyonları grid'siz de eklenir (Oca 27 lansman, Ege GTM)", () => {
    const rows = deriveSnapshot(grid);
    const tl = buildTimelineFromSnapshot(rows);
    const jan = tl.months.find((x) => x.ym === "2027-01")!;
    expect(jan.phase!.key).toBe("lansman");
    const allGtm = tl.months.flatMap((x) => x.gtm).join(" ").toLocaleLowerCase("tr");
    expect(allGtm).toMatch(/bodrum|çeşme|urla|didim|kuşadası/);
  });

  it("timeline Mar 2027'de biter (Nis 2027+ yok)", () => {
    const rows = deriveSnapshot(grid);
    const tl = buildTimelineFromSnapshot(rows);
    const yms = tl.months.map((m) => m.ym);
    expect(yms).not.toContain("2027-04");
    for (const ym of yms) expect(ym <= TIMELINE_END_YM).toBe(true);
    expect(tl.months.some((m) => m.phase?.key === "plato")).toBe(false);
  });

  it("zigzag index kesintisiz 0..N-1 (çift=sol, tek=sağ)", () => {
    const tl = buildTimelineFromSnapshot(deriveSnapshot(grid));
    tl.months.forEach((m, i) => expect(m.index).toBe(i));
    expect(tl.months[0].side).toBe("left");
    expect(tl.months[1].side).toBe("right");
  });

  it("toplamRol = snapshot rol sayısı (pencere içi)", () => {
    const rows = deriveSnapshot(grid);
    const tl = buildTimelineFromSnapshot(rows);
    expect(tl.toplamRol).toBe(rows.length);
    expect(tl.toplamRol).toBe(4); // R-CPO,R-PO,R-DEV1,R-QAX (R-NONE hariç)
  });

  it("boş snapshot → faz + GTM yine görünür, işe-alım boş (asla takılmaz)", () => {
    const tl = buildTimelineFromSnapshot([]);
    expect(tl.months.length).toBeGreaterThan(0);        // faz/GTM ayları hep var
    expect(tl.toplamRol).toBe(0);
    for (const m of tl.months) expect(Array.isArray(m.hires)).toBe(true);
  });

  it("buildTimelineFromSnapshot(deriveSnapshot(grid)) == buildTimeline(grid) (aylar & işe-alım)", () => {
    // Pencere içi roller için iki yol AYNI aylık işe-alım tablosunu üretmeli.
    const viaSnap = buildTimelineFromSnapshot(deriveSnapshot(grid));
    const viaGrid = buildTimeline(grid);
    const shape = (tl: typeof viaSnap) =>
      tl.months.map((m) => ({ ym: m.ym, kods: m.hires.map((h) => h.kod).sort(), phase: m.phase?.key ?? null, gtm: m.gtm }));
    expect(shape(viaSnap)).toEqual(shape(viaGrid));
  });
});

// ─── Committed snapshot JSON (build-time üretilir, offline fallback) ────────
describe("roadmap-snapshot.json — commit edilmiş build-time snapshot", () => {
  it("dizi ve her satır { kod, ad, jobFamily, kademe, joinYm } şemasına uyar", () => {
    expect(Array.isArray(snapshot)).toBe(true);
    for (const r of snapshot as RoadmapSnapshotRow[]) {
      expect(typeof r.kod).toBe("string");
      expect(typeof r.ad).toBe("string");
      expect(typeof r.jobFamily).toBe("string");
      expect(typeof r.kademe).toBe("string");
      expect(r.joinYm).toMatch(/^\d{4}-\d{2}$/);
    }
  });

  it("tüm satırlar joinYm <= 2027-03 (pencere dışı rol yok)", () => {
    for (const r of snapshot as RoadmapSnapshotRow[]) {
      expect(r.joinYm <= TIMELINE_END_YM).toBe(true);
    }
  });

  it("snapshot'tan timeline kurulabilir ve ANINDA render'a hazır (boş değil)", () => {
    const tl = buildTimelineFromSnapshot(snapshot as RoadmapSnapshotRow[]);
    expect(tl.months.length).toBeGreaterThan(0);
    // committed veri doluysa R-CPO Eyl 2026'da olmalı
    if ((snapshot as RoadmapSnapshotRow[]).some((r) => r.kod === "R-CPO")) {
      expect(tl.toplamRol).toBeGreaterThan(0);
    }
  });
});
