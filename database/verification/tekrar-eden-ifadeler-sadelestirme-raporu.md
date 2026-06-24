# Tekrar Eden Ifadeler ve Sadelestirme Raporu

Tarih: 2026-06-24  
Kapsam: `/Users/karaca/Documents/sonbirarsa/database`, `landing/src`, `raporlar`, `database/verification`

## Yonetici Ozeti

Bu projede tekrar sorunu sadece "aynı cümle iki kez yazılmış" problemi değildir. Daha büyük sorun, bazı karar cümlelerinin, KPI'ların ve veri anlamlarının birden fazla dosyada ayrı ayrı sahiplenilmesidir. Bu durum yatırımcı sunumunda iki risk üretir:

1. Yatırımcı aynı fikri tekrar tekrar okur ve sunum "güçlü vurgu" yerine "kendini ispatlamaya çalışan metin" gibi görünür.
2. Aynı sayı farklı bağlamlarda yaşadığı için, küçük bir güncelleme sonrası metrikler birbirinden kopar.

En kritik bulgu: `database/data/*.json` hesap/veri kaynağı olmalı, `database/sections/*.json` aynı veriyi statik tablo/kart olarak yeniden yazmamalıdır. Section dosyaları kısa bağlam, yatırımcı dili ve `dataRef`/`valueRef` bağlantısı taşımalıdır.

Canlı yatırımcı sunumunda korunması gereken tekrarlar vardır: `güven dosyası`, `doğrulanmış ilan`, `saha`, `satıcı arzı`, `ilk 90 gün`, `karar kapısı`, `kontrollü pilot`. Bunlar hedef yatırımcının emlak refleksiyle uyumludur. Buna karşılık birebir paragraf tekrarları, "kesin" dili, `web sitesi değil` savunması, `komisyonsuz` açıklamasının gereğinden fazla dönmesi ve aynı KPI'nın farklı dosyalarda düz string olarak tutulması temizlenmelidir.

## Yontem

Bu rapor test-first mantıkla hazırlandı:

- Otomatik metin taraması: 121 dosyada 2742 anlamlı metin parçası çıkarıldı.
- Exact duplicate taraması: birebir aynı cümle, başlık, kart etiketi ve uzun açıklama tekrarları listelendi.
- Regex odaklı tarama: `güven dosyası`, `RFQ`, `komisyonsuz`, `%35`, `TAM/SAM/SOM`, `ilk 90`, `256`, `başabaş`, `teknopark`, `yatırımcı`, `kontrol kapısı` kümeleri incelendi.
- Validator kontrolü: `python3 database/_build/validate.py` çalıştırıldı. Sonuç: 25 başarı, 21 uyarı, 1 hata.
- Paralel agent denetimi: canlı agent limiti nedeniyle iş dalgalar halinde yürütüldü. Karar akışı, ortaklık/problem/çözüm, pazar/rekabet, gelir modeli, GTM/ilk 90 gün, İK/CPO, finans/teşvik, risk/sermaye/yönetişim/getiri, data canon, verification raporları, React component tekrarları ve üst anlatı ayrı ayrı denetlendi.

Validator'un kritik hatası: `accordion-groups` içinde `emlak-dijital-sube` bölümü hiçbir grupta yok; bu nedenle render edilmez. Bu doğrudan tekrar problemi değildir, ama içerik çoğaldıkça tek akış disiplininin bozulduğunu gösterir.

## Tekrar Siniflandirmasi

### A. Korunacak Stratejik Cipa Tekrarlari

Bu tekrarlar yatırımcı güvenini artırır, tamamen silinmemelidir:

- `güven dosyası`
- `doğrulanmış ilan`
- `saha`
- `satıcı arzı`
- `ilk 90 gün`
- `kontrol kapısı`
- `karar kapısı`
- `kontrollü pilot`
- `raporlama`

Kural: Ana kavram tekrarlanabilir, aynı cümle tekrarlanamaz. Her dönüşte yeni kanıt gelmelidir: önce tanım, sonra ürün, sonra saha, sonra finans, sonra risk kontrolü.

### B. Kesilecek Yanki Tekrarlari

Bu tekrarlar yatırımcı gözünde kopyala-yapıştır hissi üretir:

- Aynı title cümlesinin ilk heading olarak tekrar edilmesi.
- Aynı paragrafın iki farklı section'da birebir kullanılması.
- Aynı KPI değerinin `metrics`, `data`, `section` ve component içinde düz string olarak tutulması.
- "Web sitesi değil" kalıbının birden fazla bölümde savunma cümlesi gibi dönmesi.
- "Kesin", "yasal-kesin", "avantaj kesin doğar" gibi hukuki kesinlik dilinin tekrar edilmesi.
- "Komisyon yok / satıştan pay almayız" cümlesinin gelir kalemiyle birlikte açıklanmadan tekrarlanması.

