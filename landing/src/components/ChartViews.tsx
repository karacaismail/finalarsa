import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { getData, getMetric } from "../data/resolve";
import type { FinancialYear } from "../data/types";
import { Dd, Dl, Dt, Flex, Grid, H3, P, Stack, Tbl, Tbody, Td, Th, Thead, Tr } from "../ui";
import { EChart } from "./EChart";
import {
  aiDeptOption,
  basabasWaterfallOption,
  cashHeadcountOption,
  fmt,
  financialComboOption,
  headcountGrowthOption,
  marginOption,
  marketFunnelOption,
  monthlyEarlyOption,
  scenarioLinesOption,
} from "./charts";

const fmtTRY = (n: number) => fmt(n);

const card = {
  border: "1px solid",
  borderColor: "line",
  borderRadius: "surface",
  bg: "paper",
  p: { base: "5", md: "6" },
} as const;

/* ---------------- Pazar: değer hunisi ---------------- */
export function MarketFunnelView() {
  const d = getData<{
    valueFunnel: { tam: { value: number }; sam: { value: number }; som: { value: number }; annualRevenuePotential: { value: number } };
  }>("market-tam-sam-som");
  const f = d.valueFunnel;
  return (
    <EChart
      height={340}
      ariaLabel={`Pazar hunisi: TAM ${fmt(f.tam.value)}, SAM ${fmt(f.sam.value)}, SOM ${fmt(f.som.value)}, yıllık gelir potansiyeli ${fmt(f.annualRevenuePotential.value)}`}
      option={marketFunnelOption({ tam: f.tam.value, sam: f.sam.value, som: f.som.value, revenue: f.annualRevenuePotential.value })}
    />
  );
}

