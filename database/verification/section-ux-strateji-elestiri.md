# arsam.net Yatırımcı Sunumu - Section, UX ve Strateji Eleştirisi

**Rapor tarihi:** 20 Haziran 2026  
**Amaç:** Bu rapor, mevcut yatırımcı sunumunun Üzeyir Engin profiline göre ikna gücünü, bölüm akışını, dilini, tasarım mantığını ve stratejik anlatısını eleştirir.  
**Konum:** `dogrulama-raporu.md` rakamların ve dış iddiaların doğruluğunu denetler. Bu rapor ise sunumun karar psikolojisini, UX akışını ve içerik felsefesini denetler.

---

## 1. Yönetici özeti

Mevcut proje teknik mimari açısından doğru bir yöne kurulmuş durumda: içerik `database/` altında JSON dosyalarına ayrılmış, sunum katmanı `landing/` içinde bu verileri parse edip render ediyor, metrikler `shared/metrics.json` üzerinden tek kaynaktan yönetiliyor, ECharts ile grafik katmanı eklenmiş ve dış kaynaklı iddialar için ayrı bir doğrulama raporu oluşturulmuş. Bu, sunumun ileride sürüm yönetimiyle, veri düzeltmeleriyle ve farklı yatırımcı profillerine göre yeniden paketlenebilmesi için güçlü bir temel sağlar.

Fakat mevcut içerik ve sunum dili, hedef yatırımcı profiliyle tam örtüşmüyor. Sunum yer yer teknoloji girişimi demo günü gibi konuşuyor; oysa hedef kişi klasik büyük emlak/arsa ticaretinden gelen, lokasyon, tapu, satış, nakit akışı, itibar ve operasyon disipliniyle düşünen bir yatırımcı. Bu profil için "AI-first", "counter-positioning", "gerilla", "silah", "cephane", "valuation katlanır" gibi ifadeler ancak iyi çevrilirse anlamlı olur. Çevrilmeden bırakıldığında heyecan değil, kontrolsüzlük hissi üretir.

Bu nedenle ana strateji değişmelidir: sunum "teknolojiye yatırım yapın" dememeli; "bildiğiniz arsa işini, doğrulanabilir veri, güvenli ilan, AI destekli operasyon ve ölçülü sermaye planıyla dijital bir işletmeye çevirelim" demelidir.

Ana hüküm:

> arsam.net bir web sitesi değildir. Arsa satışında güven, doğrulama, ilan, veri, pazarlama ve operasyonu tek panele toplayan dikey bir pazar işletmesidir.

Bu cümle sunumun omurgası olmalıdır. Geri kalan her bölüm bu omurgaya hizmet etmelidir.

---

## 2. Hedef yatırımcı profili

### 2.1. Yatırımcı nasıl düşünür?

Üzeyir Engin tipi yatırımcı, yazılım mimarisinden önce şu sorulara bakar:

- Bu iş gerçek satış üretir mi?
- Satıcıyı nereden bulacağız?
- Alıcı güvenecek mi?
- Tapu, imar, kapora, sahte ilan gibi riskler nasıl yönetilecek?
- Bu iş benim mevcut ağımı büyütür mü?
- Ne kadar para koyacağım, ne zaman başabaşa gelecek?
- Kim yönetecek, hangi kadro kurulacak?
- İtibar riski var mı?
- Ben bu işte stratejik ortak mıyım, yoksa sadece para veren kişi miyim?

Bu yatırımcı için "kategori tasarımı", "AI-first panel", "platform ekonomisi" ve "programmatic SEO" ancak kendi dünyasına çevrilirse ikna edicidir. Çeviri yapılmazsa jargon olarak kalır.

### 2.2. İkna anahtarları

Bu profilde ikna beş eksene dayanmalıdır:

1. **İtibar:** Platform güven üretmeli, yatırımcıyı tartışmalı satış kalıplarından uzaklaştırmalı ve kurumsal bir arsa pazarı inşa etmeli.
2. **Kontrol:** Sermaye harcaması kapılara bölünmeli; her aşamada neyin ölçüleceği açık olmalı.
3. **Nakit:** Başabaş, gider, personel ve pazarlama bütçesi yalın ama denetlenebilir anlatılmalı.
4. **Saha gücü:** Ege pilotu, emlakçı ağı, arsa ofisi mantığı ve bölgesel satıcı kazanımı teknoloji anlatısından önce gelmeli.
5. **Güvenli ölçek:** AI ve yazılım, insanı ortadan kaldıran bir hikaye gibi değil, operasyonu denetleyen ve hızlandıran altyapı gibi anlatılmalı.

### 2.3. Kaçınılması gerekenler

Sunum şu hatalardan kaçınmalıdır:

- Yatırımcıyı "teknoloji bilmez" gibi konumlamak.
- Kendi arsa geçmişini ima yoluyla eleştirmek.
- Savaş, silah, komando, yok etmek, ezmek gibi ifadelerle gereksiz agresif görünmek.
- "Sıfır risk", "garanti", "kesin", "kopyalanamaz" gibi denetimde kırılacak cümleler kurmak.
- Sahte kıtlık üretmek: "Bu sayfayı 5 yatırımcı daha gördü, 3 slot kaldı" gibi ifadeler kesinlikle kullanılmamalıdır.
- Doğrulanmamış dış rakamları resmi gerçek gibi sunmak.

