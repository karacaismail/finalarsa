# Son Toplantı İçin Section ve Component Eksik Raporu

Tarih: 2026-06-23  
Kapsam: `/Users/karaca/Documents/sonbirarsa/database/sections` ve mevcut landing sunumu  
Hedef kişi: 60+ yaşında, hayatı boyunca emlak/arsa işi yapmış, teknoloji yatırımına hazırlanması gereken büyük emlakçı yatırımcı adayı.

## 1. Kısa Hüküm

Mevcut sunum güçlü bir veri ve strateji dosyasına dönüşmüş. 18 section var; ürün, pazar, gelir modeli, GTM, rekabet, AI, İK, finans, risk, teknopark, CPO, yatırım ve kapanış anlatılıyor.

Fakat final toplantı için eksik olan şey daha fazla grafik değil. Eksik olan şey, yatırımcının kendi zihnindeki üç soruya doğrudan cevap veren karar katmanı:

1. "Bu benim bildiğim emlak işinin neresine denk geliyor?"
2. "Ben para koyarsam kontrol, itibar ve risk nasıl yönetilecek?"
3. "İlk 30-90 günde sahada ne göreceğim?"

Şu an sunum teknoloji ve strateji açısından güçlü, fakat yatırımcı psikolojisi açısından fazla "startup deck" gibi kalabiliyor. Bu kişi için sunumun dili "AI-first pazar yeri"nden çok "arsa ofisini dijitalde büyüten kontrollü işletme planı" olmalı.

## 2. Yatırımcı Profili İçin Temel Çerçeve

Bu yatırımcı muhtemelen şu şeylere hızlı tepki verir:

- Tapu, imar, belediye, ruhsat, hisse, satış yetkisi.
- Saha ekibi, araç, müşteri ziyareti, portföy.
- Güven, itibar, sözünün ağırlığı.
- Kasa, kontrol, ödeme takvimi.
- Satıcı ilişkisi ve bölge hakimiyeti.
- Rakibe karşı "laf" değil "işleyen saha sistemi".

Bu yatırımcı şu şeylerde zorlanır:

- Çok fazla SaaS/GTM/AI/SAFe/ART/jargon.
- Aynı anda çok fazla grafik, tablo ve senaryo.
- 2032 gibi uzak ve büyük sayıların erken verilmesi.
- "Silah, cephane, komando, mem savaşı" gibi agresif strateji dili.
- Lisans, SPK, escrow, GYF, RFQ gibi kavramların açıklamasız geçmesi.

Ana metafor:

> Bu proje yeni bir internet sitesi değil; mevcut arsa ofisi mantığını dijital tapu dosyası, dijital vitrin, dijital müşteri ağı ve kontrollü saha operasyonuna dönüştüren işletmedir.

## 3. Mevcut Section Durumu

Güncel section sayısı 18:

1. Karar notu
2. Toplantı özeti
3. Neden doğru ortak
4. Problem
5. Çözüm / ParselQ
6. Pazar
7. İş modeli
8. Gelir modelleri
9. GTM
10. Rekabet
11. AI operasyon
12. İK planı
13. Başabaş
14. Risk
15. Teknopark
16. CPO
17. Yatırım
18. İlk 30 gün

Mevcut akış doğru yönde, ama final toplantı için şu eksikler var:

- Yatırımcı mental model köprüsü eksik.
- Yetki/hukuk/sorumluluk sınırı ayrı section değil.
- Pilotun ilk 90 günü yeterince işletme planı gibi değil.
- Satıcı/emlakçı edinim sistemi ayrı ve görünür değil.
- Alıcı talep ve teklif akışı yeterince somut değil.
- Yatırımcının rolü, kontrol hakkı ve karar ritmi ayrı section değil.
- Paranın kullanımı ve harcama kontrol kapıları yeterince net değil.
- Yatırımcı getirisi, geri dönüş mantığı ve çıkış seçenekleri eksik.
- Ürün demo ekranları az; panel mock var ama üç taraflı iş akışı görünmüyor.

## 4. Eklenmesi Gereken Yeni Section'lar

