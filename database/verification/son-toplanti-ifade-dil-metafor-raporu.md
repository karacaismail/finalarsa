# Son Toplantı İçin İfade, Dil ve Metafor Eleştiri Raporu

Kapsam: `/Users/karaca/Documents/sonbirarsa/database/sections`, `manifest.json`, `shared/metrics.json`, `data/*` ve landing render mantığı.

Amaç: 60+ yaşında, hayatını emlak/arsa satışıyla geçirmiş, büyük saha ve portföy tecrübesi olan bir yatırımcı adayına yapılacak son toplantıda hangi ifadelerin zayıf kaldığını, hangi metinlerin anlaşılmadığını, hangi gramer/üslup sorunlarının güveni zedelediğini ve hangi gerçekçi metaforların eklenmesi gerektiğini tespit etmek.

## 1. Kısa Hüküm

Proje artık yalnızca "web sitesi" anlatmıyor. Bu iyi. Yeni ara section'lar eklenmiş: dijital şube, yetki-sorumluluk, alıcı RFQ, ilk 90 gün, satıcı/emlakçı ağı, para kontrolü, ortaklık-yönetim ve yatırımcı getirisi.

Fakat metin dili hâlâ üç yerde zayıf:

1. Bazı ifadeler yatırımcının bildiği emlak diline değil, startup/strateji danışmanlığı diline yaslanıyor.
2. Bazı cümleler doğru fikri taşıyor ama çok uzun, çok soyut veya fazla iddialı olduğu için güven değil direnç üretir.
3. Gerçekçi metaforlar az. Olan metaforlar iyi başlamış ama sistematik değil. Sunumun her kritik bölümünde yatırımcının kendi dünyasından bir karşılık olmalı: arsa ofisi, tapu dosyası, portföy defteri, keşif arabası, şantiye hakedişi, zemin etüdü, vitrin, müşteri listesi, bölge hâkimiyeti.

Ana öneri:

Sunumun dili "AI-first platform" gibi değil, "arsa işini dijital şubeler, güven dosyaları ve saha ekipleriyle büyüten kontrollü işletme planı" gibi konuşmalı.

## 2. Yapısal Dil Bulgusu

Landing tarafı section'ları `manifest.json` içinden değil, `sections/` klasöründeki tüm JSON dosyalarından yüklüyor.

Kaynak davranış:

`landing/src/data/resolve.ts` içinde:

```ts
export const sections: Section[] = Object.entries(rawFiles)
  .filter(([p]) => p.startsWith("sections/"))
  .map(([, v]) => v as Section)
  .sort((a, b) => a.order - b.order);
```

Bu nedenle ara section'lar görünür:

- `03a-emlak-dijital-sube`
- `05a-yetki-sorumluluk`
- `07a-alici-rfq`
- `09a-ilk-90-gun`
- `09b-satici-emlakci-agi`
- `16a-paranin-kullanimi`
- `16b-ortaklik-yonetim`
- `16c-yatirimci-getiri`

Fakat `manifest.json` hâlâ 18 section gösteriyor. Ekranda section başlıkları ve bazı `eyebrow` metinleri "06 / 18", "14 / 18" gibi devam ediyorsa yatırımcı açısından sorun şudur:

"Bu sunum 18 bölüm mü, 26 bölüm mü? Ben hangi karar akışını izliyorum?"

Öneri:

Ana sunum "18 ana karar bölümü" diye korunacaksa ara section'lar numarasız "karar eki" gibi tasarlanmalı. Yok toplam bölüm sayısı artacaksa bütün `eyebrow` numaraları yeniden hesaplanmalı.

## 3. En Zayıf İfade Türleri

### 3.1. Startup jargonunu doğrudan bırakmak

Sorunlu örnekler:

- `Counter-Positioning`
- `RFQ`
- `lead`
- `AI-first`
- `SaaS`
- `app-in-app`
- `squad`
- `backlog`
- `SAFe/ART`
- `valuation`
- `take rate`
- `TAM / SAM / SOM`

Bu kelimeler teknik olarak yanlış değil. Fakat hedef yatırımcı için ilk duyulduğunda anlam üretmez. Anlam üretmeyen kelime, yatırımcı zihninde risk olarak kodlanır.

Kural:

İngilizce terim kullanılacaksa önce Türkçe karşılığı verilmeli, sonra parantez içinde teknik adı gösterilmeli.

Yanlış:

`RFQ gelir modeli`

Doğru:

`Alıcı talebiyle teklif alma modeli (RFQ)`

Yanlış:

`Counter-Positioning`

Doğru:

`Rakibin kolay kopyalayamayacağı konumlanma`

Yanlış:

`valuation`

Doğru:

`şirket değerlemesi`

Yanlış:

`take rate`

Doğru:

`platformun gelir alma oranı`

### 3.2. Fazla kesinlik taşıyan ifadeler

Sorunlu kelimeler:

- `kesindir`
- `imkânsız`
- `sıfıra çeker`
- `kopyalayamayacağı`
- `engelsiz`
- `lider olarak taşıyacağı`
- `kazansa da kaybeder`
- `komisyon ekonomisini kıramaz`

Bu kelimeler yatırımcıya özgüven değil, abartı hissi verebilir. Özellikle riskli geçmişi olan veya due diligence refleksi güçlü bir emlakçı yatırımcı, fazla kesin konuşanı değil, riski kabul edip ölçeni daha güvenilir bulur.

Kural:

Kesin hüküm yerine kontrollü hüküm kullanılmalı.

Yanlış:

`Programatik SEO edinme maliyetini sıfıra çeker.`

Doğru:

`Programatik SEO, ücretli reklama bağımlılığı azaltır ve uzun vadede daha düşük maliyetli talep üretir.`

Yanlış:

`Counter-Positioning karşı saldırıyı imkânsız kılar.`

Doğru:

`Bu konumlanma, rakibin hızlı ve maliyetsiz kopyalamasını zorlaştırır.`

Yanlış:

`Mekanizma yasal ve kesin.`

Doğru:

`Yasal mekanizma açıktır; şirkete sağlayacağı net tutar kazanç düzeyine ve başvuru sonucuna bağlıdır.`

### 3.3. Savaş, silah, cephane ve gerilla dili

Sorunlu alanlar:

