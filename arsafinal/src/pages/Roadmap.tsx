// Yol Haritası sayfası (v2 iki-tab navigasyonun ikinci sekmesi) — YENİDEN TASARIM.
// SADECE proje ilerleyişi: her AY bir kart, dikey zigzag timeline (sağ-sol alternatif).
// Kart içeriği o aya ait AKSİYON/ÇIKTI'dır (işe alınan roller, faz/kilometre taşı, GTM) —
// FİNANSAL VERİ YOK. İşe alım canlı "İK PLANI" sekmesinden türetilir (bkz. roadmap.ts).
import { useEffect, useMemo, useState } from "react";
import { Svg, Icon } from "../components/num";
import { fetchIkGrid, buildTimeline } from "../lib/roadmap";
import type { RoadmapTimeline, TimelineMonth } from "../lib/roadmap";

// Ek SVG ikonları (num.tsx Icon dilini genişletir; emoji YOK).
const ICO = {
  team: "M164.47 195.63a8 8 0 0 1-6.7 12.37H10.23a8 8 0 0 1-6.7-12.37 95.83 95.83 0 0 1 47.22-37.71 60 60 0 1 1 66.5 0 95.83 95.83 0 0 1 47.22 37.71M252.47 195.63A95.83 95.83 0 0 0 205.25 157.92a60 60 0 0 0-38.83-107.4 8 8 0 0 0 0 16 44 44 0 0 1 0 88 8 8 0 0 0 0 16 44.24 44.24 0 0 1 30.48 76.51 8 8 0 0 0 5.55 13.78h32a8 8 0 0 0 6.7-12.37Z",
  flag: "M42.76 50.79A8 8 0 0 0 40 56.79V216a8 8 0 0 0 16 0v-48.9c26.78-16.42 48.65-9.86 74.15-2.24 16.5 4.93 34.79 10.4 54 10.4 15.29 0 31.22-3.47 47.14-13.79A8 8 0 0 0 240 168V56a8 8 0 0 0-12.6-6.54c-27.72 19.4-52.34 12-80.85 3.47C122.5 45.68 92.63 36.75 56 60.14V56.79a8 8 0 0 0-13.24-6Z",
  pin: "M128 16a88.1 88.1 0 0 0-88 88c0 75.3 80 132.17 83.41 134.55a8 8 0 0 0 9.18 0C136 236.17 216 179.3 216 104a88.1 88.1 0 0 0-88-88Zm0 56a32 32 0 1 1-32 32 32 32 0 0 1 32-32Z",
  build: "M226.76 69a8 8 0 0 0-12.84-2.08l-19 19-3.36-16.72 19-19a8 8 0 0 0-2.08-12.84c-24.61-14-58.63-9.09-77.87 10.16-16.46 16.46-21.86 41.68-15.05 68.55L36.83 187a24 24 0 0 0 33.94 33.94l71.12-71.12c26.87 6.81 52.09 1.41 68.55-15.05C229.85 115.28 234.79 91.42 226.76 69Z",
} as const;

export function RoadmapPage() {
  const [model, setModel] = useState<RoadmapTimeline | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetchIkGrid()
      .then((grid) => { if (alive) { setModel(buildTimeline(grid)); setStatus("ok"); } })
      .catch(() => { if (alive) setStatus("error"); });
    return () => { alive = false; };
  }, []);

  const donemAd = useMemo(() => {
    if (!model || !model.ilkYm || !model.sonYm) return "";
    const lab = (ym: string) => { const [y, m] = ym.split("-").map(Number); return `${["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"][m-1]} ${String(y).slice(2)}`; };
    return `${lab(model.ilkYm)} → ${lab(model.sonYm)} · ${model.toplamRol} rol`;
  }, [model]);

  if (status === "loading")
    return <div className="sheet-flag loading" style={{ marginTop: 8 }}>Yol haritası verileri yükleniyor…</div>;
  if (status === "error" || !model)
    return <div className="sheet-flag error" style={{ marginTop: 8 }}>Yol haritası okunamadı — master_plan &quot;İK PLANI&quot; sekmesine erişilemedi.</div>;

  return (
    <>
      <div className="sheet-flag ok" style={{ marginTop: 8 }}>
        Canlı master_plan bağlı — yol haritası &quot;İK PLANI&quot; sekmesinden türetildi (işe alım = rolün ilk aktif ayı) · {donemAd}
      </div>

      <section className="block">
        <h2>Proje yol haritası — aylık ilerleyiş</h2>
        <p className="tl-intro">
          Aşağıdaki zaman çizelgesi <b>ne yaptığınızın karşılığında ne aldığınızı</b> gösterir: her ay hangi ekibin
          kurulduğu, projenin hangi aşamaya (kuruluş → soft-launch → resmî lansman → ölçekleme → istikrar) geldiği ve
          saha satış aksiyonları. Finansal rakamlar Finansal Plan sekmesindedir.
        </p>
        <Legend />
        <Timeline months={model.months} />
      </section>
    </>
  );
}

// Zigzag dikey timeline: ortada çizgi + ay düğümü, kartlar sırayla sol/sağ.
function Timeline({ months }: { months: TimelineMonth[] }) {
  return (
    <ol className="tl">
      {months.map((m) => (
        <li key={m.ym} className={"tl-item tl-" + m.side + (m.phaseStart ? " tl-milestone" : "")}>
          <div className="tl-node" aria-hidden="true">
            <span className="tl-dot" />
          </div>
          <div className="tl-card">
            <div className="tl-card-head">
              <span className="tl-month">{m.label}</span>
              {m.phase && (
                <span className={"tl-phase-tag" + (m.phase.vurgu ? " on" : "")}>
                  <Svg d={m.phase.vurgu ? ICO.flag : Icon.info} size={13} />
                  {m.phase.ad}
                </span>
              )}
            </div>

            {m.phase && <p className="tl-phase-desc">{m.phase.aciklama}</p>}

            {m.hires.length > 0 && (
              <div className="tl-sec">
                <div className="tl-sec-h"><Svg d={ICO.team} size={14} /> Bu ay ekibe katılan roller ({m.hires.length})</div>
                <ul className="tl-hires">
                  {m.hires.map((h) => (
                    <li key={h.kod} className="tl-hire">
                      <span className="tl-hire-ad">{h.ad}</span>
                      {h.kademe && <span className="tl-hire-tag">{h.kademe}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {m.gtm.length > 0 && (
              <div className="tl-sec tl-sec-gtm">
                <div className="tl-sec-h"><Svg d={ICO.pin} size={14} /> Saha & pazara giriş (GTM)</div>
                <ul className="tl-gtm">
                  {m.gtm.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

// Kısa gösterim açıklaması (renk/ikon anlamı).
function Legend() {
  return (
    <div className="tl-legend">
      <span className="tl-leg"><i className="tl-leg-d ph" /> Faz / kilometre taşı</span>
      <span className="tl-leg"><Svg d={ICO.team} size={13} /> İşe alım (İK planı)</span>
      <span className="tl-leg"><Svg d={ICO.pin} size={13} /> Saha satış / GTM</span>
      <span className="tl-leg"><Svg d={ICO.flag} size={13} /> Resmî lansman</span>
    </div>
  );
}
