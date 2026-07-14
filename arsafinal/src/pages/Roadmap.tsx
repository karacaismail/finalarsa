// Yol Haritası sayfası (v2 iki-tab navigasyonun ikinci sekmesi) — YENİDEN TASARIM.
// İki bölüm: (1) SMART Hedefler kartı (yatırımın KARŞILIĞI: gelir/ilan/model, GETİRİ çerçevesi),
// (2) proje ilerleyişi zigzag timeline (aksiyon/çıktı: işe alınan roller, faz, GTM).
// SMART kartı GELİR SENARYOSU'ndan (getiri) türetilir; MALİYET planı DEĞİL. Finansal maliyet
// tablosu Finansal Plan sekmesindedir.
//
// GÜVENİLİRLİK: Sayfa build-time SNAPSHOT'larından (roadmap-snapshot.json + roadmap-revenue-
// snapshot.json) ANINDA render edilir — canlı gviz fetch'i BEKLENMEZ. "yükleniyor" state'i hiç
// oluşmaz; fetch patlasa bile içerik dolu gelir. Arka planda canlı İK PLANI ile tazeleme denenir.
import { useEffect, useMemo, useState } from "react";
import { Svg, Icon, NumView } from "../components/num";
import { fetchIkGrid, buildTimeline, buildTimelineFromSnapshot, buildSmartTargets, cumulativeByYm } from "../lib/roadmap";
import type { RoadmapTimeline, TimelineMonth, RoadmapSnapshotRow, RevenueMonth, SmartTargets } from "../lib/roadmap";
import snapshotData from "../data/roadmap-snapshot.json";
import revenueData from "../data/roadmap-revenue-snapshot.json";

// Commit edilmiş build-time snapshot'lar → ilk render için hazır (fetch beklemeden).
const SNAPSHOT_ROWS = snapshotData as RoadmapSnapshotRow[];
const SNAPSHOT_MODEL: RoadmapTimeline = buildTimelineFromSnapshot(SNAPSHOT_ROWS);
const REVENUE_ROWS = revenueData as RevenueMonth[];
const SMART: SmartTargets = buildSmartTargets(REVENUE_ROWS);
const CUM_BY_YM = cumulativeByYm(REVENUE_ROWS); // ym → o aya kadar kümülatif hedef gelir

// Ek SVG ikonları (num.tsx Icon dilini genişletir; emoji YOK).
const ICO = {
  team: "M164.47 195.63a8 8 0 0 1-6.7 12.37H10.23a8 8 0 0 1-6.7-12.37 95.83 95.83 0 0 1 47.22-37.71 60 60 0 1 1 66.5 0 95.83 95.83 0 0 1 47.22 37.71M252.47 195.63A95.83 95.83 0 0 0 205.25 157.92a60 60 0 0 0-38.83-107.4 8 8 0 0 0 0 16 44 44 0 0 1 0 88 8 8 0 0 0 0 16 44.24 44.24 0 0 1 30.48 76.51 8 8 0 0 0 5.55 13.78h32a8 8 0 0 0 6.7-12.37Z",
  flag: "M42.76 50.79A8 8 0 0 0 40 56.79V216a8 8 0 0 0 16 0v-48.9c26.78-16.42 48.65-9.86 74.15-2.24 16.5 4.93 34.79 10.4 54 10.4 15.29 0 31.22-3.47 47.14-13.79A8 8 0 0 0 240 168V56a8 8 0 0 0-12.6-6.54c-27.72 19.4-52.34 12-80.85 3.47C122.5 45.68 92.63 36.75 56 60.14V56.79a8 8 0 0 0-13.24-6Z",
  pin: "M128 16a88.1 88.1 0 0 0-88 88c0 75.3 80 132.17 83.41 134.55a8 8 0 0 0 9.18 0C136 236.17 216 179.3 216 104a88.1 88.1 0 0 0-88-88Zm0 56a32 32 0 1 1-32 32 32 32 0 0 1 32-32Z",
  build: "M226.76 69a8 8 0 0 0-12.84-2.08l-19 19-3.36-16.72 19-19a8 8 0 0 0-2.08-12.84c-24.61-14-58.63-9.09-77.87 10.16-16.46 16.46-21.86 41.68-15.05 68.55L36.83 187a24 24 0 0 0 33.94 33.94l71.12-71.12c26.87 6.81 52.09 1.41 68.55-15.05C229.85 115.28 234.79 91.42 226.76 69Z",
  // gelir / para (trend yukarı)
  chart: "M232 208a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8V48a8 8 0 0 1 16 0v94.37L90.73 98a8 8 0 0 1 10.07-.38l58.81 44.11L218.73 90a8 8 0 1 1 10.54 12l-64 56a8 8 0 0 1-10.07.38L96.39 114.29 40 163.63V200h184a8 8 0 0 1 8 8Z",
  coin: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm12 152.72V184a8 8 0 0 1-16 0v-7.63a35.7 35.7 0 0 1-16.19-7.13 8 8 0 0 1 9.88-12.58c3.09 2.43 8 4.34 12.66 4.34 6.06 0 12.65-2.85 12.65-8 0-4.24-4.65-6.86-15-10.28-11.24-3.74-25.5-8.49-25.5-23.72a23.14 23.14 0 0 1 21.5-22.35V64a8 8 0 0 1 16 0v6.68a30.66 30.66 0 0 1 13.4 5.61 8 8 0 1 1-9.44 12.9 15.31 15.31 0 0 0-8.75-2.94c-6.27 0-9.11 3.11-9.11 6 0 3.75 4.5 6.27 14.56 9.61 11.35 3.78 25.94 8.63 25.94 24.35A23.61 23.61 0 0 1 140 176.72Z",
  tag: "M243.31 136 144 36.69A15.86 15.86 0 0 0 132.69 32H40a8 8 0 0 0-8 8v92.69A15.86 15.86 0 0 0 36.69 144L136 243.31a16 16 0 0 0 22.63 0l84.68-84.68a16 16 0 0 0 0-22.63ZM84 96a12 12 0 1 1 12-12 12 12 0 0 1-12 12Z",
} as const;

