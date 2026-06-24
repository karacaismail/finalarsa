# Component Metin Dengesi Raporu

Tarih: 2026-06-24  
Kapsam: canlı yatırımcı sunumu metinleri, `database/sections`, `database/data`, `landing/src/components`

## Yönetici Özeti

Mevcut içerikte iki zıt problem aynı anda var:

1. Bazı alanlar fazla açıklıyor. Özellikle `note`, `lead`, `chartTabs.lead` ve `card.body` alanları yer yer rapor paragrafına dönüşüyor. Bu, sunum ekranında okuma yükünü artırıyor.
2. Bazı alanlar fazla kısa kalıyor. `hız için`, `kontrol için`, `kademeli`, `Bölgesel, ölçülü`, `Kasa güven marjı` gibi ifadeler bağlam vermiyor. Bu da "az-öz" değil, eksik cümle etkisi yaratıyor.

Bu sunumda ideal metin formülü şu olmalı:

> Ana hüküm + neden önemli + yatırımcı için sonucu.

Yani her metin kısa olmalı, ama yüklemsiz, eksik ve bağlamsız olmamalı. 60+ yaş, klasik büyük emlakçı yatırımcı için "çok teknik kısa etiket" de, "uzun regülasyon paragrafı" da aynı ölçüde yorar.

## Component Bazlı Genel Kural

| Component / block tipi | Bugünkü risk | İdeal metin uzunluğu | Yazım kuralı |
|---|---|---:|---|
| `heading` | Title ile aynı cümleyi tekrar ediyor | 6-12 kelime | Tek hüküm, tekrar yok |
| `lead` | Bölüm yönergesine veya uzun rapor özetine dönüşüyor | 1-2 cümle | "Bu bölüm ne karar verdirecek?" |
| `note` | Fazla açıklama yığılıyor | 120-220 karakter | Tek fikir + sonuç |
| `cardGrid.body` | Ya çok uzun ya çok kısa | 1 tam cümle | Eylem + neden + çıktı |
| `list.body` | Teknik açıklama paragrafa dönüşüyor | 1 cümle | Ne yapılır ve neyi azaltır |
| `chartTabs.lead` | Grafik kullanım kılavuzu gibi uzuyor | 1 kısa cümle | Grafikte bakılacak tek karar |
| `caption` | "grafik + tablo" gibi tekrar ediyor | 1 kısa açıklama | Veri neyi gösteriyor? |
| `KpiBoard` | KPI label net, red flag bağlamsız | Label kısa, red flag açıklayıcı | Kırmızı eşik karar tetiklemeli |
| `GovernanceMatrix.note` | Fazla kısa | 1 açıklayıcı cümle | Yetki sınırı anlaşılmalı |
| `RiskGateMatrix` | Bazı metric/action cümleleri belirsiz | somut ölçüm + somut aksiyon | Risk ölçülebilir olmalı |
| `InvestmentOptionsCompare` | Bridge note çok uzun | görünür metin kısa, detay collapsible | 40M/15M ayrımı tek bakışta anlaşılmalı |

## Fazla Metin Olan Yerler

### 1. `BlockView` / `lead` — Finansal Bölüm Açılışı

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/13-basabas.json:29`

Mevcut ifade:

> Her görünüm bir grafik ve onun tablosu olarak verilir. Üstteki sekme grubu vergi avantajını ve maliyet/başabaş görünümlerini toplar; alttaki grup 2026–2027 aylık, 2032 yıllık ve yedi gelir akışını verir. Aşağıdaki sekmelerden istediğin görünüme geç.

Sorun:

- Bu metin yatırımcı kararını değil, sayfanın kullanım talimatını anlatıyor.
- "Üstteki/alttaki sekme" gibi UI yönergeleri sunum dilini zayıflatıyor.
- Mobilde ekranda uzun bir açıklama bloğu gibi durur.

Önerilen ifade:

> Bu bölüm paranın ne zaman yettiğini, ne zaman kendini döndürdüğünü ve 2032'de hangi gelir akışlarıyla büyüdüğünü gösterir.

### 2. `BlockView` / `note` — Başabaş Kavramları

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/13-basabas.json:60`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/13-basabas.json:65`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/13-basabas.json:112`

