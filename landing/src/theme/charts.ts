import { palette } from "./palette";

/**
 * ECharts paleti — Chakra'dan bağımsız kopya DEĞİL; aynı ham paletten türer.
 * Böylece "yeşili değiştir" dendiğinde grafikler de tek kaynaktan güncellenir.
 * (charts.ts içindeki eski yerel `C` objesinin yerini alır.)
 */
export const chartPalette = {
  grass: palette.green,
  grassBright: palette.greenBright,
  gold: palette.goldBright,
  goldText: palette.gold,
  warn: palette.clayBright,
  warnText: palette.clay,
  ink: palette.ink,
  inkMuted: palette.inkMuted,
  line: palette.stone300,
  surface: palette.stone100,
} as const;

/** Grafik metni taban boyutu (px). Gövde metni büyüdüğü için yükseltildi. */
export const CHART_LABEL = 18;