Doğru ton şudur: sakin, ticari, hesap verebilir, saygılı, kontrollü ve gerçekçi.

---

## 3. Mevcut 16 bölümün eleştirisi

Bu bölüm, mevcut section sırasını tek tek değerlendirir. Amaç dosyaları suçlamak değil; her bölümün yatırımcı kararına hizmet edip etmediğini görmek ve yeniden işlevlendirmektir.

### 01 - Hero

**Mevcut niyet:** "Türkiye'nin ilk dikey arsa pazaryeri" konumlandırmasını ilk ekranda vermek.  
**Sorun:** İlk ekran kategori iddiası veriyor ama yatırımcıya özel karar bağlamını kurmuyor. Bu aşamada sunum artık ilk tanışma sunumu değil; üçüncü görüşmeden sonra değerlendirme sunumu.  
**Yeni işlev:** "Üzeyir Bey için karar notu" hissi verilmeli. İlk ekran kişisel, net ve ciddi olmalı.

Önerilen yön:

> arsam.net - Arsa işini dijitalde güvenli, ölçülebilir ve ölçeklenebilir hale getiren yatırım planı.

Alt metin:

> Bu not, önceki üç görüşmede konuşulan ürün, strateji ve finansal planı karar aşamasına taşımak için hazırlanmıştır.

### 02 - Problem

**Mevcut başlık:** "Arsa almak tehlikeli."  
**Sorun:** Bu ifade doğru bir acıyı yakalıyor ama fazla kaba. Arsa ticareti yapan bir yatırımcıya karşı "senin sektörün tehlikeli" gibi duyulabilir.  
**Yeni başlık:** "Arsa dijitalde güven maliyeti yüksek bir ürün."

Bu bölümde suçlayıcı değil, sistemik konuşulmalı:

- Aynı parselin farklı fiyatlarla çıkması.
- Tapu/imar bilgisinin ilanda standart olmaması.
- Kapora ve sahte ilan riskinin alıcı güvenini düşürmesi.
- EİDS ve ilan doğrulama döneminin eski ilan mantığını zorlaması.

Bu bölümün amacı korkutmak değil, "neden dikey uzmanlık gerekiyor?" sorusunu açmaktır.

### 03 - Pazar

**Mevcut niyet:** TAM/SAM/SOM ve gelir potansiyelini göstermek.  
**Sorun:** Fazla metrik yığılması var. Bazı metrikler doğrulanmış, bazıları model varsayımı. Bu ayrım sahnede net değilse yatırımcı güveni zedelenir.  
**Yeni işlev:** Pazar anlatısı üç katmana ayrılmalı:

- Resmi/verili gerçek: TKGM/TÜİK işlem adetleri.
- Model varsayımı: ortalama arsa işlem değeri, online penetrasyon, SOM.
- Hedef: gelir, pazar payı, take rate.

TAM/SAM/SOM terimleri korunabilir ama Türkçe karşılığı verilmelidir:

- TAM: toplam pazar.
- SAM: dijitale açık pazar.
- SOM: ulaşılabilir hedef pazar.

Grafik önerisi: bir huni grafiği kalmalı; yanında küçük bir "hangi rakam ne tür?" tablosu yer almalı.

### 04 - Ürün

**Mevcut niyet:** Arsa için özel ürün katmanlarını anlatmak.  
**Sorun:** Ürün listesi doğru ama fazla soyut. "Tapu doğrulama", "drone tur", "emsal fiyat", "harita", "emanet ödeme" gibi maddeler gerçek ekran mantığına bağlanmıyor.  
**Yeni işlev:** Bu bölüm bir panel deneyimi olarak anlatılmalı.

Önerilen çerçeve:

> İlan sayfası yalnızca fotoğraf göstermez; parselin güven dosyasını gösterir.

Ürün katmanları:

- İlan kimliği ve yetki doğrulama.
- Parsel, konum ve imar katmanı.
- Emsal fiyat ve bölgesel m2 aralığı.
- Drone/yerinde keşif materyali.
- Kapora ve ön ödeme güven protokolü.

Bu bölümde UI mockup veya panel ekranı şarttır. Sadece madde listesi yatırımcı zihninde ürünü somutlaştırmaz.

### 05 - İş modeli

**Mevcut başlık:** "İlan reklamı. Komisyon yok."  
**Güçlü taraf:** Komisyonsuz model doğru bir karşı konumlandırma sağlar.  
**Sorun:** "sahibinden satıcı kaybediyor" gibi ifadeler doğrulanmadan saldırgan duyulur.  
**Yeni işlev:** Satıcı dostu gelir modeli anlatılmalı.

Önerilen ifade:

> arsam.net satıştan pay almaz; doğrulanmış ilan, görünürlük, vitrin, veri ve operasyonel hizmetlerden gelir üretir.