Sorun:

- Aynı konu üç kez anlatılıyor: operasyonel başabaş, kümülatif gider, kasa dibi, yatırım geri dönüşü.
- `chartTabs.lead` içindeki 600 karakterlik açıklama sunum ekranı için fazla uzun.
- Yatırımcı "tamam, hangi sayıya bakacağım?" sorusunu geç soruyor.

Önerilen görünür ifade:

> Dört metrik ayrı okunur: operasyonel başabaş, başabaşa kadar harcanan tutar, kasa dibi ve yatırım geri dönüş süresi. Birbirinin yerine kullanılmaz.

Detay gerekirse `FinancialDecisionFrame` içinde veya tooltip/collapsible alanda verilmeli.

### 3. `ChartTabs` / `lead` — OPEX Açıklaması

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/13-basabas.json:104`

Mevcut ifade:

> OPEX, tekrar eden işletme gideridir: personel, pazarlama, saha operasyonu (araçlı keşif/satış ekipleri), dijital altyapı, AI/yazılım araçları ve idari kalemler. Kadro büyüdükçe personel en büyük kaleme döner.

Sorun:

- Bir grafik tabı için fazla uzun.
- Parantez içi açıklama akışı bölüyor.

Önerilen ifade:

> OPEX aylık tekrar eden giderdir. Kadro büyüdükçe en büyük kalem personel ve saha operasyonu olur.

### 4. `BlockView` / `note` — Gelir Modeli Mevzuat Açıklaması

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/08-gelir-modelleri.json:38`

Mevcut ifade:

> Küresel gayrimenkul platformlarının gelir modelleri tarandı ve her biri Türkiye mevzuatına göre 2025-2026 itibarıyla doğrulandı. İki grup birlikte sunulur: (1) hiç belge gerektirmeyenler, (2) belgesi/lisansı TÜRKİYE'DE ALINABİLEN modeller. Belge gerekiyorsa alınır; sadece belge alınması yasal olarak imkânsız olanlar hariç tutuldu.

Sorun:

- Ana gelir modeli bölümünde fazla savunmacı ve denetim raporu gibi.
- "TÜRKİYE'DE ALINABİLEN" vurgusu bağırıyor.
- Yatırımcı önce para modelini görmek ister; mevzuat denetimi appendix'e gitmeli.

Önerilen ifade:

> Gelir kalemleri ikiye ayrıldı: bugün uygulanabilecek gelirler ve lisans/protokol sonrası açılacak opsiyonlar. Ana karar için ilk grubu öne çıkarıyoruz.

### 5. `BlockView` / `note` — Gelir Paketi Açıklaması

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/08-gelir-modelleri.json:50`

Sorun:

- Fiyat karşılaştırması, ücretsiz ilan, tekli ilan, paket aralığı ve rakip bilgisi tek cümleye yığılmış.
- Zaten hemen altında tablo var; metin tablonun işini tekrar ediyor.

Önerilen ifade:

> Satıcı tarafı düşük bariyerle başlar; emlakçı ve kurumsal paketler görünürlük, ilan hakkı ve veri hizmetiyle büyür.

Tablo rakamları göstermeli; note rakam tekrar etmemeli.

### 6. `BlockView` / `note` — Gelir Ek Kataloğu

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/08-gelir-modelleri.json:202`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/08-gelir-modelleri.json:397`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/08-gelir-modelleri.json:519`

Sorun:

- Ana sunumun içinde "ek bölüm" diye uzun açıklama var.
- Kullanıcıya "buradan sonrası ana anlatının dışında" demek, akışın dağıldığını itiraf ediyor.
- Bu metinler accordion içinde ayrı "Appendix / Gelir kataloğu" item'ı olmalı.

Önerilen görünür ifade:

> Ana model üç gelir ailesine dayanır. Detay katalog, lisans/protokol gerektiren ileri opsiyonları ayrıca gösterir.

