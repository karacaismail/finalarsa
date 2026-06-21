import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * Aydınlık-minimal tema.
 * - Font: Roboto. Taban font boyutu 1rem (md). Bileşenlerde xs/sm metin KULLANILMAZ.
 * - Renkler WCAG 2.2 AA için iki katmanlı: "ink/text" tonları beyaz üzerinde >= 4.5:1 kontrast
 *   sağlar; "*Bright" tonları yalnız dekoratif dolgu/çubuk içindir (metin değil).
 */
// Global CSS (focus-visible, selection, reduced-motion, taban font) src/index.css'tedir.
const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Roboto', system-ui, -apple-system, Segoe UI, sans-serif" },
        body: { value: "'Roboto', system-ui, -apple-system, Segoe UI, sans-serif" },
      },
      // Kalınlık bir kademe artırıldı (yüklü Roboto basamakları: 400/500/700/900).
      fontWeights: {
        light: { value: "400" },
        normal: { value: "500" },
        medium: { value: "700" },
        bold: { value: "900" },
      },
      // Tipografi ölçeği ~1.5–1.7x büyütüldü (okunabilirlik). Spacing (rem) sabit kaldığından
      // yalnız yazı büyür; düzen/boşluklar orantısız şişmez. Tüm ölçek monoton tutuldu.
      fontSizes: {
        xs: { value: "1rem" },
        sm: { value: "1.2rem" },
        md: { value: "1.5rem" },
        lg: { value: "1.75rem" },
        xl: { value: "2.125rem" },
        "2xl": { value: "2.5rem" },
        "3xl": { value: "3rem" },
        "4xl": { value: "3.75rem" },
        "5xl": { value: "5rem" },
        "6xl": { value: "6.25rem" },
        "7xl": { value: "7.5rem" },
        "8xl": { value: "9rem" },
        "9xl": { value: "11rem" },
      },
      colors: {
        paper: { value: "#ffffff" },
        paperWarm: { value: "#faf9f5" },
        surface: { value: "#f4f3ee" },
        surfaceAlt: { value: "#efeee7" },
        line: { value: "#e2e1d9" },
        lineStrong: { value: "#c9c7bb" },
        ink: { value: "#1b1a17" }, // ~16:1 on white
        inkMuted: { value: "#56544c" }, // ~7:1 on white
        grass: { value: "#4d7c1f" }, // AA metin yeşili (~5.3:1)
        grassInk: { value: "#2f5512" }, // güçlü yeşil (~8.5:1)
        grassBright: { value: "#7cb342" }, // dekoratif dolgu
        gold: { value: "#876700" }, // AA metin altın (~5:1)
        goldBright: { value: "#cc9900" }, // dekoratif dolgu
        warn: { value: "#b14d1c" }, // AA metin turuncu (~4.8:1)
        warnBright: { value: "#e2723a" }, // dekoratif dolgu
      },
      radii: {
        control: { value: "0.5rem" },
        surface: { value: "0.75rem" },
        shell: { value: "1rem" },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: "{colors.paper}" },
        fg: { value: "{colors.ink}" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