### 4.1. Yeni Section: "Bu iş sizin bildiğiniz emlak işidir"

Yer: Section 3'ten sonra, problemden önce.

Amaç: Yatırımcıya teknoloji değil, kendi işinin dijital karşılığını göstermek.

Önerilen başlık:

> Bu iş sizin bildiğiniz emlak işinin dijital şubesidir.

Önerilen metin:

> Arsa işinde para yalnız ilandan kazanılmaz; portföyden, güvenden, doğru alıcıdan, doğru evraktan ve doğru zamanda yapılan takipten kazanılır. arsam.net bu refleksi dijitale taşır: portföy dijital ilan dosyasına, ofis müşteri listesi RFQ ağına, saha keşfi doğrulanmış güven dosyasına dönüşür.

Metafor:

> Bugün iyi bir arsa ofisi nasıl mahalle mahalle portföy topluyorsa, arsam.net aynı işi ilçe ilçe dijitalde yapar.

Eksik component:

- `InvestorMentalModelBridge`

Component içeriği:

| Klasik emlak işi | Dijital karşılığı |
|---|---|
| Portföy | Doğrulanmış ilan stoğu |
| Tapu/imar kontrolü | Güven dosyası |
| Müşteri defteri | Alıcı talep ağı |
| Saha gezisi | Drone/keşif/konum katmanı |
| Referans | Doğrulanmış satıcı puanı |
| Ofis vitrini | Bölgesel arsa pazaryeri |

Bu section olmazsa yatırımcı projeyi "teknoloji işi" sanır. Oysa anlatılması gereken şey "emlak işinin ölçeklenmiş hali"dir.

### 4.2. Yeni Section: "Yetki ve sorumluluk sınırı"

Yer: Çözüm section'ından sonra.

Amaç: Tapu, EİDS, TKGM, SPK, ödeme ve hukuki sorumluluk konusunda güven vermek.

Önerilen başlık:

> Platform ne yapar, neyi devlet ve lisanslı kurum yapar?

Önerilen metin:

> arsam.net tapu tescili yapmaz; tapu devri yine devletin sisteminde tamamlanır. Platformun görevi ilanı, satıcıyı, belgeyi, imarı, konumu ve alıcı talebini düzenli hale getirmektir. Lisans gereken alanlarda kendi başına hareket edilmez; ödeme, değerleme, sigorta ve finansman tarafında lisanslı kurumlarla çalışılır.

Metafor:

> Biz tapu dairesi değiliz; tapuya gitmeden önce dosyayı hazırlayan, eksikleri gösteren ve tarafları doğru masaya oturtan dijital koordinasyon ofisiyiz.

Eksik component:

- `LegalBoundaryMap`
- `ResponsibilityMatrix`

Component satırları:

| Alan | arsam.net yapar | Yetkili kurum/ortak yapar |
|---|---|---|
| İlan doğrulama | EİDS uyumlu ilan kontrolü | Resmi kayıt altyapısı |
| Tapu bilgisi | Belge/konum ön kontrolü | Tapu tescili |
| Değerleme | Bilgilendirici fiyat bandı | Resmi ekspertiz |
| Güvenli ödeme | Süreci yönlendirir | Lisanslı ödeme kuruluşu |
| Finansman | Lead/yönlendirme | Banka/finansman şirketi |

### 4.3. Yeni Section: "İlk 90 gün saha planı"

Yer: GTM section'ından sonra veya GTM içinde ayrı güçlü blok.

Mevcut GTM iyi, ama final toplantı için daha operasyonel olmalı. Yatırımcı ilk sahada ne yapılacağını görmeli.

Önerilen başlık:

> İlk 90 gün: önce sahada portföy, sonra dijitalde talep.

Önerilen metin:

> İlk hedef ulusal reklam değildir. İlk hedef, seçili ilçelerde doğrulanmış arsa stoğu çıkarmaktır. 90 gün sonunda yatırımcıya gösterilecek ana kanıt; kaç satıcıyla görüşüldüğü, kaç doğrulanmış ilan açıldığı, kaç alıcı talebi geldiği ve kaç teklif görüşmesine dönüldüğüdür.

