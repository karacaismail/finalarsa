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
      scrollMarginTop="84px"
    >
      <Box maxW="1200px" mx="auto" px={{ base: "5", md: "8" }} py={{ base: "12", md: isHero ? "24" : "20" }}>
        {isHero ? (
          (() => {
            // Hero: eyebrow + başlık TAM GENİŞLİKTE üstte (uzun başlık ~2 satıra sığar);
            // altında lead/not solda, illüstrasyon sağda.
            const hi = section.blocks.findIndex((b) => b.type === "heading");
            const head = hi >= 0 ? section.blocks.slice(0, hi + 1) : section.blocks;
            const rest = hi >= 0 ? section.blocks.slice(hi + 1) : [];
            return (
              <>
                <Stack gap={{ base: "4", md: "5" }} align="stretch">
                  {head.map((b, i) => (
                    <BlockView key={i} block={b} ctx={{ isHero, dark }} />
                  ))}
                </Stack>
                <Grid
                  templateColumns={{ base: "1fr", lg: "1fr 0.82fr" }}
                  gap={{ base: "8", lg: "12" }}
                  alignItems="center"
                  mt={{ base: "8", md: "10" }}
                >
                  <Stack gap={{ base: "5", md: "6" }} align="stretch">
                    {rest.map((b, i) => (
                      <BlockView key={i} block={b} ctx={{ isHero, dark }} />
                    ))}
                  </Stack>
                  <HeroArt />
                </Grid>
              </>
            );
          })()
        ) : (
          blocks
        )}
      </Box>
    </Box>
  );
}
