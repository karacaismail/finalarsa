// Yol Haritası sayfası (v2 iki-tab navigasyonun ikinci sekmesi).
// master_plan'ın DİJİTAL PAZARLAMA + GELİR SENARYOSU sekmelerinden (canlı gviz CSV)
// aylık ilerleyiş zaman çizgisi + kilometre taşları türetir. Kümülatifler roadmap.ts'te
// kendimiz hesaplanır (sheet KÜMÜLATİF satırıyla mutabık — bkz. roadmap.test.ts).
import { useEffect, useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "../components/Chart";
import { NumView, Svg, Icon } from "../components/num";
import { fetchRoadmapTabs, buildRoadmap } from "../lib/roadmap";
import type { RoadmapModel } from "../lib/roadmap";

// TR ay etiketi "2026-07" → "Tem 26"
const AY_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const ymLabel = (ym: string) => { const [y, m] = ym.split("-").map(Number); return `${AY_KISA[m - 1]} ${String(y).slice(2)}`; };

// Büyük ₺ değeri için kısa gösterim (eksen/tooltip): 1.409.045 → "1,4M"
const kisaTL = (v: number) =>
  Math.abs(v) >= 1e9 ? (v / 1e9).toLocaleString("tr-TR", { maximumFractionDigits: 2 }) + " Mr"
  : Math.abs(v) >= 1e6 ? (v / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + "M"
  : (v / 1e3).toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + "B";

export function RoadmapPage({ conv, sym }: { conv: (tl: number) => number; sym: string }) {
  const [tabs, setTabs] = useState<RoadmapModel | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetchRoadmapTabs()
      .then((t) => { if (alive) { setTabs(buildRoadmap(t)); setStatus("ok"); } })
      .catch(() => { if (alive) setStatus("error"); });
    return () => { alive = false; };
  }, []);

  // Kümülatif pazarlama harcaması + kümülatif gelir çift eksenli zaman çizgisi.
  const chart: EChartsOption | null = useMemo(() => {
    if (!tabs) return null;
    const p = tabs.points;
    return {
      grid: { left: 58, right: 58, top: 28, bottom: 64 },
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const arr = Array.isArray(params) ? params : [params];
          const head = arr.length ? (arr[0].axisValueLabel ?? arr[0].axisValue) : "";
          const satir = arr.map((s: any) =>
            `${s.marker}${s.seriesName}: <b>${Math.round(Number(s.value)).toLocaleString("tr-TR")} ${sym}</b>`);
          return [head, ...satir].join("<br>");
        },
      },
      legend: { top: 0, type: "scroll", textStyle: { fontSize: 12 } },
      xAxis: { type: "category", data: p.map((x) => x.label), axisLabel: { rotate: 48, fontSize: 10, interval: p.length > 24 ? 2 : 0 } },
      yAxis: [
        { type: "value", name: "Gelir", nameTextStyle: { fontSize: 10 }, position: "left", axisLabel: { fontSize: 10, formatter: (v: number) => kisaTL(v) } },
        { type: "value", name: "Pazarlama", nameTextStyle: { fontSize: 10 }, position: "right", axisLabel: { fontSize: 10, formatter: (v: number) => kisaTL(v) } },
      ],
      series: [
        { name: "Kümülatif gelir", type: "line", yAxisIndex: 0, smooth: true, showSymbol: false, color: "#2f6b34", areaStyle: { opacity: 0.12 }, lineStyle: { width: 2.5 }, data: p.map((x) => Math.round(conv(x.gelirKum))) },
        { name: "Kümülatif pazarlama", type: "line", yAxisIndex: 1, smooth: true, showSymbol: false, color: "#be123c", lineStyle: { width: 2, type: "dashed" }, data: p.map((x) => Math.round(conv(x.pazKum))) },
      ],
    };
  }, [tabs, sym, conv]);

  if (status === "loading")
    return <div className="sheet-flag loading" style={{ marginTop: 8 }}>Yol haritası verileri yükleniyor…</div>;
  if (status === "error" || !tabs)
    return <div className="sheet-flag error" style={{ marginTop: 8 }}>Yol haritası okunamadı — master_plan sekmelerine (DİJİTAL PAZARLAMA / GELİR SENARYOSU) erişilemedi.</div>;

  const p = tabs.points;
  const ilk = p[0], son = p[p.length - 1];
  const donemAd = ilk && son ? `${ymLabel(ilk.ym)} → ${ymLabel(son.ym)} · ${p.length} ay` : "";
  // Kümülatif gelir kümülatif pazarlamayı ilk kez aşan ay (kabaca geri-ödeme / break-even eşiği).
  const breakEven = p.find((x) => x.gelirKum >= x.pazKum && x.gelirKum > 0);

  return (
    <>
      <div className="sheet-flag ok" style={{ marginTop: 8 }}>
        Canlı master_plan bağlı — yol haritası GELİR SENARYOSU + DİJİTAL PAZARLAMA sekmelerinden türetildi · {donemAd}
      </div>

      <section className="cards cards4">
        <RCard k="Kümülatif gelir (dönem sonu)" n={conv(tabs.toplamGelir)} sym={sym} accent />
        <RCard k="Kümülatif pazarlama (dönem sonu)" n={conv(tabs.toplamPazarlama)} sym={sym} />
        <RCard k="Hedef pazar payı (SOM tavanı)" pct={tabs.sonSomPct} />
        <RCard k="Gelir/pazarlama oranı" ratio={tabs.toplamPazarlama > 0 ? tabs.toplamGelir / tabs.toplamPazarlama : 0} />
      </section>

      <section className="block chartblock">
        <h2>Kümülatif ilerleyiş — gelir vs. pazarlama</h2>
        {chart && <EChart option={chart} height={320} />}
        <p className="rm-caption">
          Kümülatif değerler aylık satırların koşan toplamıdır ve sheet&apos;in KÜMÜLATİF GELİR satırıyla mutabıktır.
          {breakEven ? ` Kümülatif gelir, kümülatif pazarlamayı ${ymLabel(breakEven.ym)} ayında aşar.` : ""}
        </p>
      </section>

      <section className="block">
        <h2>Kilometre taşları</h2>
        <ol className="rm-miles">
          {tabs.milestones.map((m) => (
            <li key={m.key} className={"rm-mile" + (m.ym ? "" : " pending")}>
              <span className="rm-badge">{m.label ?? "—"}</span>
              <span className="rm-mile-txt">
                <b className="rm-mile-ad">{m.ad}</b>
                <span className="rm-mile-not">{m.not}</span>
                {!m.ym && <span className="rm-mile-warn"><Svg d={Icon.info} size={13} /> Bu eşiğe seçili veri aralığında ulaşılmadı.</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="block">
        <h2>Yıllık ilerleyiş özeti</h2>
        <YearTable model={tabs} conv={conv} sym={sym} />
        <p className="rm-caption">
          Varsayım: kilometre taşları sheet&apos;in ilan/gelir/pay eşiklerinden türetilir (resmî lansman = aylık gelir ≥ 1M ₺; plateau = SOM %15 tavanı).
          Emlak geliri sheet&apos;te arsanın 1/10 çarpanı olarak modellenmiştir; gelir toplamı arsa + emlak birleşiğidir.
        </p>
      </section>
    </>
  );
}

// Yıl bazında son ayın kümülatiflerini + o yılın SOM tavanını göster (kompakt tablo).
function YearTable({ model, conv, sym }: { model: RoadmapModel; conv: (tl: number) => number; sym: string }) {
  const byYear = new Map<string, { gelirKum: number; pazKum: number; som: number; ilan: number }>();
  for (const pt of model.points) {
    const y = pt.ym.slice(0, 4);
    // Her yıl için o yılın SON ayının kümülatif değerleri (map sırayla üzerine yazar) + max SOM/ilan.
    const cur = byYear.get(y) ?? { gelirKum: 0, pazKum: 0, som: 0, ilan: 0 };
    byYear.set(y, {
      gelirKum: pt.gelirKum,
      pazKum: pt.pazKum,
      som: Math.max(cur.som, pt.somPct),
      ilan: Math.max(cur.ilan, pt.ilan),
    });
  }
  const rows = [...byYear.entries()];
  return (
    <div className="rm-table">
      <div className="rm-tr rm-th">
        <span>Yıl</span><span>Kümülatif gelir</span><span>Kümülatif pazarlama</span><span>İlan (Arsa)</span><span>SOM %</span>
      </div>
      {rows.map(([y, v]) => (
        <div className="rm-tr" key={y}>
          <span className="rm-y">{y}</span>
          <span><NumView n={conv(v.gelirKum)} sym={sym} /></span>
          <span><NumView n={conv(v.pazKum)} sym={sym} /></span>
          <span>{Math.round(v.ilan).toLocaleString("tr-TR")}</span>
          <span>%{v.som.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</span>
        </div>
      ))}
    </div>
  );
}

// Kart: ya para (n+sym), ya yüzde (pct), ya oran (ratio "×").
function RCard({ k, n, sym, accent, pct, ratio }: { k: string; n?: number; sym?: string; accent?: boolean; pct?: number; ratio?: number }) {
  return (
    <div className={"card" + (accent ? " accent" : "")}>
      <div className="k">{k}</div>
      <div className="v">
        {pct !== undefined ? <span>%{pct.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</span>
          : ratio !== undefined ? <span>{ratio.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}×</span>
          : <NumView n={n ?? 0} sym={sym} />}
      </div>
    </div>
  );
}
