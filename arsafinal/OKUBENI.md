# arsam.net — Finansal Tablo (basit araç)

Üzeyir Bey'in karmaşık Excel yerine **okuyup anlayabileceği** sade finansal görünüm. Sen düzenler, para birimini değiştirir, JSON olarak dışa/içe aktarırsın.

- **Canlı:** https://karacaismail.github.io/finalarsa/finansal/
- **Yerel:** `/Users/karaca/Documents/sonbirarsa/arsafinal/`
- **Teknoloji:** Vite + React + TypeScript (sade, tek sayfa).

## Ne yapar?
- **Para birimi switcher (₺ / $ / €):** Üstten seçersin; tüm tablolar/kartlar seçilen para biriminde gösterilir. Kurlar düzenlenebilir (1 $ = 45,2 ₺, 1 € = 49 ₺ varsayılan).
- **Düzenlenebilir (mavi) alanlar:** aylık harcama planı (Tem 2026 → Ara 2027: OPEX/Pazarlama/CAPEX), OPEX kalemleri, CAPEX kalemleri, CPO maaş/araç/yan haklar.
- **Kilitli (🔒) alan:** piyasa istatistikleri (yazılımcı jr/md/sn, diğer meslekler, sahibinden/Trendyol/amazon.com.tr C-level) — salt-okunur referans.
- **JSON içe/dışa aktar:** "JSON dışa aktar" düzenlediğin veriyi indirir; "JSON içe aktar" bir JSON yükleyip tüm veriyi günceller. "Sıfırla" varsayılana döner.
- **Özet kartlar:** toplam CAPEX, olgun aylık OPEX, başlangıç dönemi toplam gider.

## Veri nasıl işaretli? (editable / fixed)
Veri `src/data/finansal.ts` içindedir. Her grupta `editable` alanı vardır:
- `editable: true` → düzenlenebilir (değişken veri; mavi kutu).
- `editable: false` → kilitli (sabit referans; benchmark'lar). UI bu alanları input olarak göstermez.
Para değerleri kendi para biriminde tutulur (`{ amount, currency }`); ekranda seçilen birime çevrilir. Aylık satırlar TL, CPO maaşı USD tabanlıdır.

## Önemli not — benchmark rakamları
Piyasa/C-level ücretleri **tahminîdir, resmî değildir** (özellikle C-level kamuya kapalıdır). Bağlam için konuldu ve kilitlidir. Kesinlik gerekirse gerçek maaş anketi verisiyle güncellenmeli.

## Nasıl güncellenir / yayınlanır?
- Yerelde: `cd arsafinal && npm install && npm run dev` (geliştirme) veya `npm run build`.
- Yayın: arsafinal, ana repo'nun (finalarsa) deploy akışına eklendi. `main`'e push → GitHub Actions hem deck'i hem arsafinal'i derler; arsafinal `/finalarsa/finansal/` altına konur.
- Veriyi koddan değil **JSON içe aktararak** da güncelleyebilirsin (frontend); kalıcı yapmak istersen export edip `src/data/finansal.ts`'e işleyip yeniden deploy edilir.

---

## "Başka neler olmalı?" — öneriler (önceliklendirilmiş)

**Anlaşılırlığı en çok artıracaklar (Üzeyir için):**
1. **Aylık nakit akışı + kümülatif nakit:** Şu an sadece gider var. Gelir + net + kümülatif nakit (40M sermayeden) eklenince "para ne zaman diptedir, ne zaman kendini döndürür" tek bakışta görünür. Başabaş noktası işaretlenir.
2. **Basit grafik:** Aylık gider çubuk grafiği veya nakit çizgisi (Chart.js/ECharts). Sayı tablosu + tek görsel, kavrayışı çok artırır.
3. **Yıllık özet (2026 → 2032):** Aylık tablo detaylı; bir de yıl-bazlı tek tablo (gelir/gider/net/yıl sonu nakit) okunabilirlik için.
4. **Her kaleme kısa açıklama (tooltip):** "OPEX nedir?", "CAPEX nedir?" gibi tek cümlelik baloncuklar.

**Karar/analiz gücü:**
5. **Senaryo seçici (kötümser/medyan/iyimser):** Gelir senaryosuna göre tablo değişir.
6. **Otomatik tutarlılık uyarısı:** OPEX kalemleri toplamı ile "aylık OPEX" eşleşmiyorsa uyarı; negatif/boş alan kontrolü.
7. **Gelir tarafı (7 akış):** İstersen gider + gelir = tam kâr/zarar; net marj görünür. (Şimdilik kapsam dışı bıraktık.)

**Kullanım kolaylığı:**
8. **Tarayıcıda otomatik kaydet (localStorage):** Sayfa yenilenince düzenlemeler kaybolmasın.
9. **PDF/yazdır:** Üzeyir'in çıktı alması için temiz baskı görünümü.
10. **Canlı kur opsiyonu:** Manuel kur yerine güncel kuru çekme (offline basitlik için manuel de kalabilir).

İstersen sıradaki turda 1–4'ü (nakit akışı + grafik + yıllık özet + açıklamalar) ekleyebilirim — Üzeyir Bey'in "okuyunca anlasın" hedefini en çok bunlar karşılar.