- `strategy-arsenal`
- `strateji cephanesi`
- `silah`
- `gerilla`
- `asimetrik`
- `mem savaşı`
- `sahibinden kendi gelirini öldüremez`
- `700 kişiyi yener`

Bu dil genç startup pitch'inde heyecan üretebilir. Fakat 60+ yaşında, ciddi bir emlak yatırımcısında "bu çocuklar iş yapmaktan çok savaş oyunu oynuyor" hissi yaratabilir.

Yasaklanması gereken ton:

- saldırı
- savaş
- küçümseme
- rakibi ezme
- FOMO
- sahte kıtlık
- kaba özgüven

Yerine kullanılacak ton:

- pazar kurulumu
- saha yoğunluğu
- güven standardı
- bölge bölge büyüme
- kontrol kapısı
- maliyet disiplini
- itibar koruma

Yanlış:

`Strateji cephanesi`

Doğru:

`Büyüme ve savunma planı`

Yanlış:

`Mem savaşı`

Doğru:

`Organik görünürlük ve yerel hikâye üretimi`

Yanlış:

`Asimetrik büyüme playbook'u`

Doğru:

`Büyük rakibe karşı dar bölgeden başlayan büyüme planı`

## 4. Anlaşılmayan veya Zayıf Metinler

### 4.1. Pazar bölümü: TAM / SAM / SOM hâlâ soyut

Mevcut ifade:

`Değer hunisi · Türkçesiyle: TAM = toplam pazar, SAM = dijitale açık pazar, SOM = ulaşılabilir hedef pazar. Aşağıdaki çubuklarda görünümü değiştir.`

Sorun:

Bu tanım önceki hâle göre iyi ama hâlâ yatırımcı için soyut. "TAM/SAM/SOM" terimleri yaşça büyük, teknoloji dışı bir yatırımcı için öğrenilmesi gereken yabancı kavramlar gibi duruyor.

Daha doğru ifade:

`Pazarı üç adımda okuyoruz: önce Türkiye'deki toplam arsa işlem hacmine bakıyoruz, sonra bunun dijitalde erişilebilir kısmını ayırıyoruz, en sonunda bizim ilk yıllarda gerçekten hedefleyebileceğimiz payı hesaplıyoruz.`

Metafor:

`Bunu bir arazi haritası gibi düşünün: önce bütün haritayı görüyoruz, sonra çalışabileceğimiz bölgeyi seçiyoruz, en sonunda ilk alacağımız parselleri işaretliyoruz.`

Buton isimleri:

Mevcut:

- `Pazar payı`
- `Aşama dönüşümü`

Önerilen:

- `Pazar büyüklüğü`
- `Hesap oranları`

Kısa açıklama:

`Pazar büyüklüğü, her adımın TL karşılığını gösterir. Hesap oranları ise bir adımdan diğerine geçerken hangi yüzdeyi kullandığımızı gösterir.`

Metafor:

`Birinci görünüm arsanın toplam metrekaresini gösterir; ikinci görünüm bu arsanın hangi kısmına gerçekten ekip girebileceğini gösterir.`

### 4.2. Pazar hedefi: `%35` iddialı duyuluyor

Mevcut ifade:

`2032 hedefi: online arsa işlem pazarının %35'ine ulaşmak — tek bir ürünün değil, arsam.net'in lider olarak taşıyacağı toplam online arsa dilimi.`

Sorun:

`%35` agresif bir hedef. `lider olarak taşıyacağı` ifadesi de hem soyut hem iddialı. Yatırımcı "daha ortada ürün yokken %35 nereden çıktı?" diye düşünebilir.

Daha doğru ifade:

`2032 için modellediğimiz hedef, dijital arsa işlemlerinde güçlü bir pay almaktır. %35, gerçekleşmiş sonuç değil; saha yoğunluğu, doğrulanmış portföy ve alıcı talebi birlikte çalışırsa ulaşılabilecek hedef senaryodur.`

Daha kısa UI metni:

`%35 gerçekleşmiş sonuç değil; 2032 hedef senaryosudur.`

Metafor:

`Bir bölgede arsa ofisi açarken ilk gün "bütün bölge bizim" denmez. Önce portföy toplanır, sonra müşteri gelir, sonra bölge payı oluşur. Bu model de aynı sırayla çalışır.`

### 4.3. Strateji köprüsü bölümü fazla jargonlu

Mevcut ifade:

`Köprü — büyük pazarı (TAM) ulaşılabilir hedefe (SOM) bağlayan şey strateji cephanesidir: Counter-Positioning karşı saldırıyı imkânsız kılar, Atomik Ağ illeri tek tek doyurur, Programatik SEO edinme maliyetini sıfıra çeker, Kurucu rozeti tedarikçiyi kilitler, Mem savaşı ulusal kampanya gerektirmeden farkındalık üretir.`

Sorun:

Bu cümle final toplantı için en problemli metinlerden biri. Aynı cümlede 8 ayrı soyut kavram var. "Cephane", "Counter-Positioning", "Atomik Ağ", "Programatik SEO", "Kurucu rozeti", "Mem savaşı" birlikte gelince yatırımcı açısından anlam değil, sis üretir.

Daha doğru ifade:

`Büyük pazar tek başına yeterli değildir. Bu pazardan pay almak için üç şey gerekir: seçilmiş ilçelerde güçlü portföy, güven dosyasıyla ayrışan ilan kalitesi ve düzenli alıcı talebi. Strateji bölümü bu üç şeyi nasıl kuracağımızı gösterir.`

Metafor:

`Bir ilçede tabela asmak yetmez. Önce portföy defteri dolacak, sonra güvenilir evrak dosyası oluşacak, sonra alıcı o ofise "orada düzgün arsa vardır" diye gelecek. Dijitalde kurmak istediğimiz şey budur.`

### 4.4. ParselQ anlatısı yaş profili için fazla genç

Mevcut ifade:

`ParselQ — "invest yap" diyebileceğin mobil uygulama`

Sorun:

`invest yap` ifadesi genç, sosyal medya odaklı ve hafif duruyor. 60+ yaşında, tapu, arsa, ofis, yatırım ve itibar dünyasından gelen bir kişi için bu slogan güveni zayıflatabilir.

Daha doğru ifade:

`ParselQ: arsa dosyasını dijitalde hazırlayan mobil işlem paneli`