Metafor:

> Önce tarlaya tohum atılır, sonra hasat beklenir. Bizim tohumumuz doğrulanmış ilan stoğudur.

Eksik component:

- `Pilot90DayOperatingPlan`
- `WeeklyCadenceTimeline`
- `FieldKpiBoard`

Önerilen KPI'lar:

- Görüşülen satıcı sayısı.
- Açılan satıcı hesabı.
- Doğrulanmış aktif ilan.
- Foto/drone/keşif tamamlanan ilan.
- Gelen alıcı talebi.
- RFQ/teklif görüşmesi.
- Ücretli paket dönüşümü.

Örnek component metni:

> 90 gün sonunda başarı kriteri: 5 yıldız ilçede 300 doğrulanmış aktif ilan, ilk ücretli satıcı paketi, ilk RFQ teklif trafiği ve haftalık raporlanabilir saha verisi.

### 4.4. Yeni Section: "Satıcı ve emlakçı ağı nasıl kurulacak?"

Yer: GTM veya gelir modeli sonrası.

Amaç: Bu yatırımcı için arz tarafı yani portföy en önemli konudur. Mevcut GTM’de var ama yeterince merkezi değil.

Önerilen başlık:

> Platformun ilk yakıtı satıcı ve emlakçı ağıdır.

Önerilen metin:

> arsam.net önce alıcıya reklam vererek başlamaz. Önce satıcının işini kolaylaştırır: ilan dosyasını hazırlar, tapu/imar kontrolünü görünür yapar, alıcı talebini toplar ve emlakçıya nitelikli müşteri akışı verir.

Metafor:

> Bir pazar yerinde önce tezgâhlar dolmalıdır; müşteri kalabalığı dolu pazara gelir.

Eksik component:

- `SellerAcquisitionFunnel`
- `FounderSellerProgram`
- `RealtorPartnerCard`

Funnel:

1. Hedef ilçe listesi.
2. Satıcı/emlakçı ziyaret listesi.
3. Ücretsiz güven dosyası teklifi.
4. İlk ilan yükleme.
5. Premium/vitrin/lead paketi.
6. Referansla yeni satıcı.

### 4.5. Yeni Section: "Alıcı talebi ve teklif akışı"

Yer: Çözüm ile gelir modeli arasında.

Amaç: RFQ modelini çok daha basit anlatmak. Şu an gelir modelleri section’ında var, ama yatırımcı için "alıcı ne yapıyor?" sorusu net değil.

Önerilen başlık:

> Alıcı ilan aramaz; talebini açar, uygun parseller ona gelir.

Önerilen metin:

> Bugün alıcı arsa ararken onlarca ilan arasında kaybolur. ParselQ’da alıcı ne istediğini söyler: ilçe, bütçe, imar, metrekare, ödeme tercihi. Sistem bu talebi satıcılara ve üye emlakçılara ulaştırır. Uygun taraflar teklif verir; platform doğru teklifleri sıralar.

Metafor:

> Klasik modelde alıcı pazarı gezer. Yeni modelde alıcı istediği arsayı tarif eder, uygun tezgâhlar onun önüne gelir.

Eksik component:

- `BuyerRFQFlow`
- `OfferComparisonCards`
- `TrustScoreBadge`

Akış:

1. Alıcı talep açar.
2. Sistem uygun parselleri bulur.
3. Satıcı/emlakçı teklif verir.
4. AI teklifleri sıralar.
5. Alıcı güven dosyasıyla karar verir.
6. Tapu/ödeme süreci lisanslı kurumlarla yürür.

### 4.6. Yeni Section: "Paranın kullanımı ve kontrol kapıları"

Yer: Yatırım section’ından hemen önce.

Mevcut yatırım section’ında seçenekler var ama para kontrolü yeterince görünmüyor. Bu yatırımcı için para nereye gidecek ve ne zaman durulacak sorusu kritiktir.

Önerilen başlık:

> Para tek seferde yakılmaz; kapı kapı kullanılır.

Önerilen metin:

> Yatırım tutarı peşin harcanacak bir bütçe değil, kontrol kapılarına bağlı işletme sermayesidir. Her harcama, ürün, saha ve gelir sinyaliyle birlikte açılır. Satıcı arzı oluşmazsa bölge daraltılır; gelir sinyali gelmezse işe alım yavaşlatılır.

Metafor:

> İnşaatta bütün parayı ilk gün harcamazsınız; temel, kaba inşaat, ince iş ve teslim kapı kapı ilerler. Bu yatırım da aynı disiplinle yürür.

Eksik component:

- `UseOfFundsWaterfall`
- `DrawdownSchedule`
- `BudgetGateCards`

Component alanları:

- Ürün geliştirme.
- Saha ekibi.
- Pazarlama.
- Hukuk/uyum.
- Ofis/operasyon.
- Yedek akçe.

Kontrol kapıları:

- 30 gün: şirket + ürün planı + pilot liste.
- 60 gün: ilk satıcı sözleşmeleri.
- 90 gün: doğrulanmış ilan + alıcı talebi.
- 180 gün: ücretli paket/giriş geliri.

### 4.7. Yeni Section: "Ortaklık ve yönetim modeli"

Yer: CPO ve yatırım arasında.

Amaç: Yatırımcı role, kontrol hakkına ve karar ritmine ihtiyaç duyar. "Ben paramı verdim, sonra ne olacak?" sorusunu kapatır.

Önerilen başlık:

> Karar yetkisi ve raporlama baştan belli olmalı.

Önerilen metin:

> Bu işte hız gerekir; ama kontrolsüz hız risk üretir. Bu nedenle ürün ve operasyon günlük olarak CPO yönetiminde yürür; yatırımcı tarafı bütçe, stratejik yön ve kritik ortaklık kararlarında düzenli rapor alır. İlk 6 ayda haftalık kısa rapor, ayda bir karar toplantısı önerilir.

Metafor:

> Saha ekibi yolda hızlı gider; ama rota, yakıt ve hedef her hafta kontrol edilir.

Eksik component:

- `GovernanceMatrix`
- `DecisionRightsTable`
- `MonthlyBoardPackPreview`

Karar matrisi:

| Konu | CPO | Yatırımcı | Ortak karar |
|---|---|---|---|
| Ürün yol haritası | Sorumlu | Bilgilendirilir | Kritik değişiklik |
| Bütçe | Hazırlar | Onaylar | Evet |
| Saha bölgesi | Önerir | Saha bilgisi verir | Evet |
| İşe alım | Yürütür | Limit onayı | Belirli eşik üstü |
| Stratejik ortaklık | Hazırlar | Değerlendirir | Evet |

### 4.8. Yeni Section: "Yatırımcının getirisi nasıl oluşur?"

Yer: Yatırım section’ı içinde veya hemen sonrasında.

Mevcut finansal modelde gelir, kâr ve değerleme var; fakat yatırımcı açısından "ben nasıl kazanırım?" daha açık olmalı.

Önerilen başlık:

> Yatırımcı getirisi üç yoldan oluşur: değer artışı, nakit üretimi, stratejik çıkış.

Önerilen metin:

> Bu yatırım kısa vadeli arsa al-sat yatırımı değildir. Platform yatırımıdır. Getiri, şirket değerinin artması, işin nakit üretmeye başlaması ve ileride stratejik yatırımcıya ya da daha büyük platforma satış ihtimaliyle oluşur.

Metafor:

> Bir arsayı alıp beklemek başka, o arsanın üstüne gelir üreten bir iş merkezi kurmak başkadır. Burada amaç sadece arsa ilanı değil, arsa piyasasının iş merkezini kurmaktır.

Eksik component:

- `InvestorReturnBridge`
- `ScenarioReturnCards`
- `ExitPathCards`

Gösterebilir:

- Hisse değeri senaryoları.
- Temettü/nakit dağıtımı olmayacaksa açık not.
- Yeni yatırım turu sonrası değerleme etkisi.
- Stratejik çıkış ihtimalleri.

Dil dikkat:

> Bu bölüm garanti getiri gibi yazılmamalı. "Senaryo", "varsayım", "değer artışı potansiyeli" dili kullanılmalı.

