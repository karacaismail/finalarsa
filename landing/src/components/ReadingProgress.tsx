import { Progress } from "@chakra-ui/react";
import { useEffect, useState } from "react";

/**
 * Sayfanın en üstünde sabit, ince okuma ilerleme çubuğu.
 * Sistem ne yapar: kullanıcı kaydırdıkça sayfanın ne kadarının okunduğunu (%)
 * Chakra <Progress> ile gösterir. Salt görsel; içeriği değiştirmez.
 */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const next = max > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / max) * 100)) : 0;
      setPct(next);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <Progress.Root
      value={pct}
      max={100}
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="2000"
      height="3px"
      bg="transparent"
      aria-label="Sayfa okuma ilerlemesi"
    >
      <Progress.Track height="3px" bg="transparent" borderRadius="0">
        <Progress.Range bg="grass" transition="width 0.1s linear" />
      </Progress.Track>
    </Progress.Root>
  );
}