### C. Kabul Edilebilir Arşiv Tekrarlari

`database/verification/*.md` ve bazı `raporlar/*.md` dosyalarında tekrarlar audit izi olarak kalabilir. Bunlar canlı UI kaynağı değildir.

Kural: Verification dosyaları silinmemeli; ancak canlı içerik yazılırken bu raporlardaki uzun prompt blokları ve önerilen UI metinleri doğrudan kaynak kabul edilmemelidir.

### D. Teknik Tekrarlar

React tarafında aynı tablo, kart, rozet, chart fallback ve field-row desenleri farklı componentlerde elle kurulmuş. Bu yatırımcı metni kadar acil değildir ama mobile/erişilebilirlik ve bakım maliyeti için ayrı refactor gerektirir.

## P0 Bulgular

### 1. `03` ve `03a` Arasinda Birebir Bolum Tekrari Var

`03-neden-ortak.json` içinde "Bu iş sizin bildiğiniz emlak işinin dijital şubesidir" bloğu ve devamındaki paragraf, tablo ve kapanış cümlesi `03a-emlak-dijital-sube.json` içinde birebir tekrar ediyor.

Kanıt:

- `/Users/karaca/Documents/sonbirarsa/database/sections/03-neden-ortak.json:117`
- `/Users/karaca/Documents/sonbirarsa/database/sections/03-neden-ortak.json:123`
- `/Users/karaca/Documents/sonbirarsa/database/sections/03a-emlak-dijital-sube.json:25`
- `/Users/karaca/Documents/sonbirarsa/database/sections/03a-emlak-dijital-sube.json:31`

Karar:

- `03-neden-ortak`: yalnızca yatırımcı neden doğru ortak sorusunu cevaplamalı.
- `03a-emlak-dijital-sube`: "klasik emlak işi -> dijital karşılığı" metaforunun tek sahibi olmalı.
- `03` içindeki birebir dijital şube bloğu kaldırılmalı veya tek cümlelik köprüye indirilmeli.

### 2. Data JSON Varken Section Icindeki Statik Tablolar Ayni Veriyi Tekrarliyor

Risk, sermaye, yönetişim, getiri ve yatırım seçenekleri tarafında data dosyaları zaten var. Buna rağmen section dosyaları aynı bilgiyi tekrar statik kart/tablo olarak yazıyor.

Tek kaynak kararları:

| Alan | Tek kaynak | Section'da kalacak işlev |
|---|---|---|
| Risk kapıları | `database/data/risk-gates.json` | Kısa anlatı + `riskGateMatrix` |
| Sermaye kapıları | `database/data/capital-gates.json` | Kısa framing + `capitalReleasePlan` |
| Yönetişim matrisi | `database/data/governance-matrix.json` | İlke, metafor, dataRef |
| Yatırımcı getirisi | `database/data/investor-return-scenarios.json` | Kısa çerçeve + `investorReturnModel` |
| Yatırım seçenekleri | `database/data/investment-options.json` | Öneri dili + `investmentOptionsCompare` |

Temizlik kararları:

- `14-risk.json` içindeki statik risk kartları/table, `risk-gates.json` üzerinden render edilmeli.
- `16a-paranin-kullanimi.json` içindeki timeline, `capital-gates.json` üzerinden türetilmeli.
- `16b-ortaklik-yonetim.json` içindeki statik tablo kaldırılmalı; eksik "Stratejik işbirliği" satırı gerekiyorsa `governance-matrix.json` içine taşınmalı.
- `16c-yatirimci-getiri.json` içindeki üç getiri kartı, `investor-return-scenarios.json.paths` ile aynı işi yapıyor; kaldırılmalı.
- `17-yatirim.json` içindeki yatırım seçeneği kartları, `investment-options.json.options` üzerinden render edilmeli.

### 3. KPI ve Finans Kaanonu Split-Brain Durumunda

`shared/metrics.json` kendini tek kaynak gibi konumlandırıyor, fakat birçok sayı `data/*.json`, `sections/*.json` ve component içinde düz string olarak tekrar tutuluyor.

Riskli kümeler:

- `5,5 milyar ₺`
- `%35`
- `%18,7`
- `40 milyon ₺`
- `~32,5 milyon ₺`
- `TAM/SAM/SOM`
- `38 -> 256`
- `256 kişi`
- `teknopark vergi avantajı`

Karar:

- Hesap ve seri kanonu: `database/data/*.json`
- Headline/display metrikleri: generated veya sıkı bağlı `database/shared/metrics.json`
- Section metni: mümkün olduğunda `{{metric:...}}` veya component `valueRef`
- UI component: iş verisi tutmamalı; sadece layout, format ve kısa label üretmeli.

