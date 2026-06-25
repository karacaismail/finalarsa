// Özet: ay×kategori tablosu (personel kadrodan + 6 manuel) + 5 dinamik ECharts + benchmark/CPO referans.
import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { ayLabel } from "../data/finansal";
import type { Currency, FinansalData, Rates } from "../data/finansal";
import { personelAy, aktifSayi, ayToplamTL, genelToplam, kategoriAltToplam, trToDisp } from "../lib/calc";
import { NumView, Svg, Icon } from "../components/num";
import { EChart } from "../components/Chart";

const SYM: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };
type Key = "personel" | "pazarlama" | "saha" | "dijital" | "ofis" | "yazilim" | "capex";
const CATS: { key: Key; label: string; color: string }[] = [
  { key: "personel", label: "Personel (kadro)", color: "#2f6b34" },
  { key: "pazarlama", label: "Pazarlama", color: "#1f6feb" },
  { key: "saha", label: "Saha operasyonu", color: "#b8860b" },
  { key: "dijital", label: "Dijital altyapı & AI", color: "#6b46c1" },
  { key: "ofis", label: "Ofis & idari", color: "#be123c" },
  { key: "yazilim", label: "Yazılım & AI", color: "#0e7490" },
  { key: "capex", label: "CAPEX", color: "#a16207" },
];

