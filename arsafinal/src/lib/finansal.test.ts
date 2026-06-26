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
    expect(H.capex.toplamTl).toBe(3134200); // Ağustos = yalnız kuruluş/donanım (yazılım dev Temmuz'a taşındı)
  });
  it("Temmuz yazılım geliştirme avansı = 18.000 USD, 2 eşit taksit (5 Tem + 5 Ağu)", () => {
    expect(H.yazilimDev.toplamTl).toBeCloseTo(18000 * 46.52, 2);
    expect(H.yazilimDev.kalemler).toHaveLength(2);
    expect(H.yazilimDev.kalemler[0].tl).toBeCloseTo(9000 * 46.52, 2);
    expect(H.yazilimDev.kalemler[1].tl).toBeCloseTo(9000 * 46.52, 2);
    expect(H.yazilimDev.kalemler[0].ad).toContain("5 Temmuz");
    expect(H.yazilimDev.kalemler[1].ad).toContain("5 Ağustos");
  });
  it("ilk ay (Eyl 2026) = Ağustos işbaşı kadrosunun maaşı (saf arrears)", () => {
    expect(H.aylar[0].ym).toBe("2026-09");
    const ilk = ROLES.filter((r) => r.istihdamYm <= "2026-08").length; // eym = Ağu 2026
    expect(H.aylar[0].kisi).toBe(ilk);
    expect(H.aylar[0].kisi).toBe(12);  // 1 Ağustos işbaşı: 12 kurucu kadro
    expect(H.aylar[0].yeni).toBe(ROLES.filter((r) => r.istihdamYm === "2026-08").length);
  });
  it("son ay (Ağu 2028) = eym (Tem 2028) işgücü = aktif rol sayısı", () => {
    const son = ROLES.filter((r) => r.istihdamYm <= "2028-07").length; // eym = Tem 2028
    expect(H.aylar[23].kisi).toBe(son);
  });
  it("NAKİT ZAMANLAMA: Eylül'de Ağustos kadrosunun maaşı görünür; Aralık maaşı Oca 2027'ye kayar", () => {
    const net = (i: number) => H.aylar[i].kumeler.find((k) => k.key === "personel")!.kalemler[0].tl;
    expect(net(0)).toBeGreaterThan(0); // Eyl 2026: Ağustos işbaşı kadrosunun maaşı (5 Eylül'de ödenir)
    expect(H.aylar[4].ym).toBe("2027-01");
    expect(net(4)).toBeGreaterThan(0); // Oca 2027: Aralık işgücünün maaşı (5 Ocak ödeme) → "2026 sonu"na girmez
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
    // araç eym: BMW segmenti hak-ediş 2028-01 → ÖDEME Şub 2028 (2028-02)
    const sub28 = H.aylar.find((a) => a.ym === "2028-02")!;
    const arac28 = sub28.kumeler.find((k) => k.key === "personel")!.kalemler.find((x) => x.ad.includes("CPO araç"))!;
    expect(arac28.tl).toBe(160000);
  });
  it("personel en büyük kümedir (ilk ay — kurucu net dahil)", () => {
    const ay = H.aylar[0]; // Eyl 2026: Ağustos kadrosunun maaşı (kurucu net dahil)
    const p = ay.kumeler.find((k) => k.key === "personel")!;
    for (const k of ay.kumeler) if (k.key !== "personel" && k.key !== "capex") expect(p.tl).toBeGreaterThanOrEqual(k.tl);
  });
  it("ikramiye TARİHE BAĞLI: bayram/yıl-sonu aylarında prim, diğer aylarda 0", () => {
    const ik = (ym: string) => H.aylar.find((a) => a.ym === ym)!.kumeler.find((k) => k.key === "personel")!.kalemler.find((x) => x.ad.startsWith("İkramiye"))!;
    expect(ik("2026-09").tl).toBe(0);                 // Eyl: prim yok
    const ara = ik("2026-12");                        // Ara: yılsonu %30 + yılbaşı %20
    expect(ara.tl).toBeGreaterThan(0);
    expect(ara.ad).toContain("Yılsonu");
    expect(ara.ad).toContain("Yılbaşı");
    expect(ik("2027-03").ad).toContain("Ramazan");    // Mar 2027: Ramazan Bayramı
    expect(ik("2027-05").ad).toContain("Kurban");     // May 2027: Kurban Bayramı
    expect(ik("2028-02").ad).toContain("Ramazan");    // Şub 2028: Ramazan Bayramı (Diyanet)
    // Ara 2026 ikramiye = %50 × aktif brüt toplam (pozitif ve makul büyüklük)
    expect(ara.tl).toBeGreaterThan(500000);
  });
  it("yemek KADEMELİ: C-level 15.000, Team Lead 10.000, baz 9.000", () => {
    // Eyl 2026 bordrosu = Ağu kadrosu 12 = 1 C-Level (CPO) + 1 Team Lead (AST) + 10 baz
    const yemek = H.aylar[0].kumeler.find((k) => k.key === "personel")!.kalemler.find((x) => x.ad === "Yemek")!;
    expect(yemek.tl).toBe(15000 + 10000 + 10 * 9000); // 115.000
  });
  it("kurucu net-hedef personele dahil (net maaşlar büyük)", () => {
    // Eyl 2026: Ağustos kadrosunun maaşı (kurucu dahil) burada görünür
    const net = H.aylar[0].kumeler.find((k) => k.key === "personel")!.kalemler[0].tl;
    expect(net).toBeGreaterThan(348900); // en az kurucu net'i kadar
  });
});

describe("CAPEX & ofis (ilk ay özel)", () => {
  it("CAPEX yalnız Ağustos'ta (H.capex); operasyonel aylarda CAPEX kümesi YOK", () => {
    expect(H.capex.toplamTl).toBe(3134200);                          // Ağustos = kuruluş yatırımı (yazılım dev hariç)
    expect(H.aylar[0].kumeler.find((k) => k.key === "capex")).toBeUndefined(); // Eyl'de CAPEX yok
    expect(H.aylar.some((a) => a.kumeler.some((k) => k.key === "capex"))).toBe(false); // hiçbir ayda yok
    expect(H.aylar.some((a) => a.ym === "2026-08")).toBe(false);                // Ağustos operasyonel aylarda değil
    expect(H.capex.kalemler.some((k) => k.ad.includes("Yazılım"))).toBe(false); // yazılım dev ücreti CAPEX'e sızmamalı
  });
  it("ilk ay ofis = kira + depozito; sonraki ay sadece kira", () => {
    const o0 = H.aylar[0].kumeler.find((k) => k.key === "ofis")!;
    const o1 = H.aylar[1].kumeler.find((k) => k.key === "ofis")!;
    expect(o0.tl).toBe(150000 + 450000);
    expect(o1.tl).toBe(150000);
  });
});

describe("sürekli giderler (headcount-ölçekli)", () => {
  it("ilk ay utilities = 2.430.000 × 12/256 (cari ay headcount); 8 kalem", () => {
    const s = H.aylar[0].kumeler.find((k) => k.key === "surekli")!;
    expect(s.tl).toBeCloseTo(2430000 * 12 / 256, 2); // Eyl eym (Ağu) = 12 kişi
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
    expect(load().meta.schemaVersion).toBe("5.9.0");
  });
});
