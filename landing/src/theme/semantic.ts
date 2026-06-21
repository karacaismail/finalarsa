import { palette } from "./palette";

/**
 * Anlamsal (semantic) roller — ham paletin "ne için kullanıldığı".
 * Bileşenler doğrudan hex değil, bu rolleri tüketir.
 * Değerler Chakra token ADI ("ink", "surface"…) veya ham hex olabilir; her ikisi de
 * Chakra renk prop'larında (color=, bg=, borderColor=) geçerlidir.
 */

/** Bölüm zemini: JSON'daki `background` değeri → Chakra token / hex. */
export const sectionBg: Record<string, string> = {
  "bg-1": "paper",
  "bg-2": "paperWarm",
  "bg-3": "surface",
  "bg-4": "paperWarm",
  "bg-end": "ink",
  dark: palette.darkBg,
};
export const sectionBorder = { default: "line", dark: palette.darkBorder };

/** Koyu bölümlerde metin renkleri (eski `D` objesi). */
export const darkText = {
  text: palette.darkText,
  muted: palette.darkMuted,
  eyebrow: palette.darkEyebrow,
  body: palette.darkBody,
} as const;

/** Kart tonu → metin / zemin / kenar. (eski toneText/toneBg/toneBorder) */
export const tone = {
  text: { accent: "grass", gold: "gold", warn: "warn", info: "inkMuted" } as Record<string, string>,
  bg: { accent: palette.tintGreen, gold: palette.tintGold, warn: palette.tintClay, info: "surface" } as Record<string, string>,
  border: { accent: palette.tintGreenBorder, gold: palette.tintGoldBorder, warn: palette.tintClayBorder, info: "line" } as Record<string, string>,
};

/** İddia etiketi (claim tag) rolleri: renk + zemin + açıklama. (eski tagMeta + tagDesc) */
export const claimTag: Record<string, { color: string; bg: string; desc: string }> = {
  "doğrulanmış kaynak": {
    color: "grassInk",
    bg: palette.verifiedBg,
    desc: "Resmi veya üçüncü taraf kaynakla doğrulanmış veri.",
  },
  "model varsayımı": {
    color: "gold",
    bg: palette.tintGold,
    desc: "Finansal modelin girdisi; kaynakla sabitlenmemiş bir varsayım.",
  },
  hedef: {
    color: "ink",
    bg: palette.targetBg,
    desc: "Şirketin ulaşmayı amaçladığı değer.",
  },
  "şirket tahmini": {
    color: "warn",
    bg: palette.tintClay,
    desc: "Şirketin öngörüsü; bağımsız doğrulama dışı.",
  },
};