## 5. Mevcut Section Bazlı Eksik Componentler

### Section 01 - Karar Notu

Eksik: Yatırım özeti tek bakışta yok.

Eklenmeli:

- `OnePageInvestmentMemo`

Alanlar:

- Ne kuruyoruz?
- Kim için?
- Neden şimdi?
- Ne istiyoruz?
- İlk 90 gün ne göstereceğiz?
- Yatırımcının rolü ne?

Önerilen metin:

> Bugünkü hedef, bütün vizyonu tekrar anlatmak değil; kontrollü pilot için tutar, rol ve ilk 90 gün kararını netleştirmektir.

### Section 02 - Toplantı Özeti

Eksik: Önceki toplantılardan bugünkü karara geçiş zayıf.

Eklenmeli:

- `MeetingDecisionBridge`

Önerilen metin:

> İlk toplantıda bunun bir web sitesi değil, işletme modeli olduğunu konuştuk. İkinci toplantıda ürün, yönetim ve pazara giriş planını açtık. Üçüncü toplantıda finansal model, gider ve kadro ihtiyacını konuştuk. Bugünkü toplantı artık "olur mu?" değil, "hangi şartlarla başlarız?" toplantısıdır.

### Section 03 - Neden Ortak

Eksik: Yatırımcının özgül gücü çok genel kalıyor.

Eklenmeli:

- `InvestorAssetMap`

Component alanları:

- Saha itibarı.
- Arsa tecrübesi.
- Satıcı dili.
- Bölgesel ilişki.
- Nakit ve karar hızı.
- İlk kurucu satıcıları açabilecek sosyal sermaye.

Önerilen metin:

> Bu işte en pahalı şey yazılım değil, güvenilir ilk arzı toplamaktır. Sizin avantajınız burada başlar: satıcıyı, arsayı, bölgeyi ve pazarlık dilini bilmeniz.

### Section 04 - Problem

Eksik: Problem yatırımcının kendi günlük deneyimiyle bağlanmalı.

Eklenmeli:

- `FieldPainCards`

Örnek kartlar:

- "Alıcı parseli anlamadan arıyor."
- "Satıcı fiyatı komşudan duyduğu rakama göre koyuyor."
- "Aynı yer üç farklı ilanda farklı görünüyor."
- "Tapu ve imar bilgisi konuşmanın sonunda ortaya çıkıyor."

Önerilen metin:

> Bu sorunlar teknoloji sorunu değil, arsa işinin günlük sürtünmesidir. Teknoloji yalnız bu sürtünmeyi görünür ve yönetilebilir hale getirir.

### Section 05 - Çözüm / ParselQ

Eksik: Üç kullanıcı akışı ayrı gösterilmiyor.

Eklenmeli:

- `SellerFlow`
- `BuyerFlow`
- `RealtorFlow`
- `ProductScreenCarousel`

Önerilen üç kart:

1. Satıcı: Parselini yükler, güven dosyası oluşur, teklifleri görür.
2. Alıcı: Talep açar, uygun teklifleri karşılaştırır.
3. Emlakçı: Bölgedeki taleplere teklif verir, portföyünü yönetir.

Önerilen metin:

> ParselQ tek taraflı ilan uygulaması değil; satıcı, alıcı ve emlakçıyı aynı güven dosyasında buluşturan işlem öncesi hazırlık sistemidir.

### Section 06 - Pazar

Eksik: Yaşça büyük yatırımcı için TAM/SAM/SOM hâlâ fazla soyut.

Eklenmeli:

- `PlainMarketExplanation`
- `MarketMetaphorBox`

Önerilen metin:

> Önce bütün arazi haritasına bakıyoruz. Sonra dijitalde ulaşabileceğimiz bölgeyi ayırıyoruz. Sonra ilk hedeflediğimiz parselleri seçiyoruz. En sonunda bu hedefin yıllık gelir karşılığını hesaplıyoruz.

Metafor:

> Büyük harita, seçilen bölge, alınacak parsel, beklenen hasat.

Buton adları:

