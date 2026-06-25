# arsam.net — Aylık Gider Planı (v4)

"Her ay ne harcayacağız?" sorusunu kümeler + kalem kırılımıyla, tek sayfa accordion olarak yanıtlar. Personel gideri 256 rolden ve gerçek 2026 bordro motorundan hesaplanır.

- **Canlı:** https://karacaismail.github.io/finalarsa/finansal/
- **Yerel:** `/Users/karaca/Documents/sonbirarsa/arsafinal/`
- **Teknoloji:** Vite + React + TypeScript + ECharts + Vitest. Tek sayfa, accordion.

## İki soru, iki cevap (üstte kartlar)

1. **İlk ay yatırımı (CAPEX): 2.804.200 ₺** — accordion item 1, kalem kırılımı içinde.
2. **Her ay toplam:** Eyl 2026 ~5,87M ₺ → Ağu 2028 ~19M ₺; **24 ay toplam ~248M ₺** (varsayılan parametrelerle).

## Accordion liste

Default kapalı; bir item'a tıklayınca açılır, diğerleri kapanır (tek-açık), açılan item üstten ~80px'e kayar. **Item 1 = CAPEX**, **item 2–25 = 24 ay** (Eyl 2026 → Ağu 2028). Her ay açılınca **küme kırılımı** gelir; her kümeye tıklayınca **kalem kırılımı** açılır.

## Kümeler ("başka hangi kümeler var?" cevabı — 8 küme)

1. **Personel giderleri** — net maaşlar, gelir vergisi (stopaj), SGK (işçi+işveren), yemek, yol, hoşgeldin paketi, ikramiye.
2. **Yatırım (CAPEX)** — ilk ay büyük kalemler + her ay yeni işe alım ekipmanı (24k/kişi).
3. **Ofis & kira** — kira (150k/ay) + ilk ay depozito.
4. **Sürekli giderler** — internet, elektrik, su, doğalgaz, mutfak, sarf, kırtasiye, temizlik.
5. **Pazarlama** — dijital reklam/medya (geçmiş rampı).
6. **Yazılım / SaaS & AI** — dijital altyapı + AI/yazılım lisansları.
7. **Profesyonel hizmetler** — muhasebe, hukuk, danışmanlık, İSG/OSGB.
8. **Saha operasyonu** — araç/yakıt/ekipman.

## Personel = gerçek 2026 bordro motoru

`src/lib/payroll.ts`: brüt → net, **kümülatif gelir vergisi** (%15→%40, 2026 ücret tarifesi), işçi/işveren SGK (tavan 297.270 ₺ kapaklı), damga. Parametreler **web-doğrulandı** (Resmî Gazete/SGK/PwC/CottGroup): brüt asgari 33.030, işveren %23,75 (teşviksiz), USD/TRY 46,52.

**Kurucu (senin) maaşı: 7.500$ NET hedefi.** Her ay net sabit kalsın diye gerekli brüt çözülür; kümülatif vergi yüzünden brüt yıl içinde **artar** (tavan-taban). Doğrulama: Ocak brüt ~469.940 ₺, işveren maliyeti ~540.541 ₺, Aralık brüt ~624.210 ₺ — paylaştığın araştırmayla birebir (testlerde sabit).

> Not: Kurucu ücret yapılandırması (maaş vs temettü, 4/a-4/b) bir vergi/SGK kararıdır; ben mali müşavir değilim, müşavirinle kesinleştir. Araç şu an "net maaş bordrosu" senaryosunu modeller.

## Veri ve düzenleme

- **256 rol** `src/data/roles.ts` — İK PLANI'ndan programatik. Aktiflik = işe alım ≤ ay (matrisle %100 tutarlı).
- **Sürekli/yazılım/saha/profesyonel** kümeleri olgun (256 kişi) değerden **headcount ile ölçeklenir**; hepsi düzenlenebilir.
- **Varsayımlar paneli** (üstte, aç-kapa): USD kuru, işveren SGK oranı, yemek/yol, ikramiye, kira, sürekli gider tabanı, ekipman.
- **Kalıcılık:** localStorage + JSON içe/dışa. **Sıfırla** → varsayılan.
- **Para birimi:** ₺/$/€ switcher; tüm değer/grafik çevrilir.

## Çalıştırma / test / yayın

- Yerel: `cd arsafinal && npm install && npm run dev`
- Test: `npm run test` (Vitest — 19 test: 6 bordro [araştırma rakamlarıyla] + 13 küme/zincir/şema).
- Yayın: `main`'e push → GitHub Actions **önce test**, sonra derle + `/finalarsa/finansal/`.

## Sıradaki

- Sürekli gider kalemleri için gerçek birim fiyatlar (şu an headcount-ölçekli tahmin).
- İsteğe bağlı: kurucu için "temettü + tavandan 4/b" senaryosu (maaşa alternatif), yıllık özet, gelir/kâr tarafı.
