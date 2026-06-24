# RAPOR-10 · v3.1 Değişiklik ve Deploy Özeti

Tarih: 2026-06-24 · Sürüm: **v3.1** · Commit: `c16a865` · Tag: `v3.1`
Canlı: https://karacaismail.github.io/finalarsa/ (yeni derleme yayında, doğrulandı)

Bu rapor; senin iki net isteğini (hedef pay %38, sunum genişliği), uyguladığım tekrar/sadeleştirme raporunu (P0), ve repo+GitHub Pages güncellemesini anlatır. Sonunda **kalan işler** listelenir.

---

## 1. Yönetici özeti

Üç şey yapıldı ve canlıya alındı. Birincisi, hedef pazar payı %35'ten %38'e çıkarıldı ve senin kararınla gelir de paya orantılı büyütüldü. İkincisi, sunum (presentation) modunun dar kalan genişliği düzeltildi. Üçüncüsü, tekrar/sadeleştirme raporunun P0 (en kritik) maddeleri uygulandı. Tüm değişiklikler test kapısından geçti (validate.py: 0 hata; TypeScript + Vite derlemesi temiz) ve `main` dalına push edilip GitHub Actions ile otomatik yayınlandı.

Önemli karar: **%38 değişikliği "kör" yapılmadı.** Önce çelişki ve etki alanı haritalandı, sonra deterministik bir betikle (script) ölçeklendi ve her adım validate.py ile doğrulandı. Bu, pitch'in çekirdek sayılarının birbirinden kopmasını engelledi.

---

## 2. Hedef pay %35 → %38 (kanonik değişiklik)

### Ne değişti, neden
Senin seçimin "pay + SOM + gelir birlikte" olduğu için, ölçek faktörü **k = 38/35 = 1,0857** tüm birincil gelir kalemlerine uygulandı. Gider/kadro/sermaye **değişmedi** (bunlar paya değil, kadroya bağlı); bu yüzden net kâr ve nakit yeniden hesaplandı.

| Kalem | Eski (%35) | Yeni (%38) |
|---|---|---|
| Hedef pay | %35 | **%38** |
| SOM (SAM 392 × pay) | 137,2 milyar ₺ | **149 milyar ₺** |
| Gelir — medyan 2032 | 5,5 milyar ₺ | **5,97 milyar ₺** |
| Gelir — kötümser | 2,48 milyar ₺ | **2,69 milyar ₺** |
| Gelir — iyimser | 9,07 milyar ₺ | **9,85 milyar ₺** |
| Kasa dibi (en düşük nakit) | ~32,5 milyon ₺ | **~33,4 milyon ₺** |
| 2032 yıl sonu nakit | ~15,08 milyar ₺ | **~16,53 milyar ₺** |
| Net marj 2027 → 2032 | %72 → %90 | **%74 → %91** |

Gider sabit kaldığı için gelir artınca marj bir miktar yükseldi; bu beklenen ve tutarlı bir sonuçtur.

### Sistem ne yaptı (dosya bazında)
Betik şu dosyaları senkron ölçekledi ve net/nakit zincirini yeniden kurdu: `market-tam-sam-som.json`, `financial-model.json`, `financial-breakdown.json` (7 gelir akışı + aylık seriler + başabaş serisi), `financial-detail.json` (aylık/kademeli), `shared/metrics.json`. Bölüm metinlerindeki eski sayılar ya `{{metric:...}}` token'ına bağlandı ya da yeni değere güncellendi (06-pazar, 08-gelir, 13-başabaş). Teknopark vergi tabanı (`tax.scenarios`) bilinçli olarak **ölçeklenmedi**: o taban yazılım kazancıdır, pazar payı hedefinden bağımsızdır (dosyaya not düşüldü).

### Güvenli/riskli ayrımı
Güvenli olan: stat değerlerinin `valueRef` ile metrics'ten gelmesi — bu yüzden grafikler ve kartlar otomatik güncellendi. Riskli olabilecek nokta: bölüm metinlerine elle gömülü sayılar. Bunlar tarandı; comma-formatlı eski sayılar (5,5 / 2,48 / 9,07 / 137,2) temizlendi. Validator artık `market.som_try`, `target_share_2032` ve gelir akışı toplamlarının birbirine eşit olduğunu **otomatik** kontrol ediyor; ileride biri kayarsa deploy durur.