/* ---------------- Senaryo bazında yıllık gelir + pazar payı (hedef 2028) ---------------- */
export function ScenarioYearsView() {
  const d = getData<{
    scenariosByYear: {
      years: string[];
      targetYear: string;
      scenarios: { label: string; revenue: number[]; shareOfSam: number[] }[];
    };
  }>("market-tam-sam-som");
  const s = d.scenariosByYear;
  const toneFor = (i: number) => ["warn", "gold", "grass"][i] ?? "ink";
  const pct = (x: number) => `%${(x * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;
  return (
    <Stack gap="4">
      <EChart
        height={360}
        ariaLabel="Senaryo bazında yıllık gelir patikası; hedef 2028'de tutturulur"
        option={scenarioLinesOption({ years: s.years, targetYear: s.targetYear, scenarios: s.scenarios })}
      />
      <Box {...card} p="0" overflowX="auto">
        <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="620px">
          <Thead>
            <Tr>
              <Th scope="col" textAlign="start" p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold">Yıl</Th>
              {s.scenarios.map((sc, i) => (
                <Th key={sc.label} scope="col" textAlign="end" p="3" borderBottom="2px solid" borderColor="lineStrong" color={toneFor(i)} fontWeight="bold">
                  {sc.label}
                  <Box as="span" display="block" fontSize="md" fontWeight="normal" color="inkMuted">online arsa payı · gelir</Box>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {s.years.map((yr, yi) => {
              const isTarget = yr === s.targetYear;
              return (
                <Tr key={yr} {...(isTarget ? { bg: "surface" } : {})}>
                  <Th scope="row" textAlign="start" p="3" borderBottom="1px solid" borderColor="line" color="ink" fontWeight="bold" whiteSpace="nowrap">
                    {yr}{isTarget ? " · hedef" : ""}
                  </Th>
                  {s.scenarios.map((sc, i) => (
                    <Td key={sc.label} p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink" whiteSpace="nowrap">
                      <Box as="span" color={toneFor(i)} fontWeight="bold">{pct(sc.shareOfSam[yi])}</Box>
                      <Box as="span" color="inkMuted"> · {fmt(sc.revenue[yi])}</Box>
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Tbl>
      </Box>
    </Stack>
  );
}

/* ---------------- Finansal: kombine grafik + erişilebilir tablo ---------------- */
export function YearlyView({ highlightYears }: { highlightYears?: string[] }) {
  const d = getData<{ yearly: FinancialYear[] }>("financial-model");
  const rows = highlightYears ? d.yearly.filter((y) => highlightYears.includes(y.year)) : d.yearly;
  return (
    <Stack gap="4">
      <EChart
        height={380}
        ariaLabel="Yıllık gelir, gider ve net kâr (2026 H2 – 2032)"
        option={financialComboOption(d.yearly)}
      />
      <Box {...card} p="0" overflowX="auto">
        <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="640px">
          <Thead>
            <Tr>
              {["Yıl", "Gelir", "Gider", "Net", "Kadro", "Yıl sonu nakit"].map((h, i) => (
                <Th key={h} scope="col" textAlign={i === 0 ? "start" : "end"} p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold" whiteSpace="nowrap">
                  {h}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((y) => (
              <Tr key={y.year}>
                <Th scope="row" textAlign="start" p="3" borderBottom="1px solid" borderColor="line" color="ink" fontWeight="bold" whiteSpace="nowrap">{y.year}</Th>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{fmt(y.revenue)}</Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="inkMuted">{fmt(y.expense)}</Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color={y.net < 0 ? "warn" : "grass"} fontWeight="medium" whiteSpace="nowrap">
                  {y.net < 0 ? "−" : "+"}{fmt(Math.abs(y.net))}
                </Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{y.headcount}</Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{fmt(y.cashEnd)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Tbl>
      </Box>
    </Stack>
  );
}

/* ---------------- Nakit + kadro ---------------- */
export function CashTeamView() {
  const d = getData<{ yearly: FinancialYear[] }>("financial-model");
  return (
    <EChart height={340} ariaLabel="Yıl sonu nakit ve kadro büyümesi" option={cashHeadcountOption(d.yearly)} />
  );
}

/* ---------------- Kâr marjı (EBITDA vekili) ---------------- */
export function MarginView() {
  const d = getData<{ yearly: FinancialYear[] }>("financial-model");
  return <EChart height={300} ariaLabel="Net kâr marjı yıllara göre" option={marginOption(d.yearly)} />;
}

/* ---------------- Cephane: 6 silah kartı ---------------- */
export function WeaponGrid() {
  const d = getData<{ heroWeapons: { idx: string; name: string; tr: string; badge: string; body: string; example: string }[] }>("strategy-arsenal");
  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="4">
      {d.heroWeapons.map((w) => (
        <Stack key={w.idx} {...card} gap="2">
          <Flex align="baseline" gap="2">
            <P color="grass" fontWeight="bold" fontFamily="mono">{w.idx}</P>
            <H3 fontSize="lg" fontWeight="bold" color="ink" m="0">{w.name}</H3>
          </Flex>
          <P fontSize="md" color="inkMuted" fontStyle="italic">{w.tr}</P>
          <P color="ink">{w.body}</P>
          <P fontSize="md" color="inkMuted">Örnek: {w.example}</P>
        </Stack>
      ))}
    </Grid>
  );
}

/* ---------------- AI-FIRST PANEL ---------------- */
export function AiFirstPanel() {
  const d = getData<{
    aiEfficiency: {
      fteWithout: number; fteWith: number; fteSaved: number; annualSaving: number;
      sahibindenBenchmark: string; target2032: string;
      departments: { dept: string; without: number; with: number; tools: string }[];
    };
  }>("hr-plan");
  const ai = d.aiEfficiency;
  const lean = getMetric("team.lean");
  const stat = (label: string, value: string, color = "ink") => (
    <Box {...card} flex="1" minW="150px">
      <Dt fontSize="md" color="inkMuted" mb="1">{label}</Dt>
      <Dd m="0" fontSize="2xl" fontWeight="bold" color={color}>{value}</Dd>
    </Box>
  );
  return (
    <Box as="section" aria-labelledby="ai-first-title" bg="paperWarm" borderTop="1px solid" borderColor="line">
      <Box maxW="1100px" mx="auto" px={{ base: "5", md: "8" }} py={{ base: "12", md: "16" }}>
        <P color="grass" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em" fontSize="md" mb="2">
          AI-first operasyon
        </P>
        <H3 as="h2" id="ai-first-title" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="ink" lineHeight="1.15" m="0">
          Aynı işi {ai.fteWith} kişiyle. {lean?.display ?? "7 kişi"} çekirdek, 700 kişinin işi.
        </H3>
        <P color="inkMuted" mt="3" maxW="680px" fontSize="lg">
          Panel, ilan, doğrulama ve operasyonun büyük kısmını AI ajanları yürütür; insan yalnız denetler ve karar verir.
          sahibinden ölçeği {ai.sahibindenBenchmark}; arsam.net hedefi {ai.target2032}.
        </P>
        <Dl display="flex" gap="4" mt="6" mb="8" flexWrap="wrap" m="0">
          {stat("AI'sız gerekli kadro", `${ai.fteWithout} kişi`, "inkMuted")}
          {stat("AI ile gerekli kadro", `${ai.fteWith} kişi`, "grass")}
          {stat("Tasarruf edilen kadro", `${ai.fteSaved} kişi`, "ink")}
          {stat("Yıllık tasarruf", fmt(ai.annualSaving), "gold")}
        </Dl>
        <H3 fontSize="md" color="inkMuted" fontWeight="medium" mb="2">Departman bazında insan kaynağı: AI'sız vs AI ile (FTE)</H3>
        <EChart
          height={Math.max(340, ai.departments.length * 34)}
          ariaLabel={"Departman bazında AI'sız ve AI ile gerekli kadro karşılaştırması"}
          option={aiDeptOption(ai.departments.map((r) => ({ dept: r.dept, without: r.without, with: r.with })))}
        />
        <Box {...card} p="0" overflowX="auto" mt="4">
          <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="520px">
            <Thead>
              <Tr>
                {["Departman", "AI'sız", "AI ile", "Araçlar"].map((h, i) => (
                  <Th key={h} scope="col" textAlign={i === 0 || i === 3 ? "start" : "center"} p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold">{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {ai.departments.map((r) => (
                <Tr key={r.dept}>
                  <Th scope="row" textAlign="start" p="3" borderBottom="1px solid" borderColor="line" color="ink" fontWeight="medium">{r.dept}</Th>
                  <Td p="3" textAlign="center" borderBottom="1px solid" borderColor="line" color="inkMuted">{r.without}</Td>
                  <Td p="3" textAlign="center" borderBottom="1px solid" borderColor="line" color="grass" fontWeight="medium">{r.with}</Td>
                  <Td p="3" textAlign="start" borderBottom="1px solid" borderColor="line" color="inkMuted">{r.tools}</Td>
                </Tr>
              ))}
            </Tbody>
          </Tbl>
        </Box>
      </Box>
    </Box>
  );
}

/* ---------------- AI verimlilik (departman) ---------------- */
export function AiEfficiencyView() {
  const d = getData<{ aiEfficiency: { departments: { dept: string; without: number; with: number }[] } }>("hr-plan");
  const deps = d.aiEfficiency.departments;
  return (
    <EChart
      height={Math.max(340, deps.length * 34)}
      ariaLabel="Departman bazında AI'sız ve AI ile gerekli kadro"
      option={aiDeptOption(deps.map((r) => ({ dept: r.dept, without: r.without, with: r.with })))}
    />
  );
}

/* ---------------- Kadro büyümesi ---------------- */
export function HeadcountView() {
  const d = getData<{ headcountGrowth: { year: string; count: number }[] }>("hr-plan");
  return <EChart height={320} ariaLabel="Kadro büyümesi yıllara göre" option={headcountGrowthOption(d.headcountGrowth)} />;
}

/* ---------------- Başabaş şelalesi ---------------- */
export function BasabasWaterfallView() {
  const d = getData<{ parameters: { initialCapital: number; capexFirstMonth: number } }>("financial-model");
  const cap = d.parameters.initialCapital;
  const capex = d.parameters.capexFirstMonth;
  const beSpend = Number(getMetric("capital.breakeven_spend")?.value ?? 15_000_000);
  const reserve = cap - beSpend;
  const opexToBE = beSpend - capex;
  const steps = [
    { name: "Sermaye girişi", delta: cap, kind: "start" as const },
    { name: "Kurulum + ekipman", delta: -capex, kind: "down" as const },
    { name: "İşletme + personel + pazarlama", delta: -opexToBE, kind: "down" as const },
    { name: "Başabaş sonrası kasa", delta: reserve, kind: "end" as const },
  ];
  return <EChart height={340} ariaLabel="Başabaşa kadar sermaye akışı" option={basabasWaterfallOption(steps)} />;
}

/* ---------------- İlan güven dosyası mock ---------------- */
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="11" fill="#eef5e3" />
      <path d="M7 12.5l3 3 7-7" fill="none" stroke="#4d7c1f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function PanelMockView() {
  const rows: [string, string][] = [
    ["Tapu doğrulama", "EİDS uyumlu"],
    ["İmar durumu", "konut imarlı"],
    ["Emsal m² fiyatı", "3.200 – 4.100 ₺"],
    ["Drone / yerinde keşif", "mevcut"],
    ["Kapora / emanet ödeme", "tapuya kadar güvende"],
  ];
  return (
    <Box {...card} maxW="560px">
      <Flex justify="space-between" align="center" mb="3" pb="3" borderBottom="1px solid" borderColor="line" gap="3">
        <Box>
          <P fontWeight="bold" color="ink" fontSize="lg">Söke · Arsa · 1.250 m²</P>
          <P fontSize="md" color="inkMuted">örnek ilan · güven dosyası</P>
        </Box>
        <Box as="span" px="2.5" py="1" borderRadius="full" bg="#eef5e3" color="grassInk" fontSize="md" fontWeight="medium" flexShrink="0">
          Doğrulandı
        </Box>
      </Flex>
      <Stack gap="3">
        {rows.map(([k, v]) => (
          <Flex key={k} align="center" gap="3">
            <CheckIcon />
            <P color="ink" flex="1">{k}</P>
            <P color="inkMuted" fontSize="md" textAlign="end">{v}</P>
          </Flex>
        ))}
      </Stack>
    </Box>
  );
}

/* ---------------- İlk 36 ay · aylık gelir/gider + nakit ---------------- */
export function MonthlyEarlyView() {
  const d = getData<{ monthly36: { label: string; gelir: number; gider: number; nakit: number }[] }>("financial-detail");
  return <EChart height={340} ariaLabel="İlk 36 ay aylık gelir, gider ve kümülatif nakit" option={monthlyEarlyOption(d.monthly36)} />;
}

/* ---------------- 2026 aylık işe alım ---------------- */
export function HeadcountMonthlyView() {
  const d = getData<{ monthly2026: { label: string; kadro: number }[] }>("financial-detail");
  return (
    <EChart
      height={280}
      ariaLabel="2026 aylık kadro büyümesi"
      option={headcountGrowthOption(d.monthly2026.map((m) => ({ year: m.label, count: m.kadro })))}
    />
  );
}

/* ---------------- Kademeli finansal tablo (2026 aylık → 2032 yıllık) ---------------- */
export function GraduatedFinancialView() {
  const d = getData<{
    graduated: { period: string; grain: string; gelir: number; gider: number; net: number; kadro: number; nakit: number }[];
  }>("financial-detail");
  const grainBg: Record<string, string> = { ay: "paper", çeyrek: "#faf9f5", yarıyıl: "#f6f5ef", yıl: "surface" };
  return (
    <Box {...card} p="0" overflowX="auto">
      <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="680px">
        <Thead>
          <Tr>
            {["Dönem", "Gelir", "Gider", "Net", "Kadro", "Dönem sonu nakit"].map((h, i) => (
              <Th key={h} scope="col" textAlign={i === 0 ? "start" : "end"} p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold" whiteSpace="nowrap">
                {h}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {d.graduated.map((r) => {
            const yearly = r.grain === "yıl";
            return (
              <Tr key={r.period} bg={grainBg[r.grain] ?? "paper"}>
                <Th scope="row" textAlign="start" p="3" borderBottom="1px solid" borderColor="line" color="ink" fontWeight={yearly ? "bold" : "medium"} whiteSpace="nowrap">
                  {r.period}
                  <Box as="span" ml="2" fontSize="md" fontWeight="normal" color="inkMuted">{r.grain}</Box>
                </Th>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{fmtTRY(r.gelir)}</Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="inkMuted">{fmtTRY(r.gider)}</Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color={r.net < 0 ? "warn" : "grass"} fontWeight="medium" whiteSpace="nowrap">
                  {r.net < 0 ? "−" : "+"}{fmtTRY(Math.abs(r.net))}
                </Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{r.kadro}</Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{fmtTRY(r.nakit)}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Tbl>
    </Box>
  );
}

/* Dispatcher */
export function ChartBlock({ chartType, highlightYears }: { chartType: string; highlightYears?: string[] }): ReactNode {
  switch (chartType) {
    case "funnel":
      return <MarketFunnelView />;
    case "scenarioYears":
      return <ScenarioYearsView />;
    case "monthlyEarly":
      return <MonthlyEarlyView />;
    case "graduatedFinancial":
      return <GraduatedFinancialView />;
    case "headcountMonthly":
      return <HeadcountMonthlyView />;
    case "aiEfficiency":
      return <AiEfficiencyView />;
    case "headcountGrowth":
      return <HeadcountView />;
    case "basabasWaterfall":
      return <BasabasWaterfallView />;
    case "panelMock":
      return <PanelMockView />;
    case "yearlyHighlights":
    case "yearlyTable":
      return <YearlyView highlightYears={highlightYears} />;
    case "cashTeam":
      return <CashTeamView />;
    case "ebitda":
      return <MarginView />;
    case "weaponGrid":
      return <WeaponGrid />;
    default:
      return null;
  }
}
