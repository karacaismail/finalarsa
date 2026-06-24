import { Box, chakra, Popover, Portal } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { glossary } from "../data/resolve";
import { fx } from "../theme/palette";
import { escapeRegExp } from "../lib/regex";

/* Buton primitive'i chakra("button") ile kurulur: as="button" polimorfik tipinde
   "type" gibi buton öznitelikleri görünmediği için (Chakra v3 + React 19). */
const TermTrigger = chakra("button");

/**
 * Sözlük (glossary) etkileşimi.
 * Sistem ne yapar: metin içinde geçen jargon terimlerini (TAM, SAM, EİDS, take rate…)
 * otomatik bulur ve tıklanabilir hale getirir. Kullanıcı terime tıklayınca/dokununca
 * Chakra <Popover> açılır ve kısa tanım gösterilir.
 * Ne yapmaz: içeriği/metni değiştirmez; yalnız bilinen terimleri sarmalar. Tanımlar
 * tek kaynaktan gelir: database/shared/glossary.json.
 */

const terms: Record<string, string> = glossary.terms;

// Uzun terimleri önce eşle ("Status as a Service" < "service" gibi yanlış eşleşmeyi önler).
const sortedKeys = Object.keys(terms).sort((a, b) => b.length - a.length);

/**
 * Sınır: terimden önce/sonra harf veya rakam OLMAMALI (Türkçe harfler dahil, \p{L}).
 * Böylece "ART" kelimesi "kART" içinde eşleşmez; "EİDS"/"TAKBİS" doğru çalışır.
 * Büyük/küçük harfe duyarlı (acronim ve Başlık-Düzeni terimleri korunur).
 */
const TERM_RE = new RegExp(
  `(?<![\\p{L}\\p{N}])(${sortedKeys.map(escapeRegExp).join("|")})(?![\\p{L}\\p{N}])`,
  "gu",
);

function GlossaryTerm({ term, definition }: { term: string; definition: string }) {
  return (
    <Popover.Root positioning={{ placement: "top" }} lazyMount unmountOnExit>
      <Popover.Trigger asChild>
        <TermTrigger
          type="button"
          display="inline"
          appearance="none"
          bg="transparent"
          border="none"
          p="0"
          m="0"
          font="inherit"
          color="inherit"
          cursor="help"
          textDecoration="underline"
          textDecorationStyle="dotted"
          textUnderlineOffset="3px"
          textDecorationColor="currentColor"
          aria-label={`${term} — tanım`}
        >
          {term}
        </TermTrigger>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            maxW="288px"
            bg="paper"
            borderRadius="surface"
            border="1px solid"
            borderColor="line"
            boxShadow={fx.shadowPopover}
          >
            <Popover.Arrow>
              <Popover.ArrowTip />
            </Popover.Arrow>
            <Popover.Body p="4">
              <Box fontWeight="bold" color="ink" fontSize="md" mb="1">
                {term}
              </Box>
              <Box color="inkMuted" fontSize="md" lineHeight="1.5">
                {definition}
              </Box>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

/**
 * Düz metni alır; bilinen sözlük terimlerini <GlossaryTerm> ile sarar.
 * Geriye string + React düğümleri karışık dizi döndürür.
 */
export function linkGlossary(text: string, keyBase: string): ReactNode[] {
  if (!text) return [text];
  if (!sortedKeys.length) return [text];
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TERM_RE)) {
    const start = m.index ?? 0;
    const matched = m[1];
    if (start > last) out.push(text.slice(last, start));
    out.push(
      <GlossaryTerm key={`${keyBase}-g${i++}`} term={matched} definition={terms[matched]} />,
    );
    last = start + matched.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : [text];
}
