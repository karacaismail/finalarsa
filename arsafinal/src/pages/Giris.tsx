// Giriş sayfası: yıl/ay seç, o ayın giderlerini 7 kategoride gir, önceki/sonraki ay ile ilerle.
import { ayLabel } from "../data/finansal";
import type { CatKey, Currency, FinansalData, Rates } from "../data/finansal";
import { dispToTr, trToDisp, ayToplam } from "../lib/calc";
import { Cell, NumView, Svg, Icon } from "../components/num";

const SYM: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };

const GRUPLAR: { baslik: string; keys: CatKey[] }[] = [
  { baslik: "İşletme gideri — OPEX", keys: ["personel", "saha", "dijital", "ofis", "yazilim"] },
  { baslik: "Pazarlama", keys: ["pazarlama"] },
  { baslik: "Yatırım — CAPEX", keys: ["capex"] },
];

export function Giris({
  data, disp, selIdx, setSelIdx, onChange,
}: {
  data: FinansalData;
  disp: Currency;
  selIdx: number;
  setSelIdx: (i: number) => void;
  onChange: (idx: number, key: CatKey, tl: number) => void;
}) {
  const rates: Rates = data.meta.rates;
  const sym = SYM[disp];
  const yms = data.months.map((m) => m.ym);
  const son = yms.length - 1;
  const selYm = yms[selIdx];
  const selYear = Number(selYm.split("-")[0]);
  const years = [...new Set(yms.map((y) => Number(y.split("-")[0])))];
  const label = (key: CatKey) => data.categories.find((c) => c.key === key)!.label;

  const setYear = (y: number) => {
    const idx = yms.findIndex((ym) => ym.startsWith(String(y)));
    if (idx >= 0) setSelIdx(idx);
  };
  const month = data.months[selIdx];
  const buAyToplam = ayToplam(month);

  return (
    <div className="giris">
      <section className="block nav-block">
        <h2>Ay seç ve gir</h2>
        <p className="note">Yıl ve ay seç, aşağıda o ayın giderlerini kategori kategori gir. Bittiğinde “Sonraki ay” ile ilerle; Özet sekmesi otomatik toplar.</p>
        <div className="month-nav">
          <button className="btn" disabled={selIdx === 0} onClick={() => setSelIdx(Math.max(0, selIdx - 1))}>
            <Svg d={Icon.prev} /> Önceki
          </button>
          <div className="selectors">
            <label>Yıl
              <select value={selYear} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <label>Ay
              <select value={selYm} onChange={(e) => setSelIdx(yms.indexOf(e.target.value))}>
                {yms.filter((ym) => ym.startsWith(String(selYear))).map((ym) => (
                  <option key={ym} value={ym}>{ayLabel(ym)}</option>
                ))}
              </select>
            </label>
          </div>
          <button className="btn primary" disabled={selIdx === son} onClick={() => setSelIdx(Math.min(son, selIdx + 1))}>
            Sonraki <Svg d={Icon.next} />
          </button>
        </div>
        <div className="month-meta">Ay {selIdx + 1} / {yms.length} · <b>{ayLabel(selYm)}</b></div>
      </section>

      <section className="block">
        <h2>{ayLabel(selYm)} — giderler <span className="badge edit"><Svg d={Icon.edit} size={15} /> düzenlenebilir</span></h2>
        <div className="form">
          {GRUPLAR.map((g) => {
            const grupTl = g.keys.reduce((s, k) => s + month.values[k], 0);
            return (
              <div className="form-grup" key={g.baslik}>
                <div className="grup-bas">
                  <span>{g.baslik}</span>
                  <span className="grup-tut"><NumView n={trToDisp(grupTl, disp, rates)} sym={sym} /></span>
                </div>
                {g.keys.map((k) => (
                  <div className="form-row" key={k}>
                    <label>{label(k)}</label>
                    <Cell
                      sym={sym}
                      display={trToDisp(month.values[k], disp, rates)}
                      onCommit={(v) => onChange(selIdx, k, dispToTr(v, disp, rates))}
                    />
                  </div>
                ))}
              </div>
            );
          })}
          <div className="form-toplam">
            <span>Bu ay toplam gider</span>
            <NumView n={trToDisp(buAyToplam, disp, rates)} sym={sym} />
          </div>
        </div>
      </section>
    </div>
  );
}
