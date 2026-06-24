# arsam.net / ParselQ — Proje Özeti & Handover

> Bu belge, projenin nasıl çalıştığını, veriyi nasıl işlediğini, nasıl yayınlandığını ve **yeni bir oturuma başlarken bana ne sunman gerektiğini** anlatır.
> Son güncelleme: 2026-06-24 · Sürüm: v3.1

---

## 1. Proje nedir, nerede çalışır?

**Ne:** arsam.net için yatırımcı-sunum web uygulaması (tek sayfa, 18 bölüm). Ürün markası **ParselQ** (mobil uygulama, mottosu "invest yap"). Türkiye'de dikey **arsa/arazi** pazaryeri.

**Nerede çalışır (üretim):** GitHub Pages'te statik site olarak.
- Canlı adres: `https://karacaismail.github.io/finalarsa/`
- Repo: `https://github.com/karacaismail/finalarsa` (private)
- Yerel repo yolu: `/Users/karaca/Documents/sonbirarsa/`

**Teknoloji yığını (landing/package.json):** Vite 8 + React 19 + TypeScript 6 + Chakra UI 3.36 + Emotion + Apache ECharts 6 + @fontsource/roboto. Sunucu/DB yoktur; veri build sırasında JSON'dan paketlenir.

**Yerel geliştirme (macOS):**

```
cd landing
npm install        # ilk kurulum
npm run dev        # geliştirme sunucusu (localhost)
npm run build      # tsc -b && vite build  → landing/dist
npm run preview    # üretim derlemesini yerelde test et
```

---

## 2. İki katmanlı mimari (en kritik kavram)

Sistem iki katmandan oluşur ve **veri tek kaynaktan gelir**:

1. **Veri katmanı — `database/` (TEK DOĞRU KAYNAK):** Tüm içerik ve sayılar burada JSON olarak durur. İçeriği burada değiştiririz.
2. **Sunum katmanı — `landing/src/`:** React bileşenleri veriyi okur ve ekrana basar. Burada *mantık/görsel* vardır, *içerik/sayı* yoktur.

**Veri nasıl okunuyor?** `landing/src/data/db.ts` içindeki Vite `import.meta.glob` çağrısı `database/**/*.json` dosyalarının tamamını derlemeye gömer. `landing/src/data/resolve.ts` ise üç giriş kapısı sunar:

- `getData("<dosya>")` → `database/data/<dosya>.json` içeriğini verir (örn. `getData("financial-model")`).
- `getMetric("<anahtar>")` → `database/shared/metrics.json` içindeki tek bir metriği verir.
- `sections` → `database/sections/` altındaki 18 bölümü `order` alanına göre sıralı verir.

**Metin içi sayı yerleştirme:** Bölüm metinlerinde `{{metric:market.target_share_2032}}` gibi token'lar otomatik olarak metrics.json'daki `display` değeriyle değişir. **Sayıyı metne elle yazmayız**, metriğe referans veririz. Bu, "tek kaynak" ilkesini korur.

**Akış:** `App.tsx` → her bölüm için `SectionView` → her blok için `Blocks.tsx` (blok tipine göre render) → grafik bloklarında `ChartViews.tsx` + `charts.ts` + `EChart.tsx`.

---

## 3. Hangi dosyaları "data" olarak işliyoruz?

### `database/sections/` — 18 bölüm (içerik)
`01-karar-notu.json` … `18-ilk-30-gun.json`. Her dosyada `order`, `nav` (num + label), `title` ve bir `blocks` dizisi vardır. Bloklar tip bazlıdır: `heading`, `lead`, `statGrid`, `statEquation`, `cardGrid`, `table`, `timeline`, `chart`, `chartTabs`, `columns`, `marketScale`, `strategyArsenal`, `note` vb.

