import { Box, chakra } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getData } from "../data/resolve";
import { Flex, P, Stack } from "../ui";
import { darkText as D } from "../theme/semantic";
import { fx } from "../theme/palette";

/**
 * StrategyArsenal — Asimetrik strateji cephanesi.
 * Bu nedir: En güçlü 15 stratejiyi tam genişlik, alt alta gösterir; son kartlar giderek
 *   bulanıklaşır (teaser). "+470 strateji" düğmesi tüm envanteri modal içinde açar.
 * Ne yapar: Modal (arka plan overlay + çarpı ile kapatılır, Esc destekli) içinde, her küme
 *   tek bir accordion başlığıdır; bir başlık açılınca diğerleri kapanır (tek-açık).
 * Ne yapmaz: Veri üretmez; database/data/strategy-md.json'u okur (470 model, 5 küme).
 */

type Strat = { rank?: number; name: string; desc: string };
type Cluster = { title: string; items: Strat[] };
type ArsenalData = { top15: Strat[]; clusters: Cluster[]; totalModels?: number };

const Btn = chakra("button");

/** Son 3 karta artan blur: 13. hafif, 14. orta, 15. ağır (zor da olsa okunur). */
function blurPx(indexFromEnd: number): number {
  if (indexFromEnd === 0) return 5;
  if (indexFromEnd === 1) return 3;
  if (indexFromEnd === 2) return 1.5;
  return 0;
}

