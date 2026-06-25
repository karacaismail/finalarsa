import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { DEFAULT_DATA } from "./data/finansal";
import type { Currency, FinansalData, Money } from "./data/finansal";

const SYM: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };
const CURS: Currency[] = ["TRY", "USD", "EUR"];

export function App() {
  const [data, setData] = useState<FinansalData>(() => structuredClone(DEFAULT_DATA));
  const [disp, setDisp] = useState<Currency>("TRY");
  const fileRef = useRef<HTMLInputElement>(null);
  const r = data.meta.rates;

  // --- para birimi çevirimi: değerler kendi para biriminde tutulur, seçilen birimde gösterilir ---
  const rate = (c: Currency) => (c === "TRY" ? r.TRY : c === "USD" ? r.USD : r.EUR);
  const trToDisp = (tl: number) => tl / rate(disp);
  const dispToTr = (d: number) => d * rate(disp);
  const moneyToDisp = (m: Money) => (m.amount * rate(m.currency)) / rate(disp);
  const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(n || 0));
  const showTl = (tl: number) => `${fmt(trToDisp(tl))} ${SYM[disp]}`;
  const showM = (m: Money) => `${fmt(moneyToDisp(m))} ${SYM[disp]}`;

  const edit = (fn: (d: FinansalData) => void) =>
    setData((prev) => { const n = structuredClone(prev); fn(n); return n; });

  // --- JSON içe/dışa aktar ---
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
        alert("JSON başarıyla yüklendi.");
      } catch {
        alert("Geçersiz veya uyumsuz JSON dosyası.");
      }
    };
    reader.readAsText(f);
    e.target.value = "";
  };
  const reset = () => { if (confirm("Tüm değişiklikler sıfırlanıp varsayılan veriye dönülecek. Emin misin?")) setData(structuredClone(DEFAULT_DATA)); };

  // --- düzenlenebilir sayı hücresi (seçilen para biriminde düzenler, TL olarak saklar) ---
  const NumTl = ({ tl, on, disabled }: { tl: number; on: (tl: number) => void; disabled?: boolean }) =>
    disabled ? (
      <span className="ro">{showTl(tl)}</span>
    ) : (
      <span className="ie">
        <input
          type="number"
          value={Math.round(trToDisp(tl))}
          onChange={(e) => on(dispToTr(Number(e.target.value)))}
        />
        <em>{SYM[disp]}</em>
      </span>
    );
  // düzenlenebilir Money hücresi (kendi biriminde saklar)
  const NumM = ({ m, on }: { m: Money; on: (m: Money) => void }) => (
    <span className="ie">
      <input
        type="number"
        value={Math.round(moneyToDisp(m))}
        onChange={(e) => on({ amount: (dispToTr(Number(e.target.value))) / rate(m.currency), currency: m.currency })}
      />
      <em>{SYM[disp]}</em>
    </span>
  );

  // --- özet kartlar ---
  const capexTotalTl = data.capex.items.reduce((s, i) => s + i.amount.amount * rate(i.amount.currency), 0);
  const opexMonthlyTl = data.opex.items.reduce((s, i) => s + i.monthly.amount * rate(i.monthly.currency), 0);
  const startSpendTl = data.monthly.rows.reduce((s, row) => s + row.opex + row.pazarlama + row.capex, 0);

  return (
    <div className="wrap">
      {/* ÜST BAR */}
      <header className="bar">
        <div className="brand">
          <strong>arsam.net</strong> <span>· Finansal Tablo</span>
        </div>
        <div className="tools">
          <div className="cur" role="tablist" aria-label="Para birimi">
            {CURS.map((c) => (
              <button key={c} role="tab" aria-selected={c === disp} className={c === disp ? "on" : ""} onClick={() => setDisp(c)}>
                {SYM[c]} {c}
              </button>
            ))}
          </div>
          <button className="btn" onClick={() => fileRef.current?.click()}>JSON içe aktar</button>
          <button className="btn primary" onClick={exportJSON}>JSON dışa aktar</button>
          <button className="btn ghost" onClick={reset}>Sıfırla</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJSON} />
        </div>
      </header>

      <main>
        <p className="intro">
          Karmaşık Excel yerine sade tablo. Mavi alanlar <b>düzenlenebilir</b>; düzenler, üstten para birimini değiştirir,
          istediğin an <b>JSON olarak dışa/içe aktarırsın</b>. Kilit (🔒) işaretli bölümler referanstır, değiştirilemez.
        </p>

        {/* ÖZET */}
        <section className="cards">
          <div className="card">
            <div className="k">Kuruluş yatırımı (CAPEX, bir kerelik)</div>
            <div className="v">{showTl(capexTotalTl)}</div>
          </div>
          <div className="card">
            <div className="k">OPEX — olgun aylık (2031 temsili)</div>
            <div className="v">{showTl(opexMonthlyTl)}</div>
          </div>
          <div className="card">
            <div className="k">Başlangıç dönemi toplam gider (Tem 2026 → Ara 2027)</div>
            <div className="v">{showTl(startSpendTl)}</div>
          </div>
        </section>

        {/* KUR (düzenlenebilir) */}
        <section className="block">
          <h2>Para birimi kurları <span className="hint">1 birim = kaç ₺ · düzenlenebilir</span></h2>
          <div className="rates">
            <label>1 $ = <input type="number" value={r.USD} onChange={(e) => edit((d) => { d.meta.rates.USD = Number(e.target.value); })} /> ₺</label>
            <label>1 € = <input type="number" value={r.EUR} onChange={(e) => edit((d) => { d.meta.rates.EUR = Number(e.target.value); })} /> ₺</label>
            <span className="note">{r.note}</span>
          </div>
        </section>

        {/* AYLIK */}
        <section className="block">
          <h2>{data.monthly.title} <Lock on={data.monthly.editable} /></h2>
          <p className="note">{data.monthly.note}</p>
          <div className="tbl-scroll">
            <table>
              <thead>
                <tr><th>Ay</th><th>OPEX</th><th>Pazarlama</th><th>CAPEX</th><th>Toplam ay gideri</th></tr>
              </thead>
              <tbody>
                {data.monthly.rows.map((row, i) => (
                  <tr key={i}>
                    <th scope="row">{row.month}</th>
                    <td><NumTl tl={row.opex} disabled={!data.monthly.editable} on={(v) => edit((d) => { d.monthly.rows[i].opex = v; })} /></td>
                    <td><NumTl tl={row.pazarlama} disabled={!data.monthly.editable} on={(v) => edit((d) => { d.monthly.rows[i].pazarlama = v; })} /></td>
                    <td><NumTl tl={row.capex} disabled={!data.monthly.editable} on={(v) => edit((d) => { d.monthly.rows[i].capex = v; })} /></td>
                    <td className="tot">{showTl(row.opex + row.pazarlama + row.capex)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* OPEX + CAPEX yan yana */}
        <div className="two">
          <section className="block">
            <h2>{data.opex.title} <Lock on={data.opex.editable} /></h2>
            <p className="note">{data.opex.note}</p>
            <table>
              <thead><tr><th>Kalem</th><th>Aylık</th></tr></thead>
              <tbody>
                {data.opex.items.map((it, i) => (
                  <tr key={i}>
                    <th scope="row">{it.name}</th>
                    <td><NumM m={it.monthly} on={(m) => edit((d) => { d.opex.items[i].monthly = m; })} /></td>
                  </tr>
                ))}
                <tr className="sum"><th scope="row">Toplam aylık OPEX</th><td>{showTl(opexMonthlyTl)}</td></tr>
              </tbody>
            </table>
          </section>

          <section className="block">
            <h2>{data.capex.title} <Lock on={data.capex.editable} /></h2>
            <p className="note">{data.capex.note}</p>
            <table>
              <thead><tr><th>Kalem</th><th>Tutar</th></tr></thead>
              <tbody>
                {data.capex.items.map((it, i) => (
                  <tr key={i}>
                    <th scope="row">{it.name}</th>
                    <td><NumM m={it.amount} on={(m) => edit((d) => { d.capex.items[i].amount = m; })} /></td>
                  </tr>
                ))}
                <tr className="sum"><th scope="row">Toplam CAPEX</th><td>{showTl(capexTotalTl)}</td></tr>
              </tbody>
            </table>
          </section>
        </div>

        {/* CPO HAKLARI */}
        <section className="block">
          <h2>{data.cpo.title} <Lock on={data.cpo.editable} /></h2>
          <p className="note">{data.cpo.note}</p>
          <table>
            <thead><tr><th>Dönem</th><th>Aylık ücret</th></tr></thead>
            <tbody>
              {data.cpo.salary.map((s, i) => (
                <tr key={i}>
                  <th scope="row">{s.period}</th>
                  <td><NumM m={s.pay} on={(m) => edit((d) => { d.cpo.salary[i].pay = m; })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="mt">
            <thead><tr><th>Dönem</th><th>Araç segmenti</th></tr></thead>
            <tbody>
              {data.cpo.car.map((c, i) => (
                <tr key={i}>
                  <th scope="row">{c.period}</th>
                  <td>
                    <input className="txt" value={c.segment} onChange={(e) => edit((d) => { d.cpo.car[i].segment = e.target.value; })} />
                  </td>
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

        {/* BENCHMARK (kilitli) */}
        <section className="block locked">
          <h2>{data.benchmarks.title} 🔒</h2>
          <p className="note warn">{data.benchmarks.disclaimer}</p>
          <BenchTable title="Yazılımcı maaşları" rows={data.benchmarks.softwareSalaries.map((x) => [x.role, showM(x.min) + " – " + showM(x.max), x.region])} />
          <BenchTable title="Diğer meslekler" rows={data.benchmarks.professions.map((x) => [x.role, showM(x.min) + " – " + showM(x.max), x.region])} />
          <BenchTable title="C-level (büyük e-ticaret/teknoloji)" rows={data.benchmarks.cLevel.map((x) => [x.company, showM(x.min) + " – " + showM(x.max), x.note])} />
        </section>

        <footer className="foot">
          <span className="legend"><i className="dot edit" /> düzenlenebilir (değişken)</span>
          <span className="legend"><i className="dot lock" /> 🔒 kilitli (sabit referans)</span>
          <span>Tüm değerler seçili para biriminde ({SYM[disp]} {disp}) gösterilir. Veri tek dosyada; JSON ile taşınır.</span>
        </footer>
      </main>
    </div>
  );
}

function Lock({ on }: { on: boolean }) {
  return on ? <span className="badge edit">düzenlenebilir</span> : <span className="badge lock">🔒 kilitli</span>;
}

function BenchTable({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="bench">
      <h3>{title}</h3>
      <table>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i}>
              <th scope="row">{cells[0]}</th>
              <td className="rng">{cells[1]}</td>
              <td className="src">{cells[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
