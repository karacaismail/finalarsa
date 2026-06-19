# finalarsa — arsam.net yatırımcı sunumu

Türkiye'nin ilk dikey arsa pazaryeri **arsam.net** için yatırımcı sunumu landing page'i.

- **Canlı:** https://karacaismail.github.io/finalarsa/
- **Stack:** Vite + React + TypeScript + Chakra UI (v3)
- **Tema:** aydınlık-minimal · Roboto · taban metin ≥ 1rem · WCAG 2.2 AA · mobile-first
- **Veri:** Tüm içerik ve rakamlar `database/` altındaki JSON dosyalarından gelir (tek kaynak).
  Uygulama bu JSON'ları build sırasında okur; rakamlar `database/shared/metrics.json`'da
  tek kaynaktır ve bölümlere `{{metric:key}}` / `valueRef` ile bağlanır.

## Yapı

```
database/   → yapısal içerik (shared/ · sections/ · data/ · manifest · reconciliation)
landing/    → Vite uygulaması
  src/
    data/     → JSON yükleyici + token/ref çözümleyici + tipler
    components/→ bölüm + blok render eşlemesi, veri görselleştirmeleri, AI-first panel
    theme.ts  → Chakra createSystem (renk/AA, Roboto, radius)
.github/workflows/deploy.yml → push'ta otomatik Pages yayını
```

## Geliştirme

```bash
cd landing
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ üretir (tsc -b && vite build)
```

`main` dalına her push, GitHub Actions ile build alıp GitHub Pages'e yayınlar.
