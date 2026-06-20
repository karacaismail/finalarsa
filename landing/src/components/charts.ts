import type { EChartsCoreOption } from "echarts";
import type { FinancialYear } from "../data/types";

/* Aydınlık-minimal palet (site temasıyla uyumlu, AA dostu) */
const C = {
  grass: "#4d7c1f",
  grassBright: "#7cb342",
  gold: "#cc9900",
  goldText: "#876700",
  warn: "#e2723a",
  warnText: "#b14d1c",
  ink: "#1b1a17",
  inkMuted: "#57564f",
  line: "#e2e1d9",
  surface: "#f4f3ee",
};

const FONT = "'Roboto', system-ui, sans-serif";
const textStyle = { fontFamily: FONT, color: C.ink, fontSize: 13 };
const axisLabel = { color: C.inkMuted, fontFamily: FONT, fontSize: 12 };
const splitLine = { lineStyle: { color: C.line } };
const aria = { enabled: true };

export const trNum = (n: number) => n.toLocaleString("tr-TR");
export function fmt(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e12) return `${(n / 1e12).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} trilyon ₺`;
  if (a >= 1e9) return `${(n / 1e9).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} milyar ₺`;
  if (a >= 1e6) return `${Math.round(n / 1e6).toLocaleString("tr-TR")} milyon ₺`;
  if (a >= 1e3) return `${Math.round(n / 1e3).toLocaleString("tr-TR")} bin ₺`;
  return `${trNum(n)} ₺`;
}
const tooltipBase = {
  backgroundColor: "#ffffff",
  borderColor: C.line,
  borderWidth: 1,
  textStyle: { color: C.ink, fontFamily: FONT },
  extraCssText: "box-shadow:0 4px 16px rgba(0,0,0,.08);border-radius:8px;",
};

/* ---------- Pazar hunisi (TAM/SAM/SOM/gelir) ---------- */
export function marketFunnelOption(f: { tam: number; sam: number; som: number; revenue: number }): EChartsCoreOption {
  const data = [
    { value: f.tam, name: "TAM · toplam pazar", real: f.tam },
    { value: f.sam, name: "SAM · dijitale açık", real: f.sam },
    { value: f.som, name: "SOM · elde edilebilir", real: f.som },
    { value: f.revenue, name: "Yıllık gelir potansiyeli", real: f.revenue },
  ];
  return {
    aria,
    textStyle,
    tooltip: { ...tooltipBase, trigger: "item", formatter: (p: any) => `${p.name}<br/><b>${fmt(p.data.real)}</b>` },
    series: [
      {
        type: "funnel",
        min: 0,
        max: f.tam,
        minSize: "24%",
        maxSize: "100%",
        sort: "descending",
        gap: 4,
        funnelAlign: "center",
        label: { show: true, position: "inside", color: "#fff", fontFamily: FONT, fontWeight: 600, formatter: (p: any) => fmt(p.data.real) },
        labelLine: { show: false },
        itemStyle: { borderWidth: 0 },
        color: [C.grass, C.grassBright, "#9ccc65", C.gold],
        data,
      },
    ],
  };
}

/* ---------- Senaryolar (kötümser/medyan/iyimser) ---------- */
export function scenariosBarOption(s: { label: string; revenue: number }[]): EChartsCoreOption {
  return {
    aria,
    textStyle,
    grid: { left: 8, right: 24, top: 24, bottom: 8, containLabel: true },
    tooltip: { ...tooltipBase, trigger: "axis", formatter: (p: any) => `${p[0].name}<br/><b>${fmt(p[0].value)}</b> / yıl` },
    xAxis: { type: "category", data: s.map((x) => x.label), axisLabel, axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: { ...axisLabel, formatter: (v: number) => fmt(v) }, splitLine },
    series: [
      {
        type: "bar",
        barWidth: "46%",
        data: s.map((x, i) => ({ value: x.revenue, itemStyle: { color: [C.warn, C.gold, C.grass][i] ?? C.grass, borderRadius: [6, 6, 0, 0] } })),
        label: { show: true, position: "top", formatter: (p: any) => fmt(p.value), color: C.ink, fontFamily: FONT, fontWeight: 600 },
      },
    ],
  };
}

