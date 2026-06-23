import { Box } from "@chakra-ui/react";
import type { Section } from "../data/types";
import { Grid, Stack } from "../ui";
import { sectionBg, sectionBorder } from "../theme/semantic";
import { BlockView } from "./Blocks";
import { HeroArt } from "./HeroArt";
import { Reveal } from "./Reveal";

/** Tek bölüm: semantik <section>, zemin JSON'daki `background` değerinden (merkezi sectionBg map). */
export function SectionView({ section, index }: { section: Section; index: number }) {
  const isHero = section.order === 1;
  // Koyu zeminli bölümler: "dark" (finansal) ve "bg-end" (kapanış/ink) → metin açık render edilir.
  const dark = section.background === "dark" || section.background === "bg-end";
  const bg = sectionBg[section.background] ?? (index % 2 === 0 ? "paper" : "paperWarm");
  const blocks = (
    <Stack gap={{ base: "5", md: "6" }} align="stretch">
      {section.blocks.map((b, i) => (
        <Reveal key={i} delay={Math.min(i * 0.05, 0.3)}>
          <BlockView block={b} ctx={{ isHero, dark }} />
        </Reveal>
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
      borderColor={dark ? sectionBorder.dark : sectionBorder.default}
      scrollMarginTop="84px"
    >
      <Box maxW="1200px" mx="auto" px={{ base: "5", md: "8" }} py={{ base: "12", md: isHero ? "24" : "20" }}>
        {isHero ? (
          (() => {
            // Hero düzeni — üç katman:
            // 1) head: eyebrow + başlık TAM GENİŞLİKTE üstte (uzun başlık ~2 satıra sığar).
            // 2) Grid: solda kısa giriş (lead/not/imza), SAĞ ÜSTTE illüstrasyon (yukarı hizalı).
            // 3) wide: "Tek bakışta…" başlığı + kart ızgarası + kapanış notu TAM GENİŞLİK şeritte
            //    (kartlar görselin sütununa sıkışmaz, konteyner genişliğine yayılır).
            const hi = section.blocks.findIndex((b) => b.type === "heading");
            const head = hi >= 0 ? section.blocks.slice(0, hi + 1) : section.blocks;
            const rest = hi >= 0 ? section.blocks.slice(hi + 1) : [];
            // Bölme noktası: ilk kart/stat ızgarası; hemen önceki başlık da tam-genişlik şeride dahil.
            const gi = rest.findIndex((b) => b.type === "cardGrid" || b.type === "statGrid");
            const splitAt = gi > 0 && rest[gi - 1]?.type === "heading" ? gi - 1 : gi;
            const aside = splitAt >= 0 ? rest.slice(0, splitAt) : rest;
            const wide = splitAt >= 0 ? rest.slice(splitAt) : [];
            return (
              <>
                <Stack gap={{ base: "4", md: "5" }} align="stretch">
                  {head.map((b, i) => (
                    <Reveal key={i} delay={Math.min(i * 0.06, 0.3)}>
                      <BlockView block={b} ctx={{ isHero, dark }} />
                    </Reveal>
                  ))}
                </Stack>
                <Grid
                  templateColumns={{ base: "1fr", lg: "1fr 0.82fr" }}
                  gap={{ base: "8", lg: "12" }}
                  alignItems={{ base: "center", lg: "start" }}
                  mt={{ base: "8", md: "10" }}
                >
                  <Stack gap={{ base: "5", md: "6" }} align="stretch">
                    {aside.map((b, i) => (
                      <Reveal key={i} delay={Math.min(i * 0.06, 0.3)}>
                        <BlockView block={b} ctx={{ isHero, dark }} />
                      </Reveal>
                    ))}
                  </Stack>
                  <HeroArt />
                </Grid>
                {wide.length > 0 && (
                  <Stack gap={{ base: "5", md: "6" }} align="stretch" mt={{ base: "10", md: "14" }}>
                    {wide.map((b, i) => (
                      <Reveal key={i} delay={Math.min(i * 0.05, 0.3)}>
                        <BlockView block={b} ctx={{ isHero, dark }} />
                      </Reveal>
                    ))}
                  </Stack>
                )}
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
