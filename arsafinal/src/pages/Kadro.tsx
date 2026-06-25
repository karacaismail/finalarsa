// Kadro paneli: maliyet modeli parametreleri + 256 rol tablosu (düzenlenebilir) + özet.
// ZİNCİR: burada brüt/işe alım/parametre değişince personel gideri ve tüm Özet güncellenir.
import { useMemo, useState } from "react";
import { ayLabel } from "../data/finansal";
import type { CostParams, Currency, FinansalData, Rates, Role } from "../data/finansal";
import { dispToTr, trToDisp, roleMonthlyCost, aktifSayi, personelAy } from "../lib/calc";
import { Cell, NumView, parseTR, grouped, Svg, Icon } from "../components/num";

const SYM: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };
const SON_AY = "2028-08"; // pencere sonu

export function Kadro({
  data, disp, editRole, editParam, addRole, removeRole,
}: {
  data: FinansalData;
  disp: Currency;
  editRole: (idx: number, patch: Partial<Role>) => void;
  editParam: (patch: Partial<CostParams>) => void;
  addRole: () => void;
  removeRole: (idx: number) => void;
}) {
  const rates: Rates = data.meta.rates;
  const sym = SYM[disp];
  const p = data.costParams;
  const [ara, setAra] = useState("");
  const [pencere, setPencere] = useState(true);

  const list = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase("tr");
    return data.roles
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => (pencere ? r.istihdamYm <= SON_AY : true))
      .filter(({ r }) =>
        !q || r.kod.toLocaleLowerCase("tr").includes(q) || r.ad.toLocaleLowerCase("tr").includes(q) || r.departman.toLocaleLowerCase("tr").includes(q));
  }, [data.roles, ara, pencere]);

  const sonAktif = aktifSayi(data.roles, SON_AY);
  const sonPersonel = personelAy(data.roles, p, SON_AY);

  return (
    <div className="kadro">
      <section className="block">
        <h2>Maaş maliyet modeli <span className="badge edit"><Svg d={Icon.edit} size={15} /> düzenlenebilir</span></h2>
        <p className="note">Aylık personel gideri = aktif rollerin: <b>brüt × SGK çarpanı × (1 + ikramiye/12) + yemek + yan haklar</b>. Parametreleri kendi varsayımlarınla değiştir; tüm tablolar/grafikler anında güncellenir.</p>
        <div className="params">
          <ParamField value={p.isverenSgkCarpan} label="İşveren SGK/vergi çarpanı" hint="brüt × bu (ör. 1,225 ≈ %22,5)" onCommit={(v) => editParam({ isverenSgkCarpan: v })} />
          <ParamField value={p.yemekAylik} label="Yemek (₺/ay/kişi)" hint="kişi başı aylık" onCommit={(v) => editParam({ yemekAylik: v })} />
          <ParamField value={p.yanHaklarAylik} label="Yan haklar (₺/ay/kişi)" hint="ulaşım, sağlık vb." onCommit={(v) => editParam({ yanHaklarAylik: v })} />
          <ParamField value={p.ikramiyeMaasYil} label="İkramiye (yıl/maaş)" hint="yılda kaç maaş (aylığa /12)" onCommit={(v) => editParam({ ikramiyeMaasYil: v })} />
        </div>
      </section>

      <section className="cards">
        <Card k="Kayıtlı rol (tüm plan)" v={data.roles.length} sym="" />
        <Card k="Ağu 2028 sonu aktif rol" v={sonAktif} sym="" />
        <Card k="Ağu 2028 personel gideri / ay" n={trToDisp(sonPersonel, disp, rates)} sym={sym} accent />
      </section>

      <section className="block">
        <h2>Roller <span className="badge edit"><Svg d={Icon.edit} size={15} /> brüt & işe alım düzenlenebilir</span></h2>
        <div className="kadro-tools">
          <input className="ara" type="search" placeholder="Ara: kod, rol adı, departman…" value={ara} onChange={(e) => setAra(e.target.value)} />
          <label className="cb"><input type="checkbox" checked={pencere} onChange={(e) => setPencere(e.target.checked)} /> Sadece pencere (işe alım ≤ Ağu 2028)</label>
          <span className="say">{list.length} rol</span>
          <button className="btn primary" onClick={addRole}>+ Rol ekle</button>
        </div>
        <div className="tbl-scroll kadro-scroll">
          <table className="grid kadro-tbl">
            <thead>
              <tr>
                <th>#</th><th>Kod</th><th>Rol Adı</th><th>Departman</th><th>Kademe</th><th>Ünvan</th>
                <th>Brüt / ay</th><th>İşe alım</th><th>Yüklü / ay</th><th></th>
              </tr>
            </thead>
            <tbody>
              {list.map(({ r, idx }) => (
                <tr key={idx}>
                  <td className="c-sira">{r.sira}</td>
                  <td className="c-kod">{r.kod}</td>
                  <td className="lft"><input className="txt sm" value={r.ad} onChange={(e) => editRole(idx, { ad: e.target.value })} /></td>
                  <td className="lft c-dep">{r.departman}</td>
                  <td className="lft">{r.kademe}</td>
                  <td className="lft">{r.unvan}</td>
                  <td><Cell sym={sym} display={trToDisp(r.brutMaas, disp, rates)} onCommit={(v) => editRole(idx, { brutMaas: Math.round(dispToTr(v, disp, rates)) })} /></td>
                  <td className="c-ay"><input className="month-in" type="month" value={r.istihdamYm} onChange={(e) => e.target.value && editRole(idx, { istihdamYm: e.target.value })} /></td>
                  <td className="tot"><NumView n={trToDisp(roleMonthlyCost(r, p), disp, rates)} sym={sym} /></td>
                  <td><button className="x-btn" title="Sil" onClick={() => removeRole(idx)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">İpucu: “İşe alım” ayını değiştirince rol o aydan itibaren aktif sayılır ve aylık personel gideri ile Özet otomatik değişir. Pencere dışı (Ağu 2028 sonrası) roller 24 aylık görünümü etkilemez ama planda durur.</p>
      </section>
    </div>
  );
}

function Card({ k, n, v, sym, accent }: { k: string; n?: number; v?: number; sym: string; accent?: boolean }) {
  return (
    <div className={"card" + (accent ? " accent" : "")}>
      <div className="k">{k}</div>
      <div className="v">{n !== undefined ? <NumView n={n} sym={sym} /> : <span className="num"><b>{v}</b></span>}</div>
    </div>
  );
}

function ParamField({ value, label, hint, onCommit }: { value: number; label: string; hint: string; onCommit: (v: number) => void }) {
  return (
    <label className="param">
      <span className="p-lbl">{label}</span>
      <input type="text" inputMode="decimal" defaultValue={grouped(value)} key={String(value)}
        onBlur={(e) => { const v = parseTR(e.target.value); if (v !== null && v >= 0) onCommit(v); }} />
      <span className="p-hint">{hint}</span>
    </label>
  );
}