export function RoadmapPage() {
  // İlk render ANINDA snapshot ile dolu (asla boş/yükleniyor). source: veri nereden geldi.
  const [model, setModel] = useState<RoadmapTimeline>(SNAPSHOT_MODEL);
  const [source, setSource] = useState<"snapshot" | "live">("snapshot");

  // Arka planda canlı "İK PLANI" ile tazele. Başarılıysa live modele geç; başarısız/yavaşsa
  // snapshot korunur — HİÇBİR koşulda "yükleniyor"a düşülmez, timeline hep görünür kalır.
  useEffect(() => {
    let alive = true;
    fetchIkGrid()
      .then((grid) => {
        if (!alive) return;
        const fresh = buildTimeline(grid);
        if (fresh.months.length > 0) { setModel(fresh); setSource("live"); }
      })
      .catch(() => { /* snapshot yeterli — sessizce yut, sayfa dolu kalır */ });
    return () => { alive = false; };
  }, []);

  const donemAd = useMemo(() => {
    if (!model.ilkYm || !model.sonYm) return "";
    const lab = (ym: string) => { const [y, m] = ym.split("-").map(Number); return `${["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"][m-1]} ${String(y).slice(2)}`; };
    return `${lab(model.ilkYm)} → ${lab(model.sonYm)} · ${model.toplamRol} rol`;
  }, [model]);

  // Yalnız hem snapshot BOŞ hem de henüz canlı veri yoksa bilgilendirme göster (takılma değil).
  if (model.months.length === 0)
    return <div className="sheet-flag error" style={{ marginTop: 8 }}>Yol haritası içeriği bulunamadı — master_plan &quot;İK PLANI&quot; verisi hazır olduğunda otomatik dolacaktır.</div>;

  return (
    <>
      <div className="sheet-flag ok" style={{ marginTop: 8 }}>
        {source === "live"
          ? <>Canlı master_plan bağlı — yol haritası &quot;İK PLANI&quot; sekmesinden türetildi (işe alım = rolün ilk aktif ayı) · {donemAd}</>
          : <>Yol haritası &quot;İK PLANI&quot; anlık görüntüsünden türetildi (işe alım = rolün ilk aktif ayı) · {donemAd}</>}
      </div>

      {SMART.kumulatifGelir > 0 && <SmartCard s={SMART} />}

      <section className="block">
        <h2>Proje yol haritası — aylık ilerleyiş</h2>
        <p className="tl-intro">
          Aşağıdaki zaman çizelgesi <b>ne yaptığınızın karşılığında ne aldığınızı</b> gösterir: her ay hangi ekibin
          kurulduğu, projenin hangi aşamaya (kuruluş → soft-launch → resmî lansman → ölçekleme → istikrar) geldiği,
          saha satış aksiyonları ve <b>o aya kadar ulaşılan hedef gelir</b>. Ayrıntılı maliyet tablosu Finansal Plan sekmesindedir.
        </p>
        <Legend />
        <Timeline months={model.months} />
      </section>
    </>
  );
}

