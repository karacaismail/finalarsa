import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { getData, getMetric } from "../data/resolve";
import type { FinancialYear } from "../data/types";
import { Dd, Dl, Dt, Flex, Grid, H3, P, Stack, Tbl, Tbody, Td, Th, Thead, Tr } from "../ui";

const trNum = (n: number) => n.toLocaleString("tr-TR");
function fmtShort(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e12) return `${(n / 1e12).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} trilyon ₺`;
  if (a >= 1e9) return `${(n / 1e9).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} milyar ₺`;
  if (a >= 1e6) return `${Math.round(n / 1e6).toLocaleString("tr-TR")} milyon ₺`;
  if (a >= 1e3) return `${Math.round(n / 1e3).toLocaleString("tr-TR")} bin ₺`;
  return `${trNum(n)} ₺`;
}

/** Renge bağımlı olmayan yatay çubuk: değer her zaman metin olarak yanında. */
function Bar({ ratio, fill = "grassBright" }: { ratio: number; fill?: string }) {
  return (
    <Box
      aria-hidden="true"
      h="10px"
      borderRadius="full"
      bg="surface"
      overflow="hidden"
      flex="1"
      minW="60px"
    >
      <Box h="100%" borderRadius="full" bg={fill} w={`${Math.max(3, Math.min(100, ratio * 100))}%`} />
    </Box>
  );
}

const card = {
  border: "1px solid",
  borderColor: "line",
  borderRadius: "surface",
  bg: "paper",
  p: { base: "5", md: "6" },
} as const;

/* ---------------- Pazar hunisi (TAM/SAM/SOM/gelir) ---------------- */
export function MarketFunnelView() {
  const d = getData<{ valueFunnel: { tam: { value: number }; sam: { value: number }; som: { value: number }; annualRevenuePotential: { value: number } } }>(
    "market-tam-sam-som",
  );
  const f = d.valueFunnel;
  const rows = [
    { k: "TAM · toplam pazar", v: f.tam.value, note: "yıllık arsa işlemi × ortalama değer", fill: "surfaceAlt" },
    { k: "SAM · dijitale açık", v: f.sam.value, note: "%18,7 online penetrasyon", fill: "grassBright" },
    { k: "SOM · elde edilebilir", v: f.som.value, note: "SAM'ın %10'u", fill: "grassBright" },
    { k: "Yıllık gelir potansiyeli", v: f.annualRevenuePotential.value, note: "SOM × %1,5 take rate", fill: "goldBright" },
  ];
  const max = f.tam.value;
  return (
    <Stack gap="4" {...card}>
      {rows.map((r) => (
        <Box key={r.k}>
          <Flex justify="space-between" align="baseline" gap="3" wrap="wrap" mb="2">
            <P fontWeight="medium" color="ink">{r.k}</P>
            <P fontWeight="bold" color="ink" fontSize="lg">{fmtShort(r.v)}</P>
          </Flex>
          <Bar ratio={r.v / max} fill={r.fill} />
          <P fontSize="md" color="inkMuted" mt="1">{r.note}</P>
        </Box>
      ))}
    </Stack>
  );
}