/* ---------- Senaryo bazında yıllık gelir patikası (hedef 2028) ---------- */
export function scenarioLinesOption(data: {
  years: string[];
  targetYear: string;
  scenarios: { label: string; revenue: number[] }[];
}): EChartsCoreOption {
  const colors = [C.warn, C.gold, C.grass];
  return {
    aria,
    textStyle,
    grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
    legend: { top: 0, textStyle: { color: C.inkMuted, fontFamily: FONT }, itemWidth: 14, itemHeight: 10 },
    tooltip: {
      ...tooltipBase,
      trigger: "axis",
      formatter: (ps: any) => `<b>${ps[0].axisValue}</b><br/>` + ps.map((p: any) => `${p.marker} ${p.seriesName}: <b>${fmt(p.value)}</b>`).join("<br/>"),
    },
    xAxis: { type: "category", boundaryGap: false, data: data.years, axisLabel, axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: { ...axisLabel, formatter: (v: number) => fmt(v) }, splitLine },
    series: data.scenarios.map((s, i) => ({
      name: s.label,
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { color: colors[i], width: 3 },
      itemStyle: { color: colors[i] },
      data: s.revenue,
      ...(i === 1
        ? {
            markLine: {
              silent: true,
              symbol: "none",
              lineStyle: { type: "dashed", color: C.ink, width: 1.5 },
              label: { formatter: `Hedef · ${data.targetYear}`, color: C.ink, fontFamily: FONT, fontWeight: 600, position: "insideEndTop" },
              data: [{ xAxis: data.targetYear }],
            },
          }
        : {}),
    })),
  };
}

/* ---------- Finansal kombine: gelir/gider bar + net çizgi ---------- */
export function financialComboOption(y: FinancialYear[]): EChartsCoreOption {
  return {
    aria,
    textStyle,
    grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
    legend: { top: 0, textStyle: { color: C.inkMuted, fontFamily: FONT }, itemWidth: 14, itemHeight: 10 },
    tooltip: { ...tooltipBase, trigger: "axis", formatter: (ps: any) => `<b>${ps[0].axisValue}</b><br/>` + ps.map((p: any) => `${p.marker} ${p.seriesName}: <b>${fmt(p.value)}</b>`).join("<br/>") },
    xAxis: { type: "category", data: y.map((d) => d.year), axisLabel, axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: { ...axisLabel, formatter: (v: number) => fmt(v) }, splitLine },
    series: [
      { name: "Gelir", type: "bar", data: y.map((d) => d.revenue), itemStyle: { color: C.grassBright, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 28 },
      { name: "Gider", type: "bar", data: y.map((d) => d.expense), itemStyle: { color: C.warn, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 28 },
      { name: "Net", type: "line", data: y.map((d) => d.net), smooth: true, symbol: "circle", symbolSize: 7, lineStyle: { color: C.gold, width: 3 }, itemStyle: { color: C.gold } },
    ],
  };
}

/* ---------- Nakit alanı + kadro (çift eksen) ---------- */
export function cashHeadcountOption(y: FinancialYear[]): EChartsCoreOption {
  return {
    aria,
    textStyle,
    grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
    legend: { top: 0, textStyle: { color: C.inkMuted, fontFamily: FONT }, itemWidth: 14, itemHeight: 10 },
    tooltip: {
      ...tooltipBase,
      trigger: "axis",
      formatter: (ps: any) =>
        `<b>${ps[0].axisValue}</b><br/>` +
        ps.map((p: any) => `${p.marker} ${p.seriesName}: <b>${p.seriesName === "Kadro" ? p.value + " kişi" : fmt(p.value)}</b>`).join("<br/>"),
    },
    xAxis: { type: "category", data: y.map((d) => d.year), axisLabel, axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false } },
    yAxis: [
      { type: "value", axisLabel: { ...axisLabel, formatter: (v: number) => fmt(v) }, splitLine },
      { type: "value", name: "kişi", position: "right", axisLabel: { ...axisLabel, formatter: "{value}" }, splitLine: { show: false }, nameTextStyle: { color: C.inkMuted, fontFamily: FONT } },
    ],
    series: [
      {
        name: "Yıl sonu nakit",
        type: "line",
        areaStyle: { color: "rgba(124,179,66,0.18)" },
        smooth: true,
        symbol: "none",
        lineStyle: { color: C.grass, width: 3 },
        data: y.map((d) => d.cashEnd),
      },
      {
        name: "Kadro",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { color: C.gold, width: 2 },
        itemStyle: { color: C.gold },
        data: y.map((d) => d.headcount),
      },
    ],
  };
}

/* ---------- Net kâr marjı (net/gelir) ---------- */
export function marginOption(y: FinancialYear[]): EChartsCoreOption {
  const rows = y.filter((d) => d.revenue > 0);
  return {
    aria,
    textStyle,
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    tooltip: { ...tooltipBase, trigger: "axis", formatter: (ps: any) => `<b>${ps[0].axisValue}</b><br/>Net marj: <b>%${ps[0].value}</b>` },
    xAxis: { type: "category", data: rows.map((d) => d.year), axisLabel, axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: { ...axisLabel, formatter: "%{value}" }, splitLine, max: 100 },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { color: C.gold, width: 3 },
        itemStyle: { color: C.gold },
        areaStyle: { color: "rgba(204,153,0,0.12)" },
        label: { show: true, formatter: (p: any) => `%${p.value}`, color: C.goldText, fontFamily: FONT, fontWeight: 600, position: "top" },
        data: rows.map((d) => Math.round((d.net / d.revenue) * 100)),
      },
    ],
  };
}

