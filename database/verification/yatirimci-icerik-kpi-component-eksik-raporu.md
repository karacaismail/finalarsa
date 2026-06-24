# Yatırımcı İçeriği, KPI ve Component Eksik Raporu

Kapsam: `/Users/karaca/Documents/sonbirarsa/database`, `/Users/karaca/Documents/sonbirarsa/landing`, mevcut section JSON'ları, finans/İK/pazar veri dosyaları, accordion yapısı ve landing component mimarisi.

Hazırlama yöntemi: Ana incelemeye ek olarak üç paralel agent çalıştırıldı:

- Yatırımcı karar içeriği agent'ı: section içeriklerinde karar eksiklerini inceledi.
- Finans/KPI agent'ı: finansal model, pazar, İK, teşvik ve yatırım metriklerini inceledi.
- UI/component agent'ı: ChakraUI, custom component ihtiyacı, mobile 320px ve mevcut renderer yapısını inceledi.

## 1. Kısa Hüküm

Mevcut proje artık yalnızca "uzun landing page" değildir. Accordion gruplaması eklenmiş ve tek sayfa 8 ana karar alanına bölünmüş durumdadır. Bu doğru yöndür.

Ancak yatırımcı açısından hâlâ üç büyük eksik var:

1. **Yönetim kurulu seviyesinde KPI panosu eksik.** Çok veri var; fakat "bu sayı nedir, hangi kaynaktan gelir, hedef mi varsayım mı, kim takip eder, kırmızı eşik nedir?" cevabı tek yerde yok.
2. **Yatırım karar köprüsü eksik.** 40 milyon ₺ model sermayesi, 5/15/25 milyon ₺ yatırım seçenekleri, başabaş, en dip kasa ve yatırımcı getirisi aynı karar panelinde birleşmiyor.
3. **Mevcut generic block component'leri karar verilebilir panolar için yetmiyor.** ChakraUI altyapı olarak yeterli; fakat `statGrid`, `cardGrid`, `table`, `chartTabs` gibi genel bileşenler bu yatırımcı sunumunu "okunur rapor" yapar, "karar panosu" yapmaz.

Ana öneri:

ChakraUI kalmalı. Yeni UI kütüphanesi gerekmiyor. Fakat yatırımcı sunumu için domain-specific custom components geliştirilmeli:

- `KpiBoard`
- `RiskGateMatrix`
- `CapitalReleasePlan`
- `InvestmentOptionsCompare`
- `GovernanceMatrix`
- `First90DaysPlan`
- `FinancialDecisionFrame`
- `SourceConfidenceBadge`
- `InvestorReturnModel`

## 2. Mevcut Durum

### 2.1. Accordion yapısı oluşmuş

Yeni dosya:

`/Users/karaca/Documents/sonbirarsa/database/data/accordion-groups.json`

Bu dosya 8 ana accordion grubu tanımlıyor:

1. Karar Özeti
2. Neden Bu Ortaklık?
3. Problem ve Çözüm
4. Pazar ve Rekabet
5. İş Modeli ve Gelirler
6. Saha Planı ve İlk 90 Gün
7. Operasyon ve Kadro
8. Finansal Plan, Risk ve Yatırım

Bu yapı doğru. Yatırımcı zihnindeki karar akışına uygundur.

### 2.2. Ana render artık accordion üzerinden ilerliyor

`landing/src/App.tsx` içinde ana sayfa artık `AccordionPresentation` render ediyor.

`landing/src/components/AccordionPresentation.tsx`:

- `accordion-groups.json` dosyasını okuyor.
- Üstte `DecisionSummaryBox` gösteriyor.
- Altında 8 accordion grubunu render ediyor.

`landing/src/components/AccordionGroup.tsx`:

- Native `<details><summary>` kullanıyor.
- Tek açık accordion mantığını üst state ile yönetiyor.
- Grup içindeki section'ları `SectionView` ile tekrar kullanıyor.

Bu teknik karar doğru. Chakra Accordion'a zorunlu geçiş gerekmiyor.

### 2.3. Manifest hâlâ dikkat gerektiriyor

`manifest.json` eski/ana section yapısını taşıyor olabilir. Ana landing render akışı artık manifest'e bağlı değil; `sections/` klasörünü ve `accordion-groups.json` dosyasını kullanıyor.

Risk:

- Dokümantasyon, build scriptleri, validation scriptleri veya dış tüketiciler hâlâ `manifest.json` okuyorsa eski sayım/başlık yanılgısı doğabilir.
- Sunum modu `sections` dizisinden üretildiği için ana akışa göre farklı deneyim verebilir.

Öneri:

Manifest ya güncel 27 section ve 8 accordion grubunu referanslamalı ya da açıkça "legacy index" olarak işaretlenmeli.

## 3. Yatırımcı Ne Görmek İster?

Bu yatırımcı teknoloji yatırımcısı gibi bakmaz. 60+ yaşında, büyük emlak/arsa geçmişi olan biri şu soruları sorar:

1. Bu benim bildiğim emlak işinin neresine denk geliyor?
2. Ben para koyarsam neyi kontrol edeceğim?
3. Para nereye harcanacak?
4. İlk 90 günde sahada ne göreceğim?
5. Hangi rakam gerçek, hangi rakam varsayım?
6. Yanlış ilan, hatalı tapu, kötü değerleme olursa itibarım nasıl korunacak?
7. Gelir ilk nereden gelecek?
8. Başabaş ne zaman, en kötü nakit seviyesi nerede?
9. Bu işte benim getirimin yolu nedir?
10. Yönetimde kim neye karar verecek?

Mevcut sunum bunların çoğuna dağınık cevap veriyor. Eksik olan, cevapları yatırımcı karar paneline dönüştüren özet katmandır.

## 4. Eksik Yatırımcı Rapor Özetleri

### 4.1. Tek sayfalık yatırım karar özeti eksik

Mevcut durum:

Karar kutusu var; fakat yatırımcı için "tek bakışta teklif" hâlâ eksik.

Eksik karar özeti:

- Önerilen yatırım seçeneği
- Tutar
- Hisse
- Şirket değerlemesi
- Model sermayesiyle ilişkisi
- Başabaş tarihi
- En dip kasa
- İlk 90 gün kanıtı
- Yatırımcı kontrol hakkı
- Durdurma/daraltma kapısı

Önerilen component:

`InvestorDecisionSnapshot`

Gösterilecek alanlar:

| Alan | İçerik |
|---|---|
| Önerilen seçenek | Stratejik |
| Yatırım tutarı | `invest.strategic_amount` |
| Hisse | `invest.strategic_equity` |
| Değerleme | `invest.strategic_valuation` |
| Başabaş | 2027 başı |
| En dip kasa | ~32,5 milyon ₺ |
| İlk 90 gün kanıtı | doğrulanmış ilan + satıcı görüşmesi + ilk gelir sinyali |
| Kontrol | haftalık rapor + aylık karar toplantısı |

Önemli not:

40 milyon ₺ model sermayesi ile 5/15/25 milyon ₺ yatırım seçenekleri arasında açık köprü kurulmalı. Yatırımcı "model 40 milyon diyor, benden 15 milyon mu isteniyor, gerisi nereden geliyor?" sorusunu soracaktır.

### 4.2. Kaynak ve kanıt seviyesi raporu eksik

En kritik eksik budur.

Mevcut sunumda veri sınıfları var ama yatırımcı dashboard seviyesinde görünmüyor:

- doğrulanmış veri
- model varsayımı
- hedef
- doğrulanamayan benchmark
- güncellenmesi gereken veri

Önerilen component:

`EvidenceLabeledKpiBoard`

Her KPI kartı şu alanları taşımalı:

| Alan | Açıklama |
|---|---|
| Değer | gösterilen sayı |
| Sınıf | doğrulanmış / varsayım / hedef / teklif |
| Kaynak | TKGM, TÜİK, Excel master, model, dış benchmark |
| Güncelleme sıklığı | haftalık / aylık / çeyreklik |
| Owner | CPO, finans, saha, hukuk, büyüme |
| Kırmızı eşik | hangi durumda karar gerekir |

Örnek:

| KPI | Değer | Sınıf | Owner | Kırmızı eşik |
|---|---:|---|---|---|
| 2024 arsa+ticari işlem | 1.587.847 | Doğrulanmış | Finans/analiz | kaynak değişirse |
| TAM/SAM/SOM | 1,85T / 346B / 121,1B ₺ | Model varsayımı | Finans/analiz | yeni kaynakla %15+ sapma |
| 2032 hedef online arsa payı | %35 | Hedef | Yönetim | 90 gün arz sinyali zayıfsa revize |
| Operasyonel başabaş | 2027 başı | Model varsayımı | Finans | aylık gelir hedefin %70 altı |

### 4.3. İlk 90 gün yatırımcı raporu eksik

Mevcut durum:

`09a-ilk-90-gun.json` içinde KPI'lar var. Fakat hedef/gerçekleşen/kanıt/karar kapısı yapısı yok.

Yatırımcı şunu görmek ister:

- kaç satıcıyla görüşüldü?
- kaç emlakçı partner oldu?
- kaç parsel dosyası açıldı?
- kaç doğrulanmış ilan yayına girdi?
- kaç alıcı talebi geldi?
- kaç teklif görüşmesi başladı?
- kaç ücretli paket/ilk gelir oluştu?
- hangi ilçede tutuyor, hangisinde tutmuyor?
- 90 gün sonunda karar ne?

Önerilen component:

`First90DaysPlan`

Alt yapısı:

- haftalık ritim
- KPI board
- kanıt checklist'i
- karar kapısı

Önerilen KPI'lar:

| KPI | 30 gün | 60 gün | 90 gün | Karar |
|---|---:|---:|---:|---|
| Kurucu satıcı adayı | 50 | 150 | 300 | hedef altıysa bölge daralt |
| Sıcak satıcı görüşmesi | 20 | 60 | 120 | saha mesajı revize |
| Emlakçı partner | 10 | 25 | 50 | partner teklifi değiştir |
| Doğrulanmış aktif ilan | 30 | 120 | 300 | ilçe aç/kapat kararı |
| Alıcı talebi | 10 | 50 | 150 | talep kanalı güçlendir |
| İlk ücretli paket | 0-1 | 3-5 | 10+ | gelir sinyali var/yok |

Not:

Bu hedefler modelde yoksa kesin hedef olarak değil, "önerilen pilot KPI taslağı" diye etiketlenmeli.