### 4. Finansal Terimler Ayni Gibi Okunuyor Ama Ayni Sey Degil

Finans agent'i şu ayrımları riskli buldu:

- Vergi avantajı: `financial-frames` medyan yaklaşık 109M derken `metrics.tax.saving_2027` yaklaşık 101M, `tax.saving_mature_annual` yaklaşık 120M. Bunlar farklı dönem/senaryo ise adları ayrışmalı.
- Başabaş harcaması: `financial-breakdown.description` yaklaşık 15M derken `cumSpendToBE` 20,5M, seri kesişimde kümülatif gider 23,4M, `metrics.capital.breakeven_spend` yaklaşık 32M. Bunlar aynı başlık altında okunmamalı.
- `metrics.fin.breakeven_months` 18 ay; model başlangıcı Temmuz 2026 ve başabaş Ocak 2027 ise yaklaşık 6 ay gibi okunuyor. Burada "operasyonel başabaş", "yatırım geri dönüşü" ve "kasa dibi" ayrı isimlenmeli.
- `financial-detail.monthly2026` ile `financial-breakdown.monthly2026` aynı isim altında farklı ay/rakam seti taşıyor.

Karar:

- "Başabaş ayı", "başabaşa kadar kümülatif gider", "kasa dibi", "yatırım geri dönüş süresi" ayrı metrik adlarıyla tutulmalı.
- `financial-frames.json` sayısal kanon olmamalı; sadece yatırımcı karar soruları ve okuma lensleri taşımalı.

### 5. Ilk 90 Gun KPI'lari Farkli Yerlerde Farkli Degerlerle Donuyor

`first-90-days.json`, `09a-ilk-90-gun.json`, `09-gtm.json` ve `investor-dashboard.json` arasında KPI anlamları karışıyor.

Riskli örnekler:

- `300 doğrulanmış aktif ilan`: `09a` içinde 90 gün başarı kriteri, `09-gtm` içinde ilk yıl hedefi gibi okunuyor.
- `Alıcı talebi`: `first-90-days.json` D90 değeri 150, `09a` statGrid değeri `>=80`.
- Satıcı KPI'ları: `Kurucu satıcı adayı 300`, `Sıcak satıcı görüşmesi 120`, `Görüşülen satıcı >=150`, `Açılan satıcı hesabı >=120` aynı funnel mı, ayrı funnel mı belirsiz.
- `İlk ücretli paket`: data içinde `10+`, section metninde "ilk gelir" gibi daha gevşek.

Karar:

- `first-90-days.json` tek KPI kanonu olmalı.
- `09a` statGrid kaldırılmalı veya doğrudan `first-90-days.json` üzerinden render edilmeli.
- `09-gtm` içinde `300` geçecekse "ilk 90 gün" mü, "ilk yıl" mı açık yazılmalı.

### 6. HR/Kadro Kanonu Eski ve Yeni Model Arasinda Karisik

`hr-master-256.json` kaynak extract olarak "yetkili" görünüyor, ama agresif pitch kanonu başka dosyalarda `38, 92, 140, 185, 225, 256` olarak yaşıyor.

Karar:

- Güncel pitch kanonu: `hr-by-year.json` yıl toplamları + `hr-plan.json` departman/AI anlatısı.
- `hr-master-256.json` master extract olarak kalacaksa adı ve açıklaması "legacy/source extract" gibi ayrıştırılmalı.
- `12-ik-plani.json` aynı `256 kişi` fikrini birkaç kez anlatıyor; tek güçlü "kapı kapı büyüme" paragrafı kalmalı.

### 7. Manifest ve Render Akisi Guncel Envanteri Yansitmiyor

Gerçek dosya durumu:

- `database/data/*.json`: 22 dosya
- `database/sections/*.json`: 28 dosya
- Validator: 59 JSON parse edildi

Manifest tarafında eski özetlerin kalması ve `accordion-groups` içinde `emlak-dijital-sube` bölümünün gruba bağlanmaması, içerik mimarisinde "elle yönetilen indeks" riskini gösteriyor.

Karar:

- Manifest envanteri generated olmalı veya build sırasında doğrulanmalı.
- `accordion-groups.json` tek ana akış sahibi olmalı.
- Section eklenince validator hem "dosya var" hem "accordion içinde var" kontrolünü zorunlu tutmalı.

### 8. Pazar Bolumunde UI Etiketi Model Anlamiyla Celisiyor

UI tarafında "Gelir / SOM · take rate" ifadesi kullanılıyor. Data tarafı ise gelirin yalnız take rate olmadığını, çok-akışlı yıllık gelir olduğunu söylüyor.

Karar:

