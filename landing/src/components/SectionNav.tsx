import { Box, Popover, Portal, Tooltip } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { sections } from "../data/resolve";
import { Flex, Stack } from "../ui";

/**
 * Bölüm navigasyonu (17 bölüm).
 * Sistem ne yapar:
 *  - Masaüstü (xl+): sağ kenarda dikey nokta-ray; aktif bölüm vurgulanır,
 *    her noktada Tooltip ile bölüm adı; tıklayınca yumuşak kaydırma.
 *  - Mobil/tablet: sağ-altta Popover menü düğmesi; liste açılır, seçince kaydırır.
 * Aktif bölüm IntersectionObserver ile belirlenir (kullanıcı kaydırdıkça güncellenir).
 * İçeriği değiştirmez; yalnız gezinme katmanıdır.
 */
export function SectionNav() {
  const [active, setActive] = useState(sections[0]?.slug ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.slug))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive((visible[0].target as HTMLElement).id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (slug: string) => {
    document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <>
      {/* Masaüstü: sağ nokta-ray */}
      <Box
        as="nav"
        aria-label="Bölümler"
        display={{ base: "none", xl: "flex" }}
        position="fixed"
        right="5"
        top="50%"
        transform="translateY(-50%)"
        zIndex="90"
        flexDirection="column"
        gap="1"
      >
        {sections.map((s) => {
          const isActive = s.slug === active;
          return (
            <Tooltip.Root key={s.slug} openDelay={120} closeDelay={80} positioning={{ placement: "left" }}>
              <Tooltip.Trigger asChild>
                <Box
                  as="button"
                  onClick={() => go(s.slug)}
                  aria-label={`${s.nav.num} · ${s.nav.label}`}
                  aria-current={isActive ? "true" : undefined}
                  w="24px"
                  h="24px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  bg="transparent"
                  border="none"
                >
                  <Box
                    w={isActive ? "12px" : "8px"}
                    h={isActive ? "12px" : "8px"}
                    borderRadius="full"
                    bg={isActive ? "grass" : "lineStrong"}
                    transition="all 0.18s ease"
                  />
                </Box>
              </Tooltip.Trigger>
              <Portal>
                <Tooltip.Positioner>
                  <Tooltip.Content bg="ink" color="white" px="3" py="1.5" borderRadius="control" fontSize="md">
                    {s.nav.num} · {s.nav.label}
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Portal>
            </Tooltip.Root>
          );
        })}
      </Box>

      {/* Mobil/tablet: Popover menü */}
      <Box display={{ base: "block", xl: "none" }} position="fixed" right="4" bottom="4" zIndex="90">
        <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)} positioning={{ placement: "top-end" }}>
          <Popover.Trigger asChild>
            <Box
              as="button"
              aria-label="Bölüm menüsü"
              w="52px"
              h="52px"
              borderRadius="full"
              bg="grass"
              color="white"
              boxShadow="0 6px 20px rgba(0,0,0,0.18)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              border="none"
            >
              {/* Phosphor "list" ikonu (SVG, CDN bağımsız) */}
              <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8M40 72h176a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16m176 112H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16" />
              </svg>
            </Box>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content maxH="70vh" overflowY="auto" w="260px" borderRadius="surface" boxShadow="0 12px 32px rgba(0,0,0,0.18)">
                <Popover.Body p="2">
                  <Stack gap="0">
                    {sections.map((s) => {
                      const isActive = s.slug === active;
                      return (
                        <Box
                          as="button"
                          key={s.slug}
                          onClick={() => go(s.slug)}
                          aria-current={isActive ? "true" : undefined}
                          textAlign="start"
                          display="flex"
                          alignItems="baseline"
                          gap="2"
                          w="100%"
                          px="3"
                          py="2"
                          borderRadius="control"
                          cursor="pointer"
                          bg={isActive ? "surface" : "transparent"}
                          color={isActive ? "grass" : "ink"}
                          border="none"
                          _hover={{ bg: "surface" }}
                        >
                          <Box as="span" fontSize="md" color="inkMuted" fontWeight="medium" minW="2.2em">
                            {s.nav.num}
                          </Box>
                          <Box as="span" fontSize="md" fontWeight={isActive ? "bold" : "normal"}>
                            {s.nav.label}
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      </Box>
    </>
  );
}
