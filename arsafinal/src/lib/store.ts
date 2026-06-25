// localStorage kalıcılık + JSON içe/dışa + şema doğrulama (v4).
import { DEFAULT_DATA, SCHEMA_VERSION } from "../data/finansal";
import type { FinansalData } from "../data/finansal";

export const LS_KEY = "arsafinal:v4";

export function isValid(d: unknown): d is FinansalData {
  if (!d || typeof d !== "object") return false;
  const x = d as Partial<FinansalData>;
  if (!x.meta || !x.params || typeof x.params.usd !== "number") return false;
  if (!x.bordro || !Array.isArray(x.bordro.dilimler)) return false;
  if (!Array.isArray(x.roles) || x.roles.length === 0) return false;
  if (!Array.isArray(x.capex) || !x.olgun || !x.utilSplit) return false;
  if (!Array.isArray(x.founder) || !Array.isArray(x.pazarlama)) return false;
  return typeof x.roles[0]?.brutMaas === "number";
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
