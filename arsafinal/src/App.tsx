import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { DEFAULT_DATA } from "./data/finansal";
import type { Currency, FinansalData, Money } from "./data/finansal";

const SYM: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };
const CURS: Currency[] = ["TRY", "USD", "EUR"];

// --- sayıyı Türkçe gruplara ayır: en yüksek grup kalın, kalanı normal, ondalık italik ---
function parts(n: number) {
  const neg = n < 0;
  const abs = Math.abs(n);
  const r = Math.round(abs * 100) / 100;
  const intPart = Math.floor(r);
  const dec = Math.round((r - intPart) * 100);
  const groups = intPart.toLocaleString("tr-TR").split("."); // ["12","345","678"]
  return {
    neg,
    head: groups[0], // en yüksek (soldaki) grup → kalın
    tail: groups.length > 1 ? "." + groups.slice(1).join(".") : "", // kalan → normal
    dec: dec > 0 ? "," + String(dec).padStart(2, "0") : "", // ondalık → italik
  };
}
function NumView({ n, sym }: { n: number; sym: string }) {
  const p = parts(n);
  return (
    <span className="num">
      {p.neg ? "−" : ""}
      <b>{p.head}</b>
      <span className="mid">{p.tail}</span>
      <i className="dec">{p.dec}</i>
      <span className="sym">{sym}</span>
    </span>
  );
}
// Türkçe-biçimli metni sayıya çevir (binlik . , ondalık ,)
const parseTR = (s: string) => {
  const v = parseFloat(s.replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
  return isNaN(v) ? null : v;
};
// binlik ayraçlı düz metin (düzenleme kutusu için)
const grouped = (n: number) =>
  (Math.round(n * 100) / 100).toLocaleString("tr-TR", { maximumFractionDigits: 2 });

const Icon = {
  lock: "M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16M96 56a32 32 0 0 1 64 0v24H96Zm112 152H48V96h160z",
  edit: "M227.31 73.37l-44.68-44.69a16 16 0 0 0-22.63 0L36.69 152A15.86 15.86 0 0 0 32 163.31V208a16 16 0 0 0 16 16h44.69a15.86 15.86 0 0 0 11.31-4.69L227.31 96a16 16 0 0 0 0-22.63M92.69 208H48v-44.69l88-88L180.69 120ZM192 108.69L147.31 64l24-24L216 84.69Z",
  down: "M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0m-101.66 5.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0-11.32-11.32L136 132.69V40a8 8 0 0 0-16 0v92.69l-26.34-26.35a8 8 0 0 0-11.32 11.32Z",
  up: "M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0M93.66 77.66L120 51.31V144a8 8 0 0 0 16 0V51.31l26.34 26.35a8 8 0 0 0 11.32-11.32l-40-40a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 11.32 11.32",
};
function Svg({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// tıkla-düzenle hücre: okurken stilli sayı, tıklayınca ayraçlı metin kutusu (seçili para biriminde)
function Cell({ display, onCommit, disabled, sym }: { display: number; onCommit: (d: number) => void; disabled?: boolean; sym: string }) {
  const [editing, setEditing] = useState(false);
  if (disabled) return <NumView n={display} sym={sym} />;
  if (editing)
    return (
      <input
        className="cell-in"
        type="text"
        inputMode="decimal"
        autoFocus
        defaultValue={grouped(display)}
        onFocus={(e) => e.target.select()}
        onBlur={(e) => { const v = parseTR(e.target.value); if (v !== null) onCommit(v); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setEditing(false); }}
      />
    );
  return (
    <button type="button" className="cell-btn" onClick={() => setEditing(true)} title="Düzenlemek için tıkla">
      <NumView n={display} sym={sym} />
      <span className="pen"><Svg d={Icon.edit} /></span>
    </button>
  );
}

export function App() {
  const [data, setData] = useState<FinansalData>(() => structuredClone(DEFAULT_DATA));
  const [disp, setDisp] = useState<Currency>("TRY");
  const fileRef = useRef<HTMLInputElement>(null);
  const r = data.meta.rates;

  const rate = (c: Currency) => (c === "TRY" ? r.TRY : c === "USD" ? r.USD : r.EUR);
  const trToDisp = (tl: number) => tl / rate(disp);
  const dispToTr = (d: number) => d * rate(disp);
  const moneyToDisp = (m: Money) => (m.amount * rate(m.currency)) / rate(disp);

  const edit = (fn: (d: FinansalData) => void) =>
    setData((prev) => { const n = structuredClone(prev); fn(n); return n; });

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arsam-finansal-${data.meta.updatedAt}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const j = JSON.parse(String(reader.result)) as FinansalData;
        if (!j.meta || !j.monthly) throw new Error("şema");
        setData(j);
      } catch {
        alert("Geçersiz veya uyumsuz JSON dosyası.");
      }
    };
    reader.readAsText(f);
    e.target.value = "";
  };
  const reset = () => { if (confirm("Tüm değişiklikler sıfırlanacak. Emin misin?")) setData(structuredClone(DEFAULT_DATA)); };
  const sym = SYM[disp];

  const capexTl = data.capex.items.reduce((s, i) => s + i.amount.amount * rate(i.amount.currency), 0);
  const opexTl = data.opex.items.reduce((s, i) => s + i.monthly.amount * rate(i.monthly.currency), 0);
  const startTl = data.monthly.rows.reduce((s, x) => s + x.opex + x.pazarlama + x.capex, 0);

  return (
    <div className="page">
      <header className="bar">
        <div className="brand">
          <span className="logo">arsam.net</span>
          <span className="sep">·</span>
          <span className="ttl">Finansal Tablo</span>
        </div>
        <div className="tools">
          <div className="cur" role="tablist" aria-label="Para birimi">
            {CURS.map((c) => (
              <button key={c} role="tab" aria-selected={c === disp} className={c === disp ? "on" : ""} onClick={() => setDisp(c)}>
                <span className="cs">{SYM[c]}</span> {c}
              </button>
            ))}
          </div>
          <button className="btn" onClick={() => fileRef.current?.click()}><Svg d={Icon.up} /> İçe aktar</button>
          <button className="btn primary" onClick={exportJSON}><Svg d={Icon.down} /> Dışa aktar</button>
          <button className="btn ghost" onClick={reset}>Sıfırla</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJSON} />
        </div>
      </header>

      <main className="main">
        <p className="lede">
          Karmaşık Excel yerine sade tablo. <span className="chip edit"><Svg d={Icon.edit} /> mavi alanlar düzenlenebilir</span>{" "}
          <span className="chip lock"><Svg d={Icon.lock} /> kilitli alanlar referanstır</span>. Üstten para birimini değiştir;
          istediğin an JSON olarak içe/dışa aktar.
        </p>

        <section className="cards">
          <SummaryCard k="Kuruluş yatırımı · CAPEX (bir kerelik)" n={trToDisp(capexTl)} sym={SYM[disp]} />
          <SummaryCard k="OPEX · olgun aylık (2031 temsili)" n={trToDisp(opexTl)} sym={SYM[disp]} accent />
          <SummaryCard k="Başlangıç dönemi toplam gider (Tem 26 → Ara 27)" n={trToDisp(startTl)} sym={SYM[disp]} />
        </section>

        <section className="block">
          <h2>Para birimi kurları <span className="badge edit"><Svg d={Icon.edit} /> düzenlenebilir</span></h2>
          <div className="rates">
            <label>1 $ =
              <input type="text" defaultValue={grouped(r.USD)} key={"usd" + r.USD}
                onBlur={(e) => { const v = parseTR(e.target.value); if (v) edit((d) => { d.meta.rates.USD = v; }); }} /> ₺</label>
            <label>1 € =
              <input type="text" defaultValue={grouped(r.EUR)} key={"eur" + r.EUR}
                onBlur={(e) => { const v = parseTR(e.target.value); if (v) edit((d) => { d.meta.rates.EUR = v; }); }} /> ₺</label>
            <span className="note">1 birim = kaç ₺ (ay-sonu, model varsayımı).</span>
          </div>
        </section>

        <section className="block">
          <h2>{data.monthly.title} <Lock on={data.monthly.editable} /></h2>
          <p className="note">{data.monthly.note}</p>
          <div className="tbl-scroll">
            <table className="grid">
              <thead><tr><th>Ay</th><th>OPEX</th><th>Pazarlama</th><th>CAPEX</th><th>Toplam ay gideri</th></tr></thead>
              <tbody>
                {data.monthly.rows.map((row, i) => (
                  <tr key={i}>
                    <th scope="row">{row.month}</th>
                    <td><Cell sym={sym} display={trToDisp(row.opex)} disabled={!data.monthly.editable} onCommit={(v) => edit((d) => { d.monthly.rows[i].opex = dispToTr(v); })} /></td>
                    <td><Cell sym={sym} display={trToDisp(row.pazarlama)} disabled={!data.monthly.editable} onCommit={(v) => edit((d) => { d.monthly.rows[i].pazarlama = dispToTr(v); })} /></td>
                    <td><Cell sym={sym} display={trToDisp(row.capex)} disabled={!data.monthly.editable} onCommit={(v) => edit((d) => { d.monthly.rows[i].capex = dispToTr(v); })} /></td>
                    <td className="tot"><NumView n={trToDisp(row.opex + row.pazarlama + row.capex)} sym={sym} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="two">
          <section className="block">
            <h2>{data.opex.title} <Lock on={data.opex.editable} /></h2>
            <p className="note">{data.opex.note}</p>
            <table className="grid">
              <thead><tr><th>Kalem</th><th>Aylık</th></tr></thead>
              <tbody>
                {data.opex.items.map((it, i) => (
                  <tr key={i}>
                    <th scope="row">{it.name}</th>
                    <td><Cell sym={sym} display={moneyToDisp(it.monthly)} onCommit={(v) => edit((d) => { d.opex.items[i].monthly = { amount: dispToTr(v) / rate(it.monthly.currency), currency: it.monthly.currency }; })} /></td>
                  </tr>
                ))}
                <tr className="sum"><th scope="row">Toplam aylık OPEX</th><td><NumView n={trToDisp(opexTl)} sym={sym} /></td></tr>
              </tbody>
            </table>
          </section>

          <section className="block">
            <h2>{data.capex.title} <Lock on={data.capex.editable} /></h2>
            <p className="note">{data.capex.note}</p>
            <table className="grid">
              <thead><tr><th>Kalem</th><th>Tutar</th></tr></thead>
              <tbody>
                {data.capex.items.map((it, i) => (
                  <tr key={i}>
                    <th scope="row">{it.name}</th>
                    <td><Cell sym={sym} display={moneyToDisp(it.amount)} onCommit={(v) => edit((d) => { d.capex.items[i].amount = { amount: dispToTr(v) / rate(it.amount.currency), currency: it.amount.currency }; })} /></td>
                  </tr>
                ))}
                <tr className="sum"><th scope="row">Toplam CAPEX</th><td><NumView n={trToDisp(capexTl)} sym={sym} /></td></tr>
              </tbody>
            </table>
          </section>
        </div>

        <section className="block">
          <h2>{data.cpo.title} <Lock on={data.cpo.editable} /></h2>
          <p className="note">{data.cpo.note}</p>
          <table className="grid narrow">
            <thead><tr><th>Dönem</th><th>Aylık ücret</th></tr></thead>
            <tbody>
              {data.cpo.salary.map((s, i) => (
                <tr key={i}>
                  <th scope="row">{s.period}</th>
                  <td><Cell sym={sym} display={moneyToDisp(s.pay)} onCommit={(v) => edit((d) => { d.cpo.salary[i].pay = { amount: dispToTr(v) / rate(s.pay.currency), currency: s.pay.currency }; })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="grid mt">
            <thead><tr><th>Dönem</th><th>Araç segmenti</th></tr></thead>
            <tbody>
              {data.cpo.car.map((c, i) => (
                <tr key={i}>
                  <th scope="row">{c.period}</th>
                  <td className="lft"><input className="txt" value={c.segment} onChange={(e) => edit((d) => { d.cpo.car[i].segment = e.target.value; })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="bullets">
            <li><b>Yakıt:</b> {data.cpo.fuel}</li>
            <li><b>Sağlık:</b> {data.cpo.health}</li>
            <li><b>İzin/tatil:</b> {data.cpo.leave}</li>
          </ul>
        </section>

        <section className="block locked">
          <h2>{data.benchmarks.title} <Lock on={false} /></h2>
          <p className="note warn">{data.benchmarks.disclaimer}</p>
          <Bench title="Yazılımcı maaşları" rows={data.benchmarks.softwareSalaries.map((x) => ({ name: x.role, lo: moneyToDisp(x.min), hi: moneyToDisp(x.max), src: x.region }))} sym={SYM[disp]} />
          <Bench title="Diğer meslekler" rows={data.benchmarks.professions.map((x) => ({ name: x.role, lo: moneyToDisp(x.min), hi: moneyToDisp(x.max), src: x.region }))} sym={SYM[disp]} />
          <Bench title="C-level (büyük e-ticaret / teknoloji)" rows={data.benchmarks.cLevel.map((x) => ({ name: x.company, lo: moneyToDisp(x.min), hi: moneyToDisp(x.max), src: x.note }))} sym={SYM[disp]} />
        </section>

        <footer className="foot">
          Tüm değerler seçili para biriminde (<b>{SYM[disp]} {disp}</b>) gösterilir · veri tek dosyada, JSON ile taşınır · arsam.net
        </footer>
      </main>
    </div>
  );
}

function SummaryCard({ k, n, sym, accent }: { k: string; n: number; sym: string; accent?: boolean }) {
  return (
    <div className={"card" + (accent ? " accent" : "")}>
      <div className="k">{k}</div>
      <div className="v"><NumView n={n} sym={sym} /></div>
    </div>
  );
}
function Lock({ on }: { on: boolean }) {
  return on ? (
    <span className="badge edit"><Svg d={Icon.edit} /> düzenlenebilir</span>
  ) : (
    <span className="badge lock"><Svg d={Icon.lock} /> kilitli</span>
  );
}
function Bench({ title, rows, sym }: { title: string; rows: { name: string; lo: number; hi: number; src: string }[]; sym: string }) {
  return (
    <div className="bench">
      <h3>{title}</h3>
      <table className="grid">
        <tbody>
          {rows.map((x, i) => (
            <tr key={i}>
              <th scope="row">{x.name}</th>
              <td className="rng"><NumView n={x.lo} sym={sym} /> <span className="dash">–</span> <NumView n={x.hi} sym={sym} /></td>
              <td className="src">{x.src}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
