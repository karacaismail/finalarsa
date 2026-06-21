import { sections } from "../data/resolve";
import type { Block, Section } from "../data/types";
import { palette } from "../theme/palette";

/**
 * Sunum modu — slayt modeli.
 * Ne yapar: mevcut bölümleri "slayt"lara böler. Sistem kuralları:
 *  - Anlatı blokları (başlık/lead/not...) bir araya gelip 1 slayt olur.
 *  - Her görsel/büyük blok (grafik, marketScale, tablo, liste, kart ızgarası...) kendi slaytı olur;
 *    hemen önündeki anlatı blokları bağlam olarak o slayta taşınır.
 *  - chartTabs (sekmeli grafikler) → her sekme ayrı bir slayt olur.
 * Ne yapmaz: içeriği değiştirmez; yalnız aynı blokları sunum için yeniden gruplar.
 */

export interface SlideTheme {
  bg: string;
  isDark: boolean;
}

export interface PresentationSlide {
  key: string;
  sectionIdx: number;
  nav: { num: string; label: string };
  slug: string;
  isSectionStart: boolean; // bölümün ilk slaytı mı? (dikey kaydırma geçişi için)
  blocks: Block[];
  theme: SlideTheme;
}

/**
 * Arka plan: her slayt KENDİ BÖLÜMÜNÜN orijinal zeminini korur (yapay palet yok).
 * Böylece slayttan slayta sürekli açık/koyu yanıp sönme olmaz; site ile aynı kalır.
 * Orijinalde koyu olan tek bölüm (finansal/başabaş) koyu kalır; gerisi açık (kâğıt).
 * Açık bölümlerde site ile aynı çift ton (paper/paperWarm) kullanılır — gözle fark
 * edilmeyecek kadar yakın, dolayısıyla "değişim" hissi vermez.
 */
function themeForSection(section: Section, sectionIndex: number): SlideTheme {
  // Sayfayla aynı: koyu bölümler "dark" (finansal) ve "bg-end" (kapanış); gerisi açık (parite).
  // Renkler tek kaynaktan (palette).
  if (section.background === "dark") return { bg: palette.darkBg, isDark: true };
  if (section.background === "bg-end") return { bg: palette.ink, isDark: true };
  return { bg: sectionIndex % 2 === 0 ? palette.white : palette.cream, isDark: false };
}

/* Anlatı blokları: bir araya toplanır (büyük blokla aynı slayta bağlam olarak girer). */
const TEXT_TYPES = new Set(["eyebrow", "heading", "lead", "paragraph", "note", "claimLegend"]);

interface ChartTabItem {
  heading?: string;
  lead?: string;
  chartType: string;
  caption?: string;
  highlightYears?: string[];
}

function splitSection(section: Section): Block[][] {
  const out: Block[][] = [];
  let run: Block[] = [];
  const flush = () => {
    if (run.length) {
      out.push(run);
      run = [];
    }
  };

  for (const b of section.blocks) {
    if (b.type === "chartTabs") {
      flush();
      const items = ((b as Record<string, unknown>).items as ChartTabItem[]) ?? [];
      for (const it of items) {
        const blocks: Block[] = [];
        if (it.heading) blocks.push({ type: "heading", level: 3, text: it.heading });
        if (it.lead) blocks.push({ type: "lead", text: it.lead });
        blocks.push({
          type: "chart",
          chartType: it.chartType,
          caption: it.caption,
          highlightYears: it.highlightYears,
        });
        out.push(blocks);
      }
    } else if (TEXT_TYPES.has(b.type)) {
      run.push(b);
    } else {
      // büyük blok: biriken anlatıyı bağlam olarak al, birlikte bir slayt yap
      run.push(b);
      flush();
    }
  }
  flush();
  return out;
}

function buildSlides(): PresentationSlide[] {
  const slides: PresentationSlide[] = [];
  sections.forEach((sec, si) => {
    const theme = themeForSection(sec, si);
    const groups = splitSection(sec);
    groups.forEach((blocks, di) => {
      slides.push({
        key: `${sec.slug}-${di}`,
        sectionIdx: si,
        nav: sec.nav,
        slug: sec.slug,
        isSectionStart: di === 0,
        blocks,
        theme,
      });
    });
  });
  return slides;
}

export const presentationSlides: PresentationSlide[] = buildSlides();