Bu, yatırımcıya daha anlaşılır gelir kalemleri verir.

### 06 - Strateji

**Mevcut başlık:** "Asimetrik komando."  
**Sorun:** Bu bölüm strateji teorisi açısından yaratıcı ama hedef yatırımcı için fazla agresif ve oyunlaştırılmış. "Tek bir gerilla" dili, disiplinli işletme planı yerine romantik savaş anlatısı gibi duruyor.  
**Yeni başlık:** "Pazar kurulum planı."

Strateji şu dile çevrilmelidir:

- Önce dar bölgede yoğunlaş.
- Satıcı arzını kur.
- İlan kalitesini standardize et.
- Alıcı güvenini veriyle artır.
- Başarılı bölge formülünü başka bölgelere taşı.

Bu bölüm "nasıl kazanacağız?" sorusunu cevaplamalı; "rakibi nasıl yeneriz?" sorusuna takılmamalıdır.

### 07 - Cephane

**Mevcut başlık:** "Seçilmiş silahlar."  
**Sorun:** "Silah", "cephane", "envanter" dili sunuma gereksiz sertlik katıyor. Bu dil içeride strateji atölyesinde kullanılabilir; yatırımcı sunumunda yumuşatılmalıdır.  
**Yeni başlık:** "Büyüme playbook'u."

Yeni alt başlıklar:

- Bölgesel arz toplama.
- Kurucu satıcı programı.
- Programatik bölge sayfaları.
- Drone ve doğrulama ile premium ilan.
- Diaspora alıcı kanalı.
- Emlakçı paneli ve CRM.

Burada 470 model gibi büyük sayıların öne çıkarılması yerine "ilk 6 uygulanabilir büyüme hamlesi" gösterilmelidir.

### 08 - Köprü

**Mevcut niyet:** TAM'dan SOM'a mantık zinciri.  
**Güçlü taraf:** Bu bölüm doğru bir yatırımcı sorusunu cevaplıyor.  
**Sorun:** Eğer önceki pazar varsayımları açıkça etiketlenmezse bu bölüm abartılı gelir vaadine dönüşür.  
**Yeni işlev:** "Resmi veri -> varsayım -> hedef -> gelir modeli" zinciri açıkça gösterilmeli.

Kural:

- Resmi veri yeşil etiket.
- Model varsayımı altın etiket.
- Hedef metrik grafit etiket.
- Doğrulanmamış dış iddia kullanılacaksa "şirket tahmini" etiketi.

### 09 - Bootstrap / Başabaş

**Mevcut başlık:** "Bootstrap - kontrollü yakım."  
**Güçlü taraf:** Bu bölüm yatırımcı için çok değerli; paranın nereye gideceğini ve ne zaman başabaş olacağını anlatıyor.  
**Sorun:** "Makine kendi enerjisini üretir" iyi bir imge ama biraz fazla slogan. Ayrıca "risk belirsiz değil" ifadesi yerine riskin kapılara bölündüğünü söylemek daha doğru.  
**Yeni başlık:** "Başabaşa kadar sermaye planı."

Bu bölümde ana grafik şu olmalı:

- Yatırım girişi.
- Kurulum gideri.
- Pazarlama gideri.
- Personel gideri.
- Başabaş ayı.
- Başabaş sonrası kasa.

Bu bölüm daha fazla öne alınabilir; çünkü yatırımcının en kritik sorusu budur.

### 10 - Teknopark

**Mevcut başlık:** "Mecidiyeköy değil İTÜ ARI."  
**Sorun:** Başlık konuşma içinde etkili olabilir ama rapor/sunum tonunda hafif kalıyor. "Vergi sıfır" gibi kesin cümleler hukuki ve operasyonel şartlara bağlı olduğu için yumuşatılmalı.  
**Yeni başlık:** "Teknopark ve teşvik avantajı."

Önerilen dil:

> Şirket uygun proje kabulüyle teknopark çatısına alınırsa, yazılım gelirlerinde 4691 kapsamlı vergi avantajı doğar.

Burada "garanti tasarruf" denmemeli. "Modelde dikkate alınan avantaj" veya "uygunluk halinde oluşacak avantaj" denmelidir.

### 11 - Roadmap / Risk

**Mevcut başlık:** "Rakip gördüğünde ne yapar?"  
**Sorun:** Bölüm rekabet takıntılı başlıyor. Oysa yatırımcı için daha önemli soru "biz hangi sırayla ne yapacağız ve nerede duracağız?" sorusudur.  
**Yeni başlık:** "12 aylık uygulama planı ve risk kapıları."

Risk tablosu korunmalı ama "yanıt" sütunu daha yönetim diliyle yazılmalı:

- Önlem.
- Ölçüm.
- Karar kapısı.
- Geri çekilme veya düzeltme aksiyonu.

Örnek:

> Risk: Satıcı arzı beklenenden yavaş oluşur.  
> Ölçüm: İlk 90 günde aktif doğrulanmış ilan sayısı.  
> Aksiyon: Bölge daraltma, kurucu satıcı teşviki, saha satış desteği.