Alternatif:

`ParselQ: tapudan ilana kadar arsa dosyasını düzenleyen panel`

Mevcut ifade:

`Instagram ile Twitter arası, AI-öncelikli ve enerjik bir sosyal keşif deneyimi sunar.`

Sorun:

Bu ifade hedef yatırımcı için neredeyse anlamsız. "Instagram ile Twitter arası" ne demek? Arsa satışıyla ilişkisi belirsiz.

Daha doğru ifade:

`Kullanıcı tarafında ilan gezme, talep açma ve teklif görme deneyimi sade tutulur; arka planda ise yapay zeka evrak, konum, fiyat ve talep eşleşmesini hızlandırır.`

Metafor:

`Kullanıcı vitrini sade görür; arka ofiste dosya memuru, değerleme asistanı ve satış takipçisi aynı anda çalışır.`

### 4.5. "AI, insanı değil maliyeti azaltır" eksik ve hassas

Mevcut ifade:

`AI, insanı değil maliyeti azaltır.`

Sorun:

Kısa ve vurucu ama eksik. "İnsanı azaltmak" çağrışımı hâlâ var. Ayrıca yatırımcı teknoloji bilmediği için "AI neye karar verecek?" endişesi doğabilir.

Daha doğru ifade:

`Yapay zeka karar vermez; tekrar eden işi azaltır.`

Alternatif başlık:

`Kararı insan verir, yapay zeka dosyayı hızlandırır.`

Metafor:

`Yapay zeka burada patron değil, iyi bir kalfa gibidir. Usta kararı verir; kalfa ölçer, hazırlar ve işi hızlandırır.`

Not:

Bu metafor mevcut metinde var ve doğru yönde. Fakat sadece AI bölümünde değil, ürün ve operasyon bölümlerinde de tekrarlanmalı.

### 4.6. "Kadro, gelir ve riske göre büyür" doğru ama eksik

Mevcut ifade:

`Kadro, gelir ve riske göre büyür.`

Sorun:

Doğru ama yatırımcı "256 kişi fazla değil mi?" diye soracaktır. Başlık kadro mantığını açıklıyor ama saha-gerçeklik metaforu eksik.

Daha doğru ifade:

`Kadro ilk gün değil, iş hacmi oluştuğunda büyür.`

Ek metin:

`Bir şantiyede temel kazılmadan ince iş ekibi çağrılmaz. Bu planda da her ekip, saha ve gelir sinyali oluşunca eklenir.`

Metafor:

`Şantiye ekibi işin evresine göre kurulur: önce keşif ve temel, sonra kaba yapı, sonra ince iş, sonra bakım. Kadro planı da aynı sırayı izler.`

### 4.7. GTM metninde satış baskısı dili var

Mevcut ifade:

`Araç başına 2 kişi (kıdemli satış + teknik asistan); hesap açmadan ayrılmaz.`

Sorun:

`Hesap açmadan ayrılmaz` sert ve agresif. Sahada güven isteyen emlak yatırımcısı için "müşteriye baskı" hissi verir.

Daha doğru ifade:

`Ziyaretin hedefi, satıcıyla güven dosyasını başlatmak ve mümkünse ilk ilan kaydını açmaktır.`

Mevcut ifade:

`72 saatte yayına girmezse satış ekibi arama/SMS ile kapanışa iter.`

Sorun:

`Kapanışa iter` kaba satış jargonu. Yatırımcı açısından itibar riski yaratır.

Daha doğru ifade:

`72 saat içinde yayına girmeyen dosyalar için satış ekibi eksikleri tamamlatır ve süreci takip eder.`

Metafor:

`Saha ekibi, arsayı satmaya zorlayan ekip değil; dosyayı eksiksiz hale getiren ekip gibi konumlanmalı.`

### 4.8. Gelir modelleri bölümü fazla kalabalık

Mevcut ifade:

`Tek gelire bağlı değiliz; Türkiye'de engelsiz çoklu kalem.`

Sorun:

`Engelsiz` kelimesi hukuki anlamda fazla kesin ve kulağa yapay geliyor. Ayrıca "çoklu kalem" teknik muhasebe dili gibi.

Daha doğru ifade:

`Gelir tek kaleme bağlı değil; ana gelir aileleri bellidir.`

Alternatif başlık:

`Gelir modeli üç ana aileye ayrılır.`

Mevcut ifade:

`belgesi/lisansı TÜRKİYE'DE ALINABİLEN`

Sorun:

Tamamı büyük harf olan vurgu sert ve savunmacı duruyor. Hukuki güven vermek yerine "ısrarla ikna etmeye çalışma" hissi verir.

Daha doğru ifade:

`belgesi veya lisansı alınabilen modeller`

Ek metin:

`Lisans gerektiren alanlarda doğrudan işlem yapılmaz; lisanslı kurumlarla çalışılır.`

Metafor:

`Biz tapu dairesinin yerine geçmiyoruz; tapuya gitmeden önce dosyayı düzenleyen ve tarafları doğru masaya getiren ofis gibi çalışıyoruz.`

### 4.9. Rekabet bölümü hâlâ agresif

Mevcut ifade:

`Savunma yalnız arsa derinliği değil; asimetrik bir büyüme playbook'udur. Klasik gerilla pazarlama küçük bütçe/küçük etkidir; asimetrik saha ekibi rakibin büyüklüğünü hızsızlığa çevirir. En güçlüsü Counter-Positioning: sahibinden ilan-reklam modelini kopyalarsa komisyon ekonomisini kırar — kazansa da kaybeder.`

Sorun:

Bu metin teknik olarak stratejik olabilir ama yatırımcı toplantısında fazla kavga dili taşır. "Rakibin büyüklüğünü hızsızlığa çevirmek", "kazansa da kaybeder" gibi ifadeler gerçekçilikten çok slogan hissi verir.

Daha doğru ifade:

`Büyük platformların gücü trafiktir. Bizim savunmamız ise arsa özelinde portföy derinliği, doğrulanmış dosya standardı ve yerel saha ilişkisidir. Büyük rakip genel ilan trafiğini yönetir; bizim avantajımız, belirli ilçelerde daha temiz ve daha güvenilir arsa dosyası kurmaktır.`

Metafor:

