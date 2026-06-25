// ECharts React sarmalayıcı. init/setOption/dispose + pencere yeniden boyutlandırma.
import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export function EChart({ option, height = 320 }: { option: echarts.EChartsOption; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inst = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    inst.current = echarts.init(ref.current);
    const onResize = () => inst.current?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      inst.current?.dispose();
      inst.current = null;
    };
  }, []);

  // Veri değişince yeniden çiz (notMerge: true → eski seriler kalmaz).
  useEffect(() => {
    inst.current?.setOption(option, true);
  }, [option]);

  return <div ref={ref} style={{ width: "100%", height }} />;
}