### 7. `BlockView` / `note` — Güven Dosyası Katman Açıklaması

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/05-cozum.json:49`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/05-cozum.json:88`

Sorun:

- Aynı fikir iki kez var: güven dosyası tek paneldir ve katmanlardan oluşur.
- Bölüm 05a/05b referansları iyi ama ana çözüm anlatısında fazla teknik rota çiziyor.

Önerilen ifade:

> Güven dosyası, ilanın yetki, belge, konum ve emsal kontrolünü tek ekranda toplar. Yasal kapsam ve kurum protokolleri ayrı bölümde açıklanır.

### 8. `BlockView` / `list.body` — Güven Dosyası Teknik Detayları

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/05-cozum.json:61`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/05-cozum.json:71`

Sorun:

- EİDS ve OCR açıklamaları list item içinde uzun paragrafa dönüşüyor.
- Yatırımcı için gerekli olan "ne riski azaltıyor?" sorusu cümlenin sonunda kayboluyor.

Önerilen ifade:

> EİDS uyumlu yetki kontrolü, ilanı yetkisiz kişi riskinden ayırır.

> Tapu belgesi OCR ile okunur; m², nitelik ve konum bilgisi ilandaki beyanla karşılaştırılır.

### 9. `BlockView` / `note` — ParselQ Mobil Uygulama Tanımı

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/05-cozum.json:138`

Sorun:

- "invest yap", "app-in-app", "Instagram ile Twitter arası", "AI-öncelikli" aynı cümlede fazla iddialı ve fazla jargonlu.
- 60+ yaş yatırımcı için ürünü somutlaştırmak yerine soyutlaştırıyor.

Önerilen ifade:

> ParselQ, arsa ilanını hazırlayan, doğrulayan ve alıcı talebiyle eşleştiren mobil çalışma panelidir. Satıcı, alıcı ve emlakçı aynı dosya üzerinden ilerler.

### 10. `BlockView` / `note` — Rekabet Veri Kalkanı

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/10-rekabet.json:92`

Sorun:

- EİDS, TKGM, parsel verisi, hash ve rakip savunması tek paragrafta.
- Doğru fikir var, fakat sunumda nefes almıyor.

Önerilen ifade:

> Savunma, tek bir özellikten değil, biriken doğrulama standardından gelir: yetki, parsel, belge geçmişi ve saha teyidi aynı dosyada birleşir.

Detaylar alttaki `Taklit maliyeti neden yükselir` kartlarına dağıtılmalı.

### 11. `BlockView` / `note` — Counter-positioning Paragrafı

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/10-rekabet.json:122`

Sorun:

- "counter-positioning" teknik terim olarak kalıyor.
- Cümle fazla akademik: lider, hacim geliri, standartsız ilan yapısı, dikey doğrulama disiplini.

Önerilen ifade:

> Büyük platformun işi geniş ilan hacmidir. Bizim işimiz arsa dosyasını doğrulamaktır. Bu yüzden rakibin aynısını yapması kendi mevcut modelini değiştirmesini gerektirir.

### 12. `BlockView` / `lead` ve `cardGrid` — TKGM Entegrasyonu

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/05b-tkgm-entegrasyon.json:30`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/05b-tkgm-entegrasyon.json:47`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/05b-tkgm-entegrasyon.json:91`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/05b-tkgm-entegrasyon.json:187`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/05b-tkgm-entegrasyon.json:221`

Sorun:

- Bölüm hukuki rapor gibi çalışıyor; sunum için fazla detaylı.
- Yatırımcıya "biz ne zaman ne yapacağız?" sorusu geç cevaplanıyor.
- Teknik ve hukuki doğruluk değerli, ama ana sunum içinde bu kadar uzun olmamalı.

Önerilen ana ifade:

> TKGM/TAKPAS hedefi, güven dosyasını resmî doğrulamaya bağlamaktır. İlk fazda EİDS ve kullanıcı onaylı belgeyle ürün çıkar; protokol süreci paralel yürür.

