import { Box } from "@chakra-ui/react";
import { useId, useMemo, useState } from "react";
import { getData } from "../data/resolve";
import { Flex, Grid, P, Stack } from "../ui";
import { fmt } from "./charts";
import { cardBase, interactivePanel } from "../theme/components";
import { palette } from "../theme/palette";

/**
 * Teknopark vergi avantajı — interaktif yatay slider.
 * Kullanıcı sürükledikçe gelir senaryosu (Kötümser↔Medyan↔İyimser) interpole edilir;
 * vergi öncesi kâr, KV istisnası ve stopaj/SGK avantajı CANLI hesaplanır.
 * Native <input type=range>: klavye + dokunma erişilebilir, mobil-öncelikli.
 */

type Tax = {
  opexSteady: number;
  kvRate: number;
  stopajSgkFixed: number;
  validUntil: string;
  scenarios: { id: string; label: string; revenue: number }[];
};

/* card merkezi: src/theme/components.ts (chartCard) */

export function TaxSliderView() {
  const { tax } = getData<{ tax: Tax }>("financial-breakdown");
  const labelId = useId();
  const [t, setT] = useState(0.5); // 0=Kötümser, 0.5=Medyan, 1=İyimser

  const rP = tax.scenarios[0].revenue;
  const rM = tax.scenarios[1].revenue;
  const rO = tax.scenarios[2].revenue;

  const calc = useMemo(() => {
    const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
    const revenue = t <= 0.5 ? lerp(rP, rM, t / 0.5) : lerp(rM, rO, (t - 0.5) / 0.5);
    const profit = Math.max(0, revenue - tax.opexSteady);
    const kv = tax.kvRate * profit;
    const stopaj = profit > 0 ? tax.stopajSgkFixed : 0;
    const total = kv + stopaj;
    let zone: string;
    if (t <= 0.02) zone = "Kötümser";
    else if (t >= 0.98) zone = "İyimser";
    else if (Math.abs(t - 0.5) <= 0.02) zone = "Medyan";
    else if (t < 0.5) zone = "Kötümser–Medyan arası";
    else zone = "Medyan–İyimser arası";
    return { revenue, profit, kv, stopaj, total, zone };
  }, [t, rP, rM, rO, tax.opexSteady, tax.kvRate, tax.stopajSgkFixed]);

  const setStop = (v: number) => setT(v);

  const metric = (label: string, value: string, toneKey: string | undefined, valColor: string) => (
    <Box {...cardBase(toneKey)} p={{ base: "4", md: "4" }} display="flex" flexDirection="column" justifyContent="space-between" gap="2">
      <P fontSize="md" color="inkMuted" lineHeight="1.3">{label}</P>
      <P fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold" color={valColor} lineHeight="1.05" whiteSpace="nowrap">
        {value}
      </P>
    </Box>
  );

  return (
    <Box {...interactivePanel()} p={{ base: "5", md: "6" }}>
      <Stack gap="5">
        <Flex justify="space-between" align="baseline" wrap="wrap" gap="2">
          <Box as="span" px="2" py="0.5" borderRadius="full" bg={palette.tintGold} color="gold" fontSize="md" fontWeight="medium">
            model varsayımı
          </Box>
          <P fontSize="md" color="inkMuted">istisna süresi · {tax.validUntil}</P>
        </Flex>

        {/* Büyük canlı sonuç */}
        <Box>
          <P id={labelId} fontSize="md" color="inkMuted">Teknopark’ta yıllık vergi avantajı · {calc.zone}</P>
          <P fontSize={{ base: "4xl", md: "5xl" }} fontWeight="bold" color="gold" lineHeight="1.05" letterSpacing="-0.01em">
            {fmt(calc.total)}
          </P>
          <P fontSize="md" color="inkMuted" mt="1">Yıllık gelir senaryosu: <Box as="span" color="ink" fontWeight="medium">{fmt(calc.revenue)}</Box></P>
        </Box>

        {/* Slider — native input (erişilebilir, dokunma dostu) */}
        <Box>
          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            value={Math.round(t * 1000)}
            onChange={(e) => setT(Number(e.target.value) / 1000)}
            aria-labelledby={labelId}
            aria-valuetext={`${calc.zone}; yıllık gelir ${fmt(calc.revenue)}; vergi avantajı ${fmt(calc.total)}`}
            style={{ width: "100%", height: "44px", accentColor: palette.goldBright, cursor: "pointer", touchAction: "none" }}
          />
          {/* Senaryo durakları (tıkla = ata) */}
          <Flex justify="space-between" mt="1" gap="2">
            {[
              { label: "Kötümser", v: 0, rev: rP },
              { label: "Medyan", v: 0.5, rev: rM },
              { label: "İyimser", v: 1, rev: rO },
            ].map((s) => {
              const active = Math.abs(t - s.v) <= 0.02;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setStop(s.v)}
                  aria-label={`${s.label} senaryosuna ayarla: ${fmt(s.rev)}`}
                  style={{
                    textAlign: s.v === 0 ? "start" : s.v === 1 ? "end" : "center",
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <P fontSize="md" fontWeight={active ? "bold" : "medium"} color={active ? "gold" : "inkMuted"}>{s.label}</P>
                  <P fontSize="md" color="inkMuted">{fmt(s.rev)}</P>
                </button>
              );
            })}
          </Flex>
        </Box>

        {/* Hesap kırılımı */}
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap="3">
          {metric("Vergi öncesi kâr", fmt(calc.profit), "info", "ink")}
          {metric("Kurumlar vergisi istisnası", fmt(calc.kv), "accent", "grass")}
          {metric("Stopaj + SGK avantajı", fmt(calc.stopaj), "accent", "grass")}
          {metric("Toplam yıllık avantaj", fmt(calc.total), "gold", "gold")}
        </Grid>

        <P fontSize="md" color="inkMuted">
          Hesap: kâr = gelir − sabit işletme gideri ({fmt(tax.opexSteady)}); KV istisnası = %{Math.round(tax.kvRate * 100)} × kâr. Mekanizma yasal-kesin; tutar kazanca bağlı model varsayımıdır.
        </P>
      </Stack>
    </Box>
  );
}
