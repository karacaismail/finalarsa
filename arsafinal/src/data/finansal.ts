// arsam.net — Finansal Tablo verisi (TEK KAYNAK).
// Her grupta `editable` alanı var: true = düzenlenebilir (değişken), false = kilitli (sabit referans).
// Para değerleri kendi para biriminde (currency) tutulur; ekranda seçilen para birimine çevrilir.

export type Currency = "TRY" | "USD" | "EUR";

export interface Money {
  amount: number;
  currency: Currency;
}

export interface FinansalData {
  meta: {
    schemaVersion: string;
    title: string;
    updatedAt: string;
    baseCurrency: Currency;
    rates: { editable: boolean; note: string; TRY: number; USD: number; EUR: number }; // 1 birim = kaç TRY
  };
  monthly: {
    editable: boolean;
    title: string;
    note: string;
    rows: { month: string; opex: number; pazarlama: number; capex: number }[]; // TRY
  };
  opex: {
    editable: boolean;
    title: string;
    note: string;
    items: { name: string; monthly: Money }[];
  };
  capex: {
    editable: boolean;
    title: string;
    note: string;
    items: { name: string; amount: Money }[];
  };
  cpo: {
    editable: boolean;
    title: string;
    note: string;
    salary: { period: string; pay: Money }[];
    car: { period: string; segment: string }[];
    fuel: string;
    health: string;
    leave: string;
  };
  benchmarks: {
    editable: false;
    title: string;
    disclaimer: string;
    softwareSalaries: { role: string; min: Money; max: Money; region: string }[];
    professions: { role: string; min: Money; max: Money; region: string }[];
    cLevel: { company: string; min: Money; max: Money; note: string }[];
  };
}

const TRY = (amount: number): Money => ({ amount, currency: "TRY" });
const USD = (amount: number): Money => ({ amount, currency: "USD" });

