import { Box } from "@chakra-ui/react";
import { getMetric } from "../data/resolve";
import { Grid, P, Stack } from "../ui";
import { RichText } from "./RichText";
import { cardBase } from "../theme/components";

/**
 * InvestmentOptionsCompare — yatırım seçeneklerini kart metnine gömülü olmaktan çıkarıp
 * karşılaştırılabilir alanlara açar: tutar, hisse, değerleme, finanse ettiği, kapattığı risk, rol.
 * Üstte model sermayesi (40M) ile seçenek tutarları arasındaki KÖPRÜ açıklanır — yatırımcının
 * "model 40M diyor, benden 15M mi isteniyor?" sorusunu yanıtlar.
 * Veri database/data/investment-options.json (block: type "investmentOptionsCompare"). Mobile-first.
 */
export type InvestmentOption = {
  name: string;
  amount?: string;
  amountRef?: string;
  equity?: string;
  equityRef?: string;
  valuation?: string;
  valuationRef?: string;
  funds?: string[];
  closesRisk?: string[];
  investorRole?: string;
  recommended?: boolean;
};
export type InvestmentOptionsData = {
  modelCapital?: { label: string; value: string; note?: string };
  bridgeNote?: string;
  options: InvestmentOption[];
};

const res = (v?: string, ref?: string) => (ref ? getMetric(ref)?.display ?? v ?? "" : v ?? "");

function List({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <Box>
      <P fontSize="sm" fontWeight="bold" color="inkMuted" textTransform="uppercase" letterSpacing="0.03em">
        {title}
      </P>
      <Stack gap="0.5" mt="0.5" align="stretch">
        {items.map((x, j) => (
          <P key={j} fontSize="sm" color="ink" lineHeight="1.4">
            <RichText text={x} />
          </P>
        ))}
      </Stack>
    </Box>
  );
}

export function InvestmentOptionsCompare({ data }: { data: InvestmentOptionsData }) {
  if (!data || !data.options || data.options.length === 0) return null;
  return (
    <Stack gap={{ base: "4", md: "5" }} align="stretch">
      {data.modelCapital && (
        <Box {...cardBase("info")}>
          <P fontSize="md" color="inkMuted" fontWeight="medium" textTransform="uppercase" letterSpacing="0.04em">
            {data.modelCapital.label}
          </P>
          <P fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="ink" lineHeight="1.05" mt="1">
            {data.modelCapital.value}
          </P>
          {data.modelCapital.note && (
            <P color="ink" mt="2" fontSize="md" lineHeight="1.5">
              <RichText text={data.modelCapital.note} />
            </P>
          )}
        </Box>
      )}

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={{ base: "3", md: "4" }}>
        {data.options.map((o, i) => (
          <Box
            key={i}
            {...cardBase(o.recommended ? "accent" : undefined)}
            display="flex"
            flexDirection="column"
            gap="2"
            borderWidth={o.recommended ? "2px" : undefined}
            borderColor={o.recommended ? "grass" : undefined}
          >
            {o.recommended && (
              <Box as="span" alignSelf="flex-start" px="2" py="0.5" borderRadius="full" bg="grass" color="white" fontSize="sm" fontWeight="bold">
                Önerilen
              </Box>
            )}
            <P fontWeight="bold" color="ink" fontSize="lg" lineHeight="1.2">
              <RichText text={o.name} />
            </P>
            {res(o.amount, o.amountRef) && (
              <P fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="ink" lineHeight="1.05" letterSpacing="-0.01em">
                {res(o.amount, o.amountRef)}
              </P>
            )}
            <P fontSize="md" color="inkMuted">
              {[
                res(o.equity, o.equityRef) && `Hisse: ${res(o.equity, o.equityRef)}`,
                res(o.valuation, o.valuationRef) && `Değerleme: ${res(o.valuation, o.valuationRef)}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </P>
            {o.investorRole && (
              <P fontSize="md" color="ink" mt="1" lineHeight="1.4">
                <Box as="span" fontWeight="bold">Rol: </Box>
                <RichText text={o.investorRole} />
              </P>
            )}
            <List title="Finanse eder" items={o.funds} />
            <List title="Kapattığı risk" items={o.closesRisk} />
          </Box>
        ))}
      </Grid>

      {data.bridgeNote && (
        <Box borderLeft="3px solid" borderColor="grass" bg="surface" p={{ base: "4", md: "5" }} borderRadius="0 surface surface 0">
          <P color="ink" fontSize="md" lineHeight="1.55">
            <RichText text={data.bridgeNote} />
          </P>
        </Box>
      )}
    </Stack>
  );
}