### 4.4. Use-of-funds kapı raporu eksik

Mevcut durum:

`16a-paranin-kullanimi.json` para kullanım kategorilerini ve 30/60/90/180 gün timeline'ını gösteriyor. Fakat "hangi bütçe hangi kanıtla açılır?" görünümü yok.

Yatırımcı şunu görmek ister:

- kaç TL ilk gün kullanılacak?
- kaç TL ürün için ayrılacak?
- kaç TL saha için ayrılacak?
- hangi KPI gelmeden yeni harcama açılmayacak?
- hangi durumda işe alım yavaşlayacak?
- hangi durumda pazarlama duracak?

Önerilen component:

`CapitalReleasePlan`

Alanlar:

| Kapı | Maksimum bütçe | Açılma şartı | Durdurma şartı | Owner |
|---|---:|---|---|---|
| 0-30 gün | şirket + ürün planı + ilk ekip | pilot ilçe listesi onayı | plan onaysızsa harcama yok | CPO |
| 31-60 gün | saha + ürün MVP | ilk satıcı sözleşmeleri | satıcı görüşmesi zayıfsa daralt | CPO/saha |
| 61-90 gün | doğrulama + ilan + talep | doğrulanmış ilan + RFQ sinyali | gelir sinyali yoksa büyüme yavaşlar | yönetim |
| 90-180 gün | ücretli paket + ölçek | ilk giriş geliri | paid conversion düşükse revizyon | yönetim |

Bu component yatırımcının en çok seveceği component olabilir. Çünkü paranın "kontrolsüz yakılmadığını" gösterir.

### 4.5. Gelir akışı alt KPI'ları eksik

Mevcut durum:

`financial-breakdown.json` içinde yedi gelir akışı var:

- ParselQ RFQ
- İlan ve görünürlük
- Emlakçı ağı
- Veri/API/rapor
- Reklam/sponsorluk
- Profesyonel SaaS
- Hizmet

Eksik olan:

Her gelir akışının "operasyonel sürücüsü" yok.

Önerilen component:

`RevenueDriverMatrix`

Örnek yapı:

| Gelir akışı | Sürücü KPI | İlk kanıt | 2032 hedefle ilişki |
|---|---|---|---|
| RFQ | alıcı talebi, teklif adedi, teklif kredisi | ilk RFQ + teklif görüşmesi | en büyük akış |
| İlan | doğrulanmış ilan, premium dönüşüm | ilk ücretli paket | erken gelir |
| Emlakçı ağı | partner emlakçı, teklif hakkı | partner aboneliği | bölgesel büyüme |
| Veri/API | rapor satışı, API müşteri | ilk rapor satışı | olgunluk geliri |
| Reklam | sponsorlu konum doluluk | ilk bölge sponsoru | trafik sonrası |
| SaaS | ücretli emlakçı hesabı | ilk abonelik | profesyonel segment |
| Hizmet | drone/foto/değerleme siparişi | ilk hizmet siparişi | saha katkısı |

Yatırımcıya sadece "5,5 milyar ₺ medyan gelir" denmemeli. "Bu geliri hangi küçük göstergeler büyütecek?" gösterilmeli.

### 4.6. Unit economics raporu eksik

Şu anda sunumda gelir hedefi ve gider hedefi var. Fakat yatırımcı şu soruları sorabilir:

- bir satıcı edinmenin maliyeti nedir?
- bir doğrulanmış ilanın maliyeti nedir?
- bir alıcı talebinin maliyeti nedir?
- ücretli müşteriye dönüşüm oranı nedir?
- müşteri başı gelir nedir?
- CAC geri dönüş süresi nedir?
- emlakçı aboneliği ne kadar kalır?

Önerilen component:

`UnitEconomicsPanel`

Başlangıçta varsayım olarak konabilir:

| KPI | Sınıf | Neden gerekli |
|---|---|---|
| Satıcı edinim maliyeti | model varsayımı | saha verimliliği |
| Doğrulanmış ilan başı maliyet | model varsayımı | arz maliyeti |
| Alıcı talebi başı maliyet | model varsayımı | talep verimliliği |
| Premium dönüşüm | model varsayımı | gelir kalitesi |
| LTV/CAC | model varsayımı | ölçeklenebilirlik |
| Payback süresi | model varsayımı | nakit disiplini |

Bu veriler henüz yoksa bile "90 gün pilotta ölçülecek KPI" olarak gösterilmeli.

### 4.7. Yatırımcı getiri modeli eksik

Mevcut durum:

`16c-yatirimci-getiri.json` üç yol söylüyor:

- değer artışı
- nakit üretimi
- stratejik çıkış

Bu doğru ama yetersiz.

Yatırımcı şunu görmek ister:

- ben hangi senaryoda ne kazanırım?
- bu şirket kâr dağıtır mı, büyümeye mi yatırır?
- yeni yatırım turunda hissem sulanır mı?
- stratejik satış olursa çarpan neye göre hesaplanır?
- kötü senaryoda param nasıl korunur?

Önerilen component:

`InvestorReturnModel`

Alt bölümler:

