# RAPOR 08 · Tasarım, Hareket ve Etkileşim İyileştirme

> arsam.net / ParselQ · 2026-06-22
> Bu rapor bir tasarım kararı belgesidir; kod uygulaması ayrı bir adımdır. UI çizilmez, tanımlanır: bileşen, davranış, stil parametresi ve token düzeyinde öneri verir. İçeriği, sayıları veya canon'u değiştirmez — yalnızca görsel his ve etkileşim katmanını ele alır.

## 1. Teşhis: sorun "eksik sistem" değil, "uygulanmamış sistem" + sıfır hareket

Sitenin bugünkü hissi haklı olarak tekdüze. Nedenleri somut:

Tüm 18 bölüm aynı ritimde akıyor: eyebrow → başlık → not → kart ızgarası, sürekli aynı sırada, hep yukarıdan aşağı tek sütun. Göz için sürpriz, duraklama veya hiyerarşi değişimi yok.

İçerik kartları düz. Tema katmanınızda `cardBase` ve `chartCard` yalnız `border + bg` taşıyor; **gölge yok, hover yok, geçiş (transition) yok**. Oysa daha zengin iki stiliniz (`interactivePanel`, `listingCard`) gradient + `shadowCard` ile derinlik veriyor — ama bunlar yalnız birkaç yerde (marketScale, Söke mock) kullanılıyor.

Hareket katmanı hiç yok. Bölüm/blok görünüme girince animasyon, sayı sayacı, grafik giriş animasyonu, kart hover'ı, sekme içeriği geçişi — hiçbiri yok. Sayfa "statik bir PDF" gibi.

Renk az kullanılıyor. Paletiniz aslında zengin: `green/greenBright`, `gold/goldBright/goldVivid`, `clay`, tint zeminler (`tintGreen/tintGold/tintClay`), ve tam bir **koyu bölüm ailesi** (`darkBg/darkText...`). Ama içerik ağırlıkla nötr kâğıt + siyah metin; accent'ler ve koyu bölümler neredeyse hiç sahneye çıkmıyor.

Opacity/derinlik token'ları var ama atıl. `fx.overlayWhite06–25`, `headerGlass (0.88)`, `shadowCard/shadowPopover`, panel gradient'leri tanımlı — yani glassmorphism ve elevation için altyapı hazır, sadece uygulanmamış.

Kısacası: paleti ve derinlik token'larını içerik kartlarına/bölümlere yaymak + bir hareket katmanı eklemek, mevcut mimariyi bozmadan siteyi baştan canlandırır.

---

## 2. Ne yapar / ne yapmaz (kapsam ve sınır)

Bu öneriler **görsel his ve etkileşim** ekler: derinlik, renk ritmi, hover geri bildirimi, görünüme-girince hareket. İçeriği, finansal sayıları, kadro/pay canon'unu ve bölüm metinlerini **değiştirmez**.

Yapmaz: performansı düşürmez (yalnız `transform`/`opacity` animasyonu, layout tetiklemez), erişilebilirliği bozmaz (`prefers-reduced-motion` ile tüm hareket kapanır), ağır kütüphane yükü getirmez.

---

## 3. Öneri kataloğu

### 3.1 Hareket ve micro-interaction (en yüksek etki / en düşük efor)

Görünüme-girince reveal: her bölüm ve kart, ekrana girince ~12–20px aşağıdan yumuşak yukarı-kayma + opacity 0→1. Kart ızgaralarında **stagger** (kartlar 60–80ms arayla sırayla belirir). Bu tek başına "PDF" hissini kırar.

Sayı sayacı (count-up): `statGrid`, `feature` ve büyük metrikler görünüme girince 0'dan hedefe sayar (örn. 256, %35, 5,5 milyar). Tabular rakam (`tabular-nums`) ile zıplamadan.

Grafik giriş animasyonu: ECharts'ta `animationDuration` + `animationDelay` (barlar soldan/alttan büyür, çizgiler çizilir). Şu an grafikler aniden beliriyor.

Hover geri bildirimi (kartlar): `translateY(-3px)` + `shadowCard`'a yükselme + kenarlıkta accent rengi (yeşil/altın). Tablo satırlarında satır-hover zemini. Etkileşimli olduğu hissini verir.

