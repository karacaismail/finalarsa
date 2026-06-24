# Gereksiz Sections Raporu

Tarih: 2026-06-24  
Kapsam: `/Users/karaca/Documents/sonbirarsa/database/sections`, `database/data/accordion-groups.json`

## Yönetici Özeti

Güncel projede 29 section var. Bu sayı final yatırımcı toplantısı için fazla. Sorun içerik eksikliği değil, karar akışının parçalanmasıdır. Yatırımcı her section'da ayrı bir karar görmüyor; bazı section'lar aynı kararı başka açıdan tekrar anlatıyor.

Ana hüküm:

> 29 section ana akış için gereksizdir. Ana yatırımcı akışı 12-14 görünür section'a indirilmeli; kalan içerik merge, appendix veya archive olarak tutulmalıdır.

Bu raporda "gereksiz" kelimesi şu anlamlarda kullanıldı:

- `Ana akıştan çıkar`: Yatırımcı toplantısında ayrı section olarak gösterilmemeli.
- `Birleştir`: İçerik değerli ama başka section içinde alt blok olmalı.
- `Appendix`: Soru gelirse açılmalı; ana ikna akışını bölmemeli.
- `Archive`: Eski karar izi olarak kalabilir; canlı sunumda görünmemeli.

## Güncel Durum

Güncel section sayısı: 29

Accordion grupları: 8 ana grup

En ağır section'lar:

| Section | Yaklaşık karakter | Sorun |
|---|---:|---|
| `08-gelir-modelleri` | 14.444 | Ana sunum + appendix + katalog tek section içinde |
| `05-cozum` | 6.851 | Ürün, güven dosyası, mobil app, RFQ akışı birlikte |
| `05b-tkgm-entegrasyon` | 6.481 | Hukuki/teknik due diligence ana akışa girmiş |
| `13-basabas` | 5.827 | Grafik kullanım rehberi + finans dersi birlikte |
| `09-gtm` | 5.101 | GTM, saha ritmi, el değiştirme protokolü birlikte |
| `12-ik-plani` | 4.236 | Kadro, AI etkisi, departman, hiring gates birlikte |

`accordion-groups.json` açıklaması hâlâ "27 bölüm" diyor, fakat manifest ve gerçek dosya envanteri 29 section gösteriyor. Bu da içerik büyüdükçe ana akış kontrolünün zayıfladığını gösteriyor.

## Kesin Ana Akıştan Çıkarılacak Sections

### 1. `01b-yatirimci-panosu`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/01b-yatirimci-panosu.json`

Karar: Ayrı section olarak gereksiz. Üst karar panosu veya sticky summary olmalı.

Neden:

- KPI panosu bütün sunumun özetini tekrar ediyor.
- Karar, pazar, saha, finans ve risk KPI'larını ayrı ayrı section gibi okutuyor.
- Yatırımcı akışı başlamadan dashboard'a gömülüyor; bağlam gelmeden sayı veriliyor.

Ne yapılmalı:

- `accordion-groups.decisionBox` güçlendirilmeli.
- `01b` ayrı section olmamalı.
- KPI panosu "Yatırımcı karar kutusu" veya "Ek KPI görünümü" olarak üstte dar bir bileşen olmalı.

### 2. `02-toplanti-ozeti`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/02-toplanti-ozeti.json`

Karar: Ayrı section olarak gereksiz. `01-karar-notu` içine 3 satırlık mini timeline olarak girmeli.

Neden:

- Toplantı geçmişi yatırımcıyı ikna eden ana kanıt değil; sadece bağlam.
- `Bu özet, sürecin baştan ciddiyetle yürütüldüğünü gösterir` gibi cümleler kendi kendini ispatlıyor.
- Final toplantıda "ne konuştuk?" değil, "bugün neye karar veriyoruz?" sorusu daha önemlidir.

Ne yapılmalı:

