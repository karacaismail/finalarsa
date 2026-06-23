import { Box } from "@chakra-ui/react";
import { getMetric } from "../data/resolve";
import { Grid, P } from "../ui";
import { RichText } from "./RichText";

/**
 * Karar Kutusu — accordion'ların ÜSTÜNDE sabit duran, "Bugün neye karar veriyoruz?"
 * sorusunu yanıtlayan kart. İçerik database/data/accordion-groups.json → decisionBox'tan gelir.
 * Rakamlar valueRef ile metrics.json'dan (tek kaynak) okunur; mock veri yoktur.
 */
type DecisionItem = { label: string; value?: string; valueRef?: string; detail: string };
type DecisionBox = { question: string; items: DecisionItem[] };

export function DecisionSummaryBox({ box }: { box: DecisionBox }) {
  return (
    <Box
      as="section"
      aria-label="Karar kutusu"
      border="2px solid"
      borderColor="grass"
      borderRadius="surface"
      bg="paper"
      p={{ base: "5", md: "6" }}
      boxShadow="0 2px 10px rgba(27,26,23,0.07)"
    >
      <P
        fontSize="md"
        fontWeight="bold"
        color="grass"
        textTransform="uppercase"
        letterSpacing="0.06em"
        mb="1"
      >
        Karar kutusu
      </P>
      <P
        as="h2"
        fontSize={{ base: "xl", md: "2xl" }}
        fontWeight="bold"
        color="ink"
        lineHeight="1.2"
        mb={{ base: "4", md: "5" }}
      >
        {box.question}
      </P>
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: "3", md: "4" }}>
        {box.items.map((it, i) => {
          const val = it.valueRef ? getMetric(it.valueRef)?.display ?? "" : it.value ?? "";
          return (
            <Box
              key={i}
              border="1px solid"
              borderColor="line"
              borderRadius="control"
              bg="surface"
              p="4"
            >
              <P
                fontSize="md"
                color="inkMuted"
                fontWeight="medium"
                textTransform="uppercase"
                letterSpacing="0.04em"
                mb="1"
              >
                {it.label}
              </P>
              <P fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="ink" lineHeight="1.15" mb="1.5">
                {val}
              </P>
              <P fontSize="md" color="inkMuted" lineHeight="1.5">
                <RichText text={it.detail} />
              </P>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
}
