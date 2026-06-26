// Aylık küme hesaplayıcı.
// HEADCOUNT/BAŞLIK = cari ay (ym): o ay aktif rol sayısı + o ay yeni işe alım.
// BORDRO (maaş/yemek/yol) = SAF ARREARS: bir önceki ay (eym) işgücü; maaş cari ayın 5'inde ödenir.
//   → Kurucular Eylül'de başlar; ilk maaş 5 Ekim'de ödenir → Eylül'de net maaş=0, stopaj=0 (henüz ödeme yok).
// OPEX (sürekli/ofis/yazılım/pazarlama/profesyonel/saha) = ym-bazlı MUTLAK değer (d.opex). Ölçekleme YOK.
// İkramiye = ödendiği ay (ym). Ağustos ayrıca CAPEX item'ıdır (kuruluş yatırımı).
import { bordroAy, brutCozHedefNet } from "./payroll";
import { ymList } from "../data/finansal";
import type { FinansalData, FounderStep, OpexAy } from "../data/finansal";

export interface Kalem { ad: string; tl: number; detay?: string; }
export interface Kume { key: string; ad: string; renk: string; tl: number; kalemler: Kalem[]; }
export interface AyKirilim { ym: string; toplamTl: number; kisi: number; yeni: number; kumeler: Kume[]; }
export interface CapexOzet { toplamTl: number; kalemler: Kalem[]; }
export interface Hesap { capex: CapexOzet; yazilimDev: CapexOzet; aylar: AyKirilim[]; }

export const KUME_RENK: Record<string, string> = {
  personel: "#2f6b34", capex: "#a16207", surekli: "#0e7490", ofis: "#7c5cff",
  pazarlama: "#1f6feb", yazilim: "#be123c", profesyonel: "#b8860b", saha: "#5d6650",
};