---

## 3. Sunum modu genişliği (1024 → ~1200)

Kök neden: `landing/src/presentation/SlideView.tsx` içinde `maxW="1100px"` elle sabitlenmişti; iç boşluk (padding) düşünce görünür içerik ~1004 piksele iniyordu — senin gördüğün "~1024" buydu. Düzeltme: tek-kaynak sabiti olan `theme/layout.ts → OUTER_MAX` (1264px) kullanıldı; görünür içerik artık ~1200 bandında. Bu aynı zamanda "sihirli sayı"yı kaldırıp genişliği tek kaynağa bağladı (ana sayfa ve accordion ile aynı kaynak).

---

## 4. Tekrar/sadeleştirme raporu — uygulanan P0 maddeleri

Bu işin büyük kısmı **paralel ajanlarla** ayrık dosya kümelerinde yürütüldü (aynı repoyu eşzamanlı düzenleyen ajanlar çakışır; bu yüzden 50 eşzamanlı yerine ayrık-dosyalı dalgalar tercih edildi — kurumsal güvenli yaklaşım). Her dalga sonrası merkezî validate.py ile doğrulandı.

- **Accordion render hatası (P0 #1):** `03a-emlak-dijital-sube` hiçbir grupta değildi, render edilmiyordu. "Neden Bu İşbirliği?" grubuna eklendi. Validator artık 28 bölüm ↔ 28 slug birebir.
- **03 / 03a birebir tekrar (P0 #1):** "dijital şube" bloğu iki bölümde aynıydı. 03a tek sahibi oldu; 03 tek cümlelik köprüye indirildi ve "neden doğru ortak" sorusuna odaklandı.
- **İlk 90 gün KPI kanonu (P0 #5):** `first-90-days.json` tek kanon yapıldı (tutarlı huni). 09a'daki çelişen statGrid kaldırıldı (zaten dataRef ile first-90-days'i render ediyor). 09-gtm sadece saha ritmine odaklanıp 09a'ya kısa referans verdi.
- **Statik tablo → dataRef (P0 #2):** 14-risk, 16a, 16b, 16c, 17 bölümlerindeki statik tablo/kart tekrarları kaldırıldı; ilgili data dosyaları + React componentlerine bağlandı (RiskGateMatrix, CapitalReleasePlan, GovernanceMatrix, InvestorReturnModel, InvestmentOptionsCompare). Componentler zaten bağlıymış; sadece tekrar kaldırıldı.
- **Finans terim ayrımı (P0 #4):** "operasyonel başabaş ayı", "başabaşa kadar kümülatif gider (~23,4M)", "kasa dibi (~33,4M)" ve "yatırım geri dönüş süresi" 13-başabaş'ta artık ayrı ayrı, karışmadan anlatılıyor. `financial-frames.json` sayısal kanon olmaktan çıkarıldı; yalnız "karar lensi" taşıyor.
- **investor-dashboard düz string → valueRef (P0 #6):** 8 KPI metrics'e bağlandı (137,2→149 milyar, %35→%38, 5,5→5,97 milyar dahil). KpiBoard zaten valueRef destekliyormuş.
- **08 gelir katalogu → appendix:** Uzun lisanslı/gelecek gelir kalemleri "Ek: gelir kalemleri kataloğu (ileri detay)" başlığı altına ayrıldı; ana akış paket + üç aile + yedi akış olarak kaldı.
- **15-teknopark kesinlik dili:** "kesindir / yasal-kesin / kesin doğar" ifadeleri "şartlar sağlanırsa oluşur / mevzuata bağlıdır / model varsayımıdır" diline çevrildi. (16c'deki "garanti getiri değildir" bilinçli bırakıldı — bu doğru risk ifadesidir.)
- **title == ilk heading:** Mimari incelendi — `SectionView` bölüm başlığını (title.text) görünür basmıyor; title yalnız menü/accordion/SEO içindir, görünür başlık H2 bloğudur. Yani **görünür tekrar yok**; 27 bölümü yeniden yazmaya gerek kalmadı.

---

## 5. Validator + manifest (tek kaynak disiplini)

`database/_build/validate.py` üç yeni kontrolle güçlendirildi: (1) **manifest envanter drift** — manifest'teki bölüm/data sayısı ve sıra, gerçek dosyalarla birebir mi; (2) **dataRef bütünlüğü** — her bloktaki dataRef gerçek bir data/shared dosyasına işaret ediyor mu; (3) **data dosyası valueRef bütünlüğü** — investor-dashboard/accordion valueRef'leri metrics'te var mı. `%35` gate'leri `%38`'e güncellendi.

`manifest.json` artık **generated**: gerçek dosyalardan (28 bölüm, 22 data, 99 metrik) üretildi ve başlık/refs gibi alanları tekrar etmiyor (tek kaynak section dosyalarında). Böylece elle-yönetilen indeks drift'i ortadan kalktı.

Son durum: **validate.py → 32 başarı, 26 uyarı, 0 HATA, GEÇTİ ✓.**

---

## 6. Test ve deploy doğrulaması

Sıra (test-first): validate.py (0 hata) → `tsc -b` (temiz) → `vite build` (temiz, 2613 modül) → scoped commit → `main`'e push → GitHub Actions (npm ci + build + Pages) → canlı doğrulama → `v3.1` tag.

- Commit `c16a865` `main`'e push edildi (temiz fast-forward `3409ab3..c16a865`); 33 dosya.
- Canlı doğrulama: yeni içerik-hash'li paket `index-LONIY648.js` canlıda **HTTP 200** döndü — yeni %38 derlemesi yayında.
- `v3.1` etiketi oluşturuldu ve push edildi (önceki: v3.0).

Not: GitHub token yalnızca push anında kullanıldı, çıktıda maskelendi, kalıcı saklanmadı.

---

## 7. Kalan işler (bu oturumda KAPSAM DIŞI bırakılanlar)

Senin seçtiğin kapsam "P0 + kritik + deploy" idi. Aşağıdakiler bilinçli olarak ertelendi:

**P1 içerik sadeleştirmeleri (raporun B/P1 maddeleri):** 01/02/18 karar kutusu dağınıklığı, "güven dosyası" kümesinin her bölümde farklı işlev üstlenmesi, 07 RFQ uzun anlatısının köprüye indirilmesi, 11 "AI patron değil kalfa" metaforunun tek kez kullanımı, 12 "256 kişi" tekrarının tek paragrafa indirilmesi, 16-cpo yan hak tekrarları. Bunlar yatırımcıyı yormayı azaltır ama render'ı bozmaz.

**React/component refactor (raporun D maddesi):** `ResponsiveDataTable`, `FieldRow/FieldList`, `PillBadge`, `ChartTableView`, `format.ts`, `copy/labels.ts` merkezî yapıları. Şu an her component tablo/kart/rozet desenini elle kuruyor; bu bakım maliyeti ve mobil/erişilebilirlik için ayrı bir refactor turu ister. Acil değil.

**`raporlar/arsam-yillik-hedef-pay-modeli.xlsx`:** Bu Excel hâlâ %35 modelini taşıyor (formüllü). Deck'i etkilemez ama istersen %38'e güncellenmeli.

**`fin.breakeven_months = "18 ay"` metriği:** Operasyonel başabaş ~6 ay iken bu metrik 18 ay diyor. 13-başabaş metni artık dört kavramı ayırarak bu karışıklığı gideriyor; ama metriğin kendisi ileride ya doğru etiketlenmeli ya kaldırılmalı.

**Güvenlik önerisi:** GitHub token (`ghp_...`) bu sohbette düz metin paylaşıldı. Push tamamlandı; **token'ı iptal edip yenilemeni öneririm** (GitHub → Settings → Developer settings → Personal access tokens). Sonraki oturumda yeni token verirsin.

**Kalan uyarılar (26 adet, bloklamaz):** Çoğu "satır içi kanonik sayı" uyarısı (ör. 12-ik'te "256 kişi", 15'te teşvik tavanları) ve "ref edilmemiş metrik" bilgisidir. Bunlar P1 sadeleştirmede ele alınabilir; deploy'u engellemez.