1. Senaryo kartları: düşük / medyan / yüksek.
2. Değerleme köprüsü: gelir, kâr, çarpan, şirket değeri.
3. Hisse etkisi: mevcut hisse, olası dilution, koruma hakları.
4. Nakit politikası: büyümeye yeniden yatırım / dağıtım opsiyonu.
5. Çıkış yolları: stratejik satış, yeni tur, kâr payı.

Uyarı metni:

`Bu getiriler garanti değildir; pazar payı, gelir, kâr ve stratejik alıcı ilgisi oluşursa anlam kazanır.`

### 4.8. Governance ve kontrol matrisi eksik

Mevcut durum:

`16b-ortaklik-yonetim.json` karar yetkisi anlatıyor. Fakat component düzeyi yeterli değil.

Yatırımcı şunu görmek ister:

- günlük kararı kim verir?
- bütçe onayı kimde?
- yeni ilçe açma kararı kimde?
- büyük harcama eşiği nedir?
- işe alım onayı nasıl ilerler?
- hukuki riskte kim durdurur?
- yatırımcı hangi raporu ne sıklıkla alır?

Önerilen component:

`GovernanceMatrix`

Alanlar:

| Karar alanı | CPO | Yatırımcı | Ortak karar | Not |
|---|---|---|---|---|
| Günlük ürün yönetimi | sorumlu | bilgilendirilir | hayır | hız için |
| Bütçe kapısı | önerir | onaylar | evet | kontrol için |
| Yeni pilot ilçe | önerir | onaylar | evet | saha bilgisi için |
| Büyük harcama | önerir | onaylar | evet | nakit disiplini |
| Hukuki yayın durdurma | uygular | bilgilendirilir | gerekirse | itibar koruma |
| Aylık yönetim raporu | hazırlar | inceler | evet | karar toplantısı |

### 4.9. Risk kapıları daha güçlü gösterilmeli

Mevcut durum:

`14-risk.json` içinde risk tablosu var. Generic table olarak render ediliyor.

Sorun:

Risk tablosu yatırımcı için uzun metin haline geliyor. Riskin ciddiyeti, tetikleyici eşiği ve aksiyon ayrışmıyor.

Önerilen component:

`RiskGateMatrix`

Her risk kartı:

- risk adı
- ciddiyet
- ölçüm
- karar kapısı
- aksiyon
- owner
- durum: planlandı / izleniyor / kritik

Özel risk:

`İtibar riski` ayrı bir "kırmızı çizgi" paneli olmalı.

Metin:

`Yanlış ilan yalnız müşteri şikayeti yaratmaz; yatırımcı itibarını da yıpratır. Bu yüzden sahte ilan, yanlış evrak, hatalı değerleme ve agresif satış dili ilk günden kırmızı çizgidir.`

### 4.10. Teşvik ve vergi faydası raporu eksik

Mevcut durum:

`incentives.json` ve `15-teknopark.json` teşvikleri anlatıyor.

Eksik:

- hangi teşvik için ne zaman başvurulacak?
- kim sahibi?
- kabul olasılığı nedir?
- nakit etkisi ne zaman doğar?
- avantaj hedef mi, varsayım mı, mevzuat mı?

Önerilen component:

`IncentivePipeline`

Alanlar:

| Teşvik | Durum | Başvuru zamanı | Owner | Olasılık | Nakit etkisi | Not |
|---|---|---|---|---|---:|---|
| Teknopark | hazırlanacak | şirket kuruluşu sonrası | CPO/finans | orta-yüksek | modele bağlı | kabul şartlı |
| TÜBİTAK | araştırılacak | MVP sonrası | ürün/finans | orta | projeye bağlı | hibe ihtimali |
| KOSGEB/TEKMER | değerlendirilecek | erken dönem | finans | orta | sınırlı | tamamlayıcı |

## 5. Yatırımcının Görmesi Gereken KPI Seti

Aşağıdaki KPI seti sunuma "Yatırımcı Dashboard" olarak eklenmeli.

### 5.1. Karar KPI'ları

| KPI | Mevcut değer | Sınıf | Neden önemli |
|---|---:|---|---|
| Önerilen yatırım | stratejik seçenek | teklif | karar tutarı |
| Yatırım tutarı | `invest.strategic_amount` | teklif | başlanacak sermaye |
| Hisse | `invest.strategic_equity` | teklif | yatırımcı payı |
| Değerleme | `invest.strategic_valuation` | teklif | giriş fiyatı |
| Operasyonel başabaş | 2027 başı | model varsayımı | nakit riski |
| En dip kasa | ~32,5M ₺ | model varsayımı | güven marjı |
| İlk 90 gün kanıtı | doğrulanmış ilan + talep + ilk gelir | hedef | pilot başarısı |

### 5.2. Pazar KPI'ları

| KPI | Mevcut değer | Sınıf |
|---|---:|---|
| 2024 toplam taşınmaz satışı | 3.065.872 | doğrulanmış |
| 2024 arsa+ticari işlem | 1.587.847 | doğrulanmış |
| TAM | 1,85T ₺ | model varsayımı |
| SAM | 346B ₺ | model varsayımı |
| SOM | 121,1B ₺ | model varsayımı |
| Online penetrasyon | %18,7 | model varsayımı |
| 2032 hedef online arsa payı | %35 | hedef |
| 2032 medyan gelir | 5,5B ₺ | hedef/model |

