import { Box } from "@chakra-ui/react";
import { Grid, P, Stack, Tbl, Thead, Tbody, Tr, Th, Td } from "../ui";
import { RichText } from "./RichText";
import { cardBase } from "../theme/components";

/**
 * First90DaysPlan — ilk 90 günün hedef/karar kapısı görünümü. Her KPI için 30/60/90 gün hedefleri
 * ve "hedef tutmazsa ne karar verilir" kapısı. Veri database/data/first-90-days.json'dan gelir
 * (block: type "first90DaysPlan"). Mobile-first: masaüstünde tablo, mobilde kart (320px güvenli).
 */
export type Milestone = { kpi: string; d30: string; d60: string; d90: string; decision: string };
export type First90Data = { milestones: Milestone[]; note?: string };

export function First90DaysPlan({ data }: { data: First90Data }) {
  if (!data || !data.milestones || data.milestones.length === 0) return null;
  return (
    <Stack gap="4" align="stretch">
      {data.note && (
        <Box bg="surface" border="1px solid" borderColor="line" borderRadius="surface" p={{ base: "3", md: "4" }}>
          <P fontSize="md" color="inkMuted" lineHeight="1.5">
            <Box as="span" fontWeight="bold" color="ink">
              Önerilen pilot KPI taslağı —{" "}
            </Box>
            <RichText text={data.note} />
          </P>
        </Box>
      )}

      {/* Masaüstü: tablo */}
      <Box
        display={{ base: "none", md: "block" }}
        overflowX="auto"
        border="1px solid"
        borderColor="line"
        borderRadius="surface"
      >
        <Tbl w="100%" borderCollapse="collapse" fontSize="md">
          <Thead>
            <Tr>
              {["KPI", "30 gün", "60 gün", "90 gün", "Karar kapısı"].map((h, i) => (
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
                  {h}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.milestones.map((m, i) => (
              <Tr key={i}>
                <Th scope="row" textAlign="start" p="3" color="ink" fontWeight="bold" borderBottom="1px solid" borderColor="line" verticalAlign="top">
                  <RichText text={m.kpi} />
                </Th>
                <Td p="3" color="ink" borderBottom="1px solid" borderColor="line" verticalAlign="top">{m.d30}</Td>
                <Td p="3" color="ink" borderBottom="1px solid" borderColor="line" verticalAlign="top">{m.d60}</Td>
                <Td p="3" color="ink" fontWeight="bold" borderBottom="1px solid" borderColor="line" verticalAlign="top">{m.d90}</Td>
                <Td p="3" color="inkMuted" borderBottom="1px solid" borderColor="line" verticalAlign="top">
                  <RichText text={m.decision} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Tbl>
      </Box>

      {/* Mobil: kartlar */}
      <Box display={{ base: "block", md: "none" }}>
        <Stack gap="3" align="stretch">
          {data.milestones.map((m, i) => (
            <Box key={i} {...cardBase()}>
              <P fontWeight="bold" color="ink" fontSize="md" mb="2">
                <RichText text={m.kpi} />
              </P>
              <Grid templateColumns="repeat(3, 1fr)" gap="2" mb="2">
                {([["30 gün", m.d30], ["60 gün", m.d60], ["90 gün", m.d90]] as const).map(([lab, val], j) => (
                  <Box key={j} textAlign="center" bg="surface" borderRadius="control" py="2">
                    <P fontSize="sm" color="inkMuted">{lab}</P>
                    <P fontWeight="bold" color="ink" fontSize="md">{val}</P>
                  </Box>
                ))}
              </Grid>
              <P fontSize="sm" color="inkMuted" lineHeight="1.4">
                <Box as="span" fontWeight="bold" color="ink">Karar: </Box>
                <RichText text={m.decision} />
              </P>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
