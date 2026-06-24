import { Box } from "@chakra-ui/react";
import { P, Stack, Tbl, Thead, Tbody, Tr, Th, Td } from "../ui";
import { RichText } from "./RichText";
import { cardBase } from "../theme/components";

/**
 * GovernanceMatrix — "kim neye karar verir" matrisi. Her karar alanı için CPO ve Yatırımcı rolü
 * renkli rozetle (onaylar / yürütür / önerir / bilgilendirilir). Masaüstünde tablo, mobilde kart.
 * Veri database/data/governance-matrix.json (block: type "governanceMatrix"). Mobile-first.
 */
type Role = "responsible" | "consulted" | "informed" | "approves";
export type GovRow = { decision: string; cpo: Role; investor: Role; joint?: boolean; note?: string };
export type GovernanceData = { rows: GovRow[]; legend?: Record<string, string> };

const ROLE: Record<Role, { tr: string; bg: string; color: string }> = {
  approves: { tr: "onaylar", bg: "grass", color: "white" },
  responsible: { tr: "yürütür", bg: "ink", color: "white" },
  consulted: { tr: "önerir", bg: "gold", color: "ink" },
  informed: { tr: "bilgilendirilir", bg: "surface", color: "inkMuted" },
};

function RoleChip({ r }: { r: Role }) {
  const m = ROLE[r] ?? ROLE.informed;
  return (
    <Box
      as="span"
      display="inline-flex"
      px="2"
      py="0.5"
      borderRadius="full"
      bg={m.bg}
      color={m.color}
      fontSize="sm"
      fontWeight="medium"
      border="1px solid"
      borderColor="line"
      whiteSpace="nowrap"
    >
      {m.tr}
    </Box>
  );
}

export function GovernanceMatrix({ data }: { data: GovernanceData }) {
  if (!data || !data.rows || data.rows.length === 0) return null;
  return (
    <Stack gap="3" align="stretch">
      {/* Masaüstü: tablo */}
      <Box display={{ base: "none", md: "block" }} border="1px solid" borderColor="line" borderRadius="surface" overflowX="auto">
        <Tbl w="100%" borderCollapse="collapse" fontSize="md">
          <Thead>
            <Tr>
              {["Karar alanı", "CPO", "Yatırımcı", "Not"].map((h, i) => (
                <Th key={i} scope="col" textAlign="start" p="3" bg="surface" color="ink" fontWeight="bold" borderBottom="2px solid" borderColor="lineStrong">
                  {h}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.rows.map((r, i) => (
              <Tr key={i}>
                <Th scope="row" textAlign="start" p="3" color="ink" fontWeight="bold" borderBottom="1px solid" borderColor="line" verticalAlign="top">
                  <RichText text={r.decision} />
                </Th>
                <Td p="3" borderBottom="1px solid" borderColor="line" verticalAlign="top">
                  <RoleChip r={r.cpo} />
                </Td>
                <Td p="3" borderBottom="1px solid" borderColor="line" verticalAlign="top">
                  <RoleChip r={r.investor} />
                </Td>
                <Td p="3" color="inkMuted" borderBottom="1px solid" borderColor="line" verticalAlign="top" fontSize="sm">
                  {r.note && <RichText text={r.note} />}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Tbl>
      </Box>

      {/* Mobil: kartlar */}
      <Box display={{ base: "block", md: "none" }}>
        <Stack gap="3" align="stretch">
          {data.rows.map((r, i) => (
            <Box key={i} {...cardBase()}>
              <P fontWeight="bold" color="ink" fontSize="md" mb="2">
                <RichText text={r.decision} />
              </P>
              <Box display="flex" flexWrap="wrap" gap="3" mb={r.note ? "2" : "0"}>
                <Box display="flex" alignItems="center" gap="1.5">
                  <P fontSize="sm" color="inkMuted">CPO:</P>
                  <RoleChip r={r.cpo} />
                </Box>
                <Box display="flex" alignItems="center" gap="1.5">
                  <P fontSize="sm" color="inkMuted">Yatırımcı:</P>
                  <RoleChip r={r.investor} />
                </Box>
              </Box>
              {r.note && (
                <P fontSize="sm" color="inkMuted" lineHeight="1.4">
                  <RichText text={r.note} />
                </P>
              )}
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
