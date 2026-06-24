import { Box } from "@chakra-ui/react";
import { Grid, P, Stack } from "../ui";
import { RichText } from "./RichText";
import { cardBase } from "../theme/components";

/**
 * FinancialDecisionFrame — finans grafiklerine bakmadan önce KARAR ÇERÇEVESİ. Her finansal görünüm
 * için: karar sorusu (bu grafikte neye karar verilir), neye bakılacağı, iyi sonuç, kırmızı bayrak.
 * Yatırımcı "şu an hangi finansal sonuca bakmalıyım?" sorusunu yanıtlar. Grafikleri tek başına
 * göstermek yerine önce yorumlanma çerçevesini verir.
 * Veri database/data/financial-frames.json (block: type "financialDecisionFrame"). Mobile-first.
 */
export type FinancialFrame = {
  title: string;
  decisionQuestion: string;
  lookAt?: string;
  goodResult?: string;
  redFlags?: string[];
  dependsOn?: string;
};
export type FinancialFramesData = { intro?: string; frames: FinancialFrame[] };

function Row({ label, text }: { label: string; text: string }) {
  return (
    <Box display="flex" gap="2" alignItems="flex-start">
      <Box as="span" fontSize="sm" fontWeight="bold" color="inkMuted" flexShrink="0" minW="6.5em">
        {label}
      </Box>
      <P fontSize="sm" color="ink" lineHeight="1.4">
        <RichText text={text} />
      </P>
    </Box>
  );
}

export function FinancialDecisionFrame({ data }: { data: FinancialFramesData }) {
  if (!data || !data.frames || data.frames.length === 0) return null;
  return (
    <Stack gap={{ base: "3", md: "4" }} align="stretch">
      {data.intro && (
        <P fontSize="md" color="inkMuted" lineHeight="1.5" maxW="72ch">
          <RichText text={data.intro} />
        </P>
      )}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: "3", md: "4" }}>
        {data.frames.map((fr, i) => (
          <Box key={i} {...cardBase()} display="flex" flexDirection="column" gap="2">
            <Box
              as="span"
              alignSelf="flex-start"
              px="2"
              py="0.5"
              borderRadius="full"
              bg="surface"
              border="1px solid"
              borderColor="line"
              color="inkMuted"
              fontSize="sm"
              fontWeight="medium"
            >
              {fr.title}
            </Box>
            <P fontWeight="bold" color="ink" fontSize="md" lineHeight="1.3">
              <RichText text={fr.decisionQuestion} />
            </P>
            <Stack gap="1" align="stretch">
              {fr.lookAt && <Row label="Neye bak:" text={fr.lookAt} />}
              {fr.goodResult && <Row label="İyi sonuç:" text={fr.goodResult} />}
              {fr.redFlags && fr.redFlags.length > 0 && (
                <Box display="flex" gap="2" alignItems="flex-start">
                  <Box as="span" fontSize="sm" fontWeight="bold" color="inkMuted" flexShrink="0" minW="6.5em">
                    Kırmızı bayrak:
                  </Box>
                  <Stack gap="0.5" align="stretch">
                    {fr.redFlags.map((rf, j) => (
                      <P key={j} fontSize="sm" color="ink" lineHeight="1.4">
                        <RichText text={rf} />
                      </P>
                    ))}
                  </Stack>
                </Box>
              )}
              {fr.dependsOn && <Row label="Bağlı:" text={fr.dependsOn} />}
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
}
