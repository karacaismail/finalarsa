import { describe, it, expect } from "vitest";
import { DEFAULT_DATA, ymList, ayLabel } from "../data/finansal";
import { ROLES } from "../data/roles";
import { hesapla } from "./clusters";
import { toJSON, fromJSON, isValid, load } from "./store";

const H = hesapla(DEFAULT_DATA);
const ay = (ym: string) => H.aylar.find((a) => a.ym === ym)!;
const kume = (ym: string, key: string) => ay(ym).kumeler.find((k) => k.key === key);
const kalem = (ym: string, key: string, ad: string) => kume(ym, key)?.kalemler.find((x) => x.ad === ad)?.tl ?? 0;
const net = (ym: string) => kume(ym, "personel")!.kalemler[0].tl;

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
    expect(H.capex.toplamTl).toBe(3134200); // Ağustos = yalnız kuruluş/donanım
  });
  it("Temmuz yazılım geliştirme avansı = 18.000 USD, 2 eşit taksit (5 Tem + 5 Ağu)", () => {
    expect(H.yazilimDev.toplamTl).toBeCloseTo(18000 * 46.52, 2);
    expect(H.yazilimDev.kalemler).toHaveLength(2);
    expect(H.yazilimDev.kalemler[0].tl).toBeCloseTo(9000 * 46.52, 2);
    expect(H.yazilimDev.kalemler[0].ad).toContain("5 Temmuz");
    expect(H.yazilimDev.kalemler[1].ad).toContain("5 Ağustos");
  });
});

describe("HEADCOUNT = cari ay (başlık)", () => {
  it("Eyl 2026 = 5 kurucu (CPO, GRF, PO, GIS, AST); +5 yeni", () => {
    expect(ay("2026-09").kisi).toBe(5);
    expect(ay("2026-09").yeni).toBe(5);
    expect(ay("2026-09").kisi).toBe(ROLES.filter((r) => r.istihdamYm <= "2026-09").length);
  });
  it("kadro cari ay ile büyür: Eki 9, Kas 13, Ara 18", () => {
    expect(ay("2026-10").kisi).toBe(9);
    expect(ay("2026-11").kisi).toBe(13);
    expect(ay("2026-12").kisi).toBe(18);
  });
});

describe("BORDRO = saf arrears (nakit, bir ay gecikmeli)", () => {
  it("Eyl'de net maaş=0 ve stopaj=0 (kurucular Eylül başlar, ilk maaş 5 Ekim'de ödenir)", () => {
    expect(net("2026-09")).toBe(0);
    expect(kalem("2026-09", "personel", "Maaş gelir vergisi stopajı (muhtasar)")).toBe(0);
    expect(kalem("2026-09", "personel", "SGK primleri (işçi + işveren)")).toBe(0);
    expect(kalem("2026-09", "personel", "Yemek")).toBe(0);
  });
  it("Eki'de Eylül kadrosunun maaşı görünür (kurucu net-hedef dahil, büyük)", () => {
    expect(net("2026-10")).toBeGreaterThan(348900); // en az kurucu net-hedefi ($7500×46,52)
    expect(kalem("2026-10", "personel", "Maaş gelir vergisi stopajı (muhtasar)")).toBeGreaterThan(0);
  });
  it("yemek KADEMELİ (Eki = Eylül 5 kurucu): C-level 15.000 + Team Lead 10.000 + 3×9.000 = 52.000", () => {
    expect(kalem("2026-10", "personel", "Yemek")).toBe(15000 + 10000 + 3 * 9000);
  });
});

describe("toplam kimliği (her ay)", () => {
  it("ay toplamı = kümelerin toplamı; küme = kalemlerin toplamı", () => {
    for (const a of H.aylar) {
      expect(a.toplamTl).toBeCloseTo(a.kumeler.reduce((s, k) => s + k.tl, 0), 2);
      for (const k of a.kumeler) expect(k.tl).toBeCloseTo(k.kalemler.reduce((s, x) => s + x.tl, 0), 2);
    }
  });
});

