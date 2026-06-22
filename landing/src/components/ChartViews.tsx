import { Box } from "@chakra-ui/react";
import { useState } from "react";
import type { ReactNode } from "react";
import { getData, getMetric } from "../data/resolve";
import type { FinancialYear } from "../data/types";
import { Dd, Dl, Dt, Flex, Grid, H3, P, Stack, Tbl, Tbody, Td, Th, Thead, Tr } from "../ui";
import { EChart } from "./EChart";
import {
  aiDeptOption,
  basabasWaterfallOption,
  breakevenOption,
  capexBreakdownOption,
  cashHeadcountOption,
  fmt,
  financialComboOption,
  headcountGrowthOption,
  marginOption,
  marketFunnelOption,
  monthlyEarlyOption,
  monthlySplitOption,
  opexCompositionOption,
  revenueStreamsOption,
  scenarioLinesOption,
} from "./charts";
import { TaxSliderView } from "./TaxSlider";
import { chartCard as card, listingCard, verifiedBadge, checkIcon, grainBg } from "../theme/components";
import { MobileTableCards } from "./MobileTableCards";

const fmtTRY = (n: number) => fmt(n);

/** Net değer hücresi (işaretli + renkli) — mobil kart ve masaüstü tablo ortak biçimi. */
const netCell = (net: number) => (
  <Box as="span" color={net < 0 ? "warn" : "grass"} fontWeight="medium" whiteSpace="nowrap">
    {net < 0 ? "−" : "+"}
    {fmtTRY(Math.abs(net))}
  </Box>
);

/* Söke kartı: panel stili + ayraç rengini ayır (divider, Box prop'u değil). */
const { divider: listingDivider, ...listingCardBox } = listingCard;

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
      <Box {...card} p="0" overflowX="auto" display={{ base: "none", md: "block" }}>
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
      <Box display={{ base: "block", md: "none" }}>
        <MobileTableCards
          columns={["Yıl", ...s.scenarios.map((sc) => sc.label)]}
          rows={s.years.map((yr, yi) => [
            <>
              {yr}
              {yr === s.targetYear ? " · hedef" : ""}
            </>,
            ...s.scenarios.map((sc, i) => (
              <Box as="span">
                <Box as="span" color={toneFor(i)} fontWeight="bold">
                  {pct(sc.shareOfSam[yi])}
                </Box>
                <Box as="span" color="inkMuted">
                  {" · "}
                  {fmt(sc.revenue[yi])}
                </Box>
              </Box>
            )),
          ])}
        />
      </Box>
    </Stack>
  );
}

