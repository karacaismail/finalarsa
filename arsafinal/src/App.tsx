import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { DEFAULT_DATA } from "./data/finansal";
import type { CostParams, Currency, FinansalData, ManualCatKey, Role } from "./data/finansal";
import { clearStorage, fromJSON, load, save, toJSON } from "./lib/store";
import { Svg, Icon, grouped, parseTR } from "./components/num";
import { Giris } from "./pages/Giris";
import { Kadro } from "./pages/Kadro";
import { Ozet } from "./pages/Ozet";

const SYM: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };
const CURS: Currency[] = ["TRY", "USD", "EUR"];
type Tab = "giris" | "kadro" | "ozet";

export function App() {
  const [data, setData] = useState<FinansalData>(() => load());
  const [disp, setDisp] = useState<Currency>("TRY");
  const [tab, setTab] = useState<Tab>("giris");
  const [selIdx, setSelIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const r = data.meta.rates;

  useEffect(() => { save(data); }, [data]);

  const edit = (fn: (d: FinansalData) => void) =>
    setData((prev) => { const n = structuredClone(prev); fn(n); return n; });

  const onChange = (idx: number, key: ManualCatKey, tl: number) =>
    edit((d) => { d.months[idx].values[key] = Math.max(0, Math.round(tl)); });
  const editRole = (idx: number, patch: Partial<Role>) =>
    edit((d) => { d.roles[idx] = { ...d.roles[idx], ...patch }; });
  const editParam = (patch: Partial<CostParams>) =>
    edit((d) => { d.costParams = { ...d.costParams, ...patch }; });
  const addRole = () =>
    edit((d) => {
      const sira = d.roles.reduce((m, x) => Math.max(m, x.sira), 0) + 1;
      d.roles.unshift({ sira, kod: `R-YENI-${sira}`, ad: "Yeni rol", departman: "5. Engineering — Platform", kademe: "Teknik", unvan: "Mid", brutMaas: 56151, istihdamYm: "2026-09" });
    });
  const removeRole = (idx: number) => edit((d) => { d.roles.splice(idx, 1); });

  const exportJSON = () => {
    const blob = new Blob([toJSON(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `arsam-finansal-${data.meta.updatedAt}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const importJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { try { setData(fromJSON(String(reader.result))); setSelIdx(0); } catch { alert("Geçersiz veya uyumsuz JSON."); } };
    reader.readAsText(f); e.target.value = "";
  };
  const reset = () => {
    if (confirm("Tüm değişiklikler (roller, parametreler, girişler) silinip varsayılana dönülecek. Emin misin?")) {
      clearStorage(); setData(structuredClone(DEFAULT_DATA)); setSelIdx(0);
    }
  };

  return (
    <div className="page">
      <header className="bar">
        <div className="brand">
          <span className="logo">arsam.net</span><span className="sep">·</span><span className="ttl">Kadro & Gider</span>
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

      <nav className="tabs">
        <button className={"tab" + (tab === "giris" ? " on" : "")} onClick={() => setTab("giris")}>Giriş</button>
        <button className={"tab" + (tab === "kadro" ? " on" : "")} onClick={() => setTab("kadro")}>Kadro ({data.roles.length})</button>
        <button className={"tab" + (tab === "ozet" ? " on" : "")} onClick={() => setTab("ozet")}>Özet &amp; grafikler</button>
        <div className="rate-mini">
          <span>1 $ =<input type="text" defaultValue={grouped(r.USD)} key={"usd" + r.USD} onBlur={(e) => { const v = parseTR(e.target.value); if (v) edit((d) => { d.meta.rates.USD = v; }); }} /> ₺</span>
          <span>1 € =<input type="text" defaultValue={grouped(r.EUR)} key={"eur" + r.EUR} onBlur={(e) => { const v = parseTR(e.target.value); if (v) edit((d) => { d.meta.rates.EUR = v; }); }} /> ₺</span>
        </div>
      </nav>

      <main className="main">
        {tab === "giris" && <Giris data={data} disp={disp} selIdx={selIdx} setSelIdx={setSelIdx} onChange={onChange} goKadro={() => setTab("kadro")} />}
        {tab === "kadro" && <Kadro data={data} disp={disp} editRole={editRole} editParam={editParam} addRole={addRole} removeRole={removeRole} />}
        {tab === "ozet" && <Ozet data={data} disp={disp} />}
      </main>

      <footer className="foot">
        Personel = Kadro'dan zincirli (aktif rollerin yüklü maliyeti) · değerler <b>{SYM[disp]} {disp}</b> · veri tarayıcıda saklanır, JSON ile taşınır · arsam.net
      </footer>
    </div>
  );
}