- `Pazar payı` yerine `Pazar büyüklüğü`
- `Aşama dönüşümü` yerine `Hesap oranları`

### Section 07 - İş Modeli

Eksik: Kim ödeme yapıyor, neden ödeme yapıyor, satış komisyonuyla neden çelişmiyor açık değil.

Eklenmeli:

- `MoneyFlowDiagram`

Alanlar:

- Satıcı: ilan, görünürlük, güven dosyası.
- Alıcı: talep/RFQ, rapor, teklif erişimi.
- Emlakçı: lead, teklif hakkı, CRM.
- Kurumsal: veri/API, reklam, bölge sponsorluğu.

Önerilen metin:

> Satıcı mülkünü sattığında platforma satış payı ödemez. Ücret, satışın kendisinden değil; görünürlük, güven dosyası, talep erişimi, veri ve iş akışı hizmetlerinden doğar.

### Section 08 - Gelir Modelleri

Eksik: Çok dolu. Final toplantıda ana mesaj kaybolabilir.

Yapılmalı:

- Ana ekranda 7 gelir akışı değil, önce 3 ana gelir ailesi gösterilmeli.
- Detay katalog appendix gibi açılmalı.

Eklenmeli:

- `RevenuePyramid`
- `CoreRevenueFamilies`

3 aile:

1. İlan ve görünürlük gelirleri.
2. Talep ve eşleştirme gelirleri.
3. Veri, SaaS ve operasyonel hizmet gelirleri.

Önerilen metin:

> Gelir modeli dağınık değildir; üç aileye ayrılır. Önce ilan ve görünürlük, sonra talep/eşleştirme, olgunlaştıkça veri ve SaaS gelirleri büyür.

### Section 09 - GTM

Eksik: Haftalık saha ritmi ve sorumlular.

Eklenmeli:

- `PilotCalendar`
- `FieldTeamDailyLoop`
- `TerritoryMap`

Önerilen metin:

> Her hafta aynı ritim çalışır: pazartesi hedef ilçe ve satıcı listesi, salı-çarşamba saha ziyareti, perşembe ilan dosyası ve doğrulama, cuma rapor ve kapanış takibi.

### Section 10 - Rekabet

Eksik: "470 modelden 15 silah" dili bu profil için fazla agresif ve soyut.

Yapılmalı:

- `silah`, `cephane`, `komando`, `mem savaşı` dili kaldırılmalı.
- "Büyüme playbook'u" veya "savunma planı" diline çevrilmeli.

Eklenmeli:

- `CompetitiveDefenseMap`

Önerilen metin:

> Rakibin gücü trafiktir. Bizim savunmamız arsa derinliği, doğrulanmış portföy, yerel saha ilişkisi ve güven dosyasıdır. Trafik satın alınabilir; güvenilir arsa stoğu ve satıcı ilişkisi bir günde kurulamaz.

### Section 11 - AI Operasyon

Eksik: AI anlatısı "teknoloji gösterisi" gibi algılanabilir.

Eklenmeli:

- `HumanInTheLoopDiagram`
- `AIDoesHumanDecidesCards`

Önerilen metin:

> AI burada patron değil, kalfa gibi çalışır. Belgeleri okur, eksikleri işaretler, fiyat bandı önerir, talepleri sıralar. Son karar ve sorumluluk insandadır.

Metafor:

> Usta kararı verir; kalfa işi hızlandırır.

### Section 12 - İK Planı

Eksik: 256 kişi yatırımcıya büyük gelebilir; neden ve ne zaman alınacağı kapılarla anlatılmalı.

Eklenmeli:

- `HiringGateCards`
- `HeadcountWhyNow`

Önerilen metin:

> 256 kişi ilk gün alınacak ekip değildir. Kadro, gelir ve saha sinyali geldikçe açılır. Her işe alım bir kapıya bağlıdır: ilan stoğu, talep sayısı, gelir sinyali, operasyon yükü.

### Section 13 - Başabaş

Eksik: Finansal tablo fazla, yatırımcı karar özeti eksik.

Eklenmeli:

- `ThreeNumberFinanceBoard`

Üç sayı:

- Başlangıç sermayesi.
- Başabaşa kadar ihtiyaç.
- Kasa güven marjı.

Önerilen metin:

> Finansal modelin ilk sorusu kâr değil, kasa güvenidir: para ne kadar dayanır, hangi ay başabaş gelir, hangi kapıda harcama yavaşlatılır?

### Section 14 - Risk

Eksik: İtibar ve ortaklık riski yok.

Eklenmeli:

- `ReputationRiskCard`
- `PartnerConflictRiskCard`
- `LegalLiabilityRiskCard`

Yeni risk satırları:

| Risk | Ölçüm | Karar kapısı | Aksiyon |
|---|---|---|---|
| Yatırımcının itibarı zarar görür | Şikayet, sahte ilan, yanlış değerleme vakası | İlk ciddi olay | Manuel inceleme, hukuk onayı, yayın durdurma |
| Ortaklıkta karar çatışması | Onay bekleyen kritik karar sayısı | 7 günü aşarsa | Yetki matrisi ve yönetim toplantısı |
| Yanlış değerleme beklenti yaratır | Değerleme itiraz oranı | Eşik üstü | "Bilgilendirme amaçlı" etiket, eksper ortaklığı |

### Section 15 - Teknopark

Eksik: Yatırımcı için "bana ne sağlar?" daha net olmalı.

Eklenmeli:

- `TaxBenefitPlainLanguage`

Önerilen metin:

> Teknopark, yazılım gelirinden doğan vergi yükünü azaltır. Bu, işin gelirini artırmaz; ama aynı gelirden şirkette daha fazla nakit kalmasını sağlar.

Metafor:

> Aynı cirodan daha az fire vererek kasaya daha çok ürün bırakmak.

### Section 16 - CPO

Eksik: Şartlar kişisel talep gibi algılanabilir; deliverable/KPI ile bağlanmalı.

Eklenmeli:

- `CpoDeliverables`
- `RoleCommitmentMatrix`

Önerilen metin:

> Bu paket kişisel konfor kalemi değil, tam zamanlı sorumluluk modelidir. Karşılığı ürün teslimi, ekip kurulumu, saha pilotu, yatırımcı raporlaması ve ilk gelir sinyalidir.

KPI:

- 30 günde ürün planı ve teknik mimari.
- 60 günde pilot saha operasyonu.
- 90 günde doğrulanmış ilan ve RFQ sinyali.
- Aylık yatırımcı raporu.

### Section 17 - Yatırım

Eksik: Önerilen seçenek daha güçlü işaretlenmeli.

Mevcut üç seçenek var, ama final toplantıda eşit ağırlıklı görünmemeli. Yatırımcıya öneri net verilmelidir.

Eklenmeli:

- `RecommendedInvestmentCard`
- `UseOfFundsByOption`
- `InvestorControlRights`

Önerilen metin:

> Önerimiz stratejik seçenektir. Çünkü sadece yazılımı değil, pilot saha operasyonunu ve ilk gelir sinyalini de finanse eder. Çekirdek seçenek ürünü başlatır ama saha ispatını zayıf bırakır; lider seçenek ise ölçek için güçlüdür fakat ilk karar için daha ağır olabilir.

### Section 18 - İlk 30 Gün

Eksik: 30 gün var ama 90 gün yatırımcı kanıtı yok.

Eklenmeli:

- `First30First90Plan`
- `NextMeetingChecklist`

Önerilen metin:

> Bugünkü karar evetse, ilk 30 gün şirket, ürün ve pilot hazırlığıdır. İlk 90 gün ise sahada kanıt üretme dönemidir: doğrulanmış ilan, satıcı görüşmesi, alıcı talebi ve ilk gelir sinyali.

Kapanış soruları:

1. Hangi yatırım seçeneğiyle ilerliyoruz?
2. İlk pilot ilçeyi birlikte seçiyor muyuz?
3. Yatırımcı rolü: pasif ortak mı, stratejik ortak mı?
4. İlk 30 gün için harcama limiti nedir?
5. Bir sonraki toplantıda hangi raporu görmek istiyorsunuz?

