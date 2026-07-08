import { describe, it, expect } from "vitest";
import { parseSubdetailsCsv, findSubdetails, subKey } from "./subdetails";

// alt_detay sekmesi (GENİŞ düzen): satır = alt-kalem, sütun = ay (ISO ym başlıklar)
const CSV = [
  'küme,kalem,alt_detay,not,2026-08,2026-09,2026-10',
  'yazilim,Dijital altyapı (AWS/CDN/API),AWS Hosting,DİJİTAL ALTYAPI,,"17.000","21.000"',
  'yazilim,Dijital altyapı (AWS/CDN/API),CDN (CloudFront),DİJİTAL ALTYAPI,,"7.000","8.000"',
  'surekli,Genel tüketim & ikram,Çay & Kahve & İçecek,DİĞER,,"1.016","1.024"',
  'capex,Ofis kurulumu,Ofis Depozito (3 Ay Kira),OFİS KURULUMU,"300.000",,',
  'capex,Ofis kurulumu,Mobilya & Dekorasyon,OFİS KURULUMU,"250.000",,',
].join("\n");

const map = parseSubdetailsCsv(CSV);

describe("parseSubdetailsCsv — geniş düzen", () => {
  it("ym|küme|kalem anahtarıyla gruplar", () => {
    const rows = map.get(subKey("2026-09", "yazilim", "Dijital altyapı (AWS/CDN/API)"))!;
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ ad: "AWS Hosting", tl: 17000 });
    expect(rows[1]).toMatchObject({ ad: "CDN (CloudFront)", tl: 7000 });
  });
  it("not alanını taşır", () => {
    const rows = map.get(subKey("2026-09", "surekli", "Genel tüketim & ikram"))!;
    expect(rows[0].not).toBe("DİĞER");
  });
  it("capex satırları yalnız 2026-08 kolonunda", () => {
    const agu = map.get(subKey("2026-08", "capex", "Ofis kurulumu"))!;
    expect(agu.map((r) => r.tl)).toEqual([300000, 250000]);
    expect(map.get(subKey("2026-09", "capex", "Ofis kurulumu"))).toBeUndefined();
  });
  it("boş/0 hücre satır üretmez", () => {
    expect(map.get(subKey("2026-08", "yazilim", "Dijital altyapı (AWS/CDN/API)"))).toBeUndefined();
  });
  it("alt-toplam = kalem bütünlüğü (aynı kaynaktan)", () => {
    const rows = map.get(subKey("2026-10", "yazilim", "Dijital altyapı (AWS/CDN/API)"))!;
    expect(rows.reduce((s, r) => s + r.tl, 0)).toBe(29000);
  });
});

describe("findSubdetails — toleranslı kalem eşleşmesi", () => {
  it("birebir eşleşme", () => {
    expect(findSubdetails(map, "2026-09", "yazilim", "Dijital altyapı (AWS/CDN/API)")).toHaveLength(2);
  });
  it("substring (TR-lower) eşleşme: uygulama adı sheet adından farklıysa", () => {
    expect(findSubdetails(map, "2026-09", "yazilim", "Dijital altyapı")).toHaveLength(2);
    expect(findSubdetails(map, "2026-09", "surekli", "GENEL TÜKETİM & İKRAM")).toHaveLength(1);
  });
  it("eşleşme yoksa null", () => {
    expect(findSubdetails(map, "2026-09", "yazilim", "Bilinmeyen Kalem")).toBeNull();
    expect(findSubdetails(map, "2031-01", "yazilim", "Dijital altyapı")).toBeNull();
  });
});
