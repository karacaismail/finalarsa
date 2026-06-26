// Aylık küme hesaplayıcı — SAF ARREARS (nakit, bir ay gecikmeli).
// İşbaşı 1 Ağustos. Gösterilen her ay M = BİR ÖNCEKİ ay (eym) işgücünün gideridir; maaş o ayın 5'inde ödenir.
// → Eylül satırı = Ağustos işgücünün maaşı (5 Eylül'de ödenir) → maaş Eylül'de görünür.
// → Aralık işgücünün maaşı 5 Ocak'ta ödenir → Oca 2027 satırında, "2026 sonu" görünümüne girmez.
// İkramiye = ödendiği ay (ym, bayram/yıl-sonu öncesi). Ağustos ayrıca CAPEX item'ıdır (kuruluş yatırımı).
import { bordroAy, brutCozHedefNet } from "./payroll";
import { ymList, MATURE_HC } from "../data/finansal";
import type { FinansalData, FounderStep } from "../data/finansal";

export interface Kalem { ad: string; tl: number; }
export interface Kume { key: string; ad: string; renk: string; tl: number; kalemler: Kalem[]; }
export interface AyKirilim { ym: string; toplamTl: number; kisi: number; yeni: number; kumeler: Kume[]; }
export interface CapexOzet { toplamTl: number; kalemler: Kalem[]; }
export interface Hesap { capex: CapexOzet; yazilimDev: CapexOzet; aylar: AyKirilim[]; }

export const KUME_RENK: Record<string, string> = {
  personel: "#2f6b34", capex: "#a16207", surekli: "#0e7490", ofis: "#7c5cff",
  pazarlama: "#1f6feb", yazilim: "#be123c", profesyonel: "#b8860b", saha: "#5d6650",
};