## 6. Appendix'e Alınması Gerekenler

Final toplantıda ana akışı yavaşlatan alanlar appendix'e alınmalı:

- 08 Gelir modellerindeki tüm gelir kataloğu.
- 10 Rekabet içindeki 470 model/15 strateji listesi.
- 13 Başabaş içindeki tüm chart tabları.
- 15 Teknopark teknik mevzuat ayrıntıları.
- 12 İK planındaki detay departman kırılımları.

Ana sunumda bunların kısa karar özeti kalmalı. Detay sorulursa açılmalı.

## 7. Final Toplantı İçin Önerilen Akış

Mevcut 18 section yerine final toplantıda şu üst akış kullanılmalı:

1. Bugünkü karar.
2. Bu iş sizin bildiğiniz emlak işinin dijital şubesidir.
3. Neden bu yatırımcı doğru ortak.
4. Problem: arsa dijitalde güven dosyası ister.
5. Ürün: ParselQ satıcı, alıcı ve emlakçı akışı.
6. Yetki ve sorumluluk sınırı.
7. Pazar büyüklüğü.
8. İş modeli: kim neden ödeme yapar.
9. İlk 90 gün saha pilotu.
10. Satıcı ve emlakçı ağı.
11. Rekabet ve savunma.
12. AI ve insan denetimi.
13. İK planı: kadro kapıları.
14. Finans: para, başabaş, kasa güveni.
15. Risk ve kontrol kapıları.
16. Teknopark ve teşvik.
17. CPO rolü ve teslimatlar.
18. Yatırım seçenekleri.
19. Ortaklık ve yönetim modeli.
20. İlk 30-90 gün karar listesi.

Bu akış 20 section gibi görünse de bazı mevcut uzun bölümler appendix'e taşınırsa toplantı daha kısa ve anlaşılır olur.

## 8. Dil Talimatı

Bu yatırımcı için kullanılacak dil:

- "Yazılım" yerine gerektiğinde "dijital işletme sistemi".
- "AI-first" yerine "AI destekli, insan denetimli".
- "GTM" yerine "pazara giriş ve saha planı".
- "RFQ" yerine "alıcı talebi ve teklif akışı".
- "SOM" yerine ilk geçişte "ulaşılabilir hedef pazar".
- "Take rate" yerine "gelirleştirme oranı".
- "Strategy arsenal" yerine "büyüme playbook'u".
- "Cephane/silah/komando" kullanılmamalı.

Basit metaforlar:

- Pazar: büyük harita → seçilen bölge → alınacak parsel → beklenen hasat.
- Ürün: dijital tapu dosyası.
- AI: usta karar verir, kalfa işi hızlandırır.
- Pilot: önce tarlaya tohum atılır.
- Yatırım: inşaat gibi kapı kapı harcanır.
- Platform: arsa piyasasının dijital iş merkezi.

## 9. En Kritik 10 Eksik

1. "Bu iş sizin bildiğiniz emlak işidir" bridge section'ı.
2. Yetki/sorumluluk/hukuk sınırı.
3. İlk 90 gün saha planı.
4. Satıcı ve emlakçı edinim funnel'ı.
5. Alıcı RFQ/teklif akışı.
6. Paranın kullanımı ve harcama kapıları.
7. Ortaklık/yönetim/karar hakkı matrisi.
8. Yatırımcı getiri ve çıkış mantığı.
9. CPO teslimat/KPI component'i.
10. Appendix ayrımı: gelir kataloğu, strateji listesi ve finans tabları ana akıştan ayrılmalı.

## 10. Kısa Sonuç

Mevcut sunum "neden büyük fırsat" sorusunu cevaplıyor. Final toplantı için "neden bu yatırımcı, neden şimdi, nasıl kontrollü başlarız, para nasıl korunur, ilk sahada ne göreceğiz" sorularını daha açık cevaplamalı.

Bu yatırımcı teknolojiye yatırım yapmıyor gibi hissetmeli; kendi bildiği arsa işinin dijitalde daha kontrollü, daha ölçülebilir ve daha büyük ölçekli haline ortak olduğunu hissetmeli.
