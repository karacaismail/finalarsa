import { Box } from "@chakra-ui/react";
import { Grid, P } from "../ui";
import { RichText } from "./RichText";
import { cardBase } from "../theme/components";

/**
 * CapitalReleasePlan — bütçe kapıları. Her dilim (0–30 / 31–60 / 61–90 / 90–180 gün) bir KANITA
 * bağlı açılır; kanıt yoksa harcama açılmaz. Yatırımcıya "para kontrolsüz yakılmıyor" güvencesi verir.
 * Veri database/data/capital-gates.json'dan gelir (block: type "capitalReleasePlan").
 * Mobile-first: base'de tek sütun, md'de 2 sütun.
 */
export type CapitalGate = {
  period: string;
  scope?: string;
  maxBudget?: string;
  opensWhen: string;
  stopsWhen: string;
  owner?: string;
};

export function CapitalReleasePlan({ gates }: { gates: CapitalGate[] }) {
  if (!gates || gates.length === 0) return null;
  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: "3", md: "4" }}>
      {gates.map((g, i) => (
        <Box key={i} {...cardBase()} display="flex" flexDirection="column" gap="2">
          <Box
            as="span"
            alignSelf="flex-start"
            px="2.5"
            py="0.5"
            borderRadius="full"
            bg="ink"
            color="white"
            fontSize="sm"
            fontWeight="bold"
            letterSpacing="0.02em"
          >
            {g.period}
          </Box>
          {g.scope && (
            <P fontWeight="medium" color="ink" fontSize="md" lineHeight="1.35">
              <RichText text={g.scope} />
            </P>
          )}
          {g.maxBudget && (
            <P fontSize="md" color="inkMuted">
              Azami bütçe: {g.maxBudget}
            </P>
          )}
          <Box display="flex" flexDirection="column" gap="1.5" mt="1">
            <Box display="flex" gap="2" alignItems="flex-start">
              <Box as="span" fontSize="sm" fontWeight="bold" color="grass" flexShrink="0" minW="4.5em">
                Açılır:
              </Box>
              <P fontSize="sm" color="ink" lineHeight="1.4">
                <RichText text={g.opensWhen} />
              </P>
            </Box>
            <Box display="flex" gap="2" alignItems="flex-start">
              <Box as="span" fontSize="sm" fontWeight="bold" color="ink" flexShrink="0" minW="4.5em">
                Durur:
              </Box>
              <P fontSize="sm" color="inkMuted" lineHeight="1.4">
                <RichText text={g.stopsWhen} />
              </P>
            </Box>
          </Box>
          {g.owner && (
            <P fontSize="sm" color="inkMuted" mt="1">
              Sorumlu: {g.owner}
            </P>
          )}
        </Box>
      ))}
    </Grid>
  );
}
