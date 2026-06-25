import { describe, it, expect } from "vitest";
import { DEFAULT_DATA, ymList, ayLabel } from "../data/finansal";
import { ROLES } from "../data/roles";
import { hesapla } from "./clusters";
import { toJSON, fromJSON, isValid, load } from "./store";

const H = hesapla(DEFAULT_DATA);

describe("takvim ve roller", () => {
  it("256 rol; pencere Eyl 2026 → Ağu 2028 (24 ay)", () => {
    expect(ROLES).toHaveLength(256);
    const y = ymList();
    expect(y[0]).toBe("2026-09");
    expect(y[23]).toBe("2028-08");
    expect(ayLabel("2026-09")).toBe("Eyl 2026");
  });
});

describe("hesapla — yapı", () => {
  it("24 ay + capex özeti", () => {
    expect(H.aylar).toHaveLength(24);
    expect(H.capex.toplamTl).toBe(3134200); // 7 kuruluş + 5 yeni kalem
  });
  it("ilk ay (Eyl 2026): 12 kişi, 7 yeni işe alım", () => {
    expect(H.aylar[0].ym).toBe("2026-09");
    expect(H.aylar[0].kisi).toBe(12);
    expect(H.aylar[0].yeni).toBe(7);
  });
  it("son ay (Ağu 2028): 106 kişi", () => {
    expect(H.aylar[23].kisi).toBe(106);
  });
});

describe("toplam kimliği (her ay)", () => {
  it("ay toplamı = kümelerin toplamı; küme = kalemlerin toplamı", () => {
    for (const ay of H.aylar) {
      const kumeSum = ay.kumeler.reduce((s, k) => s + k.tl, 0);
      expect(ay.toplamTl).toBeCloseTo(kumeSum, 2);
      for (const k of ay.kumeler) {
        expect(k.tl).toBeCloseTo(k.kalemler.reduce((s, x) => s + x.tl, 0), 2);
      }
    }
  });
});

describe("personel kümesi (bordro zinciri)", () => {
  it("personel kalemleri (net/vergi/sgk/yemek/yol/hoşgeldin/ikramiye/araç) = küme toplamı", () => {
    const p = H.aylar[0].kumeler.find((k) => k.key === "personel")!;
    expect(p).toBeTruthy();
    expect(p.kalemler).toHaveLength(8); // 7 + CPO araç
    expect(p.tl).toBeCloseTo(p.kalemler.reduce((s, x) => s + x.tl, 0), 2);
    expect(p.tl).toBeGreaterThan(0);
  });
  it("CPO araç kiralama: ilk ay 95.000; 2028 segment yükselir 160.000", () => {
    const arac0 = H.aylar[0].kumeler.find((k) => k.key === "personel")!.kalemler.find((x) => x.ad.includes("CPO araç"))!;
    expect(arac0.tl).toBe(95000);
    expect(arac0.ad).toContain("2025+ model:");
    expect(arac0.ad).not.toContain("Insignia");
    expect(arac0.ad).toContain("Mercedes C (W206)");
    expect(arac0.ad).toContain("VW Passat B9");
    const oca28 = H.aylar.find((a) => a.ym === "2028-01")!;
    const arac28 = oca28.kumeler.find((k) => k.key === "personel")!.kalemler.find((x) => x.ad.includes("CPO araç"))!;
    expect(arac28.tl).toBe(160000);
  });
  it("personel en büyük kümedir (ilk ay)", () => {
    const ay = H.aylar[0];
    const p = ay.kumeler.find((k) => k.key === "personel")!;
    for (const k of ay.kumeler) if (k.key !== "personel" && k.key !== "capex") expect(p.tl).toBeGreaterThanOrEqual(k.tl);
  });
  it("kurucu net-hedef personele dahil (net maaşlar büyük)", () => {
    const net = H.aylar[0].kumeler.find((k) => k.key === "personel")!.kalemler[0].tl;
    expect(net).toBeGreaterThan(348900); // en az kurucu net'i kadar
  });
});

describe("CAPEX & ofis (ilk ay özel)", () => {
  it("ilk yatırım SADECE item 1'de; aylık CAPEX yalnız yeni işe alım ekipmanı (çift CAPEX yok)", () => {
    expect(H.capex.toplamTl).toBe(3134200);              // item 1: kuruluş yatırımı + 5 yeni kalem (Obsbot/mic/toplantı PC/tahta/hava)
    const c0 = H.aylar[0].kumeler.find((k) => k.key === "capex")!;
    expect(c0.tl).toBe(7 * 24000);                       // Eyl 2026: 7 yeni × 24.000 = 168.000 (büyük yatırım YOK)
    expect(c0.tl).toBeLessThan(2800000);
  });
  it("ilk ay ofis = kira + depozito; sonraki ay sadece kira", () => {
    const o0 = H.aylar[0].kumeler.find((k) => k.key === "ofis")!;
    const o1 = H.aylar[1].kumeler.find((k) => k.key === "ofis")!;
    expect(o0.tl).toBe(150000 + 450000);
    expect(o1.tl).toBe(150000);
  });
});

describe("sürekli giderler (headcount-ölçekli)", () => {
  it("ilk ay utilities = 2.430.000 × 12/256; 8 kalem", () => {
    const s = H.aylar[0].kumeler.find((k) => k.key === "surekli")!;
    expect(s.tl).toBeCloseTo(2430000 * 12 / 256, 2);
    expect(s.kalemler).toHaveLength(8);
  });
});

describe("store v4", () => {
  it("JSON gidiş-dönüş + şema", () => {
    const back = fromJSON(toJSON(DEFAULT_DATA));
    expect(back.roles).toHaveLength(256);
    expect(back.params.usd).toBe(46.52);
    expect(isValid(DEFAULT_DATA)).toBe(true);
    expect(() => fromJSON("{bozuk")).toThrow();
  });
  it("load default (localStorage yok)", () => {
    expect(load().meta.schemaVersion).toBe("5.3.0");
  });
});