export function StrategyArsenal({ dark }: { dark?: boolean }) {
  const d = getData<ArsenalData>("strategy-md");
  const [open, setOpen] = useState(false);
  const [acc, setAcc] = useState<number | null>(0); // ilk küme açık başlar; tek-açık

  // Esc ile kapat + modal açıkken arka plan kaydırmasını kilitle
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const total = d.totalModels ?? 470;
  const cardBorder = dark ? "whiteAlpha.300" : "line";
  const cardBg = dark ? "whiteAlpha.50" : "paper";
  const titleColor = dark ? D.text : "ink";
  const descColor = dark ? D.muted : "inkMuted";

  return (
    <Box>
      {/* En güçlü 15 — tam genişlik, alt alta */}
      <Stack gap="3">
        {d.top15.map((s, i) => {
          const fromEnd = d.top15.length - 1 - i;
          const blur = blurPx(fromEnd);
          return (
            <Box
              key={i}
              border="1px solid"
              borderColor={cardBorder}
              bg={cardBg}
              borderRadius="surface"
              p={{ base: "4", md: "5" }}
              filter={blur ? `blur(${blur}px)` : undefined}
              opacity={blur ? 0.92 : 1}
              userSelect={blur ? "none" : undefined}
              aria-hidden={blur >= 5 ? "true" : undefined}
            >
              <Flex gap="3" align="flex-start">
                <Box
                  as="span"
                  flexShrink="0"
                  minW="2.4em"
                  h="2.4em"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="control"
                  bg={dark ? fx.overlayWhite10 : "surface"}
                  color="grass"
                  fontWeight="bold"
                  fontSize="md"
                >
                  {String(s.rank ?? i + 1).padStart(2, "0")}
                </Box>
                <Box>
                  <P fontWeight="bold" color={titleColor} fontSize="lg" lineHeight="1.25">
                    {s.name}
                  </P>
                  <P color={descColor} fontSize="md" mt="1" lineHeight="1.5">
                    {s.desc}
                  </P>
                </Box>
              </Flex>
            </Box>
          );
        })}
      </Stack>

      {/* +470 strateji düğmesi */}
      <Flex justify="center" mt="5">
        <Btn
          type="button"
          onClick={() => setOpen(true)}
          display="inline-flex"
          alignItems="center"
          gap="2"
          minH="48px"
          px="6"
          py="3"
          borderRadius="full"
          bg="grass"
          color="white"
          fontWeight="bold"
          fontSize="md"
          cursor="pointer"
          border="none"
          boxShadow={fx.shadowPill}
          _hover={{ bg: "grassInk" }}
        >
          + {total} strateji
        </Btn>
      </Flex>

      {/* Modal: arka plan overlay + çarpı ile kapanır; tek-açık accordion */}
      {open && (
        <Box
          position="fixed"
          inset="0"
          zIndex="2000"
          bg={fx.overlayBlack45}
          backdropFilter="blur(2px)"
          display="flex"
          alignItems="flex-start"
          justifyContent="center"
          p={{ base: "3", md: "8" }}
          overflowY="auto"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <Box
            role="dialog"
            aria-modal="true"
            aria-label={`Asimetrik strateji cephanesi · ${total} model`}
            onClick={(e) => e.stopPropagation()}
            position="relative"
            w="100%"
            maxW="940px"
            my={{ base: "2", md: "4" }}
            bg="paper"
            color="ink"
            borderRadius="shell"
            boxShadow={fx.shadowMenu}
            p={{ base: "5", md: "7" }}
          >
            {/* Kapat (çarpı) */}
            <Btn
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Kapat"
              position="absolute"
              top={{ base: "3", md: "4" }}
              right={{ base: "3", md: "4" }}
              w="44px"
              h="44px"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              bg="surface"
              color="ink"
              border="none"
              cursor="pointer"
              fontSize="xl"
              lineHeight="1"
              _hover={{ bg: "surfaceAlt" }}
            >
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z" />
              </svg>
            </Btn>

            <P fontSize="md" color="grass" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em">
              strateji cephanesi
            </P>
            <P fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="ink" lineHeight="1.2" mt="1" maxW="40ch">
              {total} model · 5 küme
            </P>
            <P fontSize="md" color="inkMuted" mt="2" mb="5" maxW="64ch">
              Kaynak: asimetrik tanıtım paradigmaları haritası. Bir küme başlığına tıkla — açılır, diğerleri kapanır.
            </P>

            {/* Accordion — tek açık */}
            <Stack gap="2">
              {d.clusters.map((c, ci) => {
                const isOpen = acc === ci;
                return (
                  <Box key={ci} border="1px solid" borderColor="line" borderRadius="surface" overflow="hidden">
                    <Btn
                      type="button"
                      onClick={() => setAcc(isOpen ? null : ci)}
                      aria-expanded={isOpen}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap="3"
                      w="100%"
                      minH="52px"
                      px={{ base: "4", md: "5" }}
                      py="3"
                      bg={isOpen ? "surface" : "paper"}
                      color="ink"
                      border="none"
                      cursor="pointer"
                      textAlign="start"
                      _hover={{ bg: "surface" }}
                    >
                      <Box as="span" fontWeight="bold" fontSize="md">
                        {c.title}
                        <Box as="span" color="inkMuted" fontWeight="normal">
                          {"  ·  "}
                          {c.items.length} model
                        </Box>
                      </Box>
                      <Box
                        as="span"
                        flexShrink="0"
                        aria-hidden="true"
                        transition="transform 0.2s ease"
                        transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                        color="grass"
                        fontWeight="bold"
                      >
                        <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
                          <path d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z" />
                        </svg>
                      </Box>
                    </Btn>
                    {isOpen && (
                      <Stack gap="0" px={{ base: "4", md: "5" }} py="2" borderTop="1px solid" borderColor="line">
                        {c.items.map((it, ii) => (
                          <Box key={ii} py="3" borderBottom={ii < c.items.length - 1 ? "1px solid" : undefined} borderColor="line">
                            <P fontWeight="medium" color="ink" fontSize="md">
                              <Box as="span" color="inkMuted" mr="2">
                                {String(ii + 1).padStart(2, "0")}
                              </Box>
                              {it.name}
                            </P>
                            {it.desc && (
                              <P color="inkMuted" fontSize="md" mt="0.5" lineHeight="1.5">
                                {it.desc}
                              </P>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