### 12 - Rekabet

**Mevcut başlık:** "Sadece biz dikey + küratoryal."  
**Güçlü taraf:** Dikey uzmanlık doğru savunma alanı.  
**Sorun:** "Sadece biz" ifadesi denetlenebilir bir iddia değildir. Rakipler yarın dikey sayfa açabilir. Asıl savunma "dikey sayfa açmak" değil, saha arzı + doğrulama + veri standardı + satıcı ilişkisi toplamıdır.  
**Yeni başlık:** "Dikey uzmanlık ve operasyonel savunma."

Mesaj:

> Büyük yatay platformlar trafik avantajına sahiptir. arsam.net'in savunması trafik değil; arsa özelinde doğrulama, veri standardı, bölgesel arz ve satıcı operasyonudur.

Bu daha gerçekçi ve daha güçlüdür.

### 13 - Finansal

**Mevcut niyet:** 78 aylık modeli görselleştirmek.  
**Güçlü taraf:** Modelin detaylı olması yatırımcı güveni sağlar.  
**Sorun:** Mevcut modelde bazı agresif varsayımlar ve daha önce tespit edilen tutarsızlıklar var: SOM aşımı, ilan başına gelir varsayımı, işveren maliyeti çarpanı, kur güncelliği. Bunlar açıkça "düzeltilecek varsayım" veya "model girdisi" diye etiketlenmeden sunulmamalı.  
**Yeni işlev:** Finansal bölüm "tek plan" değil, "baz plan + hassasiyetler" olarak gösterilmeli.

Grafikler:

- Gelir/gider/net.
- Nakit ve başabaş.
- Personel büyümesi.
- Kötümser/baz/iyimser senaryo.

Her grafikte "kaynak: finansal model v9-15" ve "varsayımlar için ek tablo" bulunmalıdır.

### AI-first panel

**Mevcut niyet:** AI ile daha az kadroyla daha çok operasyon yapılacağını göstermek.  
**Sorun:** "7 kişi 700 kişinin işi" ifadesi abartılı duyulur. Ayrıca AI'ın insan yerine geçtiği izlenimi, klasik yatırımcıda operasyon riski yaratabilir.  
**Yeni başlık:** "AI destekli operasyon ve denetim."

Doğru ifade:

> AI, operasyonu insansızlaştırmak için değil; ilan kontrolü, müşteri yönlendirme, içerik üretimi, veri temizliği ve raporlama maliyetini düşürmek için kullanılır. İnsan karar ve denetim zinciri korunur.

### 14 - CPO

**Mevcut başlık:** "Tam odak için üç şart."  
**Güçlü taraf:** Maaş, araç ve sağlık sigortası açıkça yer alıyor.  
**Sorun:** "Rica" dili profesyonel pazarlıkta zayıf kalabilir. Ayrıca çalışma şartları kişisel talep gibi değil, tam zamanlı odak maliyeti gibi anlatılmalı.  
**Yeni başlık:** "Tam zamanlı odak çalışma varsayımı."

Bu bölümde üç kalem net yazılmalı:

- Aylık sabit ücret.
- Araç tahsisi veya eşdeğer mobilite çözümü.
- Aile dahil genel, tam kapsamlı özel sağlık sigortası.

Önerilen metin:

> Bu rol, mevcut işlerden ayrılarak tam zamanlı odak gerektirir. Bu nedenle modelde CPO için sabit ücret, mobilite ve aile dahil tam kapsamlı özel sağlık sigortası çalışma varsayımı olarak tanımlanmıştır.

Bu ifade ne mahcup ne agresiftir.

### 15 - Yatırım

**Mevcut başlık:** "Üç katman. Tek pencere."  
**Sorun:** Yatırım seçenekleri yararlı; ancak "sonra valuation katlanır, koşullar sertleşir" gibi ifadeler baskıcı ve yapay kıtlık hissi verir. Tek yatırımcıya özel görüşmede bu ton doğru değildir.  
**Yeni başlık:** "Yatırım seçenekleri ve karar çerçevesi."

Üç seçenek korunabilir ama her seçenek için şunlar yazılmalı:

- Tutar.
- Hisse.
- Ne finanse eder?
- Hangi risk kapanır?
- Yatırımcı rolü nedir?

"Board seat" yerine "yönetim kurulunda temsil" veya "stratejik karar katılımı" denmelidir.

### 16 - Kapanış

**Mevcut başlık:** "Bu fırsat herkes için değil."  
**Sorun:** Klişe ve FOMO kokan bir kapanış. Tek yatırımcıya özel görüşmede daha saygılı ve net bir kapanış gerekir.  
**Yeni başlık:** "Bugünkü karar: tutar, rol, ilk 30 gün."

Kapanış üç karar istemelidir:

1. Hangi yatırım seçeneğiyle ilerleniyor?
2. Yatırımcının rolü ne olacak?
3. İlk 30 günde hangi işler yapılacak?

Son cümle:

