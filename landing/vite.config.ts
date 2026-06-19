import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Veri tek kaynağı ../database klasöründe. fs.allow ile dev sunucusuna üst dizine
// erişim verilir; build sırasında JSON'lar dist içine paketlenir (deploy'da database gerekmez).
// base: GitHub Pages proje sitesi https://<user>.github.io/finalarsa/ altında sunulur.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/finalarsa/" : "/",
  plugins: [react()],
  server: {
    fs: { allow: [".."] },
  },
}));
