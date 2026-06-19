import { Box } from "@chakra-ui/react";
import type { Section } from "../data/types";
import { Stack } from "../ui";
import { BlockView } from "./Blocks";

/** Tek bölüm: semantik <section>, aydınlık alternatif zemin, ortalı container. */
export function SectionView({ section, index }: { section: Section; index: number }) {
  const isHero = section.order === 1;
  const bg = index % 2 === 0 ? "paper" : "paperWarm";
  return (
    <Box
      as="section"
      id={section.slug}
      aria-label={section.nav.label}
      bg={bg}
      borderTop={index === 0 ? "none" : "1px solid"}
      borderColor="line"
      scrollMarginTop="72px"
    >
      <Box maxW="1100px" mx="auto" px={{ base: "5", md: "8" }} py={{ base: "12", md: isHero ? "24" : "20" }}>
        <Stack gap={{ base: "5", md: "6" }} align="stretch">
          {section.blocks.map((b, i) => (
            <BlockView key={i} block={b} ctx={{ isHero }} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