Detay önerisi:

- "Neden?"
- "İlk fazda ne yapılır?"
- "Protokol ne zaman gerekir?"
- "Hangi veriyi istemiyoruz?"

Bu dört başlık ayrı kart olmalı; uzun hukuki şartlar appendix'e taşınmalı.

### 13. `InvestmentOptionsCompare` / `modelCapital.note` ve `bridgeNote`

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/data/investment-options.json:10`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/data/investment-options.json:12`

Sorun:

- 40M model sermayesi ile 15M stratejik seçenek ayrımı iki uzun paragrafta anlatılıyor.
- Yatırımcı burada tek bakışta "benden ne isteniyor?" sorusunu görmek ister.

Önerilen görünür ifade:

> Model toplam 40M TL işletme sermayesiyle kuruludur. Bugünkü stratejik teklif 15M TL'dir; kalan ihtiyaç ciro ve sonraki turla tamamlanır.

Detay bridge note collapsible olmalı:

> Detay: 15M TL ilk riski ve başabaşa kadar köprü sermayesini taşır; ulusal kampanya sonrası değerleme yeniden ele alınır.

## Fazla Kısa ve Bağlamı Kopuk İfadeler

### 1. `GovernanceMatrix.note` — Yetki Notları

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/data/governance-matrix.json:13`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/data/governance-matrix.json:20`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/data/governance-matrix.json:48`

Mevcut ifadeler:

- `hız için`
- `kontrol için`
- `kademeli`

Sorun:

- Bunlar cümle değil.
- Yatırımcı hangi yetkinin neden CPO'da, neden yatırımcıda olduğunu anlayamaz.

Önerilen ifadeler:

- `hız için` yerine: `CPO günlük ürünü ve operasyonu yürütür; yatırımcı haftalık sonuçla bilgilendirilir.`
- `kontrol için` yerine: `Bütçe kapıları yatırımcı onayıyla açılır; harcama kanıt gelmeden büyümez.`
- `kademeli` yerine: `Yeni işe alım, ilan stoğu ve gelir sinyali oluştukça onaya gelir.`

### 2. `CapitalReleasePlan` Öncesi `cardGrid` — Para Nereye Gider

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/16a-paranin-kullanimi.json:62`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/16a-paranin-kullanimi.json:68`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/16a-paranin-kullanimi.json:74`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/16a-paranin-kullanimi.json:80`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/16a-paranin-kullanimi.json:92`

Mevcut ifadeler:

- `Yazılım, AI, altyapı.`
- `Araçlı keşif ve satış.`
- `Bölgesel, ölçülü.`
- `Belge, lisans, KVKK.`
- `Kasa güven marjı.`

Sorun:

- Bunlar başlık altı not gibi değil, muhasebe etiketi gibi.
- Yatırımcı "bu para neyi kanıtlayacak?" sorusunun cevabını görmüyor.

Önerilen ifadeler:

- Ürün geliştirme: `Pilot panel, güven dosyası, AI destekli ilan hazırlama ve raporlama altyapısı kurulur.`
- Saha ekibi: `Araçlı keşif, satıcı görüşmesi, foto/drone içerik ve ilan doğrulama operasyonu finanse edilir.`
- Pazarlama: `Ulusal kampanya değil; seçili ilçede satıcı ve alıcı talebi üreten bölgesel denemeler yapılır.`
- Hukuk/uyum: `EİDS, KVKK, sözleşme, lisans ve kurum protokolü hazırlıkları karşılanır.`
- Ofis/operasyon: `Şirket kuruluşu, ekipman, muhasebe ve günlük operasyon giderleri yönetilir.`
- Yedek akçe: `Kasa dibi korunur; hedef tutmazsa harcama kapıları yavaşlatılır.`

