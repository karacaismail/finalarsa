import { Box } from "@chakra-ui/react";
import { getMetric } from "../data/resolve";
import { Grid, P } from "../ui";
import { RichText } from "./RichText";
import { claimTag } from "../theme/semantic";
import { cardBase } from "../theme/components";

/**
 * KpiBoard — yatırımcı karar panosu KPI kartları. Her kart, sayının yanında TÜRÜNÜ (sınıf)
 * gösterir: doğrulanmış kaynak / model varsayımı / hedef / şirket teklifi. Böylece yatırımcı
 * "hangi rakam gerçek, hangisi varsayım?" sorusunu tek bakışta yanıtlar.
 *
 * Veri database/data/investor-dashboard.json'dan gelir (block: type "kpiBoard", group seçilir).
 * Mobile-first: base'de tek sütun, sm'de 2, lg'de 3. Rakamlar valueRef ile metrics.json'dan (tek kaynak).
 * Sınıf rozetleri mevcut claimTag token'larını (theme/semantic) yeniden kullanır — UI bütünlüğü.
 */
export type KpiClass = "verified" | "assumption" | "target" | "offer";
export type KpiItem = {
  label: string;
  value?: string;
  valueRef?: string;
  class: KpiClass;
  source?: string;
  owner?: string;
  cadence?: "weekly" | "monthly" | "quarterly";
  redFlag?: string;
};

const CLASS_TAG: Record<KpiClass, string> = {
  verified: "doğrulanmış kaynak",
  assumption: "model varsayımı",
  target: "hedef",
  offer: "şirket tahmini",
};
const CADENCE_TR: Record<string, string> = {
  weekly: "haftalık",
  monthly: "aylık",
  quarterly: "çeyreklik",
};

function ClassBadge({ k }: { k: KpiClass }) {
  const tag = CLASS_TAG[k];
  const m = claimTag[tag] ?? claimTag["hedef"];
  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      alignSelf="flex-start"
      px="2"
      py="0.5"
      borderRadius="full"
      bg={m.bg}
      color={m.color}
      fontSize="sm"
      fontWeight="medium"
      lineHeight="1.3"
      letterSpacing="0.01em"
      whiteSpace="nowrap"
    >
      {tag}
    </Box>
  );
}

export function KpiBoard({ items, columns = 3 }: { items: KpiItem[]; columns?: 2 | 3 }) {
  if (!items || items.length === 0) return null;
  const tmpl =
    columns === 2
      ? { base: "1fr", md: "repeat(2, 1fr)" }
      : { base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" };
  return (
    <Grid templateColumns={tmpl} gap={{ base: "3", md: "4" }}>
      {items.map((it, i) => {
        const val = it.valueRef ? getMetric(it.valueRef)?.display ?? it.value ?? "" : it.value ?? "";
        const meta = [
          it.source && `Kaynak: ${it.source}`,
          it.owner && `Sorumlu: ${it.owner}`,
          it.cadence && `Takip: ${CADENCE_TR[it.cadence] ?? it.cadence}`,
        ].filter(Boolean);
        return (
          <Box key={i} {...cardBase()} display="flex" flexDirection="column" gap="1.5">
            <ClassBadge k={it.class} />
            {val && (
              <P fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="ink" lineHeight="1.1" letterSpacing="-0.01em">
                {val}
              </P>
            )}
            <P fontWeight="medium" color="ink" fontSize="md" lineHeight="1.35">
              <RichText text={it.label} />
            </P>
            {meta.length > 0 && (
              <P fontSize="sm" color="inkMuted" lineHeight="1.4">
                {meta.join(" · ")}
              </P>
            )}
            {it.redFlag && (
              <P fontSize="sm" color="inkMuted" lineHeight="1.4" mt="0.5">
                <Box as="span" fontWeight="bold" color="ink">
                  Kırmızı eşik:{" "}
                </Box>
                <RichText text={it.redFlag} />
              </P>
            )}
          </Box>
        );
      })}
    </Grid>
  );
}
