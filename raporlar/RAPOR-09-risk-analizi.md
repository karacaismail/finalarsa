# RAPOR-09 · Risk Analizi — Accordion + Genişlik Yapısını Ne Bozabilir?

**Tarih:** 2026-06-23 · **Yöntem:** 5 paralel ajan, ayrı risk alanları · **Bağlam:** commit `5072ab8` (genişlik düzeltmesi canlıda doğrulandı: kart 1200px)

Bu rapor, son genişlik düzeltmesini ve genel accordion yapısını **ileride neyin bozabileceğini** inceler. Her risk: NE / NE ZAMAN TETİKLENİR / ETKİ / ÖNERİ. Sonda öncelik ve efor tablosu var.

Önce net durum: Yapı şu an çalışıyor ve test geçiyor (validate, tsc, vite, 320px, tek-açık, genişlik). Aşağıdaki riskler "şu an bozuk" değil; "ileride bir değişiklik yapılırsa sessizce bozulabilecek" kırılganlıklardır.

---

## Öncelik tablosu

| Öncelik | Risk | Efor | Neden |
|---|---|---|---|
| **P1 — acil/ucuz** | accordion-groups doğrulaması yok (R2) | ~15 satır | Bölüm sessizce kaybolur, kimse fark etmez |
| **P1 — acil/ucuz** | Alternating zemin grup başına sıfırlanıyor (R3) | 1 satır | Görsel desen tutarsızlığı |
| **P2 — orta** | Genişlik "sihirli sayı" kuplajı (R1) | Küçük refactor | Bir değişiklik genişliği tekrar bozar |
| **P2 — orta** | Ölü kod: SectionNav/SectionDivider (R5) | Silme | Bakım kafa karışıklığı |
| **P2 — orta** | Erişilebilirlik: focus + aria (R6) | Küçük | Ekran okuyucu/klavye deneyimi |
| **P3 — büyük/ileride** | Tüm 27 bölüm ilk yüklemede DOM'da (R4) | Büyük | Mobil performans/LCP |
| **P3 — izle** | isHero=order===1 kuplajı (R7) | Küçük | İleride sıra değişirse |
| **P3 — izle** | CI base-path/Node sabit (R8) | Küçük | Repo adı değişirse stil 404 |

---

## R1 — Genişlik "sihirli sayı" kuplajı (P2)

**NE:** Düzeltme şu eşitliğe dayanıyor: `AccordionPresentation maxW = 1264px = SectionView maxW (1200) + AccordionPresentation yatay padding (md 8 = 2×32px)`. İki ayrı bileşende iki ayrı `maxW` ve padding var; 1264 sayısı, içteki 1200'e "elle hesaplanmış" bir telafi.

**NE ZAMAN TETİKLENİR:** Biri (a) SectionView'in `maxW="1200px"` değerini, (b) SectionView'in `px`'ini, veya (c) AccordionPresentation'ın `px`'ini değiştirirse; ya da yeni bir breakpoint (xl) eklenirse — 1264 telafisi tutmaz, içerik tekrar daralır/kayar.

**ETKİ:** Metin sütunu yine bozulur (bugün yaşanan ~1000px sorununun tekrarı). Hata sessiz: build geçer, sadece görsel kayar.

**ÖNERİ:** Tek genişlik kaynağı. İki yol:
- (Basit) `theme/`'e `CONTAINER_MAX = "1200px"` sabiti koy, hem SectionView hem AccordionPresentation oradan okusun; AccordionPresentation maxW'yi `CONTAINER_MAX` + padding olarak türet (sihirli sayı yok).
- (Temiz) SectionView accordion modunda (`as="div"`) iç `maxW`/`mx`'i bırakıp tek genişlik otoritesini AccordionPresentation'a devretsin. Böylece iç içe iki maxW tamamen kalkar.

Not: Bir analiz ajanı "1264 yanlış" dedi; o ajan Chakra `8` boşluğunu 128px sandı (doğrusu 32px). 1264 **doğru** ve canlı doğrulandı (kart 1200px). Risk sayının yanlışlığı değil, **kuplajın kırılganlığıdır.**

---

## R2 — accordion-groups.json doğrulaması yok (P1 · en yüksek değer)