### 5.3. Saha KPI'ları

| KPI | Sınıf | Takip sıklığı |
|---|---|---|
| Satıcı adayı | hedef + gerçekleşen | haftalık |
| Satıcı görüşmesi | hedef + gerçekleşen | haftalık |
| Emlakçı partner | hedef + gerçekleşen | haftalık |
| Doğrulanmış aktif ilan | hedef + gerçekleşen | haftalık |
| Eksik evraklı dosya | risk göstergesi | haftalık |
| Alıcı talebi | hedef + gerçekleşen | haftalık |
| Teklif görüşmesi | hedef + gerçekleşen | haftalık |
| İlk ücretli paket | gelir sinyali | haftalık |

### 5.4. Finans KPI'ları

| KPI | Sınıf | Not |
|---|---|---|
| Aylık gelir | model + gerçekleşen | pilot sonrası |
| Aylık OPEX | model + gerçekleşen | sapma izlenmeli |
| Aylık nakit yakımı | eksik | zorunlu |
| Runway | eksik | zorunlu |
| Kasa dip noktası | model varsayımı | güven marjı |
| CAPEX gerçekleşen | model + gerçekleşen | kuruluş disiplini |
| OPEX sapması | eksik | kırmızı eşik |
| Başabaş tarihi | model varsayımı | tekrar hesaplanmalı |

### 5.5. Gelir KPI'ları

| KPI | Sınıf | Not |
|---|---|---|
| Ücretli ilan sayısı | hedef + gerçekleşen | erken gelir |
| Premium/vitrin dönüşümü | model + gerçekleşen | unit economics |
| RFQ adedi | hedef + gerçekleşen | ana inovasyon |
| Teklif kredisi satışı | hedef + gerçekleşen | RFQ monetizasyonu |
| Emlakçı aboneliği | hedef + gerçekleşen | B2B gelir |
| Veri/rapor satışı | hedef + gerçekleşen | olgunluk |
| Hizmet siparişi | hedef + gerçekleşen | saha geliri |

### 5.6. Kontrol ve risk KPI'ları

| KPI | Eşik |
|---|---|
| Ciddi itibar olayı | 0 tolerans |
| Sahte/yanlış ilan tespiti | yayın durdurma |
| Değerleme itiraz oranı | eşik aşarsa eksper ortaklığı |
| EİDS/KVKK uyum açığı | yayın ve iş akışı durdurma |
| Satıcı arzı hedef altı | bölge daraltma |
| Alıcı talebi zayıf | talep kanalı revizyonu |
| OPEX sapması | işe alım/pazarlama yavaşlatma |

## 6. Hangi İçerik Hangi Component ile Gösterilmeli?

### 6.1. Karar Özeti

Mevcut:

- `DecisionSummaryBox`

Eksik:

- tutar/hisse/değerleme/başabaş/en dip kasa/90 gün kanıtı tek kartta yok.

Önerilen:

- `InvestorDecisionSnapshot`
- `EvidenceLabeledKpiBoard`

### 6.2. Neden Bu Ortaklık?

Mevcut:

- heading, lead, cardGrid, table

Eksik:

- yatırımcının sahadaki gerçek varlıklarının projeye nasıl aktığı net değil.

Önerilen:

- `InvestorAssetMap`

Alanlar:

| Yatırımcı gücü | Projede karşılığı |
|---|---|
| saha ilişkisi | satıcı arzı |
| bölge bilgisi | pilot ilçe seçimi |
| itibar | kurucu güven etkisi |
| portföy refleksi | doğrulanmış ilan stoğu |
| nakit disiplini | kontrollü büyüme |

### 6.3. Problem ve Çözüm

Mevcut:

- problem kartları
- ParselQ panel mock
- yetki/sorumluluk tablosu

Eksik:

- güven dosyası "hangi evrak/hangi kontrol/hangi çıktı" olarak tam gösterilmiyor.

Önerilen:

- `TrustFileChecklist`
- `AuthorityBoundaryMap`

### 6.4. Pazar ve Rekabet

Mevcut:

- `marketScale`
- chart
- rekabet tablosu
- playbook

Eksik:

- pazar verisinin kanıt seviyesi ve %35 hedefin senaryo olduğu görsel olarak ayrışmıyor.

Önerilen:

- `MarketAssumptionLadder`
- `CompetitorPositionMap`
- `SourceConfidenceLegend`

### 6.5. İş Modeli ve Gelirler

Mevcut:

- cardGrid
- revenueStreams chart
- uzun gelir katalogları

Eksik:

- ilk gelirin nereden geleceği ve gelir akışlarının operasyonel sürücüleri.

Önerilen:

- `RevenueDriverMatrix`
- `EarlyRevenuePath`
- `PackageConversionFunnel`

### 6.6. Saha Planı ve İlk 90 Gün

Mevcut:

- timeline
- statGrid
- cardGrid

Eksik:

- hedef/gerçekleşen/kanıt/karar kapısı.

Önerilen:

- `First90DaysPlan`
- `FieldKpiBoard`
- `PilotDecisionGate`

### 6.7. Operasyon ve Kadro

Mevcut:

- AI efficiency chart
- headcount charts
- CPO cardları

Eksik:

- 256 kişi neden, ne zaman, hangi gelir veya risk sinyaliyle alınır?

