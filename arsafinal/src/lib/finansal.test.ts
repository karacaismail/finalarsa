import { describe, it, expect } from "vitest";
import { DEFAULT_DATA, MANUAL_CATEGORIES, ymList, ayLabel, seedManual } from "../data/finansal";
import { ROLES } from "../data/roles";
import {
  roleMonthlyCost, aktif, aktifSayi, personelAy, ayToplamTL, manuelToplam,
  kategoriAltToplam, genelToplam, aylikSeri, kumulatifSeri, headcountSeri, trToDisp, dispToTr,
} from "./calc";
import { toJSON, fromJSON, isValid, load } from "./store";

const P = DEFAULT_DATA.costParams;
const D = { roles: DEFAULT_DATA.roles, costParams: P, months: DEFAULT_DATA.months };

describe("roller (İK PLANI)", () => {
  it("256 rol, ilk R-CPO, son R-FE-9", () => {
    expect(ROLES).toHaveLength(256);
    expect(ROLES[0].kod).toBe("R-CPO");
    expect(ROLES[255].kod).toBe("R-FE-9");
  });
  it("istihdam ay formatı ve brüt sayı", () => {
    expect(ROLES[0].istihdamYm).toBe("2026-08");
    expect(ROLES[0].brutMaas).toBe(339191);
  });
});

describe("takvim (Eyl 2026 → Ağu 2028, 24 ay)", () => {
  it("ymList ilk/son", () => {
    const y = ymList(24);
    expect(y[0]).toBe("2026-09");
    expect(y[23]).toBe("2028-08");
  });
  it("ayLabel", () => {
    expect(ayLabel("2026-09")).toBe("Eyl 2026");
    expect(ayLabel("2028-08")).toBe("Ağu 2028");
  });
  it("seedManual 24 ay, 6 kalem; ilk ay pazarlama = kaynak(Eyl2026)", () => {
    const m = seedManual();
    expect(m).toHaveLength(24);
    expect(MANUAL_CATEGORIES).toHaveLength(6);
    expect(m[0].ym).toBe("2026-09");
    expect(m[0].values.pazarlama).toBe(158974); // SOURCE_18[2]
  });
});

describe("aktiflik (işe alım ≤ ay)", () => {
  it("2026-08 işe alınan, 2026-09'da aktif, 2026-07'de değil", () => {
    const r = ROLES[0]; // 2026-08
    expect(aktif(r, "2026-09")).toBe(true);
    expect(aktif(r, "2026-08")).toBe(true);
    expect(aktif(r, "2026-07")).toBe(false);
  });
  it("ilk ay (Eyl 2026) aktif rol sayısı = 12", () => {
    expect(aktifSayi(ROLES, "2026-09")).toBe(12);
  });
  it("son ay (Ağu 2028) aktif rol sayısı = 106", () => {
    expect(aktifSayi(ROLES, "2028-08")).toBe(106);
  });
});

describe("maliyet modeli (zincir)", () => {
  it("roleMonthlyCost formülü: brüt×SGK×(1+ikr/12)+yemek+yanHak", () => {
    const r = ROLES[0];
    const beklenen = r.brutMaas * P.isverenSgkCarpan * (1 + P.ikramiyeMaasYil / 12) + P.yemekAylik + P.yanHaklarAylik;
    expect(roleMonthlyCost(r, P)).toBeCloseTo(beklenen, 6);
  });
  it("personelAy = o ay aktif rollerin yüklü maliyet toplamı", () => {
    const ym = "2026-09";
    const elle = ROLES.filter((r) => aktif(r, ym)).reduce((s, r) => s + roleMonthlyCost(r, P), 0);
    expect(personelAy(ROLES, P, ym)).toBeCloseTo(elle, 4);
  });
  it("SGK çarpanı artınca personel gideri artar", () => {
    const ym = "2027-01";
    const az = personelAy(ROLES, { ...P, isverenSgkCarpan: 1.0 }, ym);
    const cok = personelAy(ROLES, { ...P, isverenSgkCarpan: 1.5 }, ym);
    expect(cok).toBeGreaterThan(az);
  });
});

describe("toplam kimlikleri (zincirli)", () => {
  it("ayToplam = personel + manuel", () => {
    const m = D.months[0];
    expect(ayToplamTL(D, m)).toBeCloseTo(personelAy(D.roles, P, m.ym) + manuelToplam(m), 4);
  });
  it("genelToplam = aylık serinin toplamı", () => {
    const a = genelToplam(D);
    const b = aylikSeri(D).reduce((s, x) => s + x.toplam, 0);
    expect(a).toBeCloseTo(b, 2);
  });
  it("genelToplam = kategori alt toplamlarının toplamı", () => {
    const alt = kategoriAltToplam(D);
    const sum = Object.values(alt).reduce((s, x) => s + x, 0);
    expect(sum).toBeCloseTo(genelToplam(D), 2);
  });
  it("kümülatif son = genelToplam; headcount son = 106", () => {
    const k = kumulatifSeri(D);
    expect(k[k.length - 1].toplam).toBeCloseTo(genelToplam(D), 2);
    const h = headcountSeri(D);
    expect(h[h.length - 1].sayi).toBe(106);
  });
});

describe("para birimi", () => {
  it("TL→USD→TL gidiş-dönüş", () => {
    const tl = 1417768;
    const usd = trToDisp(tl, "USD", DEFAULT_DATA.meta.rates);
    expect(dispToTr(usd, "USD", DEFAULT_DATA.meta.rates)).toBeCloseTo(tl, 4);
  });
});

describe("store — JSON / şema (v3)", () => {
  it("toJSON→fromJSON roller+aylar korunur", () => {
    const back = fromJSON(toJSON(DEFAULT_DATA));
    expect(back.roles).toHaveLength(256);
    expect(back.months).toHaveLength(24);
    expect(back.costParams.ikramiyeMaasYil).toBe(1);
  });
  it("bozuk JSON ve eksik şema reddedilir", () => {
    expect(() => fromJSON("{bozuk")).toThrow();
    expect(isValid({ meta: { rates: {} } })).toBe(false);
    expect(isValid(DEFAULT_DATA)).toBe(true);
  });
  it("localStorage yokken load default döner (256 rol, 24 ay)", () => {
    const d = load();
    expect(d.roles).toHaveLength(256);
    expect(d.months).toHaveLength(24);
    expect(d.meta.schemaVersion).toBe("3.0.0");
  });
});