export function Ozet({ data, disp }: { data: FinansalData; disp: Currency }) {
  const rates: Rates = data.meta.rates;
  const sym = SYM[disp];
  const D = { roles: data.roles, costParams: data.costParams, months: data.months };
  const months = data.months;
  const conv = (tl: number) => trToDisp(tl, disp, rates);
  const fmt = (v: number) => v.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
  const kisalt = (v: number) => {
    const a = Math.abs(v);
    if (a >= 1e9) return (v / 1e9).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + " Mr";
    if (a >= 1e6) return (v / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + " M";
    if (a >= 1e3) return (v / 1e3).toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " B";
    return String(v);
  };
  const valTL = (m: typeof months[number], k: Key) => (k === "personel" ? personelAy(data.roles, data.costParams, m.ym) : m.values[k]);

  const alt = kategoriAltToplam(D);
  const genel = genelToplam(D);
  const ortalama = genel / months.length;
  const enYuksek = months.reduce((a, m) => (ayToplamTL(D, m) > ayToplamTL(D, a) ? m : a), months[0]);
  const aylar = months.map((m) => ayLabel(m.ym));

  const optAylik: EChartsOption = useMemo(() => ({
    grid: { left: 64, right: 18, top: 24, bottom: 78 },
    tooltip: { trigger: "axis", valueFormatter: (v) => fmt(Number(v)) + " " + sym },
    xAxis: { type: "category", data: aylar, axisLabel: { rotate: 50, fontSize: 12 } },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => kisalt(v), fontSize: 12 } },
    series: [{ name: "Aylık gider", type: "line", smooth: true, showSymbol: false, areaStyle: { opacity: 0.1 }, lineStyle: { width: 3 }, color: "#2f6b34", data: months.map((m) => Math.round(conv(ayToplamTL(D, m)))) }],
  }), [data, disp]);

  const optHeadcount: EChartsOption = useMemo(() => ({
    grid: { left: 48, right: 18, top: 24, bottom: 78 },
    tooltip: { trigger: "axis", valueFormatter: (v) => fmt(Number(v)) + " kişi" },
    xAxis: { type: "category", data: aylar, axisLabel: { rotate: 50, fontSize: 12 } },
    yAxis: { type: "value", axisLabel: { fontSize: 12 } },
    series: [{ name: "Aktif rol", type: "bar", color: "#1f6feb", data: months.map((m) => aktifSayi(data.roles, m.ym)) }],
  }), [data, disp]);

  const optYigilmis: EChartsOption = useMemo(() => ({
    grid: { left: 64, right: 18, top: 40, bottom: 78 },
    tooltip: { trigger: "axis", valueFormatter: (v) => fmt(Number(v)) + " " + sym },
    legend: { top: 0, type: "scroll", textStyle: { fontSize: 13 } },
    xAxis: { type: "category", data: aylar, axisLabel: { rotate: 50, fontSize: 12 } },
    yAxis: { type: "value", axisLabel: { formatter: (v: number) => kisalt(v), fontSize: 12 } },
    series: CATS.map((c) => ({ name: c.label, type: "bar", stack: "gider", color: c.color, data: months.map((m) => Math.round(conv(valTL(m, c.key)))) })),
  }), [data, disp]);

  const optPasta: EChartsOption = useMemo(() => ({
    tooltip: { trigger: "item", valueFormatter: (v) => fmt(Number(v)) + " " + sym },
    legend: { bottom: 0, type: "scroll", textStyle: { fontSize: 13 } },
    series: [{ type: "pie", radius: ["42%", "70%"], center: ["50%", "44%"], itemStyle: { borderColor: "#fff", borderWidth: 2 }, label: { fontSize: 12, formatter: "{b}\n{d}%" },
      data: CATS.map((c) => ({ name: c.label, value: Math.round(conv(alt[c.key])), itemStyle: { color: c.color } })) }],
  }), [data, disp]);

  const optKumulatif: EChartsOption = useMemo(() => {
    let acc = 0;
    const seri = months.map((m) => { acc += ayToplamTL(D, m); return Math.round(conv(acc)); });
    return {
      grid: { left: 70, right: 18, top: 24, bottom: 78 },
      tooltip: { trigger: "axis", valueFormatter: (v) => fmt(Number(v)) + " " + sym },
      xAxis: { type: "category", data: aylar, axisLabel: { rotate: 50, fontSize: 12 } },
      yAxis: { type: "value", axisLabel: { formatter: (v: number) => kisalt(v), fontSize: 12 } },
      series: [{ name: "Kümülatif", type: "line", smooth: true, showSymbol: false, areaStyle: { opacity: 0.18 }, lineStyle: { width: 3 }, color: "#1f6feb", data: seri }],
    };
  }, [data, disp]);

  return (
    <div className="ozet">
      <section className="cards">
        <Card k="Toplam gider (24 ay)" n={conv(genel)} sym={sym} accent />
        <Card k="Aylık ortalama gider" n={conv(ortalama)} sym={sym} />
        <Card k={`En yüksek ay — ${ayLabel(enYuksek.ym)}`} n={conv(ayToplamTL(D, enYuksek))} sym={sym} />
        <Card k="Personel payı (24 ay)" n={conv(alt.personel)} sym={sym} />
      </section>

      <section className="block">
        <h2>Grafikler <span className="badge live"><Svg d={Icon.edit} size={15} /> kadro/giriş değiştikçe güncellenir</span></h2>
        <div className="charts">
          <div className="chart-box"><h3>Aylık toplam gider</h3><EChart option={optAylik} /></div>
          <div className="chart-box"><h3>Aktif rol sayısı (kadro)</h3><EChart option={optHeadcount} /></div>
          <div className="chart-box wide"><h3>Aya göre kategori dağılımı (yığılmış)</h3><EChart option={optYigilmis} height={360} /></div>
          <div className="chart-box"><h3>Kümülatif gider</h3><EChart option={optKumulatif} /></div>
          <div className="chart-box"><h3>Kategori dağılımı (24 ay)</h3><EChart option={optPasta} height={360} /></div>
        </div>
      </section>

      <section className="block">
        <h2>Ay × kategori tablosu <span className="badge lock"><Svg d={Icon.lock} size={15} /> hesaplanır</span></h2>
        <p className="note">Personel = Kadro'dan; diğerleri Giriş'ten. Alt satır kategori toplamları, sağ sütun ay toplamlarıdır.</p>
        <div className="tbl-scroll">
          <table className="grid">
            <thead><tr><th>Ay</th>{CATS.map((c) => <th key={c.key}>{c.label}</th>)}<th>Toplam</th></tr></thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.ym}>
                  <th scope="row">{ayLabel(m.ym)}</th>
                  {CATS.map((c) => <td key={c.key}><NumView n={conv(valTL(m, c.key))} sym={sym} /></td>)}
                  <td className="tot"><NumView n={conv(ayToplamTL(D, m))} sym={sym} /></td>
                </tr>
              ))}
              <tr className="sum">
                <th scope="row">Kategori toplamı</th>
                {CATS.map((c) => <td key={c.key}><NumView n={conv(alt[c.key])} sym={sym} /></td>)}
                <td className="tot"><NumView n={conv(genel)} sym={sym} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="block locked">
        <h2>{data.benchmarks.title}</h2>
        <p className="note warn">{data.benchmarks.disclaimer}</p>
        <Bench title="Yazılımcı maaşları" rows={data.benchmarks.softwareSalaries.map((x) => ({ name: x.role, lo: conv(x.min), hi: conv(x.max), src: x.region }))} sym={sym} />
        <Bench title="Diğer meslekler" rows={data.benchmarks.professions.map((x) => ({ name: x.role, lo: conv(x.min), hi: conv(x.max), src: x.region }))} sym={sym} />
        <Bench title="C-level (büyük e-ticaret / teknoloji)" rows={data.benchmarks.cLevel.map((x) => ({ name: x.company, lo: conv(x.min), hi: conv(x.max), src: x.note }))} sym={sym} />
      </section>
    </div>
  );
}

function Card({ k, n, sym, accent }: { k: string; n: number; sym: string; accent?: boolean }) {
  return <div className={"card" + (accent ? " accent" : "")}><div className="k">{k}</div><div className="v"><NumView n={n} sym={sym} /></div></div>;
}
function Bench({ title, rows, sym }: { title: string; rows: { name: string; lo: number; hi: number; src: string }[]; sym: string }) {
  return (
    <div className="bench"><h3>{title}</h3>
      <table className="grid"><tbody>
        {rows.map((x, i) => (
          <tr key={i}><th scope="row">{x.name}</th>
            <td className="rng"><NumView n={x.lo} sym={sym} /> <span className="dash">–</span> <NumView n={x.hi} sym={sym} /></td>
            <td className="src">{x.src}</td></tr>
        ))}
      </tbody></table>
    </div>
  );
}
