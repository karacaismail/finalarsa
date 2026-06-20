import { chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";

/**
 * Elle çizilmiş fosforlu kalem (marker) vurgusu.
 * Ne yapar: verilen ifadeleri metin içinde bulup <mark class="hl-marker"> ile sarar.
 * Görsel efekt (organik sarı fırça izi, hafif dönme, hover animasyonu) tamamen
 * CSS'tedir (src/index.css → .hl-marker), dış görsel kullanılmaz.
 * Ne yapmaz: metni değiştirmez; yalnız eşleşen ifadeyi işaretler. Eşleşme büyük/küçük
 * harfe DUYARLI (ifadeler JSON'daki metinle birebir verilir; Türkçe harf sorunları olmaz).
 */
const Mark = chakra("mark");

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function markHighlight(text: string, queries: string[] | undefined, keyBase: string): ReactNode[] {
  const qs = (queries ?? []).filter(Boolean);
  if (!text || !qs.length) return [text];
  // Uzun ifadeleri önce eşle (kısa parçaların erken yakalanmasını önler).
  const sorted = [...qs].sort((a, b) => b.length - a.length).map(escapeRegExp);
  const re = new RegExp(`(${sorted.join("|")})`, "g");
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    out.push(
      <Mark key={`${keyBase}-m${i++}`} className="hl-marker">
        {m[0]}
      </Mark>,
    );
    last = start + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : [text];
}