- `01-karar-notu` içine şu kadar indir:
  - Görüşme 1: web sitesi değil, dikey arsa işletmesi.
  - Görüşme 2: ürün, GTM, yönetim süreci.
  - Görüşme 3: finans, İK, çalışma modeli.
  - Bugün: tutar, rol, ilk 90 gün.

### 3. `03a-emlak-dijital-sube`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/03a-emlak-dijital-sube.json`

Karar: Ayrı section olarak gereksiz. `03-neden-ortak` içine bir tablo/blok olarak gömülmeli.

Neden:

- Ana fikir doğru: "bildiğiniz emlak işinin dijital şubesi".
- Fakat bu fikir tek section taşıyacak kadar ayrı bir karar üretmiyor.
- Üstelik `03-neden-ortak` ile aynı alana konuşuyor: yatırımcı neden doğru ortak?

Ne yapılmalı:

- `03-neden-ortak` içinde şu başlıkla tek blok:
  - "Klasik emlak refleksinin dijital karşılığı"
- Mevcut tablo korunabilir.
- Ayrı accordion item olmamalı.

### 4. `05a-yetki-sorumluluk`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/05a-yetki-sorumluluk.json`

Karar: Ayrı section olarak gereksiz. İçerik gerekli ama `05-cozum` veya `05b` içinde kısa sınır notu olmalı.

Neden:

- "Platform tapu tescili yapmaz" kritik bir sınırdır.
- Ama bunun için ayrı section açmak akışı bölüyor.
- Yatırımcı bunu hukuk dersi olarak değil, risk sınırı olarak görmeli.

Ne yapılmalı:

- `05-cozum` içinde tek uyarı kartı:
  - "Platform doğrular ve koordine eder; tapu tescili, ödeme, değerleme ve finansman yetkili kurumlarla yürür."
- Detay tablo appendix'e taşınmalı.

### 5. `05b-tkgm-entegrasyon`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/05b-tkgm-entegrasyon.json`

Karar: Ana akıştan kesin çıkarılmalı. Appendix / due diligence section olmalı.

Neden:

- Çok değerli hukuki-teknik içerik var, ama yatırımcı ikna akışını kesiyor.
- EİDS, TAKPAS, komisyon, protokol, KVKK, sabit IP, audit log, hassas veri sınırı gibi ayrıntılar final pitch'in ortasında fazla ağır.
- 60+ yaş emlakçı yatırımcı için ana mesaj "güven dosyası resmî doğrulamaya bağlanır" olmalı; protokol prosedürü değil.

Ne yapılmalı:

- Ana akışta tek kart:
  - "İlk faz: EİDS + kullanıcı onaylı belge/OCR. Paralelde TKGM/TAKPAS protokol süreci."
- `05b` appendix olarak kalmalı: "Doğrulama altyapısı due diligence".

### 6. `07a-alici-rfq`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/07a-alici-rfq.json`

Karar: Ayrı section olarak gereksiz. `07-model` içinde küçük akış bileşeni olmalı.

Neden:

- RFQ ana gelir ve ürün farkı için önemli.
- Ama ayrı section olduğunda `07-model` ve `08-gelir-modelleri` arasında ek bölünme yaratıyor.
- Yatırımcı için soru basit: "Satıştan pay almıyorsak para nereden geliyor?"

Ne yapılmalı:

- `07-model` içine 5 adımlı mini flow:
  - Alıcı talep açar.
  - Sistem doğrulanmış stoktan eşleştirir.
  - Satıcı/emlakçı teklif verir.
  - Platform sıralar.
  - Ücret talebe erişimden doğar.

### 7. `09b-satici-emlakci-agi`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/09b-satici-emlakci-agi.json`

Karar: Ayrı section olarak gereksiz. `09-gtm` içine gömülmeli.

Neden:

- Satıcı/emlakçı ağı GTM'in bir alt mekanizmasıdır.
- Ayrı section olduğunda `09-gtm` ve `09a-ilk-90-gun` ile aynı saha fikrini üçüncü kez açıyor.

Ne yapılmalı:

