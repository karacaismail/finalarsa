# arsam.net Yatırımcı Sunumu — Veri Doğrulama Raporu

**Doğrulama tarihi:** 19 Haziran 2026
**Yöntem:** 6 paralel araştırma ajanı, dış/yetkili kaynaklarla (TÜİK, TKGM, Rekabet Kurumu, mevzuat.gov.tr, TÜBİTAK, KOSGEB, İŞKUR, TCMB, İTÜ ARI Teknokent, yayıncı/birincil kaynaklar) tek tek doğrulama.
**Kapsam:** JSON veritabanındaki **dış-gerçek iddialar** (pazar istatistikleri, vergi/teşvik mevzuatı, makro veriler, strateji/şirket atıfları). Sunumun kendi **projeksiyonları ve model varsayımları** (senaryo gelirleri, SOM hedefleri vb.) doğrulanabilir dış-gerçek değildir; bunlar "varsayım" olarak işaretlenmiştir.

---

## 1. Yönetici özeti

Toplam **46 iddia** denetlendi.

| Karar | Adet | Anlamı |
|---|---|---|
| **DOĞRU** | 28 | Yetkili kaynakla birebir doğrulandı |
| **KISMEN DOĞRU** | 12 | Çekirdek doğru, ama etiket/kapsam/tutar düzeltilmeli |
| **YANLIŞ** | 2 | Gerçek hata — düzeltilmeli |
| **GÜNCEL DEĞİL** | 2 | Eski değer; 2026 güncellemesi var |
| **DOĞRULANAMADI** | 4 | Yetkili dış kaynakla teyit edilemedi (muhtemelen sunum varsayımı) |

**En güçlü taraf:** Çekirdek gayrimenkul pazar rakamları (3.065.872 / 1.478.025 / 1.587.847) ve tüm strateji çerçevesi/atıfları (Helmer 7 Powers, Chen Cold Start, Eugene Wei, Levinson 1984, Play Bigger %76, Christensen, Moore, Ben Thompson, Vanguard) **resmi/birincil kaynaklarla tam doğrulandı.**

**En kritik 6 düzeltme (öncelik sırası):**

1. **TÜBİTAK 1501 oranı YANLIŞ.** Sunum "%60 hibe (KOBİ)" diyor; gerçekte **KOBİ %75**, büyük kuruluş %60. Oran ters yazılmış. *(C5)*
2. **İşveren maliyeti çarpanı YANLIŞ.** "Brüt × 1,34" hatalı; 2026 yasal ek yük **%22,75** (brüt × ~1,2375). Model işveren maliyetini ~%8 fazla gösteriyor. *(D2)*
3. **USD/TRY başlangıç kuru GÜNCEL DEĞİL.** Varsayım 44,50; 19 Haziran 2026 TCMB kuru **~46,36**. Yaklaşık %4 düşük. *(D5)*
4. **TÜBİTAK 1512 BİGG karışıklığı.** 1.350.000 TL / %3 hisse aslında **1812 (BiGG Yatırım)** programı; klasik 1512 ~900.000 TL hibedir. Son tarih de Mayıs değil ~10 Temmuz 2026. *(C1)*
5. **İTÜ ARI ücretleri GÜNCEL DEĞİL + kavram hatası.** 18.500/7.350 TL değil güncel **13.950/5.550 TL+KDV**, ve bunlar "ofis kirası" değil **tek seferlik başvuru ücreti**. UBI #1 olan İTÜ ARI değil bünyesindeki **İTÜ Çekirdek**. *(B6)*
6. **emlakjet 28M$/5M$ DOĞRULANAMADI.** Hiçbir kaynakta 28M$ değerleme yok; bahsedilen ~5,5M$ bir **GYO/REIT ihraç hedefi**, gelir değil. Bu cümle yatırımcı denetiminde zayıf nokta. *(F1)*

**Ek dikkat:** "sahibinden 519 milyon ziyaretçi" rakamı doğru ama bu **aylık ziyaret** (visits), yıllık ziyaretçi değil; tekil kullanıcı ~63 milyon/ay *(F2)*. "%68/%55 pazar payı" ve "%18,7 online penetrasyon" Rekabet Kurulu/resmi kaynakta **redakte/yok** — sunumun kendi tahmini *(A5, A6)*.

---

## 2. Acil düzeltilmesi gerekenler (YANLIŞ + GÜNCEL DEĞİL)

