import { palette, fx } from "./palette";
import { tone } from "./semantic";

/**
 * Bileşen rolleri — hazır stil objeleri. Bileşenler bunları spread eder.
 * Tek renk kararı bu katmandadır; bileşenlerde hex aranmaz.
 */

/** Ton bazlı kart (stat/card/note grupları). (eski cardBase) */
export const cardBase = (toneKey?: string) => ({
  border: "1px solid",
  borderColor: (toneKey && tone.border[toneKey]) || "line",
  borderRadius: "surface",
  bg: (toneKey && tone.bg[toneKey]) || "paper",
  p: { base: "5", md: "6" } as const,
});

/** Grafik/tablo sarmalayıcı (açık kart). (eski ChartViews `card`) */
export const chartCard = {
  border: "1px solid",
  borderColor: "line",
  borderRadius: "surface",
  bg: "paper",
  p: { base: "5", md: "6" },
} as const;

/**
 * Etkileşimli panel — içinde sekme/geçiş olan kartlar (chartTabs, marketScale).
 * Sayfadan ayrışan açık yeşil panel + gölge; koyu varyantı koyu bölümler için.
 */
export const interactivePanel = (dark?: boolean) => ({
  border: "1px solid",
  borderColor: dark ? fx.overlayWhite16 : palette.panelBorder,
  borderRadius: "surface",
  bg: dark ? fx.overlayWhite06 : palette.panelBg,
  bgImage: dark ? undefined : `linear-gradient(160deg, ${palette.panelGradFrom} 0%, ${palette.panelGradTo} 100%)`,
  boxShadow: dark ? fx.shadowCardDark : fx.shadowCard,
});

/** Söke örnek ilan kartı (panelMock) — ayrışan yeşil degrade + gölge. */
export const listingCard = {
  bg: palette.panelGradFrom,
  bgImage: `linear-gradient(155deg, ${palette.white} 0%, ${palette.panelMockGradTo} 100%)`,
  borderColor: palette.panelMockBorder,
  boxShadow: fx.shadowCard,
  divider: palette.tintGreenBorder,
};

/** "Doğrulandı" rozeti + check ikonu rengi. */
export const verifiedBadge = { bg: palette.verifiedBg, color: "grassInk" };
export const checkIcon = { circle: palette.verifiedBg, stroke: palette.green };

/**
 * Pill (segment/tab) kontrol — oluk track + seçili yükseltilmiş pill.
 * chartTabs ve marketScale aynı görünümü buradan alır (UI bütünlüğü).
 */
export const pill = {
  trackBg: (dark?: boolean) => (dark ? fx.overlayWhite10 : fx.grooveLight),
  trackBorder: (dark?: boolean) => (dark ? fx.overlayWhite18 : fx.grooveBorderLight),
  selectedBg: (dark?: boolean) => (dark ? palette.pillSelectedDark : "paper"),
  selectedShadow: fx.shadowPill,
  selectedShadowStrong: fx.shadowPillDark,
};

/** Grafik ızgara dokusu (MonthlySplit dönem zemini). */
export const grainBg: Record<string, string> = {
  ay: "paper",
  çeyrek: palette.grainQuarter,
  yarıyıl: palette.grainHalf,
  yıl: "surface",
};

/** Sunum modu kontrol renkleri. */
export const presentation = {
  ctrlHover: fx.overlayWhite16,
  progressTrack: fx.presProgressTrack,
  progressRange: palette.greenBright,
  badgeBg: fx.overlayBlack45,
  barBg: fx.presBar,
  barShadow: fx.shadowBar,
  chooserBg: fx.presChooser,
  chooserShadow: fx.shadowChooser,
  speedSelBg: palette.green,
  speedSelBorder: palette.greenBright,
  speedUnselBorder: fx.overlayWhite25,
  speedUnselHover: fx.overlayWhite14,
} as const;