function founderNetUsd(founder: FounderStep[], ym: string): number {
  let v = 0;
  for (const s of founder) if (s.fromYm <= ym) v = s.netUsd;
  return v;
}
const aktif = (istihdamYm: string, ym: string) => istihdamYm <= ym;
// bir önceki ay (maaş hak-ediş ayı)
function prevYm(ym: string): string {
  let [y, m] = ym.split("-").map(Number);
  m -= 1; if (m < 1) { m = 12; y -= 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function hesapla(d: FinansalData): Hesap {
  const aylik = ymList();            // gösterilen aylar: Eyl 2026 … Ağu 2028
  const p = d.params;
  const bp = { ...d.bordro, isverenSgkOran: p.isverenSgkOran };
  const pazMap = new Map(d.pazarlama.map((x) => [x.ym, x.tl]));

  // Bordro YTD (yıl-içi kümülatif) — hak-ediş ayının (eym) yılına göre sıfırlanır.
  const ytd: Record<number, { matrah: number; asgari: number }> = {};
  let fytd = { matrah: 0, asgari: 0 };
  let oncekiYil = "";

  const aylar: AyKirilim[] = aylik.map((ym, idx) => {
    const eym = prevYm(ym);          // gösterilen ay = eym işgücünün gideri (maaş 5'inde ödenir)
    const eyil = eym.slice(0, 4);
    if (eyil !== oncekiYil) { for (const k in ytd) delete ytd[Number(k)]; fytd = { matrah: 0, asgari: 0 }; oncekiYil = eyil; }

    // --- İŞGÜCÜ = eym (bir önceki ay) ---
    const aktifler = d.roles.filter((r) => aktif(r.istihdamYm, eym));
    const kisi = aktifler.length;
    const yeni = d.roles.filter((r) => r.istihdamYm === eym).length;
    const fac = kisi / MATURE_HC;

    // --- PERSONEL (eym işgücü; bordro YTD) ---
    let net = 0, vergi = 0, sgk = 0, brutTop = 0;
    for (const r of aktifler) {
      if (r.kod === p.kuruculKod) continue;
      const y = ytd[r.sira] || (ytd[r.sira] = { matrah: 0, asgari: 0 });
      const b = bordroAy(r.brutMaas, y.matrah, y.asgari, bp);
      net += b.net; vergi += b.gelirVergisi; sgk += b.calisanSgk + b.isverenSgk; brutTop += b.brut;
      y.matrah += b.gvMatrah; y.asgari += bp.asgariGvMatrah;
    }
    const kurucu = aktifler.find((r) => r.kod === p.kuruculKod);
    if (kurucu) {
      const hedefNet = founderNetUsd(d.founder, eym) * p.usd;
      const brut = brutCozHedefNet(hedefNet, fytd.matrah, fytd.asgari, bp);
      const b = bordroAy(brut, fytd.matrah, fytd.asgari, bp);
      net += b.net; vergi += b.gelirVergisi; sgk += b.calisanSgk + b.isverenSgk; brutTop += b.brut;
      fytd.matrah += b.gvMatrah; fytd.asgari += bp.asgariGvMatrah;
    }
    let yemek = 0;
    for (const rr of aktifler) yemek += rr.unvan === "C-Level" ? p.yemekClevel : rr.unvan === "Team Lead" ? p.yemekTeamLead : p.yemekAylik;
    const yol = kisi * p.yolAylik;
    const hosgeldin = yeni * p.hosgeldinKisi;
    // İkramiye — ÖDENDİĞİ ay (ym, bayram/yıl-sonu öncesi); tutar o işgücünün brüt toplamına oranlı.
    const ikramiyeOlaylar = d.ikramiye.filter((e) => e.ym === ym);
    const ikramiyePct = ikramiyeOlaylar.reduce((s, e) => s + e.pct, 0);
    const ikramiye = ikramiyePct * brutTop;
    const ikramiyeAd = ikramiyeOlaylar.length
      ? "İkramiye — " + ikramiyeOlaylar.map((e) => `${e.ad} %${Math.round(e.pct * 100)}`).join(" + ")
      : "İkramiye (bu ay yok)";
    let aracSeg = "", aracTl = 0;
    for (const a of d.arac) if (a.fromYm <= eym) { aracSeg = a.segment; aracTl = a.aylikTl; }
    const personel: Kume = {
      key: "personel", ad: "Personel giderleri", renk: KUME_RENK.personel,
      tl: net + vergi + sgk + yemek + yol + hosgeldin + ikramiye + aracTl,
      kalemler: [
        { ad: "Net maaşlar (önceki ay · 5'inde ödenir)", tl: net },
        { ad: "Gelir vergisi (stopaj)", tl: vergi },
        { ad: "SGK primleri (işçi + işveren)", tl: sgk },
        { ad: "Yemek", tl: yemek },
        { ad: "Yol ücreti", tl: yol },
        { ad: "Hoşgeldin paketi (yeni işe alım)", tl: hosgeldin },
        { ad: ikramiyeAd, tl: ikramiye },
        { ad: "2025+ model: CPO araç — " + aracSeg + " (kiralama)", tl: aracTl },
      ],
    };

    // CAPEX operasyonel aylarda YOK — kuruluş yatırımı yalnız Ağustos'ta (ayrı item).

    // --- OFİS & KİRA ---
    const ofisKalem: Kalem[] = [{ ad: "Ofis kirası", tl: d.olgun.kira }];
    if (idx === 0) ofisKalem.push({ ad: "Depozito (3 ay)", tl: d.olgun.depozito });
    const ofis: Kume = { key: "ofis", ad: "Ofis & kira", renk: KUME_RENK.ofis, tl: ofisKalem.reduce((s, k) => s + k.tl, 0), kalemler: ofisKalem };

    // --- SÜREKLİ GİDERLER (eym headcount-ölçekli) ---
    const u = d.olgun.utilities * fac; const s = d.utilSplit;
    const surekliKalem: Kalem[] = [
      { ad: "İnternet", tl: u * s.internet }, { ad: "Elektrik", tl: u * s.elektrik },
      { ad: "Su", tl: u * s.su }, { ad: "Doğalgaz", tl: u * s.dogalgaz },
      { ad: "Mutfak", tl: u * s.mutfak }, { ad: "Sarf malzeme", tl: u * s.sarf },
      { ad: "Kırtasiye", tl: u * s.kirtasiye }, { ad: "Temizlik", tl: u * s.temizlik },
    ];
    const surekli: Kume = { key: "surekli", ad: "Sürekli giderler", renk: KUME_RENK.surekli, tl: u, kalemler: surekliKalem };

    // --- PAZARLAMA (eym) ---
    const pazTl = pazMap.get(eym) ?? 0;
    const pazarlama: Kume = { key: "pazarlama", ad: "Pazarlama", renk: KUME_RENK.pazarlama, tl: pazTl, kalemler: [{ ad: "Dijital reklam / medya", tl: pazTl }] };

    // --- YAZILIM / SaaS & AI (eym) ---
    const yzTl = d.olgun.yazilim * fac;
    const yazilim: Kume = { key: "yazilim", ad: "Yazılım / SaaS & AI", renk: KUME_RENK.yazilim, tl: yzTl, kalemler: [
      { ad: "Dijital altyapı (AWS/CDN/API)", tl: yzTl * 0.8 }, { ad: "AI & yazılım araçları (lisans)", tl: yzTl * 0.2 },
    ] };

    // --- PROFESYONEL HİZMETLER (eym) ---
    const profTl = d.olgun.profesyonel * fac + d.olgun.isgAylik;
    const profesyonel: Kume = { key: "profesyonel", ad: "Profesyonel hizmetler", renk: KUME_RENK.profesyonel, tl: profTl, kalemler: [
      { ad: "Muhasebe & hukuk & danışmanlık", tl: d.olgun.profesyonel * fac }, { ad: "İSG / OSGB", tl: d.olgun.isgAylik },
    ] };

    // --- SAHA OPERASYONU (eym) ---
    const sahaTl = d.olgun.saha * fac;
    const saha: Kume = { key: "saha", ad: "Saha operasyonu", renk: KUME_RENK.saha, tl: sahaTl, kalemler: [{ ad: "Araç / yakıt / ekipman", tl: sahaTl }] };

    const kumeler = [personel, ofis, surekli, pazarlama, yazilim, profesyonel, saha].filter((k) => k.tl > 0);
    const toplamTl = kumeler.reduce((acc, k) => acc + k.tl, 0);
    return { ym, toplamTl, kisi, yeni, kumeler };
  });

  // Ağustos CAPEX = yalnız kuruluş/donanım kalemleri (yazılım geliştirme ücreti Temmuz'a taşındı)
  const capexKalemler: Kalem[] = d.capex.map((c) => ({ ad: c.ad, tl: c.tl }));
  const capexToplam = capexKalemler.reduce((s, k) => s + k.tl, 0);

  // Temmuz = yazılım geliştirme avansı; USD-bazlı (kura bağlı), 2 eşit taksit: 5 Temmuz + 5 Ağustos.
  const yazilimUsd = d.params.yazilimGelistirmeUsd;
  const yariUsd = yazilimUsd / 2;
  const yariTl = yariUsd * d.params.usd;
  const yazilimDev: CapexOzet = {
    toplamTl: yazilimUsd * d.params.usd,
    kalemler: [
      { ad: `1. taksit — 5 Temmuz (${yariUsd.toLocaleString("tr-TR")} USD)`, tl: yariTl },
      { ad: `2. taksit — 5 Ağustos (${yariUsd.toLocaleString("tr-TR")} USD)`, tl: yariTl },
    ],
  };
  return { capex: { toplamTl: capexToplam, kalemler: capexKalemler }, yazilimDev, aylar };
}

// Para birimi
export function rate(d: FinansalData, c: "TRY" | "USD" | "EUR"): number { return c === "TRY" ? 1 : c === "USD" ? d.params.usd : d.params.eur; }