describe("personel kümesi", () => {
  it("8 kalem; Eyl: hoşgeldin = 5 yeni × 5.950 = 29.750; araç = 95.000", () => {
    const p = kume("2026-09", "personel")!;
    expect(p.kalemler).toHaveLength(8);
    expect(kalem("2026-09", "personel", "Hoşgeldin paketi (yeni işe alım)")).toBe(5 * 5950);
  });
  it("CPO araç: kısa etiket 'CPO araç'; model detayı (i)'de; Eyl 95.000; 2028 segment 160.000", () => {
    const arac0 = kume("2026-09", "personel")!.kalemler.find((x) => x.ad === "CPO araç")!;
    expect(arac0.tl).toBe(95000);
    expect(arac0.ad).toBe("CPO araç");                 // her yerde sadece "CPO araç" yazar
    expect(arac0.detay).toContain("2025+ model:");      // tam model (i) detayında
    expect(arac0.detay).toContain("Mercedes C (W206)");
    const arac28 = kume("2028-02", "personel")!.kalemler.find((x) => x.ad === "CPO araç")!;
    expect(arac28.tl).toBe(160000);
    expect(arac28.detay).toContain("BMW");
  });
  it("ikramiye TARİHE BAĞLI: Eyl 0, Ara 2026 prim (yılsonu+yılbaşı), Mar/May bayram", () => {
    const ik = (ym: string) => kume(ym, "personel")!.kalemler.find((x) => x.ad.startsWith("İkramiye"))!;
    expect(ik("2026-09").tl).toBe(0);
    expect(ik("2026-12").tl).toBeGreaterThan(0);
    expect(ik("2026-12").ad).toContain("Yılsonu");
    expect(ik("2026-12").ad).toContain("Yılbaşı");
    expect(ik("2027-03").ad).toContain("Ramazan");
    expect(ik("2027-05").ad).toContain("Kurban");
  });
});

describe("OFİS & OPEX = ym-bazlı mutlak (ölçekleme YOK)", () => {
  it("ofis: Eyl = kira 150.000 + depozito 300.000 (2 ay) = 450.000; sonraki ay sadece kira", () => {
    expect(kume("2026-09", "ofis")!.tl).toBe(150000 + 300000);
    expect(kume("2026-09", "ofis")!.kalemler.find((x) => x.ad.includes("Depozito"))!.ad).toContain("2 ay");
    expect(kume("2026-10", "ofis")!.tl).toBe(150000);
  });
  it("Eyl sürekli giderler = 28.131 (8 kalem; gerçekçi, headcount-ölçekli DEĞİL)", () => {
    const s = kume("2026-09", "surekli")!;
    expect(s.kalemler).toHaveLength(8);
    expect(s.tl).toBe(28131);
    expect(kalem("2026-09", "surekli", "Mutfak")).toBe(5000);
    expect(kalem("2026-09", "surekli", "İnternet")).toBe(3000);
    expect(kalem("2026-09", "surekli", "Doğalgaz")).toBe(0); // Eylül ısıtma sezonu değil
  });
  it("Eyl yazılım: dijital altyapı = 41.500 (264.630 DEĞİL); AI araç = 76.989; toplam 118.489", () => {
    expect(kalem("2026-09", "yazilim", "Dijital altyapı (AWS/CDN/API)")).toBe(41500);
    expect(kalem("2026-09", "yazilim", "AI & yazılım araçları (lisans)")).toBe(76989);
    expect(kume("2026-09", "yazilim")!.tl).toBe(118489);
  });
  it("pazarlama (güncel plan): Eyl = 207.000; Eki = 343.000; Ara = 658.000", () => {
    expect(kume("2026-09", "pazarlama")!.tl).toBe(207000);
    expect(kume("2026-10", "pazarlama")!.tl).toBe(343000);
    expect(kume("2026-12", "pazarlama")!.tl).toBe(658000);
  });
  it("profesyonel Eyl = muhasebe 20.000 + İSG 8.000 + güvenlik 4.000 = 32.000", () => {
    expect(kume("2026-09", "profesyonel")!.tl).toBe(32000);
  });
  it("Eyl toplam ≈ 960.370 (gerçekçi; canlı v12'deki 1.494.318 değil)", () => {
    expect(ay("2026-09").toplamTl).toBeCloseTo(124750 + 450000 + 28131 + 118489 + 32000 + 207000, 0);
  });
});

describe("CAPEX & operasyonel aylar", () => {
  it("CAPEX yalnız Ağustos (H.capex); operasyonel aylarda CAPEX kümesi yok", () => {
    expect(H.capex.toplamTl).toBe(3134200);
    expect(H.aylar.some((a) => a.kumeler.some((k) => k.key === "capex"))).toBe(false);
    expect(H.aylar.some((a) => a.ym === "2026-08")).toBe(false);
  });
});

describe("store v6", () => {
  it("JSON gidiş-dönüş + şema 6.0.0", () => {
    const back = fromJSON(toJSON(DEFAULT_DATA));
    expect(back.roles).toHaveLength(256);
    expect(back.params.usd).toBe(46.52);
    expect(Array.isArray(back.opex)).toBe(true);
    expect(back.opex).toHaveLength(24);
    expect(isValid(DEFAULT_DATA)).toBe(true);
    expect(() => fromJSON("{bozuk")).toThrow();
  });
  it("load default + schemaVersion 6.1.2", () => {
    expect(load().meta.schemaVersion).toBe("6.1.2");
  });
});
