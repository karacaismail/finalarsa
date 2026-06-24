# RAPOR-13 · İçerik Metin Dengesi Turu

Tarih: 2026-06-24 · Sürüm: **v3.4** · Commit: `93a5525` · Tag: `v3.4`
Canlı: https://karacaismail.github.io/finalarsa/ (bundle `index-kROLUqB3.js`, Chrome ile görsel doğrulandı)

"Component Metin Dengesi Raporu"ndaki eleştiriler uygulandı. İki zıt sorun aynı anda çözüldü: bazı alanlar fazla uzundu (rapor paragrafına dönüşüyordu), bazıları fazla kısaydı (yüklemsiz etiket). Hedef formül: **ana hüküm + neden önemli + yatırımcı için sonucu.**

---

## 1. Uzun alanlar kısaltıldı

- **13-başabaş:** Açılış lead'i (sayfa kullanım talimatı) yatırımcı cümlesine indirildi. Dört başabaş kavramı (operasyonel başabaş / kümülatif gider / kasa dibi / geri dönüş) ÜÇ kez anlatılıyordu → tek kısa nota indirildi; ~600 karakterlik grafik-sekme metni 2 cümleye indi (token'lar korundu). OPEX açıklaması sadeleşti.
- **08-gelir:** Mevzuat denetim paragrafı, rakam yığan paket notu ve "ek katalog" girişi kısaldı. Başlık "Türkiye'de engelsiz çoklu kalem" → "ana gelir aileleri belli" (fazla iddialı "engelsiz" kalktı).
- **05-çözüm:** Güven dosyası tekrarı tek anlatıya indi; EİDS/OCR list maddeleri tek cümleye; ParselQ tanımı jargondan ("invest yap", "app-in-app", "Instagram-Twitter arası") arındırıldı.
- **05b-TKGM:** Hukuki rapor tonu kısaldı; açılış ve kart gövdeleri sıkılaştı. **Substance korundu:** üç entegrasyon yolu tablosu, protokol adımları, faz kartları ve hassas-veri sınırı yerinde.
- **10-rekabet:** Veri kalkanı ve counter-positioning paragrafları sade Türkçeye çevrildi; "bir günde kuramaz" iddiası kanıtlı ifadeye yumuşatıldı.
- **16c / 02:** "iş merkezi" metaforu netleşti; öven boş not karar cümlesine döndü.

## 2. Kısa/bağlamsız etiketler tam karar cümlesine çevrildi

- **governance-matrix:** "hız için / kontrol için / kademeli" → yetki sınırını anlatan tam cümleler.
- **16a bütçe kartları:** "Yazılım, AI, altyapı." gibi muhasebe etiketleri → "neyi finanse eder / neyi kanıtlar" cümleleri.
- **financial-frames:** "Dengeli çoklu akış" gibi etiketler → karar cümleleri (rakamsız; sayısal kanon değil).
- **risk-gates:** "Uyum açığı", "Hibrit altyapı · harcama kısıtı" → somut ölçüm + somut aksiyon.
- **09a:** Haftalık ritim → günlük çıktı cümleleri ("Cuma: haftalık raporda görüşme, doğrulanmış ilan, alıcı talebi ve risk sapması sunulur").
- **07a:** "Doğrulanmış stoktan eşleştirme" → tam akış cümlesi.
- **01b:** Sözlük gibi KPI açıklaması, claimLegend tekrarından arındırıldı.
- **investment-options:** 40M model sermayesi ile 15M yatırım teklifi ayrımı tek görünür cümle + kısa detay.
- **investor-dashboard:** Kırmızı bayraklar "X hedefin altında/aşarsa, Y kararını alırız" formatına getirildi.

## 3. Test ve görsel doğrulama

validate.py: **33 / 13 / 0 hata, GEÇTİ ✓.** tsc+vite temiz. Token/valueRef bütünlüğü korundu, yeni düz kanonik sayı eklenmedi (dup-scan uyarıları 13'te sabit kaldı, hiçbiri çelişki değil).

Chrome ile canlı DOM doğrulaması (bundle `index-kROLUqB3.js`): yeni 13 lead'i, "Dört metrik ayrı okunur", 08 "ana gelir aileleri belli" (engelsiz YOK), 16a tam-cümle kartları, governance karar cümlesi, 40M/15M ayrımı, kısaltılmış 05b lead'i, dashboard "X olursa Y" bayrakları, financial-frames karar metni — hepsi render oluyor. %38 ve 5,97 milyar yerinde; çözülmemiş token/metrik işareti = 0.

## 4. Kalan

Tek açık kalem (önceki turlardan): büyük React component refactor'u (ResponsiveDataTable/FieldRow/PillBadge/ChartTableView/format.ts/copy/labels.ts). Bu, kritik raporun "İdeal metin uzunluğu" hedeflerini UI seviyesinde (mobil tablo→kart, collapsible detay) kalıcılaştırır. Kritik raporun bazı önerileri (13/05b/investment-options "collapsible/tooltip detay") şu an görünür metni kısaltarak karşılandı; gerçek açılır-kapanır UI bu refactor turunda gelir. Görsel-regresyon riski taşıdığı için ayrı, kendi testli turu olarak duruyor.
