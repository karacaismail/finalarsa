import { Box } from "@chakra-ui/react";
import { BlockView } from "../components/Blocks";
import { Stack } from "../ui";
import { OUTER_MAX } from "../theme/layout";
import type { PresentationSlide } from "./slides";

/**
 * Tek slaytı çizer. Zemin slaytın temasından gelir (açık/koyu). İçerik mevcut
 * BlockView ile çizilir (yeni bir render yolu yok); ctx.dark temaya göre verilir,
 * böylece metin renkleri zemine uyumlu ve okunur kalır.
 */
export function SlideView({ slide }: { slide: PresentationSlide }) {
  const { theme } = slide;
  const labelColor = theme.isDark ? "#b3a892" : "inkMuted";
  return (
    <Box
      h="100%"
      w="100%"
      bg={theme.bg}
      overflowY="auto"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Box w="100%" maxW={OUTER_MAX} mx="auto" px={{ base: "6", md: "12" }} py={{ base: "16", md: "16" }}>
        <Box
          as="p"
          mb={{ base: "6", md: "8" }}
          color={labelColor}
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="0.08em"
          fontSize="md"
        >
          {slide.nav.num} · {slide.nav.label}
        </Box>
        <Stack gap={{ base: "5", md: "6" }} align="stretch">
          {slide.blocks.map((b, i) => (
            <BlockView key={i} block={b} ctx={{ isHero: false, dark: theme.isDark }} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
