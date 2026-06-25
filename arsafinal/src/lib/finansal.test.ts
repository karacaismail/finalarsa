import { describe, it, expect } from "vitest";
import {
  DEFAULT_DATA, DEFAULT_MONTH_COUNT, seedDefault, dagitOpex, ymList, ayLabel, CATEGORIES,
} from "../data/finansal";
import {
  ayToplam, kategoriAltToplam, genelToplam, aylikSeri, kumulatifSeri, trToDisp, dispToTr, rate,
} from "./calc";
import { toJSON, fromJSON, isValid, load } from "./store";

const RATES = { TRY: 1, USD: 45.2, EUR: 49.0 };

describe("seed / takvim", () => {
  it("24 ay üretir, ilk ve son ay doğru", () => {
    const m = seedDefault();
    expect(m).toHaveLength(DEFAULT_MONTH_COUNT);
    expect(m[0].ym).toBe("2026-07");
    expect(m[23].ym).toBe("2028-06");
  });

  it("ymList ardışık aylar üretir (yıl atlaması dahil)", () => {
    const ys = ymList(24);
    expect(ys[0]).toBe("2026-07");
    expect(ys[5]).toBe("2026-12");
    expect(ys[6]).toBe("2027-01");
    expect(ys[23]).toBe("2028-06");
  });

  it("ayLabel Türkçe ay adı verir", () => {
    expect(ayLabel("2026-07")).toBe("Tem 2026");
    expect(ayLabel("2028-06")).toBe("Haz 2028");
  });

  it("7 kategori tanımlı", () => {
    expect(CATEGORIES).toHaveLength(7);
    expect(CATEGORIES.map((c) => c.key)).toContain("personel");
    expect(CATEGORIES.map((c) => c.key)).toContain("capex");
  });
});

describe("dagitOpex — toplam korunur", () => {
  it("5 alt kalem toplamı, girilen OPEX'e birebir eşit (yuvarlama kaybı yok)", () => {
    for (const o of [1727733, 5401875, 7698580, 1, 999999, 30370413]) {
      const d = dagitOpex(o);
      const sum = d.personel + d.saha + d.dijital + d.ofis + d.yazilim;
      expect(sum).toBe(Math.round(o));
    }
  });
  it("hiçbir alt kalem negatif değil (pozitif girdide)", () => {
    const d = dagitOpex(5401875);
    Object.values(d).forEach((x) => expect(x).toBeGreaterThanOrEqual(0));
  });
});

describe("ay toplamı kaynak modelle tutar", () => {
  it("ilk ay (Tem 2026) toplamı = 4.811.346 TL", () => {
    const m = seedDefault();
    expect(ayToplam(m[0])).toBe(1727733 + 128205 + 2955408);
    expect(ayToplam(m[0])).toBe(4811346);
  });
  it("ilk ay pazarlama ve capex birebir kaynaktan", () => {
    const m = seedDefault();
    expect(m[0].values.pazarlama).toBe(128205);
    expect(m[0].values.capex).toBe(2955408);
  });
});

describe("toplam kimlikleri", () => {
  const months = seedDefault();
  it("genelToplam = aylık toplamların toplamı", () => {
    const a = genelToplam(months);
    const b = aylikSeri(months).reduce((s, x) => s + x.toplam, 0);
    expect(a).toBe(b);
  });
  it("genelToplam = kategori alt toplamlarının toplamı", () => {
    const alt = kategoriAltToplam(months);
    const sumAlt = Object.values(alt).reduce((s, x) => s + x, 0);
    expect(sumAlt).toBe(genelToplam(months));
  });
  it("kümülatif serinin son değeri = genelToplam", () => {
    const k = kumulatifSeri(months);
    expect(k[k.length - 1].toplam).toBe(genelToplam(months));
  });
  it("aylık seri 24 uzunlukta", () => {
    expect(aylikSeri(months)).toHaveLength(24);
  });
});

describe("para birimi çevirme", () => {
  it("rate doğru birim verir", () => {
    expect(rate(RATES, "TRY")).toBe(1);
    expect(rate(RATES, "USD")).toBe(45.2);
  });
  it("TL → USD → TL gidiş-dönüş aynı", () => {
    const tl = 4811346;
    const usd = trToDisp(tl, "USD", RATES);
    expect(dispToTr(usd, "USD", RATES)).toBeCloseTo(tl, 6);
  });
  it("4.811.346 TL = 106.445,71 USD civarı", () => {
    expect(trToDisp(4811346, "USD", RATES)).toBeCloseTo(4811346 / 45.2, 6);
  });
});

describe("store — JSON / şema", () => {
  it("toJSON → fromJSON gidiş-dönüş veriyi korur", () => {
    const json = toJSON(DEFAULT_DATA);
    const back = fromJSON(json);
    expect(back.months).toHaveLength(24);
    expect(back.months[0].values.capex).toBe(2955408);
    expect(back.categories).toHaveLength(7);
  });
  it("bozuk JSON hata fırlatır", () => {
    expect(() => fromJSON("{bozuk")).toThrow();
  });
  it("uyumsuz şema (months yok) reddedilir", () => {
    expect(() => fromJSON(JSON.stringify({ meta: { rates: {} } }))).toThrow();
    expect(isValid({ foo: 1 })).toBe(false);
    expect(isValid(DEFAULT_DATA)).toBe(true);
  });
  it("localStorage yokken load default 24 ay döner", () => {
    const d = load();
    expect(d.months).toHaveLength(24);
    expect(d.meta.schemaVersion).toBe("2.0.0");
  });
});