/* ---------------- Gelir akışları: 2032 medyan kırılımı + yıllara göre tablo ---------------- */
type RevStream = { key: string; label: string; y2032_medyan: number; byYearMedyan: Record<string, number> };
export function RevenueStreamsView() {
  const d = getData<{
    revenueStreams: {
      streams: RevStream[];
      scenarioMultipliers: { kotumser: number; medyan: number; iyimser: number };
      totalByYear: { kotumser: Record<string, number>; medyan: Record<string, number>; iyimser: Record<string, number> };
    };
  }>("financial-breakdown");
  const rs = d.revenueStreams;
  const SCEN = [
    { key: "kotumser" as const, label: "Kötümser" },
    { key: "medyan" as const, label: "Medyan" },
    { key: "iyimser" as const, label: "İyimser" },
  ];
  const [scen, setScen] = useState<"kotumser" | "medyan" | "iyimser">("medyan");
  const mult = rs.scenarioMultipliers[scen];
  const scenLabel = (SCEN.find((s) => s.key === scen)?.label ?? "Medyan").toLowerCase();
  const streams = [...rs.streams].sort((a, b) => b.y2032_medyan - a.y2032_medyan);
  const total2032 = rs.totalByYear.medyan["2032"];
  const cols = ["2027", "2029", "2031", "2032"];
  const pct = (x: number) => `%${(x * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;
  const sval = (s: RevStream, c: string) => Math.round((s.byYearMedyan[c] ?? 0) * mult);
  return (
    <Stack gap="4">
      <Flex gap="2" wrap="wrap" role="tablist" aria-label="Senaryo seç">
        {SCEN.map((s) => (
          <Box as="button" key={s.key} role="tab" aria-selected={s.key === scen} onClick={() => setScen(s.key)} px="4" py="2" borderRadius="full" fontWeight="medium" fontSize="md" cursor="pointer" bg={s.key === scen ? "grass" : "surface"} color={s.key === scen ? "white" : "inkMuted"} border="1px solid" borderColor={s.key === scen ? "grass" : "line"}>
            {s.label}
          </Box>
        ))}
      </Flex>
      <EChart
        height={Math.max(320, streams.length * 46)}
        ariaLabel={`Gelir akışlarının 2032 ${scenLabel} hedefleri; ParselQ-RFQ en büyük akış`}
        option={revenueStreamsOption(streams.map((s) => ({ label: s.label, value: Math.round(s.y2032_medyan * mult), flagship: s.key === "rfq" })))}
      />
      <Box {...card} p="0" overflowX="auto" display={{ base: "none", md: "block" }}>
        <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="640px">
          <Thead>
            <Tr>
              <Th scope="col" textAlign="start" p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold">Gelir akışı</Th>
              {cols.map((c) => (
                <Th key={c} scope="col" textAlign="end" p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold" whiteSpace="nowrap">{c} {scenLabel}</Th>
              ))}
              <Th scope="col" textAlign="end" p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold" whiteSpace="nowrap">2032 pay</Th>
            </Tr>
          </Thead>
          <Tbody>
            {streams.map((s) => {
              const flag = s.key === "rfq";
              return (
                <Tr key={s.key} {...(flag ? { bg: "surface" } : {})}>
                  <Th scope="row" textAlign="start" p="3" borderBottom="1px solid" borderColor="line" color={flag ? "goldText" : "ink"} fontWeight="bold" whiteSpace="nowrap">
                    {s.label}{flag ? " · amiral" : ""}
                  </Th>
                  {cols.map((c) => (
                    <Td key={c} p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink" whiteSpace="nowrap">{fmt(sval(s, c))}</Td>
                  ))}
                  <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color={flag ? "goldText" : "inkMuted"} fontWeight={flag ? "bold" : "normal"} whiteSpace="nowrap">{pct(s.y2032_medyan / total2032)}</Td>
                </Tr>
              );
            })}
            <Tr bg="surface">
              <Th scope="row" textAlign="start" p="3" borderTop="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold">Toplam ({scenLabel})</Th>
              {cols.map((c) => (
                <Td key={c} p="3" textAlign="end" borderTop="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold" whiteSpace="nowrap">{fmt(rs.totalByYear[scen][c] ?? 0)}</Td>
              ))}
              <Td p="3" textAlign="end" borderTop="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold">%100</Td>
            </Tr>
          </Tbody>
        </Tbl>
      </Box>
      <Box display={{ base: "block", md: "none" }}>
        <MobileTableCards
          columns={["Gelir akışı", ...cols.map((c) => `${c} ${scenLabel}`), "2032 pay"]}
          rows={streams.map((s) => [
            <>{s.label}{s.key === "rfq" ? " · amiral" : ""}</>,
            ...cols.map((c) => <>{fmt(sval(s, c))}</>),
            <>{pct(s.y2032_medyan / total2032)}</>,
          ])}
        />
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
      <Box {...card} p="0" overflowX="auto" display={{ base: "none", md: "block" }}>
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
      <Box display={{ base: "block", md: "none" }}>
        <MobileTableCards
          columns={["Yıl", "Gelir", "Gider", "Net", "Kadro", "Yıl sonu nakit"]}
          rows={rows.map((y) => [
            y.year,
            fmtTRY(y.revenue),
            <Box as="span" color="inkMuted">{fmtTRY(y.expense)}</Box>,
            netCell(y.net),
            `${y.headcount} kişi`,
            fmtTRY(y.cashEnd),
          ])}
          primary={[1, 3]}
          detail={[2, 4, 5]}
        />
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
      sahibindenBenchmark: string; target2031: string;
      departments: { dept: string; without: number; with: number; tools: string }[];
    };
  }>("hr-plan");
  const ai = d.aiEfficiency;
  const stat = (label: string, value: string, color = "ink") => (
    <Box {...card} flex="1" minW="150px">
      <Dt fontSize="md" color="inkMuted" mb="1">{label}</Dt>
      <Dd m="0" fontSize="2xl" fontWeight="bold" color={color}>{value}</Dd>
    </Box>
  );
  return (
    <Box as="section" aria-labelledby="ai-first-title" bg="paperWarm" borderTop="1px solid" borderColor="line">
      <Box maxW="1200px" mx="auto" px={{ base: "5", md: "8" }} py={{ base: "12", md: "16" }}>
        <P color="grass" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em" fontSize="md" mb="2">
          AI-first operasyon
        </P>
        <H3 as="h2" id="ai-first-title" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="ink" lineHeight="1.15" m="0">
          Aynı işi {ai.fteWith} kişiyle — AI'sız ~{ai.fteWithout} kişi gerekirdi (~2,1× kaldıraç).
        </H3>
        <P color="inkMuted" mt="3" maxW="680px" fontSize="lg">
          Panel, ilan, doğrulama ve operasyonun büyük kısmını AI ajanları yürütür; insan yalnız denetler ve karar verir.
          sahibinden ölçeği {ai.sahibindenBenchmark}; arsam.net hedefi {ai.target2031}.
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
        <Box {...card} p="0" overflowX="auto" mt="4" display={{ base: "none", md: "block" }}>
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
        <Box display={{ base: "block", md: "none" }} mt="4">
          <MobileTableCards
            columns={["Departman", "AI'sız", "AI ile", "Araçlar"]}
            rows={ai.departments.map((r) => [
              r.dept,
              <Box as="span" color="inkMuted">{r.without}</Box>,
              <Box as="span" color="grass" fontWeight="medium">{r.with}</Box>,
              <Box as="span" color="inkMuted">{r.tools}</Box>,
            ])}
            primary={[2, 1]}
            detail={[3]}
          />
        </Box>
      </Box>
    </Box>
  );
}

/* ---------------- AI verimlilik (departman) — mobile-first ---------------- */
/**
 * Mobilde (base, <md) ECharts yatay barı uzun TR departman adlarını kırpıyordu.
 * Çözüm: base'te grafiği GİZLE, yerine kompakt kart listesi göster — her departman
 * tam adıyla (wrap'li, kırpılmadan) + AI'sız / AI ile / Tasarruf rakamları ve
 * iki katmanlı (AI'sız zemin · AI ile dolu) oran çubuğu. md+ tarafında mevcut
 * grafik aynen kalır (display={{ base, md }} ile JS'siz, flash'sız geçiş).
 */
function AiDeptMobileCards({ deps }: { deps: { dept: string; without: number; with: number }[] }) {
  const maxWithout = Math.max(1, ...deps.map((r) => r.without));
  return (
    <Stack gap="3">
      {deps.map((r) => {
        const saved = r.without - r.with;
        // Çubuk: AI'sız tam genişliği maksimuma göre; AI ile o çubuğun içinde dolu kısım.
        const withoutPct = (r.without / maxWithout) * 100;
        const withPct = r.without > 0 ? (r.with / r.without) * 100 : 0;
        return (
          <Box key={r.dept} as="article" {...card} p="4">
            <P fontSize="md" fontWeight="bold" color="ink" lineHeight="1.3" m="0">
              {r.dept}
            </P>
            <Flex gap="3" wrap="wrap" mt="2" mb="3" fontSize="md">
              <Box as="span" color="inkMuted">
                AI'sız: <Box as="span" fontWeight="bold" color="ink">{r.without}</Box>
              </Box>
              <Box as="span" color="inkMuted">·</Box>
              <Box as="span" color="inkMuted">
                AI ile: <Box as="span" fontWeight="bold" color="grass">{r.with}</Box>
              </Box>
              <Box as="span" color="inkMuted">·</Box>
              <Box as="span" color="inkMuted">
                Tasarruf:{" "}
                <Box as="span" fontWeight="bold" color={saved > 0 ? "gold" : "inkMuted"}>
                  {saved > 0 ? `−${saved}` : "0"}
                </Box>
              </Box>
            </Flex>
            {/* Oran çubuğu: dış (AI'sız, gri) maksimuma orantılı; iç (AI ile, yeşil) AI'sızın içinde */}
            <Box
              aria-hidden="true"
              h="8px"
              borderRadius="full"
              bg="surface"
              overflow="hidden"
              w={`${Math.max(8, withoutPct)}%`}
            >
              <Box h="100%" borderRadius="full" bg="grass" w={`${withPct}%`} minW={r.with > 0 ? "4px" : "0"} />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

export function AiEfficiencyView() {
  const d = getData<{ aiEfficiency: { departments: { dept: string; without: number; with: number; tools: string }[] } }>("hr-plan");
  const deps = d.aiEfficiency.departments;
  return (
    <>
      {/* Mobil: kompakt kart listesi (tam ad, kırpma yok) */}
      <Box display={{ base: "block", md: "none" }}>
        <AiDeptMobileCards deps={deps} />
      </Box>
      {/* md+: mevcut ECharts grafiği */}
      <Box display={{ base: "none", md: "block" }}>
        <EChart
          height={Math.max(340, deps.length * 34)}
          ariaLabel="Departman bazında AI'sız ve AI ile gerekli kadro"
          option={aiDeptOption(deps.map((r) => ({ dept: r.dept, without: r.without, with: r.with })))}
        />
      </Box>
    </>
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
      <circle cx="12" cy="12" r="11" fill={checkIcon.circle} />
      <path d="M7 12.5l3 3 7-7" fill="none" stroke={checkIcon.stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
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
    <Box {...card} {...listingCardBox} maxW="560px">
      <Flex justify="space-between" align="center" mb="3" pb="3" borderBottom="1px solid" borderColor={listingDivider} gap="3">
        <Box>
          <P fontWeight="bold" color="ink" fontSize="lg">Söke · Arsa · 1.250 m²</P>
          <P fontSize="md" color="inkMuted">örnek ilan · güven dosyası</P>
        </Box>
        <Box as="span" px="2.5" py="1" borderRadius="full" bg={verifiedBadge.bg} color={verifiedBadge.color} fontSize="md" fontWeight="medium" flexShrink="0">
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

/* ---------------- Yıllık gelir/gider/net (yalnız grafik) ---------------- */
export function YearlyComboView() {
  const d = getData<{ yearly: FinancialYear[] }>("financial-model");
  return <EChart height={360} ariaLabel="Yıllık gelir, gider ve net kâr" option={financialComboOption(d.yearly)} />;
}

/* ---------------- Kademeli finansal tablo (2026 aylık → 2032 yıllık) ---------------- */
export function GraduatedFinancialView() {
  const d = getData<{
    graduated: { period: string; grain: string; gelir: number; gider: number; net: number; kadro: number; nakit: number }[];
  }>("financial-detail");
  // grainBg (dönem zemini) merkezi: src/theme/components.ts
  return (
    <>
    <Box {...card} p="0" overflowX="auto" display={{ base: "none", md: "block" }}>
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
    <Box display={{ base: "block", md: "none" }}>
      <MobileTableCards
        columns={["Dönem", "Gelir", "Gider", "Net", "Kadro", "Dönem sonu nakit"]}
        rows={d.graduated.map((r) => [
          <>
            {r.period}
            <Box as="span" ml="2" fontSize="md" fontWeight="normal" color="inkMuted">{r.grain}</Box>
          </>,
          fmtTRY(r.gelir),
          <Box as="span" color="inkMuted">{fmtTRY(r.gider)}</Box>,
          netCell(r.net),
          `${r.kadro} kişi`,
          fmtTRY(r.nakit),
        ])}
        primary={[1, 3]}
        detail={[2, 4, 5]}
      />
    </Box>
    </>
  );
}

/* ---------------- İlk ay · CAPEX kategori kırılımı (grafik + tablo) ---------------- */
export function CapexView() {
  const d = getData<{ capex: { total: number; firstMonthShare: number; byCategory: { kat: string; tutar: number }[]; note: string } }>("financial-breakdown");
  const c = d.capex;
  const pct = (v: number) => `%${((v / c.total) * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;
  return (
    <Stack gap="4">
      <Box {...card}>
        <EChart height={Math.max(300, c.byCategory.length * 46)} ariaLabel="İlk ay kuruluş yatırımı (CAPEX) kategori kırılımı" option={capexBreakdownOption(c.byCategory)} />
      </Box>
      <Box {...card} p="0" overflowX="auto" display={{ base: "none", md: "block" }}>
        <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="420px">
          <Thead>
            <Tr>
              {["Kalem", "Tutar", "Pay"].map((h, i) => (
                <Th key={h} scope="col" textAlign={i === 0 ? "start" : "end"} p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold" whiteSpace="nowrap">{h}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {c.byCategory.map((r) => (
              <Tr key={r.kat}>
                <Th scope="row" textAlign="start" p="3" borderBottom="1px solid" borderColor="line" color="ink" fontWeight="medium">{r.kat}</Th>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink" whiteSpace="nowrap">{fmtTRY(r.tutar)}</Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="inkMuted">{pct(r.tutar)}</Td>
              </Tr>
            ))}
            <Tr bg="surface">
              <Th scope="row" textAlign="start" p="3" color="ink" fontWeight="bold">Toplam kuruluş yatırımı</Th>
              <Td p="3" textAlign="end" color="ink" fontWeight="bold" whiteSpace="nowrap">{fmtTRY(c.total)}</Td>
              <Td p="3" textAlign="end" color="inkMuted">%100</Td>
            </Tr>
          </Tbody>
        </Tbl>
      </Box>
      <Box display={{ base: "block", md: "none" }}>
        <MobileTableCards
          columns={["Kalem", "Tutar", "Pay"]}
          rows={[
            ...c.byCategory.map((r) => [
              r.kat,
              fmtTRY(r.tutar),
              <Box as="span" color="inkMuted">{pct(r.tutar)}</Box>,
            ]),
            [
              <Box as="span" fontWeight="bold">Toplam kuruluş yatırımı</Box>,
              <Box as="span" fontWeight="bold">{fmtTRY(c.total)}</Box>,
              <Box as="span" color="inkMuted">%100</Box>,
            ],
          ]}
          primary={[1]}
          detail={[2]}
        />
      </Box>
    </Stack>
  );
}

/* ---------------- OPEX · aylık işletme gideri kompozisyonu (grafik + tablo) ---------------- */
export function OpexView() {
  const d = getData<{ opex: { month: string; total: number; byCategory: { kat: string; tutar: number }[] } }>("financial-breakdown");
  const o = d.opex;
  const pct = (v: number) => `%${((v / o.total) * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;
  return (
    <Stack gap="4">
      <Box {...card}>
        <EChart height={Math.max(320, o.byCategory.length * 44)} ariaLabel="Aylık işletme gideri (OPEX) kompozisyonu" option={opexCompositionOption(o.byCategory)} />
      </Box>
      <Box {...card} p="0" overflowX="auto" display={{ base: "none", md: "block" }}>
        <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="440px">
          <Thead>
            <Tr>
              {["Gider kalemi", `Tutar · ${o.month}`, "Pay"].map((h, i) => (
                <Th key={h} scope="col" textAlign={i === 0 ? "start" : "end"} p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold" whiteSpace="nowrap">{h}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {o.byCategory.map((r) => (
              <Tr key={r.kat}>
                <Th scope="row" textAlign="start" p="3" borderBottom="1px solid" borderColor="line" color="ink" fontWeight="medium">{r.kat}</Th>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink" whiteSpace="nowrap">{fmtTRY(r.tutar)}</Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="inkMuted">{pct(r.tutar)}</Td>
              </Tr>
            ))}
            <Tr bg="surface">
              <Th scope="row" textAlign="start" p="3" color="ink" fontWeight="bold">Toplam aylık OPEX</Th>
              <Td p="3" textAlign="end" color="ink" fontWeight="bold" whiteSpace="nowrap">{fmtTRY(o.total)}</Td>
              <Td p="3" textAlign="end" color="inkMuted">%100</Td>
            </Tr>
          </Tbody>
        </Tbl>
      </Box>
      <Box display={{ base: "block", md: "none" }}>
        <MobileTableCards
          columns={["Gider kalemi", `Tutar · ${o.month}`, "Pay"]}
          rows={[
            ...o.byCategory.map((r) => [
              r.kat,
              fmtTRY(r.tutar),
              <Box as="span" color="inkMuted">{pct(r.tutar)}</Box>,
            ]),
            [
              <Box as="span" fontWeight="bold">Toplam aylık OPEX</Box>,
              <Box as="span" fontWeight="bold">{fmtTRY(o.total)}</Box>,
              <Box as="span" color="inkMuted">%100</Box>,
            ],
          ]}
          primary={[1]}
          detail={[2]}
        />
      </Box>
    </Stack>
  );
}

/* ---------------- Aylık finansal (2026 / 2027): grafik + tablo ---------------- */
type MonthRow = { label: string; gelir: number; opex: number; pazarlama: number; capex: number; gider: number; net: number; nakit: number };
function MonthlySplitView({ period }: { period: "monthly2026" | "monthly2027" }) {
  const d = getData<Record<string, MonthRow[]>>("financial-breakdown");
  const rows = d[period];
  return (
    <Stack gap="4">
      <Box {...card}>
        <EChart
          height={360}
          ariaLabel={`${period === "monthly2026" ? "2026" : "2027"} aylık gelir, gider kırılımı (OPEX/Pazarlama/CAPEX) ve kümülatif nakit`}
          option={monthlySplitOption(rows)}
        />
      </Box>
      <Box {...card} p="0" overflowX="auto" display={{ base: "none", md: "block" }}>
        <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="480px">
          <Thead>
            <Tr>
              {["Ay", "Gelir", "Gider", "Net", "Dönem sonu nakit"].map((h, i) => (
                <Th key={h} scope="col" textAlign={i === 0 ? "start" : "end"} p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold" whiteSpace="nowrap">{h}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((r) => (
              <Tr key={r.label}>
                <Th scope="row" textAlign="start" p="3" borderBottom="1px solid" borderColor="line" color="ink" fontWeight="bold" whiteSpace="nowrap">{r.label}</Th>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{fmtTRY(r.gelir)}</Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{fmtTRY(r.gider)}</Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color={r.net < 0 ? "warn" : "grass"} fontWeight="medium" whiteSpace="nowrap">
                  {r.net < 0 ? "−" : "+"}{fmtTRY(Math.abs(r.net))}
                </Td>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink" whiteSpace="nowrap">{fmtTRY(r.nakit)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Tbl>
      </Box>
      <Box display={{ base: "block", md: "none" }}>
        <MobileTableCards
          columns={["Ay", "Gelir", "Gider", "Net", "Dönem sonu nakit"]}
          rows={rows.map((r) => [
            r.label,
            fmtTRY(r.gelir),
            <Box as="span" color="inkMuted">{fmtTRY(r.gider)}</Box>,
            netCell(r.net),
            fmtTRY(r.nakit),
          ])}
          primary={[1, 3]}
          detail={[2, 4]}
        />
      </Box>
    </Stack>
  );
}

/* ---------------- Başabaş analizi: kümülatif kesişim grafiği + özet tablo ---------------- */
export function BreakevenView() {
  const d = getData<{
    breakeven: {
      capital: number; cumSpendToBE: number; beMonthOperational: string; beMonthCumulative: string;
      cashTrough: number; cashTroughMonth: string; reserve: number;
      series: { label: string; cumGelir: number; cumGider: number }[];
    };
  }>("financial-breakdown");
  const be = d.breakeven;
  const summary: [string, string, string?][] = [
    ["Toplam sermaye", fmtTRY(be.capital), "yatırımcı girişi"],
    ["Başabaşa kadar harcama", fmtTRY(be.cumSpendToBE), "kümülatif gider, kesişimde"],
    ["Operasyonel başabaş", be.beMonthOperational, "aylık gelir ≥ gider"],
    ["Kümülatif başabaş", be.beMonthCumulative, "kümülatif gelir = gider"],
    ["Kasanın en dibi", fmtTRY(be.cashTrough), be.cashTroughMonth],
    ["Dokunulmaz yedek", fmtTRY(be.reserve), "başabaş sonrası kasa"],
  ];
  return (
    <Stack gap="4">
      <Box {...card}>
        <EChart
          height={360}
          ariaLabel={`Başabaş analizi: kümülatif gelir ve kümülatif gider; ${be.beMonthCumulative} ayında ${fmt(be.cumSpendToBE)} seviyesinde kesişir`}
          option={breakevenOption(be.series, { label: "Nis 27", value: be.cumSpendToBE })}
        />
      </Box>
      <Box {...card} p="0" overflowX="auto" display={{ base: "none", md: "block" }}>
        <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="420px">
          <Thead>
            <Tr>
              {["Gösterge", "Değer", "Not"].map((h, i) => (
                <Th key={h} scope="col" textAlign={i === 1 ? "end" : "start"} p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold" whiteSpace="nowrap">{h}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {summary.map(([k, v, n]) => (
              <Tr key={k}>
                <Th scope="row" textAlign="start" p="3" borderBottom="1px solid" borderColor="line" color="ink" fontWeight="medium">{k}</Th>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink" fontWeight="bold" whiteSpace="nowrap">{v}</Td>
                <Td p="3" textAlign="start" borderBottom="1px solid" borderColor="line" color="inkMuted">{n}</Td>
              </Tr>
            ))}
          </Tbody>
        </Tbl>
      </Box>
      <Box display={{ base: "block", md: "none" }}>
        <MobileTableCards
          columns={["Gösterge", "Değer", "Not"]}
          rows={summary.map(([k, v, n]) => [
            k,
            <Box as="span" fontWeight="bold">{v}</Box>,
            <Box as="span" color="inkMuted">{n ?? ""}</Box>,
          ])}
          primary={[1]}
          detail={[2]}
        />
      </Box>
    </Stack>
  );
}

/* ---------------- Departman dağılımı · yıl sekmeleriyle filtrele ---------------- */
export function DeptByYearView() {
  const d = getData<{ years: string[]; departments: { dept: string; byYear: number[] }[]; totals: number[] }>("hr-by-year");
  const [yi, setYi] = useState(d.years.length - 1);
  const yr = d.years[yi];
  return (
    <Stack gap="4">
      <Flex gap="2" wrap="wrap" role="tablist" aria-label="Yıl seç">
        {d.years.map((y, i) => (
          <Box
            as="button"
            key={y}
            role="tab"
            aria-selected={i === yi}
            onClick={() => setYi(i)}
            px="4"
            py="2"
            borderRadius="full"
            fontWeight="medium"
            fontSize="md"
            cursor="pointer"
            bg={i === yi ? "grass" : "surface"}
            color={i === yi ? "white" : "inkMuted"}
            border="1px solid"
            borderColor={i === yi ? "grass" : "line"}
          >
            {y}
          </Box>
        ))}
      </Flex>
      <Box {...card} p="0" overflowX="auto" display={{ base: "none", md: "block" }}>
        <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="420px">
          <Thead>
            <Tr>
              <Th scope="col" textAlign="start" p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold">Departman</Th>
              <Th scope="col" textAlign="end" p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold" whiteSpace="nowrap">{yr} · kişi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {d.departments.map((r) => (
              <Tr key={r.dept}>
                <Th scope="row" textAlign="start" p="3" borderBottom="1px solid" borderColor="line" color="ink" fontWeight="medium">{r.dept}</Th>
                <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{r.byYear[yi]}</Td>
              </Tr>
            ))}
            <Tr>
              <Th scope="row" textAlign="start" p="3" color="ink" fontWeight="bold">Toplam</Th>
              <Td p="3" textAlign="end" color="ink" fontWeight="bold">{d.totals[yi]}</Td>
            </Tr>
          </Tbody>
        </Tbl>
      </Box>
      <Box display={{ base: "block", md: "none" }}>
        <MobileTableCards
          columns={["Departman", `${yr} · kişi`]}
          rows={[...d.departments.map((r) => [r.dept, String(r.byYear[yi])]), ["Toplam", String(d.totals[yi])]]}
          primary={[1]}
          detail={[]}
        />
      </Box>
    </Stack>
  );
}

/* Dispatcher */
export function ChartBlock({ chartType, highlightYears }: { chartType: string; highlightYears?: string[] }): ReactNode {
  switch (chartType) {
    case "funnel":
      return <MarketFunnelView />;
    case "scenarioYears":
      return <ScenarioYearsView />;
    case "revenueStreams":
      return <RevenueStreamsView />;
    case "monthlyEarly":
      return <MonthlyEarlyView />;
    case "capexBreakdown":
      return <CapexView />;
    case "opexComposition":
      return <OpexView />;
    case "monthly2026":
      return <MonthlySplitView period="monthly2026" />;
    case "monthly2027":
      return <MonthlySplitView period="monthly2027" />;
    case "breakeven":
      return <BreakevenView />;
    case "taxSlider":
      return <TaxSliderView />;
    case "graduatedFinancial":
      return <GraduatedFinancialView />;
    case "headcountMonthly":
      return <HeadcountMonthlyView />;
    case "aiEfficiency":
      return <AiEfficiencyView />;
    case "headcountGrowth":
      return <HeadcountView />;
    case "deptByYear":
      return <DeptByYearView />;
    case "basabasWaterfall":
      return <BasabasWaterfallView />;
    case "yearlyCombo":
      return <YearlyComboView />;
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