### `database/data/` — analiz verileri (sayılar)
- `financial-model.json` — yıllık tablo (2026 H2 → 2032: gelir/gider/net/kadro/nakit) + parametreler (kadro eğrisi, fiyatlar).
- `financial-breakdown.json` — **7 gelir akışı** (revenueStreams, ParselQ-RFQ amiral), senaryo çarpanları, CAPEX/OPEX, başabaş.
- `financial-detail.json` — aylık seriler (2026 aylık kadro, ilk 36 ay, kademeli tablo).
- `market-tam-sam-som.json` — TAM/SAM/SOM hunisi, %38 hedef pay, senaryo gelirleri (2,69 / 5,97 / 9,85 milyar).
- `hr-plan.json` — kadro eğrisi (30→256), 2031 departman dağılımı, AI verimliliği.
- `strategy-md.json`, `strategy-arsenal.json`, `strategy-frameworks.json` — strateji içerikleri (15 silah + 470 model).
- `dividers.json` — bölüm geçişi özlü sözleri. `incentives.json` — teşvikler.

### `database/shared/` — paylaşılan kaynaklar
- `metrics.json` — **~90 metriğin tek kaynağı** (her biri `value` + `display` + `label`). Tüm bölümler ve grafikler buradan beslenir.
- `sources.json` (kaynak atıfları), `glossary.json` (terim sözlüğü), `brand.json`, `design-tokens.json` (legacy).

### `database/_build/` — test/doğrulama
- `validate.py` — **tutarlılık test-kapısı** (aşağıda). `build.py` / `build2.py` — eski üreticiler; `ALLOW_LEGACY_BUILD=1` olmadan çalışmaz (çalışırsa elle yapılan göçü geri alır — **çalıştırma**).

### `raporlar/` — okunabilir çıktılar (md + xlsx)
`RAPOR-01…05.md` (pazar/ParselQ/GTM/İK/finansal) ve `arsam-yillik-hedef-pay-modeli.xlsx` (formüllü hedef-pay modeli).

> Not: `_parselq_research/`, `_mobile_kit/`, `dist/`, `node_modules/` gibi klasörler `.gitignore`'dadır (depoya girmez).

---

## 4. Nasıl deploy ediliyor?

Tamamen **CI/CD** ile, otomatik:

1. **Kullanıcı/Ajan** `main` dalına push eder.
2. **GitHub Actions** (`.github/workflows/deploy.yml`) tetiklenir: `npm ci` → `npm run build` (tsc + vite) → `landing/dist` üretir.
3. **GitHub Pages** bu `dist` çıktısını yayınlar. ~60-90 sn içinde canlı olur.

Önemli ayrıntılar:
- `dist/` **gitignore'dadır** — derlemeyi CI yapar, biz commit etmeyiz.
- `landing/vite.config.ts` içinde `base: "/finalarsa/"` (build modunda) → canlı URL `…github.io/finalarsa/`.
- Sürümler `v1.0 … v3.1` etiketleriyle işaretlenir.
- **Deploy öncesi sıra (test-first):** `validate.py` GEÇTİ → `npm run build` temiz → scoped `git add` → commit → push → CI → canlı doğrula → `vX.Y` tag.

---

## 5. Token nedir?

Token, **GitHub Personal Access Token (PAT)** — özel repoya `git push` yaparken kimlik doğrulamak için kullanılır (`ghp_…` ile başlar).

- **Nerede kullanılıyor:** Yalnızca push anında, komut satırında satır içi: `git push https://<TOKEN>@github.com/karacaismail/finalarsa.git HEAD:main`.
- **Nerede DEĞİL:** Repo'da veya git remote URL'inde **saklanmaz** (remote temiz: `https://github.com/karacaismail/finalarsa.git`). Çıktılarda maskelenir.
- **Kim sağlar:** Sen. Her oturumda bana verirsin; istediğinde iptal eder/yenilersin. Push gerekmiyorsa token gerekmez.

---

## 6. Tutarlılık test-kapısı: `validate.py`

Çalıştırma:

```
cd database/_build && python3 validate.py
```

