import { Box, chakra } from "@chakra-ui/react";
import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import { Dd, Dl, Dt, P, Stack } from "../ui";
import { darkText as D } from "../theme/semantic";

/**
 * MobileTableCards — Bir tabloyu MOBİLDE kart listesine çevirir.
 *
 * Bu nedir: Yalnız mobil (kart) görünümü üreten görsel bileşen.
 * Ne yapar: Her satırı bir <article> kartına çevirir; satır başlığı (rowTitleIndex) kart
 *   başlığı olur, "primary" kolonlar açık <dl> (etiket: değer) olarak görünür, "detail"
 *   kolonlar bir "Detay" açılır-kapanır düğmesinin (≥44px dokunma hedefi) arkasına gizlenir.
 * Ne YAPMAZ: Masaüstü tablo render ETMEZ. Masaüstü/tablet tabloya hiç dokunulmaz; çağıran
 *   bileşen mevcut <table>'ı CSS ile (display base:none, md:block) gizler, bu kartları da
 *   (display base:block, md:none) gösterir. Böylece masaüstü BİREBİR korunur, geçiş JS'siz
 *   (flash yok) olur ve 320px'te yatay kaydırma biter.
 *
 * Hücreler ReactNode'dur: çağıran fmt()/renk/işaret gibi biçimlendirmeyi koruyarak geçirir.
 */
export interface MobileTableCardsProps {
  /** Sütun başlıkları (mobilde etiket olarak kullanılır). */
  columns: string[];
  /** Önceden render edilmiş hücreler (fmt/renk korunur). */
  rows: ReactNode[][];
  /** Kart başlığı kolonu (varsayılan 0). */
  rowTitleIndex?: number;
  /** Mobilde açık görünecek kolon indeksleri (başlık hariç). Verilmezse: başlık dışı hepsi. */
  primary?: number[];
  /** "Detay" altına gizlenecek kolon indeksleri. */
  detail?: number[];
  dark?: boolean;
}

const Btn = chakra("button");

function Card({
  columns,
  row,
  titleIndex,
  primaryCols,
  detailCols,
  dark,
}: {
  columns: string[];
  row: ReactNode[];
  titleIndex: number;
  primaryCols: number[];
  detailCols: number[];
  dark: boolean;
}) {
  const [open, setOpen] = useState(false);

  const titleColor = dark ? D.text : "ink";
  const labelColor = dark ? D.muted : "inkMuted";
  const valueColor = dark ? D.body : "ink";
  const borderColor = dark ? "whiteAlpha.300" : "line";
  const cardBg = dark ? "whiteAlpha.50" : "paper";

  const pairGrid = (cols: number[], top?: boolean) => (
    <Dl
      m="0"
      display="grid"
      gridTemplateColumns="minmax(0,auto) 1fr"
      columnGap="3"
      rowGap="2"
      {...(top ? { mt: "3", pt: "3", borderTop: "1px solid", borderColor } : { mt: "3" })}
    >
      {cols
        .filter((ci) => ci !== titleIndex)
        .map((ci) => (
          <Fragment key={ci}>
            <Dt m="0" fontSize="md" color={labelColor} alignSelf="center">
              {columns[ci]}
            </Dt>
            <Dd m="0" fontSize="md" color={valueColor} fontWeight="medium" textAlign="end" alignSelf="center">
              {row[ci]}
            </Dd>
          </Fragment>
        ))}
    </Dl>
  );

  return (
    <Box as="article" border="1px solid" borderColor={borderColor} borderRadius="surface" bg={cardBg} p="4">
      <P fontSize="lg" fontWeight="bold" color={titleColor} lineHeight="1.25">
        {row[titleIndex]}
      </P>

      {primaryCols.length > 0 && pairGrid(primaryCols)}

      {detailCols.length > 0 && (
        <Box mt="2">
          <Btn
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            display="inline-flex"
            alignItems="center"
            gap="2"
            minH="44px"
            px="1"
            bg="transparent"
            border="none"
            cursor="pointer"
            color={labelColor}
            fontSize="md"
            fontWeight="medium"
          >
            <Box
              as="span"
              aria-hidden="true"
              display="inline-block"
              transition="transform 0.2s ease"
              transform={open ? "rotate(90deg)" : "rotate(0deg)"}
            >
              ▶
            </Box>
            {open ? "Detayı gizle" : "Detay"}
          </Btn>
          {open && pairGrid(detailCols, true)}
        </Box>
      )}
    </Box>
  );
}

export function MobileTableCards({
  columns,
  rows,
  rowTitleIndex = 0,
  primary,
  detail,
  dark = false,
}: MobileTableCardsProps) {
  const detailCols = detail ?? [];
  const primaryCols =
    primary ?? columns.map((_, i) => i).filter((i) => i !== rowTitleIndex && !detailCols.includes(i));

  return (
    <Stack gap="3">
      {rows.map((row, ri) => (
        <Card
          key={ri}
          columns={columns}
          row={row}
          titleIndex={rowTitleIndex}
          primaryCols={primaryCols}
          detailCols={detailCols}
          dark={dark}
        />
      ))}
    </Stack>
  );
}
