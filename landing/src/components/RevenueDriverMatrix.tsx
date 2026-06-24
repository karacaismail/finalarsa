import { Box } from "@chakra-ui/react";
import { Grid, P, Stack } from "../ui";
import { RichText } from "./RichText";
import { cardBase } from "../theme/components";

/**
 * RevenueDriverMatrix — yatırımcıya "5,5 milyar ₺ medyan gelir" demek yerine, bu geliri büyütecek
 * KÜÇÜK operasyonel göstergeleri (sürücüleri) gösterir. Her gelir akışı için: sürücü KPI, ilk kanıt,
 * 2032 hedefle ilişki. Veri database/data/revenue-drivers.json (block: type "revenueDriverMatrix").
 * Mobile-first: base'de tek sütun, md'de 2.
 */
export type RevenueDriver = { stream: string; driver: string; firstEvidence: string; relation2032: string };
export type RevenueDriverData = { intro?: string; drivers: RevenueDriver[] };

function Field({ label, text }: { label: string; text: string }) {
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

export function RevenueDriverMatrix({ data }: { data: RevenueDriverData }) {
  if (!data || !data.drivers || data.drivers.length === 0) return null;
  return (
    <Stack gap={{ base: "3", md: "4" }} align="stretch">
      {data.intro && (
        <P fontSize="md" color="inkMuted" lineHeight="1.5" maxW="72ch">
          <RichText text={data.intro} />
        </P>
      )}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: "3", md: "4" }}>
        {data.drivers.map((d, i) => (
          <Box key={i} {...cardBase()} display="flex" flexDirection="column" gap="1.5">
            <P fontWeight="bold" color="ink" fontSize="md">
              <RichText text={d.stream} />
            </P>
            <Box display="flex" flexDirection="column" gap="1">
              <Field label="Sürücü:" text={d.driver} />
              <Field label="İlk kanıt:" text={d.firstEvidence} />
              <Field label="2032 ilişki:" text={d.relation2032} />
            </Box>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
}