- "Gelir / SOM" sekmesi "çok-akışlı monetizasyon oranı" diye açıklanmalı.
- `Aşama dönüşümü` metni "huni daralma yüzdesi" gibi teknik kalmamalı; yatırımcı için "pazarın nereden nereye daraldığını gösterir" diline çevrilmeli.
- TAM/SAM/SOM anlatısı `market-tam-sam-som.json` içinde tek kaynak olmalı; UI sadece daha anlaşılır label üretmeli.

## P1 Bulgular

### Title ve Heading Tekrari

Birçok section'da `title.text` aynı metinle ilk `heading` olarak tekrar ediyor. Bu metadata düzeyinde normal olabilir; fakat renderer ikisini de gösteriyorsa kullanıcı aynı cümleyi iki kere okur.

Kural:

- `title.text`: nav, accordion header, SEO/meta.
- İlk `heading`: title'dan farklı bir açıcı hüküm veya hiç yok.
- Aynı cümle iki görünür yerde basılmamalı.

### Karar Ozeti Fazla Dagilmis

`01`, `02`, `18`, `accordion-groups.decisionBox` ve `investor-dashboard` aynı "tutar, rol, ilk 90 gün" çerçevesini tekrar ediyor.

Karar:

- Üst karar kutusu: `accordion-groups.decisionBox`
- Toplantı geçmişi: `02-toplanti-ozeti`
- Kapanış: `18-ilk-30-gun`
- KPI snapshot: `investor-dashboard`

`01` sadece "bugünkü sunumun amacı" olmalı; `18` kapanışta aynı maddeyi yeniden anlatmak yerine karar metnini imzaya yaklaştırmalı.

### Guven Dosyasi Kumesi Dogru Ama Dagilmis

`03a`, `04`, `05`, `07`, `09`, `09b`, `10`, `14` içinde `güven dosyası` tekrar ediyor. Kavram doğru, ancak her yerde aynı işlevi görmemeli.

Dağılım:

- `04`: problem tarafı - güven dosyası yok.
- `05`: ürün tarafı - güven dosyası nasıl oluşur.
- `09b`: satıcı kazanımı - ücretsiz ilk güven dosyası teklifidir.
- `10`: savunma - rakibin kolay kopyalayamayacağı saha/veri standardıdır.
- `14`: risk - sahte ilan/yanlış evrak itibar riskidir.

### Komisyonsuz Model ve RFQ Fazla Aciklaniyor

`07`, `07a`, `08`, `revenue-drivers` ve `strategy-md` RFQ/talep/teklif fikrini taşıyor.

Sahiplik:

- `07-model`: iş modeli ilkesi, yani kim neden ödeme yapar.
- `07a-alici-rfq`: kullanıcı akışı, yani alıcı talebi nasıl açılır.
- `08-gelir-modelleri`: monetizasyon, yani hangi gelir doğar.
- `revenue-drivers.json`: KPI sürücüleri, yani hangi metrik büyütür.

`07` içinde RFQ uzun paragraf olmamalı; sadece `07a` ve `08`e köprü olmalı.

### Gelir Modeli Bolumu Sismis

`08-gelir-modelleri.json` hem paket karşılaştırması, hem üç gelir ailesi, hem yedi gelir akışı, hem uzun gelir katalogu taşıyor. Bu tek section içinde yatırımcıyı yoruyor.

Karar:

- Ana sunumda: paket tablosu, üç gelir ailesi, yedi akış grafiği.
- Appendix: uzun gelir katalogu, lisanslı/gelecek opsiyonlar, hukuki notlar.
- "Komisyon" içeren opsiyonlar core modelden ayrıştırılmalı; yoksa "komisyonsuz" vaadiyle çelişir.

### Teknopark Kesinlik Dili Fazla Sert

`15-teknopark` ve `13-basabas` içinde "mekanizma yasal-kesin", "avantaj kesin doğar" gibi tekrarlar var.

Yatırımcı için daha güvenli ifade:

> Şirket teknopark şartlarını sağladığında yazılım gelirlerinde vergi avantajı oluşur. Avantajın mekanizması mevzuata bağlıdır; TL etkisi kazanç düzeyine ve dönemsel şartlara göre modelde hesaplanır.

### AI/Kalfa Metaforu Bir Kez Yeter

`11-ai-operasyon` içinde "AI patron değil, kalfa" fikri doğru ama birkaç kez dönüyor.

Karar:

- Tek metafor cümlesi kalsın.
- Sonra somut tablo gelsin: hangi iş hızlanır, hangi karar insanda kalır, hangi risk kontrol edilir.

### CPO Calisma Sartlari Tekrari

`16-cpo` içinde tam zamanlı odak, sabit ücret, mobilite ve aile dahil sağlık sigortası birkaç formatta dönüyor.

