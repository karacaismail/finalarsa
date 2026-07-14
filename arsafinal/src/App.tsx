import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { DEFAULT_DATA, ayLabel } from "./data/finansal";
import type { Currency, FinansalData, Params } from "./data/finansal";
import { clearStorage, fromJSON, load, save, toJSON } from "./lib/store";
import { hesapla, rate, KUME_RENK } from "./lib/clusters";
import type { EChartsOption } from "echarts";
import { NumView, Svg, Icon, grouped, parseTR } from "./components/num";
import { EChart } from "./components/Chart";
import { fetchMasterplanTabs, buildMasterplan } from "./lib/masterplan";
import type { MpTabs } from "./lib/masterplan";
import { fetchMasterplanRaw, buildMasterplanV3 } from "./lib/masterplan3";
import type { MpRaw } from "./lib/masterplan3";
import { fetchSubdetails, findSubdetails } from "./lib/subdetails";
import type { SubMap, AltDetay } from "./lib/subdetails";
import { DetailModal } from "./components/DetailModal";
import type { ModalData } from "./components/DetailModal";
import { RoadmapPage } from "./pages/Roadmap";
import type { Kalem } from "./lib/clusters";

const SYM: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };
const CURS: Currency[] = ["TRY", "USD", "EUR"];
const CHEV = "M184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128 87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1 0 17Z";

const DONEMLER = [
  { key: "y2026", ad: "2026", a: 0, b: 4 },
  { key: "ilk12", ad: "ilk 12 ay", a: 0, b: 12 },
  { key: "ikinci", ad: "ikinci 12 ay", a: 12, b: 24 },
  { key: "tumu", ad: "ilk 24 ay", a: 0, b: 24 },
];

// Kalem etiketi + opsiyonel (i) detay. Tıklayınca detay metni açılır/kapanır.
function InfoLabel({ ad, detay }: { ad: string; detay?: string }) {
  const [show, setShow] = useState(false);
  if (!detay) return <span>{ad}</span>;
  return (
    <span className="lbl-info">
      <span>{ad}</span>
      <button type="button" className="info-dot" aria-label="Detay göster" aria-expanded={show} onClick={() => setShow((s) => !s)}>
        <Svg d={Icon.info} size={15} />
      </button>
      {show && <span className="info-pop" role="tooltip" onClick={() => setShow(false)}>{detay}</span>}
    </span>
  );
}