Sekme/segment içerik geçişi: `chartTabs`, yeni eklediğimiz yıl-sekmeli tablo ve senaryo switch'inde — içerik değişince kısa fade/slide. Şu an sert değişiyor.

Mikro detaylar: buton/pill press efekti (scale 0.98), link altı çizgi reveal, accordion yumuşak yükseklik geçişi, sticky header'da scroll'da küçülme/gölgelenme.

Davranış parametreleri (token önerisi): süreler 150ms (hover) / 250ms (geçiş) / 400ms (reveal); easing `cubic-bezier(0.22, 1, 0.36, 1)`; reveal mesafesi 16px; stagger 70ms; hover lift 3px.

### 3.2 Bileşen çeşitliliği (tekdüzeliği kırmak)

Şu an tek tip kart ızgarası baskın. Eklenebilecek farklı bileşen tipleri:

Bento grid: bazı bölümlerde eşit kartlar yerine asimetrik ızgara (bir büyük + birkaç küçük) — gözü yönlendirir, hiyerarşi yaratır.

Zig-zag (alternating) yerleşim: metin solda / görsel-grafik sağda, bir sonraki bölümde ters. Dümdüz tek sütun akışını kırar.

Koyu "feature" bölümleri: koyu bölüm ailesi (`darkBg`) zaten var; 2–3 stratejik bölümü (örn. ParselQ-RFQ, %35 pay, başabaş) koyu zeminli "spotlight" yaparak ritim değiştir.

Sticky yan panel / scrollytelling: uzun bölümlerde sol başlık/özet sabit kalır, sağda içerik akar (örn. gelir modelleri, GTM ilçe akışı).

Öne çıkan stat şeridi: büyük rakam + ışıltı/gradient zemin (256 · %35 · 5,5 milyar) tam genişlik bant.

Pull-quote ve marquee: bölüm geçişlerindeki özlü sözleri büyük tipografiyle; ilçe adlarını veya gelir modüllerini akan şerit (marquee) ile.

Karşılaştırma slider'ı: "rakip vs ParselQ" veya "komisyon vs abonelik" sürükle-karşılaştır bileşeni.

Mevcut zengin bloklarınızı yaygınlaştırın: `statEquation`, `marketScale`, `strategyArsenal` zaten güzel etkileşimli — bunları daha çok bölüme taşımak çeşitlilik katar.

### 3.3 Renk, derinlik ve opacity

Bölüm zemin alternasyonu: `cream → stone → tintGreen → koyu` döngüsüyle her bölümü görsel olarak ayır. Şu an çoğu aynı kâğıt zemin.

Accent'leri konuşturun: gold = yatırım/para, grass = büyüme/saha, clay = risk. Başlık vurguları, ikonlar, sol-kenar şeritleri ve grafik renkleri bu anlam koduyla.

Gradient / mesh arka plan: hero ve bölüm geçişlerinde yumuşak gradient (panel gradient'leriniz hazır). Tam-düz zemin yerine hafif derinlik.

Glassmorphism (opacity uygulaması): `fx.headerGlass` + `backdrop-filter: blur` ile yarı-saydam sticky header; öne çıkan kart/modal'da `overlayWhite06` cam etkisi. Token'lar mevcut, uygulanmamış.

Elevation skalası: içerik kartlarına `shadowCard`; hover'da daha güçlü gölge; modal/popover'da `shadowPopover`. Düz görünümü katmanlı hale getirir.

Renkli veri görselleştirme: ECharts serilerinde amiral akış (RFQ) altın, diğerleri yeşil tonları; senaryo switch'inde kötümser/medyan/iyimser farklı renk.

### 3.4 Tipografi ve ritim

Başlık skalasında daha güçlü kontrast (dev bölüm başlığı vs gövde), bölüm intro "lead" cümlesi, ara ara büyük pull-quote, ve rakamlarda `tabular-nums` + iri punto vurgusu.

---

## 4. Uygulama yaklaşımı (sizin stack'inize özgü)

Kütüphane: **Framer Motion** (`motion/react`) — `whileInView` + `variants` + `staggerChildren` ile reveal/stagger; `useReducedMotion` ile a11y. Vite + React 19 ile sorunsuz; Next.js yasağınızla çelişmez (framework değil, kütüphane). Alternatif: Chakra geçiş + küçük bir `IntersectionObserver` hook'u (sıfır ek bağımlılık).

Erişilebilirlik (zorunlu): `prefers-reduced-motion: reduce` olduğunda tüm reveal/sayaç/parallax kapanır (yalnız anlık görünür). Bu hem erişilebilirlik hem "yorucu olmasın" şikâyetinin panzehiri.

Performans: yalnız `transform` ve `opacity` anime et (layout/`top`/`height` değil). `will-change` ölçülü; reveal `once: true` (bir kez). Grafikler görünüme girince yükle.

Merkezi uygulama (kaldıraç): hover + gölge + geçişi **`cardBase`/`chartCard` token'ına bir kez** eklemek, tüm kartları tek noktadan canlandırır. Reveal için tek bir `<Reveal>` sarmalayıcı bileşeni tüm bloklara uygulanır (`Blocks.tsx`'te `BlockView` sarmalanır). Yani büyük görsel etki, az ve merkezi kodla.

