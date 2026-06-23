import { Box, chakra } from "@chakra-ui/react";
import { useState } from "react";
import type { Section } from "../data/types";
import { SectionView } from "./SectionView";
import { P } from "../ui";

/**
 * Tek accordion grubu — native <details>/<summary> üzerine kurulu (erişilebilir, klavyeyle
 * açılır/kapanır, 0 JS bağımlılığı). Stil Chakra token'larıyla verilir. Mobile-first:
 * 320px'te başlık tek satıra sığar, içerik tek sütun.
 *
 * Davranış: summary (başlık) tıklanınca/Enter-Space ile grup açılır-kapanır. open durumu
 * yerel state ile kontrol edilir (her grup bağımsız; birden çok grup aynı anda açık olabilir).
 * İçerikte önce grubun kısa özet cümlesi, sonra o gruba ait bölümler (SectionView, as="div")
 * gelir — böylece tek bir <section> yerine accordion içinde div kullanılır (nested section yok).
 */
const Details = chakra("details");
const Summary = chakra("summary");

type Group = { id: string; num: string; label: string; summary: string; sections: string[] };

export function AccordionGroup({
  group,
  sections,
  defaultOpen,
}: {
  group: Group;
  sections: Section[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const groupSections = group.sections
    .map((slug) => sections.find((s) => s.slug === slug))
    .filter((s): s is Section => Boolean(s));

  return (
    <Details
      open={open}
      onToggle={(e: { currentTarget: HTMLDetailsElement }) => setOpen(e.currentTarget.open)}
      css={{ "&[open] .acc-ind": { transform: "rotate(90deg)" } }}
      border="1px solid"
      borderColor="line"
      borderRadius="surface"
      bg="paper"
      overflow="hidden"
      boxShadow="0 1px 2px rgba(27,26,23,0.05)"
    >
      <Summary
        css={{ "&::-webkit-details-marker": { display: "none" } }}
        listStyleType="none"
        display="flex"
        alignItems="center"
        gap={{ base: "2.5", md: "3" }}
        cursor="pointer"
        px={{ base: "4", md: "6" }}
        py={{ base: "4", md: "5" }}
        minH="56px"
        bg="paper"
        _hover={{ bg: "surface" }}
        _focusVisible={{ outline: "2px solid", outlineColor: "grass", outlineOffset: "-3px" }}
      >
        <Box
          as="span"
          className="acc-ind"
          display="inline-flex"
          color="grass"
          flexShrink="0"
          transition="transform 0.2s ease"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Box>
        <Box as="span" fontSize="md" fontWeight="bold" color="grass" flexShrink="0" letterSpacing="0.02em">
          {group.num}
        </Box>
        <Box as="span" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="ink" lineHeight="1.2">
          {group.label}
        </Box>
      </Summary>

      <Box borderTop="1px solid" borderColor="line">
        <Box px={{ base: "4", md: "6" }} py={{ base: "4", md: "5" }} bg="surface">
          <P fontSize={{ base: "md", md: "lg" }} color="inkMuted" lineHeight="1.55" maxW="72ch">
            {group.summary}
          </P>
        </Box>
        {groupSections.map((s, i) => (
          <SectionView key={s.id} section={s} index={i} as="div" />
        ))}
      </Box>
    </Details>
  );
}
