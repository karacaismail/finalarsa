# arsam.net — Gider Takibi (v2)

Ay ay gider girip, başka bir sayfada otomatik toplayıp grafikleyen sade araç. Amaç: Üzeyir Bey karmaşık Excel yerine "hangi ay, hangi kategori, ne kadar"ı okuyabilsin.

- **Canlı:** https://karacaismail.github.io/finalarsa/finansal/
- **Yerel:** `/Users/karaca/Documents/sonbirarsa/arsafinal/`
- **Teknoloji:** Vite + React + TypeScript + ECharts (grafik) + Vitest (test). Tek sayfa, iki sekme.

## İki sekme

**Giriş:** Yıl/ay seç (veya Önceki/Sonraki ay), o ayın giderlerini 7 kategoride gir. Grup alt toplamı ve "bu ay toplam" anında hesaplanır. Ay ay ilerlersin.

**Özet & grafikler:** Tüm ayları kategori kategori toplar. Üç özet kart (24 ay toplamı, aylık ortalama, en yüksek ay), 4 dinamik ECharts grafik (aylık gider, kümülatif gider, aya göre yığılmış kategori, kategori pastası) ve ay×kategori tablosu (alt toplam + genel toplam). Sen Giriş'te değer değiştirdikçe burası otomatik güncellenir.

## 7 kategori

Personel, Pazarlama, Saha operasyonu, Dijital altyapı & AI, Ofis & idari, Yazılım & AI araçları, CAPEX. Giriş formundaki satırlar bunlardır.

## Veri ve kalıcılık

- **Tarayıcıda otomatik kayıt (localStorage):** Yenileyince/kapatınca girişler durur. "Sıfırla" → varsayılan 24 aya döner.
- **JSON içe/dışa aktar:** Veriyi yedekle veya başka cihaza taşı. İçe aktarımda şema doğrulanır; bozuk dosya reddedilir.
- **24 ay default:** Tem 2026 → Haz 2028. Değerler mevcut finansal modelden — Pazarlama ve CAPEX birebir; OPEX toplamı olgun-dönem oranlarıyla 5 alt kaleme bölünür (toplam birebir korunur); 19-24. aylar son artış hızıyla uzatılır (model varsayımı).
- **Para birimi:** ₺/$/€ switcher üstte; tüm değer/grafik seçilen birimde. Kurlar (1$, 1€) düzenlenebilir. Değerler TL tabanında saklanır.
- **Benchmark + CPO:** Özet'te referans olarak kalır (kilitli/salt-okunur). Benchmark maaşları tahminîdir, resmî değildir.

## Veri modeli (kısaca)

Tek kaynak: `months: MonthEntry[]` (her ay `{ ym, values: {7 kategori} }`, TL). Tüm toplam/grafik bundan türetilir (`src/lib/calc.ts`). Depolama/şema: `src/lib/store.ts`. Sabit veri (benchmark) `editable:false`. Dosyalar: `data/finansal.ts` (model+seed), `pages/Giris.tsx`, `pages/Ozet.tsx`, `components/num.tsx` (stilli sayı/tıkla-düzenle), `components/Chart.tsx` (ECharts sarmalayıcı).

## Çalıştırma / test / yayın

- Yerel: `cd arsafinal && npm install && npm run dev`
- Test: `npm run test` (Vitest — seed/dağıtım/toplam kimliği/çevirme/JSON-şema, 19 test).
- Yayın: `main`'e push → GitHub Actions **önce testleri çalıştırır** (test geçmezse deploy yok), sonra derler ve `/finalarsa/finansal/` altına koyar.

## Sayı biçimi

Binlik ayraçlı; en yüksek rakam grubu **kalın**, kalan normal, ondalık *italik* (örn. USD'de `64.409,29$`). Tüm metin en az 1rem.

---

## Sıradaki öneriler (opsiyonel)

1. **Yıllık özet (2026/2027/2028):** 24 ay detayına ek, yıl-bazlı tek tablo.
2. **Gelir tarafı:** Gider + gelir = net/kâr ve marj (şimdilik yalnız gider).
3. **Senaryo seçici (kötümser/medyan/iyimser):** Aynı forma çoklu senaryo.
4. **Kategori ekle/çıkar/yeniden adlandır:** Şu an 7 kategori sabit.
5. **Ay aralığını uzat:** 24 ay sabit; dinamik ay ekleme.
6. **PDF/yazdır:** Üzeyir'in çıktı alması için temiz baskı.
7. **ECharts tree-shake:** Paket boyutunu ~1,2MB'tan ~400KB'a indirmek için yalnız kullanılan grafik modüllerini import etmek.
