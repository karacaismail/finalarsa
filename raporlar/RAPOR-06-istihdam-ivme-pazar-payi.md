# RAPOR 06 · İstihdam Agresifliği, İvme ve Pazar Payı

> arsam.net / ParselQ · revizyon v3.0 · 2026-06-22
> Soru: "İstihdam planı ne kadar agresif başlarsa (2026–2027), erken pazar payı ne kadar büyür ve sonraki yılların çarpanı/ivmesi ne kadar hızlanır? Her ay hangi istihdamı yaratırsak ivme artar?"

> **Güncelleme (2026-06-22):** Agresif kadro eğrisi (38→256) + sola-kaydır gelir modeli kanonikleştirildi ve canlı siteye uygulandı. Aşağıdaki sayılar yeni canon'u yansıtır.

Bu rapor analitiktir. Kanonik sayıları (kadro eğrisi 38→256, %35 hedef pay) **değiştirmez**; mevcut planı baz alıp "öne yükleme" tezini test eder. Sayılar `database/data/` içindeki finansal model, pazar hunisi ve İK verisinden alınmıştır.

---

## 1. Kısa cevap (karar özeti)

Kısmen evet, ama sezgiyi iki noktada düzeltmek gerekiyor.

Doğru istihdamı öne çekmek **erken pazar payını gerçekten yükseltir** ve büyüme eğrisini sola kaydırır: tavana daha erken ulaşırsın veya medyan senaryodan (%35) iyimser senaryoya (%42) geçme şansın artar. Bu kısım doğru.

Ama "çarpan ilerleyen yıllarda daha da hızlanır" kısmı modelde **tersine** çalışıyor. Pazar payı bir tavana (online arsada %35–42) doğru giden bir **S-eğrisi** izler. Büyüme çarpanı (bir yılın payının bir önceki yıla oranı) **en yüksek erken yıllardadır** (2027'de ~6,4×) ve tavana yaklaştıkça yavaşlar (2032'de ~1,07×). Yani agresifliğin getirisi geç değil, **erken** realize olur: kalkış dikleşir, zirve öne çekilir.

En kritik nokta: bileşik etkiyi yaratan şey **maaş bordrosu değil**, iki-taraflı pazaryerinin likiditesi ve sahanın ilçe kapsamasıdır. İstihdam burada **girdi** (input); çarpanı yaratan şey, o istihdamın ürettiği **arz yoğunluğu ve ağ etkisidir**. Yanlış sırada veya likidite oluşmadan yapılan agresif işe alım, ivme değil sadece nakit yakar.

---

## 2. Kavramlar (terimler ilk geçtiği yerde)

İki-taraflı pazaryeri: arz tarafı (arsa/arazi ilanı veren satıcı) ile talep tarafı (alıcı/yatırımcı) aynı platformda buluşturulur. Değer, iki tarafın birbirini çekmesinden doğar (ağ etkisi).

Ağ etkisi: bir ilçede ilan sayısı arttıkça oraya daha çok alıcı gelir; alıcı arttıkça daha çok satıcı ilan verir. Kendini besleyen döngü budur ve "ivme/bileşik etki" dediğimiz şey teknik olarak budur.

Cold-start (soğuk başlangıç): pazaryeri ilk kurulduğunda ne arz ne talep vardır; döngü kendiliğinden dönmez. Çözüm, bir tarafı (genelde arzı) elle doldurmaktır.

S-eğrisi: pazar payı baştan yavaş, ortada hızlı, tavana yakın tekrar yavaş büyür. Sınırsız üstel büyüme değildir; bir **tavanı** vardır.

Büyüme çarpanı: bir yılın payının/gelirinin bir önceki yıla **oranı** (örn. 2,0× = iki kat). Senaryo çarpanı ile karıştırma.

Senaryo çarpanı: modelin kötümser/medyan/iyimser kollarını üreten sabit (×0,45 / ×1,0 / ×1,65). Bu rapordaki "çarpan" çoğunlukla **büyüme çarpanını** kasteder.

SOM (Serviceable Obtainable Market): gerçekçi olarak ele geçirilebilir pazar = SAM (346 milyar ₺) × %35 = **121 milyar ₺**. Bu, payın **tavanıdır**; istihdam ne kadar agresif olursa olsun bu tavanın üstüne pay üretilemez.

---

## 3. Modelin bugünkü gerçeği: çarpan zaten azalıyor

