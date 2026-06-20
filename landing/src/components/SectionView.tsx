import { Box } from "@chakra-ui/react";
import type { Section } from "../data/types";
import { Grid, Stack } from "../ui";
import { BlockView } from "./Blocks";
import { HeroArt } from "./HeroArt";

/** Tek bölüm: semantik <section>, aydınlık alternatif zemin, ortalı container. */
export function SectionView({ section, index }: { section: Section; index: number }) {
  const isHero = section.order === 1;
  const dark = section.background === "dark";
  const bg = dark ? "#211c16" : index % 2 === 0 ? "paper" : "paperWarm";
  const blocks = (
    <Stack gap={{ base: "5", md: "6" }} align="stretch">
      {section.blocks.map((b, i) => (
        <BlockView key={i} block={b} ctx={{ isHero, dark }} />
      ))}
    </Stack>
  );
  return (
    <Box
      as="section"
      id={section.slug}
      aria-label={section.nav.label}
      bg={bg}
      borderTop={index === 0 ? "none" : "1px solid"}
      borderColor={dark ? "#3a332a" : "line"}
      scrollMarginTop="72px"
    >
      <Box maxW="1100px" mx="auto" px={{ base: "5", md: "8" }} py={{ base: "12", md: isHero ? "24" : "20" }}>
        {isHero ? (
          <Grid templateColumns={{ base: "1fr", lg: "1.05fr 0.95fr" }} gap={{ base: "10", lg: "12" }} alignItems="center">
            {blocks}
            <HeroArt />
          </Grid>
        ) : (
          blocks
        )}
      </Box>
    </Box>
  );
}