---

## 5. Önceliklendirme

Önce kısa açıklama: en yüksek etki/efor oranı, merkezi token değişiklikleriyle gelir (hover, gölge, reveal, sayaç, grafik girişi, zemin alternasyonu) — bunlar tüm siteyi tek dokunuşta canlandırır ve risksizdir. Bileşen çeşitliliği (bento, koyu bölüm, scrollytelling) daha çok efor ister, bölüm bölüm yapılır.

| Öneri | Etki | Efor | Risk | Faz |
|---|---|---|---|---|
| `cardBase`/`chartCard` hover + gölge + transition | Yüksek | Düşük | Düşük | Hızlı kazanım |
| Scroll-reveal + stagger (`<Reveal>` sarmalayıcı) | Yüksek | Düşük | Düşük | Hızlı kazanım |
| Sayı sayacı (count-up) | Orta-Yüksek | Düşük | Düşük | Hızlı kazanım |
| ECharts giriş animasyonu | Orta | Düşük | Düşük | Hızlı kazanım |
| Bölüm zemin alternasyonu + accent | Yüksek | Düşük-Orta | Düşük | Hızlı kazanım |
| Sekme/switch içerik geçişi (fade/slide) | Orta | Düşük | Düşük | Hızlı kazanım |
| Glass sticky header (opacity+blur) | Orta | Orta | Düşük | Orta |
| Bento / zig-zag yerleşim (seçili bölümler) | Yüksek | Orta | Orta | Orta |
| Koyu "feature" spotlight bölümleri | Yüksek | Orta | Orta | Orta |
| Öne çıkan stat şeridi + pull-quote + marquee | Orta | Orta | Düşük | Orta |
| Scrollytelling / sticky yan panel | Yüksek | Yüksek | Orta | Büyük |
| Karşılaştırma slider (rakip vs biz) | Orta-Yüksek | Yüksek | Orta | Büyük |

Karar çerçevesi:
Güvenli olan — token-merkezli hover/gölge/reveal + `prefers-reduced-motion`. Tüm siteyi canlandırır, geri alınması kolay, performans/a11y riski yok.
Riskli olan — her şeyi birden, ağır parallax/otomatik oynayan animasyon: dikkat dağıtır, performansı düşürür, "daha da yorucu" olur. Bundan kaçın.
Enterprise doğru yaklaşım — merkezi bir hareket sistemi (tek token seti: süre/easing/mesafe), `prefers-reduced-motion` zorunlu, performans bütçesi, bölüm bazlı kademeli yayılım.
Pratik öneri (senin durumun) — önce "Hızlı kazanım" fazını uygula (5 madde), canlıda gör/ölç, sonra "Orta" faza (bento + koyu spotlight + glass header) geç. Büyük faz (scrollytelling) en sona.

---

## 6. Sonraki adım

İstersen **Hızlı kazanım fazını** doğrudan uygularım: (1) `cardBase`/`chartCard`'a hover-lift + `shadowCard` + transition; (2) tüm bloklara `<Reveal>` (whileInView fade-up + stagger); (3) statlarda count-up; (4) ECharts giriş animasyonu; (5) bölüm zemin alternasyonu + accent — hepsi `prefers-reduced-motion` ile kapanabilir. Sonra `validate.py` → `npm build` → push → canlı doğrulama.

Not: Bu rapordaki hiçbir öneri içeriği/sayıyı değiştirmez; yalnız sunum katmanına dokunur, dolayısıyla canon (`database/`) ve `validate.py` etkilenmez.
