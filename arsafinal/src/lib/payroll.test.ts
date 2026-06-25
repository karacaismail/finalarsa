import { describe, it, expect } from "vitest";
import { PARAMS_2026 as P, vergiKumulatif, bordroAy, brutCozHedefNet } from "./payroll";

describe("kümülatif gelir vergisi (2026 ücret tarifesi)", () => {
  it("dilim sınırları doğru", () => {
    expect(vergiKumulatif(190000, P)).toBeCloseTo(28500, 2);          // %15
    expect(vergiKumulatif(400000, P)).toBeCloseTo(70500, 2);          // +%20×210k
    expect(vergiKumulatif(1500000, P)).toBeCloseTo(367500, 2);        // +%27×1,1M
    expect(vergiKumulatif(5300000, P)).toBeCloseTo(1697500, 2);       // +%35×3,8M
  });
});

describe("asgari ücret bordrosu (2026)", () => {
  it("asgari ücretli: gelir vergisi 0, damga 0, net 28.075,50", () => {
    const b = bordroAy(33030, 0, 0, P);
    expect(b.gelirVergisi).toBeCloseTo(0, 2);
    expect(b.damga).toBeCloseTo(0, 2);
    expect(b.net).toBeCloseTo(28075.5, 1);
  });
});

describe("tavan altı çalışan (brüt 56.151)", () => {
  it("işveren maliyeti = brüt × 1,2375 (SGK tavan altı)", () => {
    const b = bordroAy(56151, 0, 0, P);
    expect(b.calisanSgk).toBeCloseTo(56151 * 0.15, 2);
    expect(b.sirketMaliyet).toBeCloseTo(56151 * 1.2375, 1);
  });
});

describe("KURUCU — 7.500$ NET hedefi (araştırmayla birebir)", () => {
  // 7500 USD × 46,52 = 348.900 TL net
  const hedefNet = 348900;

  it("Ocak (kümülatif 0): brüt ~469.940, işveren ~540.541, vergi ~73.133", () => {
    const brut = brutCozHedefNet(hedefNet, 0, 0, P);
    const b = bordroAy(brut, 0, 0, P);
    expect(b.net).toBeCloseTo(hedefNet, 0);
    expect(brut).toBeGreaterThan(469000);
    expect(brut).toBeLessThan(471000);          // ~469.940
    expect(b.gelirVergisi).toBeCloseTo(73133, -2); // ±~100
    expect(b.calisanSgk).toBeCloseTo(44590.5, 1);  // tavandan sabit
    expect(b.isverenSgk).toBeCloseTo(70601.6, 0);  // tavandan sabit
    expect(b.sirketMaliyet).toBeGreaterThan(539000);
    expect(b.sirketMaliyet).toBeLessThan(542000);  // ~540.541
  });

  it("tavan-taban: yıl boyu sabit net için brüt ARTAR (Ara > Oca)", () => {
    let kumMatrah = 0, kumAsgari = 0, ocakBrut = 0, aralikBrut = 0, aralikMaliyet = 0;
    for (let ay = 1; ay <= 12; ay++) {
      const brut = brutCozHedefNet(hedefNet, kumMatrah, kumAsgari, P);
      const b = bordroAy(brut, kumMatrah, kumAsgari, P);
      expect(b.net).toBeCloseTo(hedefNet, 0); // her ay net sabit
      if (ay === 1) ocakBrut = brut;
      if (ay === 12) { aralikBrut = brut; aralikMaliyet = b.sirketMaliyet; }
      kumMatrah += b.gvMatrah;
      kumAsgari += P.asgariGvMatrah;
    }
    expect(aralikBrut).toBeGreaterThan(ocakBrut);     // tavan > taban
    expect(aralikBrut).toBeGreaterThan(610000);       // araştırma ~624.210
    expect(aralikBrut).toBeLessThan(640000);
    expect(aralikMaliyet).toBeGreaterThan(680000);    // araştırma ~694.812
    expect(aralikMaliyet).toBeLessThan(705000);
  });
});

describe("teşvik parametresi etkisi", () => {
  it("işveren oranı düşünce maliyet düşer", () => {
    const tesvikli = bordroAy(56151, 0, 0, { ...P, isverenSgkOran: 0.2175 });
    const tesviksiz = bordroAy(56151, 0, 0, P);
    expect(tesvikli.sirketMaliyet).toBeLessThan(tesviksiz.sirketMaliyet);
  });
});
