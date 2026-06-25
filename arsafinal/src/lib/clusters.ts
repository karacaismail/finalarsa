// Aylık küme hesaplayıcı. Her ay → kümeler → kalemler. Personel: bordro motoru (kurucu net-hedef, YTD kümülatif).
import { bordroAy, brutCozHedefNet } from "./payroll";
import { ymList, MATURE_HC } from "../data/finansal";
import type { FinansalData, FounderStep } from "../data/finansal";

export interface Kalem { ad: string; tl: number; }
export interface Kume { key: string; ad: string; renk: string; tl: number; kalemler: Kalem[]; }
export interface AyKirilim { ym: string; toplamTl: number; kisi: number; yeni: number; kumeler: Kume[]; }
export interface CapexOzet { toplamTl: number; kalemler: Kalem[]; }
export interface Hesap { capex: CapexOzet; aylar: AyKirilim[]; }

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

// Tüm pencereyi tek geçişte hesapla (personel YTD kümülatif olduğu için sıralı).
export function hesapla(d: FinansalData): Hesap {
  const yms = ymList();
  const ilk = yms[0];
  const p = d.params;
  const bp = { ...d.bordro, isverenSgkOran: p.isverenSgkOran };

  // YTD (yıl-içi kümülatif) — yıl değişince sıfırlanır.
  const ytd: Record<number, { matrah: number; asgari: number }> = {};
  let fytd = { matrah: 0, asgari: 0 };
  let oncekiYil = "";
  const pazMap = new Map(d.pazarlama.map((x) => [x.ym, x.tl]));

  const aylar: AyKirilim[] = yms.map((ym) => {
    const yil = ym.slice(0, 4);
    if (yil !== oncekiYil) { for (const k in ytd) delete ytd[Number(k)]; fytd = { matrah: 0, asgari: 0 }; oncekiYil = yil; }

    const aktifler = d.roles.filter((r) => aktif(r.istihdamYm, ym));
    const kisi = aktifler.length;
    const yeni = d.roles.filter((r) => r.istihdamYm === ym).length;
    const fac = kisi / MATURE_HC;

    // --- PERSONEL (bordro) ---
    let net = 0, vergi = 0, sgk = 0, brutTop = 0;
    for (const r of aktifler) {
      if (r.kod === p.kuruculKod) continue; // kurucu ayrı (net-hedef)
      const y = ytd[r.sira] || (ytd[r.sira] = { matrah: 0, asgari: 0 });
      const b = bordroAy(r.brutMaas, y.matrah, y.asgari, bp);
      net += b.net; vergi += b.gelirVergisi; sgk += b.calisanSgk + b.isverenSgk; brutTop += b.brut;
      y.matrah += b.gvMatrah; y.asgari += bp.asgariGvMatrah;
    }
    // kurucu: net-hedef → gerekli brüt (kümülatif)
    const kurucu = aktifler.find((r) => r.kod === p.kuruculKod);
    if (kurucu) {
      const hedefNet = founderNetUsd(d.founder, ym) * p.usd;
      const brut = brutCozHedefNet(hedefNet, fytd.matrah, fytd.asgari, bp);
      const b = bordroAy(brut, fytd.matrah, fytd.asgari, bp);
      net += b.net; vergi += b.gelirVergisi; sgk += b.calisanSgk + b.isverenSgk; brutTop += b.brut;
      fytd.matrah += b.gvMatrah; fytd.asgari += bp.asgariGvMatrah;
    }
    const yemek = kisi * p.yemekAylik, yol = kisi * p.yolAylik;
    const hosgeldin = yeni * p.hosgeldinKisi;
    const ikramiye = brutTop * p.ikramiyeMaasYil / 12;
    // CPO araç kiralama (o ay geçerli segment)
    let aracSeg = "", aracTl = 0;
    for (const a of d.arac) if (a.fromYm <= ym) { aracSeg = a.segment; aracTl = a.aylikTl; }
    const personel: Kume = {
      key: "personel", ad: "Personel giderleri", renk: KUME_RENK.personel,
      tl: net + vergi + sgk + yemek + yol + hosgeldin + ikramiye + aracTl,
      kalemler: [
        { ad: "Net maaşlar", tl: net },
        { ad: "Gelir vergisi (stopaj)", tl: vergi },
        { ad: "SGK primleri (işçi + işveren)", tl: sgk },
        { ad: "Yemek", tl: yemek },
        { ad: "Yol ücreti", tl: yol },
        { ad: "Hoşgeldin paketi (yeni işe alım)", tl: hosgeldin },
        { ad: "İkramiye (yılda " + p.ikramiyeMaasYil + " maaş)", tl: ikramiye },
        { ad: "CPO araç — " + aracSeg + " (kiralama)", tl: aracTl },
      ],
    };

    // --- CAPEX (yatırım) — SADECE o ayın yeni işe alım ekipmanı.
    // İlk-ay büyük kuruluş yatırımı (item 1) burada TEKRAR sayılmaz (çift CAPEX olmasın).
    const capexKalem: Kalem[] = [];
    if (yeni > 0) capexKalem.push({ ad: `Yeni işe alım ekipmanı (${yeni} kişi)`, tl: yeni * p.perHireCapex });
    const capex: Kume = { key: "capex", ad: "Yatırım (CAPEX)", renk: KUME_RENK.capex, tl: capexKalem.reduce((s, k) => s + k.tl, 0), kalemler: capexKalem };

    // --- OFİS & KİRA ---
    const ofisKalem: Kalem[] = [{ ad: "Ofis kirası", tl: d.olgun.kira }];
    if (ym === ilk) ofisKalem.push({ ad: "Depozito (3 ay)", tl: d.olgun.depozito });
    const ofis: Kume = { key: "ofis", ad: "Ofis & kira", renk: KUME_RENK.ofis, tl: ofisKalem.reduce((s, k) => s + k.tl, 0), kalemler: ofisKalem };

    // --- SÜREKLİ GİDERLER (utilities, headcount-ölçekli) ---
    const u = d.olgun.utilities * fac; const s = d.utilSplit;
    const surekliKalem: Kalem[] = [
      { ad: "İnternet", tl: u * s.internet }, { ad: "Elektrik", tl: u * s.elektrik },
      { ad: "Su", tl: u * s.su }, { ad: "Doğalgaz", tl: u * s.dogalgaz },
      { ad: "Mutfak", tl: u * s.mutfak }, { ad: "Sarf malzeme", tl: u * s.sarf },
      { ad: "Kırtasiye", tl: u * s.kirtasiye }, { ad: "Temizlik", tl: u * s.temizlik },
    ];
    const surekli: Kume = { key: "surekli", ad: "Sürekli giderler", renk: KUME_RENK.surekli, tl: u, kalemler: surekliKalem };

    // --- PAZARLAMA ---
    const pazTl = pazMap.get(ym) ?? 0;
    const pazarlama: Kume = { key: "pazarlama", ad: "Pazarlama", renk: KUME_RENK.pazarlama, tl: pazTl, kalemler: [{ ad: "Dijital reklam / medya", tl: pazTl }] };

    // --- YAZILIM / SaaS & AI ---
    const yzTl = d.olgun.yazilim * fac;
    const yazilim: Kume = { key: "yazilim", ad: "Yazılım / SaaS & AI", renk: KUME_RENK.yazilim, tl: yzTl, kalemler: [
      { ad: "Dijital altyapı (AWS/CDN/API)", tl: yzTl * 0.8 }, { ad: "AI & yazılım araçları (lisans)", tl: yzTl * 0.2 },
    ] };

    // --- PROFESYONEL HİZMETLER ---
    const profTl = d.olgun.profesyonel * fac + d.olgun.isgAylik;
    const profesyonel: Kume = { key: "profesyonel", ad: "Profesyonel hizmetler", renk: KUME_RENK.profesyonel, tl: profTl, kalemler: [
      { ad: "Muhasebe & hukuk & danışmanlık", tl: d.olgun.profesyonel * fac }, { ad: "İSG / OSGB", tl: d.olgun.isgAylik },
    ] };

    // --- SAHA OPERASYONU ---
    const sahaTl = d.olgun.saha * fac;
    const saha: Kume = { key: "saha", ad: "Saha operasyonu", renk: KUME_RENK.saha, tl: sahaTl, kalemler: [{ ad: "Araç / yakıt / ekipman", tl: sahaTl }] };

    const kumeler = [personel, capex, ofis, surekli, pazarlama, yazilim, profesyonel, saha].filter((k) => k.tl > 0);
    const toplamTl = kumeler.reduce((acc, k) => acc + k.tl, 0);
    return { ym, toplamTl, kisi, yeni, kumeler };
  });

  const capexToplam = d.capex.reduce((s, c) => s + c.tl, 0);
  return { capex: { toplamTl: capexToplam, kalemler: d.capex.map((c) => ({ ad: c.ad, tl: c.tl })) }, aylar };
}

// Para birimi
export function rate(d: FinansalData, c: "TRY" | "USD" | "EUR"): number { return c === "TRY" ? 1 : c === "USD" ? d.params.usd : d.params.eur; }
