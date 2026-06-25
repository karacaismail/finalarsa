# arsam.net — Kadro & Gider (v3)

Gerçek İK planını (256 rol, brüt maaş, işe alım tarihi) finansal modele **zincirleme** bağlayan araç. Amaç: Üzeyir Bey "kim, ne zaman, ne kadar" akışını ve aylık toplam gideri tek yerde görsün; sen de düzenleyebilesin.

- **Canlı:** https://karacaismail.github.io/finalarsa/finansal/
- **Yerel:** `/Users/karaca/Documents/sonbirarsa/arsafinal/`
- **Teknoloji:** Vite + React + TypeScript + ECharts + Vitest. Tek sayfa, üç sekme.

## Zincir (en önemli kavram)

Kadro (roller + maliyet parametreleri) → her ayın **personel gideri** = o ay aktif rollerin yüklü maliyeti → **aylık toplam** (+ 6 manuel kalem) → Özet kartları, tablo ve grafikler. Bir rolün brüt maaşını veya işe alım ayını ya da bir maliyet parametresini değiştirince **tüm zincir** anında güncellenir.

## Üç sekme

**Kadro:** Maaş maliyet modeli (4 düzenlenebilir parametre) + 256 rolün tablosu. Her rolün brüt maaşı ve işe alım ayı düzenlenebilir; "yüklü maliyet/ay" otomatik hesaplanır. Arama + "sadece pencere (≤ Ağu 2028)" filtresi + rol ekle/sil.

**Giriş:** Yıl/ay seç. **Personel kalemi salt-okunur** (Kadro'dan otomatik, o ay kaç rol aktifse). Diğer 6 kalemi (Pazarlama reklam, Saha, Dijital altyapı, Ofis, Yazılım, CAPEX) elle girersin. "Bu ay toplam" anında.

**Özet & grafikler:** Özet kartlar (24 ay toplam, aylık ortalama, en yüksek ay, personel payı), 5 dinamik ECharts (aylık gider, aktif rol sayısı, aya göre yığılmış kategori, kümülatif gider, kategori pastası), ay×kategori tablosu ve benchmark referansı.

## Maaş maliyet modeli

Aylık personel gideri (rol başına) = **brüt × işveren SGK çarpanı × (1 + ikramiye/12) + yemek + yan haklar**. Varsayılanlar (düzenlenebilir): SGK çarpanı 1,225 (≈ %22,5 işveren payı), yemek 6.000 ₺/ay/kişi, yan haklar 4.000 ₺/ay/kişi, ikramiye 1 maaş/yıl (Kurban + Ramazan + yılbaşı + yıl-sonu primi). Bu rakamlar senin politikan; sayfada yoktu, parametre yaptım — kendi değerlerinle değiştir.

## Zaman ve veri

- **Pencere:** Eyl 2026 → Ağu 2028 (24 ay). Bu pencerede 106 rol aktif olur; plan 2031'e kadar 256 rol içerir (hepsi Kadro'da, pencere dışı roller 24 aylık görünümü etkilemez).
- **Maaşlar brüt** (İK PLANI tablosundan birebir). Aktiflik = işe alım ayı ≤ o ay (sayfadaki ✓ matrisiyle 16.640 hücrede %100 tutarlı — boşluk/çıkış yok).
- **Kalıcılık:** localStorage otomatik kayıt + JSON içe/dışa aktar. "Sıfırla" → varsayılana döner.
- **Para birimi:** ₺/$/€ switcher; kurlar düzenlenebilir.

## Çalıştırma / test / yayın

- Yerel: `cd arsafinal && npm install && npm run dev`
- Test: `npm run test` (Vitest — 19 test: roller, aktiflik, maliyet formülü, zincir toplam kimlikleri, JSON/şema).
- Yayın: `main`'e push → GitHub Actions **önce testleri çalıştırır** (geçmezse deploy yok), sonra derler ve `/finalarsa/finansal/` altına koyar.

## Notlar / sıradaki

- Personel-dışı 6 kalem hâlâ tahmini tohumla gelir; gerçek reklam/altyapı bütçeni Giriş'ten gir.
- Roller `src/data/roles.ts` — İK PLANI CSV'sinden programatik üretildi (elle yazılmadı).
- Sıradaki opsiyonlar: yıllık özet, gelir tarafı (net/kâr), departman bazlı maliyet kırılımı, ECharts tree-shake (paket boyutu ~1,2MB→~400KB).