export function App({ sheetMode = false, v3Mode = false }: { sheetMode?: boolean; v3Mode?: boolean }) {
  const [data, setData] = useState<FinansalData>(() => load());
  const [tab, setTab] = useState<"finansal" | "roadmap">("finansal"); // v2 iki-tab navigasyon
  const [disp, setDisp] = useState<Currency>("TRY");
  const [open, setOpen] = useState<string>("");     // "", "capex" veya ym
  const [openK, setOpenK] = useState<string>("");
  const [ayar, setAyar] = useState(false);
  const [donem, setDonem] = useState("y2026");
  const [liveFx, setLiveFx] = useState<{ usd: number; eur: number; ts: string } | null>(null);
  const [mpTabs, setMpTabs] = useState<MpTabs | null>(null);
  const [sheetStatus, setSheetStatus] = useState<"off" | "loading" | "ok" | "error">("off");
  const [mpRaw, setMpRaw] = useState<MpRaw | null>(null);          // v3: ham sekmeler
  const [subMap, setSubMap] = useState<SubMap | null>(null);       // v3: alt_detay haritası
  const [subErr, setSubErr] = useState(false);
  const [modal, setModal] = useState<ModalData | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => { save(data); }, [data]);
  // Canlı USD/TRY + EUR/TRY kuru çek, üstüne %1 ekle. Başarısızsa varsayılan kur (46,52 / 50) kullanılır.
  useEffect(() => {
    let alive = true;
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((d) => {
        if (!alive || d?.result !== "success" || !d.rates?.TRY) return;
        const usd = d.rates.TRY;                                   // ham canlı kur (+%1 YOK; o yalnız yazılım maliyetinde)
        const eur = d.rates.EUR ? d.rates.TRY / d.rates.EUR : usd;
        setLiveFx({ usd, eur, ts: d.time_last_update_utc ?? "" });
      })
      .catch(() => { /* sessizce varsayılan kur kalır */ });
    return () => { alive = false; };
  }, []);
  // Hesaplamada kullanılan etkin veri: canlı kur varsa USD/EUR'u onunla override et.
  const eff = useMemo(() => (liveFx ? { ...data, params: { ...data.params, usd: liveFx.usd, eur: liveFx.eur } } : data), [data, liveFx]);
  const H = useMemo(() => {
    const base = hesapla(eff);
    if (v3Mode && mpRaw) return buildMasterplanV3(base, mpRaw);
    return sheetMode && mpTabs ? buildMasterplan(base, mpTabs) : base;
  }, [eff, sheetMode, mpTabs, v3Mode, mpRaw]);
  // v2: canlı master_plan sekmeleri (OPEX + DİJİTAL PAZARLAMA + CAPEX) → giderler master_plan'dan; personel motordan.
  useEffect(() => {
    if (!sheetMode) return;
    document.title = "arsam.net · Finansal v2 (canlı master_plan)";
    let alive = true; setSheetStatus("loading");
    fetchMasterplanTabs().then((t) => { if (!alive) return; setMpTabs(t); setSheetStatus("ok"); }).catch(() => { if (alive) setSheetStatus("error"); });
    return () => { alive = false; };
  }, [sheetMode]);
  // v3: ham master_plan (OPEX+PAZARLAMA+CAPEX, export CSV) + alt_detay sekmesi (modal içeriği).
  useEffect(() => {
    if (!v3Mode) return;
    document.title = "arsam.net · Finansal v3 (canlı master_plan + alt-detay)";
    let alive = true; setSheetStatus("loading");
    fetchMasterplanRaw().then((r) => { if (alive) { setMpRaw(r); setSheetStatus("ok"); } }).catch(() => { if (alive) setSheetStatus("error"); });
    fetchSubdetails().then((m) => { if (alive) { setSubMap(m); setSubErr(false); } }).catch(() => { if (alive) { setSubMap(null); setSubErr(true); } });
    return () => { alive = false; };
  }, [v3Mode]);
  const r = rate(eff, disp);
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
  // Dönem baştan başlıyorsa (a=0) grafiğe Temmuz (yazılım geliştirme avansı) + Ağustos (kuruluş CAPEX) çubukları eklenir.
  const onAylar = dd.a === 0
    ? [{ ad: "Tem 2026", dev: H.yazilimDev.toplamTl, capex: 0 }, { ad: "Ağu 2026", dev: 0, capex: H.capex.toplamTl }]
    : [];
  const chart: EChartsOption = useMemo(() => ({
    grid: { left: 52, right: 10, top: 30, bottom: 64 },
    tooltip: { trigger: "axis", formatter: (params: any) => {
      const arr = Array.isArray(params) ? params : [params];
      const head = arr.length ? (arr[0].axisValueLabel ?? arr[0].axisValue) : "";
      const satir = arr.filter((p: any) => Number(p.value) > 0).map((p: any) => {
        const v = p.seriesName === "Yazılım geliştirme"
          ? grouped(data.params.yazilimGelistirmeUsd) + " $"
          : Math.ceil(Number(p.value)).toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " " + sym;
        return `${p.marker}${p.seriesName}: <b>${v}</b>`;
      });
      return [head, ...satir].join("<br>");
    } },
    legend: { top: 0, type: "scroll", textStyle: { fontSize: 12 } },
    xAxis: { type: "category", data: [...onAylar.map((o) => o.ad), ...gosterilen.map((a) => ayLabel(a.ym))], axisLabel: { rotate: 48, fontSize: 11 } },
    yAxis: { type: "value", axisLabel: { fontSize: 11, formatter: (v: number) => (Math.abs(v) >= 1e6 ? (v / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + "M" : (v / 1e3).toFixed(0) + "B") } },
    series: [
      ...kumeAnahtar.map((key) => ({ name: kumeAd[key], type: "bar" as const, stack: "g", color: KUME_RENK[key], data: [...onAylar.map(() => 0), ...gosterilen.map((a) => Math.round(conv(a.kumeler.find((k) => k.key === key)?.tl ?? 0)))] })),
      ...(onAylar.length ? [
        { name: "Yazılım geliştirme", type: "bar" as const, stack: "g", color: "#475569", data: [...onAylar.map((o) => Math.round(conv(o.dev))), ...gosterilen.map(() => 0)] },
        { name: "Kuruluş yatırımı", type: "bar" as const, stack: "g", color: KUME_RENK.capex, data: [...onAylar.map((o) => Math.round(conv(o.capex))), ...gosterilen.map(() => 0)] },
      ] : []),
    ],
  }), [eff, disp, donem]);

  const exportJSON = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([toJSON(data)], { type: "application/json" })); a.download = `arsam-gider-${data.meta.updatedAt}.json`; a.click(); };
  const importJSON = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { setData(fromJSON(String(rd.result))); setOpen(""); } catch { alert("Geçersiz veya uyumsuz JSON."); } }; rd.readAsText(f); e.target.value = ""; };
  const reset = () => { if (confirm("Tüm değişiklikler silinip varsayılana dönülecek. Emin misin?")) { clearStorage(); setData(structuredClone(DEFAULT_DATA)); setOpen(""); } };

  // v3: kalem satırı — alt-detayı varsa tıklanabilir, modal açar.
  // Kaynak önceliği: motor kırılımı (kalem.alt, ör. SGK işçi/işveren) → alt_detay sekmesi (toleranslı eşleşme).
  const kalemRow = (x: Kalem, key: number | string, ym: string, kumeKey: string, kumeAd: string, ayAd: string) => {
    const rows: AltDetay[] | null = v3Mode
      ? (x.alt?.length ? x.alt : subMap ? findSubdetails(subMap, ym, kumeKey, x.ad) : null)
      : null;
    if (!rows?.length)
      return <div className="kalem-row" key={key}><InfoLabel ad={x.ad} detay={x.detay} /><NumView n={conv(x.tl)} sym={sym} /></div>;
    return (
      <button type="button" className="kalem-row kalem-click" key={key} aria-haspopup="dialog"
        onClick={() => setModal({ baslik: `${ayAd} · ${kumeAd} · ${x.ad}`, rows, kalemTl: x.tl })}>
        <span className="kc-ad"><span>{x.ad}</span><span className="kc-ico" aria-hidden="true"><Svg d={Icon.info} size={15} /></span></span>
        <NumView n={conv(x.tl)} sym={sym} />
      </button>
    );
  };

  const Head = ({ k, no, title, sub, tl, usd }: { k: string; no: number; title: string; sub: string; tl: number; usd?: number }) => (
    <button className={"acc-head" + (open === k ? " open" : "")} onClick={() => toggle(k)}>
      <span className="ah-top">
        <span className={"chev" + (open === k ? " on" : "")}><Svg d={CHEV} size={18} /></span>
        <span className="acc-no">{no}</span>
        <span className="acc-title">{title}</span>
      </span>
      <span className="ah-bot">
        <span className="acc-sub">{sub}</span>
        <span className="acc-tot">{usd !== undefined ? <NumView n={usd} sym="$" /> : <NumView n={conv(tl)} sym={sym} />}</span>
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
        {sheetMode && (
          <nav className="tabs" role="tablist" aria-label="Sayfa">
            <button role="tab" aria-selected={tab === "finansal"} className={"tab" + (tab === "finansal" ? " on" : "")} onClick={() => setTab("finansal")}>Finansal Plan</button>
            <button role="tab" aria-selected={tab === "roadmap"} className={"tab" + (tab === "roadmap" ? " on" : "")} onClick={() => setTab("roadmap")}>Yol Haritası</button>
          </nav>
        )}
      </header>

      <main className="main">
        {sheetMode && tab === "roadmap" ? (
          <RoadmapPage />
        ) : (
        <>
        <section className="cards cards4">
          <Card k="Kuruluş yatırımı (Ağu 2026)" n={conv(H.capex.toplamTl)} sym={sym} accent />
          <Card k="İlk 6 ay toplamı" n={conv(ilk6)} sym={sym} />
          <Card k="İlk 12 ay toplamı" n={conv(ilk12)} sym={sym} />
          <Card k="İlk 24 ay toplamı" n={conv(ilk24)} sym={sym} />
        </section>

        {/* zaman filtresi */}
        <div className="filtre" role="tablist" aria-label="Zaman aralığı">
          {DONEMLER.map((d) => <button key={d.key} role="tab" aria-selected={d.key === donem} className={"chip" + (d.key === donem ? " on" : "")} onClick={() => { setDonem(d.key); setOpen(""); }}>{d.ad}</button>)}
        </div>
        <div className="donem-ozet"><span>{dd.ad} · {gosterilen.length} ay</span><span className="dt">Dönem toplamı: <NumView n={conv(donemToplam)} sym={sym} /></span></div>
        {(sheetMode || v3Mode) && (
          <div className={"sheet-flag " + sheetStatus}>
            {sheetStatus === "loading" ? "master_plan yükleniyor…"
              : sheetStatus === "error" ? "master_plan okunamadı — motor değerleri gösteriliyor (yedek)"
              : sheetStatus === "ok" && v3Mode ? "Canlı master_plan bağlı (v3) — alt-detayı olan kaleme dokun" + (subErr ? " · alt_detay sekmesi yüklenemedi" : "")
              : sheetStatus === "ok" ? "Canlı master_plan bağlı — giderler sheet'ten (personel motordan)"
              : "master_plan bağlı değil · motor çalışıyor"}
          </div>
        )}

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
              <PRow label="USD/TRY kuru" v={eff.params.usd} onC={(v) => setParam("usd", v)} hint={liveFx ? "canlı kur (otomatik)" : "kurucu net-hedefi"} />
              <PRow label="EUR/TRY kuru" v={eff.params.eur} onC={(v) => setParam("eur", v)} hint={liveFx ? "canlı kur (otomatik)" : undefined} />
              <PRow label="İşveren SGK oranı" v={data.params.isverenSgkOran} onC={(v) => setParam("isverenSgkOran", v)} hint="0,2375 · 0,2175" />
              <PRow label="Yemek — baz (₺/ay/kişi)" v={data.params.yemekAylik} onC={(v) => setParam("yemekAylik", v)} hint="herkes (min)" />
              <PRow label="Yemek — Team Lead (₺/ay)" v={data.params.yemekTeamLead} onC={(v) => setParam("yemekTeamLead", v)} />
              <PRow label="Yemek — C-level (₺/ay)" v={data.params.yemekClevel} onC={(v) => setParam("yemekClevel", v)} />
              <PRow label="Yol (₺/ay/kişi)" v={data.params.yolAylik} onC={(v) => setParam("yolAylik", v)} />
              <PRow label="CPO araç (1. dönem ₺/ay)" v={data.arac[0].aylikTl} onC={(v) => edit((d) => { d.arac[0].aylikTl = v; })} hint="segment yükselince artar" />
              <PRow label="Ofis kirası (₺/ay)" v={data.kira} onC={(v) => edit((d) => { d.kira = v; })} hint="sabit · depozito kuruluş yatırımında" />
              <PRow label="Yazılım geliştirme ücreti (USD)" v={data.params.yazilimGelistirmeUsd} onC={(v) => setParam("yazilimGelistirmeUsd", v)} hint="kuruluş yatırımına · +%1 · kura bağlı" />
            </div>
          )}
        </section>

        <section className="acc">
          {dd.a === 0 && (
            <div className="acc-item" key="temmuz" ref={(el) => { itemRefs.current["temmuz"] = el; }}>
              <Head k="temmuz" no={1} title="Tem 2026" sub="Yazılım Maliyeti" tl={H.yazilimDev.toplamTl} usd={data.params.yazilimGelistirmeUsd} />
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
              <Head k="agustos" no={2} title="Ağu 2026" sub="Kuruluş yatırımı" tl={H.capex.toplamTl} />
              {open === "agustos" && (
                <div className="acc-body">
                  {H.capex.kumeler && H.capex.kumeler.length > 0
                    ? H.capex.kumeler.map((k) => (
                        <div className="kume" key={k.key}>
                          <button className={"kume-head" + (openK === k.key ? " open" : "")} onClick={() => setOpenK(openK === k.key ? "" : k.key)}>
                            <span className="dot" style={{ background: k.renk }} />
                            <span className="kume-ad">{k.ad}</span>
                            <span className="kume-pay">%{Math.round((k.tl / H.capex.toplamTl) * 100)}</span>
                            <span className="kume-tot"><NumView n={conv(k.tl)} sym={sym} /></span>
                            <span className={"chev sm" + (openK === k.key ? " on" : "")}><Svg d={CHEV} size={13} /></span>
                          </button>
                          {openK === k.key && (
                            <div className="kume-body">
                              {k.kalemler.map((x, m) => kalemRow(x, m, "2026-08", k.key, k.ad, "Ağu 2026"))}
                            </div>
                          )}
                        </div>
                      ))
                    : H.capex.kalemler.map((k, m) => kalemRow(k, m, "2026-08", "capex", "Kuruluş yatırımı", "Ağu 2026"))}
                  <div className="kalem-row sum big"><span>Ağu 2026 — Kuruluş yatırımı toplam</span><NumView n={conv(H.capex.toplamTl)} sym={sym} /></div>
                </div>
              )}
            </div>
          )}
          {gosterilen.map((ay, j) => {
            const i = dd.a + j;
            return (
              <div className="acc-item" key={ay.ym} ref={(el) => { itemRefs.current[ay.ym] = el; }}>
                <Head k={ay.ym} no={i + 3} title={ayLabel(ay.ym)} sub={`${ay.kisi} mevcut${ay.yeni ? ` · +${ay.yeni} yeni istihdam` : ""}`} tl={ay.toplamTl} />
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
                            {k.kalemler.map((x, m) => kalemRow(x, m, ay.ym, k.key, k.ad, ayLabel(ay.ym)))}
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

        {modal && <DetailModal data={modal} conv={conv} sym={sym} onClose={() => setModal(null)} />}

        <footer className="foot">
          Personel = 256 rol + 2026 bordro motoru · Diğer kümeler geçmiş veriden, düzenlenebilir · <b>{SYM[disp]} {disp}</b> · İsmail KARACA · arsam.net
        </footer>
        </>
        )}
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