Önerilen:

- `HiringGatePlan`
- `HumanInLoopMatrix`
- `CpoDeliverablesBoard`

### 6.8. Finansal Plan, Risk ve Yatırım

Mevcut:

- chartTabs
- statGrid
- risk table
- yatırım cardGrid

Eksik:

- finansal karar çerçevesi, bütçe kapıları, risk eşikleri, getiri modeli.

Önerilen:

- `FinancialDecisionFrame`
- `CapitalReleasePlan`
- `RiskGateMatrix`
- `InvestmentOptionsCompare`
- `InvestorReturnModel`
- `GovernanceMatrix`

## 7. ChakraUI Yeterli mi?

Kısa cevap:

Evet, altyapı olarak yeterli. Hayır, hazır component seti olarak yeterli değil.

### 7.1. ChakraUI neden yeterli?

Mevcut stack şunlar için yeterli:

- responsive layout
- tokenlı renk sistemi
- typography
- accessible focus state
- card/surface kabuğu
- tabs/segmented control benzeri yapı
- native details/summary ile accordion
- 320px mobile-first düzen

Yeni UI kütüphanesi eklemek gereksiz risk olur. Projede zaten Chakra v3 + custom primitive yaklaşımı var.

### 7.2. ChakraUI neden tek başına yetmez?

Çünkü yatırımcı sunumu generic UI component istemiyor. Domain karar component'leri istiyor.

`statGrid` şu soruyu cevaplamaz:

"Bu KPI iyi mi kötü mü?"

`table` şu soruyu cevaplamaz:

"Bu risk hangi eşikte karar gerektirir?"

`cardGrid` şu soruyu cevaplamaz:

"Bu yatırım seçeneği hangi riski kapatıyor?"

`chartTabs` şu soruyu cevaplamaz:

"Ben şimdi hangi finansal sonuca bakmalıyım?"

Bu yüzden Chakra üstüne custom components gerekir.

## 8. Custom Component Gereklilikleri

### 8.1. `KpiBoard`

Kullanım:

- karar kutusu
- ilk 90 gün
- finans dashboard
- saha dashboard

Alanlar:

```ts
type KpiItem = {
  label: string;
  value?: string;
  valueRef?: string;
  status?: "good" | "watch" | "risk" | "unknown";
  class: "verified" | "assumption" | "target" | "offer";
  source?: string;
  owner?: string;
  cadence?: "weekly" | "monthly" | "quarterly";
  redFlag?: string;
};
```

### 8.2. `RiskGateMatrix`

Kullanım:

- `14-risk.json`
- yatırımcı itibar paneli

Alanlar:

```ts
type RiskGate = {
  risk: string;
  severity: "low" | "medium" | "high" | "critical";
  metric: string;
  trigger: string;
  action: string;
  owner: string;
};
```

### 8.3. `CapitalReleasePlan`

Kullanım:

- `16a-paranin-kullanimi.json`
- yatırım seçenekleri

Alanlar:

```ts
type CapitalGate = {
  gate: string;
  period: string;
  maxBudget?: string;
  opensWhen: string;
  stopsWhen: string;
  owner: string;
  evidence: string[];
};
```

### 8.4. `InvestmentOptionsCompare`

Kullanım:

- `17-yatirim.json`

Alanlar:

```ts
type InvestmentOption = {
  name: string;
  amountRef: string;
  equityRef?: string;
  valuationRef?: string;
  funds: string[];
  closesRisk: string[];
  investorRole: string;
  recommendation?: boolean;
};
```

### 8.5. `GovernanceMatrix`

Kullanım:

- `16b-ortaklik-yonetim.json`
- karar kutusu

Alanlar:

```ts
type GovernanceRow = {
  decision: string;
  cpo: "responsible" | "consulted" | "informed" | "approves";
  investor: "responsible" | "consulted" | "informed" | "approves";
  joint?: boolean;
  note: string;
};
```

### 8.6. `First90DaysPlan`

Kullanım:

- `09a-ilk-90-gun.json`

Alanlar:

```ts
type PilotMilestone = {
  period: "30" | "60" | "90";
  objectives: string[];
  kpis: KpiItem[];
  decision: string;
};
```

### 8.7. `FinancialDecisionFrame`

Kullanım:

- `13-basabas.json`

Amaç:

Finansal grafikleri tek başına göstermek yerine önce karar özetini verir:

- bu grafikte neye bakılır?
- iyi sonuç nedir?
- kırmızı bayrak nedir?
- hangi varsayıma bağlıdır?

Alanlar:

```ts
type FinancialFrame = {
  title: string;
  decisionQuestion: string;
  headlineKpis: KpiItem[];
  chartType: string;
  tableMode?: "summary" | "detail";
  redFlags: string[];
};
```

### 8.8. `ResponsiveTableBlock`

Mevcut `MobileTableCards` iyi bir temel. Ancak global olarak ikinci kolonu primary yapmak yanlış.

Yeni JSON alanları:

```json
{
  "type": "table",
  "mobile": {
    "rowTitleIndex": 0,
    "primaryValueIndex": 2,
    "detailIndexes": [1, 3]
  }
}
```

Böylece risk tablosunda "risk adı" kart başlığı olur; yatırım tablosunda "seçenek" başlık olur; governance tablosunda "karar alanı" başlık olur.

