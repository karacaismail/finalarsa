import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Canlı yol: https://karacaismail.github.io/finalarsa/finansal/
// (mevcut finalarsa Pages sitesinin alt-yolu olarak yayınlanır)
export default defineConfig({
  plugins: [react()],
  base: "/finalarsa/finansal/",
});
