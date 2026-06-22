import { Box } from "@chakra-ui/react";
import { P } from "../ui";
import { palette } from "../theme/palette";

/**
 * SectionDivider — Bölümler arası GEÇİŞ bandı.
 * Bu nedir: İki açık (kâğıt) bölüm arasına giren, düz ve YÜKSEK DOYGUNLUKLU renk bandı.
 * Ne yapar: Geçişi tartışmasız belirgin kılar (açık zemin → koyu/doygun bant → açık zemin);
 *   konuyla ilgili bir özlü sözü (strateji/Rus klasiği/pazarlama duayeni) yazarıyla gösterir.
 * Kontrast: Metin/bant kontrastı WCAG AAA üstüdür (≥7:1) — her tema bg+fg AAA seçilmiştir.
 */

type DividerTheme = "grass" | "ink" | "gold" | "clay";

const THEMES: Record<DividerTheme, { bg: string; fg: string; sub: string }> = {
  // grassInk #2f5512 + beyaz ≈ 8:1 (AAA)
  grass: { bg: palette.greenDeep, fg: palette.white, sub: "rgba(255,255,255,0.80)" },
  // ink #1b1a17 + beyaz ≈ 16:1 (AAA)
  ink: { bg: palette.ink, fg: palette.white, sub: "rgba(255,255,255,0.74)" },
  // goldVivid #ffaa00 + ink ≈ 8:1 (AAA) — koyu metin parlak altın üzerinde
  gold: { bg: palette.goldVivid, fg: palette.ink, sub: "rgba(27,26,23,0.74)" },
  // koyu kil #8a3a15 + beyaz ≈ 7.5:1 (AAA) — risk/tehlike tonu
  clay: { bg: "#8a3a15", fg: palette.white, sub: "rgba(255,255,255,0.82)" },
};

export function SectionDivider({
  quote,
  author,
  theme = "ink",
}: {
  quote: string;
  author: string;
  theme?: DividerTheme;
}) {
  const t = THEMES[theme] ?? THEMES.ink;
  return (
    <Box
      as="blockquote"
      m="0"
      bg={t.bg}
      color={t.fg}
      py={{ base: "10", md: "16" }}
      px={{ base: "6", md: "8" }}
    >
      <Box maxW="1000px" mx="auto" textAlign="center">
        <P
          fontSize={{ base: "xl", md: "3xl" }}
          fontWeight="bold"
          lineHeight="1.3"
          letterSpacing="-0.01em"
          color={t.fg}
          textWrap="balance"
        >
          “{quote}”
        </P>
        <P
          as="cite"
          display="block"
          fontStyle="normal"
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="medium"
          mt={{ base: "3", md: "4" }}
          color={t.sub}
          textTransform="uppercase"
          letterSpacing="0.08em"
        >
          {author}
        </P>
      </Box>
    </Box>
  );
}