## 9. Mevcut İçeriklerde En Kritik Eksikler

### 9.1. 40M sermaye ile yatırım seçenekleri köprüsü

Problem:

Finansal model 40M sermaye ve 32,5M en dip kasa anlatıyor. Yatırım seçenekleri ise 5M, 15M, 25M gibi ilerliyor. Bu iki katman bağlanmazsa yatırımcı "hangi model gerçek?" diye sorar.

Gereken:

`CapitalStackBridge`

Soru:

`40M model sermayesi hangi yatırım seçeneğiyle nasıl tamamlanıyor?`

### 9.2. Finans/İK senaryo mutabakatı

Problem:

İK master 256 kişilik organizasyonu anlatıyor. Finansal model 38→256 agresif büyümeyi anlatıyor. Yatırımcı bunun master plan mı, agresif senaryo mu, medyan senaryo mu olduğunu görmek ister.

Gereken:

`ScenarioReconciliationNote`

Metin:

`Bu bölümde gösterilen kadro planı hedef organizasyon senaryosudur. Gerçek işe alım, saha ve gelir sinyaliyle kapı kapı açılır.`

### 9.3. %35 hedefin senaryo olarak görünmesi

Problem:

`%35 online arsa payı` iddialı. Hedef diye ayrılmalı.

Gereken:

`AssumptionBadge`

Metin:

`%35 gerçekleşmiş sonuç değildir; 2032 hedef senaryosudur.`

### 9.4. Gelir akışlarının ilk kanıtları

Problem:

Yedi gelir akışı var ama "ilk para nereden gelir?" sorusu net değil.

Gereken:

`EarlyRevenuePath`

Örnek:

1. doğrulanmış ilan
2. premium/vitrin
3. alıcı talebi
4. teklif kredisi
5. emlakçı paketi

### 9.5. İtibar riski merkezi değil

Problem:

İtibar riski bir kartta var ama yatırımcı profili için ana risklerden biri olmalı.

Gereken:

`ReputationGuardrail`

İçerik:

- sahte ilan: yayın durdurma
- yanlış evrak: hukuk kontrolü
- hatalı değerleme: bilgilendirme etiketi + eksper
- agresif satış dili: saha eğitim ve denetim

## 10. Önerilen Yeni Veri Dosyaları

Mevcut JSON mimarisini bozmadan yeni veri katmanları eklenmeli.

### 10.1. `database/data/investor-dashboard.json`

İçerik:

- karar KPI'ları
- pazar KPI'ları
- saha KPI'ları
- finans KPI'ları
- risk KPI'ları
- kaynak sınıfı
- owner
- kırmızı eşik

### 10.2. `database/data/capital-gates.json`

İçerik:

- 30/60/90/180 gün bütçe kapıları
- açılma şartı
- durma şartı
- azami harcama
- owner

### 10.3. `database/data/revenue-drivers.json`

İçerik:

- gelir akışı
- operasyonel sürücü
- ilk kanıt
- hedef metrik
- owner

### 10.4. `database/data/governance-matrix.json`

İçerik:

- karar alanı
- CPO rolü
- yatırımcı rolü
- ortak karar mı?
- rapor sıklığı

### 10.5. `database/data/investor-return-scenarios.json`

İçerik:

- düşük/medyan/yüksek senaryo
- gelir
- kâr
- değerleme çarpanı
- şirket değeri
- yatırımcı payı
- dilution uyarısı
- garanti olmadığı notu

## 11. Component Uygulama Önceliği

### Faz 1: Karar ve güven

1. `InvestorDecisionSnapshot`
2. `EvidenceLabeledKpiBoard`
3. `SourceConfidenceBadge`
4. `ResponsiveTableBlock`

Bu faz yatırımcı güvenini artırır.

### Faz 2: Saha ve para kontrolü

5. `First90DaysPlan`
6. `CapitalReleasePlan`
7. `RiskGateMatrix`

Bu faz "para nasıl korunacak ve sahada ne göreceğiz?" sorusunu çözer.

### Faz 3: Gelir ve getiri

8. `RevenueDriverMatrix`
9. `InvestmentOptionsCompare`
10. `InvestorReturnModel`
11. `GovernanceMatrix`

Bu faz yatırım kararını kapanışa taşır.

### Faz 4: Finansal grafikleri karar çerçevesine alma

12. `FinancialDecisionFrame`
13. ChartTabs sadeleştirme
14. Mobile 320px grafik özetleri

Bu faz finans accordion'unu okunur hale getirir.

## 12. Accordion Yapısı İçin Öneri

8 accordion doğru kalmalı. Fakat bazı gruplar içine mini index gerekir.

Özellikle:

### 12.1. Finansal Plan, Risk ve Yatırım

Bu grup çok ağır. İçinde şu mini bölüm indeksleri olmalı:

1. Finansal özet
2. Para kullanım kapıları
3. Risk kapıları
4. Teşvik/vergi
5. Yatırım seçenekleri
6. Getiri modeli
7. Yönetim ve kontrol

Önerilen component:

`GroupSectionIndex`

Ama accordion sayısı 8 kalmalı.

### 12.2. Pazar ve Rekabet

İçinde mini index:

