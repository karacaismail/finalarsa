import { Box } from "@chakra-ui/react";
import { Grid, P, Stack } from "../ui";
import { RichText } from "./RichText";
import { cardBase } from "../theme/components";

/**
 * InvestorReturnModel — yatırımcı getirisini SENARYO olarak gösterir (garanti değil): kötümser /
 * medyan / iyimser 2032 geliri + örnek çarpan + örnek şirket değeri; üç getiri yolu (değer artışı /
 * nakit / stratejik çıkış); sulanma & koruma notu; ve net "garanti değildir" uyarısı.
 * Veri database/data/investor-return-scenarios.json (block: type "investorReturnModel"). Mobile-first.
 */
export type ReturnScenario = { name: string; revenue2032?: string; multiple?: string; companyValue?: string; note?: string };
export type ReturnPath = { title: string; desc: string };
export type InvestorReturnData = {
  scenarios?: ReturnScenario[];
  paths?: ReturnPath[];
  dilutionNote?: string;
  disclaimer?: string;
};

export function InvestorReturnModel({ data }: { data: InvestorReturnData }) {
  const hasScenarios = !!data && !!data.scenarios && data.scenarios.length > 0;
  const hasPaths = !!data && !!data.paths && data.paths.length > 0;
  if (!hasScenarios && !hasPaths) return null;
  return (
    <Stack gap={{ base: "4", md: "5" }} align="stretch">
      {hasScenarios && (
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={{ base: "3", md: "4" }}>
          {data.scenarios!.map((s, i) => (
            <Box key={i} {...cardBase(i === 1 ? "accent" : undefined)} display="flex" flexDirection="column" gap="1.5">
              <P fontWeight="bold" color="ink" fontSize="lg">
                <RichText text={s.name} />
              </P>
              {s.revenue2032 && (
                <P fontSize="md" color="inkMuted">
                  2032 gelir:{" "}
                  <Box as="span" fontWeight="bold" color="ink">
                    {s.revenue2032}
                  </Box>
                </P>
              )}
              {s.multiple && (
                <P fontSize="md" color="inkMuted">
                  Çarpan: <RichText text={s.multiple} />
                </P>
              )}
              {s.companyValue && (
                <P fontSize="md" color="inkMuted">
                  Şirket değeri: <RichText text={s.companyValue} />
                </P>
              )}
              {s.note && (
                <P fontSize="sm" color="inkMuted" lineHeight="1.4" mt="1">
                  <RichText text={s.note} />
                </P>
              )}
            </Box>
          ))}
        </Grid>
      )}

      {hasPaths && (
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={{ base: "3", md: "4" }}>
          {data.paths!.map((p, i) => (
            <Box key={i} {...cardBase()} display="flex" flexDirection="column" gap="1">
              <P fontWeight="bold" color="grass" fontSize="md">
                <RichText text={p.title} />
              </P>
              <P fontSize="md" color="ink" lineHeight="1.45">
                <RichText text={p.desc} />
              </P>
            </Box>
          ))}
        </Grid>
      )}

      {data.dilutionNote && (
        <P fontSize="md" color="inkMuted" lineHeight="1.5">
          <Box as="span" fontWeight="bold" color="ink">Sulanma & koruma: </Box>
          <RichText text={data.dilutionNote} />
        </P>
      )}

      {data.disclaimer && (
        <Box border="1px solid" borderColor="lineStrong" bg="surface" p={{ base: "4", md: "5" }} borderRadius="surface">
          <P color="ink" fontSize="md" fontWeight="medium" lineHeight="1.5">
            <RichText text={data.disclaimer} />
          </P>
        </Box>
      )}
    </Stack>
  );
}