Karar:

- Stat grid: maaş, araç/mobilite, aile dahil tam kapsamlı özel sağlık sigortası.
- Lead: neden tam zamanlı odak gerektiği.
- Kapanış: karşılığındaki teslimatlar.
- Aynı yan haklar paragraf içinde tekrar edilmemeli.

## UI/Component Tekrarlari

Kullanıcıya görünen içerik tekrarları kadar, component tarafında da merkezi yapı eksikliği var.

Bulgu:

- `ChartViews.tsx` içinde desktop tablo + mobil kart pattern'i tekrar tekrar elle kuruluyor.
- `Blocks.tsx` içinde `MobileTableCards` var, ancak chart view'lar bu merkezi deseni tam kullanmıyor.
- `Line`, `Field`, `Row` aynı label/value fikrinin farklı componentlerde ayrı implementasyonu.
- `Badge/chip` desenleri dağınık: claim tag, KPI class, role chip, severity chip, önerilen rozeti, period chip.
- `charts.ts` içinde grid, legend, tooltip, axis, label kalıpları her chart option factory'de tekrar ediyor.
- `escapeRegExp` iki ayrı dosyada var.

Önerilen merkezi yapılar:

- `ResponsiveDataTable`: desktop table + mobile card tek API.
- `ChartTableView`: ECharts + fallback tablo + mobile kart düzeni.
- `FieldRow` / `FieldList`: label/value satırı standardı.
- `InfoCard` / `MetricCard`: ortak kart iskeleti.
- `PillBadge`: claim, role, severity, period, recommended varyantları.
- `copy/labels.ts`: `Yıl`, `Gelir`, `Gider`, `Net`, `Sorumlu`, `Aksiyon`, `Kırmızı bayrak`, senaryo adları.
- `format.ts`: para, yüzde, kişi, signed money, compact number formatter.

## Arşiv ve Rapor Tekrarlari

Verification dosyalarında tekrarların çoğu kabul edilebilir audit izidir. Ancak uzun "Claude'a verilecek prompt" blokları farklı raporlarda benzer biçimde tekrar ediyor.

Karar:

- Verification raporları silinmesin.
- Uzun prompt blokları ana rapor gövdesinde çoğaltılmasın.
- Canlı UI metinleri için Markdown raporları kaynak yapılmasın.
- `raporlar/` altında eski canon taşıyan dosyalar arşiv etiketi almalı veya güncellenmeli.
- Uygulama sonrası raporlar UI metnini yeniden yazmak yerine slug/component referansı vermeli.

## Tek Kaynak Sahiplik Haritasi

| Konu | Sahip dosya | Diger dosyalarin rolu |
|---|---|---|
| Ana karar kutusu | `data/accordion-groups.json` | Section'lar tekrar etmez, karar kutusuna bağlanır |
| Toplantı geçmişi | `sections/02-toplanti-ozeti.json` | `01` ve `18` sadece referans verir |
| Yatırımcı neden doğru ortak | `sections/03-neden-ortak.json` | `03a` aynı paragrafı tekrar etmez |
| Dijital şube metaforu | `sections/03a-emlak-dijital-sube.json` | Tek sahip; `03` kısa köprü verir |
| Problem/güven boşluğu | `sections/04-problem.json` | Ürün tarafı burada anlatılmaz |
| ParselQ çözüm/güven dosyası | `sections/05-cozum.json` | Yetki sınırı `05a`da kalır |
| Yetki/sorumluluk sınırı | `sections/05a-yetki-sorumluluk.json` | `05` hukuki sınırı tekrar etmez |
| TAM/SAM/SOM | `data/market-tam-sam-som.json` | UI yalnız anlaşılır label üretir |
| Rekabet savunması | `sections/10-rekabet.json` | `98` uygulama playbook'u olur |
| Ham strateji envanteri | `data/strategy-md.json` | Sunuma doğrudan ağır jargon taşınmaz |
| Sunum playbook seçkisi | `data/strategy-arsenal.json` | `98` bu seçkiyi gösterir |
| İş modeli | `sections/07-model.json` | RFQ detayına girmeden köprü verir |
| RFQ ürün akışı | `sections/07a-alici-rfq.json` | Gelir hesabı burada anlatılmaz |
| Gelir modeli | `sections/08-gelir-modelleri.json` + `data/revenue-drivers.json` | Uzun katalog appendix'e gider |
| GTM ritmi | `sections/09-gtm.json` | İlk 90 KPI burada tekrarlanmaz |
| İlk 90 KPI | `data/first-90-days.json` | `09a` bu data'yı render eder |
| Satıcı/emlakçı ağı | `sections/09b-satici-emlakci-agi.json` | `09` kısa referans verir |
| AI operasyon | `sections/11-ai-operasyon.json` | "AI patron değil" tek kez |
| Kadro planı | `data/hr-by-year.json`, `data/hr-plan.json` | `12` kısa okuma metni verir |
| Başabaş/finans seri | `data/financial-breakdown.json`, `data/financial-model.json` | `13` karar sorusuna odaklanır |
| Finans okuma lensleri | `data/financial-frames.json` | Sayı kanonu olmaz |
| Risk kapıları | `data/risk-gates.json` | `14` dataRef |
| Teknopark/teşvik | `data/incentives.json` | `15` kesinlik dilini yumuşatır |
| CPO şartları | `sections/16-cpo.json`, ilgili metric refs | Tek stat grid + teslimat çerçevesi |
| Sermaye kapıları | `data/capital-gates.json` | `16a` dataRef |
| Yönetişim | `data/governance-matrix.json` | `16b` dataRef |
| Getiri senaryosu | `data/investor-return-scenarios.json` | `16c` dataRef |
| Yatırım seçenekleri | `data/investment-options.json` | `17` dataRef |
| İlk 30 gün kapanış | `sections/18-ilk-30-gun.json` | Karar kutusunu tekrar yazmaz |

