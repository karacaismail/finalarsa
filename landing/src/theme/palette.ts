/**
 * TEK KAYNAK — ham renk paleti (primitives).
 * Tüm tema (Chakra tokenları, semantic roller, bileşen stilleri, ECharts paleti)
 * bu dosyadan türer. Renk değiştirmek için BURASI tek karar noktasıdır.
 *
 * Not: Marka SVG'leri (HeroArt, LogoMark) kasıtlı olarak kendi inline renklerini
 * korur (marka asset'i). Burası UI tema renklerinin kaynağıdır.
 */
export const palette = {
  // nötr / kâğıt yüzeyler
  white: "#ffffff",
  cream: "#faf9f5",
  stone50: "#f6f5ef",
  stone100: "#f4f3ee",
  stone200: "#efeee7",
  stone250: "#ecebe4",
  stone300: "#e2e1d9",
  stone400: "#c9c7bb",
  footerMuted: "#b9b7ad",

  // mürekkep / metin
  ink: "#1b1a17",
  inkMuted: "#56544c",

  // yeşil — marka / arsa / başarı vurgusu
  green: "#4d7c1f",
  greenDeep: "#2f5512",
  greenBright: "#7cb342",

  // altın — yatırım / vurgu
  gold: "#876700",
  goldBright: "#cc9900",
  goldVivid: "#ffaa00",

  // kil/turuncu — risk / uyarı / gider
  clay: "#b14d1c",
  clayBright: "#e2723a",

  // koyu bölüm ailesi
  darkBg: "#211c16",
  darkBorder: "#3a332a",
  darkText: "#f4efe6",
  darkBody: "#e8e2d6",
  darkMuted: "#cdc6b8",
  darkEyebrow: "#b3a892",

  // ton tintleri (kart zeminleri / kenarları)
  tintGreen: "#f1f6ea",
  tintGreenBorder: "#cfe0b4",
  tintGold: "#fbf4df",
  tintGoldBorder: "#ecd9a0",
  tintClay: "#fbeee7",
  tintClayBorder: "#f0cdb6",
  verifiedBg: "#eef5e3",
  targetBg: "#ecebe4",

  // etkileşimli panel (içinde sekme/geçiş olan kartlar + Söke ilan kartı)
  panelBg: "#eef3e6",
  panelBorder: "#d6e3c4",
  panelGradFrom: "#f7faf1",
  panelGradTo: "#e9f0dd",
  panelMockGradTo: "#eef5e3",
  panelMockBorder: "#d8e6c4",

  // pill/segment seçili (koyu varyant)
  pillSelectedDark: "#43361f",

  // grafik (çağrı merkezi vb.) ızgara dokusu
  grainQuarter: "#faf9f5",
  grainHalf: "#f6f5ef",

  // marker (fosforlu kalem) — SVG sarısı
  markerYellow: "#ffe24a",
  markerYellowDeep: "#ffcf12",
} as const;

/**
 * Kompozit efekt değerleri (rgba overlay, gölge). Ham renkten türemeyen,
 * şeffaflık/gölge içeren sabitler burada toplanır.
 */
export const fx = {
  grooveLight: "rgba(27,40,12,0.06)",
  grooveBorderLight: "rgba(27,40,12,0.10)",
  overlayWhite06: "rgba(255,255,255,0.06)",
  overlayWhite10: "rgba(255,255,255,0.10)",
  overlayWhite14: "rgba(255,255,255,0.14)",
  overlayWhite16: "rgba(255,255,255,0.16)",
  overlayWhite18: "rgba(255,255,255,0.18)",
  overlayWhite25: "rgba(255,255,255,0.25)",
  overlayBlack45: "rgba(0,0,0,0.45)",
  headerGlass: "rgba(255,255,255,0.88)",
  presBar: "rgba(20,20,18,0.82)",
  presChooser: "rgba(20,20,18,0.96)",
  presProgressTrack: "rgba(128,128,128,0.25)",
  shadowCard: "0 16px 40px rgba(27,26,23,0.10), 0 4px 12px rgba(27,26,23,0.06)",
  shadowCardDark: "0 16px 40px rgba(0,0,0,0.28)",
  shadowPill: "0 1px 4px rgba(0,0,0,0.18)",
  shadowPillDark: "0 1px 4px rgba(0,0,0,0.22)",
  shadowPopover: "0 12px 32px rgba(0,0,0,0.16)",
  shadowChooser: "0 12px 32px rgba(0,0,0,0.4)",
  shadowBar: "0 8px 24px rgba(0,0,0,0.35)",
  shadowFab: "0 6px 20px rgba(0,0,0,0.18)",
  shadowMenu: "0 12px 32px rgba(0,0,0,0.18)",
} as const;
