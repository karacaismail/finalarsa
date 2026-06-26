import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { DEFAULT_DATA, ayLabel } from "./data/finansal";
import type { Currency, FinansalData, Params } from "./data/finansal";
import { clearStorage, fromJSON, load, save, toJSON } from "./lib/store";
import { hesapla, rate, KUME_RENK } from "./lib/clusters";
import type { EChartsOption } from "echarts";
import { NumView, Svg, Icon, grouped, parseTR } from "./components/num";
import { EChart } from "./components/Chart";

const SYM: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };
const CURS: Currency[] = ["TRY", "USD", "EUR"];
const CHEV = "M184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128 87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1 0 17Z";

const DONEMLER = [
  { key: "y2026", ad: "2026 sonu (Eyl–Ara)", a: 0, b: 4 },
  { key: "ilk12", ad: "İlk 12 ay", a: 0, b: 12 },
  { key: "ikinci", ad: "İkinci sene", a: 12, b: 24 },
  { key: "tumu", ad: "TÜMÜ · 24 ay", a: 0, b: 24 },
];

export function App() {
  const [data, setData] = useState<FinansalData>(() => load());
  const [disp, setDisp] = useState<Currency>("TRY");
  const [open, setOpen] = useState<string>("");     // "", "capex" veya ym
  const [openK, setOpenK] = useState<string>("");
  const [ayar, setAyar] = useState(false);
  const [donem, setDonem] = useState("y2026");
  const fileRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => { save(data); }, [data]);
  const H = useMemo(() => hesapla(data), [data]);
  const r = rate(data, disp);
  const conv = (tl: number) => tl / r;
  const sym = SYM[disp];

  const dd = DONEMLER.find((d) => d.key === donem)!;
  const gosterilen = H.aylar.slice(dd.a, dd.b);
  const donemToplam = gosterilen.reduce((s, a) => s + a.toplamTl, 0);

  const edit = (fn: (d: FinansalData) => void) => setData((p) => { const n = structuredClone(p); fn(n); return n; });
  const setParam = (k: keyof Params, v: number) => edit((d) => { (d.params as unknown as Record<string, number>)[k] = v; });

  const toggle = (key: string) => {
    const aciliyor = open !== key;
    setOpen(aciliyor ? key : ""); setOpenK("");
    if (aciliyor) requestAnimationFrame(() => itemRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const ilkNToplam = (n: number) => H.aylar.slice(0, n).reduce((s, a) => s + a.toplamTl, 0);
  const ilk6 = ilkNToplam(6), ilk12 = ilkNToplam(12), ilk24 = ilkNToplam(24);

  const kumeAnahtar = ["personel", "ofis", "surekli", "pazarlama", "yazilim", "profesyonel", "saha"];
  const kumeAd: Record<string, string> = { personel: "Personel", ofis: "Ofis & kira", surekli: "Sürekli", pazarlama: "Pazarlama", yazilim: "Yazılım/SaaS", profesyonel: "Profesyonel", saha: "Saha" };
  const chart: EChartsOption = useMemo(() => ({
    grid: { left: 52, right: 10, top: 30, bottom: 64 },
    tooltip: { trigger: "axis", valueFormatter: (v) => Number(v).toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " " + sym },
    legend: { top: 0, type: "scroll", textStyle: { fontSize: 12 } },
    xAxis: { type: "category", data: gosterilen.map((a) => ayLabel(a.ym)), axisLabel: { rotate: 48, fontSize: 11 } },
    yAxis: { type: "value", axisLabel: { fontSize: 11, formatter: (v: number) => (Math.abs(v) >= 1e6 ? (v / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + "M" : (v / 1e3).toFixed(0) + "B") } },
    series: kumeAnahtar.map((key) => ({ name: kumeAd[key], type: "bar", stack: "g", color: KUME_RENK[key], data: gosterilen.map((a) => Math.round(conv(a.kumeler.find((k) => k.key === key)?.tl ?? 0))) })),
  }), [data, disp, donem]);

  const exportJSON = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([toJSON(data)], { type: "application/json" })); a.download = `arsam-gider-${data.meta.updatedAt}.json`; a.click(); };
  const importJSON = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { setData(fromJSON(String(rd.result))); setOpen(""); } catch { alert("Geçersiz veya uyumsuz JSON."); } }; rd.readAsText(f); e.target.value = ""; };
  const reset = () => { if (confirm("Tüm değişiklikler silinip varsayılana dönülecek. Emin misin?")) { clearStorage(); setData(structuredClone(DEFAULT_DATA)); setOpen(""); } };

  const Head = ({ k, no, title, sub, tl }: { k: string; no: number; title: string; sub: string; tl: number }) => (
    <button className={"acc-head" + (open === k ? " open" : "")} onClick={() => toggle(k)}>
      <span className="ah-top">
        <span className={"chev" + (open === k ? " on" : "")}><Svg d={CHEV} size={18} /></span>
        <span className="acc-no">{no}</span>
        <span className="acc-title">{title}</span>
      </span>
      <span className="ah-bot">
        <span className="acc-sub">{sub}</span>
        <span className="acc-tot"><NumView n={conv(tl)} sym={sym} /></span>
      </span>
    </button>
  );

  return (
    <div className="page">
      <header className="bar">
        <div className="brand"><span className="logo">arsam.net</span><span className="ttl">Aylık Gider Planı</span></div>
        <div className="tools">
          <div className="cur" role="tablist" aria-label="Para birimi">
            {CURS.map((c) => <button key={c} role="tab" aria-selected={c === disp} className={c === disp ? "on" : ""} onClick={() => setDisp(c)}><span className="cs">{SYM[c]}</span> {c}</button>)}
          </div>
          <div className="io">
            <button className="btn" onClick={() => fileRef.current?.click()}><Svg d={Icon.up} /> İçe</button>
            <button className="btn primary" onClick={exportJSON}><Svg d={Icon.down} /> Dışa</button>
            <button className="btn ghost" onClick={reset}>Sıfırla</button>
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJSON} />
        </div>
      </header>

      <main className="main">
        <section className="cards cards4">
          <Card k="CAPEX (Ağustos 2026)" n={conv(H.capex.toplamTl)} sym={sym} accent />
          <Card k="İlk 6 ay toplamı" n={conv(ilk6)} sym={sym} />
          <Card k="İlk 12 ay toplamı" n={conv(ilk12)} sym={sym} />
          <Card k="İlk 24 ay toplamı" n={conv(ilk24)} sym={sym} />
        </section>

        {/* zaman filtresi */}
        <div className="filtre" role="tablist" aria-label="Zaman aralığı">
          {DONEMLER.map((d) => <button key={d.key} role="tab" aria-selected={d.key === donem} className={"chip" + (d.key === donem ? " on" : "")} onClick={() => { setDonem(d.key); setOpen(""); }}>{d.ad}</button>)}
        </div>
        <div className="donem-ozet"><span>{dd.ad} · {gosterilen.length} ay</span><span className="dt">Dönem toplamı: <NumView n={conv(donemToplam)} sym={sym} /></span></div>

        <section className="block chartblock">
          <h2>Aya göre gider (küme bazında)</h2>
          <EChart option={chart} height={300} />
        </section>

        <section className="block">
          <button className="ayar-head" onClick={() => setAyar(!ayar)}>
            <span className={"chev" + (ayar ? " on" : "")}><Svg d={CHEV} size={16} /></span>
            <b>Varsayımlar (düzenle)</b>
          </button>
          {ayar && (
            <div className="params">
              <PRow label="USD/TRY kuru" v={data.params.usd} onC={(v) => setParam("usd", v)} hint="kurucu net-hedefi" />
              <PRow label="EUR/TRY kuru" v={data.params.eur} onC={(v) => setParam("eur", v)} />
              <PRow label="İşveren SGK oranı" v={data.params.isverenSgkOran} onC={(v) => setParam("isverenSgkOran", v)} hint="0,2375 · 0,2175" />
              <PRow label="Yemek — baz (₺/ay/kişi)" v={data.params.yemekAylik} onC={(v) => setParam("yemekAylik", v)} hint="herkes (min)" />
              <PRow label="Yemek — Team Lead (₺/ay)" v={data.params.yemekTeamLead} onC={(v) => setParam("yemekTeamLead", v)} />
              <PRow label="Yemek — C-level (₺/ay)" v={data.params.yemekClevel} onC={(v) => setParam("yemekClevel", v)} />
              <PRow label="Yol (₺/ay/kişi)" v={data.params.yolAylik} onC={(v) => setParam("yolAylik", v)} />
              <PRow label="CPO araç (1. dönem ₺/ay)" v={data.arac[0].aylikTl} onC={(v) => edit((d) => { d.arac[0].aylikTl = v; })} hint="segment yükselince artar" />
              <PRow label="Ofis kirası (₺/ay)" v={data.kira} onC={(v) => edit((d) => { d.kira = v; })} hint="sabit" />
              <PRow label="Depozito (ilk ay)" v={data.depozito} onC={(v) => edit((d) => { d.depozito = v; })} hint="2 ay" />
              <PRow label="Yazılım geliştirme ücreti (USD)" v={data.params.yazilimGelistirmeUsd} onC={(v) => setParam("yazilimGelistirmeUsd", v)} hint="CAPEX'e, kura bağlı ₺" />
            </div>
          )}
        </section>

        <section className="acc">
          {dd.a === 0 && (
            <div className="acc-item" key="temmuz" ref={(el) => { itemRefs.current["temmuz"] = el; }}>
              <Head k="temmuz" no={1} title="Tem 2026" sub="yazılım geliştirme avansı · 2 taksit" tl={H.yazilimDev.toplamTl} />
              {open === "temmuz" && (
                <div className="acc-body">
                  {H.yazilimDev.kalemler.map((k, m) => <div className="kalem-row" key={m}><span>{k.ad}</span><NumView n={conv(k.tl)} sym={sym} /></div>)}
                  <div className="kalem-row sum big"><span>Tem 2026 — yazılım geliştirme toplam</span><NumView n={conv(H.yazilimDev.toplamTl)} sym={sym} /></div>
                </div>
              )}
            </div>
          )}
          {dd.a === 0 && (
            <div className="acc-item" key="agustos" ref={(el) => { itemRefs.current["agustos"] = el; }}>
              <Head k="agustos" no={2} title="Ağu 2026" sub="kuruluş yatırımı · sadece CAPEX" tl={H.capex.toplamTl} />
              {open === "agustos" && (
                <div className="acc-body">
                  {H.capex.kalemler.map((k, m) => <div className="kalem-row" key={m}><span>{k.ad}</span><NumView n={conv(k.tl)} sym={sym} /></div>)}
                  <div className="kalem-row sum big"><span>Ağu 2026 — CAPEX toplam</span><NumView n={conv(H.capex.toplamTl)} sym={sym} /></div>
                </div>
              )}
            </div>
          )}
          {gosterilen.map((ay, j) => {
            const i = dd.a + j;
            return (
              <div className="acc-item" key={ay.ym} ref={(el) => { itemRefs.current[ay.ym] = el; }}>
                <Head k={ay.ym} no={i + 3} title={ayLabel(ay.ym)} sub={`${ay.kisi} kişi${ay.yeni ? ` · +${ay.yeni} yeni` : ""}`} tl={ay.toplamTl} />
                {open === ay.ym && (
                  <div className="acc-body">
                    {ay.kumeler.map((k) => (
                      <div className="kume" key={k.key}>
                        <button className={"kume-head" + (openK === k.key ? " open" : "")} onClick={() => setOpenK(openK === k.key ? "" : k.key)}>
                          <span className="dot" style={{ background: k.renk }} />
                          <span className="kume-ad">{k.ad}</span>
                          <span className="kume-pay">%{Math.round((k.tl / ay.toplamTl) * 100)}</span>
                          <span className="kume-tot"><NumView n={conv(k.tl)} sym={sym} /></span>
                          <span className={"chev sm" + (openK === k.key ? " on" : "")}><Svg d={CHEV} size={13} /></span>
                        </button>
                        {openK === k.key && (
                          <div className="kume-body">
                            {k.kalemler.map((x, m) => <div className="kalem-row" key={m}><span>{x.ad}</span><NumView n={conv(x.tl)} sym={sym} /></div>)}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="kalem-row sum big"><span>{ayLabel(ay.ym)} toplam</span><NumView n={conv(ay.toplamTl)} sym={sym} /></div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <footer className="foot">
          Personel = 256 rol + 2026 bordro motoru (kurucu 7.500$ net-hedef) + CPO araç kiralama · diğer kümeler geçmiş veriden, düzenlenebilir · <b>{SYM[disp]} {disp}</b> · veri tarayıcıda · arsam.net
        </footer>
      </main>
    </div>
  );
}

function Card({ k, n, sym, accent }: { k: string; n: number; sym: string; accent?: boolean }) {
  return <div className={"card" + (accent ? " accent" : "")}><div className="k">{k}</div><div className="v"><NumView n={n} sym={sym} /></div></div>;
}
function PRow({ label, v, onC, hint }: { label: string; v: number; onC: (v: number) => void; hint?: string }) {
  return (
    <label className="param">
      <span className="p-lbl">{label}</span>
      <input type="text" inputMode="decimal" defaultValue={grouped(v)} key={String(v)} onBlur={(e) => { const x = parseTR(e.target.value); if (x !== null && x >= 0) onC(x); }} />
      {hint && <span className="p-hint">{hint}</span>}
    </label>
  );
}