/* ---------------- Yıllık finansal özet (tablo) ---------------- */
export function YearlyView({ highlightYears }: { highlightYears?: string[] }) {
  const d = getData<{ yearly: FinancialYear[] }>("financial-model");
  const rows = highlightYears
    ? d.yearly.filter((y) => highlightYears.includes(y.year))
    : d.yearly;
  return (
    <Box {...card} p="0" overflowX="auto">
      <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="640px">
        <Thead>
          <Tr>
            {["Yıl", "Gelir", "Gider", "Net", "Kadro", "Yıl sonu nakit"].map((h, i) => (
              <Th
                key={h}
                scope="col"
                textAlign={i === 0 ? "start" : "end"}
                p="3"
                borderBottom="2px solid"
                borderColor="lineStrong"
                color="ink"
                fontWeight="bold"
                whiteSpace="nowrap"
              >
                {h}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((y) => (
            <Tr key={y.year}>
              <Th scope="row" textAlign="start" p="3" borderBottom="1px solid" borderColor="line" color="ink" fontWeight="bold" whiteSpace="nowrap">
                {y.year}
              </Th>
              <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{fmtShort(y.revenue)}</Td>
              <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="inkMuted">{fmtShort(y.expense)}</Td>
              <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color={y.net < 0 ? "warn" : "grass"} fontWeight="medium" whiteSpace="nowrap">
                {y.net < 0 ? "−" : "+"}{fmtShort(Math.abs(y.net))}
              </Td>
              <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{y.headcount}</Td>
              <Td p="3" textAlign="end" borderBottom="1px solid" borderColor="line" color="ink">{fmtShort(y.cashEnd)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Tbl>
    </Box>
  );
}

/* ---------------- Nakit büyümesi + kadro (çubuk) ---------------- */
export function CashTeamView() {
  const d = getData<{ yearly: FinancialYear[] }>("financial-model");
  const max = Math.max(...d.yearly.map((y) => y.cashEnd));
  return (
    <Stack gap="3" {...card}>
      <H3 fontSize="md" color="inkMuted" fontWeight="medium" m="0">Yıl sonu nakit · kadro</H3>
      {d.yearly.map((y) => (
        <Flex key={y.year} align="center" gap="3" wrap="wrap">
          <P w="64px" color="ink" fontWeight="medium" flexShrink="0">{y.year}</P>
          <Bar ratio={y.cashEnd / max} fill="grassBright" />
          <P w={{ base: "100%", sm: "200px" }} textAlign={{ base: "start", sm: "end" }} color="ink" flexShrink="0">
            {fmtShort(y.cashEnd)} · <Box as="span" color="inkMuted">{y.headcount} kişi</Box>
          </P>
        </Flex>
      ))}
    </Stack>
  );
}

/* ---------------- Kâr marjı (net/gelir) — EBITDA vekili ---------------- */
export function MarginView() {
  const d = getData<{ yearly: FinancialYear[] }>("financial-model");
  const rows = d.yearly.filter((y) => y.revenue > 0);
  return (
    <Stack gap="3" {...card}>
      <H3 fontSize="md" color="inkMuted" fontWeight="medium" m="0">Net kâr marjı (net ÷ gelir)</H3>
      {rows.map((y) => {
        const margin = y.net / y.revenue;
        return (
          <Flex key={y.year} align="center" gap="3" wrap="wrap">
            <P w="64px" color="ink" fontWeight="medium" flexShrink="0">{y.year}</P>
            <Bar ratio={Math.max(0, margin)} fill={margin < 0 ? "warnBright" : "goldBright"} />
            <P w="84px" textAlign="end" color={margin < 0 ? "warn" : "ink"} fontWeight="medium" flexShrink="0">
              %{Math.round(margin * 100)}
            </P>
          </Flex>
        );
      })}
    </Stack>
  );
}

/* ---------------- Cephane: 6 silah kartı ---------------- */
export function WeaponGrid() {
  const d = getData<{ heroWeapons: { idx: string; name: string; tr: string; badge: string; body: string; example: string }[] }>(
    "strategy-arsenal",
  );
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

/* ---------------- AI-FIRST PANEL (hr-plan verisinden) ---------------- */
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
        <H2id id="ai-first-title">Aynı işi {ai.fteWith} kişiyle. {lean?.display ?? "7 kişi"} çekirdek, 700 kişinin işi.</H2id>
        <P color="inkMuted" mt="3" maxW="680px" fontSize="lg">
          Panel, ilan, doğrulama ve operasyonun büyük kısmını AI ajanları yürütür; insan yalnız denetler ve karar verir.
          sahibinden ölçeği {ai.sahibindenBenchmark}; arsam.net hedefi {ai.target2032}.
        </P>
        <Dl display="flex" gap="4" mt="6" mb="8" flexWrap="wrap" m="0">
          {stat("AI'sız gerekli kadro", `${ai.fteWithout} kişi`, "inkMuted")}
          {stat("AI ile gerekli kadro", `${ai.fteWith} kişi`, "grass")}
          {stat("Tasarruf edilen kadro", `${ai.fteSaved} kişi`, "ink")}
          {stat("Yıllık tasarruf", fmtShort(ai.annualSaving), "gold")}
        </Dl>
        <Box {...card} p="0" overflowX="auto">
          <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="520px">
            <Thead>
              <Tr>
                {["Departman", "AI'sız", "AI ile", "Araçlar"].map((h, i) => (
                  <Th key={h} scope="col" textAlign={i === 0 || i === 3 ? "start" : "center"} p="3" borderBottom="2px solid" borderColor="lineStrong" color="ink" fontWeight="bold">
                    {h}
                  </Th>
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

// AiFirstPanel başlığı için h2 (tek h1 hero'da). Ayrı bileşen, ui H3 öğesi h2 olarak.
function H2id({ id, children }: { id: string; children: ReactNode }) {
  return (
    <H3 as="h2" id={id} fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="ink" lineHeight="1.15" m="0">
      {children}
    </H3>
  );
}

/* Dispatcher: chart bloğunu chartType'a göre uygun görünüme yönlendirir. */
export function ChartBlock({ chartType, highlightYears }: { chartType: string; highlightYears?: string[] }) {
  switch (chartType) {
    case "funnel":
      return <MarketFunnelView />;
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
