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
      // Tipografi ölçeği ~1.5–1.7x (okunabilirlik). Spacing (rem) sabit; yalnız yazı büyür.
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
