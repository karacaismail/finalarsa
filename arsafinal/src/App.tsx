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

export function App() {
  const [data, setData] = useState<FinansalData>(() => load());
  const [disp, setDisp] = useState<Currency>("TRY");
  const [open, setOpen] = useState<number>(-1);      // -1 yok, 0 capex, 1..24 aylar
  const [openK, setOpenK] = useState<string>("");    // açık küme (ay içinde)
  const [ayar, setAyar] = useState(false);           // varsayımlar paneli
  const fileRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => { save(data); }, [data]);
  const H = useMemo(() => hesapla(data), [data]);
  const r = rate(data, disp);
  const conv = (tl: number) => tl / r;
  const sym = SYM[disp];

  const edit = (fn: (d: FinansalData) => void) => setData((p) => { const n = structuredClone(p); fn(n); return n; });
  const setParam = (k: keyof Params, v: number) => edit((d) => { (d.params as unknown as Record<string, number>)[k] = v; });

  const toggle = (i: number) => {
    const aciliyor = open !== i;
    setOpen(aciliyor ? i : -1); setOpenK("");
    if (aciliyor) requestAnimationFrame(() => itemRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const toplam24 = H.aylar.reduce((s, a) => s + a.toplamTl, 0);
  const ortalama = toplam24 / H.aylar.length;
  const enYuksek = H.aylar.reduce((a, b) => (b.toplamTl > a.toplamTl ? b : a), H.aylar[0]);

  const kumeAnahtar = ["personel", "capex", "ofis", "surekli", "pazarlama", "yazilim", "profesyonel", "saha"];
  const kumeAd: Record<string, string> = { personel: "Personel", capex: "CAPEX", ofis: "Ofis & kira", surekli: "Sürekli", pazarlama: "Pazarlama", yazilim: "Yazılım/SaaS", profesyonel: "Profesyonel", saha: "Saha" };
  const chart: EChartsOption = useMemo(() => ({
    grid: { left: 64, right: 16, top: 34, bottom: 70 },
    tooltip: { trigger: "axis", valueFormatter: (v) => Number(v).toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " " + sym },
    legend: { top: 0, type: "scroll", textStyle: { fontSize: 13 } },
    xAxis: { type: "category", data: H.aylar.map((a) => ayLabel(a.ym)), axisLabel: { rotate: 50, fontSize: 12 } },
    yAxis: { type: "value", axisLabel: { fontSize: 12, formatter: (v: number) => (Math.abs(v) >= 1e6 ? (v / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + " M" : (v / 1e3).toFixed(0) + " B") } },
    series: kumeAnahtar.map((key) => ({
      name: kumeAd[key], type: "bar", stack: "g", color: KUME_RENK[key],
      data: H.aylar.map((a) => Math.round(conv(a.kumeler.find((k) => k.key === key)?.tl ?? 0))),
    })),
  }), [data, disp]);

  const exportJSON = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([toJSON(data)], { type: "application/json" }));
    a.download = `arsam-gider-${data.meta.updatedAt}.json`; a.click();
  };
  const importJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { try { setData(fromJSON(String(rd.result))); setOpen(-1); } catch { alert("Geçersiz veya uyumsuz JSON."); } };
    rd.readAsText(f); e.target.value = "";
  };
  const reset = () => { if (confirm("Tüm değişiklikler silinip varsayılana dönülecek. Emin misin?")) { clearStorage(); setData(structuredClone(DEFAULT_DATA)); setOpen(-1); } };

  return (
    <div className="page">
      <header className="bar">
        <div className="brand"><span className="logo">arsam.net</span><span className="sep">·</span><span className="ttl">Aylık Gider Planı</span></div>
        <div className="tools">
          <div className="cur" role="tablist" aria-label="Para birimi">
            {CURS.map((c) => <button key={c} role="tab" aria-selected={c === disp} className={c === disp ? "on" : ""} onClick={() => setDisp(c)}><span className="cs">{SYM[c]}</span> {c}</button>)}
          </div>
          <button className="btn" onClick={() => fileRef.current?.click()}><Svg d={Icon.up} /> İçe</button>
          <button className="btn primary" onClick={exportJSON}><Svg d={Icon.down} /> Dışa</button>
          <button className="btn ghost" onClick={reset}>Sıfırla</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJSON} />
        </div>
      </header>

      <main className="main">
        <section className="cards">
          <Card k="1) İlk ay yatırımı (CAPEX)" n={conv(H.capex.toplamTl)} sym={sym} accent />
          <Card k="2) 24 ay toplam gider" n={conv(toplam24)} sym={sym} />
          <Card k="Aylık ortalama" n={conv(ortalama)} sym={sym} />
          <Card k={`En yüksek ay — ${ayLabel(enYuksek.ym)}`} n={conv(enYuksek.toplamTl)} sym={sym} />
        </section>

        <section className="block">
          <h2>Aya göre gider (küme bazında)</h2>
          <EChart option={chart} height={340} />
        </section>

        {/* Varsayımlar (düzenlenebilir) */}
        <section className="block">
          <button className="ayar-head" onClick={() => setAyar(!ayar)}>
            <span className={"chev" + (ayar ? " on" : "")}><Svg d={CHEV} size={16} /></span>
            <b>Varsayımlar (düzenle)</b><span className="note inline">USD kuru, SGK oranı, yan haklar, kira…</span>
          </button>
          {ayar && (
            <div className="params">
              <PRow label="USD/TRY kuru" v={data.params.usd} onC={(v) => setParam("usd", v)} hint="kurucu net-hedefi bunu kullanır" />
              <PRow label="EUR/TRY kuru" v={data.params.eur} onC={(v) => setParam("eur", v)} />
              <PRow label="İşveren SGK oranı" v={data.params.isverenSgkOran} onC={(v) => setParam("isverenSgkOran", v)} hint="0,2375 teşviksiz · 0,2175 teşvikli" />
              <PRow label="Yemek (₺/ay/kişi)" v={data.params.yemekAylik} onC={(v) => setParam("yemekAylik", v)} />
              <PRow label="Yol (₺/ay/kişi)" v={data.params.yolAylik} onC={(v) => setParam("yolAylik", v)} />
              <PRow label="İkramiye (yıl/maaş)" v={data.params.ikramiyeMaasYil} onC={(v) => setParam("ikramiyeMaasYil", v)} />
              <PRow label="Ofis kirası (₺/ay)" v={data.olgun.kira} onC={(v) => edit((d) => { d.olgun.kira = v; })} />
              <PRow label="Sürekli gider (256 kişi, ₺/ay)" v={data.olgun.utilities} onC={(v) => edit((d) => { d.olgun.utilities = v; })} hint="headcount ile ölçeklenir" />
              <PRow label="Yeni işe alım ekipmanı (₺)" v={data.params.perHireCapex} onC={(v) => setParam("perHireCapex", v)} />
            </div>
          )}
        </section>

        {/* Accordion liste */}
        <section className="acc">
          <div className="acc-item" ref={(el) => { itemRefs.current[0] = el; }}>
            <button className={"acc-head capex-head" + (open === 0 ? " open" : "")} onClick={() => toggle(0)}>
              <span className={"chev" + (open === 0 ? " on" : "")}><Svg d={CHEV} size={18} /></span>
              <span className="acc-no">1</span>
              <span className="acc-title">İlk ay yatırımı — CAPEX</span>
              <span className="acc-tot"><NumView n={conv(H.capex.toplamTl)} sym={sym} /></span>
            </button>
            {open === 0 && (
              <div className="acc-body">
                {H.capex.kalemler.map((k, i) => <div className="kalem-row" key={i}><span>{k.ad}</span><NumView n={conv(k.tl)} sym={sym} /></div>)}
                <div className="kalem-row sum"><span>Toplam</span><NumView n={conv(H.capex.toplamTl)} sym={sym} /></div>
              </div>
            )}
          </div>

          {H.aylar.map((ay, i) => {
            const idx = i + 1;
            return (
              <div className="acc-item" key={ay.ym} ref={(el) => { itemRefs.current[idx] = el; }}>
                <button className={"acc-head" + (open === idx ? " open" : "")} onClick={() => toggle(idx)}>
                  <span className={"chev" + (open === idx ? " on" : "")}><Svg d={CHEV} size={18} /></span>
                  <span className="acc-no">{idx + 1}</span>
                  <span className="acc-title">{ayLabel(ay.ym)}</span>
                  <span className="acc-sub">{ay.kisi} kişi{ay.yeni ? ` · +${ay.yeni}` : ""}</span>
                  <span className="acc-tot"><NumView n={conv(ay.toplamTl)} sym={sym} /></span>
                </button>
                {open === idx && (
                  <div className="acc-body">
                    {ay.kumeler.map((k) => (
                      <div className="kume" key={k.key}>
                        <button className={"kume-head" + (openK === k.key ? " open" : "")} onClick={() => setOpenK(openK === k.key ? "" : k.key)}>
                          <span className="dot" style={{ background: k.renk }} />
                          <span className="kume-ad">{k.ad}</span>
                          <span className="kume-pay">%{Math.round((k.tl / ay.toplamTl) * 100)}</span>
                          <span className="kume-tot"><NumView n={conv(k.tl)} sym={sym} /></span>
                          <span className={"chev sm" + (openK === k.key ? " on" : "")}><Svg d={CHEV} size={14} /></span>
                        </button>
                        {openK === k.key && (
                          <div className="kume-body">
                            {k.kalemler.map((x, j) => <div className="kalem-row" key={j}><span>{x.ad}</span><NumView n={conv(x.tl)} sym={sym} /></div>)}
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
          Personel = 256 rol + bordro motoru (kurucu: 7.500$ net-hedef, kümülatif vergi) · diğer kümeler geçmiş veriden, düzenlenebilir · <b>{SYM[disp]} {disp}</b> · veri tarayıcıda saklanır · arsam.net
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
      <input type="text" inputMode="decimal" defaultValue={grouped(v)} key={String(v)}
        onBlur={(e) => { const x = parseTR(e.target.value); if (x !== null && x >= 0) onC(x); }} />
      {hint && <span className="p-hint">{hint}</span>}
    </label>
  );
}
