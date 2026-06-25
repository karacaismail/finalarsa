// 2026 Türkiye bordro motoru (ücret geliri). Kaynak: Resmî Gazete / SGK / PwC / CottGroup (web-doğrulandı 25.06.2026).
// Ne yapar: brüt → net, gelir vergisi (kümülatif), işçi/işveren SGK (tavan kapaklı), damga; ve hedef net → gerekli brüt.
// Ne yapmaz: mali müşavirlik tavsiyesi vermez; teşvik/istisna varsayımları düzenlenebilir parametredir.

export interface BordroParams {
  asgariBrut: number;       // 2026: 33.030
  asgariGvMatrah: number;   // asgari brüt − işçi SGK = 28.075,50 (gelir vergisi istisnası matrahı)
  sgkTavan: number;         // 2026: 297.270 (9× asgari)
  calisanSgkOran: number;   // 0,15 (SGK %14 + işsizlik %1)
  isverenSgkOran: number;   // 0,2375 teşviksiz | 0,2175 (2 puan, imalat dışı)
  damgaOran: number;        // 0,00759
  dilimler: { ust: number; oran: number }[]; // kümülatif ücret tarifesi
}

export const PARAMS_2026: BordroParams = {
  asgariBrut: 33030,
  asgariGvMatrah: 33030 * 0.85, // 28.075,50
  sgkTavan: 297270,
  calisanSgkOran: 0.15,
  isverenSgkOran: 0.2375,
  damgaOran: 0.00759,
  dilimler: [
    { ust: 190000, oran: 0.15 },
    { ust: 400000, oran: 0.20 },
    { ust: 1500000, oran: 0.27 },
    { ust: 5300000, oran: 0.35 },
    { ust: Infinity, oran: 0.40 },
  ],
};

// Kümülatif matrah üzerinden toplam ücret gelir vergisi.
export function vergiKumulatif(matrah: number, p: BordroParams): number {
  let tax = 0, alt = 0;
  for (const d of p.dilimler) {
    if (matrah <= alt) break;
    tax += (Math.min(matrah, d.ust) - alt) * d.oran;
    alt = d.ust;
  }
  return tax;
}

export interface BordroAy {
  brut: number; net: number; gelirVergisi: number; calisanSgk: number;
  damga: number; isverenSgk: number; sirketMaliyet: number; gvMatrah: number;
}

// Bir ayın bordrosu.
// kumMatrahOnce: bu yıl, bu aydan önce çalışanın biriken GV matrahı.
// kumAsgariOnce: bu yıl, bu aydan önce biriken asgari-ücret matrahı (istisna için).
export function bordroAy(brut: number, kumMatrahOnce: number, kumAsgariOnce: number, p: BordroParams): BordroAy {
  const sgkMatrah = Math.min(brut, p.sgkTavan);
  const calisanSgk = sgkMatrah * p.calisanSgkOran;
  const gvMatrah = brut - calisanSgk;
  const brutVergi = vergiKumulatif(kumMatrahOnce + gvMatrah, p) - vergiKumulatif(kumMatrahOnce, p);
  const istisna = vergiKumulatif(kumAsgariOnce + p.asgariGvMatrah, p) - vergiKumulatif(kumAsgariOnce, p);
  const gelirVergisi = Math.max(0, brutVergi - istisna);
  const damga = Math.max(0, (brut - p.asgariBrut) * p.damgaOran);
  const net = brut - calisanSgk - gelirVergisi - damga;
  const isverenSgk = sgkMatrah * p.isverenSgkOran;
  return { brut, net, gelirVergisi, calisanSgk, damga, isverenSgk, sirketMaliyet: brut + isverenSgk, gvMatrah };
}

// Hedef net için gerekli brütü çöz (ikili arama; net brütte monoton arttığı için güvenli).
export function brutCozHedefNet(hedefNet: number, kumMatrahOnce: number, kumAsgariOnce: number, p: BordroParams): number {
  let lo = hedefNet, hi = hedefNet * 3 + 1_000_000;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (bordroAy(mid, kumMatrahOnce, kumAsgariOnce, p).net < hedefNet) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
