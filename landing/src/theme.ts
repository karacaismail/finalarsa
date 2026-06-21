import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { palette } from "./theme/palette";

/**
 * Aydınlık-minimal tema — Chakra birleşimi.
 * Renk DEĞERLERİ tek kaynaktan gelir: src/theme/palette.ts. Burası yalnız bu paleti
 * Chakra tokenlarına bağlar + tipografi/radii + global renk stilleri (globalCss).
 * Global renkler (body/selection/focus) artık index.css'te ham hex değil; token'dan gelir.
 */
const config = defineConfig({
  globalCss: {
    "body, #root": { bg: "paper", color: "ink" },
    "::selection": { bg: "grassBright", color: "white" },
    "a:focus-visible, button:focus-visible, [tabindex]:focus-visible, [role='button']:focus-visible": {
      outline: "3px solid",
      outlineColor: "grass",
      outlineOffset: "2px",
      borderRadius: "2px",
    },
  },
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
      // AKIŞKAN tipografi: her token clamp(mobilMin, akışkan, masaüstüMax).
      // Kök rem 16px SABİT (spacing/radius değişmez); yalnız YAZI viewport ile ölçeklenir.
      // 320px'te min'e oturur (okunur, taşmaz), ≥1280px'te max'a ulaşır → masaüstü BİREBİR korunur.
      // (min→max eşlemesi 320px→1280px aralığında; aşağıda max'lar eski sabit değerlere eşit.)
      fontSizes: {
        xs: { value: "1rem" }, // 16px sabit (mikro etiket)
        sm: { value: "1.2rem" }, // 19.2px sabit
        md: { value: "clamp(1.0625rem, 0.9167rem + 0.729vw, 1.5rem)" }, // 17 → 24
        lg: { value: "clamp(1.125rem, 0.9167rem + 1.0417vw, 1.75rem)" }, // 18 → 28
        xl: { value: "clamp(1.25rem, 0.9583rem + 1.4583vw, 2.125rem)" }, // 20 → 34
        "2xl": { value: "clamp(1.5rem, 1.1667rem + 1.6667vw, 2.5rem)" }, // 24 → 40
        "3xl": { value: "clamp(1.5rem, 1rem + 2.5vw, 3rem)" }, // 24 → 48
        "4xl": { value: "clamp(1.75rem, 1.0833rem + 3.3333vw, 3.75rem)" }, // 28 → 60
        "5xl": { value: "clamp(2.125rem, 1.1667rem + 4.7917vw, 5rem)" }, // 34 → 80
        "6xl": { value: "clamp(2.5rem, 1.25rem + 6.25vw, 6.25rem)" }, // 40 → 100
        "7xl": { value: "clamp(2.75rem, 1.1667rem + 7.9167vw, 7.5rem)" }, // 44 → 120
        "8xl": { value: "clamp(3.25rem, 1.3333rem + 9.5833vw, 9rem)" }, // 52 → 144
        "9xl": { value: "clamp(3.75rem, 1.3333rem + 12.0833vw, 11rem)" }, // 60 → 176
      },
      // Renkler TEK KAYNAKTAN (palette.ts). Token adları korunur; değer palette'ten gelir.
      colors: {
        paper: { value: palette.white },
        paperWarm: { value: palette.cream },
        surface: { value: palette.stone100 },
        surfaceAlt: { value: palette.stone200 },
        line: { value: palette.stone300 },
        lineStrong: { value: palette.stone400 },
        ink: { value: palette.ink }, // ~16:1 on white
        inkMuted: { value: palette.inkMuted }, // ~7:1 on white
        grass: { value: palette.green }, // AA metin yeşili
        grassInk: { value: palette.greenDeep }, // güçlü yeşil
        grassBright: { value: palette.greenBright }, // dekoratif
        gold: { value: palette.gold }, // AA metin altın (küçük/badge)
        goldBright: { value: palette.goldBright }, // dekoratif
        goldVivid: { value: palette.goldVivid }, // parlak altın — başlık accent
        warn: { value: palette.clay }, // AA metin turuncu
        warnBright: { value: palette.clayBright }, // dekoratif
        sectionDark: { value: palette.darkBg }, // koyu bölüm zemini
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
