// v3 · Alt-detay modalı. Bir kalemin alt-kırılımını gösterir (canlı alt_detay sekmesi ya da motor kırılımı).
// Erişilebilirlik: role=dialog + aria-modal, Esc/overlay/✕ ile kapanır, odak modal içinde döner.
// Mobile-first: 320px'te alttan tam-genişlik sayfa; ≥600px ortalanmış kart. Dokunma hedefleri ≥44px.
import { useEffect, useRef } from "react";
import { NumView, Svg } from "./num";
import type { AltDetay } from "../lib/subdetails";

const X_ICON = "M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z";

export interface ModalData { baslik: string; rows: AltDetay[]; kalemTl: number; }

export function DetailModal({ data, conv, sym, onClose }: {
  data: ModalData; conv: (tl: number) => number; sym: string; onClose: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";                    // arka plan kaydırma kilidi
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); }
      if (e.key === "Tab") {                                    // basit odak tuzağı
        const els = boxRef.current?.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])");
        if (!els?.length) return;
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const altToplam = data.rows.reduce((s, r) => s + r.tl, 0);
  const fark = data.kalemTl > 0 ? Math.abs(altToplam - data.kalemTl) / data.kalemTl : 0;
  const tutarli = fark <= 0.01;                                  // toleranslı doğrulama: %1

  return (
    <div className="dmodal-overlay" onClick={onClose}>
      <div className="dmodal" role="dialog" aria-modal="true" aria-label={data.baslik}
           ref={boxRef} onClick={(e) => e.stopPropagation()}>
        <div className="dmodal-head">
          <h3>{data.baslik}</h3>
          <button ref={closeRef} type="button" className="dmodal-close" aria-label="Kapat" onClick={onClose}>
            <Svg d={X_ICON} size={20} />
          </button>
        </div>
        <div className="dmodal-body">
          {data.rows.map((r, i) => (
            <div className="dmodal-row" key={i}>
              <span className="dm-ad">
                {r.ad}
                {r.not && <span className="dm-not">{r.not}</span>}
              </span>
              <NumView n={conv(r.tl)} sym={sym} />
            </div>
          ))}
        </div>
        <div className={"dmodal-sum" + (tutarli ? "" : " warn")}>
          <span>{tutarli
            ? "Alt-detay toplamı = kalem tutarı"
            : `Uyarı: alt-detay toplamı kalemden %${(fark * 100).toFixed(1)} sapıyor (sheet'te satır eklenmiş/değişmiş olabilir)`}</span>
          <NumView n={conv(altToplam)} sym={sym} />
        </div>
      </div>
    </div>
  );
}
