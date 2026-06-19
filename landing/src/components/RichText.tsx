import { chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { getMetric, METRIC_TOKEN } from "../data/resolve";

const Strong = chakra("strong");
const Em = chakra("span");

/** Düz metin parçasında accent ifadesini renkli/koyu vurgular. */
function emphasizeAccent(text: string, accent: string | undefined, accentColor: string, keyBase: string): ReactNode[] {
  if (!accent || !text.includes(accent)) return [text];
  const out: ReactNode[] = [];
  const parts = text.split(accent);
  parts.forEach((p, i) => {
    if (p) out.push(p);
    if (i < parts.length - 1) {
      out.push(
        <Em key={`${keyBase}-a${i}`} color={accentColor} fontWeight="medium">
          {accent}
        </Em>,
      );
    }
  });
  return out;
}

interface RichTextProps {
  text: string;
  accent?: string;
  /** accent ve metrik değerleri için AA-uyumlu renk token'ı. */
  accentColor?: string;
}

/**
 * {{metric:key}} token'larını metrik display değeriyle (koyu/strong) değiştirir;
 * accent ifadesini renkli vurgular. Rakamlar tek kaynaktan (metrics) gelir.
 */
export function RichText({ text, accent, accentColor = "grass" }: RichTextProps) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let idx = 0;
  text.replace(METRIC_TOKEN, (match, key: string, offset: number) => {
    if (offset > last) {
      nodes.push(...emphasizeAccent(text.slice(last, offset), accent, accentColor, `t${idx}`));
    }
    const m = getMetric(key);
    nodes.push(
      <Strong key={`m${idx++}`} fontWeight="bold" color="ink" whiteSpace="nowrap">
        {m?.display ?? `«${key}»`}
      </Strong>,
    );
    last = offset + match.length;
    return match;
  });
  if (last < text.length) {
    nodes.push(...emphasizeAccent(text.slice(last), accent, accentColor, `t${idx}`));
  }
  return <>{nodes}</>;
}
