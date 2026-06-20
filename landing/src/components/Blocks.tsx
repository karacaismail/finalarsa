import { Box, VisuallyHidden } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { brand, getMetric, interpolate } from "../data/resolve";
import type { Block } from "../data/types";
import { A, Blockquote, Dd, Dl, Dt, Flex, Grid, H3, Li, Ol, P, Stack, Tbl, Tbody, Td, Th, Thead, Tr, Ul } from "../ui";
import { RichText } from "./RichText";
import { ChartBlock } from "./ChartViews";

/* --- tone -> AA-uyumlu renk/zemin --- */
const toneText: Record<string, string> = { accent: "grass", gold: "gold", warn: "warn", info: "inkMuted" };
const toneBg: Record<string, string> = { accent: "#f1f6ea", gold: "#fbf4df", warn: "#fbeee7", info: "surface" };
const toneBorder: Record<string, string> = { accent: "#cfe0b4", gold: "#ecd9a0", warn: "#f0cdb6", info: "line" };
const txt = (t?: string) => (t && toneText[t]) || "ink";

/* İddia etiketleri (claim tag): doğrulanmış kaynak / model varsayımı / hedef / şirket tahmini */
const tagMeta: Record<string, { color: string; bg: string }> = {
  "doğrulanmış kaynak": { color: "grassInk", bg: "#eef5e3" },
  "model varsayımı": { color: "gold", bg: "#fbf4df" },
  hedef: { color: "ink", bg: "#ecebe4" },
  "şirket tahmini": { color: "warn", bg: "#fbeee7" },
};
function TagBadge({ tag }: { tag: string }) {
  const m = tagMeta[tag] ?? tagMeta["hedef"];
  return (
    <Box as="span" display="inline-flex" alignItems="center" alignSelf="flex-start" px="2" py="0.5" mb="1" borderRadius="full" bg={m.bg} color={m.color} fontSize="md" fontWeight="medium" lineHeight="1.3" letterSpacing="0.01em">
      {tag}
    </Box>
  );
}

const cardBase = (tone?: string) => ({
  border: "1px solid",
  borderColor: (tone && toneBorder[tone]) || "line",
  borderRadius: "surface",
  bg: (tone && toneBg[tone]) || "paper",
  p: { base: "5", md: "6" } as const,
});

