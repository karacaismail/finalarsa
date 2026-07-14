import { describe, it, expect } from "vitest";
import {
  deriveRevenueSnapshot, buildSmartTargets, cumulativeByYm,
  GELIR_ANCHOR_YM, SMART_END_YM,
} from "./roadmap";
import type { IkGrid, RevenueMonth } from "./roadmap";
import revenue from "../data/roadmap-revenue-snapshot.json";

// ─── GELİR SENARYOSU fixture (gerçek sheet yapısı: satır0 başlık col1="Tem 26") ──
// Ay ekseni POZİSYONEL: col1=Tem26 (2026-07) … col9=Mar27 (2027-03). Gerçek Mar-27
// hedef sayılarıyla birebir (doğrulama kotanı için). col10=Nis27 → PENCERE DIŞI.
const head = ["ARSAM.NET — GELİR PROJEKSİYONU",
  "Tem 26 ", "Agu 26 ", "Eyl 26 ", "Eki 26 ", "Kas 26 ", "Ara 26 ", "Oca 27 ", "Sub 27 ", "Mar 27 ", "Nis 27 "];
const ilanArsa  = ["Toplam İlan Sayısı (Arsa)",  "0", "1", "4", "12", "32", "88", "233", "585", "1.322", "2.457"];
const ilanEmlak = ["Toplam İlan Sayısı (Emlak)", "0", "3", "12", "36", "96", "264", "699", "1.755", "3.966", "7.371"];
const gelirArsa = ["Arsa/Arazi Toplam Gelir", "0", "9.350", "37.400", "112.200", "299.200", "822.800", "2.178.550", "5.469.750", "12.360.700", "22.972.950"];
const gelirEmlak= ["Emlak Toplam Gelir (Arsa × 1/10)", "0", "935", "3.740", "11.220", "29.920", "82.280", "217.855", "546.975", "1.236.070", "2.297.295"];
const aylik     = ["TOPLAM AYLIK GELİR (Arsa + Emlak)", "0", "10.285", "41.140", "123.420", "329.120", "905.080", "2.396.405", "6.016.725", "13.596.770", "25.270.245"];
const kum       = ["KÜMÜLATİF GELİR", "0", "10.285", "51.425", "174.845", "503.965", "1.409.045", "3.805.450", "9.822.175", "23.418.945", "48.689.190"];
const som       = ["Arsa Hedef Pazar Payı (SOM %)", "0,0%", "0,6%", "1,1%", "1,7%", "2,2%", "2,8%", "3,3%", "3,9%", "4,4%", "8,2%"];

const grid: IkGrid = [head, ilanArsa, ilanEmlak, gelirArsa, gelirEmlak, aylik, kum, som];

describe("deriveRevenueSnapshot — GELİR SENARYOSU'ndan pencere-içi aylık gelir", () => {
  const rows = deriveRevenueSnapshot(grid);

  it("ilk ay = Tem 2026 (col1 çıpası), 9 ay döner (Tem26..Mar27)", () => {
    expect(rows[0].ym).toBe(GELIR_ANCHOR_YM);
    expect(rows[0].ym).toBe("2026-07");
    expect(rows.length).toBe(9);
    expect(rows[rows.length - 1].ym).toBe("2027-03");
  });

  it("Nis 2027 ve sonrası PENCERE DIŞI (dahil edilmez)", () => {
    for (const r of rows) expect(r.ym <= SMART_END_YM).toBe(true);
    expect(rows.map((r) => r.ym)).not.toContain("2027-04");
  });

  it("TR sayı biçimi doğru parse: Mar-27 aylık gelir = 13.596.770", () => {
    const mar = rows.find((r) => r.ym === "2027-03")!;
    expect(mar.aylikGelir).toBe(13596770);
    expect(mar.kumulatif).toBe(23418945);
    expect(mar.gelirArsa).toBe(12360700);
    expect(mar.gelirEmlak).toBe(1236070);
    expect(mar.ilanArsa).toBe(1322);
    expect(mar.ilanEmlak).toBe(3966);
  });

  it("SOM yüzdesi SAYI olarak (4,4% → 4.4)", () => {
    const mar = rows.find((r) => r.ym === "2027-03")!;
    expect(mar.somArsa).toBeCloseTo(4.4, 5);
  });

  it("boş ızgara → boş dizi (asla patlamaz)", () => {
    expect(deriveRevenueSnapshot([])).toEqual([]);
    expect(deriveRevenueSnapshot([head])).toEqual([]);
  });
});

