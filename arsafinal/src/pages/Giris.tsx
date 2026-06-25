// Giriş: yıl/ay seç; PERSONEL kalemi Kadro'dan otomatik (salt-okunur); 6 manuel kalem elle.
import { ayLabel } from "../data/finansal";
import type { Currency, FinansalData, ManualCatKey, Rates } from "../data/finansal";
import { dispToTr, trToDisp, personelAy, aktifSayi, ayToplamTL } from "../lib/calc";
import { Cell, NumView, Svg, Icon } from "../components/num";

const SYM: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };

export function Giris({
  data, disp, selIdx, setSelIdx, onChange, goKadro,
}: {
  data: FinansalData;
  disp: Currency;
  selIdx: number;
  setSelIdx: (i: number) => void;
  onChange: (idx: number, key: ManualCatKey, tl: number) => void;
  goKadro: () => void;
}) {
  const rates: Rates = data.meta.rates;
  const sym = SYM[disp];
  const yms = data.months.map((m) => m.ym);
  const son = yms.length - 1;
  const selYm = yms[selIdx];
  const selYear = Number(selYm.split("-")[0]);
  const years = [...new Set(yms.map((y) => Number(y.split("-")[0])))];
  const month = data.months[selIdx];

  const personelTl = personelAy(data.roles, data.costParams, selYm);
  const kisi = aktifSayi(data.roles, selYm);
  const toplamTl = ayToplamTL(data, month);

  const setYear = (y: number) => { const i = yms.findIndex((ym) => ym.startsWith(String(y))); if (i >= 0) setSelIdx(i); };

  return (
    <div className="giris">
      <section className="block nav-block">
        <h2>Ay seç ve gir</h2>
        <p className="note">Yıl/ay seç; o ayın giderlerini gir. <b>Personel kalemi Kadro panelinden otomatik hesaplanır</b> (o ay aktif rollerin yüklü maliyeti). Diğer kalemleri elle girersin. “Sonraki ay” ile ilerle; Özet otomatik toplar.</p>
        <div className="month-nav">
          <button className="btn" disabled={selIdx === 0} onClick={() => setSelIdx(Math.max(0, selIdx - 1))}><Svg d={Icon.prev} /> Önceki</button>
          <div className="selectors">
            <label>Yıl
              <select value={selYear} onChange={(e) => setYear(Number(e.target.value))}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <label>Ay
              <select value={selYm} onChange={(e) => setSelIdx(yms.indexOf(e.target.value))}>
                {yms.filter((ym) => ym.startsWith(String(selYear))).map((ym) => <option key={ym} value={ym}>{ayLabel(ym)}</option>)}
              </select>
            </label>
          </div>
          <button className="btn primary" disabled={selIdx === son} onClick={() => setSelIdx(Math.min(son, selIdx + 1))}>Sonraki <Svg d={Icon.next} /></button>
        </div>
        <div className="month-meta">Ay {selIdx + 1} / {yms.length} · <b>{ayLabel(selYm)}</b></div>
      </section>

      <section className="block">
        <h2>{ayLabel(selYm)} — giderler</h2>
        <div className="form">
          {/* PERSONEL — kadrodan, salt-okunur */}
          <div className="form-grup">
            <div className="grup-bas"><span>Personel</span></div>
            <div className="form-row chained">
              <label>
                Personel (yüklü maliyet)
                <span className="sub">{kisi} aktif rol · brüt + SGK + yemek + yan hak + ikramiye</span>
              </label>
              <div className="chained-val">
                <NumView n={trToDisp(personelTl, disp, rates)} sym={sym} />
                <button type="button" className="link-btn" onClick={goKadro}><Svg d={Icon.lock} size={14} /> Kadro'dan</button>
              </div>
            </div>
          </div>

          {/* MANUEL kalemler */}
          <div className="form-grup">
            <div className="grup-bas"><span>Diğer giderler (elle)</span>
              <span className="badge edit"><Svg d={Icon.edit} size={15} /> düzenlenebilir</span></div>
            {data.categories.map((c) => (
              <div className="form-row" key={c.key}>
                <label>{c.label}</label>
                <Cell sym={sym} display={trToDisp(month.values[c.key], disp, rates)}
                  onCommit={(v) => onChange(selIdx, c.key, dispToTr(v, disp, rates))} />
              </div>
            ))}
          </div>

          <div className="form-toplam">
            <span>Bu ay toplam gider</span>
            <NumView n={trToDisp(toplamTl, disp, rates)} sym={sym} />
          </div>
        </div>
      </section>
    </div>
  );
}
