import { sections } from "../data/resolve";
import type { Block, Section } from "../data/types";

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

/* Arka plan paleti: açık ve koyu renkler dönüşümlü; her komşu slayt farklı zemin alır. */
const PALETTE: SlideTheme[] = [
  { bg: "#ffffff", isDark: false }, // kâğıt
  { bg: "#1f2a17", isDark: true }, // koyu orman yeşili
  { bg: "#eef4e6", isDark: false }, // açık adaçayı
  { bg: "#241c16", isDark: true }, // koyu kakao
  { bg: "#f7f2ea", isDark: false }, // açık krem
  { bg: "#1b2128", isDark: true }, // koyu arduvaz
  { bg: "#eef1ee", isDark: false }, // açık sis
  { bg: "#20201a", isDark: true }, // koyu mürekkep
];

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
  let g = 0;
  sections.forEach((sec, si) => {
    const groups = splitSection(sec);
    groups.forEach((blocks, di) => {
      slides.push({
        key: `${sec.slug}-${di}`,
        sectionIdx: si,
        nav: sec.nav,
        slug: sec.slug,
        isSectionStart: di === 0,
        blocks,
        theme: PALETTE[g % PALETTE.length],
      });
      g++;
    });
  });
  return slides;
}

export const presentationSlides: PresentationSlide[] = buildSlides();
