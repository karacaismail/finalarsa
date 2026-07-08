import { describe, it, expect } from "vitest";
import { DEFAULT_DATA } from "../data/finansal";
import { hesapla } from "./clusters";
import type { Hesap } from "./clusters";
import { buildMasterplanV3 } from "./masterplan3";

const base = hesapla(DEFAULT_DATA);
const ay = (h: Hesap, ym: string) => h.aylar.find((a) => a.ym === ym)!;
const kume = (h: Hesap, ym: string, key: string) => ay(h, ym).kumeler.find((k) => k.key === key);
const kalem = (h: Hesap, ym: string, key: string, ad: string) =>
  kume(h, ym, key)?.kalemler.find((x) => x.ad.toLocaleLowerCase("tr").includes(ad.toLocaleLowerCase("tr")));

// RAW export biçimi (başlık birleştirme yok): satır0 başlık, satır2 = 'Gider Kalemi' + ay kolonları
const opex = [
  ["ARSAM.NET — OPEX (78 Ay)", "", "", "", ""],
  ["", "", "", "", ""],
  ["Gider Kalemi", "Tem 26 ", "Agu 26 ", "Eyl 26 ", "Eki 26 "],
  ["İK PERSONEL GİDERLERİ", "", "", "", ""],
  ["Aylık Brüt Maaş Toplamı", "", "", "", ""],
  ["Ödül + Sosyal + Eğitim", "", "", "", ""],
  ["Mevcut Kadro Sayısı", "", "", "", ""],
  ["OFİS SABİT GİDERLER", "", "", "", ""],
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
  ["AI & YAZILIM ARAÇLARI (Detay)", "", "", "", ""],
  ["LLM Kişisel (Claude/GPT)", "39.916", "53.574", "64.052", "94.998"],
  ["Code AI (GitHub Copilot)", "0", "854", "1.725", "1.742"],
  ["Tasarım Bireysel (Canva/CapCut)", "1.246", "2.202", "2.224", "2.843"],
  ["Platform Paylaşımlı (Intercom/vb)", "3.293", "8.899", "8.988", "26.913"],
  ["AI & Yazılım TOPLAM", "44.455", "65.529", "76.989", "126.496"],
  ["PLATFORM AI & AGENT (API Maliyetleri)", "", "", "", ""],
  ["Anthropic API (Haiku/Sonnet/Opus)", "2.225", "2.247", "2.270", "2.293"],
  ["Diğer AI (Vision/Embedding/OCR/TTS)", "2.225", "2.247", "2.270", "2.293"],
  ["AGİLE / SAFe ARAÇLARI (Detay)", "", "", "", ""],
  ["Jira", "2.225", "2.247", "3.178", "3.210"],
  ["Confluence", "1.335", "1.348", "1.907", "1.926"],
  ["Miro", "1.602", "1.618", "1.634", "1.651"],
  ["Slack (tüm kadro)", "2.726", "2.753", "3.575", "3.611"],
  ["Figma (tasarım ekibi)", "667", "674", "681", "688"],
  ["Agile Araçları TOPLAM", "8.089", "8.640", "9.625", "9.721"],
  ["EKİPMAN SATIN ALMA (İK Planına Bağlı)", "", "", "", ""],
  ["Yeni İşe Alım Ekipmanı", "0", "0", "0", "48.000"],
  ["HUKUKİ & İDARİ", "", "", "", ""],
  ["Mali Müşavir", "8.000", "8.000", "8.000", "8.000"],
  ["Hukuk Danışmanı", "5.000", "5.000", "5.000", "5.000"],
  ["Sigorta (Genel)", "3.000", "3.000", "3.000", "3.000"],
  ["Muhasebe Yazılımı", "500", "500", "500", "500"],
  ["CPO ARAÇ GİDERLERİ", "", "", "", ""],
  ["CPO Araç (Taksit+KDV + Yakıt)", "116.000", "117.138", "118.075", "119.000"],
  ["DİĞER", "", "", "", ""],
  ["Çay & Kahve & İçecek", "0", "0", "1.016", "1.026"],
  ["Temizlik Malzemeleri", "0", "0", "1.016", "1.026"],
  ["Ofis Kırtasiye", "0", "0", "1.016", "1.026"],
  ["Yemek & İkram", "0", "0", "2.710", "2.737"],
  ["Ulaşım", "1.500", "1.512", "1.524", "1.539"],
  ["TOPLAM OPEX", "999", "999", "999", "999"],
];
const paz = [
  ["ARSAM.NET — PAZARLAMA", "", "", "", ""],
  ["", "", "", "", ""],
  ["Kanal / Kalem", "Tem 26 ", "Agu 26 ", "Eyl 26 ", "Eki 26 "],
  ["ÜCRETLİ REKLAM KANALLARI", "", "", "", ""],
  ["Google Ads (Arama + PMax)", "0", "0", "40.000", "60.000"],
  ["Meta Ads (Facebook + Instagram)", "0", "0", "25.000", "35.000"],
  ["YouTube Ads", "10.000", "15.000", "20.000", "25.000"],
  ["ORGANİK & İÇERİK", "", "", "", ""],
  ["SEO İçerik Üretimi & Ajans", "5.000", "5.000", "5.000", "10.000"],
  ["Emlak Ofisleri Ortaklık", "30.000", "40.000", "45.000", "50.000"],
  ["TOPLAM DİJİTAL PAZARLAMA", "45.000", "60.000", "135.000", "180.000"],
];
const capex = [
  ["ARSAM.NET — CAPEX", "", ""],
  ["", "", ""],
  ["Kalem", "Tutar (₺)", ""],
  ["OFİS KURULUMU", "", ""],
  ["Ofis Depozito (3 Ay Kira)", "300.000", ""],
  ["Mobilya & Dekorasyon", "250.000", ""],
  ["MUTFAK EKİPMANLARI", "", ""],
  ["Buzdolabı", "35.000", ""],
  ["Mutfak Dolap & Tezgah", "30.000", ""],
  ["HOŞGELDİN PAKETİ (detay: PARAMETRELER sayfası)", "", ""],
  ["Hoşgeldin Paketi (18 kişi × birim)", "107.100", ""],
  ["Birim: Headset+Defter+Kalem", "600", ""],
  ["YILLIK YAZILIM LİSANS BÜTÇESİ (Yıllık Yenileme)", "", ""],
  ["Adobe Creative Cloud (1 kullanıcı)", "8.000", ""],
  ["(Figma → OPEX aylık SaaS'e taşındı)", "0", ""],
  ["Notion Team", "9.600", ""],
  ["Yıllık Yazılım Lisans Toplamı", "17.600", ""],
  ["TOPLAM İLK CAPEX (Tem 2026)", "731.700", ""],
];