`Sahibinden ana cadde üzerindeki büyük ilan panosu gibidir. Bizim hedefimiz, arsa işi için herkesin bildiği uzman ofis olmaktır. Ana cadde kalabalık getirir; uzman ofis güven ve doğru dosya getirir.`

### 4.10. Teknopark bölümü "kesin" kelimesini fazla kullanıyor

Mevcut ifade:

`Şartlar sağlandığında vergi avantajı kesindir.`

Sorun:

Kanuni avantaj olabilir ama yatırımcı sunumunda "kesindir" yerine "mekanizma açıktır" daha güvenlidir. Çünkü kabul, faaliyet kapsamı, kazancın ayrıştırılması, mevzuat değişimi ve süre gibi şartlar vardır.

Daha doğru ifade:

`Şartlar sağlanırsa vergi avantajı doğar; net tutar kazanca ve başvuru sonucuna bağlıdır.`

Mevcut ifade:

`Avantajın mekanizması kesindir; değişen tek şey kazanç düzeyine bağlı tutardır.`

Daha doğru ifade:

`Avantajın hesap mantığı açıktır; şirketin bundan ne kadar yararlanacağı kazanç düzeyi, faaliyet kapsamı ve kabul sürecine bağlıdır.`

Metafor:

`Bu, kira geliri gibi otomatik akan bir para değil; doğru dosya, doğru faaliyet ve doğru başvuru ile alınan teşvik avantajıdır.`

### 4.11. CPO bölümü doğru ama daha profesyonel bağlanmalı

Mevcut ifade:

`Bu rol, mevcut işlerden ayrılarak tam zamanlı odak gerektirir. Bu nedenle modelde CPO için sabit ücret, mobilite ve aile dahil tam kapsamlı özel sağlık sigortası çalışma varsayımı olarak tanımlanmıştır.`

Sorun:

İçerik doğru. Fakat yatırımcı bunu kişisel talep olarak okuyabilir. Daha net deliverable bağlantısı gerekli.

Daha doğru ifade:

`Bu rol tam zamanlı sorumluluk gerektirir. Bu nedenle ücret, mobilite ve aile dahil özel sağlık sigortası kişisel konfor kalemi olarak değil, ürün teslimi, ekip kurulumu, saha pilotu ve yatırımcı raporlaması için tam odak çalışma varsayımı olarak modele eklenmiştir.`

Ek component metni:

`Bu paket karşılığında beklenen çıktılar: çalışan ürün, ilk doğrulanmış ilanlar, ilk alıcı talebi, haftalık yatırımcı raporu, ekip işe alım planı ve ilk gelir sinyali.`

Metafor:

`Şantiyede şantiye şefi yarı zamanlı olmaz. Bu rol de aynı şekilde işin başında, tam zamanlı ve hesap verebilir olmalıdır.`

### 4.12. Yatırım seçenekleri bölümünde değerleme dili düzelmiş ama hâlâ soyut

Mevcut ifade:

`Üç seçenek, tek karar çerçevesi.`

Sorun:

Başlık temiz ama kararın yatırımcı açısından anlamı yeterince açık değil.

Daha doğru ifade:

`Üç yatırım seçeneği var; önerimiz kontrollü pilotu finanse eden stratejik seçenektir.`

Mevcut ifade:

`Ulusal kampanya sonrası değerleme yeniden ele alınır. Bugünkü teklif, kampanya öncesi riskleri birlikte üstlenme teklifidir.`

Sorun:

Önceki FOMO dilinden daha iyi. Ama "riskleri birlikte üstlenme" yatırımcıya yük gibi gelebilir.

Daha doğru ifade:

`Bugünkü karar, ulusal kampanya öncesinde kontrollü pilotu birlikte finanse etme kararıdır. İlk riskler ölçülü bütçe, saha raporu ve karar kapılarıyla yönetilir.`

Metafor:

`Bu karar bütün binayı bir günde yapmak değil; temeli atıp zeminin tuttuğunu görmek kararıdır.`

## 5. Dilbilgisi ve Gramer Sorunları

Bu bölümde sorun, çoğu zaman Türkçe imla hatası değil; cümle yapısının yatırımcı sunumu için fazla yüklü olmasıdır.

### 5.1. Çok uzun cümleler

Sorun:

Birçok metin tek cümlede 4-6 fikir taşıyor. Bu, özellikle mobil ekranda ve sözlü sunumda anlaşılmayı düşürür.

Kural:

Her cümle tek iş yapmalı.

Yanlış yapı:

`X olur; Y yapılır; Z şu anlama gelir; ayrıca A bölümdedir.`

Doğru yapı:

`X olur. Y bu süreci destekler. Z'nin ayrıntısı bir sonraki bölümde gösterilir.`

Örnek düzeltme:

Mevcut:

`İki giriş kapısı var: (1) Mülk sahibi satışa açar — yapay zeka değerleme yapıp "ilanını satışa aç" önerir. (2) Alıcı bir talep (RFQ) açar — satıcılar ve üye emlakçılar teklif sunar. Aşağıdaki akış birinci kapıyı gösterir; talep→teklif gelir modeli Bölüm 08'dedir.`

Daha okunur:

`ParselQ'nun iki giriş kapısı vardır. Birinci kapıda mülk sahibi parselini sisteme yükler ve satışa açar. İkinci kapıda alıcı ne aradığını yazar; satıcılar ve üye emlakçılar bu talebe teklif verir. Bu bölüm mülk sahibi akışını gösterir; talep-teklif gelir modeli Bölüm 08'de anlatılır.`

### 5.2. Noktalı virgül fazla kullanılıyor

Sorun:

Noktalı virgül metni "akademik rapor" gibi yapıyor. Yatırımcı sunumu için daha kısa cümleler gerekir.

Örnek:

`Bu bir teknoloji işi değil; emlak işinin ölçeklenmiş, daha kontrollü ve daha büyük halidir.`

Daha doğal:

`Bu yalnızca teknoloji işi değildir. Bu, emlak işini daha kontrollü ve daha geniş ölçekte yapma planıdır.`

### 5.3. "Değil; ..." kalıbı çok tekrar ediyor

Sorun:

Sunum sürekli "bu değil, şu" diye konuşuyor. Bu iyi bir karşıtlık tekniği ama fazla tekrarlanınca savunmacı hissettirir.

