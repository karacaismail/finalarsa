import { Box, chakra, Progress } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Flex } from "../ui";
import { presentationSlides } from "./slides";
import { SlideView } from "./SlideView";

/**
 * Sunum modu (Keynote/PowerPoint gibi, aynı sayfada, tam ekran).
 * Kontroller — kim ne yapar:
 *  - Kullanıcı: ileri/geri düğmeleri veya klavye okları (→/↓ ileri, ←/↑ geri), Esc çıkış, F tam ekran, P oynat/duraklat.
 *  - Sistem: play'e basınca süre sorar [5,8,12,20,35,50,75 sn]; seçilen süreyle otomatik ilerler; tarayıcıda hatırlar.
 *  - Geçiş: bölümden bölüme dikey kaydırma; bölüm içi alt geçişler fade (silinerek).
 * İçeriği değiştirmez; mevcut bölümleri slayt olarak sunar.
 */

const Btn = chakra("button");
const SPEEDS = [5, 8, 12, 20, 35, 50, 75];
const STORE_KEY = "arsam_pres_interval";

function Icon({ path, size = 22 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
const I = {
  play: "M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82 16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128",
  pause: "M200 32h-32a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m-112 0H56a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h32a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16",
  left: "M165.66 202.34a8 8 0 0 1-11.32 11.32l-80-80a8 8 0 0 1 0-11.32l80-80a8 8 0 0 1 11.32 11.32L91.31 128Z",
  right: "M181.66 133.66l-80 80a8 8 0 0 1-11.32-11.32L164.69 128 90.34 53.66a8 8 0 0 1 11.32-11.32l80 80a8 8 0 0 1 0 11.32",
  x: "M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z",
  fs: "M216 48v40a8 8 0 0 1-16 0V67.31l-42.34 42.35a8 8 0 0 1-11.32-11.32L188.69 56H168a8 8 0 0 1 0-16h40a8 8 0 0 1 8 8M98.34 146.34L56 188.69V168a8 8 0 0 0-16 0v40a8 8 0 0 0 8 8h40a8 8 0 0 0 0-16H67.31l42.35-42.34a8 8 0 0 0-11.32-11.32M208 160a8 8 0 0 0-8 8v20.69l-42.34-42.35a8 8 0 0 0-11.32 11.32L188.69 200H168a8 8 0 0 0 0 16h40a8 8 0 0 0 8-8v-40a8 8 0 0 0-8-8M88 40H48a8 8 0 0 0-8 8v40a8 8 0 0 0 16 0V67.31l42.34 42.35a8 8 0 0 0 11.32-11.32L67.31 56H88a8 8 0 0 0 0-16",
  clock: "M128 40a96 96 0 1 0 96 96 96.11 96.11 0 0 0-96-96m0 176a80 80 0 1 1 80-80 80.09 80.09 0 0 1-80 80m64-80a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8V80a8 8 0 0 1 16 0v48h48a8 8 0 0 1 8 8",
};

export function PresentationMode({ open, onClose }: { open: boolean; onClose: () => void }) {
  const slides = presentationSlides;
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [interval, setIntervalSec] = useState<number>(() => {
    const v = typeof localStorage !== "undefined" ? Number(localStorage.getItem(STORE_KEY)) : 0;
    return SPEEDS.includes(v) ? v : 8;
  });
  const [chooser, setChooser] = useState<null | "start" | "change">(null);
  const [isFs, setIsFs] = useState(false);
  const prevIndexRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  const enterFullscreen = useCallback(() => {
    rootRef.current?.requestFullscreen?.().catch(() => {});
  }, []);
  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, []);

  const close = useCallback(() => {
    setAutoplay(false);
    setChooser(null);
    exitFullscreen();
    onClose();
  }, [exitFullscreen, onClose]);

  // açılış: baştan başla, gövde kaydırmasını kilitle, tam ekran iste (Play tıklaması bir kullanıcı jestidir)
  useEffect(() => {
    if (!open) return;
    setIndex(0);
    prevIndexRef.current = 0;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    enterFullscreen();
    const onFsChange = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [open, enterFullscreen]);

  // klavye
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown" || k === "PageDown" || k === " ") {
        e.preventDefault();
        next();
      } else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp") {
        e.preventDefault();
        prev();
      } else if (k === "Escape") {
        if (chooser) setChooser(null);
        else close();
      } else if (k === "Home") {
        setIndex(0);
      } else if (k === "End") {
        setIndex(total - 1);
      } else if (k.toLowerCase() === "f") {
        document.fullscreenElement ? exitFullscreen() : enterFullscreen();
      } else if (k.toLowerCase() === "p" || k.toLowerCase() === "k") {
        setAutoplay((a) => !a);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev, close, chooser, total, enterFullscreen, exitFullscreen]);

  // otomatik oynatma: her slaytta `interval` sn bekle, sonra ilerle; sonda dur
  useEffect(() => {
    if (!open || !autoplay) return;
    if (index >= total - 1) {
      setAutoplay(false);
      return;
    }
    const t = setTimeout(() => next(), interval * 1000);
    return () => clearTimeout(t);
  }, [open, autoplay, index, interval, total, next]);

  if (!open) return null;

  const slide = slides[index];
  const prevSlide = slides[prevIndexRef.current];
  const sectionChanged = !prevSlide || prevSlide.sectionIdx !== slide.sectionIdx;
  const goingNext = index >= prevIndexRef.current;
  const animClass = sectionChanged
    ? goingNext
      ? "pm-enter-next-section"
      : "pm-enter-prev-section"
    : "pm-enter-fade";
  prevIndexRef.current = index;

  const pickSpeed = (v: number) => {
    setIntervalSec(v);
    try {
      localStorage.setItem(STORE_KEY, String(v));
    } catch {
      /* yok say */
    }
    if (chooser === "start") setAutoplay(true);
    setChooser(null);
  };

  const ctrlBtn = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    w: "44px",
    h: "44px",
    borderRadius: "full",
    bg: "transparent",
    color: "white",
    border: "none",
    cursor: "pointer",
    _hover: { bg: "rgba(255,255,255,0.16)" },
    _disabled: { opacity: 0.35, cursor: "default" },
  } as const;

  return (
    <Box ref={rootRef} position="fixed" inset="0" zIndex="3000" bg={slide.theme.bg}>
      {/* Slayt (geçiş animasyonu key ile tetiklenir) */}
      <Box key={slide.key} className={animClass} position="absolute" inset="0">
        <SlideView slide={slide} />
      </Box>

      {/* Üst: ilerleme + sayaç + çıkış */}
      <Box position="absolute" top="0" left="0" right="0" px="4" pt="3" zIndex="2">
        <Progress.Root value={index + 1} max={total} size="xs" bg="transparent">
          <Progress.Track bg="rgba(128,128,128,0.25)" borderRadius="full">
            <Progress.Range bg="#7cb342" borderRadius="full" />
          </Progress.Track>
        </Progress.Root>
        <Flex justify="space-between" align="center" mt="2">
          <Box
            px="3"
            py="1"
            borderRadius="full"
            bg="rgba(0,0,0,0.45)"
            color="white"
            fontSize="md"
            fontWeight="medium"
          >
            {index + 1} / {total} · {slide.nav.num} {slide.nav.label}
          </Box>
          <Btn {...ctrlBtn} bg="rgba(0,0,0,0.45)" onClick={close} aria-label="Sunumdan çık (Esc)">
            <Icon path={I.x} />
          </Btn>
        </Flex>
      </Box>

      {/* Hız seçici (play'e basınca veya saat düğmesinde) */}
      {chooser && (
        <Flex
          position="absolute"
          bottom="84px"
          left="50%"
          transform="translateX(-50%)"
          zIndex="3"
          bg="rgba(20,20,18,0.96)"
          borderRadius="shell"
          p="3"
          gap="2"
          align="center"
          wrap="wrap"
          justify="center"
          maxW="92vw"
          boxShadow="0 12px 32px rgba(0,0,0,0.4)"
        >
          <Box color="white" fontSize="md" mr="1">
            Süre:
          </Box>
          {SPEEDS.map((s) => (
            <Btn
              key={s}
              onClick={() => pickSpeed(s)}
              px="3"
              h="40px"
              minW="48px"
              borderRadius="control"
              border="1px solid"
              borderColor={s === interval ? "#7cb342" : "rgba(255,255,255,0.25)"}
              bg={s === interval ? "#4d7c1f" : "transparent"}
              color="white"
              cursor="pointer"
              fontWeight="medium"
              _hover={{ bg: s === interval ? "#4d7c1f" : "rgba(255,255,255,0.14)" }}
            >
              {s} sn
            </Btn>
          ))}
        </Flex>
      )}

      {/* Alt kontrol çubuğu */}
      <Flex
        position="absolute"
        bottom="4"
        left="50%"
        transform="translateX(-50%)"
        zIndex="2"
        align="center"
        gap="1"
        bg="rgba(20,20,18,0.82)"
        borderRadius="full"
        px="2"
        py="1"
        boxShadow="0 8px 24px rgba(0,0,0,0.35)"
      >
        <Btn {...ctrlBtn} onClick={prev} disabled={index === 0} aria-label="Önceki (←)">
          <Icon path={I.left} />
        </Btn>
        <Btn
          {...ctrlBtn}
          onClick={() => (autoplay ? setAutoplay(false) : setChooser("start"))}
          aria-label={autoplay ? "Duraklat (P)" : "Otomatik oynat (P)"}
        >
          <Icon path={autoplay ? I.pause : I.play} />
        </Btn>
        <Btn {...ctrlBtn} onClick={next} disabled={index === total - 1} aria-label="Sonraki (→)">
          <Icon path={I.right} />
        </Btn>
        <Btn
          {...ctrlBtn}
          w="auto"
          px="3"
          gap="1"
          onClick={() => setChooser((c) => (c ? null : "change"))}
          aria-label="Otomatik oynatma süresi"
        >
          <Icon path={I.clock} size={18} />
          <Box as="span" fontSize="md" color="white">
            {interval} sn
          </Box>
        </Btn>
        <Btn
          {...ctrlBtn}
          onClick={() => (document.fullscreenElement ? exitFullscreen() : enterFullscreen())}
          aria-label={isFs ? "Tam ekrandan çık (F)" : "Tam ekran (F)"}
        >
          <Icon path={I.fs} />
        </Btn>
      </Flex>
    </Box>
  );
}
