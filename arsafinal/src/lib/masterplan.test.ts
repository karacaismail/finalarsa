import { describe, it, expect } from "vitest";
import { DEFAULT_DATA } from "../data/finansal";
import { hesapla } from "./clusters";
import type { Hesap } from "./clusters";
import { buildMasterplan, parseCsv, mpNum } from "./masterplan";

const base = hesapla(DEFAULT_DATA);
const ay = (h: Hesap, ym: string) => h.aylar.find((a) => a.ym === ym)!;
const kume = (h: Hesap, ym: string, key: string) => ay(h, ym).kumeler.find((k) => k.key === key);

const opex = [
  ["ARSAM.NET — OPEX", "Tem 26 ", "Agu 26 ", "Eyl 26 ", "Eki 26 "],
  ["Ofis Kirası", "150.000", "151.950", "153.925", "155.926"],
  ["Elektrik & Su", "5.000", "5.065", "5.131", "5.198"],
  ["İnternet & Telefon", "3.000", "3.000", "3.000", "3.000"],
  ["Temizlik (Aylık Genel)", "5.000", "5.000", "5.000", "5.000"],
  ["Güvenlik & Sigorta", "4.000", "4.000", "4.000", "4.000"],
  ["DİJİTAL ALTYAPI", "", "", "", ""],
  ["AWS Hosting", "12.000", "14.000", "17.000", "21.000"],
  ["CDN (CloudFront)", "5.000", "6.000", "7.000", "8.000"],
  ["Email Service", "2.000", "2.500", "3.000", "3.500"],
  ["Google Maps API", "5.000", "6.000", "7.500", "9.000"],
  ["SMS Provider", "5.000", "6.000", "7.000", "8.000"],
  ["  LLM Kişisel (Claude/GPT)", "39.916", "53.574", "64.052", "94.998"],
  ["  Code AI (GitHub Copilot)", "0", "854", "1.725", "1.742"],
  ["  Tasarım Bireysel (Canva)", "1.246", "2.202", "2.224", "2.843"],
  ["  Platform Paylaşımlı", "3.293", "8.899", "8.988", "26.913"],
];
const paz = [
  ["Kanal", "Tem 26 ", "Agu 26 ", "Eyl 26 ", "Eki 26 "],
  ["Google Ads", "0", "0", "40.000", "60.000"],
  ["TOPLAM DİJİTAL PAZARLAMA", "88.000", "98.000", "207.000", "343.000"],
];
const capex = [
  ["Kalem", "Tutar (₺)", "Dönem"],
  ["Ofis Depozito", "450.000", "Tem 26"],
  ["Mobilya & Dekorasyon", "300.000", "Tem 26"],
];
const H = buildMasterplan(base, { opex, paz, capex });

describe("mpNum / parseCsv", () => {
  it("TR sayı biçimi", () => { expect(mpNum("153.925")).toBe(153925); expect(mpNum("1.782.761")).toBe(1782761); expect(mpNum("")).toBe(0); });
  it("csv tırnaklı alan", () => { expect(parseCsv('a,b\n"x,y",z')).toEqual([["a", "b"], ["x,y", "z"]]); });
});

describe("buildMasterplan — Eyl 2026 master_plan'dan (Agu/Sub diakritik toleransı dahil)", () => {
  it("ofis = 153.925", () => expect(kume(H, "2026-09", "ofis")!.tl).toBe(153925));
  it("sürekli = 5.131 + 3.000 + 5.000 = 13.131", () => expect(kume(H, "2026-09", "surekli")!.tl).toBe(13131));
  it("yazılım · dijital altyapı = 41.500", () => expect(kume(H, "2026-09", "yazilim")!.kalemler[0].tl).toBe(41500));
  it("yazılım · AI araçları = 76.989 (çift saymadan)", () => expect(kume(H, "2026-09", "yazilim")!.kalemler[1].tl).toBe(76989));
  it("pazarlama = 207.000 (TOPLAM satırı)", () => expect(kume(H, "2026-09", "pazarlama")!.tl).toBe(207000));
  it("profesyonel · güvenlik = 4.000", () => expect(kume(H, "2026-09", "profesyonel")!.tl).toBe(4000));
  it("personel motordan korunur (> 0)", () => expect(kume(H, "2026-09", "personel")!.tl).toBeGreaterThan(0));
  it("CAPEX master_plan'dan = 450.000 + 300.000 = 750.000", () => expect(H.capex.toplamTl).toBe(750000));
  it("ay toplamı = kümelerin toplamı", () => {
    const a = ay(H, "2026-09");
    expect(a.toplamTl).toBeCloseTo(a.kumeler.reduce((s, k) => s + k.tl, 0), 2);
  });
});


describe("buildMasterplan — CAPEX çift-sayım koruması (TOPLAM/ara-toplam/birim elenir)", () => {
  const capexTotals = [
    ["Kalem", "Tutar (₺)", "Dönem"],
    ["OFİS KURULUMU", "", ""],
    ["Ofis Depozito (3 Ay Kira)", "375.000", "Tem 26"],
    ["Mobilya & Dekorasyon", "250.000", "Tem 26"],
    ["HOŞGELDİN PAKETİ", "", ""],
    ["  Hoşgeldin Paketi (18 kişi)", "107.100", "Tem 26"],
    ["  Birim: Headset+Defter+Kupa", "600", ""],
    ["  Adobe Creative Cloud", "8.000", "Yıllık"],
    ["  (Figma OPEX SaaS)", "0", "Yıllık"],
    ["Yıllık Yazılım Lisans Toplamı", "38.000", ""],
    ["TOPLAM İLK CAPEX (Tem 2026)", "740.100", ""],
  ];
  const DETAY = 375000 + 250000 + 107100 + 8000; // yalniz gercek kalemler = 740.100
  const H2 = buildMasterplan(base, { opex, paz, capex: capexTotals });

  it("toplam yalniz detaylari sayar (TOPLAM/ara-toplam/birim/paren haric)", () => {
    expect(H2.capex.toplamTl).toBe(DETAY);
  });

  it("bir kalem degisince toplam 1:1 degisir — 2x DEGIL (cift-sayim yok)", () => {
    const arti = capexTotals.map((r) => r.slice());
    arti.find((r) => r[0].includes("Mobilya"))![1] = "300.000";
    arti.find((r) => r[0].startsWith("TOPLAM İLK"))![1] = "790.100";
    const H3 = buildMasterplan(base, { opex, paz, capex: arti });
    expect(H3.capex.toplamTl - H2.capex.toplamTl).toBe(50000);
  });

  it("kalemler listesinde TOPLAM/ara-toplam/birim/paren satiri yok", () => {
    for (const k of H2.capex.kalemler) {
      const na = k.ad.toLocaleLowerCase("tr");
      expect(na.includes("toplam")).toBe(false);
      expect(na.startsWith("birim")).toBe(false);
      expect(k.ad.startsWith("(")).toBe(false);
    }
  });
});