/* ---------- Kadro büyümesi (yıllara göre) ---------- */
export function headcountGrowthOption(rows: { year: string; count: number }[]): EChartsCoreOption {
  return {
    aria,
    textStyle,
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    tooltip: { ...tooltipBase, trigger: "axis", formatter: (p: any) => `<b>${p[0].axisValue}</b><br/>${p[0].value} kişi` },
    xAxis: { type: "category", data: rows.map((r) => r.year), axisLabel, axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false } },
    yAxis: { type: "value", name: "kişi", axisLabel, splitLine, nameTextStyle: { color: C.inkMuted, fontFamily: FONT } },
    series: [
      {
        type: "bar",
        barWidth: "52%",
        data: rows.map((r) => r.count),
        itemStyle: { color: C.grassBright, borderRadius: [6, 6, 0, 0] },
        label: { show: true, position: "top", formatter: (p: any) => `${p.value}`, color: C.ink, fontFamily: FONT, fontWeight: 600 },
      },
    ],
  };
}

/* ---------- Başabaş şelalesi (waterfall) ---------- */
export function basabasWaterfallOption(steps: { name: string; delta: number; kind: "start" | "down" | "end" }[]): EChartsCoreOption {
  // running base for floating bars
  const bases: number[] = [];
  const values: number[] = [];
  const colors: string[] = [];
  let run = 0;
  for (const s of steps) {
    if (s.kind === "start") {
      bases.push(0); values.push(s.delta); colors.push(C.grass); run = s.delta;
    } else if (s.kind === "down") {
      run += s.delta; // delta negative
      bases.push(run); values.push(-s.delta); colors.push(C.warn);
    } else {
      bases.push(0); values.push(run); colors.push(C.gold);
    }
  }
  return {
    aria,
    textStyle,
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    tooltip: {
      ...tooltipBase,
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (p: any) => {
        const i = p[0].dataIndex;
        return `<b>${steps[i].name}</b><br/>${steps[i].kind === "down" ? "−" : ""}${fmt(Math.abs(steps[i].delta || values[i]))}`;
      },
    },
    xAxis: { type: "category", data: steps.map((s) => s.name), axisLabel: { ...axisLabel, interval: 0, lineHeight: 14 }, axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: { ...axisLabel, formatter: (v: number) => fmt(v) }, splitLine },
    series: [
      { type: "bar", stack: "wf", itemStyle: { color: "transparent" }, emphasis: { itemStyle: { color: "transparent" } }, data: bases, silent: true, tooltip: { show: false } },
      {
        type: "bar",
        stack: "wf",
        data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] } })),
        barWidth: "52%",
        label: { show: true, position: "top", formatter: (p: any) => fmt(Math.abs(steps[p.dataIndex].kind === "down" ? steps[p.dataIndex].delta : p.value)), color: C.ink, fontFamily: FONT, fontWeight: 600 },
      },
    ],
  };
}