> Karar sizde. Bizim önerimiz, önce kontrollü pilotu başlatmak ve ilk 90 günde satıcı arzı, doğrulanmış ilan ve gelir sinyalini birlikte ölçmek.

---

## 4. Önerilen yeni bölüm akışı

Mevcut 16 bölüm teknik olarak çalışıyor; fakat karar psikolojisi açısından sıra değişmelidir. Yeni akış aşağıdaki gibi olmalıdır.

### 01. Özel karar notu

İlk ekran kişiselleştirilmiş olmalı. "Bu sunum size özel hazırlandı" denebilir, fakat sahte kıtlık kurulmaz. Amaç ciddiyet ve bağlam vermektir.

### 02. Önceki toplantıların özeti

Üç toplantı net özetlenir:

- Toplantı 1: Web sitesi değil, B2B2C SaaS/pazar işletmesi olduğu konuşuldu.
- Toplantı 2: Ürün, yönetim süreci ve GTM stratejisi konuşuldu.
- Toplantı 3: Finansal plan, gider, gelir, senaryo ve çalışma modeli konuşuldu.
- Bugün: başabaş, insan kaynağı, yan haklar, yatırım seçeneği ve karar adımı.

Bu bölüm yatırımcıya "süreç ciddiye alınmış" hissi verir.

### 03. Neden bu yatırımcı doğru ortak?

Bu bölüm yatırımcıyı parası olan kişi değil, stratejik ortak olarak konumlar.

Ana mesaj:

> Bu işin yazılım tarafını biz kurarız; fakat arsa piyasasının güven, saha ve satış refleksi olmadan kategori kurulmaz.

Bu cümle yatırımcıyı merkeze alır.

### 04. Problem: arsa işinde dijital güven boşluğu

Problem sektörün ahlaki suçlaması gibi değil, altyapı eksikliği gibi anlatılır.

### 05. Çözüm: doğrulama + ilan + veri + güvenli ödeme

Ürün tek panel ve tek ilan dosyası mantığıyla anlatılır.

### 06. Pazar ve varsayımlar

Doğrulanmış rakamlar, model varsayımları ve hedefler ayrılır.

### 07. İş modeli

Komisyon değil; ilan, vitrin, doğrulama, veri ve operasyonel hizmet geliri.

### 08. GTM / Ege pilotu

İlk pazar olarak Ege/Bodrum/Söke/Aydın gibi sahaya yakın, arsa ilgisi yüksek bölgeler anlatılır. Amaç ulusal kampanyadan önce arz kalitesi ve satış sinyali üretmektir.

### 09. Rekabet ve savunma

Rakip küçümsenmez. Savunma avantajı yatay platformlara karşı arsa derinliği, doğrulama ve saha operasyonudur.

### 10. AI destekli operasyon

AI maliyet ve hız avantajı olarak anlatılır; insan denetimi korunur.

### 11. İK planı

Kadro ne zaman, neden alınacak? Hangi rol gelir üretir, hangi rol riski azaltır? Bu açıkça gösterilir.

### 12. Başabaş analizi

Yatırımcının en çok bakacağı bölüm. Sermaye, harcama, başabaş ve kasa grafiği olmalıdır.

### 13. Risk ve kontrol kapıları

Her riskin ölçümü ve aksiyonu olur. Bu bölüm yatırımcı güvenini artırır.

### 14. Teknopark ve teşvik

Vergi/teşvik avantajları şartlı ve hukuki doğrulukla anlatılır.

### 15. CPO çalışma şartları

Tam zamanlı odak için maaş, araç ve aile dahil özel sağlık sigortası iş varsayımı olarak yazılır.

### 16. Yatırım seçenekleri

Tutar, hisse, finanse edilen alan, kapanan risk ve yatırımcı rolü yazılır.

### 17. Kapanış ve ilk 30 gün

Kapanış karar odaklı olur. İlk 30 gün somut planla biter.

---

## 5. Dil ve üslup talimatları

### 5.1. Genel dil ilkesi

Sunum dili kısa ama tam cümleli olmalıdır. "Az konuş öz konuş" ilkesi, telgraf diline dönüşmemelidir. Türkçede ikna çoğu zaman yüklem, gerekçe ve bağlaç ilişkisiyle kurulur. Sadece isim tamlamaları dizmek, cümleyi güçlü yapmaz; çoğu zaman sunumu soğuk ve mekanik yapar.

Yanlış örnek:

> Dikey pazar. Güven. Veri. Ölçek. AI-first panel.

Doğru örnek:

> arsam.net, arsa ilanını yalnızca yayınlayan bir site değil; ilanın doğruluğunu, konum bilgisini, fiyat emsalini ve satıcı güvenini aynı ekranda yöneten dikey bir pazar işletmesidir.

### 5.2. Cümle yapısı

Her bölümde şu yapı kullanılmalıdır:

1. Ana hüküm.
2. Gerekçe.
3. Kanıt veya veri.
4. Yatırımcı için sonuç.

Örnek:

> Arsa dijitalde güven maliyeti yüksek bir üründür. Çünkü alıcı yalnızca fotoğrafa değil; tapu, imar, konum, emsal fiyat ve satıcı doğruluğuna bakar. Mevcut yatay platformlar bu bilgileri standart bir güven dosyasına dönüştürmez. arsam.net'in dikey fırsatı buradan doğar.

### 5.3. Yasaklı veya sınırlı kelimeler

Şu kelimeler yatırımcı sunumunda kullanılmamalıdır:

- silah
- cephane
- komando
- gerilla
- yok etmek
- ezmek
- öldürmek
- garanti
- sıfır risk
- kesin kazanır
- FOMO
- son fırsat
- slot kaldı
- herkes için değil

Bu kelimeler iç strateji atölyesinde kullanılabilir; yatırımcı sunumunda kullanılmamalıdır.

### 5.4. Kullanılması gereken kelimeler

Şu kelimeler sunumun ana dilini kurmalıdır:

- güven
- doğrulama
- kontrol
- pilot
- ölçüm
- başabaş
- karar kapısı
- saha
- satıcı arzı
- alıcı güveni
- işletme planı
- veri standardı
- operasyon disiplini
- stratejik ortaklık

### 5.5. İngilizce terim kullanımı

İngilizce terimler azaltılmalıdır. Zorunluysa ilk kullanımda Türkçesi verilmelidir.

Önerilen karşılıklar:

- `valuation` -> değerleme
- `runway` -> nakit çalışma süresi
- `burn rate` -> aylık nakit yakımı
- `moat` -> savunma avantajı
- `lead investor` -> lider yatırımcı
- `board seat` -> yönetim kurulunda temsil
- `AI-first` -> AI destekli operasyon
- `GTM` -> pazara giriş planı
- `CAC` -> müşteri edinme maliyeti
- `LTV` -> müşteri yaşam değeri

### 5.6. Kaynak ve varsayım dili

Her güçlü iddia şu etiketlerden biriyle gelmelidir:

- **Doğrulanmış kaynak:** Resmi veya birincil kaynakla desteklenir.
- **Model varsayımı:** Finansal modelin kabulüdür.
- **Hedef:** Şirketin ulaşmak istediği değerdir.
- **Şirket tahmini:** Dış kaynakla doğrulanmamış ama iç modelde kullanılan tahmindir.

Bu ayrım yapılmadığında sunum due diligence sırasında kırılır.

---

## 6. UI/UX ve tasarım dili

### 6.1. Genel görsel yön

Tasarım dili "startup landing page" gibi değil, "arsa ofisi + finans masası + kontrol paneli" gibi hissettirmelidir.

Görsel referanslar:

- Parsel sınırları.
- Kadastro/imar katmanları.
- Tapu doğrulama dosyası.
- Drone görüntüsü.
- Satıcı paneli.
- Emlakçı CRM ekranı.
- Nakit akışı ve başabaş grafiği.

Dekoratif soyut illüstrasyonlar azaltılmalıdır. Yatırımcı gerçek ürünü, gerçek operasyonu ve gerçek kontrol mekanizmasını görmek ister.

### 6.2. Renk sistemi

Mevcut açık tema doğru yönde. Renkler şu hissi vermelidir:

- Beyaz: açıklık ve şeffaflık.
- Grafit/siyah: ciddiyet ve okunurluk.
- Kadastro yeşili: arazi, parsel, doğrulama.
- Ölçülü altın: yatırım, değer, stratejik vurgu.
- Kiremit/pas tonu: risk ve uyarı.

Tek renkli yeşil tema kurulmamalıdır. Yeşil sadece "doğrulama / pozitif / ilerleme" anlamında kullanılmalıdır.

### 6.3. Bölüm yoğunluğu

Her bölüm şu sınırı geçmemelidir:

- 1 ana başlık.
- 1 ana hüküm.
- En fazla 3 destekleyici madde.
- En fazla 1 grafik veya 1 tablo.
- En fazla 1 not kutusu.

Mevcut stat card yoğunluğu azaltılmalıdır. Çok fazla kart, yatırımcıya netlik değil veri kalabalığı verir.

### 6.4. Grafik ilkeleri

Grafikler yönetim kurulu seviyesinde okunmalıdır. Amaç veri gösterisi yapmak değil, karar aldırmaktır.

Her grafikte şu sorular cevaplanmalıdır:

- Bu grafik hangi kararı destekliyor?
- Hangi veri doğrulanmış, hangisi varsayım?
- Yatırımcı bu grafikten hangi sonucu çıkarmalı?

Önerilen grafikler:

- Pazar hunisi: resmi veri -> model varsayımı -> hedef.
- Başabaş waterfall: yatırım -> gider -> başabaş -> kasa.
- Kadro planı: rol gruplarına göre büyüme.
- Risk matrisi: risk -> ölçüm -> karar kapısı.
- Yatırım seçenekleri: tutar -> kapanan risk -> rol.

### 6.5. Mobil ve desktop akışı

Mobile-first yapı korunmalı, fakat bu sunum muhtemelen toplantıda desktop/tablet üzerinden açılacak. Desktop görünümde daha az dikey scroll, daha güçlü bölüm hiyerarşisi ve daha okunabilir grafik alanı gerekir.