## Section Bazli Temizlik Listesi

### `01-karar-notu.json`

- "Web sitesi değil" çerçevesi bir kez kalabilir.
- Tutar/rol/ilk 90 gün maddeleri `accordion-groups.decisionBox` ile çakışıyorsa kısaltılmalı.
- İlk 90 KPI özeti buradan çıkarılmalı; `investor-dashboard` veya `first-90-days` sahiplenmeli.

### `01b-yatirimci-panosu.json`

- "Her KPI'nın türü belli" fikri title, heading ve lead içinde tekrar ediyorsa sadeleştirilmeli.
- Sayısal KPI'lar düz string değil `valueRef` kullanmalı.

### `02-toplanti-ozeti.json`

- Toplantı geçmişinin tek sahibi olmalı.
- `01` ve `18` içinde toplantı geçmişi tekrar anlatılmamalı.

### `03-neden-ortak.json`

- `03a` ile birebir aynı dijital şube bloğu kaldırılmalı.
- Bu section yatırımcı ölçeği, saha refleksi, portföy güveni ve bölgesel hakimiyet gerekçesine odaklanmalı.

### `03a-emlak-dijital-sube.json`

- Dijital şube metaforunun tek sahibi olmalı.
- Aynı tablo başka section'da tekrar edilmemeli.

### `04-problem.json`

- Problem: arsa dijitalde güven maliyeti yüksek üründür.
- Çözüm detayına ve "tek panel/güven dosyası" tekrarına kaymamalı.

### `05-cozum.json`

- Güven dosyasının ürün karşılığı burada kalmalı.
- Tapu/SPK/lisans sınırı `05a`ya bırakılmalı.
- RFQ sadece ürün kapısı olarak anılmalı; gelir detayına dönmemeli.

### `05a-yetki-sorumluluk.json`

- "Platform ne yapar, devlet/lisanslı kurum ne yapar?" sorusunun tek sahibi olmalı.
- `05` içindeki hukuki sınır tekrarları buraya taşınmalı.

### `06-pazar.json`

- `%35`, TAM/SAM/SOM ve pazar hunisi tek kanona bağlanmalı.
- Harita/bölge/parsel/hasat metaforu bir kez kullanılmalı.
- Playbook/rekabet savunması `10` ve `98`e bırakılmalı.

### `07-model.json`

- Komisyonsuz model bir güçlü açıklamada kalmalı.
- RFQ uzun anlatısı `07a` ve `08`e köprü olarak kısaltılmalı.

### `07a-alici-rfq.json`

- Alıcı talebi ürün akışının tek sahibi.
- Monetizasyon anlatısı ve gelir akışı grafiği burada olmamalı.

### `08-gelir-modelleri.json`

- Ana sunumda paket, üç gelir ailesi ve yedi akış kalmalı.
- Uzun gelir katalogu appendix'e ayrılmalı.
- "Komisyon" içeren gelecekteki opsiyonlar core komisyonsuz anlatıdan ayrıştırılmalı.

### `09-gtm.json`

- Saha ritmi, ilçe yayılımı ve satıcı ağı hareket planının sahibi.
- İlk 90 KPI değerleri burada tekrar edilmemeli.

### `09a-ilk-90-gun.json`

- `first-90-days.json` dışındaki statGrid kaldırılmalı.
- 300/150/120/80 değerleri tek funnel mantığıyla yeniden adlandırılmalı.

### `09b-satici-emlakci-agi.json`