Mevcut medyan plan, online arsa pazarından (SAM) alınan payı şöyle öngörüyor. Tablodan görüleceği gibi yıllık büyüme çarpanı **erken yüksek, sonra düşüktür** — bu bir doyma (saturation) eğrisidir.

| Yıl | Pay (SAM) | YoY pay çarpanı | Mutlak kazanç | Gelir (medyan, milyon ₺) | YoY gelir çarpanı |
|---|---|---|---|---|---|
| 2026 H2 | %0,63 | — | +0,63 puan | 10,1 | — |
| 2027 | %4,05 | 6,4× | +3,4 puan | 309,3 | 30,6× (yıllıklandırılmışta 15,3×) |
| 2028 | %10,4 | 2,57× | +6,4 puan | 902,0 | 2,92× |
| 2029 | %19,52 | 1,88× | **+9,1 puan** | 2.018,7 | 2,24× |
| 2030 | %28,0 | 1,43× | +8,5 puan | 3.450,5 | 1,71× |
| 2031 | %32,86 | 1,17× | +4,9 puan | 4.798,7 | 1,39× |
| 2032 | %35,0 | 1,07× | +2,1 puan | 5.500 | 1,15× |

İki ayrı "ivme" tanımı var ve ikisi farklı zamanda zirve yapar:

Oransal ivme (çarpan): 2027'de en yüksek (6,4×), sonra sürekli düşer. Yani "çarpan ileride hızlanmaz; erkende patlar."

Mutlak ivme (yılda eklenen puan): 2029'da zirve yapar (+9,1 puan). Eğrinin en dik orta bölgesi burasıdır.

Bu ayrım tezin kalbidir: agresif erken istihdam **eğriyi sola kaydırır**. Yeni canon'da bu kayma zaten gerçekleşmiş durumdadır: +9,1 puanlık en dik bölge 2029'a çekilmiş, ara yıl payları (2027 %4,05, 2028 %10,4) erkene öne yüklenmiştir; %35 tavanı 2032'de sabit kalır ama oraya giden eğri daha erken dikleşir. "Maratona önde başlamak" gerçekte budur — daha yüksek bir nihai hız değil, **aynı eğriyi daha erken yaşamak** ve/veya tavanı %35'ten iyimser %42'ye taşımaktır.

Bir uyarı: modelin kendi `knownIssues` notu, mevcut yolda bile üretilen gelirin SOM'u zaman zaman ~2× aştığını işaret ediyor. Yani tavan zaten zorlanıyor; "daha da agresif pay" hedefi, tavanın (SOM tanımının) yeniden gözden geçirilmesini gerektirir, yoksa tutarsızlık üretir.

---

## 4. Agresif öne-yükleme ne yapar, ne yapmaz?

Bu nedir: kanonik kadro eğrisini (yıl-sonu 38, 92, ...) korurken **işe alımların kompozisyonunu ve sırasını öne çekmek** — özellikle saha (arz) ve ürün çekirdeğini ilk aylara yığmak. Agresif canon eğrinin kendisini zaten yukarı çekmiştir (2026 sonu 38, 2027 sonu 92).

Ne işe yarar: erken ilçe likiditesini hızlandırır, ağ etkisini daha erken tetikler, böylece S-eğrisini sola kaydırır.

Ne yapar:

Saha Keşif ekibi (araçlı) **arz** üretir — Ege yıldız ilçelerinde (Bodrum/Çeşme/Urla/Didim/Kuşadası) ilan/envanter yoğunluğunu doldurur. Cold-start'ı çözen ana kaldıraç budur.

Saha Satış ekibi (araçlı) likidite oluşmuş ilçede **talebi paraya** çevirir. ParselQ-RFQ çekirdeği (talep→teklif), amiral gelir akışını işletir. Mühendislik + AI çekirdeği, satılacak ürünü ve otomasyonu ayakta tutar.

Ne yapmaz:

Çarpanı ileride hızlandırmaz; çarpan yapısal olarak erken yüksektir. SOM tavanını (%35 → 121 milyar ₺) aşmaz. Maaş kütlesini büyütmek tek başına pay üretmez. İşe alındığı ay anında verim vermez — saha temsilcisi bölgeyi öğrenene kadar 1–2 ay rampa süresi vardır. Likidite oluşmadan kalabalıklaşan satış ekibi pay değil **atıl maliyet** üretir.

Özet mekanizma: istihdam = girdi, likidite/kapsama = çarpan. Doğru sıra olmadan girdi artırmak çarpan getirmez.

---

## 5. Hangi istihdam ivme yaratır? (sıra önemlidir)

