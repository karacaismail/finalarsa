/**
 * useViewportTier — matchMedia tabanlı viewport kademesi hook'u (mobil-öncelikli).
 *
 * Ne yapar: Pencere genişliğine göre dört kademe döndürür ve genişlik değişince günceller.
 *   xs320   ≤ 359px   (en dar telefon)
 *   mobile  360–767px (telefon)
 *   tablet  768–1023px
 *   desktop ≥ 1024px
 * Ne yapmaz: Hiçbir stil uygulamaz; yalnız kademe bilgisi verir (grafik/varyant seçimi için).
 *
 * NOT: Tablo masaüstü/mobil geçişi CSS `display` ile yapılır (flash yok). Bu hook
 * özellikle ECharts gibi JS-tarafı karar gereken yerler (mobil grafik varyantı) içindir.
 */
import { useEffect, useState } from "react";

export type ViewportTier = "xs320" | "mobile" | "tablet" | "desktop";

function getCurrentTier(): ViewportTier {
  if (typeof window === "undefined") return "mobile"; // SSR güvenli varsayılan
  const w = window.innerWidth;
  if (w <= 359) return "xs320";
  if (w <= 767) return "mobile";
  if (w <= 1023) return "tablet";
  return "desktop";
}

export function useViewportTier(): ViewportTier {
  const [tier, setTier] = useState<ViewportTier>(getCurrentTier);

  useEffect(() => {
    const update = () => setTier(getCurrentTier());
    const mqs = [
      window.matchMedia("(max-width: 359px)"),
      window.matchMedia("(max-width: 767px)"),
      window.matchMedia("(max-width: 1023px)"),
    ];
    mqs.forEach((mq) => mq.addEventListener("change", update));
    update(); // mount'ta hydration kaymasına karşı yeniden hesapla
    return () => mqs.forEach((mq) => mq.removeEventListener("change", update));
  }, []);

  return tier;
}

/** compact = mobil-öncelikli sadeleştirme gereken kademeler (xs320 + mobile). */
export function useIsCompact(): boolean {
  const tier = useViewportTier();
  return tier === "xs320" || tier === "mobile";
}
