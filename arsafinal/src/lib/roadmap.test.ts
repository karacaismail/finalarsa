import { describe, it, expect } from "vitest";
import { buildRoadmap, monthColumns, mpPct, showRoadmap, selectTab } from "./roadmap";
import type { RoadmapTabs } from "./roadmap";

// Gerçek sheet yapısını taklit eden 6 aylık fixture (gviz CSV: 0. sütun başlık, aylar 1..N).
// Değerler gerçek "GELİR SENARYOSU"nun ilk aylarından (Tem 26 → Ara 26).
const paz: string[][] = [
  ["ARSAM.NET — DİJİTAL PAZARLAMA", "Tem 26 ", "Agu 26 ", "Eyl 26 ", "Eki 26 ", "Kas 26 ", "Ara 26 "],
  ["Google Ads", "0", "0", "40.000", "60.000", "80.000", "200.000"],
  ["TOPLAM DİJİTAL PAZARLAMA", "88.000", "98.000", "207.000", "343.000", "391.000", "658.000"],
];
const gelir: string[][] = [
  ["ARSAM.NET — GELİR PROJEKSİYONU", "Tem 26 ", "Agu 26 ", "Eyl 26 ", "Eki 26 ", "Kas 26 ", "Ara 26 "],
  ["Toplam İlan Sayısı (Arsa)", "0", "1", "4", "12", "32", "88"],
  ["TOPLAM AYLIK GELİR (Arsa + Emlak)", "0", "10.285", "41.140", "123.420", "329.120", "905.080"],
  ["KÜMÜLATİF GELİR", "0", "10.285", "51.425", "174.845", "503.965", "1.409.045"],
  ["Arsa Hedef Pazar Payı (SOM %)", "0,0%", "0,6%", "1,1%", "1,7%", "2,2%", "2,8%"],
];
const tabs: RoadmapTabs = { paz, gelir };
const M = buildRoadmap(tabs);
const at = (ym: string) => M.points.find((p) => p.ym === ym)!;

describe("mpPct / monthColumns", () => {
  it("yüzde metni → sayı", () => {
    expect(mpPct("15,0%")).toBe(15);
    expect(mpPct("0,6%")).toBeCloseTo(0.6, 6);
    expect(mpPct("")).toBe(0);
  });
  it("ay başlığı → ym (Agu diakritik toleransı)", () => {
    const cols = monthColumns(["Metrik", "Tem 26 ", "Agu 26 ", "Sub 27 ", "", "boş"]);
    expect(cols.map((c) => c.ym)).toEqual(["2026-07", "2026-08", "2027-02"]);
    expect(cols[0].col).toBe(1);
    expect(cols[2].col).toBe(3);
  });
});

describe("buildRoadmap — nokta değerleri sheet'ten okunur", () => {
  it("6 ay noktası (Tem 26 → Ara 26)", () => expect(M.points.length).toBe(6));
  it("aylık pazarlama Eyl 26 = 207.000", () => expect(at("2026-09").pazAy).toBe(207000));
  it("aylık gelir Ara 26 = 905.080", () => expect(at("2026-12").gelirAy).toBe(905080));
  it("ilan Kas 26 = 32", () => expect(at("2026-11").ilan).toBe(32));
  it("SOM Ara 26 = %2,8", () => expect(at("2026-12").somPct).toBeCloseTo(2.8, 6));
});

describe("buildRoadmap — KÜMÜLATİF hesabı KENDİMİZ (sheet KÜMÜLATİF satırıyla MUTABIK)", () => {
  // Kritik test: kümülatif gelir = aylık gelirin koşan toplamı; sheet'in KÜMÜLATİF GELİR satırıyla birebir.
  it("kümülatif gelir her ay = aylık gelirin koşan toplamı", () => {
    let run = 0;
    for (const p of M.points) {
      run += p.gelirAy;
      expect(p.gelirKum).toBe(run);
    }
  });
  it("son kümülatif gelir = sheet KÜMÜLATİF GELİR son değeri (1.409.045)", () => {
    expect(M.toplamGelir).toBe(1409045);
    expect(M.sheetGelirKumSon).toBe(1409045);
    expect(M.toplamGelir).toBe(M.sheetGelirKumSon); // mutabakat
  });
  it("her ay kümülatif gelir = sheet KÜMÜLATİF satırı (satır satır mutabakat)", () => {
    const sheetKum = [0, 10285, 51425, 174845, 503965, 1409045];
    M.points.forEach((p, i) => expect(p.gelirKum).toBe(sheetKum[i]));
  });
  it("kümülatif pazarlama = aylık pazarlamanın koşan toplamı", () => {
    // 88.000 + 98.000 + 207.000 + 343.000 + 391.000 + 658.000 = 1.785.000
    expect(M.toplamPazarlama).toBe(1785000);
    expect(at("2026-09").pazKum).toBe(88000 + 98000 + 207000);
  });
});