Mobilde:

- Kartlar tek kolon.
- Grafikler kısa açıklamayla desteklenir.
- Tablo varsa yatay kaydırma açıkça görünür.

Desktopta:

- Bir bölüm bir karar fikrine odaklanır.
- Grafik ve metin yan yana kullanılabilir.
- Çok uzun metin blokları bölünür.

---

## 7. İkna stratejisi

### 7.1. Ana ikna çerçevesi

Sunumun ana psikolojik hareketi şu olmalıdır:

1. Sizin bildiğiniz arsa işi doğru.
2. Dijitalde bu işin güven ve veri altyapısı eksik.
3. Bu eksikliği teknolojiyle değil, saha + doğrulama + operasyon + yazılımla çözüyoruz.
4. Para başabaşa kadar kontrollü harcanıyor.
5. İlk pilot başarılı olursa ulusal ölçekleme mantıklı hale geliyor.
6. Karar bugün tüm Türkiye'yi almak değil; ilk kontrollü kapıyı açmak.

Bu çerçeve yatırımcıyı tehdit etmez. Onu merkeze alır ve kararını küçültür.

### 7.2. Tongue fu: kullanılacak ifade türleri

Yanlış:

> Sahibinden'i yeneriz.

Doğru:

> Sahibinden trafik avantajına sahip. Bizim fırsatımız, onların yatay kaldığı yerde arsa özelinde daha derin güven ve veri standardı kurmak.

Yanlış:

> Bu fırsat kaçarsa değerleme katlanır.

Doğru:

> Ulusal kampanya sonrası değerleme yeniden ele alınır. Bugünkü teklif, kampanya öncesi riskleri birlikte üstlenme teklifidir.

Yanlış:

> 7 kişi 700 kişiyi yener.

Doğru:

> AI destekli operasyon, aynı iş yükünü daha düşük kadro ve daha hızlı kontrol döngüsüyle yönetmemizi sağlar.

Yanlış:

> Arsa almak tehlikeli.

Doğru:

> Arsa işleminde güven maliyeti yüksektir. Platformun görevi bu maliyeti alıcı ve satıcı için düşürmektir.

### 7.3. Pazarlık stratejisi

CPO şartları pazarlıkta kişisel istek gibi sunulmamalıdır. Şöyle çerçevelenmelidir:

> Bu iş tam zamanlı odak gerektirir. Bu nedenle CPO maliyeti finansal modelde açıkça gösterilmiştir. Maaş, araç ve aile dahil özel sağlık sigortası, rolün sürdürülebilir şekilde yürütülmesi için çalışma varsayımıdır.

Yatırımcıya alan bırakılır:

> Bu kalemlerin nihai biçimi ortak kararınızla netleşebilir; fakat model bu maliyeti baştan içerir.

---

## 8. Doğrulama raporuyla uyum

Bu rapor `dogrulama-raporu.md` ile çelişmemelidir. Oradaki bulgular içerik stratejisine şu şekilde yansıtılmalıdır:

- TÜBİTAK, KOSGEB, teknopark ve vergi iddiaları şartlı ve güncel değerlerle yazılmalıdır.
- İşveren maliyeti çarpanı finansal model girdisi olarak gösterilmeli; yasal gerçek olarak sunulmamalıdır.
- USD/TRY başlangıç kuru güncel değilse "model girdisi" olarak etiketlenmelidir.
- Online penetrasyon, sahibinden pazar payı ve ortalama arsa işlem değeri "model varsayımı" olarak sunulmalıdır.
- Emlakjet, cross-sell ve benzeri doğrulanmamış dış benchmark'lar çıkarılmalı veya "kaynaklı değilse kullanılmamalı" kuralına bağlanmalıdır.
- "519 milyon" gibi aynı sayı hem gelir hem ziyaret anlamına geliyorsa birim mutlaka görünür olmalıdır.

En önemli kural:

> Doğrulanmamış bir iddia, ikna cümlesinin omurgası yapılmamalıdır.

---

## 9. Claude'a verilecek nihai prompt

Aşağıdaki prompt, Claude'a doğrudan verilebilir.

