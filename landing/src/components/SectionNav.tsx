/**
 * ⚠️ ARTIK KULLANILMIYOR (2026-06) — App.tsx accordion sunumuna (AccordionPresentation) geçti;
 * bu bileşen şu an hiçbir yerden import EDİLMİYOR. İleride accordion-içi navigasyon/ayraç için
 * referans olarak duruyor. Silmeden önce landing/src genelinde import kullanımını kontrol et.
 */
import { Box, Portal, Tooltip } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { sections } from "../data/resolve";
import { Stack } from "../ui";
import { fx } from "../theme/palette";

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
  // Chakra Box, as="button" olsa da ref'i HTMLDivElement olarak tipler; uyum için Div.
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);

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

  // Mobil menü açıkken: body scroll-lock + Esc ile kapama + odak yönetimi.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      // Kapanınca odağı tetikleyen FAB'a geri ver.
      fabRef.current?.focus();
    };
  }, [open]);

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

      {/* Mobil/tablet: hamburger FAB — açıkken gizlenir (panelin KAPAT'ı devralır). */}
      <Box
        as="button"
        ref={fabRef}
        onClick={() => setOpen(true)}
        aria-label="Bölüm menüsü"
        aria-haspopup="dialog"
        aria-expanded={open}
        display={{ base: open ? "none" : "flex", xl: "none" }}
        position="fixed"
        right="4"
        bottom="4"
        zIndex="90"
        w="52px"
        h="52px"
        borderRadius="full"
        bg="grass"
        color="white"
        boxShadow={fx.shadowFab}
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

      {/* Mobil/tablet: tam-ekran modal overlay (scrim + OPAK panel). */}
      {open && (
        <Portal>
          <Box display={{ base: "block", xl: "none" }}>
            {/* Scrim: tüm ekranı kaplayan koyu yarı-saydam zemin; tıklayınca kapatır. */}
            <Box
              position="fixed"
              inset="0"
              bg={fx.overlayBlack45}
              zIndex="1000"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            {/* Panel: OPAK, tam-yükseklik, kaydırılabilir; scrim üstünde (z-index daha yüksek). */}
            <Box
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Bölümler"
              position="fixed"
              top="0"
              right="0"
              bottom="0"
              zIndex="1001"
              w="min(86vw, 320px)"
              bg="paper"
              color="ink"
              boxShadow={fx.shadowMenu}
              display="flex"
              flexDirection="column"
              maxH="100dvh"
              outline="none"
              css={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
                paddingRight: "env(safe-area-inset-right)",
              }}
            >
              {/* Başlık + KAPAT (X) */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px="4"
                py="3"
                borderBottom="1px solid"
                borderColor="line"
                flexShrink="0"
              >
                <Box as="span" fontSize="md" fontWeight="bold" color="ink">
                  Bölümler
                </Box>
                <Box
                  as="button"
                  onClick={() => setOpen(false)}
                  aria-label="Menüyü kapat"
                  w="40px"
                  h="40px"
                  borderRadius="control"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  bg="transparent"
                  color="ink"
                  border="none"
                  _hover={{ bg: "surface" }}
                >
                  {/* Phosphor "x" ikonu */}
                  <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z" />
                  </svg>
                </Box>
              </Box>
              {/* Kaydırılabilir liste */}
              <Box flex="1" overflowY="auto" p="2">
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
              </Box>
            </Box>
          </Box>
        </Portal>
      )}
    </>
  );
}