| # | Konu | Sunumdaki | Gerçek/Güncel | Kaynak |
|---|---|---|---|---|
| C5 | TÜBİTAK 1501 hibe oranı | %60 (KOBİ) | **KOBİ %75**, büyük %60 | TÜBİTAK 1501 Uygulama Esasları |
| D2 | İşveren maliyeti çarpanı | brüt × 1,34 | **brüt × ~1,2375** (ek yük %22,75) | PwC / CSGB 2026 |
| D5 | USD/TRY başlangıç (Tem 2026) | 44,50 | **~46,36** (19 Haz 2026, TCMB) | TCMB today.xml |
| C1 | "1512 BİGG" 1,35M / %3 hisse / 10 May | program **1812**; 1512=900K hibe; tarih **10 Tem 2026** | TÜBİTAK 1812-2026-1 duyurusu |
| B6 | İTÜ ARI ücret 18.500/7.350 (kira) | **13.950/5.550 TL+KDV başvuru ücreti**; UBI #1 = İTÜ Çekirdek | İTÜ ARI resmî SSS |
| C4 | TÜBİTAK 1507 tavan 2,4M | **~3,0–3,5M TL** (2025-2026 artışı) | TÜBİTAK 1507 / danışmanlık |
| C9 | Sınai Mülkiyet %100/30K + yurtdışı %50/50K USD | 30K = kapanan eski Genel Destek; %50/50K USD **KOSGEB değil** (muhtemelen Turquality) | KOSGEB resmî |

---

## 3. Küme küme detaylı bulgular

### Küme A — Gayrimenkul pazar istatistikleri

| # | İddia | Karar | Not / Gerçek değer |
|---|---|---|---|
| A1 | 2024 toplam taşınmaz satışı 3.065.872 | **DOĞRU** | TKGM/tapu verisi. Dikkat: bu "satış"tır; toplam tapu işlemi (~18,7M) ile karıştırılmamalı. |
| A2 | Konut dışı (arsa+tarla+ticari) 1.587.847 | **DOĞRU** | 3.065.872 − 1.478.025 türetmesi; tutarlı. |
| A3 | 2024 konut 1.478.025 | **DOĞRU** | TÜİK resmî, +%20,6. |
| A4 | Günlük 8.400 (~255.490/ay) | **KISMEN DOĞRU** | Aritmetik tutarlı (8.400×365≈3,07M). "Tapu devri" yerine "günlük satış" demek daha doğru. |
| A5 | sahibinden %68 arsa / %55 emlak (Rekabet Kurulu) | **DOĞRULANAMADI** | Hâkim durum RESMÎ (doğru); ama spesifik %'ler kararda redakte — sunum tahmini. |
| A6 | Online penetrasyon %18,7 | **DOĞRULANAMADI** | Resmî dayanak yok; sunum varsayımı. |
| A7 | Arsa TAM ~1,85 trilyon TL | **KISMEN DOĞRU** | Çarpım tutarlı; ama ~1,32M TL ortalama işlem değeri resmî kaynakta yok (varsayım). |
| A8 | EİDS Şubat 2026'da zorunlu | **KISMEN DOĞRU** | EİDS 2023'ten kademeli; 1 Şubat 2026'da **satılık konut** kapsama girdi. "Doğdu" izlenimi yanlış. |

**Kaynaklar:** TÜİK Konut Satış İstatistikleri Aralık 2024; AA (3.065.872); Rekabet Kurulu sahibinden kararı (40,1M TL ceza); Ticaret Bakanlığı EİDS duyurusu.

### Küme B — Teknopark 4691 + Ar-Ge mevzuatı

| # | İddia | Karar | Not |
|---|---|---|---|
| B1 | Yazılım kazancı kurumlar vergisi istisnası | **DOĞRU** | 4691 Geçici Md.2; 31/12/2028'e kadar. |
| B2 | Personel gelir vergisi stopajı %100 istisna | **KISMEN DOĞRU** | 7555 sayılı Kanun (24.07.2025) **40 asgari ücret tavanı** getirdi; üst gelir için kısıtlı. |
| B3 | SGK işveren payı %50 Hazine desteği | **DOĞRU** | 5746 md.3; İTÜ ARI resmî teyit. |
| B4 | Süre 31/12/2028 | **DOĞRU (güncel)** | Uzatma YOK; "31/12/2026" farklı bir detaydır (bölge dışı stopaj). |
| B5 | Ar-Ge Merkezi 15 / Tasarım 10 personel; teknoparkta alt sınır yok | **DOĞRU** | 5746; teknoparkta asgari personel şartı yok. |
| B6 | İTÜ ARI UBI #1; ofis 18.500/7.350 TL | **KISMEN DOĞRU** | UBI #1 = İTÜ Çekirdek; güncel **başvuru** ücreti 13.950/5.550 TL+KDV (kira değil). |
| B7 | Yazılım tesliminde KDV istisnası | **DOĞRU** | KDV Geçici Md.20; sadece sayılan yazılım türleri, 2028'e kadar. |