describe("buildRoadmap — kilometre taşları sheet verisinden türetilir", () => {
  it("soft-launch = ilk ilan>0 ayı (Agu 26)", () => {
    const m = M.milestones.find((x) => x.key === "soft")!;
    expect(m.ym).toBe("2026-08"); // ilan ilk kez 1 → Agu 26
  });
  it("resmî lansman = aylık gelir ilk kez ≥ 1.000.000 (6 aylık fixture'da ulaşılmaz → null)", () => {
    const m = M.milestones.find((x) => x.key === "resmi")!;
    expect(m.ym).toBeNull(); // Ara 26 geliri 905.080 < 1M
  });
  it("plateau = SOM ilk kez ≥ %15 (fixture'da yok → null)", () => {
    const m = M.milestones.find((x) => x.key === "plateau")!;
    expect(m.ym).toBeNull();
  });
  it("her kilometre taşının açıklama notu var", () => {
    for (const m of M.milestones) expect(m.not.length).toBeGreaterThan(0);
  });
});

describe("buildRoadmap — daha uzun seride lansman/plateau türetimi", () => {
  // Gelir eşiği ve SOM tavanına ulaşan sentetik 3 aylık uzatma.
  const paz2: string[][] = [
    ["x", "Oca 27 ", "Şub 27 ", "Eki 28 "],
    ["TOPLAM DİJİTAL PAZARLAMA", "782.000", "914.000", "2.407.895"],
  ];
  const gelir2: string[][] = [
    ["x", "Oca 27 ", "Şub 27 ", "Eki 28 "],
    ["Toplam İlan Sayısı (Arsa)", "233", "585", "5.255"],
    ["TOPLAM AYLIK GELİR (Arsa + Emlak)", "2.396.405", "6.016.725", "67.496.491"],
    ["KÜMÜLATİF GELİR", "2.396.405", "8.413.130", "75.909.621"],
    ["Arsa Hedef Pazar Payı (SOM %)", "3,3%", "3,9%", "15,0%"],
  ];
  const M2 = buildRoadmap({ paz: paz2, gelir: gelir2 });
  it("resmî lansman = Oca 27 (aylık gelir 2.396.405 ≥ 1M)", () => {
    expect(M2.milestones.find((x) => x.key === "resmi")!.ym).toBe("2027-01");
  });
  it("plateau = Eki 28 (SOM %15)", () => {
    expect(M2.milestones.find((x) => x.key === "plateau")!.ym).toBe("2028-10");
  });
  it("plateau SOM payı (max) = %15", () => expect(M2.sonSomPct).toBe(15));
});

describe("iki-tab navigasyon durumu (showRoadmap / selectTab)", () => {
  it("roadmap yalnız sheetMode + roadmap sekmesinde gösterilir", () => {
    expect(showRoadmap(true, "roadmap")).toBe(true);
    expect(showRoadmap(true, "finansal")).toBe(false);
    expect(showRoadmap(false, "roadmap")).toBe(false); // v1/v3'te tab yok
    expect(showRoadmap(false, "finansal")).toBe(false);
  });
  it("selectTab tıklanan sekmeyi aktifleştirir (idempotent)", () => {
    expect(selectTab("finansal", "roadmap")).toBe("roadmap");
    expect(selectTab("roadmap", "finansal")).toBe("finansal");
    expect(selectTab("roadmap", "roadmap")).toBe("roadmap");
  });
});
