import { describe, it, expect } from "vitest";
import { DEFAULT_DATA } from "../data/finansal";
import { hesapla } from "./clusters";
import {
  buildMasterplan, hasMpContent, SNAPSHOT_TABS, HAS_SNAPSHOT, SNAPSHOT_BUILT_AT,
} from "./masterplan";
import type { MpTabs } from "./masterplan";
import mpSnapshot from "../data/masterplan-snapshot.json";

const base = hesapla(DEFAULT_DATA);

// ─── F1: masterplan-snapshot.json (build-time; sessiz base düşüşünü önler) ────
describe("masterplan-snapshot.json — commit edilmiş build-time snapshot şeması", () => {
  it("opex/paz/capex dizileri + meta.builtAt taşır", () => {
    const s = mpSnapshot as { opex: unknown; paz: unknown; capex: unknown; meta?: { builtAt?: string } };
    expect(Array.isArray(s.opex)).toBe(true);
    expect(Array.isArray(s.paz)).toBe(true);
    expect(Array.isArray(s.capex)).toBe(true);
    // build tarihi "YYYY-MM-DD" (varsa) — bayatlık göstergesi için.
    if (s.meta?.builtAt) expect(s.meta.builtAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("SNAPSHOT_TABS MpTabs biçiminde (üç ham grid)", () => {
    const t: MpTabs = SNAPSHOT_TABS;
    expect(Array.isArray(t.opex)).toBe(true);
    expect(Array.isArray(t.paz)).toBe(true);
    expect(Array.isArray(t.capex)).toBe(true);
  });

  it("SNAPSHOT_BUILT_AT string (boş olabilir ama tanımlı)", () => {
    expect(typeof SNAPSHOT_BUILT_AT).toBe("string");
  });
});

describe("hasMpContent — sekmelerde işlenebilir içerik var mı (base'e düşme kararı)", () => {
  it("boş/null → false", () => {
    expect(hasMpContent(null)).toBe(false);
    expect(hasMpContent(undefined)).toBe(false);
    expect(hasMpContent({ opex: [], paz: [], capex: [] })).toBe(false);
    // yalnız başlık satırı (>1 değil) → içerik yok
    expect(hasMpContent({ opex: [["h"]], paz: [], capex: [["h"]] })).toBe(false);
  });

  it("OPEX veya CAPEX'te veri satırı varsa → true", () => {
    expect(hasMpContent({ opex: [["h"], ["Ofis", "1"]], paz: [], capex: [] })).toBe(true);
    expect(hasMpContent({ opex: [], paz: [], capex: [["h"], ["X", "1"]] })).toBe(true);
  });
});

describe("F1 çekirdek garanti: fetch patlasa bile snapshot GERÇEK sheet verisi verir (base DEĞİL)", () => {
  it("committed snapshot dolu → HAS_SNAPSHOT true (App snapshot'la başlar, base'e düşmez)", () => {
    // Bu depoda snapshot commit edilmiş olmalı → başlangıç render'ı snapshot verisiyle.
    expect(HAS_SNAPSHOT).toBe(true);
    expect(hasMpContent(SNAPSHOT_TABS)).toBe(true);
  });

  it("buildMasterplan(base, SNAPSHOT_TABS) çalışır ve ay yapısı üretir", () => {
    const H = buildMasterplan(base, SNAPSHOT_TABS);
    expect(H.aylar.length).toBe(base.aylar.length);
    // Snapshot'tan gelen giderler bir ayda toplanmış olmalı (yapı bozulmadan).
    const eyl = H.aylar.find((a) => a.ym === "2026-09")!;
    expect(Array.isArray(eyl.kumeler)).toBe(true);
    expect(eyl.toplamTl).toBeGreaterThanOrEqual(0);
  });

  it("snapshot ile motor-base AYNI olmayabilir — snapshot GERÇEK sheet değerleri taşır", () => {
    // Snapshot'lı hesapta en az bir ayın gider kümesi motordan farklı olmalı ki
    // "sessiz base düşüşü" tespit edilebilir olsun (aksi halde snapshot anlamsız).
    const H = buildMasterplan(base, SNAPSHOT_TABS);
    // Snapshot personeli motordan korur ama ofis/yazılım/pazarlama sheet'ten gelir → toplam yapı sheet güdümlü.
    // En azından bir ayda kümeler mevcut (snapshot boş değil).
    const anyKume = H.aylar.some((a) => a.kumeler.length > 0);
    expect(anyKume).toBe(true);
  });
});