describe("buildSmartTargets — Mar 2027 hedef özeti (GETİRİ, maliyet değil)", () => {
  const rows = deriveRevenueSnapshot(grid);
  const t = buildSmartTargets(rows);

  it("ufuk Mar 2027", () => { expect(t.ufukYm).toBe("2027-03"); });

  it("kümülatif gelir Tem26→Mar27 = 23.418.945 ₺", () => {
    expect(t.kumulatifGelir).toBe(23418945);
  });

  it("Mar-27 aylık run-rate = 13.596.770 ₺", () => {
    expect(t.aylikRunRate).toBe(13596770);
  });

  it("aktif ilan Mar27: Arsa 1.322 + Emlak 3.966 = 5.288", () => {
    expect(t.ilanArsa).toBe(1322);
    expect(t.ilanEmlak).toBe(3966);
    expect(t.ilanToplam).toBe(5288);
  });

  it("gelir modeli kırılımı: Arsa ≈ %91 (12,36M), Emlak ≈ %9 (1,24M)", () => {
    expect(t.gelirArsa).toBe(12360700);
    expect(t.gelirEmlak).toBe(1236070);
    expect(Math.round(t.arsaPayPct)).toBe(91);
    expect(Math.round(t.emlakPayPct)).toBe(9);
    // Emlak = Arsa'nın 1/10'u → arsa payı emlak payının ~10 katı
    expect(t.arsaPayPct / t.emlakPayPct).toBeCloseTo(10, 1);
  });

  it("Arsa SOM pazar payı hedefi Mar27 = %4,4", () => {
    expect(t.somArsaPct).toBeCloseTo(4.4, 5);
  });

  it("boş dizi → sıfırlı özet (asla patlamaz), ufuk yine Mar 2027", () => {
    const e = buildSmartTargets([]);
    expect(e.kumulatifGelir).toBe(0);
    expect(e.aylikRunRate).toBe(0);
    expect(e.ufukYm).toBe("2027-03");
  });
});

describe("cumulativeByYm — timeline'a işlenecek o-aya-kadar kümülatif gelir", () => {
  it("her ym için kümülatif gelir map'ler", () => {
    const rows = deriveRevenueSnapshot(grid);
    const m = cumulativeByYm(rows);
    expect(m.get("2026-07")).toBe(0);
    expect(m.get("2026-12")).toBe(1409045);
    expect(m.get("2027-03")).toBe(23418945);
  });
});

// ─── Commit edilmiş revenue snapshot JSON (build-time üretilir) ──────────────
describe("roadmap-revenue-snapshot.json — commit edilmiş build-time gelir snapshot", () => {
  it("dizi ve her satır RevenueMonth şemasına uyar", () => {
    expect(Array.isArray(revenue)).toBe(true);
    for (const r of revenue as RevenueMonth[]) {
      expect(r.ym).toMatch(/^\d{4}-\d{2}$/);
      expect(typeof r.aylikGelir).toBe("number");
      expect(typeof r.kumulatif).toBe("number");
      expect(typeof r.ilanArsa).toBe("number");
      expect(typeof r.somArsa).toBe("number");
    }
  });

  it("tüm satırlar ≤ Mar 2027 (pencere dışı ay yok)", () => {
    for (const r of revenue as RevenueMonth[]) {
      expect(r.ym <= SMART_END_YM).toBe(true);
    }
  });

  it("committed veri doluysa Mar-27 hedefleri sheet ile eşleşir", () => {
    const rows = revenue as RevenueMonth[];
    const mar = rows.find((r) => r.ym === "2027-03");
    if (mar) {
      const t = buildSmartTargets(rows);
      expect(t.kumulatifGelir).toBe(23418945);
      expect(t.aylikRunRate).toBe(13596770);
      expect(t.ilanToplam).toBe(5288);
      expect(t.somArsaPct).toBeCloseTo(4.4, 5);
    }
  });
});