- `09-gtm` içinde "Arz nasıl toplanır?" alt başlığına dönmeli.
- En fazla 3 kart:
  - Kurucu satıcı programı
  - Emlakçı teklif ağı
  - Güven dosyası teşviki

### 8. `11-ai-operasyon`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/11-ai-operasyon.json`

Karar: Ayrı section olarak gereksiz. `12-ik-plani` içine "AI operasyon kaldıracı" olarak gömülmeli.

Neden:

- AI burada yatırım tezi değil, operasyonel kaldıraçtır.
- "AI insanı değil maliyeti azaltır" doğru ama ayrı bölüm açınca teknoloji pitch'i gibi duruyor.
- Hedef yatırımcı için ana soru AI değil: kaç kişi, hangi iş, ne maliyet, hangi kontrol?

Ne yapılmalı:

- `12-ik-plani` içinde tek blok:
  - AI'sız kadro / AI ile kadro / tasarruf.
  - AI hızlandırır, insan karar verir.

### 9. `15-teknopark`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/15-teknopark.json`

Karar: Ana akıştan çıkarılmalı. `13-basabas` içinde tek finans avantaj kartı veya appendix olmalı.

Neden:

- Vergi avantajı karar destek unsurudur, ayrı yatırım tezi değildir.
- Şartlar, süreler, stopaj tavanı ve yatırım yükümlülüğü final sunumda fazla detay.
- Ana yatırımcı sorusu: "Bu avantaj olursa kasaya etkisi ne?" Detay mevzuat değil.

Ne yapılmalı:

- `13-basabas` içine tek kart:
  - "Teknopark şartları sağlanırsa yazılım gelirinde vergi avantajı oluşur; TL etkisi kazanca bağlı model varsayımıdır."
- Mevzuat listesi appendix'e taşınmalı.

### 10. `16a-paranin-kullanimi`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/16a-paranin-kullanimi.json`

Karar: Ayrı section olarak gereksiz. `17-yatirim` veya `13-basabas` içine sermaye kapıları olarak gömülmeli.

Neden:

- "Para kapı kapı kullanılır" kritik mesajdır.
- Ama ayrı section olduğunda finans, risk ve yatırım kararını bölüyor.
- Bu içerik yatırım seçenekleriyle birlikte okunmalı.

Ne yapılmalı:

- `17-yatirim` içinde "15M TL nasıl açılır?" alt bileşeni.
- `capitalReleasePlan` korunmalı ama ayrı section olmamalı.

### 11. `16b-ortaklik-yonetim`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/16b-ortaklik-yonetim.json`

Karar: Ayrı section olarak gereksiz. `17-yatirim` veya `16-cpo` içine gömülmeli.

Neden:

- Yönetim matrisi yatırım şartlarının parçasıdır.
- Ayrı section olarak gelince "yatırım opsiyonu" ve "CPO çalışma modeli" arasındaki karar bölünüyor.

Ne yapılmalı:

- `17-yatirim` içinde "Yatırımcı hangi haklarla gelir?" alt başlığı.
- Haftalık rapor / aylık karar toplantısı burada gösterilmeli.

### 12. `16c-yatirimci-getiri`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/16c-yatirimci-getiri.json`

Karar: Ayrı section olarak gereksiz. `17-yatirim` içine gömülmeli.

Neden:

- Getiri yatırım seçeneğinden ayrı anlatılınca karar parçalanıyor.
- Yatırımcı "hangi tutar, hangi hisse, hangi getiri yolu?" sorusunu aynı yerde görmek ister.

Ne yapılmalı:

- `17-yatirim` içine:
  - Tutar / hisse / değerleme
  - Getiri yolları
  - Garanti değildir uyarısı
  - Yönetim hakları

### 13. `98-ek-playbook`

Dosya: `/Users/karaca/Documents/sonbirarsa/database/sections/98-ek-playbook.json`

Karar: Ana akıştan çıkarılmalı. Appendix olarak kalmalı.

Neden:

- "470 model", "playbook", "arsenal" gibi ifadeler final yatırımcı kararında fazla strateji vitrini gibi duruyor.
- Yatırımcı bugün büyüme felsefesini değil, pilotun nasıl ispatlanacağını görmek ister.

Ne yapılmalı:

- `10-rekabet` içinde tek cümle:
  - "Büyüme playbook'u appendix'te; ana savunma arsa derinliği ve saha ağıdır."
- `98` sadece sorulursa açılmalı.

## Koşullu Olarak Ana Akıştan Çıkarılabilecek Sections

### `16-cpo`

Karar: Eğer bu sunum yatırımcı karar toplantısı ise kalsın ama çok kısa olmalı. Eğer ürün/yatırım pitch'i olarak dış yatırımcıya gidecekse ana akıştan çıkarılmalı.

Neden:

- CPO maaş, araç ve aile dahil özel sağlık sigortası sizin çalışma modeliniz için gerekli olabilir.
- Fakat yatırımcı pitch'inde erken gelirse kişisel talep gibi okunur.

Doğru konum:

- Final görüşmede: `Operasyon ve çalışma modeli` altında kısa blok.
- Genel yatırım sunumunda: appendix veya sözlü müzakere notu.

### `18-ilk-30-gun`

Karar: Gereksiz değil, ama karar özetinin içinde başta gösterilmemeli. Kapanışta kalmalı.

Neden:

- Final aksiyon için gerekli.
- Ancak accordion'da `Karar Özeti` grubuna konunca sunumun başında kapanış gibi duruyor.

Doğru konum:

- En son bölüm.
- "Evet dersek ilk 30 gün ne olur?" sorusunun cevabı.

## Kalsın Ama Daraltılsın

### `05-cozum`

Kalsın. Ancak `05a`, `05b`, RFQ ve mobil app detaylarını içine fazla yığmamalı.

Kalsın çünkü:

- Sunumun ürün kanıtı burada.
- Güven dosyası fikri yatırımcı için somutlaşmalı.

Daraltma:

- Güven dosyası = yetki + belge + konum + emsal + saha teyidi.
- Mobil uygulama ve RFQ detayları birer kısa alt kart olmalı.

### `08-gelir-modelleri`

Kalsın ama ikiye bölünsün:

- Ana akış: gelir aileleri, paketler, RFQ ana akışı, 2032 gelir kırılımı.
- Appendix: gelir katalogu, lisanslı opsiyonlar, mevzuat detayları.

Bugünkü haliyle section gereksiz değil; şişmiş.

### `09-gtm`

Kalsın ama `09a` ve `09b` ile birleşsin.

Kalsın çünkü:

- Bu yatırımcı saha operasyonunu görmek ister.
- Pilotun nasıl ispatlanacağı bu bölümde anlatılmalı.

Daraltma:

- İlçe seçimi.
- Satıcı/emlakçı ağı.
- İlk 90 gün KPI.
- Haftalık rapor.

### `12-ik-plani`

Kalsın ama `11-ai-operasyon` ile birleşsin.

Kalsın çünkü:

- İstihdam planı ve maliyet yatırımcı için kritik.
- Ancak AI ayrı bir teknoloji vitrinine dönüşmemeli.

### `13-basabas`

Kalsın ama finansal ders olmaktan çıkarılsın.

Kalsın çünkü:

- Başabaş, kasa dibi ve nakit güveni yatırımcı için kritik.

Daraltma:

- 3 ana metrik: sermaye, kasa dibi, operasyonel başabaş.
- Detay grafikler tab içinde kalsın.

### `14-risk`

Kalsın.

Neden:

- Bu yatırımcı profili için riskin açıkça konuşulması güven artırır.
- Fakat `16a` ve `16b` ile gereksiz overlap azaltılmalı.

### `17-yatirim`

Kalsın ve birleşme merkezi olsun.

İçine alınacaklar:

- `16a` para kullanımı
- `16b` yönetim hakları
- `16c` getiri yolları

## Önerilen Yeni Ana Akış

29 section yerine 13 ana section öneriyorum:

1. `karar-notu`
2. `neden-ortak` + `emlak-dijital-sube` birleşik
3. `problem`
4. `cozum` + kısa yetki sınırı
5. `pazar`
6. `model` + RFQ mini akış
7. `gelir-modelleri` ana özet
8. `gtm` + ilk 90 gün + satıcı/emlakçı ağı
9. `rekabet`
10. `ik-plani` + AI operasyon kaldıracı
11. `basabas` + teknopark kısa kart
12. `risk`
13. `yatirim` + para kapıları + getiri + yönetişim
14. `ilk-30-gun` kapanış

Eğer daha sert sadeleştirme istenirse 11 section'a inilebilir:

1. Karar
2. Neden bu ortaklık
3. Problem ve çözüm
4. Pazar
5. İş modeli ve gelir
6. Saha planı ve ilk 90 gün
7. Rekabet ve savunma
8. Operasyon ve kadro
9. Finans ve başabaş
10. Risk ve yatırım şartları
11. İlk 30 gün

## Appendix'e Taşınacak İçerikler

Appendix olarak kalması gerekenler:

- `05b-tkgm-entegrasyon`
- `98-ek-playbook`
- `08-gelir-modelleri` içindeki uzun gelir katalogu
- `15-teknopark` mevzuat şartları
- `05a-yetki-sorumluluk` detay tablosu
- `financial` detay grafiklerinin tüm tablo dökümleri
- Eski raporlar ve doğrulama ekleri

Appendix adı önerisi:

- `Ek A — Doğrulama ve TKGM/EİDS altyapısı`
- `Ek B — Gelir kataloğu ve lisanslı opsiyonlar`
- `Ek C — Büyüme playbook'u`
- `Ek D — Teşvik ve teknopark mevzuatı`
- `Ek E — Finansal detay tabloları`

## Accordion Yapısı Nasıl Değişmeli?

Mevcut 8 accordion korunabilir, ama içindeki section sayısı azaltılmalı:

### 1. Karar Özeti

Kalsın:

- `karar-notu`

Gömülsün:

- `toplanti-ozeti` mini timeline
- `yatirimci-panosu` üst karar kutusu

Kapanışa taşınsın:

- `ilk-30-gun`

### 2. Neden Bu İşbirliği?

Kalsın:

- `neden-ortak`

Gömülsün:

- `emlak-dijital-sube`

### 3. Problem ve Çözüm

Kalsın:

- `problem`
- `cozum`

Gömülsün:

- kısa yetki sınırı

Appendix:

- `yetki-sorumluluk`
- `tkgm-entegrasyon`

### 4. Pazar ve Rekabet

Kalsın:

- `pazar`
- `rekabet`

Appendix:

- `ek-playbook`

### 5. İş Modeli ve Gelirler

Kalsın:

- `model`
- `gelir-modelleri` ana özet

Gömülsün:

- `alici-rfq`

Appendix:

- uzun gelir katalogu

### 6. Saha Planı ve İlk 90 Gün

Kalsın:

- `gtm`

Gömülsün:

- `ilk-90-gun`
- `satici-emlakci-agi`

### 7. Operasyon ve Kadro

Kalsın:

- `ik-plani`
- `cpo` koşullu

Gömülsün:

- `ai-operasyon`

### 8. Finansal Plan, Risk ve Yatırım

Kalsın:

- `basabas`
- `risk`
- `yatirim`

Gömülsün:

- `paranin-kullanimi`
- `ortaklik-yonetim`
- `yatirimci-getiri`
- `teknopark` kısa kart

## Silinmemesi Gereken Ama Ana Akıştan Çıkarılacak Değerli İçerik

Bu ayrım önemli: Gereksiz section demek değersiz içerik demek değildir.