Öneri:

Olumsuz karşıtlık yerine doğrudan tanım verilmeli.

Yanlış:

`arsam.net bir web sitesi değildir.`

Doğru:

`arsam.net, arsa satışını dijitalde güven dosyası, portföy ve alıcı talebiyle yöneten dikey bir işletme modelidir.`

### 5.4. "Sen" dili ile "siz" dili karışıyor

Mevcut örnek:

`Yıl sekmeleriyle erken yılların saha-önce dağılımını da görebilirsin.`

Sorun:

Bu yatırımcı profiline "görebilirsin" fazla samimi ve genç kalır. Sunumda ya tamamen nötr dil ya da saygılı "siz" dili kullanılmalı.

Daha doğru:

`Yıl sekmeleriyle erken yıllardaki saha-önce dağılım incelenebilir.`

Alternatif:

`Yıl sekmelerinden erken yıllardaki saha ağırlığını görebilirsiniz.`

Kural:

Tek yatırımcıya özel sunumda "siz" dili tercih edilmeli. UI yönergelerinde ise nötr edilgen yapı daha iyi çalışır.

### 5.5. Türkçede yüklem eksikliği yok ama yüklem gücü zayıf

Bazı cümleler gramer olarak doğru fakat yüklem düşünceyi taşımıyor.

Örnek:

`Gelir üç ailede toplanır.`

Bu doğru ama karar etkisi zayıf.

Daha güçlü:

`Geliri üç aileye ayırıyoruz; böylece şirket tek bir ödeme modeline bağımlı kalmıyor.`

Örnek:

`Platformun ilk yakıtı satıcı ve emlakçı ağıdır.`

Bu iyi bir metafordur ama tek başına eksik kalır.

Daha güçlü:

`Platformun ilk yakıtı reklam değil, sahadan toplanan satıcı ve emlakçı ağıdır. Alıcı talebi bu portföyün üstüne kurulur.`

### 5.6. İngilizce isim tamlamaları Türkçeyi bozuyor

Sorunlu örnekler:

- `AI operasyon`
- `AI değerleme`
- `RFQ müşterileri`
- `lead paketi`
- `squad yapısı`
- `backlog`
- `programmatic SEO motoru`

Öneri:

Türkçe çekirdek isim önce gelmeli, teknik terim paranteze alınmalı.

Doğru:

- `yapay zeka destekli operasyon`
- `yapay zeka destekli değerleme`
- `alıcı talebi müşterileri (RFQ)`
- `nitelikli müşteri paketi`
- `küçük çalışma ekipleri`
- `iş listesi`
- `programatik SEO altyapısı`

## 6. Eksik Metinler

### 6.1. Final toplantıya özel giriş metni eksik

Eklenmesi gereken metin:

`Bugünkü toplantının amacı bütün vizyonu yeniden anlatmak değildir. Bugün karar vermemiz gereken konu şudur: Bu işi kontrollü pilot olarak hangi bütçeyle, hangi yetki sınırlarıyla ve ilk 90 günde hangi saha kanıtlarıyla başlatıyoruz?`

Neden gerekli:

Yatırımcı son toplantıya "tamam mı, devam mı?" gözüyle gelir. Sunumun ilk ekranında karar çerçevesi kurulmalı.

### 6.2. "Bu iş sizin bildiğiniz emlak işidir" bölümü daha görünür olmalı

Eklenmesi gereken metin:

`Bu proje teknolojiyle başlıyor gibi görünse de özü sizin bildiğiniz arsa işidir: doğru portföy, doğru evrak, doğru alıcı, doğru takip. Fark şu: bu işi tek ofiste değil, dijital şubeler ve saha ekipleriyle ilçe ilçe büyütüyoruz.`

Neden gerekli:

Yatırımcı kendini "teknolojiye para koyan dışarıdaki adam" gibi değil, "kendi iş bilgisini büyüten ortak" gibi görmeli.

### 6.3. Yetki sınırı daha erken söylenmeli

Eklenmesi gereken metin:

`arsam.net tapu devri yapmaz, para emanetçisi gibi davranmaz ve resmi değerleme kurumu yerine geçmez. Platform, işlem öncesi dosyayı düzenler; tapu, ödeme, kredi, sigorta ve değerleme gibi yetkili alanlarda lisanslı kurumlarla çalışır.`

Neden gerekli:

Bu yatırımcı profili hukuki riskten çekinir. Yetki sınırı erken söylenirse güven artar.

### 6.4. İlk 90 gün kanıt listesi daha somut olmalı

Eklenmesi gereken metin:

`90 gün sonunda size fikir değil, saha kanıtı göstermek istiyoruz: kaç satıcıyla görüşüldü, kaç parsel dosyası açıldı, kaç ilan doğrulandı, kaç alıcı talebi geldi, kaç teklif görüşmesi başladı, hangi ilçe tuttu, hangi ilçe tutulmadı.`

Neden gerekli:

Son toplantıda "büyük vizyon" değil, "ölçülebilir ilk hamle" ikna eder.

### 6.5. İtibar riski için özel söz eksik

Eklenmesi gereken metin:

`Bu işte en büyük sermaye yalnız para değil, itibardır. Bu nedenle sahte ilan, yanlış evrak, hatalı değerleme ve agresif satış dili ilk günden kırmızı çizgi olarak yönetilir.`

Neden gerekli:

Yatırımcı emlak dünyasında itibarla iş yapar. İtibar kelimesi sunumda finans kadar güçlü yer tutmalı.

### 6.6. Ortaklık yönetimi için "sınır ve rapor" metni eksik

Eklenmesi gereken metin:

`Günlük ürün ve ekip yönetimi CPO sorumluluğunda yürür. Bütçe, stratejik ortaklık, yeni bölge açılışı ve büyük harcama kararları ise yatırımcı raporuyla birlikte karar kapısına bağlanır.`

Neden gerekli:

Bu profil kontrolü sever. "Parayı ver ve bekle" modeli ikna etmez. Ama günlük işe karışacağı izlenimi de yönetilmeli.

### 6.7. Yatırımcı getirisi basit dille yeniden anlatılmalı

Eklenmesi gereken metin:

