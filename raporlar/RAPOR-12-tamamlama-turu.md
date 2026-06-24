# RAPOR-12 · Tamamlama Turu (eksiklerin kapatılması)

Tarih: 2026-06-24 · Sürüm: **v3.3** · Commit: `3f96c49` · Tag: `v3.3`
Canlı: https://karacaismail.github.io/finalarsa/ (bundle `index-sDRaZ5fE.js` yayında, Chrome ile görsel doğrulandı)

Bu tur, RAPOR-10/11 sonunda açık bıraktığım eksikleri kapattı ve en önemlisi **canlı render'ı gözle doğruladı**.

---

## 1. Kapatılan eksikler

**Görsel doğrulama (önceki turun en büyük açığıydı):** Canlı site Chrome ile açıldı ve DOM üzerinden teyit edildi. Sonuçlar: yeni bundle yayında; `%38`, `149 milyar`, `5,97 milyar` görünüyor; eski `5,5 milyar` ve `137,2` YOK; yeni TKGM bölümü (05b) tam render oluyor (TAKPAS, üç gerekçe kartı, üç entegrasyon yolu tablosu, Faz 1-3); dedup'lı bölümler (risk/yönetişim/yatırım seçenekleri/ilk-90) component üzerinden render oluyor; çözülmemiş token (`{{metric}}`) sızıntısı = 0; çözülememiş metrik işareti (`«key»`) = yok. Kalan tek `%35` eşleşmesi aslında `%35,7` (medyan 2031 ara-yıl payı, %38'e giden rampa) — bayat hedef değil.

**13-başabaş tam tek-kaynak:** statGrid kartları ve grafik-sekme metinlerindeki tüm kanonik sayılar `valueRef`/`{{metric}}` ile metrics'e bağlandı (RichText ve interpolate'in her alanda token çözdüğünü kodda doğruladım). Önceki turda kalan 10 "satır içi kanonik sayı" uyarısı temizlendi; kasa dibi/kümülatif gider/başlangıç sermayesi/medyan gelir artık tek kaynaktan.

**fin.breakeven_months tutarsızlığı:** "18 ay" → "~6 ay" (operasyonel başabaş; Tem 2026 → Oca 2027). Etiketi netleştirildi. Çelişki giderildi.

**P1 bölüm temizliği (11 section):** 01 karar kutusu çakışması; 02 toplantı geçmişi tek sahip; 18 kapanış artık imza sonrası ilk-30-gün (yeni içerik); 07 komisyonsuz tek açıklama + RFQ köprü; 07a yalnız ürün akışı; 11 "AI patron değil kalfa" tek kez + rol dağılımı; 12 "256 kişi" tekrarı azaltıldı; 16-cpo yan haklar tek stat grid; 06 metafor tek kez + playbook 10'a köprü; 10 rakip tezi konsolide (kanıtlı bloklar korundu).

**escapeRegExp dedup:** İki dosyadaki kopya tek util'e indirildi (`landing/src/lib/regex.ts`); GlossaryTerm ve MarkHighlight oradan import ediyor.

**Validator guard:** "dataRef component'i olan bölüm ayrıca statik `table` taşıyor mu" kontrolü eklendi (P0 #2 regresyon kapısı). İlk eklemede 08'i yanlış işaretledi (08'in tabloları meşru); kontrol, yalnız statik tablonun yerine geçen 5 component'le (risk/sermaye/yönetişim/getiri/yatırım) sınırlandırıldı — artık yanlış pozitif yok.

**xlsx %38:** `arsam-yillik-hedef-pay-modeli.xlsx` pay rampası (2032 = %38) ve gelir hedefleri (2,69 / 5,97 / 9,85 milyar) kanona getirildi; formüller yeniden hesaplandı.

**Dokümanlar repoda:** RAPOR-08..11 + PROJE-OZETI (%38 kanon) + xlsx v3.3 ile commit'lendi.

---

## 2. Test ve sonuç

validate.py: **33 başarı / 13 uyarı / 0 HATA / GEÇTİ ✓.** `tsc -b` temiz, `vite build` temiz. Commit `3f96c49` main'e push, tag `v3.3`, canlı bundle HTTP 200 + Chrome görsel doğrulama.

Uyarılar 26'dan 13'e indi. Kalan 13 uyarının tamamı **çelişki değil**: (a) "70 metrik hiçbir bölümde ref edilmemiş" — bunlar data dosyaları/component üzerinden kullanılıyor, bilgi amaçlı; (b) 12-ik "256 kişi" (2 işlevsel kullanım: başlık + paragraf), 15-teknopark yasal sabitler (31/12/2028, %100, 40 kat), 98 "470 model" — hepsi kasıtlı, okunur ve değerleriyle tutarlı tekrarlar. Bunları tokenlamak okunabilirliği bozardı; değer sürüklenmesi (drift) riski yok.

---

## 3. Bilinçli ertelenen tek kalem

**Büyük React component refactor'u** (raporun D maddesi: `ResponsiveDataTable`, `FieldRow/FieldList`, `PillBadge`, `ChartTableView`, `format.ts`, `copy/labels.ts`). Bu, ChartViews/Blocks içindeki masaüstü-tablo + mobil-kart desenlerini tek merkezi API'ye taşımayı gerektirir; çok sayıda component'i yeniden bağlar ve **canlı yatırımcı deck'inde görsel regresyon riski** taşır. Raporun kendisi de bunu "yatırımcı metni kadar acil değil, ayrı refactor turu gerekir" diye işaretliyor. Bu yüzden ayrı, kendi görsel-regresyon testi olan bir tur olarak bırakıldı — "çelişki kalmasın" ilkesiyle, içeriği bozma riskini bu deploy'a bağlamadım. Geri kalan her şey (içerik, tek-kaynak, doğrulama, deploy) tamamlandı.

**Hatırlatma:** TKGM/EİDS bölümündeki süre/tarife/tavan ifadeleri verdiğin kaynaklara dayanıyor ve "model varsayımı / doğrulanmış kaynak" etiketli; yatırımcıya sunmadan önce güncel mevzuatla bir hukukçu teyidi yerinde olur (mevzuat değişebilir).