const H = buildMasterplanV3(base, { opex, paz, capex });

describe("buildMasterplanV3 — küme/kalem yapısı (Eyl 2026)", () => {
  it("ofis = 153.925", () => expect(kume(H, "2026-09", "ofis")!.tl).toBe(153925));
  it("sürekli: Ofis işletim = 13.131, Genel tüketim = 7.282", () => {
    expect(kalem(H, "2026-09", "surekli", "Ofis işletim")!.tl).toBe(13131);
    expect(kalem(H, "2026-09", "surekli", "Genel tüketim")!.tl).toBe(7282);
  });
  it("yazılım 4 kalem; TOPLAM satırları kalem değil", () => {
    const k = kume(H, "2026-09", "yazilim")!;
    expect(k.kalemler).toHaveLength(4);
    expect(kalem(H, "2026-09", "yazilim", "Dijital altyapı")!.tl).toBe(41500);
    expect(kalem(H, "2026-09", "yazilim", "AI & yazılım araçları")!.tl).toBe(76989);
    expect(kalem(H, "2026-09", "yazilim", "Platform AI")!.tl).toBe(4540);
    expect(kalem(H, "2026-09", "yazilim", "Agile")!.tl).toBe(10975); // yaprak toplamı; sheet'in 9.625 TOPLAM satırı DEĞİL
  });
  it("profesyonel: Hukuki & idari = 16.500 + Güvenlik = 4.000", () => {
    expect(kalem(H, "2026-09", "profesyonel", "Hukuki")!.tl).toBe(16500);
    expect(kalem(H, "2026-09", "profesyonel", "Güvenlik")!.tl).toBe(4000);
    expect(kume(H, "2026-09", "profesyonel")!.tl).toBe(20500);
  });
  it("pazarlama = kanal yapraklarının toplamı (TOPLAM satırı değil)", () => {
    expect(kume(H, "2026-09", "pazarlama")!.tl).toBe(135000);
  });
  it("personel: İK satırları boş → motor korunur", () => {
    expect(kume(H, "2026-09", "personel")!.tl).toBe(kume(base, "2026-09", "personel")!.tl);
  });
  it("ay toplamı = kümelerin toplamı", () => {
    const a = ay(H, "2026-09");
    expect(a.toplamTl).toBeCloseTo(a.kumeler.reduce((s, k) => s + k.tl, 0), 2);
  });
});