- Satıcı/emlakçı ağının tek sahibi.
- `09` içinde sadece kısa referans kalmalı.

### `10-rekabet.json`

- Rakip savunma tezi bir kez konsolide edilmeli.
- "Kolay kopyalayamaz" gibi iddialı cümleler kanıt/metrik olmadan tekrar edilmemeli.

### `11-ai-operasyon.json`

- "AI patron değil, kalfa" metaforu tek kez.
- Tekrar yerine rol dağılımı: AI hızlandırır, insan onaylar, hukuk sınırlar.

### `12-ik-plani.json`

- `256 kişi` fikri tek güçlü paragrafta kalmalı.
- Kadro eğrisi chart/dataRef üzerinden gelmeli.
- İşe alım kapıları tekrar edilmemeli; tek gate listesi yeter.

### `13-basabas.json`

- Grafik + tablo caption kalıbı azaltılmalı.
- Başabaş, kasa dibi, yatırım geri dönüşü ve kümülatif harcama ayrıştırılmalı.
- `financial-frames` sayısız karar lensi olarak kullanılmalı.

### `14-risk.json`

- Statik risk tabloları kaldırılıp `risk-gates.json` üzerinden render edilmeli.
- Yatırımcı itibar riski tek güçlü notta kalmalı.

### `15-teknopark.json`

- "Kesin" dili yumuşatılmalı.
- Teşvik detayları `incentives.json` içinde kalmalı.
- Main section yatırımcıya tek soru sormalı: şartlar sağlanırsa vergi etkisi ne olur?

### `16-cpo.json`

- Maaş, araç/mobilite, aile dahil tam kapsamlı özel sağlık sigortası stat grid'de net kalmalı.
- Bu yan haklar "kişisel konfor" değil "tam zamanlı odak çalışma varsayımı" olarak çerçevelenmeli.
- Aynı şartlar lead ve kapanışta tekrar edilmemeli.

### `16a`, `16b`, `16c`, `17`

- Data componentleri üzerinden ilerlemeli.
- Section içindeki statik tablo/kart tekrarları silinmeli veya data dosyasına taşınmalı.
- `17-yatirim.json` içinde üç kartta aynı `Yatırımcının kontrol hakları` eyebrow'u tekrar edilmemeli; grup başlığı olarak bir kez kullanılmalı.

### `18-ilk-30-gun.json`

- Kapanış section'ı yeni bilgi üretmeli: imza/karar sonrası ilk 30 gün.
- `01` ve decisionBox içeriğini tekrar anlatmamalı.

## Dil ve Ton Kurallari

Yatırımcı profili için tekrar temizliği sadece kısa yazmak değildir. Türkçe tam cümle kurulmalı, telgraf dili kullanılmamalıdır.

Kurallar:

- Her cümlede yüklem olacak.
- Aynı karşıtlık kalıbı tekrar edilmeyecek: "değil; şudur" sadece ilk çerçevede kullanılacak.
- "Kesin", "garanti", "sıfır risk", "ezmek", "silah", "komando", "FOMO", "slot kaldı" gibi baskı veya abartı dili kullanılmayacak.
- Hukuk, vergi, pazar payı ve getiri alanında "hedef", "varsayım", "model", "kontrol kapısı", "doğrulanmış kaynak" ayrımı yapılacak.
- Bir metafor bir bölümde bir kez kullanılacak.
- Kavram tekrar edebilir; aynı paragraf tekrar edemez.
- Teknik terim ilk geçtiğinde Türkçe açıklama alacak: RFQ = alıcı talebiyle teklif alma akışı.

## Uygulama Sirasi

1. `accordion-groups.json` render hatasını düzelt: `emlak-dijital-sube` hangi accordion içinde gösterilecekse ekle.
2. `03` ve `03a` birebir tekrarını temizle.
3. `first-90-days.json` KPI kanonunu netleştir; `09a` statGrid'i dataRef'e bağla.
4. Finans kanon ayrımını düzelt: başabaş ayı, kümülatif gider, kasa dibi, yatırım geri dönüşü.
5. Risk/sermaye/yönetişim/getiri/yatırım section'larındaki statik tekrarları data componentlerine bağla.
6. `investor-dashboard.json` içindeki düz string sayıları `valueRef`e taşı.
7. `08` uzun gelir katalogunu appendix'e ayır.
8. `15` kesinlik dilini yumuşat.
9. React tarafında `ResponsiveDataTable`, `FieldRow`, `PillBadge`, `ChartTableView`, `format.ts`, `copy/labels.ts` refactor planını aç.
10. Validator'a şu kontrolleri ekle: aynı title+heading görünür tekrar, section dataRef varken statik tablo tekrarı, first-90 KPI drift, manifest inventory drift.

## Kabul Kriterleri

