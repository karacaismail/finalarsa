// localStorage kalıcılık + JSON içe/dışa aktarma + şema doğrulama (v3).
import { DEFAULT_DATA, SCHEMA_VERSION } from "../data/finansal";
import type { FinansalData } from "../data/finansal";

export const LS_KEY = "arsafinal:v3";

export function isValid(d: unknown): d is FinansalData {
  if (!d || typeof d !== "object") return false;
  const x = d as Partial<FinansalData>;
  if (!x.meta || !x.meta.rates) return false;
  if (!x.costParams || typeof x.costParams.isverenSgkCarpan !== "number") return false;
  if (!Array.isArray(x.roles) || x.roles.length === 0) return false;
  if (!Array.isArray(x.months) || x.months.length === 0) return false;
  if (typeof x.roles[0]?.brutMaas !== "number" || typeof x.roles[0]?.istihdamYm !== "string") return false;
  return x.months.every((m) => typeof m?.ym === "string" && m.values && typeof m.values.capex === "number");
}

export function toJSON(data: FinansalData): string { return JSON.stringify(data, null, 2); }
export function fromJSON(text: string): FinansalData {
  const parsed = JSON.parse(text);
  if (!isValid(parsed)) throw new Error("Şema uyumsuz");
  return parsed;
}

export function save(data: FinansalData): void {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* yok say */ }
}
export function load(): FinansalData {
  try {
    if (typeof localStorage === "undefined") return structuredClone(DEFAULT_DATA);
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw);
    if (isValid(parsed) && parsed.meta.schemaVersion === SCHEMA_VERSION) return parsed;
    return structuredClone(DEFAULT_DATA);
  } catch { return structuredClone(DEFAULT_DATA); }
}
export function clearStorage(): void {
  try { if (typeof localStorage !== "undefined") localStorage.removeItem(LS_KEY); } catch { /* yok say */ }
}
