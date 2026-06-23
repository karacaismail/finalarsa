import { Box } from "@chakra-ui/react";
import { sections, getData } from "../data/resolve";
import { Stack } from "../ui";
import { AccordionGroup } from "./AccordionGroup";
import { DecisionSummaryBox } from "./DecisionSummaryBox";

/**
 * Tek sayfalık accordion sunumu. En üstte sabit Karar Kutusu, altında 8 ana accordion grubu.
 * Gruplama database/data/accordion-groups.json'dan gelir; her grup, kendi bölümlerini
 * (database/sections) SectionView ile render eder. Bölüm içerikleri tekrar edilmez.
 * İlk grup (Karar Özeti) açık başlar; diğerleri kapalıdır (mobile-first, bilişsel yük düşük).
 */
type Group = { id: string; num: string; label: string; summary: string; sections: string[] };
type DecisionItem = { label: string; value?: string; valueRef?: string; detail: string };
type GroupsDoc = {
  groups: Group[];
  decisionBox: { question: string; items: DecisionItem[] };
};

export function AccordionPresentation() {
  const doc = getData<GroupsDoc>("accordion-groups");
  return (
    <Box maxW="1140px" mx="auto" px={{ base: "4", md: "8" }} py={{ base: "8", md: "12" }}>
      <DecisionSummaryBox box={doc.decisionBox} />
      <Stack gap={{ base: "3", md: "4" }} mt={{ base: "8", md: "10" }} align="stretch">
        {doc.groups.map((g, i) => (
          <AccordionGroup key={g.id} group={g} sections={sections} defaultOpen={i === 0} />
        ))}
      </Stack>
    </Box>
  );
}