- Canlı UI'da aynı paragraf iki farklı section'da birebir görünmeyecek.
- Aynı sayı hem `metrics`, hem `section`, hem component içinde düz string olarak tutulmayacak.
- `first-90-days.json` tek KPI kanonu olacak.
- `risk-gates`, `capital-gates`, `governance-matrix`, `investor-return-scenarios`, `investment-options` data componentleri tek kaynak gibi davranacak.
- `python3 database/_build/validate.py` en azından `accordion-groups` hatasını vermeyecek.
- Verification raporları canlı UI kaynağı olmayacak.
- Tekrar edilen kavramlar her dönüşte yeni kanıt taşıyacak.

## Claude Icin Uygulama Prompt'u

```text
Proje kökü: /Users/karaca/Documents/sonbirarsa

Görev: Sunum içeriğinde tekrar eden ifadeleri temizle. Önce JSON içerik mimarisini düzelt, sonra React render tarafında gerekiyorsa merkezi component önerilerini uygula. Kod veya veri silerken rastgele refactor yapma; tek kaynak ilkesine göre ilerle.

Ana kural:
- Data JSON gerçek içerik kaynağıdır.
- Section JSON kısa yatırımcı dili ve dataRef/valueRef bağlantısı taşır.
- UI component iş verisi veya model anlamı tutmaz; sadece layout, format ve erişilebilir label üretir.

Öncelik sırası:
1. accordion-groups içinde render edilmeyen emlak-dijital-sube bölümünü doğru gruba ekle.
2. 03-neden-ortak ile 03a-emlak-dijital-sube arasındaki birebir dijital şube bloğunu temizle. 03 yatırımcı neden doğru ortak sorusunu, 03a dijital şube metaforunu sahiplenmeli.
3. first-90-days.json dosyasını ilk 90 gün KPI kanonu yap. 09a içindeki statGrid değerleri data ile çelişiyorsa kaldır veya dataRef üzerinden render et.
4. Risk, sermaye, yönetişim, getiri ve yatırım seçenekleri section'larında statik tablo/kart tekrarlarını kaldır. Bunları sırasıyla risk-gates, capital-gates, governance-matrix, investor-return-scenarios, investment-options data dosyalarından render et.
5. Finans alanında başabaş ayı, başabaşa kadar kümülatif gider, kasa dibi ve yatırım geri dönüşünü ayrı metrik isimleriyle netleştir. financial-frames sayısal kanon olmasın; sadece karar lensi olsun.
6. investor-dashboard içinde düz string sayısal KPI varsa valueRef'e taşı.
7. 08-gelir-modelleri içinde uzun gelir katalogunu ana akıştan appendix/veri detayı olarak ayır. Core anlatı: paket, üç gelir ailesi, yedi gelir akışı.
8. 15-teknopark içinde kesinlik dilini yumuşat. "Kesin" yerine "şartlar sağlanırsa", "mevzuata bağlı", "TL etkisi model varsayımıdır" dilini kullan.
9. 16-cpo içinde maaş, araç/mobilite ve aile dahil tam kapsamlı özel sağlık sigortasını tek stat grid'de net tut. Bunu "tam zamanlı odak çalışma varsayımı" olarak çerçevele; aynı şartları lead ve kapanışta tekrar etme.
10. Title ve ilk heading aynı cümleyse, görünür tekrar üretmeyecek hale getir.

Korunacak stratejik tekrarlar:
- güven dosyası
- doğrulanmış ilan
- saha
- satıcı arzı
- ilk 90 gün
- kontrol kapısı
- karar kapısı
- kontrollü pilot
- raporlama

Silinecek veya kısaltılacak tekrarlar:
- birebir aynı paragraf
- aynı title + aynı heading
- aynı KPI'nın düz string kopyaları
- web sitesi değil savunmasının tekrarları
- kesin/garanti/sıfır risk dili
- komisyonsuz modelin gelir kalemi olmadan tekrar edilmesi
- teknik jargonun Türkçe açıklama olmadan tekrar edilmesi

Dil:
- Türkçe tam cümle kur.
- Telgraf dili kullanma.
- Her cümlede yüklem olsun.
- "Değil; şudur" kalıbını sürekli tekrar etme.
- Yatırımcıyı sıkıştıran sahte kıtlık dili kullanma.
- Hukuk, vergi, pazar payı ve getiri alanında hedef/varsayım/model/doğrulanmış kaynak ayrımını açık tut.

Test:
- JSON parse ve validator çalışmalı: python3 database/_build/validate.py
- Accordion içinde her section render akışına bağlı olmalı.
- Aynı görünür paragraf iki section'da birebir kalmamalı.
- DataRef olan yerde aynı veri statik tablo/kart olarak tekrar edilmemeli.
```

