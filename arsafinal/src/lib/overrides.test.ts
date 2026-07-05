import { describe, it, expect } from "vitest";
import { DEFAULT_DATA } from "../data/finansal";
import { hesapla } from "./clusters";
import type { Hesap } from "./clusters";
import { parseOverridesCsv, applyOverrides, normYm, parseNum } from "./overrides";

const H = hesapla(DEFAULT_DATA);
const kume = (h: Hesap, ym: string, key: string) => h.aylar.find((a) => a.ym === ym)!.kumeler.find((k) => k.key === key);
const ay = (h: Hesap, ym: string) => h.aylar.find((a) => a.ym === ym)!;

describe("normYm / parseNum", () => {
  it("normYm: '2026-09' ve 'Eyl 2026' aynı ym'e döner", () => {
    expect(normYm("2026-09")).toBe("2026-09");
    expect(normYm("Eyl 2026")).toBe("2026-09");
    expect(normYm("Ağu 2026")).toBe("2026-08");
    expect(normYm("saçma")).toBeNull();
  });
  it("parseNum: Türkçe biçim (nokta binlik, virgül ondalık)", () => {
    expect(parseNum("5000")).toBe(5000);
    expect(parseNum("5.000")).toBe(5000);
    expect(parseNum("1.782.761")).toBe(1782761);
    expect(parseNum("5000,50")).toBe(5000.5);
    expect(parseNum("")).toBeNull();
  });
});

describe("parseOverridesCsv", () => {
  it("başlık atlanır; geçerli satırlar okunur, bozuk satır elenir", () => {
    const csv = "ay,küme,kalem,değer\n2026-09,ofis,Ofis kirası,200000\nEyl 2026,surekli,,10.000\nbozuk,,,";
    const ov = parseOverridesCsv(csv);
    expect(ov).toHaveLength(2);
    expect(ov[0]).toEqual({ ym: "2026-09", kume: "ofis", kalem: "Ofis kirası", tl: 200000 });
    expect(ov[1]).toEqual({ ym: "2026-09", kume: "surekli", kalem: undefined, tl: 10000 });
  });
});

describe("applyOverrides — hibrit (motor + ay override)", () => {
  it("kalem override: Eyl ofis kirası → 200.000; küme ve ay toplamı yeniden hesaplanır", () => {
    const ofis0 = kume(H, "2026-09", "ofis")!.tl;
    const top0 = ay(H, "2026-09").toplamTl;
    const H2 = applyOverrides(H, [{ ym: "2026-09", kume: "ofis", kalem: "Ofis kirası", tl: 200000 }]);
    expect(kume(H2, "2026-09", "ofis")!.tl).toBe(200000);
    expect(ay(H2, "2026-09").toplamTl).toBe(top0 - ofis0 + 200000);
    expect(ay(H, "2026-09").toplamTl).toBe(top0); // orijinal değişmez (saf fonksiyon)
  });
  it("küme geneli override: Eyl sürekli giderler → tek kalem 10.000", () => {
    const H2 = applyOverrides(H, [{ ym: "2026-09", kume: "surekli", tl: 10000 }]);
    const s = kume(H2, "2026-09", "surekli")!;
    expect(s.tl).toBe(10000);
    expect(s.kalemler).toHaveLength(1);
  });
  it("boş override listesi → aynı Hesap (değişiklik yok)", () => {
    expect(applyOverrides(H, [])).toBe(H);
  });
  it("bilinmeyen küme → güvenli şekilde yok sayılır", () => {
    const H2 = applyOverrides(H, [{ ym: "2026-09", kume: "yokboyle", tl: 999 }]);
    expect(ay(H2, "2026-09").toplamTl).toBe(ay(H, "2026-09").toplamTl);
  });
});