`Bu yatırım arsa al-sat yatırımı değildir. Burada getiri, kurulan şirketin değer kazanması, işin nakit üretmesi ve ileride daha büyük bir oyuncu için stratejik satın alma hedefi haline gelmesiyle oluşur.`

Neden gerekli:

Emlakçı yatırımcı arsada paranın nasıl kazanıldığını bilir. Platform yatırımında getiri mantığını ayrıca çevirmek gerekir.

## 7. Gerçekçi Metafor Bankası

Bu metaforlar sunuma dağıtılmalı. Her bölümde en fazla bir metafor kullanılmalı; metafor metni süs değil, karar anlatımı olmalı.

### 7.1. Proje metaforu

`arsam.net yeni bir web sitesi değil; arsa ofisinin dijital şubesidir.`

Kullanım yeri:

Giriş, neden ortak, çözüm.

Açıklama:

`Nasıl iyi bir arsa ofisi portföy, müşteri, evrak ve takip düzeniyle çalışıyorsa, bu sistem de aynı işi dijitalde ve daha geniş ölçekte yapar.`

### 7.2. Pazar metaforu

`Pazar hesabı bir arazi haritası gibidir.`

Kullanım yeri:

Pazar bölümü.

Açıklama:

`Önce bütün haritayı görürüz. Sonra çalışabileceğimiz bölgeyi ayırırız. En sonunda ilk hedef parselleri seçeriz.`

### 7.3. Ürün metaforu

`Güven dosyası, ilanın tapu zarfıdır.`

Kullanım yeri:

Çözüm, problem, yetki-sorumluluk.

Açıklama:

`Fotoğraf ilanın vitriniyse, güven dosyası arkasındaki tapu zarfıdır: konum, imar, sahiplik, risk ve emsal bilgisi aynı dosyada durur.`

### 7.4. AI metaforu

`Yapay zeka patron değil, kalfadır.`

Kullanım yeri:

AI operasyon, ParselQ, değerleme.

Açıklama:

`Usta kararı verir. Kalfa ölçer, hazırlar, eksikleri gösterir ve işi hızlandırır.`

### 7.5. Rekabet metaforu

`Sahibinden ana cadde vitrini, arsam.net uzman arsa ofisidir.`

Kullanım yeri:

Rekabet.

Açıklama:

`Ana cadde kalabalık getirir. Uzman ofis doğru müşteri, doğru dosya ve güven getirir. Biz kalabalıkla değil, arsa uzmanlığıyla ayrışıyoruz.`

### 7.6. GTM metaforu

`Önce bölge tutulur, sonra tabela büyütülür.`

Kullanım yeri:

GTM, ilk 90 gün.

Açıklama:

`Bir emlakçı bütün ülkeye aynı gün yayılmaz. Önce bildiği bölgede portföy toplar, satış yapar, referans üretir. Sonra komşu bölgeye geçer.`

### 7.7. Para kullanımı metaforu

`Yatırım şantiye hakedişi gibi açılır.`

Kullanım yeri:

Para kontrolü, yatırım seçenekleri, risk.

Açıklama:

`Temel atılmadan ince iş bütçesi açılmaz. Bu yatırımda da bütçe ürün, saha ve gelir kanıtı geldikçe kademeli kullanılır.`

### 7.8. Risk metaforu

`Risk yönetimi zemin etüdüdür.`

Kullanım yeri:

Risk, teknopark, hukuk.

Açıklama:

`İnşaata başlamadan zemin kontrol edilir. Burada da hukuki, itibari ve finansal riskler işe başlamadan ölçülür ve karar kapısına bağlanır.`

### 7.9. Kadro metaforu

`Kadro şantiye ekibi gibi aşama aşama kurulur.`

Kullanım yeri:

İK planı.

Açıklama:

`Temelde başka ekip, kaba yapıda başka ekip, teslimde başka ekip gerekir. 256 kişi ilk gün değil, iş evresi geldikçe kurulur.`

### 7.10. Gelir modeli metaforu

`Gelir yalnız satış komisyonu değil; ofisin verdiği hizmetlerin toplamıdır.`

Kullanım yeri:

İş modeli, gelir modelleri.

Açıklama:

`Vitrin, dosya hazırlığı, nitelikli müşteri, rapor, veri ve takip hizmeti ayrı ayrı gelir üretir.`

## 8. Section Bazlı Net Düzeltme Listesi

### 01 Karar Notu

Sorun:

Başlangıç iyi ama yatırımcıya "bugün hangi kararı alıyoruz?" daha keskin söylenmeli.

Eklenecek metin:

`Bugünkü karar üç başlıktadır: başlangıç bütçesi, yatırımcı rolü ve ilk 90 günün ölçülebilir saha hedefleri.`

### 02 Toplantı Özeti

Sorun:

Metin doğru ama "olur mu?" ifadesi fazla konuşma dili.

Öneri:

`Bugünkü toplantı, fikrin mümkün olup olmadığını tartışma toplantısı değildir. Bugün, hangi şartlarla kontrollü pilota başlanacağını netleştirme toplantısıdır.`

### 03 Neden Ortak

Sorun:

Yatırımcının gerçek gücü daha somut yazılmalı: bölge bilgisi, portföy refleksi, satıcı dili, tapu ve saha tecrübesi.

Eklenecek metin:

`Bu işin ilk avantajı yazılım değil, sahada güvenilir arsa portföyü kurma kabiliyetidir. Bu kabiliyet sizde var; biz bunu dijital sisteme çeviriyoruz.`

### 03a Dijital Şube

Sorun:

İyi section. Daha görünür olmalı. Bu bölüm final toplantının erken ana omurgası olmalı.

Güçlendirilecek metin:

`Bu iş, sizin bildiğiniz arsa ofisinin dijital şubesidir: portföy defteri dijitalleşir, müşteri listesi talep ağına dönüşür, tapu dosyası güven dosyası olur.`

### 04 Problem

Sorun:

Problem doğru ama yatırımcının yaşadığı saha örnekleriyle daha canlı anlatılmalı.

Eklenecek metin:

`Arsa alıcısı çoğu zaman aynı soruları sorar: Tapusu temiz mi? İmarı ne? Yeri gerçekten burası mı? Emsal fiyat doğru mu? Satıcı güvenilir mi? Mevcut yatay ilan siteleri bu sorulara standart dosya üretmez.`

### 05 Çözüm

