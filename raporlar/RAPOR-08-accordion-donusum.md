# RAPOR-08 · Accordion tabanlı sunum dönüşümü

**Tarih:** 2026-06-23 · **Commit:** `2ef6ba1` (accordion temeli: `c5a8010`) · **Canlı:** https://karacaismail.github.io/finalarsa/

Bu rapor, tek sayfalık yatırımcı sunumunun 8 ana accordion grubuna dönüştürülmesini, en üste sabit bir Karar Kutusu eklenmesini ve 60+ yaş klasik emlakçı yatırımcı için görünür dilin sadeleştirilmesini özetler.

---

## 1. Ne yapıldı (özet)

Sayfa başka rotalara bölünmedi; **tek sayfa kaldı**. Uzun bölüm akışı (27 bölüm) 8 ana accordion grubu altında toplandı. En üste, accordion dışında sabit bir **Karar Kutusu** eklendi. Görünür yüzeydeki savaş/cephane/gerilla dili ve ağır teknik jargon, yatırımcının anladığı sade Türkçeye çevrildi.

Mimari ilke korundu: içerik ve sayılar `database/sections` + `database/shared/metrics.json` tek kaynağında kaldı; sunum katmanı (`landing/src`) bu veriyi okuyup accordion olarak gösterir. Bölüm içerikleri tekrar edilmedi.

---

## 2. Accordion grup eşlemesi (8 grup, 27 bölüm)

| # | Grup | Bölümler |
|---|------|----------|
| 01 | Karar Özeti | karar-notu, toplanti-ozeti, ilk-30-gun |
| 02 | Neden Bu Ortaklık? | neden-ortak, emlak-dijital-sube |
| 03 | Problem ve Çözüm | problem, cozum, yetki-sorumluluk |
| 04 | Pazar ve Rekabet | pazar, rekabet, ek-playbook |
| 05 | İş Modeli ve Gelirler | model, alici-rfq, gelir-modelleri |
| 06 | Saha Planı ve İlk 90 Gün | gtm, ilk-90-gun, satici-emlakci-agi |
| 07 | Operasyon ve Kadro | ai-operasyon, ik-plani, cpo |
| 08 | Finansal Plan, Risk ve Yatırım | basabas, paranin-kullanimi, risk, teknopark, yatirim, yatirimci-getiri, ortaklik-yonetim |

27 bölümün tamamı bir gruba atandı; render edilmeyen bölüm yok, tekrar eden bölüm yok.

---

## 3. Karar Kutusu

Accordion'ların üstünde sabit, "Bugün neye karar veriyoruz?" sorusunu yanıtlayan kart. Dört içerik:

- **Başlangıç bütçesi:** 40 milyon ₺ (metrics.json → `capital.total_raised` token'ı ile, tek kaynak)
- **Yatırımcı rolü:** Lider / stratejik ortak — bütçe ve strateji onayı, saha bölgesi seçimi, düzenli rapor hakkı
- **İlk 90 gün saha hedefleri:** Doğrulanmış aktif ilan, satıcı görüşmesi, alıcı talebi, ilk ücretli paket
- **Yönetim ve raporlama sınırı:** CPO günlük operasyon; yatırımcıya haftalık saha raporu, ayda bir karar toplantısı

İçerik veri katmanında tutulur (`database/data/accordion-groups.json` → `decisionBox`).

---

## 4. Mimari ve dosyalar

**Yeni dosyalar:**

- `database/data/accordion-groups.json` — gruplama (hangi bölüm hangi grupta) + grup başlığı/özet cümlesi + karar kutusu metni. Rakamlar token ile metrics.json'dan gelir.
- `landing/src/components/DecisionSummaryBox.tsx` — karar kutusu bileşeni.
- `landing/src/components/AccordionGroup.tsx` — tek accordion grubu.
- `landing/src/components/AccordionPresentation.tsx` — karar kutusu + 8 grubu sıralayan üst bileşen.

**Değiştirilen dosyalar:**

- `landing/src/App.tsx` — düz bölüm listesi yerine `AccordionPresentation`. Tek sayfa korunur; sunum modu (presentation) etkilenmez.
- `landing/src/components/SectionView.tsx` — `as` prop'u eklendi (`"section" | "div"`). Accordion içinde `div` kullanılır; iç içe `<section>` (geçersiz HTML) önlenir. Bölüm içeriği aynı `SectionView` + `BlockView` ile yeniden kullanılır.

**Accordion teknolojisi:** Chakra v3 Accordion yerine **native `<details>/<summary>`** + Chakra token styling tercih edildi. Gerekçe: `ui.tsx`'te belgelenen Chakra v3 recipe + React 19.2 "children" uyumsuzluğu riski; native çözüm 0 JS bağımlılığı, deterministik davranış, tarayıcı-native erişilebilirlik (button rolü + `aria-expanded`) ve klavye desteği (Enter/Space) sağlar. Açı ikonu özel SVG (chevron); açık grupta 90° döner.

---

## 5. Görünür dil/ton temizliği

Önemli bulgu: `StrategyArsenal` bileşeni 470 modelin yalnızca `name` + `desc`'ini gösterir; "silah/cephane/FOMO" etiketleri veri katmanında kalır, ekranda görünmez — bu yüzden temizlik görünür yüzeye odaklandı.

| Dosya | Eski | Yeni |
|-------|------|------|
| 06-pazar | "strateji cephanesidir" | "büyüme ve savunma planıdır" |
| 06-pazar | "Counter-Positioning karşı saldırıyı imkânsız kılar" | "rakibin kolay kopyalayamayacağı konumlanma karşılığı zorlaştırır" |
| 06-pazar | "Mem savaşı" | "organik görünürlük ve yerel hikâye" |
| 98-ek-playbook | "gerilla pazarlama / asimetrik playbook" | "büyük rakibe karşı dar bölgeden başlayan büyüme planı" |
| 14-risk | "Counter-Positioning" | "Rakibin kolay kopyalayamayacağı konumlanma" |
| 16c-getiri | "valuation etkisi" | "şirket değerlemesi etkisi" |
| strategy-md (top15) | "Memetic Warfare", "Counter-Positioning" vb. | "Organik Görünürlük ve Yerel Hikâye", "Rakibin Kopyalayamayacağı Konumlanma" |
| 05-cozum | "talep (RFQ)" | "alıcı talebiyle teklif alma modeli (RFQ)" |

TAM/SAM/SOM anlatımı "harita → bölge → parsel → hasat" metaforuyla doğrulandı. marketScale sekme etiketleri ("Pazar büyüklüğü" / "Hesap oranları") zaten güncel. Kanonik sayılar (40 milyon ₺, %35, 256, 5,5 milyar ₺ vb.) ve `{{metric:...}}` token'larına dokunulmadı.

---

## 6. Test sonuçları (test-first, mobile-first)

| Kontrol | Sonuç |
|---------|-------|
| validate.py (tutarlılık kapısı) | GEÇTİ ✓ (0 hata) |
| tsc tip kontrolü | EXIT 0 (temiz) |
| vite build | EXIT 0 (temiz) |
| Accordion grubu sayısı | 8 ✓ |
| Render edilen bölüm | 27 / 27 ✓ (eksik yok) |
| Karar kutusu | Mevcut ✓ |
| 320px yatay taşma (8 grup açıkken) | 0 px ✓ (sıfır taşan eleman) |
| Erişilebilirlik | Native `<summary>` (button + aria-expanded), klavyeyle açılır ✓ |

---

## 7. Deploy

`/tmp` taze klon yöntemiyle (mount `.git` yazma kısıtı nedeniyle) yalnızca 12 dosya (4 yeni + 8 değişen) `main`'e push edildi: `d1de9b5 → c5a8010`. Uzaktaki önceki işler ezilmedi. GitHub Actions CI yeniden derleyip GitHub Pages'te yayınladı; canlı doğrulama yapıldı.

---

## 8. Güncelleme — tek-açık accordion + ek dil temizliği (commit `2ef6ba1`)

**Tek-açık (akordeon) davranış:** Başlangıçta her grup bağımsız açılıp kapanabiliyordu (çoklu açık). İstek üzerine exclusive davranışa geçildi: `AccordionPresentation` tek bir `openId` state'i tutar, `AccordionGroup` controlled hale getirildi (`isOpen` / `onOpen` / `onClose`). Bir grup açılınca açık olan diğeri otomatik kapanır; açık gruba tekrar tıklanınca tümü kapanır. Native `<details>/<summary>` korundu (erişilebilirlik bozulmadı). Canlıda görsel doğrulandı: Grup 3 açıkken Grup 2 açılınca Grup 3 kapandı.

**Ek dil temizliği (ilk turda atlanan kurallar):**

| Dosya | Eski | Yeni |
|-------|------|------|
| 11-ai-operasyon, 12-ik-plani | "AI-first" | "yapay zeka destekli" |
| 08-gelir-modelleri, 09b | "lead" (emlakçı lead ağı, lead paketi, lead satışı, premium lead vb.) | "talep" / "nitelikli müşteri" / "talep yönlendirme" |

Tek başına "AI" kısaltması (AI operasyon, AI ile) ve "ParselQ-RFQ" marka adı korundu. validate GEÇTİ, tsc + vite build temiz, 6 dosya `c5a8010 → 2ef6ba1` push edildi.

**Henüz yapılmayan (kapsam dışı bırakıldı, istenirse ayrı tur):** Metafor bankasının (kalfa/usta, şantiye hakedişi, zemin etüdü, arsa ofisi dijital şubesi vb.) bölüm metinlerine sistematik entegrasyonu. Bu turda yalnız yasaklı ton ve jargon temizlendi; metafor zenginleştirmesi büyük bir içerik çalışması olarak ayrıldı.
