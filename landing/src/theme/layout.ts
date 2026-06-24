// Sunum genişliği TEK KAYNAK. OUTER = CONTENT + 2×(md sayfa boşluğu). Sihirli sayı buradan türer.
export const CONTENT_MAX_PX = 1200;
export const PAGE_GUTTER_MD_PX = 32; // Chakra px "8" = 2rem = 32px
export const CONTENT_MAX = `${CONTENT_MAX_PX}px`;        // "1200px"
export const OUTER_MAX = `${CONTENT_MAX_PX + 2 * PAGE_GUTTER_MD_PX}px`; // "1264px"