describe("buildMasterplanV3 — CAPEX bölüm → kalem", () => {
  it("kalemler = bölümler; toplam/birim/paren satırları elenir", () => {
    const adlar = H.capex.kalemler.map((k) => k.ad);
    expect(adlar).toEqual(["Ofis kurulumu", "Mutfak ekipmanları", "Hoşgeldin paketi", "Yıllık yazılım lisansları"]);
  });
  it("bölüm tutarları yaprak toplamı; çift sayım yok", () => {
    const m = Object.fromEntries(H.capex.kalemler.map((k) => [k.ad, k.tl]));
    expect(m["Ofis kurulumu"]).toBe(550000);
    expect(m["Mutfak ekipmanları"]).toBe(65000);
    expect(m["Hoşgeldin paketi"]).toBe(107100);      // 'Birim:' satırı hariç
    expect(m["Yıllık yazılım lisansları"]).toBe(17600); // '(Figma…' ve 'Toplamı' hariç
    expect(H.capex.toplamTl).toBe(739700);            // 731.700 'TOPLAM' satırı DEĞİL, yaprak toplamı
  });
});

describe("motor SGK kalemi alt kırılımı (v3 modal içeriği)", () => {
  it("işçi payı + işveren payı = SGK kalem tutarı", () => {
    const k = kume(base, "2026-10", "personel")!.kalemler.find((x) => x.ad.includes("SGK"))!;
    expect(k.alt).toHaveLength(2);
    expect(k.alt![0].tl + k.alt![1].tl).toBeCloseTo(k.tl, 6);
    expect(k.alt![0].tl).toBeGreaterThan(0);
  });
});

describe("buildMasterplanV3 — İK satırları doluysa personel sheet'ten (hibrit)", () => {
  const opex2 = opex.map((r) => [...r]);
  opex2[4] = ["Aylık Brüt Maaş Toplamı", "0", "0", "4.000.000", "4.200.000"];
  opex2[5] = ["Ödül + Sosyal + Eğitim", "0", "0", "300.000", "315.000"];
  const H2 = buildMasterplanV3(base, { opex: opex2, paz, capex });
  it("personel = İK satır toplamı; motor değeri detayda karşılaştırma için durur", () => {
    const k = kume(H2, "2026-09", "personel")!;
    expect(k.tl).toBe(4300000);
    expect(k.kalemler.map((x) => x.ad)).toEqual(["Aylık Brüt Maaş Toplamı", "Ödül + Sosyal + Eğitim"]);
  });
  it("İK boş ay (Eki 26 değil, Tem'e bakma) — dolu olmayan ay motora düşmez, ym bazında karar", () => {
    expect(kume(H2, "2026-10", "personel")!.tl).toBe(4515000);
  });
});