Sorun:

ParselQ anlatısı fazla genç ve teknik.

Değiştirilecek ifade:

`invest yap` yerine `arsa dosyasını dijitalde hazırlayan mobil işlem paneli`.

Eklenecek metin:

`ParselQ'nun amacı kullanıcıya teknoloji göstermek değil, arsa dosyasını eksiksiz ve anlaşılır hale getirmektir.`

### 05a Yetki ve Sorumluluk

Sorun:

Çok doğru section. Daha erken ve daha görünür kullanılmalı.

Eklenecek metin:

`Bu sınır özellikle yatırımcıyı korur: platform kolaylaştırır, yetkili kurum karar verir.`

### 06 Pazar

Sorun:

Pazar hesabı hâlâ terim yüklü.

Eklenecek metin:

`Bu bölümde amaç büyük rakam göstermek değil, hangi pazar dilimini hangi varsayımla hedeflediğimizi açıkça göstermektir.`

Buton düzeltmesi:

- `Pazar payı` -> `Pazar büyüklüğü`
- `Aşama dönüşümü` -> `Hesap oranları`

### 07 İş Modeli

Sorun:

Komisyonsuz model doğru ama "para nereden geliyor?" sorusu daha basit cevaplanmalı.

Eklenecek metin:

`Satıcı arsasını sattığında satıştan pay almıyoruz. Gelir; görünürlük, güven dosyası, alıcı talebi, emlakçı erişimi, veri ve operasyon hizmetlerinden geliyor.`

### 07a Alıcı RFQ

Sorun:

RFQ terimi mutlaka çevrilmeli.

Başlık önerisi:

`Alıcı talebi: müşteri ne aradığını yazar, uygun parseller teklif verir.`

Metafor:

`Bu, ofise gelen müşterinin "şu bölgede, şu bütçede arsa arıyorum" demesinin dijital halidir.`

### 08 Gelir Modelleri

Sorun:

Ana sunum için fazla uzun ve katalog gibi. "Yedi akış" detayları appendix'e alınmalı.

Ana metin:

`Gelir modeli üç ailede toplanır: ilan ve görünürlük, talep ve eşleştirme, veri ve operasyon hizmetleri.`

Appendix:

Tüm lisans/hukuk/kalem kataloğu.

### 09 GTM

Sorun:

Saha dili var ama bazı cümleler baskıcı.

Değiştirilecek:

- `hesap açmadan ayrılmaz` -> `ziyaretin hedefi dosyayı başlatmak ve ilan kaydını açmaktır`
- `kapanışa iter` -> `eksikleri tamamlatır ve süreci takip eder`

### 09a İlk 90 Gün

Sorun:

Bu section final toplantıda kritik. Daha güçlü bir "kanıt listesi" olarak sunulmalı.

Eklenecek metin:

`90 gün sonunda yatırımcıya sunulacak rapor: saha görüşmesi, doğrulanmış ilan, alıcı talebi, teklif görüşmesi, ücretli paket ve ilçe bazlı öğrenme.`

### 09b Satıcı ve Emlakçı Ağı

Sorun:

Metafor iyi: `ilk yakıt`. Bunu daha açık bağlamak gerekir.

Eklenecek metin:

`Platformun ilk yakıtı reklam bütçesi değil, sahadan toplanan güvenilir portföydür.`

### 10 Rekabet

Sorun:

Hâlâ savaş/strateji jargonu taşıyor.

Yeni ana metin:

`Rakiplerin gücü genel ilan trafiğidir. Bizim avantajımız, arsa özelinde temiz dosya, yerel portföy ve saha ilişkisidir.`

### 11 AI Operasyon

Sorun:

Başlık hassas.

Yeni başlık:

`Kararı insan verir, yapay zeka dosyayı hızlandırır.`

### 12 İK Planı

Sorun:

256 kişi gerekçesi daha pratik anlatılmalı.

Eklenecek metin:

`256 kişi ilk gün alınmaz. Kadro, ilçe sayısı, ilan hacmi, alıcı talebi ve destek yükü büyüdükçe açılır.`

### 13 Finansal Plan

Sorun:

Çok grafik var; final toplantıda üç sayı öne çıkmalı.

Eklenecek metin:

`Bu bölümde üç soruya cevap veriyoruz: ilk ne kadar para gerekir, en dip nakit seviyesi nedir, başabaş ne zaman görülür?`

### 14 Risk

Sorun:

İtibar riski eklenmiş ama final toplantıda daha merkezi olmalı.

Eklenecek metin:

`Bu işte yanlış ilan yalnız müşteri şikayeti yaratmaz; yatırımcı itibarını da yıpratır. Bu nedenle doğrulama ve manuel inceleme ilk günden zorunlu olmalıdır.`

### 15 Teknopark

Sorun:

`kesin` dili yumuşatılmalı.

Yeni metin:

`Teknopark, doğru kurulumda vergi yükünü azaltabilir. Net avantaj, kabul süreci, faaliyet kapsamı ve kazanç düzeyine bağlıdır.`

### 16 CPO

Sorun:

Yan haklar doğru ama deliverable'a daha net bağlanmalı.

Eklenecek metin:

`Bu çalışma şartlarının karşılığı; ürün teslimi, ekip kurulumu, saha pilotu, haftalık yatırımcı raporu ve ilk gelir sinyalidir.`

### 16a Para Kontrolü

Sorun:

İyi metafor var. `yakılmaz` kelimesi biraz startup finans jargonu.

Yeni başlık:

`Para tek seferde harcanmaz; aşama aşama açılır.`

### 16b Ortaklık Yönetim

Sorun:

Güzel ama yönetim yetkileri tabloyla daha netleşmeli.

Eklenecek metin:

`Günlük iş yönetimi CPO'da, bütçe ve stratejik kararlar yatırımcı raporunda, hukuki ve lisanslı alanlar uzman/kurum onayında yürür.`

### 16c Yatırımcı Getiri

Sorun:

Doğru anlatı var ama emlakçı yatırımcıya çevrilmeli.

Eklenecek metin:

`Arsa yatırımında değer parselden gelir. Platform yatırımında değer; portföy, kullanıcı, veri, gelir ve marka birikiminden gelir.`

### 17 Yatırım

Sorun:

Önerilen seçenek daha net işaretlenmeli.