const SIFIR_OPEX: OpexAy = {
  ym: "", internet: 0, elektrik: 0, su: 0, dogalgaz: 0, mutfak: 0, sarf: 0, kirtasiye: 0, temizlik: 0,
  guvenlik: 0, dijitalAltyapi: 0, aiAraclar: 0, pazarlama: 0, muhasebeHukuk: 0, isg: 0, saha: 0,
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
  const opexMap = new Map(d.opex.map((o) => [o.ym, o]));

  // Bordro YTD (yıl-içi kümülatif) — hak-ediş ayının (eym) yılına göre sıfırlanır.
  const ytd: Record<number, { matrah: number; asgari: number }> = {};
  let fytd = { matrah: 0, asgari: 0 };
  let oncekiYil = "";

  const aylar: AyKirilim[] = aylik.map((ym, idx) => {
    const eym = prevYm(ym);          // bordro hak-ediş ayı (maaş cari ayın 5'inde ödenir)
    const eyil = eym.slice(0, 4);
    if (eyil !== oncekiYil) { for (const k in ytd) delete ytd[Number(k)]; fytd = { matrah: 0, asgari: 0 }; oncekiYil = eyil; }

    // --- BAŞLIK/HEADCOUNT = cari ay (ym) ---
    const aktiflerCari = d.roles.filter((r) => aktif(r.istihdamYm, ym));
    const kisi = aktiflerCari.length;
    const yeni = d.roles.filter((r) => r.istihdamYm === ym).length;

    // --- BORDRO = eym (bir önceki ay) işgücü; arrears (nakit) ---
    const aktiflerEym = d.roles.filter((r) => aktif(r.istihdamYm, eym));
    let net = 0, vergi = 0, sgk = 0, brutTop = 0;
    for (const r of aktiflerEym) {
      if (r.kod === p.kuruculKod) continue;
      const y = ytd[r.sira] || (ytd[r.sira] = { matrah: 0, asgari: 0 });
      const b = bordroAy(r.brutMaas, y.matrah, y.asgari, bp);
      net += b.net; vergi += b.gelirVergisi; sgk += b.calisanSgk + b.isverenSgk; brutTop += b.brut;
      y.matrah += b.gvMatrah; y.asgari += bp.asgariGvMatrah;
    }
    const kurucu = aktiflerEym.find((r) => r.kod === p.kuruculKod);
    if (kurucu) {
      const hedefNet = founderNetUsd(d.founder, eym) * p.usd;
      const brut = brutCozHedefNet(hedefNet, fytd.matrah, fytd.asgari, bp);
      const b = bordroAy(brut, fytd.matrah, fytd.asgari, bp);
      net += b.net; vergi += b.gelirVergisi; sgk += b.calisanSgk + b.isverenSgk; brutTop += b.brut;
      fytd.matrah += b.gvMatrah; fytd.asgari += bp.asgariGvMatrah;
    }
    let yemek = 0;
    for (const rr of aktiflerEym) yemek += rr.unvan === "C-Level" ? p.yemekClevel : rr.unvan === "Team Lead" ? p.yemekTeamLead : p.yemekAylik;
    const yol = aktiflerEym.length * p.yolAylik;
    const hosgeldin = yeni * p.hosgeldinKisi;  // cari ay yeni işe alım (tek sefer)
    // İkramiye — ÖDENDİĞİ ay (ym); tutar eym işgücünün brüt toplamına oranlı.
    const ikramiyeOlaylar = d.ikramiye.filter((e) => e.ym === ym);
    const ikramiyePct = ikramiyeOlaylar.reduce((s, e) => s + e.pct, 0);
    const ikramiye = ikramiyePct * brutTop;
    const ikramiyeAd = ikramiyeOlaylar.length
      ? "İkramiye — " + ikramiyeOlaylar.map((e) => `${e.ad} %${Math.round(e.pct * 100)}`).join(" + ")
      : "İkramiye (bu ay yok)";
    // CPO araç — cari ay (ym) aktif segmenti
    let aracSeg = "", aracTl = 0;
    for (const a of d.arac) if (a.fromYm <= ym) { aracSeg = a.segment; aracTl = a.aylikTl; }
    const personel: Kume = {
      key: "personel", ad: "Personel giderleri", renk: KUME_RENK.personel,
      tl: net + vergi + sgk + yemek + yol + hosgeldin + ikramiye + aracTl,
      kalemler: [
        { ad: "Net maaşlar (önceki ay · 5'inde ödenir)", tl: net },
        { ad: "Maaş gelir vergisi stopajı (muhtasar)", tl: vergi },
        { ad: "SGK primleri (işçi + işveren)", tl: sgk },
        { ad: "Yemek", tl: yemek },
        { ad: "Yol ücreti", tl: yol },
        { ad: "Hoşgeldin paketi (yeni işe alım)", tl: hosgeldin },
        { ad: ikramiyeAd, tl: ikramiye },
        { ad: "CPO araç", tl: aracTl, detay: aracSeg ? "2025+ model: CPO araç — " + aracSeg + " (kiralama)" : undefined },
      ],
    };

    // OPEX (cari ay = ym) — mutlak değerler
    const ox = opexMap.get(ym) ?? SIFIR_OPEX;

    // --- OFİS & KİRA ---
    // Depozito CAPEX'te (Ağustos · "Ofis kurulumu") zaten dahil — operasyonel aylarda tekrar gösterilmez.
    const ofisKalem: Kalem[] = [{ ad: "Ofis kirası", tl: d.kira }];
    const ofis: Kume = { key: "ofis", ad: "Ofis & kira", renk: KUME_RENK.ofis, tl: ofisKalem.reduce((s, k) => s + k.tl, 0), kalemler: ofisKalem };

    // --- SÜREKLİ GİDERLER (ym-bazlı mutlak) ---
    const surekliKalem: Kalem[] = [
      { ad: "İnternet", tl: ox.internet }, { ad: "Elektrik", tl: ox.elektrik },
      { ad: "Su", tl: ox.su }, { ad: "Doğalgaz", tl: ox.dogalgaz },
      { ad: "Mutfak", tl: ox.mutfak }, { ad: "Sarf malzeme", tl: ox.sarf },
      { ad: "Kırtasiye", tl: ox.kirtasiye }, { ad: "Temizlik", tl: ox.temizlik },
    ];
    const surekli: Kume = { key: "surekli", ad: "Sürekli giderler", renk: KUME_RENK.surekli, tl: surekliKalem.reduce((s, k) => s + k.tl, 0), kalemler: surekliKalem };

    // --- PAZARLAMA (ym) ---
    const pazarlama: Kume = { key: "pazarlama", ad: "Pazarlama", renk: KUME_RENK.pazarlama, tl: ox.pazarlama, kalemler: [{ ad: "Dijital reklam / medya", tl: ox.pazarlama }] };

    // --- YAZILIM / SaaS & AI (ym) ---
    const yazilim: Kume = { key: "yazilim", ad: "Yazılım / SaaS & AI", renk: KUME_RENK.yazilim, tl: ox.dijitalAltyapi + ox.aiAraclar, kalemler: [
      { ad: "Dijital altyapı (AWS/CDN/API)", tl: ox.dijitalAltyapi }, { ad: "AI & yazılım araçları (lisans)", tl: ox.aiAraclar },
    ] };

    // --- PROFESYONEL HİZMETLER (ym) ---
    const profesyonel: Kume = { key: "profesyonel", ad: "Profesyonel hizmetler", renk: KUME_RENK.profesyonel, tl: ox.muhasebeHukuk + ox.isg + ox.guvenlik, kalemler: [
      { ad: "Muhasebe & hukuk & danışmanlık", tl: ox.muhasebeHukuk }, { ad: "İSG / OSGB", tl: ox.isg }, { ad: "Güvenlik & sigorta", tl: ox.guvenlik },
    ] };

    // --- SAHA OPERASYONU (ym) ---
    const saha: Kume = { key: "saha", ad: "Saha operasyonu", renk: KUME_RENK.saha, tl: ox.saha, kalemler: [{ ad: "Araç / yakıt / ekipman", tl: ox.saha }] };

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
  const yazilimKur = d.params.usd * 1.01; // +%1 SADECE yazılım maliyeti için (USD ödeme marjı); diğer her şey ham canlı kur
  const yariTl = yariUsd * yazilimKur;
  const yazilimDev: CapexOzet = {
    toplamTl: yazilimUsd * yazilimKur,
    kalemler: [
      { ad: `1. taksit — 5 Temmuz (${yariUsd.toLocaleString("tr-TR")} USD)`, tl: yariTl },
      { ad: `2. taksit — 5 Ağustos (${yariUsd.toLocaleString("tr-TR")} USD)`, tl: yariTl },
    ],
  };
  return { capex: { toplamTl: capexToplam, kalemler: capexKalemler }, yazilimDev, aylar };
}

// Para birimi
export function rate(d: FinansalData, c: "TRY" | "USD" | "EUR"): number { return c === "TRY" ? 1 : c === "USD" ? d.params.usd : d.params.eur; }