| Section | İçerik değeri | Ana akış kararı |
|---|---|---|
| `05b-tkgm-entegrasyon` | Yüksek | Appendix |
| `98-ek-playbook` | Orta/yüksek | Appendix |
| `15-teknopark` | Orta/yüksek | Finans içinde kısa kart |
| `16a-paranin-kullanimi` | Yüksek | Yatırım section'ına göm |
| `16b-ortaklik-yonetim` | Yüksek | Yatırım/CPO içine göm |
| `16c-yatirimci-getiri` | Yüksek | Yatırım içine göm |
| `07a-alici-rfq` | Yüksek | İş modeli içine göm |
| `09b-satici-emlakci-agi` | Yüksek | GTM içine göm |

## Claude İçin Uygulama Prompt'u

```text
Proje kökü: /Users/karaca/Documents/sonbirarsa

Görev: Yatırımcı sunumundaki section sayısını azalt. İçeriği silmeden, ana akış / merged / appendix ayrımı yap.

Ana hedef:
- 29 görünür section fazla.
- Ana akış 12-14 section'a inmeli.
- Değerli ama ağır içerik appendix'e taşınmalı.
- Aynı karar sorusuna hizmet eden section'lar birleşmeli.

Kesin ana akıştan çıkar:
- 01b-yatirimci-panosu: ayrı section değil, üst karar/KPI kutusu.
- 02-toplanti-ozeti: 01 içine mini timeline.
- 03a-emlak-dijital-sube: 03 içine tablo/blok.
- 05a-yetki-sorumluluk: 05 içine kısa sınır notu, detay appendix.
- 05b-tkgm-entegrasyon: appendix/due diligence.
- 07a-alici-rfq: 07 içine mini RFQ akışı.
- 09b-satici-emlakci-agi: 09 içine arz toplama bloğu.
- 11-ai-operasyon: 12 içine AI operasyon kaldıracı.
- 15-teknopark: 13 içinde kısa vergi avantaj kartı, detay appendix.
- 16a-paranin-kullanimi: 17 içine sermaye kapıları.
- 16b-ortaklik-yonetim: 17 veya 16 içine yönetim hakları.
- 16c-yatirimci-getiri: 17 içine getiri yolları.
- 98-ek-playbook: appendix.

Koşullu:
- 16-cpo final görüşmede kısa kalsın; dış pitch'te appendix/private negotiation note olsun.
- 18-ilk-30-gun kapanışta kalsın; karar özeti grubunda başta görünmesin.

Yeni ana akış:
1 karar-notu
2 neden-ortak (+ dijital şube)
3 problem
4 cozum (+ kısa yetki sınırı)
5 pazar
6 model (+ RFQ mini akış)
7 gelir-modelleri ana özet
8 gtm (+ ilk 90 gün + satıcı/emlakçı ağı)
9 rekabet
10 ik-plani (+ AI kaldıracı + CPO kısa)
11 basabas (+ teknopark kısa kart)
12 risk
13 yatirim (+ para kapıları + getiri + yönetişim)
14 ilk-30-gun

Uygulama önerisi:
- Section dosyalarını hemen silme.
- Her section'a görünürlük alanı ekleyebilirsin: main | merged | appendix | archive.
- accordion-groups.json sadece main section'ları göstermeli.
- Merged section'ların içerikleri hedef section içine kısa blok olarak taşınmalı.
- Appendix içerikleri ana akışın sonunda kapalı accordion altında durmalı.

Kabul kriteri:
- Ana accordion akışında en fazla 14 görünür section olsun.
- Her section tek karar sorusuna cevap versin.
- Bir karar sorusu iki ayrı section'da anlatılmasın.
- Appendix içerikleri ana ikna akışını bölmesin.
- 18-ilk-30-gun en sonda kalsın.
```

## Son Karar

Gerçekten gereksiz olan şey içerik değil, section ayrımıdır.

Ana akıştan çıkarılması gereken standalone section sayısı: 13

Koşullu section sayısı: 2

Daraltılarak kalması gereken section sayısı: 7

Önerilen görünür ana section sayısı: 13-14

Bu sadeleştirme yapılmadan sunum, tek yatırımcı karar toplantısı yerine ürün dokümantasyonu + finans raporu + hukuk eki + strateji arşivi gibi okunur.

