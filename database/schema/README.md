# arsam.net içerik veritabanı — şema rehberi

Bu klasör, arsam.net pitch'inin tüm içeriğini **parçalanmış, tekrarsız ve tutarlı** JSON dosyaları halinde tutar.
Amaç: TypeScript ile parse edilip bir UI kütüphanesiyle (Flowbite) landing page'lere dönüştürülmek.

## Klasör yapısı
- `shared/` — çapraz kesen tek kaynaklar. **Rakamlar yalnızca burada** (metrics.json).
  - `brand.json` · marka, kurucu, iletişim, rakipler
  - `metrics.json` · TÜM kanonik rakamlar (value + unit + display + label + source)
  - `sources.json` · atıflar (TKGM, TÜİK, 4691, ...)
  - `glossary.json` · terim tanımları
  - `design-tokens.json` · renk, radius, tipografi, spacing
- `sections/` — `NN-slug.json`. Her dosya 1 HTML bölümü. Sıra dosya adındaki `NN` ile.
- `data/` — analitik veri kümeleri (finansal model, pazar, İK/AI, strateji, teşvikler, çerçeveler).
- `manifest.json` · tüm dosyaların kataloğu + bölüm sırası + ref grafiği.
- `reconciliation.json` · kaynaklar arası rakam farkları ve kanonik kararlar.

## Tekrarsızlık modeli (hibrit)
1. **Paylaşılan rakam** → yalnızca `metrics.json`'da yaşar. Bölüm onu **iki yolla** kullanır:
   - blok alanı: `"valueRef": "revenue.median"` → parser `metrics["revenue.median"]` nesnesine çözer.
   - metin içi: `"... yıllık {{metric:revenue.median}} gelir"` → parser `metrics["revenue.median"].display` ("519 milyon ₺") ile değiştirir.
2. **Bölüme özgü metin** → o bölüm dosyasında satır içi (tek yerde) yaşar.
3. Hiçbir rakam iki dosyada elle tekrarlanmaz.

## Bölüm zarfı (envelope)
```
{ "id", "kind":"section", "schemaVersion", "lang":"tr",
  "order":Number, "slug":String, "nav":{num,label}, "background":String,
  "title":{text, accent?}, "blocks":[ ... ], "refs":{ metrics:[], data:[], sources:[], glossary:[], shared:[] } }
```
`refs.metrics` otomatik toplanır (valueRef + {{metric:}} taraması). Parser kırık ref olursa hata vermelidir.

## Blok tipleri (discriminated union · `type` ayırıcı)
eyebrow · heading · lead · paragraph · stat · statGrid · card · cardGrid · list · table ·
timeline · funnel · pillRow · quote · cta · ctaStack · chart · note · feature · fomoVeil ·
crisisBox · countdown · scrollHint · badge

`chart` blokları `dataRef` ile `data/` dosyasına bağlanır (örn. EBITDA, funnel, yıllık tablo).

## TS önerisi (geliştirme sırası)
1. **Test/şema önce:** Zod ile blok union'ı + `MetricKey` tipini tanımla; metrics anahtarlarını literal union yap; her section dosyası için ref-çözümleme testi yaz.
2. **Veri modeli:** `loadMetrics()` → `Map<MetricKey, Metric>`; `resolveRefs(section)` kırık ref'te throw.
3. **Render:** blok → Flowbite bileşeni eşlemesi; `{{metric:}}` interpolasyonu tek util'de.
4. **Edge case:** eksik display, yüzde/ratio formatı, kırık dataRef, eksik glossary terimi.
