# RAPOR-11 · TKGM / EİDS Doğrulama Turu

Tarih: 2026-06-24 · Sürüm: **v3.2** · Commit: `1715f81` · Tag: `v3.2`
Canlı: https://karacaismail.github.io/finalarsa/ (yeni derleme `index-D7loJQSD.js` yayında, doğrulandı)

Bu tur iki şey yaptı: (1) verdiğin TKGM/EİDS/parsel-doğrulama içeriğini ilgili bölümlere işledi, (2) "TKGM'ye neden ve hangi koşullarla entegre oluruz?" sorusunu yanıtlayan yeni bir bölüm ekledi. Tümü test-first ilerledi ve canlıya alındı.

---

## 1. Yeni bölüm: 05b — TKGM entegrasyonu

`database/sections/05b-tkgm-entegrasyon.json` (slug `tkgm-entegrasyon`, accordion'da "Problem ve Çözüm" grubunda, 5a'dan sonra). İki soruyu ayrı yanıtlar ve aktörleri net tutar (platform / devlet / kullanıcı):

**Neden entegre olmalıyız? (üç gerekçe)**
- Yasal zorunluluk: EİDS yetki doğrulaması 1 Ocak 2025'te zorunlu oldu; yetkisiz ilan yayınlanamaz. Premium değil, ön şart.
- Ürün farkı: ada/parsel + tapu belge doğrulaması, alıcının "gerçek mi, doğru parsel mi, yetkili mi" korkusunu azaltır.
- Savunma: EİDS yetki + parsel verisi + belge geçmişi = kolay kopyalanamayan doğrulama standardı.

**Hangi koşullarla? (üç yol + protokol)**
- Üç yol ayrıştırıldı: EİDS (Ticaret Bakanlığı, zorunlu) · TAKPAS protokolü (TKGM, zor) · kullanıcı onaylı belge+OCR (kolay/orta).
- TAKPAS protokol süreci 5 adımda: kullanım senaryosu + veri minimizasyonu → talep formu + güvenlik/gizlilik taahhüdü → Alt Komisyon → Üst Komisyon → güvenlik + teknik bağlantı.
- Çıpalar: gerçekçi onay ~3–6 ay; TKGM 2026 sorgu (günlük 10 ücretsiz, sonrası kontör); asıl maliyet KVKK + güvenlik + operasyon.
- Teknik/hukuki şart: sabit IP + şifreli bağlantı + audit log; KVKK amaç-bağlı veri minimizasyonu; yıllık güvenlik taahhüdü + denetim.
- Hassas veri sınırı: malik/hisse/şerh/haciz/ipotek ilk fazda istenmez (red riski). İlk başvuru: parsel tanımlayıcı + taslak geometri + m²/nitelik.
- Fazlı yol haritası: Faz 1 (EİDS + belge/OCR, şimdi) → Faz 2 (sınırlı parsel verisi) → Faz 3 (Web Tapu + protokol, yetki/işlem).

Konumlanma cümlesi: Platform tapu tescili yapmaz; doğrulama, koordinasyon ve risk raporu üretir. Bu "ticari veri çekme" değil, sahte ilanı azaltan, veri minimizasyonu yapan, kamu düzeniyle uyumlu doğrulama altyapısıdır.

---

## 2. İlgili bölümlere işlenen içerik (paralel ajanlar)

Beş bölüm ayrık dosyalarda paralel zenginleştirildi; her dalga sonrası merkezî validate.py çalıştı.

- **04-problem:** sahte/yanıltıcı ilan, yetkisiz emlakçılık, EİDS'in 1 Ocak 2025 zorunluluğu, parsel/konum belirsizliği — problem çerçevesinde.
- **05-cozum:** güven dosyasını kuran beş doğrulama katmanı (EİDS yetki, taşınmaz numarası, tapu OCR + ilan-belge uyumu, ada/parsel + konum, doğrulanmış ilan rozeti).
- **10-rekabet:** doğrulanmış veri kalkanı (yetki + parsel + belge + saha katmanlarının birikmesiyle artan taklit maliyeti) + counter-positioning.
- **14-risk:** operasyonel doğrulama önlemleri (belge hash, mükerrer parsel, yanlış pin, KVKK maskeleme, manuel doğrulama kuyruğu) — risk-gates matrisini tekrar etmeden.
- **09b-satıcı-emlakçı:** EİDS kurumsal yetki akışı (e-Devlet yetkilendirme, yetki belgesi, yetki süresi ≥3 ay) + doğrulanmış emlakçı/danışman.

Sözlük: TAKPAS, MEGSİS, Web Tapu, RFQ eklendi; EİDS tanımı 1 Ocak 2025'e düzeltildi. Kaynaklar: eids-ticaret, tkgm-protokol, tkgm-tarife-2026, parsel-sorgu-kosullar eklendi.

---

## 3. Test ve deploy

validate.py: **32 başarı, 26 uyarı, 0 HATA, GEÇTİ ✓** (accordion 29/29, manifest 29 bölüm, dataRef/valueRef bütün). `tsc -b` temiz, `vite build` temiz. Commit `1715f81` `main`'e push edildi (10 dosya, hepsi database/). Canlı doğrulama: yeni bundle `index-D7loJQSD.js` HTTP 200. Tag `v3.2`.

---

## 4. Kalanlar / notlar

- **Hukuki içerik doğrulaması:** Bölümdeki süre/komisyon/tavan ifadeleri verdiğin kaynaklara dayanıyor ve "model varsayımı / doğrulanmış kaynak" etiketleriyle çerçevelendi. Yatırımcı sunumundan önce güncel mevzuatla (TKGM yönetmeliği + Ticaret Bakanlığı EİDS + 2026 tarifesi) bir hukukçuyla son kez teyit önerilir; mevzuat değişebilir.
- **Faz 1 ürün backlog'u:** EİDS yetki doğrulama, taşınmaz numarası ile ilan, tapu OCR + ilan-belge uyumu, manuel doğrulama kuyruğu — bunlar bölümde anlatıldı ama ürün/teknik backlog olarak ayrıca planlanmalı (test → şema → geliştirme sırasıyla).
- **Önceki turdan devam eden P1/refactor maddeleri** (RAPOR-10): React merkezî componentler, P1 dil sadeleştirmeleri, `arsam-yillik-hedef-pay-modeli.xlsx` %38 güncellemesi hâlâ açık.
- Bu tur yalnız `database/` içeriğini değiştirdi; React tarafı (landing/src) değişmedi — mevcut blok tipleri (heading/lead/note/cardGrid/table/statGrid/list) yeni içeriği render eder.