### 3. `FinancialDecisionFrame` — Kısa Sonuç İfadeleri

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/data/financial-frames.json:43`

Mevcut ifade:

> Dengeli çoklu akış

Sorun:

- Bir yatırımcı için bu cümle yetersiz; neye göre dengeli, neden önemli belli değil.

Önerilen ifade:

> 2032 gelirinin tek kaleme yaslanmaması; RFQ lider kalsa da ilan, veri ve hizmet gelirlerinin birlikte büyümesi.

### 4. `RiskGateMatrix` — Belirsiz Metric ve Action

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/data/risk-gates.json:35`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/data/risk-gates.json:61`

Mevcut ifadeler:

- `Uyum açığı`
- `Hibrit altyapı · harcama kısıtı`

Sorun:

- Ölçüm ve aksiyon somut değil.
- Risk kapısı yatırımcıya "hangi durumda ne yapılır?" cevabını net vermeli.

Önerilen ifadeler:

- `Uyum açığı` yerine: `Yeni EİDS/SPK şartına uyumsuz kalan süreç veya ekran sayısı`
- `Hibrit altyapı · harcama kısıtı` yerine: `USD bazlı yazılım/altyapı gideri sınırlandırılır; TL bazlı alternatif veya yıllık sabit fiyatlı paket seçilir.`

### 5. `First90DaysPlan` / `timeline.what`

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/09a-ilk-90-gun.json:60`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/09a-ilk-90-gun.json:64`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/09a-ilk-90-gun.json:72`

Mevcut ifadeler:

- `Hedef ilçe ve satıcı ziyaret listesi`
- `Saha ziyareti, keşif, satıcı görüşmesi`
- `Rapor ve kapanış takibi`

Sorun:

- Haftalık ritim var ama çıktı yok.
- Yatırımcı her günün sonunda hangi kanıtın üretildiğini görmeli.

Önerilen ifadeler:

- Pazartesi: `Hedef ilçe, satıcı listesi ve haftalık ziyaret planı netleşir.`
- Salı-Çarşamba: `Saha keşfi yapılır; satıcı adayı, konum ve parsel bilgisi CRM'e girilir.`
- Cuma: `Haftalık raporda görüşme, doğrulanmış ilan, alıcı talebi ve risk sapması sunulur.`

### 6. `KpiBoard` / `redFlag`

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/data/investor-dashboard.json`

Sorun:

- Bazı kırmızı bayraklar kısa etiket gibi: `sapma kırmızı eşik`, `ilçe aç/kapat kararı`, `hedef altıysa bölge daralt`.
- KPI board yatırımcıya karar sistemi kurmalı; kırmızı bayraklar bir karar cümlesi olmalı.

Önerilen format:

> Eğer X hedefin altında kalırsa, Y kararını alırız.

Örnek:

- `Hedef altıysa bölge daralt` yerine: `90 gün sonunda doğrulanmış ilan hedefi tutmazsa yeni ilçe açmayız; mevcut ilçede satıcı kazanımına döneriz.`
- `Sapma kırmızı eşik` yerine: `Aylık OPEX planı %15 aşarsa işe alım ve pazarlama harcaması onaya döner.`

### 7. `07a-alici-rfq` / `list.body`

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/07a-alici-rfq.json:53`  
Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/07a-alici-rfq.json:63`

Mevcut ifadeler:

- `Doğrulanmış stoktan eşleştirme`
- `Uygunluk ve güvene göre`

Sorun:

- Cümle değil; kullanıcı hangi kararın verildiğini anlamıyor.

Önerilen ifadeler:

- `Doğrulanmış stoktan eşleştirme` yerine: `Sistem yalnız doğrulanmış ilan stoğundan uygun parselleri seçer.`
- `Uygunluk ve güvene göre` yerine: `Teklifler bütçe, imar, konum ve güven dosyası kalitesine göre sıralanır.`

## Gereksiz veya Zayıf İfadeler

### 1. `02-toplanti-ozeti` / generic note

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/02-toplanti-ozeti.json:61`

Mevcut ifade:

> Bu özet, sürecin baştan ciddiyetle yürütüldüğünü gösterir.

Sorun:

- Kendini öven ve kanıt üretmeyen bir cümle.
- Timeline zaten ciddiyeti gösteriyor.

Öneri:

Silinsin veya şu hale gelsin:

> Bugünkü toplantı artık fikir sunumu değil; yatırım şartı, rol ve ilk saha kanıtı toplantısıdır.

### 2. `08-gelir-modelleri` / başlık dili

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/08-gelir-modelleri.json:14`

Mevcut ifade:

> Tek gelire bağlı değiliz; Türkiye'de engelsiz çoklu kalem

Sorun:

- `engelsiz çoklu kalem` doğal Türkçe değil.
- Hukuki iddia gibi okunuyor; "engelsiz" fazla kesin.

Önerilen ifade:

> Gelir tek kaleme bağlı değil; ana gelir aileleri belli

### 3. `10-rekabet` / iddialı savunma dili

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/10-rekabet.json:84`

Mevcut ifade:

> Rakip yarın dikey bir sayfa açabilir; ama saha arzını, doğrulamayı ve satıcı ilişkisini bir günde kuramaz.

Sorun:

- Fikir doğru ama "bir günde kuramaz" iddialı ve hafif slogan.

Önerilen ifade:

> Rakip dikey bir sayfa açabilir; fakat doğrulanmış stok, saha ilişkisi ve satıcı güveni zaman içinde birikir.

### 4. `16c-yatirimci-getiri` / metafor

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/16c-yatirimci-getiri.json:48`

Mevcut ifade:

> Bir arsayı alıp beklemek başka, o arsanın üstüne gelir üreten bir iş merkezi kurmak başkadır. Burada amaç yalnız arsa ilanı değil, arsa piyasasının iş merkezini kurmaktır.

Sorun:

- Metafor iyi niyetli ama "iş merkezi" iki kez dönüyor ve tam oturmuyor.
- Arsa yatırımcısına daha gerçekçi, saha temelli metafor gerekir.

Önerilen ifade:

> Bu yatırım tek bir arsayı bekletmek değil; arsa alım-satımını sürekli müşteri, ilan ve veri akışı üreten bir işletmeye çevirmektir.

### 5. `01b-yatirimci-panosu` / KPI açıklaması

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/sections/01b-yatirimci-panosu.json:27`

Mevcut ifade:

> KPI: işin gidişatını ölçen anahtar performans göstergesi. Renkli etiketlerin anlamı şudur: doğrulanmış, resmî bir kaynaktan gelen kesin veridir; varsayım, finansal modelin girdisidir; hedef, pilot döneminde ölçülecek beklentidir; teklif ise bu turda sunulan yatırım koşuludur.

Sorun:

- Doğru ama fazla sözlük gibi.
- Hemen altında `claimLegend` var; açıklama tekrar ediyor.

Önerilen ifade:

> Her sayı etiketlidir: doğrulanmış kaynak, model varsayımı, hedef veya yatırım teklifi. Böylece hangi rakamın kanıt, hangisinin plan olduğu ayrılır.

## Az-Öz Yaklaşımının Bozduğu Yerler

Burada sorun fazla metin değil, eksik bağlamdır. Claude'a şu talimat verilmeli:

> Kısa yaz, ama cümleyi eksiltme. Etiket değil, karar cümlesi yaz.

Zayıf örnekler:

- `hız için`
- `kontrol için`
- `kademeli`
- `Bölgesel, ölçülü.`
- `Kasa güven marjı.`
- `Dengeli çoklu akış`
- `Uyum açığı`
- `Doğrulanmış stoktan eşleştirme`
- `Uygunluk ve güvene göre`

İdeal dönüşüm:

- Etiket: `kontrol için`
- Cümle: `Bütçe kapıları yatırımcı onayıyla açılır; kanıt yoksa harcama büyümez.`

- Etiket: `Kasa güven marjı`
- Cümle: `Yedek akçe, hedef tutmadığında operasyonu durdurmadan karar alma süresi sağlar.`

- Etiket: `Dengeli çoklu akış`
- Cümle: `Gelir tek kaleme yaslanmaz; RFQ, ilan, veri ve hizmet gelirleri birlikte büyür.`

## Claude İçin Yazım Talimatı