Eklenecek metin:

`Önerilen seçenek stratejik seçenektir; çünkü yalnız yazılımı değil, saha pilotunu ve ilk gelir sinyalini de finanse eder.`

### 18 İlk 30 Gün

Sorun:

İlk 30 gün var ama ilk 90 gün karar kapanışıyla bağlanmalı.

Eklenecek metin:

`İlk 30 gün kurulum, ilk 90 gün saha kanıtıdır. Bugünkü karar bu iki dönemi başlatır.`

## 9. Claude İçin Yazım Talimatı

Aşağıdaki talimat Claude'a doğrudan verilebilir.

```text
Bu sunumun hedef yatırımcısı 60+ yaşında, hayatını emlak/arsa işiyle geçirmiş, saha, portföy, tapu, inşaat, satış ve itibar diliyle düşünen bir yatırımcıdır. Metinleri teknoloji girişimi demo günü gibi değil, kontrollü emlak işletmesi yatırım planı gibi yaz.

Temel çerçeve:
- Bu iş bir web sitesi değil; arsa ofisinin dijital şubesi ve güven dosyası sistemidir.
- Yatırımcı teknolojiye değil, kendi bildiği arsa işinin dijitalde ölçeklenmesine ortak oluyor.
- Her bölümde şu sorulardan birine cevap ver: para nasıl korunur, risk nasıl ölçülür, saha nasıl işler, ilk 90 günde ne görülecek, yatırımcı rolü ne olacak?

Dil kuralları:
- Kısa yaz ama telgraf gibi yazma.
- Her cümlede açık yüklem kullan.
- Bir cümlede en fazla bir ana fikir taşı.
- Noktalı virgül ve uzun tireyi azalt.
- "Sen" dili kullanma; ya "siz" dili ya da nötr edilgen dil kullan.
- İngilizce terimi önce Türkçeye çevir, gerekiyorsa parantez içinde teknik adını ver.
- "AI" yerine çoğu yerde "yapay zeka destekli" de.
- "RFQ" yerine "alıcı talebiyle teklif alma modeli (RFQ)" de.
- "valuation" yerine "şirket değerlemesi" de.
- "take rate" yerine "platformun gelir alma oranı" de.
- "lead" yerine "nitelikli müşteri" veya "talep" de.

Yasaklı veya kaçınılacak ton:
- silah
- cephane
- komando
- gerilla
- mem savaşı
- FOMO
- herkes için değil
- slot kaldı
- sıfır risk
- garanti
- imkânsız
- kesin kazanırız
- rakibi ezeriz
- sahibinden'i yeneriz
- valuation katlanır

Yerine kullanılacak ton:
- saha planı
- güven dosyası
- portföy derinliği
- bölge bölge büyüme
- kontrol kapısı
- ölçülü hedef
- model varsayımı
- doğrulanmış kaynak
- lisanslı kurum
- yatırımcı raporu
- itibar koruma

Metafor kuralları:
- Pazar hesabı: bütün harita → çalışılabilir bölge → hedef parseller → beklenen hasat.
- Ürün: ilanın vitrini fotoğraftır; güven dosyası tapu zarfıdır.
- AI: patron değil, kalfa; usta karar verir, kalfa işi hızlandırır.
- Para kullanımı: şantiye hakedişi; temel olmadan ince iş bütçesi açılmaz.
- GTM: önce bölge tutulur, sonra tabela büyütülür.
- Rekabet: sahibinden ana cadde vitrini, arsam.net uzman arsa ofisi.
- Risk: zemin etüdü yapılmadan inşaata başlanmaz.

Her section için:
1. Önce tek ana hüküm yaz.
2. Sonra yatırımcının bildiği emlak dünyasından bir karşılık ver.
3. Sonra varsa rakamı "doğrulanmış kaynak", "model varsayımı" veya "hedef" diye etiketle.
4. Son olarak yatırımcının kararına bağla.

Final toplantı dili:
- "Büyük vizyon" yerine "kontrollü pilot".
- "Ulusal kampanya" yerine "ilk 90 gün saha kanıtı".
- "Teknoloji platformu" yerine "dijital arsa işletmesi".
- "Yapay zeka karar verir" deme; "yapay zeka dosyayı hızlandırır, insan karar verir" de.
```

## 10. Uygulama Sırası

1. Önce yasaklı/agresif kelimeleri temizle: `cephane`, `silah`, `gerilla`, `mem savaşı`, `imkânsız`, `sıfıra çeker`, `kopyalayamayacağı`, `engelsiz`, `kesindir`.
2. Sonra İngilizce terimleri Türkçe karar diline çevir: `RFQ`, `lead`, `AI-first`, `SaaS`, `valuation`, `take rate`, `Counter-Positioning`.
3. Pazar bölümünü sadeleştir: TAM/SAM/SOM önce terim olarak değil, harita-bölge-parsel metaforuyla anlatılsın.
4. ParselQ sloganını olgunlaştır: `invest yap` yerine `arsa dosyasını dijitalde hazırlayan mobil işlem paneli`.
5. Rekabet bölümünü savaş dilinden çıkar: ana cadde vitrini / uzman arsa ofisi metaforu kullanılsın.
6. CPO şartlarını kişisel talep değil, teslimat ve sorumluluk modeli olarak bağla.
7. Her ana bölümün üstüne bir cümlelik "yatırımcı kararı" ekle.
8. 90 gün sonunda gösterilecek saha kanıtlarını ayrı ve net kutu yap.

## 11. Sonuç

Mevcut metinlerin büyük kısmı bilgi olarak değerli. Sorun bilgi eksikliği değil, bazı bilgilerin yanlış dille sunulması.

Bu yatırımcı profili için ikna dili şu üç şeyi aynı anda yapmalı:

1. Onun bildiği emlak dünyasına saygı duymalı.
2. Teknolojiyi sade, kontrollü ve işe yarar göstermeli.
3. Parayı, itibarı ve yetki sınırlarını açıkça korumalı.

Son toplantıda hedef "bizi teknoloji şirketi gibi görün" değildir. Hedef şudur:

`Bu iş, bildiğiniz arsa işini daha temiz dosyayla, daha iyi takip sistemiyle ve daha ölçülü büyüme planıyla dijitalde büyütme işidir.`

