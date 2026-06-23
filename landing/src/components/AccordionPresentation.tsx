import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { sections, getData } from "../data/resolve";
import { Stack } from "../ui";
import { AccordionGroup } from "./AccordionGroup";
import { DecisionSummaryBox } from "./DecisionSummaryBox";

/**
 * Tek sayfalık accordion sunumu. En üstte sabit Karar Kutusu, altında 8 ana accordion grubu.
 * Gruplama database/data/accordion-groups.json'dan gelir; her grup, kendi bölümlerini
 * (database/sections) SectionView ile render eder. Bölüm içerikleri tekrar edilmez.
 *
 * Tek-açık (akordeon) davranış: aynı anda yalnız BİR grup açık kalır. Açık grubun id'si
 * burada (openId) tutulur; bir grup açılınca açık olan diğeri otomatik kapanır. İlk grup
 * (Karar Özeti) açık başlar; açık gruba tekrar tıklanınca tümü kapanır.
 */
type Group = { id: string; num: string; label: string; summary: string; sections: string[] };
type DecisionItem = { label: string; value?: string; valueRef?: string; detail: string };
type GroupsDoc = {
  groups: Group[];
  decisionBox: { question: string; items: DecisionItem[] };
};

export function AccordionPresentation() {
  const doc = getData<GroupsDoc>("accordion-groups");
  const [openId, setOpenId] = useState<string | null>(doc.groups[0]?.id ?? null);
  return (
    <Box maxW="1264px" mx="auto" px={{ base: "4", md: "8" }} py={{ base: "8", md: "12" }}>
      <DecisionSummaryBox box={doc.decisionBox} />
      <Stack gap={{ base: "3", md: "4" }} mt={{ base: "8", md: "10" }} align="stretch">
        {doc.groups.map((g) => (
          <AccordionGroup
            key={g.id}
            group={g}
            sections={sections}
            isOpen={openId === g.id}
            onOpen={() => setOpenId(g.id)}
            onClose={() => setOpenId(null)}
          />
        ))}
      </Stack>
    </Box>
  );
}