Ne kontrol eder (özet): tüm JSON parse olur mu; bölümlerdeki metrik/kaynak referansları gerçekten var mı; **matematik tutarlılığı** (SAM/TAM ≈ %18,7; SOM/SAM = %38; 7 gelir akışı toplamı = medyan 5,97 milyar; senaryo çarpanları); **kadro** (eğri 38→256 monoton, departman toplamı = 256); **çapraz eşitlik** (başlık metrikleri ↔ veri hücreleri birebir). Sonuç `GEÇTİ ✓` veya `BAŞARISIZ ✗`. **Kural: 0 hata olmadan deploy yok.**

---

## 7. Kanonik sayılar (değişmezler — çelişki yaratma)

- **Kadro:** 2026=38 → 2027=92 → 2028=140 → 2029=185 → 2030=225 → **2031=256** (2032 sabit 256). [agresif/sola-kaydır]
- **Hedef pay:** 2032'de online arsanın **%38'i**. SOM = SAM(392 milyar) × %38 = **149 milyar ₺**. [v3.1: %35→%38]
- **2032 gelir:** kötümser 2,69 / **medyan 5,97** / iyimser 9,85 milyar ₺ (çarpanlar ×0,45 / ×1,0 / ×1,65; pay %35→%38 ile ×38/35 ölçeklendi).
- **7 gelir akışı (2032 medyan):** RFQ 1,79 (amiral) · İlan 1,19 · Veri 0,96 · Emlakçı 0,84 · Reklam 0,48 · SaaS 0,42 · Hizmet 0,30 milyar.
- **Zaman çizgisi:** Şirket/yazılım **2026 Ağustos** başlar (5 çekirdek) → GTM → 2026 H2 soft-launch ile pay almaya başlanır. 2024/2025 yalnızca pazar baz verisidir, bizim payımız yoktur.
- **Başabaş:** operasyonel başabaş ~2027 başı (Ocak 2027); sermaye 40 milyon ₺; kasa dibi ~33,4 milyon ₺; başabaşa kadar kümülatif gider ~23,4 milyon ₺.
- **GTM:** Ege yıldız ilçeleri (Bodrum/Çeşme/Urla/Didim/Kuşadası); araçlı saha keşif + saha satış ekipleri.

---

## 8. Stack tercihleri ve yasaklar (geliştirme önerileri için)

- **Yasak:** Next.js, Supabase.
- **Tercih:** Vite + React + TanStack Router/Query; PostgreSQL + Prisma; TypeScript + SCSS; tablolarda Flowbite + Roboto.
- **Ortam:** Geliştirme macOS (M4); üretim Hetzner / Debian / AMD EPYC; deploy kaynağı GitHub private repo.
- **Güvenlik ilkesi:** AI ana dala insan onayı olmadan doğrudan push etmemeli; öneri/PR → insan inceler → merge.

---

## 9. ⭐ Yeni oturuma başlarken bana ne sunmalısın?

Hızlı ve hatasız devam edebilmem için, yeni oturumda şunları ver:

1. **Klasör erişimi:** `/Users/karaca/Documents/sonbirarsa/` (zaten seçili klasörse yeterli). "Bu proje üzerinde çalışacağız" de.
2. **Bu belge:** "Önce `PROJE-OZETI.md` dosyasını oku" demen, beni saniyeler içinde bağlama sokar.
3. **Push gerekecekse token:** GitHub PAT'i (`ghp_…`). Sadece push için; vermezsen yerelde çalışır, deploy etmem.
4. **Ne istediğin (net hedef):** hangi bölüm(ler), hangi sayı(lar), hangi davranış. Örnek/montaj/ekran görüntüsü çok yardımcı olur.
5. **Kanonik değişti mi?** Kadro/pay/gelir/zaman çizgisi gibi bir çıpayı değiştiriyorsan açıkça söyle (yoksa §7'yi değişmez kabul ederim).
6. **Beklenen çıktı türü:** sadece site mi, yoksa rapor/Excel de mi; deploy edilsin mi, tag atılsın mı.

Bunlarla birlikte tipik akışım: **veri katmanını güncelle → `validate.py` (0 hata) → `npm run build` → scoped commit → token'la push → CI → canlıyı tarayıcıda doğrula → tag**.