Cold-start mantığı tek bir doğru sıra dayatır: **önce ürün, sonra arz, sonra talep/para, en sonda ölçek-destek.** Aşağıdaki tablo her rol ailesinin ürettiği şeyi ve ivmeye katkısını gösterir.

| Rol ailesi | Ürettiği şey | İvmeye katkı | Ne zaman öne çekilmeli |
|---|---|---|---|
| Mühendislik + AI/Veri çekirdeği | Ürün + otomasyon (satılacak şey) | Dolaylı, ön-koşul | İlk (Ağu 2026, 5 çekirdek) |
| Saha Keşif (araçlı) | Arz / ilan yoğunluğu | **En yüksek** (cold-start) | Çok erken (Eyl 2026'dan) |
| ParselQ-RFQ / sosyal moderasyon | Amiral gelir (talep→teklif) | Yüksek | Erken (Eki–Ara 2026) |
| Saha Satış (araçlı) | Talebin paraya dönmesi | Yüksek (likidite sonrası) | Likidite eşiği geçince |
| Pazarlama & Büyüme | Talep akışı / CAC yönetimi | Orta | 2026 sonu–2027 |
| Satıcı & Müşteri Ops | Elde tutma / kalite | Orta (ağ etkisini korur) | Kademeli |
| Finans/Hukuk, İK/İdari, Liderlik | Uyum + ölçekleme | Düşük erken-kaldıraç | Zorunluluk ölçüsünde, geç |

Buradaki en güçlü tek hamle: **Saha Keşif'i öne çekmek.** Çünkü iki-taraflı pazaryerinde alıcı, ilan yoğunluğu olan ilçeye gelir; arz yoksa pazarlama harcaması da boşa gider. Arz, ivmenin ateşleyicisidir.

---

## 6. Önerilen "ivmeli başlangıç" istihdam takvimi

Aşağıdaki takvim agresif kanonik yıl-sonu sayılarını (2026 H2 = 38, 2027 = 92) baz alır ve kompozisyonu arz-önce sıralar. Yani "öne-yüklü kadro, arz-önce sıra." 2026 aylık eğri modeldeki 5 → 14 → 23 → 31 → 38 patikasını izler. Her ay **net eklenen** roller (fonksiyon × dönem tam matrisi `IK_PLANI_AI_FIRST_256_v2_ivme.xlsx` → "AYLIK İSTİHDAM PLANI" sayfasındadır):

| Ay | Kadro | Net eklenen roller (öne-yükleme) | Üretilen ivme |
|---|---|---|---|
| Ağu 26 | 5 | +2 Mühendislik, +1 AI/Veri, +1 Ürün, +1 Liderlik (CPO) | Ürün çekirdeği kurulur |
| Eyl 26 | 14 | +4 Saha Keşif, +2 Mühendislik, +1 AI/Veri, +1 Ürün, +1 Satıcı Ops | İlk arz (ilan) toplanmaya başlar |
| Eki 26 | 23 | +3 Saha Keşif, +2 Mühendislik, +1 AI/Veri, +1 Ürün, +1 RFQ, +1 Satıcı Ops | İlçe envanteri yoğunlaşır |
| Kas 26 | 31 | +3 Saha Keşif, +1 Saha Satış, +1 RFQ, +1 Satıcı Ops, +1 Mühendislik, +1 AI/Veri | Likidite eşiğini geçen ilçede satış başlar |
| Ara 26 | 38 | +2 Saha Keşif, +1 Saha Satış, +1 RFQ, +1 Mühendislik, +1 Pazarlama, +1 Finans/Hukuk | Amiral RFQ döngüsü ısınır |

2027 (yıl-sonu 92, çeyreklik 51 → 65 → 79 → 92): öncelik saha satışının ve RFQ'nun ikinci/üçüncü ilçeye **çoğaltılması**, AI/Veri'nin saha verimini ölçeklemesi. İK master verisindeki C-Level zamanlaması bununla uyumludur: CAIO (Yapay Zeka Direktörü) 01.02.2027, CMO/CRO (Pazarlama/Gelir Direktörü) 01.07.2027, CFO 01.02.2028. Yani gelir-odaklı liderlik (CMO/CRO) tam da satışın ilçeye yayıldığı döneme denk getirilir.

Sayısal ek: tam aylık fonksiyon matrisi, baz-vs-agresif senaryo (nakit etkisiyle) ve ivme/pazar-payı matematiği formüllü olarak `IK_PLANI_AI_FIRST_256_v2_ivme.xlsx` dosyasında verilmiştir (5 sayfa). Bu Excel, kaynak `IK_PLANI_AI_FIRST_256_v1.xlsx` dosyasının ivme-optimize edilmiş yeni sürümüdür; eski 18→256 eğrisi yerine **agresif canon 38→256** taban alınmıştır.

İlke: yeni ilçe ancak bir öncekinde **arz likiditesi eşiği** tutturulunca açılır. Saha Keşif önce gider, Saha Satış likiditeyi takip eder. Sıra bozulursa satış ekibi boş gezer.

---

## 7. Riskler ve sınırlar

Nakit sınırı (en sert kısıt): plan 40 milyon ₺ sermaye ile çalışır; agresif öne-yüklü kadroyla 2026 H2'de kasa dibi ~32,5 milyon ₺'ye iner (yastığın ~7,5 milyon ₺'si kullanılır, 40M içinde kalır). Eğriyi daha da yukarı çeken varyant bu dibi derinleştirir. 40 milyon ₺ tavanı aşılırsa ya ek sermaye gerekir ya da plan tutmaz. Güvenli alan: kasa dibini 40 milyon ₺ içinde tutmak.

Marj profili: sola-kaydır gelir modelinde net marj 2027'de ~%72'den başlayıp 2032'de ~%90'a doğru genişler. Erken yıllarda agresif kadro bordrosu bu marjı baskılar; gelir öne büyüdükçe marj toparlar.

Rampa gecikmesi: saha temsilcisi 1–2 ay verimsizdir. "Agresif işe alım" anında paya dönmez; gecikmeli döner.

Likidite-öncesi işe alım: arz/talep oluşmadan büyüyen ekip atıl kapasitedir (negatif ROI ayları). En sık yapılan hata budur.

Kalite/güven riski: sahayı çok hızlı büyütmek düşük kaliteli ilan ve güven kaybı üretebilir; bu, kurmaya çalıştığın ağ etkisini **zedeler**.

Tavan riski: SOM %35 (121 milyar ₺). Tavanın üstüne işe alım sıfır pay-ROI verir; modelin SOM tanımıyla da çelişir (bkz. §3 uyarısı).

---

## 8. Karar çerçevesi

Güvenli olan: agresif kanonik eğride kal (38, 92, ...), kompozisyonu arz-önce öne çek (§6). Risk düşük; getiri: eğri sola kayar, ivme öne gelir, nakit dibi 40 milyon ₺ içinde kalır.

Riskli olan: eğriyi canon'un da üstüne çek (örn. 2026 sonu >40, 2027 sonu >100). Getiri: medyandan iyimsere (%35→%42) geçme şansı. Risk: nakit yastığı incelir, likidite oluşmadan işe alım atıl kalabilir, kalite düşebilir.

Enterprise (kurumsal) doğru yaklaşım: işe alımı **metrik-tetikli kapılara** bağla. Her yeni saha kadrosu/ilçe açılışı, önceki ilçenin likidite eşiği, CAC (müşteri edinme maliyeti) ve doluluk metriği tutturulunca onaylanır. Bütçe sınırı ve insan onayı (yatırımcı/CEO) kapısı zorunlu.

Senin durumunda pratik öneri: önce güvenli varyantı uygula — Ege yıldız ilçelerinde Saha Keşif'i öne çekerek arz likiditesini hızlandır; Saha Satış ve RFQ'yu likidite eşiğine bağla; nakit dibini 40 milyon ₺ içinde tut. İlk ilçede ağ etkisi ölçülebilir biçimde dönmeye başlarsa, ölçülü agresif varyanta (eğriyi hafif yukarı) ek sermaye veya güçlü nakit akışıyla geç.

---

## 9. Doğrulama notu

Bu rapordaki tüm sayılar kanonik kaynakla (`database/data/financial-model.json`, `market-tam-sam-som.json`, `hr-plan.json`, `hr-master-256.json`) birebir uyumludur. Pay çarpanları ve mutlak puan kazançları bu verilerden hesaplanmıştır. Agresif + sola-kaydır canon'a geçişte `database/` içeriği **güncellenmiş** ve tutarlılık test-kapısı (`validate.py`) yeniden çalıştırılarak **GEÇMİŞTİR**. Rapor, kanonik çıpalarla çelişmez: kadro 38→256 (2026=38, 2027=92, 2028=140, 2029=185, 2030=225, 2031=256, 2032=256), %35 hedef pay, 2032 medyan 5,5 milyar ₺ / %35 sabit.