/* ---------- İlk 36 ay · aylık gelir/gider + kümülatif nakit ---------- */
export function monthlyEarlyOption(rows: { label: string; gelir: number; gider: number; nakit: number }[]): EChartsCoreOption {
  return {
    aria,
    textStyle,
    grid: { left: 8, right: 8, top: 40, bottom: 8, containLabel: true },
    legend: { top: 0, textStyle: { color: C.inkMuted, fontFamily: FONT }, itemWidth: 14, itemHeight: 10 },
    tooltip: {
      ...tooltipBase,
      trigger: "axis",
      formatter: (ps: any) => `<b>${ps[0].axisValue}</b><br/>` + ps.map((p: any) => `${p.marker} ${p.seriesName}: <b>${fmt(p.value)}</b>`).join("<br/>"),
    },
    xAxis: {
      type: "category",
      data: rows.map((r) => r.label),
      axisLabel: { ...axisLabel, fontSize: 10, interval: 2, rotate: 45 },
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
    },
    yAxis: [
      { type: "value", axisLabel: { ...axisLabel, formatter: (v: number) => fmt(v) }, splitLine },
      { type: "value", position: "right", axisLabel: { ...axisLabel, formatter: (v: number) => fmt(v) }, splitLine: { show: false } },
    ],
    series: [
      { name: "Aylık gelir", type: "bar", data: rows.map((r) => r.gelir), itemStyle: { color: C.grassBright }, barMaxWidth: 12 },
      { name: "Aylık gider", type: "bar", data: rows.map((r) => r.gider), itemStyle: { color: C.warn }, barMaxWidth: 12 },
      {
        name: "Kümülatif nakit",
        type: "line",
        yAxisIndex: 1,
        data: rows.map((r) => r.nakit),
        smooth: true,
        symbol: "none",
        lineStyle: { color: C.gold, width: 2.5 },
        areaStyle: { color: "rgba(204,153,0,0.10)" },
      },
    ],
  };
}

/* ---------- AI/İK: departman bazında AI'sız vs AI ile FTE ---------- */
export function aiDeptOption(d: { dept: string; without: number; with: number }[]): EChartsCoreOption {
  return {
    aria,
    textStyle,
    grid: { left: 8, right: 24, top: 36, bottom: 8, containLabel: true },
    legend: { top: 0, textStyle: { color: C.inkMuted, fontFamily: FONT }, itemWidth: 14, itemHeight: 10 },
    tooltip: { ...tooltipBase, trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: { type: "value", axisLabel, splitLine, name: "kişi (FTE)", nameLocation: "end", nameTextStyle: { color: C.inkMuted, fontFamily: FONT } },
    yAxis: { type: "category", data: d.map((x) => x.dept), axisLabel: { ...axisLabel, fontSize: 11 }, axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false } },
    series: [
      { name: "AI'sız", type: "bar", data: d.map((x) => x.without), itemStyle: { color: C.inkMuted, borderRadius: [0, 4, 4, 0] }, barGap: "10%" },
      { name: "AI ile", type: "bar", data: d.map((x) => x.with), itemStyle: { color: C.grass, borderRadius: [0, 4, 4, 0] } },
    ],
  };
}