1. Pazar büyüklüğü
2. Varsayım merdiveni
3. Rakip haritası
4. Savunma planı

### 12.3. Saha Planı ve İlk 90 Gün

İçinde mini index:

1. Pilot ilçe
2. Satıcı/emlakçı ağı
3. Haftalık saha ritmi
4. 90 gün KPI
5. Devam/daraltma kararı

## 13. Son Karar: Mevcut İçerik Yeterli mi?

Hayır, final yatırımcı kararı için yeterli değil.

Ama eksik olan "daha fazla veri" değil. Eksik olan "karar verdiren özet katman".

Mevcut veriler:

- pazar var
- finans var
- İK var
- risk var
- yatırım seçenekleri var
- accordion gruplaması var

Eksik katman:

- KPI sınıflandırması
- kaynak güven etiketi
- owner
- kırmızı eşik
- 90 gün karar kapısı
- capital release plan
- yatırımcı getiri senaryosu
- governance matrix
- unit economics
- finans/İK senaryo mutabakatı

## 14. Claude'a Verilecek Uygulama Prompt'u

```text
Projede mevcut accordion yapısını koru. Yeni route açma. ChakraUI altyapısını değiştirme. Ancak yatırımcı sunumunu generic kart/grafik görünümünden karar panosu görünümüne taşı.

Önce şu raporu oku:
/Users/karaca/Documents/sonbirarsa/database/verification/yatirimci-icerik-kpi-component-eksik-raporu.md

Ana hedef:
60+ yaşında, klasik büyük emlak/arsa yatırımcısı son toplantıda şu sorulara hızlı cevap almalı:
- Ne kadar yatırım istiyorsun?
- Karşılığında ne alacağım?
- Para nereye harcanacak?
- İlk 90 günde sahada ne göreceğim?
- Hangi sayı gerçek, hangisi varsayım, hangisi hedef?
- Risk olursa hangi kapıda duracağız?
- Benim kontrol hakkım ne?
- Getiri hangi yolla oluşacak?

Uygulama sırası:
1. `database/data/investor-dashboard.json` oluştur.
   Her KPI için: label, value/valueRef, class (verified/assumption/target/offer), source, owner, cadence, redFlag.

2. `KpiBoard` component'i geliştir.
   StatGrid yerine yatırımcı KPI kartları göster. Her kartta değer + sınıf etiketi + kaynak + owner + kırmızı eşik olsun.

3. Karar kutusunu genişlet veya `InvestorDecisionSnapshot` ekle.
   Tutar, hisse, değerleme, başabaş, en dip kasa, ilk 90 gün kanıtı ve yatırımcı kontrol hakkını tek panelde göster.

4. `CapitalReleasePlan` component'i geliştir.
   30/60/90/180 gün bütçe kapılarını, açılma şartlarını ve durma şartlarını göster.

5. `First90DaysPlan` component'i geliştir.
   Haftalık saha ritmi + KPI board + devam/daraltma/durdurma kararı birlikte gösterilsin.

6. `RiskGateMatrix` component'i geliştir.
   Generic tablo yerine risk, ölçüm, karar kapısı, aksiyon, owner ve severity göster.

7. `InvestmentOptionsCompare` component'i geliştir.
   Yatırım seçenekleri kart metnine gömülü kalmasın. Tutar, hisse, değerleme, finanse ettiği risk ve yatırımcı rolü ayrı alanlar olsun.

8. `GovernanceMatrix` component'i geliştir.
   CPO, yatırımcı ve ortak karar alanlarını tablo/kart hibritiyle göster.

9. Finansal grafiklerin üstüne `FinancialDecisionFrame` ekle.
   Her finans grafiğinden önce şu üç şeyi göster: karar sorusu, bakılacak KPI, kırmızı eşik.

10. Mevcut `MobileTableCards` davranışını geliştir.
    Her tablo için mobile.primary/detail config destekle. İkinci kolonu otomatik primary yapmak yatırımcı tablolarında yanlış.

Kabul kriterleri:
- 8 ana accordion korunacak.
- ChakraUI kalacak.
- 320px genişlikte yatay taşma olmayacak.
- Her KPI üzerinde verified/assumption/target/offer etiketi olacak.
- Finansal model ile yatırım seçenekleri arasındaki 40M vs 5/15/25M köprüsü açık anlatılacak.
- İlk 90 gün sonunda devam/daraltma/durdurma kararı görünecek.
- Riskler generic table olarak değil, karar kapısı olarak görünecek.
- Yatırımcı getirisi garanti gibi sunulmayacak; senaryo olarak gösterilecek.
- `npm run build` başarılı olacak.
```

## 15. Kısa Sonuç

Yatırımcı daha fazla grafik görmek istemez. Daha fazla kontrol görmek ister.

Bu nedenle sunumun bir sonraki evresi şudur:

`veri sunumu` -> `yatırımcı karar panosu`

ChakraUI bu dönüşüm için yeterli temel sağlar. Ancak custom component geliştirmeden bu sunum yatırımcı zihninde hâlâ "çok veri var" seviyesinde kalır. Custom component'lerle hedef şu olmalı:

`Bu iş nereden para kazanacak, para nasıl korunacak, ilk 90 günde ne ispatlanacak ve yatırımcı hangi kararı ne zaman verecek?`