export const DEFAULT_DATA: FinansalData = {
  meta: {
    schemaVersion: "1.0.0",
    title: "arsam.net — Finansal Tablo",
    updatedAt: "2026-06-24",
    baseCurrency: "TRY",
    rates: {
      editable: true,
      note: "1 birim = kaç TRY (ay-sonu, model varsayımı; düzenlenebilir).",
      TRY: 1,
      USD: 45.2,
      EUR: 49.0,
    },
  },

  monthly: {
    editable: true,
    title: "Aylık harcama planı — başlangıç dönemi (Tem 2026 → Ara 2027)",
    note: "Her ay ne kadar harcanacak? Gider = OPEX + Pazarlama + CAPEX. Soft-launch döneminde kadro büyüdükçe gider artar.",
    rows: [
      { month: "Tem 2026", opex: 1727733, pazarlama: 128205, capex: 2955408 },
      { month: "Agu 2026", opex: 1901088, pazarlama: 143590, capex: 103385 },
      { month: "Eyl 2026", opex: 2074444, pazarlama: 158974, capex: 114462 },
      { month: "Eki 2026", opex: 2247799, pazarlama: 174359, capex: 125538 },
      { month: "Kas 2026", opex: 2421155, pazarlama: 189744, capex: 136615 },
      { month: "Ara 2026", opex: 2594511, pazarlama: 205128, capex: 147692 },
      { month: "Oca 2027", opex: 5401875, pazarlama: 769231, capex: 64615 },
      { month: "Sub 2027", opex: 5610667, pazarlama: 811189, capex: 68140 },
      { month: "Mar 2027", opex: 5819458, pazarlama: 853147, capex: 71664 },
      { month: "Nis 2027", opex: 6028249, pazarlama: 895105, capex: 75189 },
      { month: "May 2027", opex: 6237041, pazarlama: 937063, capex: 78713 },
      { month: "Haz 2027", opex: 6445832, pazarlama: 979021, capex: 82238 },
      { month: "Tem 2027", opex: 6654623, pazarlama: 1020979, capex: 85762 },
      { month: "Agu 2027", opex: 6863415, pazarlama: 1062937, capex: 89287 },
      { month: "Eyl 2027", opex: 7072206, pazarlama: 1104895, capex: 92811 },
      { month: "Eki 2027", opex: 7280997, pazarlama: 1146853, capex: 96336 },
      { month: "Kas 2027", opex: 7489789, pazarlama: 1188811, capex: 99860 },
      { month: "Ara 2027", opex: 7698580, pazarlama: 1230769, capex: 103385 },
    ],
  },

  opex: {
    editable: true,
    title: "OPEX — aylık işletme gideri kalemleri (olgun dönem, 2031 temsili)",
    note: "OPEX, her ay tekrar eden işletme gideridir. Aşağıdaki kompozisyon olgun döneme (2031, 256 kişi) aittir; başlangıç ayları yukarıdaki aylık tabloda daha düşüktür.",
    items: [
      { name: "Personel (SGK dahil)", monthly: TRY(18453600) },
      { name: "Pazarlama", monthly: TRY(9166667) },
      { name: "Saha operasyonu (araç/yakıt/ekipman)", monthly: TRY(2280000) },
      { name: "Dijital altyapı & platform AI", monthly: TRY(5658813) },
      { name: "Ofis & idari", monthly: TRY(2580000) },
      { name: "Yazılım & AI araçları", monthly: TRY(1398000) },
    ],
  },

  capex: {
    editable: true,
    title: "CAPEX — bir kerelik kuruluş yatırımı",
    note: "CAPEX, başlangıçta bir kez yapılan kurulum yatırımıdır (büyük kısmı ilk ay, Tem 2026).",
    items: [
      { name: "Bilgisayar & ekipman", amount: TRY(1265000) },
      { name: "Ofis kurulumu", amount: TRY(1100000) },
      { name: "Mutfak & sosyal alan", amount: TRY(173000) },
      { name: "Marka & logo", amount: TRY(110000) },
      { name: "Hoşgeldin paketi", amount: TRY(107100) },
      { name: "Diğer", amount: TRY(86200) },
      { name: "Şirket kuruluş & hukuk", amount: TRY(50000) },
      { name: "İlk kampanya materyali", amount: TRY(20000) },
    ],
  },

  cpo: {
    editable: true,
    title: "CPO — özel/sosyal haklar ve yan haklar",
    note: "Maaş USD-endekslidir; ay-sonu USD/TL kuru ile TL ödenir. Diğer kalemler model varsayımıdır.",
    salary: [
      { period: "2026 (mevcut taban)", pay: USD(7500) },
      { period: "2027 başı (zam)", pay: USD(10000) },
      { period: "1 Haziran 2027", pay: USD(15000) },
    ],
    car: [
      { period: "2026–2027 başlangıç", segment: "Škoda Superb · Toyota Camry · VW Passat · Audi A5" },
      { period: "2027 Haziran", segment: "Volvo S60 — bir üst segment" },
      { period: "2028", segment: "BMW 520+ · Mercedes-Benz E 220+ · Audi A6 · Volvo S90" },
    ],
    fuel: "Yılda 25.000 km'ye kadar yakıt şirketçe karşılanır; şirket yakıt kartıyla anlaşmalı istasyonlarda ücretsiz.",
    health: "Aile dahil, genel ve tam kapsamlı özel sağlık sigortası.",
    leave: "Yıllık senelik izne ek 1 hafta kış tatili; senelik izin ve kış tatili için aile dahil tatil bütçesi.",
  },

  benchmarks: {
    editable: false,
    title: "Piyasa istatistikleri (referans · KİLİTLİ)",
    disclaimer:
      "Aşağıdaki rakamlar bağlam içindir; piyasa tahminidir, resmî/kesin değildir (C-level ücretleri kamuya kapalıdır). Bu bölüm düzenlenemez. Değerler aylık ve seçilen para biriminde gösterilir.",
    softwareSalaries: [
      { role: "Yazılımcı — Junior", min: TRY(35000), max: TRY(65000), region: "Türkiye · aylık net (tahmini)" },
      { role: "Yazılımcı — Mid", min: TRY(65000), max: TRY(120000), region: "Türkiye · aylık net (tahmini)" },
      { role: "Yazılımcı — Senior", min: TRY(120000), max: TRY(220000), region: "Türkiye · aylık net (tahmini)" },
      { role: "Yazılımcı — Lead/Principal", min: TRY(200000), max: TRY(350000), region: "Türkiye · aylık net (tahmini)" },
    ],
    professions: [
      { role: "Kıdemli avukat", min: TRY(50000), max: TRY(150000), region: "Türkiye · aylık (tahmini)" },
      { role: "Mali müşavir (SMMM)", min: TRY(60000), max: TRY(180000), region: "Türkiye · aylık (tahmini)" },
      { role: "Harita mühendisi", min: TRY(40000), max: TRY(90000), region: "Türkiye · aylık (tahmini)" },
      { role: "Uzman doktor (özel)", min: TRY(100000), max: TRY(300000), region: "Türkiye · aylık (tahmini)" },
    ],
    cLevel: [
      { company: "sahibinden.com — C-level", min: TRY(600000), max: TRY(1500000), note: "aylık brüt + hisse (tahmini · kamuya kapalı)" },
      { company: "Trendyol — C-level", min: TRY(800000), max: TRY(2500000), note: "aylık brüt + hisse/opsiyon (tahmini · kamuya kapalı)" },
      { company: "amazon.com.tr (Amazon TR) — C-level", min: TRY(700000), max: TRY(2000000), note: "aylık brüt + RSU (tahmini · kamuya kapalı)" },
    ],
  },
};
