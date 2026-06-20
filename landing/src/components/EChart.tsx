import { Box, Skeleton } from "@chakra-ui/react";
import type * as EChartsType from "echarts";
import { useEffect, useRef, useState } from "react";

/**
 * Apache ECharts için yalın React sarmalayıcı.
 * - echarts RUNTIME'ı tembel yüklenir (dynamic import): ana paketten ayrılır,
 *   ilk açılış küçülür. Grafik görünüme girince (IntersectionObserver) yüklenip çizilir.
 * - Yüklenene kadar Chakra <Skeleton> iskelet gösterilir (boş ekran yerine).
 * - SVG renderer (keskin + erişilebilir). ResizeObserver ile responsive.
 * - role="img" + aria-label + aria-busy ile erişilebilirlik.
 */

type EChartsModule = typeof import("echarts");
let echartsPromise: Promise<EChartsModule> | null = null;
function loadECharts(): Promise<EChartsModule> {
  if (!echartsPromise) echartsPromise = import("echarts");
  return echartsPromise;
}

export function EChart({
  option,
  height = 340,
  ariaLabel,
}: {
  option: EChartsType.EChartsCoreOption;
  height?: number;
  ariaLabel?: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType.ECharts | null>(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);

  // 1) Görünüme yaklaşınca yüklemeyi tetikle (ekran altındaki grafikler beklemez).
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 2) Görünür olunca echarts'ı yükle + grafiği başlat.
  useEffect(() => {
    if (!inView) return;
    let disposed = false;
    let ro: ResizeObserver | null = null;
    loadECharts().then((echarts) => {
      if (disposed || !elRef.current) return;
      const chart = echarts.init(elRef.current, undefined, { renderer: "svg" });
      chartRef.current = chart;
      chart.setOption(option, true);
      ro = new ResizeObserver(() => chart.resize());
      ro.observe(elRef.current);
      setReady(true);
    });
    return () => {
      disposed = true;
      ro?.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
    // option değişimi 3. effect'te ele alınır; burada sadece bir kez başlatılır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // 3) option değiştiğinde (ör. vergi slider'ı) grafiği güncelle.
  useEffect(() => {
    if (ready) chartRef.current?.setOption(option, true);
  }, [option, ready]);

  return (
    <Box position="relative" w="100%" h={`${height}px`}>
      {!ready && (
        <Skeleton
          loading
          position="absolute"
          inset="0"
          borderRadius="surface"
          aria-hidden="true"
        />
      )}
      <Box
        ref={elRef}
        w="100%"
        h="100%"
        role="img"
        aria-label={ariaLabel}
        aria-busy={!ready}
        border="1px solid"
        borderColor="line"
        borderRadius="surface"
        bg="paper"
        p="2"
        opacity={ready ? 1 : 0}
        transition="opacity 0.25s ease"
      />
    </Box>
  );
}
