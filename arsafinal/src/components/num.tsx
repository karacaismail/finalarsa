// Stilli sayı render + tıkla-düzenle hücre + SVG ikonlar (emoji yasak).
import { useState } from "react";

// Sayıyı Türkçe gruplara ayır: en yüksek grup kalın, kalan normal, ondalık italik.
export function parts(n: number) {
  const neg = n < 0;
  const r = Math.round(Math.abs(n)); // tam sayıya yuvarla — küsürat (kuruş) gösterme
  const groups = r.toLocaleString("tr-TR").split(".");
  return {
    neg,
    head: groups[0],
    tail: groups.length > 1 ? "." + groups.slice(1).join(".") : "",
    dec: "",
  };
}

export function NumView({ n, sym }: { n: number; sym?: string }) {
  const p = parts(n);
  return (
    <span className="num">
      {p.neg ? "−" : ""}
      <b>{p.head}</b>
      <span className="mid">{p.tail}</span>
      <i className="dec">{p.dec}</i>
      {sym ? <span className="sym">{sym}</span> : null}
    </span>
  );
}

export const parseTR = (s: string): number | null => {
  const v = parseFloat(s.replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
  return isNaN(v) ? null : v;
};
export const grouped = (n: number) =>
  (Math.round(n * 100) / 100).toLocaleString("tr-TR", { maximumFractionDigits: 2 });

export const Icon = {
  lock: "M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16M96 56a32 32 0 0 1 64 0v24H96Zm112 152H48V96h160z",
  edit: "M227.31 73.37l-44.68-44.69a16 16 0 0 0-22.63 0L36.69 152A15.86 15.86 0 0 0 32 163.31V208a16 16 0 0 0 16 16h44.69a15.86 15.86 0 0 0 11.31-4.69L227.31 96a16 16 0 0 0 0-22.63M92.69 208H48v-44.69l88-88L180.69 120ZM192 108.69L147.31 64l24-24L216 84.69Z",
  down: "M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0m-101.66 5.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0-11.32-11.32L136 132.69V40a8 8 0 0 0-16 0v92.69l-26.34-26.35a8 8 0 0 0-11.32 11.32Z",
  up: "M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0M93.66 77.66L120 51.31V144a8 8 0 0 0 16 0V51.31l26.34 26.35a8 8 0 0 0 11.32-11.32l-40-40a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 11.32 11.32",
  prev: "M165.66 202.34a8 8 0 0 1-11.32 11.32l-80-80a8 8 0 0 1 0-11.32l80-80a8 8 0 0 1 11.32 11.32L91.31 128Z",
  next: "M181.66 133.66l-80 80a8 8 0 0 1-11.32-11.32L164.69 128 90.34 53.66a8 8 0 0 1 11.32-11.32l80 80a8 8 0 0 1 0 11.32Z",
};
export function Svg({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Tıkla-düzenle: okurken stilli sayı, tıklayınca ayraçlı metin kutusu (seçili para biriminde).
export function Cell({
  display, onCommit, sym, disabled,
}: { display: number; onCommit: (d: number) => void; sym?: string; disabled?: boolean }) {
  const [editing, setEditing] = useState(false);
  if (disabled) return <NumView n={display} sym={sym} />;
  if (editing)
    return (
      <input
        className="cell-in"
        type="text"
        inputMode="decimal"
        autoFocus
        defaultValue={grouped(display)}
        onFocus={(e) => e.target.select()}
        onBlur={(e) => { const v = parseTR(e.target.value); if (v !== null) onCommit(v); setEditing(false); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") setEditing(false);
        }}
      />
    );
  return (
    <button type="button" className="cell-btn" onClick={() => setEditing(true)} title="Düzenlemek için tıkla">
      <NumView n={display} sym={sym} />
      <span className="pen"><Svg d={Icon.edit} size={15} /></span>
    </button>
  );
}
