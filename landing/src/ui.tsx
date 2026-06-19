import { chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";

/**
 * Layout primitive'leri de chakra("div") üzerine kurulur. Sebep: Chakra v3 Flex/Stack/Grid
 * bileşenleri React 19.2 tipleriyle çoklu element children'da `children` alanını kaybediyor.
 * Box (chakra.div) sorunsuz; bu yüzden aynı tabandan kısa-yol prop'lu sarmalayıcılar yazıldı.
 */
const Div = chakra("div");
type LayoutProps = Record<string, unknown> & { children?: ReactNode };

export function Flex({ direction, align, justify, wrap, gap, ...rest }: LayoutProps) {
  return (
    <Div
      display="flex"
      flexDirection={direction as never}
      alignItems={align as never}
      justifyContent={justify as never}
      flexWrap={wrap as never}
      gap={gap as never}
      {...rest}
    />
  );
}
export function Stack({ direction = "column", align, justify, gap, ...rest }: LayoutProps) {
  return (
    <Div
      display="flex"
      flexDirection={direction as never}
      alignItems={align as never}
      justifyContent={justify as never}
      gap={gap as never}
      {...rest}
    />
  );
}
export function HStack(props: LayoutProps) {
  return <Stack direction="row" align="center" {...props} />;
}
export function VStack(props: LayoutProps) {
  return <Stack direction="column" {...props} />;
}
export function Grid({ templateColumns, gap, ...rest }: LayoutProps) {
  return <Div display="grid" gridTemplateColumns={templateColumns as never} gap={gap as never} {...rest} />;
}

/**
 * Tipografi/tablo/liste primitive'leri doğrudan `chakra(...)` ile kurulur.
 * Sebep: Chakra v3 recipe bileşenleri (Heading/Text/Table/List/SimpleGrid) React 19.2
 * tipleriyle `children` alanını kaybediyor. chakra.* öğeleri children + stil prop'larını
 * sorunsuz kabul eder ve 1rem/AA için tam kontrol verir.
 */
export const A = chakra("a");
export const H1 = chakra("h1");
export const H2 = chakra("h2");
export const H3 = chakra("h3");
export const P = chakra("p");
export const Ul = chakra("ul");
export const Ol = chakra("ol");
export const Li = chakra("li");
export const Dl = chakra("dl");
export const Dt = chakra("dt");
export const Dd = chakra("dd");
export const Tbl = chakra("table");
export const Thead = chakra("thead");
export const Tbody = chakra("tbody");
export const Tr = chakra("tr");
export const Th = chakra("th");
export const Td = chakra("td");
export const Figure = chakra("figure");
export const FigCaption = chakra("figcaption");
export const Blockquote = chakra("blockquote");