```text
Proje kökü: /Users/karaca/Documents/sonbirarsa

Görev: Canlı yatırımcı sunumundaki metinleri component bazlı dengele.

Ana hedef:
- Fazla açıklama olan yerleri kısalt.
- Fazla kısa ve bağlamsız olan yerleri tam cümleye çevir.
- Sadece "az öz" yazma; bağlamı koparma.

Yazım formülü:
Ana hüküm + neden önemli + yatırımcı için sonucu.

Component kuralları:
1. heading: Title ile aynı cümleyi tekrar etme. 6-12 kelime.
2. lead: Bölümün karar sorusunu anlat. UI kullanım talimatı yazma.
3. note: Tek fikir taşı. 120-220 karakter arası hedefle.
4. cardGrid.body: Etiket değil, tam cümle yaz. Eylem + çıktı olsun.
5. list.body: Teknik açıklamayı bir cümleye indir; risk veya faydayı belirt.
6. chartTabs.lead: Grafikte neye bakılacağını söyle. Uzun finans dersi verme.
7. caption: "grafik + tablo" deme; verinin neyi gösterdiğini söyle.
8. GovernanceMatrix.note: "hız için" gibi eksik etiketler kullanma; yetki sınırını bir cümleyle açıkla.
9. KpiBoard redFlag: "sapma kırmızı eşik" gibi belirsiz ifade kullanma; hangi durumda hangi karar alınır yaz.
10. InvestmentOptionsCompare: 40M model sermayesi ile 15M yatırım teklifi ayrımını tek görünür cümlede açıkla; uzun bridge notunu detay/collapsible yap.

Öncelikli dosyalar:
- database/sections/13-basabas.json
- database/sections/08-gelir-modelleri.json
- database/sections/05-cozum.json
- database/sections/05b-tkgm-entegrasyon.json
- database/sections/10-rekabet.json
- database/sections/16a-paranin-kullanimi.json
- database/data/governance-matrix.json
- database/data/financial-frames.json
- database/data/investment-options.json
- database/data/risk-gates.json
- database/sections/09a-ilk-90-gun.json
- database/sections/07a-alici-rfq.json

Yasaklı yaklaşım:
- Sadece kısaltmak.
- Yüklemsiz etiket yazmak.
- Teknik kavramı açıklamasız bırakmak.
- Aynı fikri hem note hem chart lead hem caption içinde tekrar etmek.
- "Kesin", "garanti", "engelsiz", "bir günde kuramaz" gibi fazla iddialı ifadeleri kanıt olmadan kullanmak.

Kabul kriteri:
- Her görünür metin ya karar verir, ya risk açıklar, ya kanıt gösterir.
- Hiçbir metin sadece süs veya genel yorum olarak kalmaz.
- Mobil ekranda bir note tek ekranı kaplamaz.
- Kısa kart metinleri bağlamlı tam cümle olur.
```

## Uygulama Önceliği

1. `13-basabas.json`: başabaş metinlerini tek note + kısa chart lead'lere indir.
2. `08-gelir-modelleri.json`: mevzuat ve ek katalog açıklamalarını ana akıştan ayır.
3. `05b-tkgm-entegrasyon.json`: hukuki rapor tonunu dört karar kartına indir; detayları appendix'e taşı.
4. `05-cozum.json`: güven dosyası anlatısını tek panel/katman mantığında sadeleştir.
5. `10-rekabet.json`: veri kalkanı ve counter-positioning paragrafını sade Türkçeye çevir.
6. `16a-paranin-kullanimi.json`: kısa bütçe kartlarını tam cümleye çevir.
7. `governance-matrix.json`: tüm `note` alanlarını karar sınırı açıklayan cümle yap.
8. `financial-frames.json`: `goodResult` ve `redFlags` alanlarını karar cümlesine çevir.
9. `investment-options.json`: uzun sermaye köprü notunu görünür kısa cümle + detay açıklaması olarak böl.
10. `09a` ve `07a`: timeline/list kısa gövdelerini çıktı odaklı cümleye çevir.