// ── SMART Hedefler kartı — Mar 2027 (yatırımın KARŞILIĞI: GETİRİ, maliyet değil) ──
function SmartCard({ s }: { s: SmartTargets }) {
  const arsaW = Math.max(0, Math.min(100, s.arsaPayPct));
  const emlakW = Math.max(0, Math.min(100, s.emlakPayPct));
  const pct1 = (v: number) => v.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  return (
    <section className="smart" aria-label="SMART Hedefler">
      <div className="smart-head">
        <h2>SMART Hedefler</h2>
        <span className="smart-ufuk"><Svg d={ICO.flag} size={13} /> Ufuk: {s.ufukLabel === "Mar 27" ? "Mar 2027" : s.ufukLabel}</span>
      </div>
      <p className="smart-sub">
        Yatırımın <b>karşılığında</b> ne alıyorsunuz: Mar 2027 sonunda ulaşılan <b>gelir</b>, <b>aktif ilan/müşteri</b> tabanı
        ve hangi gelir modelinden ne kadar. İlk 6 ay (Tem–Ara 26) soft-launch/minimal gelir; <b>Oca 2027 resmî lansmanla B2B satış</b> devreye girer.
      </p>

      <div className="smart-grid">
        <div className="smart-kpi lead">
          <div className="kpi-h"><Svg d={ICO.coin} size={14} /> Kümülatif gelir (Tem 26 → Mar 27)</div>
          <div className="kpi-v"><NumView n={s.kumulatifGelir} sym="₺" /></div>
          <div className="kpi-note">Dokuz aylık toplam projekte edilen gelir (muhafazakâr senaryo).</div>
        </div>

        <div className="smart-kpi lead">
          <div className="kpi-h"><Svg d={ICO.chart} size={14} /> Aylık gelir — run-rate (Mar 27)</div>
          <div className="kpi-v"><NumView n={s.aylikRunRate} sym="₺" /></div>
          <div className="kpi-note">Mar 2027 tek-ay geliri; ölçekleme hızını gösterir.</div>
        </div>

        <div className="smart-kpi">
          <div className="kpi-h"><Svg d={ICO.tag} size={14} /> Aktif ilan tabanı (Mar 27)</div>
          <div className="kpi-v"><NumView n={s.ilanToplam} /></div>
          <div className="kpi-note">
            Arsa <b>{s.ilanArsa.toLocaleString("tr-TR")}</b> + Emlak <b>{s.ilanEmlak.toLocaleString("tr-TR")}</b> ilan/müşteri.
          </div>
        </div>

        <div className="smart-kpi">
          <div className="kpi-h"><Svg d={ICO.build} size={14} /> Arsa pazar payı hedefi (SOM)</div>
          <div className="kpi-v">%{pct1(s.somArsaPct)}</div>
          <div className="kpi-note">Mar 2027'de ulaşılabilir arsa pazarındaki hedef pay.</div>
        </div>
      </div>

      {/* gelir modeli kırılımı — Arsa vs Emlak (% + ₺) */}
      <div className="smart-split">
        <div className="kpi-h" style={{ marginBottom: 8 }}><Svg d={ICO.chart} size={14} /> Gelir modeli kırılımı (Mar 27 aylık)</div>
        <div className="smart-split-bar" role="img" aria-label={`Arsa %${pct1(s.arsaPayPct)}, Emlak %${pct1(s.emlakPayPct)}`}>
          <i className="seg-arsa" style={{ width: arsaW + "%" }} />
          <i className="seg-emlak" style={{ width: emlakW + "%" }} />
        </div>
        <div className="smart-split-legend">
          <span><i className="dot arsa" /> Arsa / Arazi: <b>%{pct1(s.arsaPayPct)}</b>&nbsp;(<NumView n={s.gelirArsa} sym="₺" />)</span>
          <span><i className="dot emlak" /> Emlak (1/10 çarpanı): <b>%{pct1(s.emlakPayPct)}</b>&nbsp;(<NumView n={s.gelirEmlak} sym="₺" />)</span>
        </div>
      </div>

      <div className="smart-milestone">
        <Svg d={ICO.flag} size={16} />
        <span><b>Kilit milestone — Oca 2027:</b> resmî lansman ve B2B satışların başlangıcı. İlk 6 ay (Tem–Ara 26) soft-launch: minimal gelir, platform doğrulama ve erken ilan toplama.</span>
      </div>
    </section>
  );
}

// Zigzag dikey timeline: ortada çizgi + ay düğümü, kartlar sırayla sol/sağ.
function Timeline({ months }: { months: TimelineMonth[] }) {
  return (
    <ol className="tl">
      {months.map((m) => {
        const cum = CUM_BY_YM.get(m.ym); // o aya kadar hedef kümülatif gelir (varsa)
        return (
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

              {cum !== undefined && cum > 0 && (
                <div className="tl-rev">
                  <Svg d={ICO.coin} size={14} />
                  <span className="rev-lbl">Bu aya kadar hedef gelir:</span>
                  <NumView n={cum} sym="₺" />
                </div>
              )}
            </div>
          </li>
        );
      })}
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
      <span className="tl-leg"><Svg d={ICO.coin} size={13} /> O aya kadar hedef gelir</span>
      <span className="tl-leg"><Svg d={ICO.flag} size={13} /> Resmî lansman</span>
    </div>
  );
}