**NE:** `database/data/accordion-groups.json` 27 bölümü slug ile gruplara bağlıyor. Ama `database/_build/validate.py` bu dosyayı **hiç kontrol etmiyor.**

**NE ZAMAN TETİKLENİR:** (a) Yeni bölüm eklenir ama hiçbir gruba konmaz; (b) bir bölümün slug'ı değişir ama accordion-groups güncellenmez; (c) slug yanlış yazılır; (d) bir slug iki gruba birden yazılır.

**ETKİ:** AccordionGroup `sections.find(s => s.slug === slug)` ile eşleştiriyor; eşleşmeyen bölüm **sessizce render edilmez** (hata yok, uyarı yok). Yatırımcı sunumu eksik bölümle yayına gider, kimse fark etmeyebilir. (Bugün 27/27'yi elle doğruladım ama bu otomatik değil.)

**ÖNERİ:** validate.py'a accordion-groups kontrolü ekle: her slug gerçek bir bölüme karşılık geliyor mu, 27 bölümün hepsi tam olarak bir grupta mı (kapsama %100), tekrar var mı. ~15 satır, deploy kapısına girince gelecekteki sessiz kırılmayı tamamen önler. **En düşük efor / en yüksek koruma.**

---

## R3 — Alternating zemin grup başına sıfırlanıyor (P1 · ucuz)

**NE:** SectionView zemin rengini `index % 2` ile seçiyor (paper/paperWarm). AccordionGroup her gruba `index={i}` (grup içi, 0'dan başlayan) geçiyor. Yani her grupta sayaç sıfırlanıyor.

**NE ZAMAN TETİKLENİR:** Her accordion grubu render olduğunda. Global sıra yerine grup-içi sıra kullanıldığı için zemin deseni gruplar arası tutarsızlaşır.

**ETKİ:** Görsel: bölümlerin açık/koyu zemin sırası gruptan gruba kayar (kozmetik, işlevsel değil). `background` alanı tanımlı bölümler etkilenmez; yalnız varsayılan alternating'e düşenler.

**ÖNERİ:** Tek satır — `index % 2` yerine `section.order % 2` kullan (order zaten global ve sıralı). Veya AccordionPresentation'da global bir sayaç tutup geç.

---

## R4 — Tüm 27 bölüm ilk yüklemede DOM'da render (P3 · performans)

**NE:** Accordion kapalı olsa bile içerik DOM'da (native `<details>` içeriği yüklü tutar). İlk açılışta 27 bölümün tüm blokları + tüm ECharts grafikleri render ediliyor. Bundle: ECharts ~1,1MB + ana paket ~930KB.

**NE ZAMAN TETİKLENİR:** Her ilk ziyarette, özellikle mobil/yavaş ağ. Bölüm/grafik sayısı arttıkça kötüleşir.

**ETKİ:** İlk yüklenme süresi (LCP), bellek ve CPU. Yatırımcı telefonda açarsa ağırlık hissedilebilir. Şu an kabul edilebilir ama büyüdükçe risk artar.

**ÖNERİ:** (a) Accordion içeriğini lazy-render: yalnız açık grubun bölümlerini render et (kapalı grup içeriğini DOM'dan çıkar). (b) ECharts'ı ayrı chunk'a alıp `import()` ile tembel yükle. (c) Grafikleri görünür olunca (IntersectionObserver) mount et. Büyük efor; performans hedefi konunca yapılır.

---

## R5 — Ölü kod: SectionNav, SectionDivider, dividers (P2)

**NE:** Accordion'a geçince App.tsx'ten `SectionNav` ve `SectionDivider` çıkarıldı; dosyalar ve `dividers.json` duruyor, artık hiçbir yerden import edilmiyor.

**NE ZAMAN TETİKLENİR:** Yeni bir geliştirici (veya ben, sonraki oturumda) "bu bölüm navigasyonu neden çalışmıyor / bunu güncellemeli miyim?" diye takılır.

**ETKİ:** Bakım kafa karışıklığı, küçük bundle artığı, yanlış güncelleme riski.

**ÖNERİ:** Ya sil (SectionNav.tsx, SectionDivider.tsx, dividers.json + ilgili import'lar), ya da dosya başına "ARTIK KULLANILMIYOR — accordion'a geçildi" notu. Silmek temiz; ama SectionNav'ı ileride accordion-içi navigasyon olarak geri kullanmak istersen, notlu bırakmak mantıklı.

---

## R6 — Erişilebilirlik: focus yönetimi + açık durum (P2)

**NE:** Accordion native `<details>/<summary>` (temel erişilebilirlik var: klavye Enter/Space, disclosure deseni). Eksikler: açık grup başka grup açılınca otomatik kapanırken **focus yönetimi yok**; `summary` ile içerik arasında açık `aria-controls` bağı yok.

**NE ZAMAN TETİKLENİR:** Klavye/ekran okuyucu kullanıcı bir grubu açıkken başka grubu açarsa; focus, kapanan grubun (artık gizli) içeriğinde kalabilir.

**ETKİ:** Klavye kullanıcısı için focus kaybı; ekran okuyucu deneyiminde belirsizlik. WCAG açısından iyileştirilebilir (kritik ihlal değil, çünkü native öğeler temel desteği veriyor).

**ÖNERİ:** `summary`'ye `aria-controls={içerik-id}`, içerik kutusuna `id`; otomatik kapanan grupta focus o grubun başlığına dönsün (küçük useEffect). İsteğe bağlı iyileştirme.

---

## R7 — isHero = order===1 accordion içinde (P3 · izle)

**NE:** SectionView, `section.order === 1` ise özel hero düzeni (görsel + kart şeridi) uyguluyor. Karar-notu (order 1) accordion Grup 1 içinde bu düzenle render oluyor. Çalışıyor.

**NE ZAMAN TETİKLENİR:** İleride bölüm sırası/order'ı değişirse veya hero düzeni başka bağlamda (sunum modu) kullanılmak istenirse; hero mantığı global order'a bağlı, accordion bağlamından habersiz.

**ETKİ:** Düşük. Bugün doğru çalışıyor; gelecekte sıra değişirse hero yanlış bölümde çıkabilir.

**ÖNERİ:** İleride `layout` prop'u (hero/standard/accordion) ile açık hale getir. Şimdilik not yeterli.

---

## R8 — CI: base-path ve Node sürümü sabit (P3 · izle)

**NE:** `vite.config.ts` build'de `base: "/finalarsa/"` sabit; deploy.yml Node sürümü sabit; CI'da derleme sonrası asset varlık kontrolü yok.

**NE ZAMAN TETİKLENİR:** Repo adı değişirse (base path tutmaz → stil/JS 404), veya Node sürümü EOL olursa.

**ETKİ:** Repo yeniden adlandırılırsa site beyaz ekran (stil yüklenmez). Bugün için düşük; sadece o işlemde tetiklenir.

**ÖNERİ:** base path'i `GITHUB_REPOSITORY`'den türet; deploy.yml'e "dist/index.html içinde /finalarsa/assets var mı" doğrulama adımı ekle.

---

## Davranış notu (düşük risk): controlled details + hızlı tıklama

`AccordionGroup` controlled (`open={isOpen}` + `onToggle`). Mantık sağlam: `onToggle` yalnız durum gerçekten değiştiğinde `onOpen/onClose` çağırıyor, sonsuz döngü yok (incelendi, tek-açık canlı doğrulandı). Teorik olarak çok hızlı/çift tıklamada anlık tutarsızlık olabilir; pratikte gözlenmedi. Sorun çıkarsa `ref` ile uncontrolled moda veya `useTransition`'a geçilebilir. Şimdilik aksiyon gerektirmez.

---

## Önerilen sıra

1. **Hemen (bu oturumda yapılabilir, ucuz, önleyici):** R2 (validate.py guard) + R3 (order-based zemin). İkisi birlikte gelecekteki en sinsi iki sessiz hatayı kapatır.
2. **Yakında:** R1 (tek genişlik kaynağı) + R5 (ölü kod) + R6 (a11y).
3. **Performans hedefi konunca:** R4 (lazy-render + ECharts split).
4. **İzle:** R7, R8, davranış notu.

İstenirse P1 maddelerini (R2 + R3) hemen uygulayıp deploy edebilirim.
