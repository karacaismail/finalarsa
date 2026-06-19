import { Box } from "@chakra-ui/react";
import * as echarts from "echarts";
import { useEffect, useRef } from "react";

/**
 * Apache ECharts için yalın React sarmalayıcı (framework-bağımsız echarts).
 * - SVG renderer (keskin + erişilebilirlik için daha iyi).
 * - ResizeObserver ile responsive.
 * - role="img" + aria-label ile temel erişilebilirlik; charts.ts içinde aria.enabled açık.
 */
export function EChart({
  option,
  height = 340,
  ariaLabel,
}: {
  option: echarts.EChartsCoreOption;
  height?: number;
  ariaLabel?: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!elRef.current) return;
    const chart = echarts.init(elRef.current, undefined, { renderer: "svg" });
    chartRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(elRef.current);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return (
    <Box
      ref={elRef}
      w="100%"
      h={`${height}px`}
      role="img"
      aria-label={ariaLabel}
      border="1px solid"
      borderColor="line"
      borderRadius="surface"
      bg="paper"
      p="2"
    />
  );
}