function gridCols(cols?: number) {
  if (cols === 4) return { base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" };
  if (cols === 3) return { base: "1fr", md: "repeat(3, 1fr)" };
  return { base: "1fr", md: "repeat(2, 1fr)" };
}

function statValue(b: Block): string {
  if (b.valueRef) return getMetric(b.valueRef as string)?.display ?? `«${b.valueRef}»`;
  if (b.value != null) return String(b.value);
  return "";
}

interface Ctx {
  isHero: boolean;
}

/* ---------------- tek blok ---------------- */
export function BlockView({ block, ctx }: { block: Block; ctx: Ctx }) {
  const b = block as Record<string, any> & Block;
  switch (b.type) {
    case "eyebrow":
      return (
        <P color="inkMuted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em" fontSize="md">
          {interpolate(b.text)}
        </P>
      );

    case "heading": {
      const tag = b.level === 1 ? (ctx.isHero ? "h1" : "h2") : b.level === 2 ? "h2" : "h3";
      const size =
        b.level === 1
          ? { base: "3xl", md: "5xl" }
          : b.level === 2
            ? { base: "2xl", md: "4xl" }
            : { base: "xl", md: "2xl" };
      return (
        <H3 as={tag} fontSize={size} fontWeight="bold" color="ink" lineHeight="1.12" letterSpacing="-0.01em" maxW="20ch">
          <RichText text={b.text} accent={b.accent} accentColor="gold" />
        </H3>
      );
    }

    case "lead":
      return (
        <P fontSize={{ base: "lg", md: "xl" }} color="inkMuted" lineHeight="1.55" maxW="62ch">
          <RichText text={b.text} />
        </P>
      );

    case "paragraph":
      return (
        <P color="ink" maxW="62ch">
          <RichText text={b.text} />
        </P>
      );

    case "stat":
      return <StatCard b={b} />;

    case "statGrid":
      return (
        <Grid templateColumns={gridCols(b.cols)} gap="4">
          {b.items.map((it: Block, i: number) => (
            <Box key={i} {...cardBase(it.tone as string)}>
              <StatCard b={it} bare />
            </Box>
          ))}
        </Grid>
      );

    case "card":
      return (
        <Box {...cardBase(b.tone as string)}>
          <CardInner b={b} />
        </Box>
      );

    case "cardGrid":
      return (
        <Grid templateColumns={gridCols(b.cols)} gap="4">
          {b.items.map((it: Block, i: number) => (
            <Box key={i} {...cardBase(it.tone as string)}>
              <CardInner b={it} />
            </Box>
          ))}
        </Grid>
      );

    case "list": {
      const ListEl = b.ordered ? Ol : Ul;
      return (
        <ListEl listStyleType="none" m="0" p="0" display="flex" flexDirection="column" gap="3">
          {b.items.map((it: Block, i: number) => (
            <Li key={i} display="flex" gap="3" alignItems="flex-start">
              {it.num != null && (
                <Box
                  flexShrink="0"
                  minW="2.2em"
                  h="2.2em"
                  px="2"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="control"
                  bg="surface"
                  color="grass"
                  fontWeight="bold"
                  fontSize="md"
                >
                  {it.num}
                </Box>
              )}
              <Box>
                <P fontWeight="medium" color="ink">
                  <RichText text={it.title} />
                </P>
                {it.body && (
                  <P color="inkMuted" fontSize="md" mt="0.5">
                    <RichText text={it.body} />
                  </P>
                )}
              </Box>
            </Li>
          ))}
        </ListEl>
      );
    }

    case "table":
      return (
        <Box overflowX="auto" border="1px solid" borderColor="line" borderRadius="surface">
          <Tbl w="100%" borderCollapse="collapse" fontSize="md" minW="560px">
            <Thead>
              <Tr>
                {b.columns.map((c: string, i: number) => (
                  <Th
                    key={i}
                    scope="col"
                    textAlign="start"
                    p="3"
                    bg="surface"
                    color="ink"
                    fontWeight="bold"
                    borderBottom="2px solid"
                    borderColor="lineStrong"
                  >
                    {c}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {b.rows.map((row: string[], ri: number) => (
                <Tr key={ri}>
                  {row.map((cell: string, ci: number) =>
                    ci === 0 ? (
                      <Th key={ci} scope="row" textAlign="start" p="3" color="ink" fontWeight="bold" borderBottom="1px solid" borderColor="line" verticalAlign="top">
                        <RichText text={cell} />
                      </Th>
                    ) : (
                      <Td key={ci} p="3" color="ink" borderBottom="1px solid" borderColor="line" verticalAlign="top">
                        <RichText text={cell} />
                      </Td>
                    ),
                  )}
                </Tr>
              ))}
            </Tbody>
          </Tbl>
        </Box>
      );

    case "timeline":
      return (
        <Stack gap="0" position="relative">
          {b.items.map((it: Block, i: number) => {
            const active = it.state === "now";
            return (
              <Flex key={i} gap="4" pb={i === b.items.length - 1 ? "0" : "5"} position="relative">
                <Flex direction="column" align="center" flexShrink="0">
                  <Box
                    w="14px"
                    h="14px"
                    borderRadius="full"
                    bg={active ? "grass" : it.state === "done" ? "grassBright" : "surfaceAlt"}
                    border="2px solid"
                    borderColor={active ? "grass" : "lineStrong"}
                    mt="1"
                  />
                  {i < b.items.length - 1 && <Box w="2px" flex="1" bg="line" mt="1" />}
                </Flex>
                <Box pb="2">
                  <P color={active ? "grass" : "inkMuted"} fontWeight="bold" fontSize="md">
                    <RichText text={it.when} />
                  </P>
                  <P color="ink" mt="0.5">
                    <RichText text={it.what} />
                  </P>
                </Box>
              </Flex>
            );
          })}
        </Stack>
      );

    case "funnel":
      return <FunnelBlock rows={b.rows} />;

    case "pillRow":
      return (
        <Flex wrap="wrap" gap="2">
          {b.items.map((p: string, i: number) => (
            <Box key={i} px="3" py="1.5" borderRadius="full" bg="surface" border="1px solid" borderColor="line" color="inkMuted" fontSize="md">
              {p}
            </Box>
          ))}
        </Flex>
      );

    case "quote":
      return (
        <Blockquote
          m="0"
          borderLeft="3px solid"
          borderColor="grassBright"
          pl="5"
          py="1"
          color="ink"
          fontSize={{ base: "lg", md: "xl" }}
          fontStyle="italic"
        >
          <RichText text={b.text} />
          {b.cite && (
            <P fontStyle="normal" fontSize="md" color="inkMuted" mt="2">
              — {b.cite}
            </P>
          )}
        </Blockquote>
      );

    case "cta":
      return <CtaButton b={b} primary />;

    case "ctaStack":
      return (
        <Flex gap="3" wrap="wrap">
          {b.items.map((it: Block, i: number) => (
            <CtaButton key={i} b={it} primary={i === 0} />
          ))}
        </Flex>
      );

    case "chart":
      return (
        <Box as="figure" m="0">
          <ChartBlock chartType={b.chartType} highlightYears={b.highlightYears} />
          {b.caption && (
            <Box as="figcaption" mt="2" fontSize="md" color="inkMuted">
              {interpolate(b.caption)}
            </Box>
          )}
        </Box>
      );

    case "note":
      return (
        <Box
          borderLeft="3px solid"
          borderColor={txt(b.tone) === "ink" ? "grassBright" : txt(b.tone)}
          bg={(b.tone && toneBg[b.tone]) || "surface"}
          p={{ base: "4", md: "5" }}
          borderRadius="0 surface surface 0"
          color="ink"
          maxW="72ch"
        >
          <RichText text={b.text} />
        </Box>
      );

    case "feature":
      return (
        <Box {...cardBase("accent")}>
          {b.title && (
            <P color="grass" fontWeight="bold" textTransform="uppercase" letterSpacing="0.05em" fontSize="md">
              {b.title}
            </P>
          )}
          {b.valueRef && (
            <P fontSize={{ base: "4xl", md: "5xl" }} fontWeight="bold" color="ink" lineHeight="1.05" mt="1">
              {getMetric(b.valueRef)?.display}
            </P>
          )}
          {b.desc && (
            <P color="ink" mt="3" maxW="60ch">
              <RichText text={b.desc} />
            </P>
          )}
          {b.items && (
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap="2" mt="4">
              {b.items.map((it: Block, i: number) => (
                <Flex key={i} gap="2" align="flex-start">
                  <Box as="span" color="grass" fontWeight="bold" fontSize="md" minW="2em">
                    {it.num}
                  </Box>
                  <P color="inkMuted" fontSize="md">
                    <RichText text={it.title} />
                  </P>
                </Flex>
              ))}
            </Grid>
          )}
        </Box>
      );

    case "fomoVeil":
      return (
        <Box {...cardBase("info")} textAlign="center" borderStyle="dashed">
          <P fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="ink">
            <RichText text={b.big} />
          </P>
          {b.sub && (
            <P color="inkMuted" mt="2" fontSize="md" maxW="60ch" mx="auto">
              <RichText text={b.sub} />
            </P>
          )}
        </Box>
      );

    case "crisisBox":
      return (
        <Box {...cardBase("warn")}>
          <P fontWeight="bold" color="ink" fontSize="lg" mb="4">
            <RichText text={b.title} />
          </P>
          <Flex gap="4" wrap="wrap">
            {b.cells.map((c: Block, i: number) => (
              <Box key={i} flex="1" minW="120px">
                <StatCard b={c} bare />
              </Box>
            ))}
          </Flex>
        </Box>
      );

    case "countdown":
      return <Countdown targetRef={b.targetRef} label={b.label} />;

    case "scrollHint":
      return (
        <P aria-hidden="true" color="inkMuted" fontSize="md" mt="2">
          {b.label} ↓
        </P>
      );

    case "badge":
      return (
        <Box as="span" px="3" py="1" borderRadius="full" bg="surface" border="1px solid" borderColor="line" color="inkMuted" fontSize="md">
          {b.text}
        </Box>
      );

    case "claimLegend":
      return (
        <Flex wrap="wrap" gap="2" align="center">
          <P fontSize="md" color="inkMuted" mr="1">Rakam türleri:</P>
          {["doğrulanmış kaynak", "model varsayımı", "hedef", "şirket tahmini"].map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </Flex>
      );

    default:
      return null;
  }
}

/* ---------------- yardımcı bileşenler ---------------- */
function StatCard({ b, bare }: { b: Block; bare?: boolean }) {
  const color = txt(b.tone as string);
  const inner = (
    <Dl m="0">
      {b.tag && (
        <Box mb="1">
          <TagBadge tag={b.tag as string} />
        </Box>
      )}
      <Dd m="0" fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color={color} lineHeight="1.05" letterSpacing="-0.01em">
        {statValue(b)}
      </Dd>
      <Dt color="inkMuted" mt="1" fontSize="md">
        <RichText text={(b.label as string) ?? ""} />
      </Dt>
      {b.sub && (
        <Dd m="0" color="inkMuted" fontSize="md" mt="1">
          <RichText text={b.sub as string} />
        </Dd>
      )}
    </Dl>
  );
  return bare ? inner : <Box {...cardBase(b.tone as string)}>{inner}</Box>;
}

function CardInner({ b }: { b: Block }) {
  return (
    <Stack gap="2">
      {b.tag && <TagBadge tag={b.tag as string} />}
      {b.eyebrow && (
        <P fontSize="md" color={txt(b.tone as string) === "ink" ? "inkMuted" : txt(b.tone as string)} fontWeight="medium" textTransform="uppercase" letterSpacing="0.04em">
          {interpolate(b.eyebrow as string)}
        </P>
      )}
      {(b.valueRef || b.value != null) && (
        <P fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={txt(b.tone as string)} lineHeight="1.05">
          {statValue(b)}
        </P>
      )}
      {b.title && (
        <P fontWeight="bold" color="ink" fontSize="lg">
          <RichText text={b.title as string} />
        </P>
      )}
      {b.body && (
        <P color="inkMuted" fontSize="md">
          <RichText text={b.body as string} />
        </P>
      )}
    </Stack>
  );
}

function FunnelBlock({ rows }: { rows: Array<Record<string, any>> }) {
  return (
    <Stack gap="4" border="1px solid" borderColor="line" borderRadius="surface" bg="paper" p={{ base: "5", md: "6" }}>
      {rows.map((r, i) => {
        const v = r.valueRef ? getMetric(r.valueRef)?.display : "";
        return (
          <Box key={i}>
            <Flex justify="space-between" align="baseline" gap="3" wrap="wrap" mb="2">
              <P fontWeight="medium" color="ink">{r.key}</P>
              <P fontWeight="bold" color={r.tone === "gold" ? "gold" : "ink"} fontSize="lg">{v}</P>
            </Flex>
            <Box aria-hidden="true" h="10px" borderRadius="full" bg="surface" overflow="hidden">
              <Box h="100%" borderRadius="full" bg={r.tone === "gold" ? "goldBright" : "grassBright"} w={`${Math.max(3, (r.width ?? 1) * 100)}%`} />
            </Box>
            {r.desc && (
              <P fontSize="md" color="inkMuted" mt="1">
                <RichText text={r.desc} />
              </P>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}

function CtaButton({ b, primary }: { b: Block; primary?: boolean }) {
  const contact = brand.contact as { email: string; phone: string; phoneHref: string };
  const href = b.action === "phone" ? contact.phoneHref : `mailto:${contact.email}`;
  return (
    <A
      href={href}
      display="inline-flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="48px"
      px="6"
      py="3"
      borderRadius="control"
      fontWeight="bold"
      textDecoration="none"
      bg={primary ? "grass" : "paper"}
      color={primary ? "white" : "grass"}
      border="2px solid"
      borderColor="grass"
      _hover={{ bg: primary ? "grassInk" : "surface" }}
    >
      <Box as="span">{b.label as string}</Box>
      {b.meta && (
        <Box as="span" fontSize="md" fontWeight="normal" opacity="0.85">
          {b.meta as string}
        </Box>
      )}
    </A>
  );
}

function Countdown({ targetRef, label }: { targetRef: string; label: string }) {
  const target = getMetric(targetRef);
  const targetDate = new Date(String(target?.value ?? "2026-12-01") + "T00:00:00");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, targetDate.getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const cell = (n: number, u: string) => (
    <Box textAlign="center" minW="64px">
      <Box fontSize="3xl" fontWeight="bold" color="ink" lineHeight="1">{n}</Box>
      <Box fontSize="md" color="inkMuted">{u}</Box>
    </Box>
  );
  return (
    <Box border="1px solid" borderColor="line" borderRadius="surface" bg="surface" p="5">
      <P fontSize="md" color="inkMuted" mb="3">
        {label} <VisuallyHidden>{`yaklaşık ${days} gün`}</VisuallyHidden>
      </P>
      <Flex gap="4" aria-hidden="true">
        {cell(days, "gün")}
        {cell(hours, "saat")}
        {cell(mins, "dk")}
      </Flex>
    </Box>
  );
}