**Kaynaklar:** 4691 konsolide metin (mevzuat.gov.tr); Resmî Gazete 7555; sanayi.gov.tr Ar-Ge/Tasarım; İTÜ ARI Teknokent SSS; KDV Kanunu Geçici Md.20.

### Küme C — Devlet teşvikleri / hibe tutarları

| # | İddia | Karar | Gerçek/Güncel |
|---|---|---|---|
| C1 | 1512 BİGG 1,35M/%3, son 10 May 2026 | **KISMEN DOĞRU** | Program **1812**; 1512=900K hibe; son tarih ~10 Tem 2026. |
| C2 | İleri Girişimci 2,0M TL | **KISMEN DOĞRU** | Tavan doğru; ad **"Girişimci Destek Programı"**. |
| C3 | Kuruluş 20.000 TL (sermaye şirketi) | **DOĞRU** | Gerçek kişi 10.000 TL. |
| C4 | 1507 → 2,4M TL %75 | **KISMEN DOĞRU** | %75 doğru; tavan **3,0–3,5M TL'ye** çıkmış. |
| C5 | 1501 → %60 hibe (KOBİ), 24 ay | **YANLIŞ** | KOBİ **%75**, büyük %60; süre 24 ay (36'ya uzayabilir). |
| C6 | TEKMER %100, yıllık 5,0M TL | **DOĞRU** | 2025 değeri; yıllık endekslenir. |
| C7 | İŞKUR İEP günlük 1.079,83 TL | **DOĞRU** | 2026 (iş arayan statüsü). |
| C8 | <45y 600K; <35y esnaf 300K %0 faiz | **DOĞRU** | Halkbank/Hazine. |
| C9 | Sınai Mülkiyet %100/30K + yurtdışı %50/50K USD | **KISMEN DOĞRU / GÜNCEL DEĞİL** | 30K = kapanan eski Genel Destek; %50/50K USD KOSGEB'de yok. |

**Kaynaklar:** TÜBİTAK 1812-2026-1 duyurusu; TÜBİTAK 1501/1507 Uygulama Esasları; KOSGEB UE-35/11 (Rev. 11.03.2026); İŞKUR İEP 2026; Halkbank.

### Küme D — Makroekonomik veriler 2026

| # | İddia | Karar | Gerçek/Güncel |
|---|---|---|---|
| D1 | Net 28.075,5 / Brüt 33.030 TL | **DOĞRU** | Resmî 2026 asgari ücret. |
| D2 | İşveren çarpanı brüt × 1,34 | **YANLIŞ** | Gerçek ~brüt × 1,2375 (ek yük %22,75, %34 değil). |
| D3 | Kurumlar vergisi %25 | **DOĞRU** | Genel oran. |
| D4 | KDV %20 | **DOĞRU** | Genel/standart oran. |
| D5 | USD/TRY 44,50 (Tem 2026) | **GÜNCEL DEĞİL** | 19 Haz 2026 TCMB ~46,36; piyasa ~46,44. |
| D6 | Yıl sonu 51,09 (2026) / 56,00 (2027) | **KISMEN DOĞRU** | 2026 piyasa anketiyle birebir; 2027 OVP ort. (50,71) üstünde, agresif. |

**Kaynaklar:** CSGB 2026 asgari ücret PDF; PwC işveren maliyeti; TCMB today.xml + Piyasa Katılımcıları Anketi; OVP 2026-2028.

### Küme E — Strateji çerçeveleri + yazar/kitap atıfları

**Tamamı DOĞRU (E1–E9).** Sunumda düzeltme gerektiren hata yok.

- E1 Helmer "7 Powers" + yedi güç + counter-positioning tanımı — **DOĞRU**
- E2 Andrew Chen "The Cold Start Problem" + atomik ağ — **DOĞRU**
- E3 Eugene Wei "Status as a Service" (2019) — **DOĞRU**
- E4 Levinson "Guerrilla Marketing" 1984 — **DOĞRU**
- E5 Play Bigger kategori kralı **%76** (2000–2015 ABD VC teknoloji girişimleri, piyasa değeri) — **DOĞRU** (birincil kaynak: Newsweek/Kevin Maney)
- E6 Christensen yıkıcı inovasyon + Netflix/Blockbuster — **DOĞRU** (terim tartışması var ama öz doğru)
- E7 Geoffrey Moore "Crossing the Chasm" + bowling alley/pin — **DOĞRU**
- E8 Ben Thompson "Aggregation Theory" — **DOĞRU**
- E9 Vanguard counter-positioning örneği — **DOĞRU**

**Kaynaklar:** 7powers.com; coldstart.com; eugenewei.com; Time/Wikipedia (Levinson); Newsweek (Maney %76); Christensen Institute; Stratechery.

### Küme F — Şirket/startup gerçekleri + coğrafya + SEO matematiği

| # | İddia | Karar | Gerçek/Düzeltilmiş |
|---|---|---|---|
| F1 | emlakjet 28M$/5M$ | **DOĞRULANAMADI** | 28M$ hiçbir kaynakta yok; ~5,5M$ bir **GYO/REIT toplama hedefi**, gelir değil. |
| F2 | sahibinden ~519M ziyaretçi | **KISMEN DOĞRU** | 519M = **aylık ziyaret** (Tem 2023); güncel ~548-560M/ay; tekil kullanıcı ~63M/ay. "Yıllık/ziyaretçi" yanlış. |
| F3 | Webvan ~830M$ battı | **DOĞRU** | ~830M$ kayıp, Tem 2001 iflası. |
| F4 | Zillow/Zapier programatik SEO | **DOĞRU** | Ders kitabı örnekleri. |
| F5 | Zillow %8 / Trendyol %12 cross-sell | **DOĞRULANAMADI** | Zillow ~%7,7 var ama farklı anlam (eşzamanlı tarama); Trendyol %12 bulunamadı. |
| F6 | 81 il | **DOĞRU** | 81. |
| F7 | ~922 ilçe | **KISMEN DOĞRU** | Toplam **973 ilçe** (922 kaymakamlık + 51 merkez ilçe). |
| F8 | 81×922×6 = 448.092 | **KISMEN DOĞRU** | Aritmetik doğru; "toplam ilçe" tabanı 973 → **472.878 (~473.000)**. |
| F9 | Atomik ağ/mem/statü örnekleri | **DOĞRU** | Facebook/Harvard, Uber/SF, Duolingo/Ryanair/Wendy's, Tinder/Clubhouse/Supreme, Airbnb/Craigslist — hepsi doğrulandı. |

**Kaynaklar:** SimilarWeb; AIM Group/WORLDEF (sahibinden); PitchBook/Crunchbase/Online Marketplaces (emlakjet); Scripophily/CBS (Webvan); Backlinko (programatik SEO); Zillow IR (dual shopper); Wikipedia/Sabah/Milliyet (ilçe sayısı).

---

## 4. Uygulanan düzeltmeler vs işaretlenenler

**Bu denetim sonrası JSON veritabanında DÜZELTİLENLER** (objektif dış-gerçek hatalar — anlatıyı değiştirmez, `data/` referans verisi):

- `data/incentives.json`: 1501 oranı KOBİ %75; 1512→1812 açıklaması; 1507 tavanı ~3,0–3,5M; İTÜ ARI ücretleri 13.950/5.550 TL+KDV (başvuru) + İTÜ Çekirdek notu; C9 düzeltmesi.
- `data/strategy-arsenal.json`: ilçe sayısı 973 (922 kaymakamlık) açıklaması; SEO sayfa tabanı notu.
- `shared/metrics.json`: ilgili metriklere `verificationNote` (B2 tavan, sahibinden "aylık ziyaret", işveren çarpanı, USD/TRY güncel) eklendi.

**Yalnız İŞARETLENENLER (founder kararı — anlatı/persüazyon iddiaları, değiştirilmedi):**

- A5 (%68/%55 pazar payı), A6 (%18,7 penetrasyon), A7 (1,32M ort. değer) → sunumun model varsayımları; "şirket tahmini" olarak şeffaf etiketlenmesi önerilir.
- D2 (işveren çarpanı 1,34) ve D5 (USD/TRY 44,50) → finansal modelin girdileri; değiştirmek tüm 78 aylık modeli etkiler. **Not eklendi, değer korundu** — düzeltme founder/finans kararıdır.
- F1 (emlakjet), F5 (Zillow/Trendyol cross-sell) → kaynağı doğrulanamayan persüazyon cümleleri; çıkarılması veya kaynak eklenmesi önerilir.
- F2 (sahibinden 519M) → strateji bölümünün retorik cümlesi; "aylık ziyaret" olarak netleştirilmesi önerilir.

---

## 5. Sonuç

Sunumun **olgusal omurgası sağlam**: çekirdek pazar rakamları ve tüm strateji teorisi/atıfları resmî/birincil kaynaklarla doğrulanıyor. Riskler **iki yerde yoğunlaşıyor**: (1) bazı teşvik tutarları/kodları eski yıl değerlerinde veya karışmış (C1, C4, C5, C9, B6); (2) birkaç persüazyon rakamı (emlakjet 28M$, sahibinden "yıllık ziyaretçi", %68/%55, %18,7) yetkili dış kaynakla desteklenmiyor. Yatırımcı due-diligence'ında en kırılgan nokta bu ikinci gruptur; kaynak eklenmesi veya "şirket tahmini" etiketi önerilir.