```text
arsam.net yatırımcı sunumunu yeniden düzenle.

Hedef kişi tek yatırımcıdır: Üzeyir Engin profili. Klasik büyük emlak/arsa işinden gelen, arazi, tapu, satış, lokasyon, nakit akışı ve saha operasyonu refleksi güçlü bir yatırımcıdır. Teknolojiye yatırım yapacak ama teknoloji jargonu ile ikna olmayacaktır.

Bu sunum bir startup demo günü sunumu değildir. Bir web sitesi satışı değildir. arsam.net, arsa satışında güven, doğrulama, ilan, veri, pazarlama ve operasyonu tek panele toplayan dikey bir pazar işletmesi olarak anlatılmalıdır.

Ana anlatı şu olmalıdır:
"Sizin bildiğiniz arsa işini, bizim yazılım ve operasyon disiplinimizle dijitalde güvenli, ölçülebilir ve ölçeklenebilir bir işletmeye çevirelim."

Mevcut savaş/gerilla/komando/silah/cephane/FOMO dili kaldırılacak. Bunların yerine operasyon disiplini, pazar kurulum planı, büyüme playbook'u, savunma avantajı, risk kapısı, ölçüm ve başabaş dili kullanılacak.

Yasaklı kelimeler:
- silah
- cephane
- komando
- gerilla
- yok etmek
- ezmek
- öldürmek
- garanti
- sıfır risk
- kesin kazanır
- FOMO
- son fırsat
- slot kaldı
- herkes için değil

Kullanılması gereken ana kelimeler:
- güven
- doğrulama
- kontrol
- pilot
- ölçüm
- başabaş
- karar kapısı
- saha
- satıcı arzı
- alıcı güveni
- işletme planı
- veri standardı
- operasyon disiplini
- stratejik ortaklık

Dil kuralları:
- Türkçe kısa ama tam cümleli olacak.
- Telgraf dili kullanılmayacak.
- Her cümlede yüklem olacak.
- Aşırı slogan zinciri kurulmayacak.
- İngilizce terim azaltılacak. Gerekirse ilk kullanımda Türkçe karşılığı verilecek.
- "valuation" yerine "değerleme", "runway" yerine "nakit çalışma süresi", "burn rate" yerine "aylık nakit yakımı", "moat" yerine "savunma avantajı", "lead investor" yerine "lider yatırımcı", "board seat" yerine "yönetim kurulunda temsil", "AI-first" yerine "AI destekli operasyon" denecek.

Kaynak ve varsayım kuralları:
- Her güçlü iddia "doğrulanmış kaynak", "model varsayımı", "hedef" veya "şirket tahmini" olarak ayrılacak.
- Doğrulanmamış rakamlar resmi gerçek gibi yazılmayacak.
- Doğrulama raporundaki kırılgan iddialar sunum omurgası yapılmayacak.
- Online penetrasyon, ortalama arsa işlem değeri, pazar payı ve benzeri model değerleri varsayım olarak etiketlenecek.

Yeni section akışı:
1. Özel karar notu
2. Önceki toplantıların özeti
3. Neden bu yatırımcı doğru ortak?
4. Problem: arsa işinde dijital güven boşluğu
5. Çözüm: doğrulama + ilan + veri + güvenli ödeme
6. Pazar ve varsayımlar
7. İş modeli
8. GTM / Ege pilotu
9. Rekabet ve savunma
10. AI destekli operasyon
11. İK planı
12. Başabaş analizi
13. Risk ve kontrol kapıları
14. Teknopark ve teşvik
15. CPO çalışma şartları
16. Yatırım seçenekleri
17. Kapanış ve ilk 30 gün

CPO bölümü:
- Maaş, araç ve aile dahil genel, tam kapsamlı özel sağlık sigortası profesyonel biçimde yazılacak.
- Bu kalemler kişisel rica gibi değil, tam zamanlı odak çalışma varsayımı olarak anlatılacak.
- Örnek ifade:
"Bu rol, mevcut işlerden ayrılarak tam zamanlı odak gerektirir. Bu nedenle modelde CPO için sabit ücret, mobilite ve aile dahil tam kapsamlı özel sağlık sigortası çalışma varsayımı olarak tanımlanmıştır."

UI/UX kuralları:
- Tasarım "startup landing page" gibi değil, "arsa ofisi + tapu/kadastro + finans masası + kontrol paneli" gibi hissettirmeli.
- Görsel referanslar: parsel sınırı, kadastro katmanı, tapu doğrulama dosyası, drone görüntüsü, satıcı paneli, nakit akışı.
- Her bölümde en fazla bir ana hüküm, bir kanıt ve bir grafik olacak.
- Stat card kalabalığı azaltılacak.
- Grafikler yönetim kurulu seviyesinde okunacak.

Her section için şunları üret:
1. Yeni başlık.
2. Ana mesaj.
3. Kısa metin.
4. Kullanılacak grafik/görsel.
5. Hangi mevcut JSON verisine bağlanacağı.
6. Hangi iddianın doğrulanmış, hangisinin varsayım olduğu.

Amaç yatırımcıyı sıkıştırmak değil; kararı sadeleştirmek, güven vermek ve ilk kontrollü adımı başlatmaktır.
```

---

## 10. Son hüküm

Mevcut sunumun zayıflığı veri eksikliği değildir. Asıl zayıflık, doğru verinin yanlış psikolojiyle sunulma riskidir. Bu yatırımcıya gösterilecek sunum, "biz teknoloji biliyoruz" diye bağırmamalıdır. "Sizin bildiğiniz arsa işini daha güvenli, daha ölçülebilir ve daha ölçeklenebilir hale getirecek işletme planı hazır" demelidir.

Bu ayrım yapılırsa sunum ikna gücünü artırır. Yapılmazsa proje güçlü olsa bile anlatı gereksiz sert, fazla iddialı ve yatırımcı profiline uzak kalır.
