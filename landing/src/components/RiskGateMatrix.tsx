import { Box } from "@chakra-ui/react";
import { Grid, P, Stack } from "../ui";
import { RichText } from "./RichText";
import { cardBase } from "../theme/components";

/**
 * RiskGateMatrix — riskleri "uzun tablo" yerine KARAR KAPISI olarak gösterir. Her risk kartı:
 * ad + ciddiyet (severity) rozeti + nasıl ölçülür + hangi eşikte karar gerekir + aksiyon + sorumlu.
 * Sonda "itibar riski" kırmızı-çizgi paneli. Veri database/data/risk-gates.json'dan gelir
 * (block: type "riskGateMatrix"). Mobile-first: base'de tek sütun.
 */
export type Severity = "low" | "medium" | "high" | "critical";
export type RiskGate = {
  risk: string;
  severity: Severity;
  metric: string;
  trigger: string;
  action: string;
  owner?: string;
};
export type RiskGateData = {
  risks: RiskGate[];
  reputationGuardrail?: { title: string; text: string; items: string[] };
};

const SEV: Record<Severity, { label: string; bg: string; color: string }> = {
  critical: { label: "kritik", bg: "ink", color: "white" },
  high: { label: "yüksek", bg: "gold", color: "ink" },
  medium: { label: "orta", bg: "surface", color: "ink" },
  low: { label: "düşük", bg: "surface", color: "inkMuted" },
};

function Line({ label, text, strong }: { label: string; text: string; strong?: boolean }) {
  return (
    <Box display="flex" gap="2" alignItems="flex-start">
      <Box as="span" fontSize="sm" fontWeight="bold" color={strong ? "grass" : "inkMuted"} flexShrink="0" minW="4.5em">
        {label}
      </Box>
      <P fontSize="sm" color="ink" lineHeight="1.4">
        <RichText text={text} />
      </P>
    </Box>
  );
}

export function RiskGateMatrix({ data }: { data: RiskGateData }) {
  if (!data || !data.risks || data.risks.length === 0) return null;
  const guard = data.reputationGuardrail;
  return (
    <Stack gap={{ base: "4", md: "5" }} align="stretch">
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: "3", md: "4" }}>
        {data.risks.map((r, i) => {
          const sev = SEV[r.severity] ?? SEV.medium;
          return (
            <Box key={i} {...cardBase()} display="flex" flexDirection="column" gap="1.5">
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap="2">
                <P fontWeight="bold" color="ink" fontSize="md" lineHeight="1.3">
                  <RichText text={r.risk} />
                </P>
                <Box
                  as="span"
                  flexShrink="0"
                  px="2"
                  py="0.5"
                  borderRadius="full"
                  bg={sev.bg}
                  color={sev.color}
                  fontSize="sm"
                  fontWeight="bold"
                  border="1px solid"
                  borderColor="line"
                  whiteSpace="nowrap"
                >
                  {sev.label}
                </Box>
              </Box>
              <Box display="flex" flexDirection="column" gap="1" mt="1">
                <Line label="Ölçüm:" text={r.metric} />
                <Line label="Eşik:" text={r.trigger} />
                <Line label="Aksiyon:" text={r.action} strong />
              </Box>
              {r.owner && (
                <P fontSize="sm" color="inkMuted" mt="1">
                  Sorumlu: {r.owner}
                </P>
              )}
            </Box>
          );
        })}
      </Grid>
      {guard && (
        <Box borderLeft="3px solid" borderColor="ink" bg="surface" p={{ base: "4", md: "5" }} borderRadius="0 surface surface 0">
          <P fontWeight="bold" color="ink" fontSize="lg" mb="2">
            <RichText text={guard.title} />
          </P>
          <P color="ink" fontSize="md" lineHeight="1.55" mb="3">
            <RichText text={guard.text} />
          </P>
          <Stack gap="1.5" align="stretch">
            {guard.items.map((it, i) => (
              <P key={i} fontSize="md" color="ink" lineHeight="1.4">
                <RichText text={it} />
              </P>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
