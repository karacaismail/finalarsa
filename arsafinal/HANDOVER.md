# arsafinal — Devir Notu (HANDOVER)

Bu dosya, projeyi başka bir geliştiriciye veya AI ajanına devrederken bilinmesi gereken kritik bilgileri özetler.
Son güncelleme: 2026-06-26 · Canlı şema: `5.9.0` · Canlı JS hash: `index-Ck_7fGbt.js`

---

## 1. Proje nedir?

**arsam.net "Aylık Gider Planı"** — tek sayfa, accordion tabanlı bir finansal gider planlama aracı.

- **Ne işe yarar:** "Her ay ne harcayacağız?" sorusunu yanıtlar. Her ayı küme bazında (personel, ofis & kira, sürekli giderler, pazarlama, yazılım/SaaS, profesyonel, saha) kırar; ayrıca Temmuz (yazılım geliştirme avansı) ve Ağustos (kuruluş CAPEX'i) ayrı kalemlerdir.
- **Ne yapar:** Personel maaşlarını 256 rol + 2026 Türk bordro motorundan TARAYICIDA hesaplar. Para birimi (TRY/USD/EUR) çevirir. Varsayımları (kur, SGK oranı, yemek/yol, kira vb.) kullanıcı düzenleyebilir; JSON içe/dışa aktarılır.
- **Ne yapmaz:** Sunucusu/veritabanı YOK. Hiçbir API'ye bağlanmaz. Veri statiktir; sadece tarayıcının `localStorage`'ında saklanır.

**Stack:** Vite + React 18 + TypeScript + ECharts (grafik) + Vitest (test). Saf statik SPA, GitHub Pages'te yayınlanır.

---

## 2. Nerede ne var? (aktörler)

| Yer | Ne | Rol |
|---|---|---|
| Yerel klasör | `/Users/karaca/Documents/sonbirarsa/arsafinal/` | Kaynak kodun düzenlendiği yer (geliştirici/AI burada çalışır) |
| GitHub repo (private) | `karacaismail/finalarsa` | Uygulama `arsafinal/` alt-klasöründedir; CI burayı build edip yayınlar |
| Canlı site | `https://karacaismail.github.io/finalarsa/finansal/` | GitHub Pages; Vite `base = "/finansal/"` |
| Localhost | kalıcı sunucu YOK | Yerelde önizleme için `npm install && npm run dev` → `localhost:5173` |

> Not: Yerel klasör doğrudan bir git klonu değildir. Deploy, repoyu ayrı klonlayıp değişen dosyaları kopyalayarak yapılır (bkz. Bölüm 5).

---

## 3. Kritik dosyalar ve sorumlulukları

- `src/data/roles.ts` — **256 rol** (statik): `kod`, `brutMaas`, `istihdamYm` (işbaşı ayı). Kurucu kadro = sıra 1–12, hepsi `istihdamYm: "2026-08"`.
- `src/data/finansal.ts` — `DEFAULT_DATA` (tek kaynak) + **`SCHEMA_VERSION`** (şu an `5.9.0`). İçinde: `params` (kur/SGK/yemek/yol/yazılım USD), `founder` (kurucu net-hedef adımları), `arac` (CPO araç segment takvimi), `ikramiye` (bayram/yıl-sonu primleri), `capex`, `olgun`, `pazarlama`.
- `src/lib/payroll.ts` — **2026 bordro motoru**: kümülatif gelir vergisi dilimleri, SGK tavanı, damga; kurucu için NET-hedefi ikili aramayla brüte çözer (`brutCozHedefNet`). Saf fonksiyonlar.
- `src/lib/clusters.ts` — **`hesapla(d)`**: ayları üretir. **SAF ARREARS** model (bkz. Bölüm 4). Personel kümesi türetilir; diğer kümeler `olgun` değerlerinden headcount ile ölçeklenir.
- `src/lib/store.ts` — `localStorage` kalıcılık (anahtar `arsafinal:v5`) + **şema kapısı**: kayıtlı verinin `schemaVersion`'ı koddaki `SCHEMA_VERSION` ile uyuşmazsa atılır, `DEFAULT_DATA` yüklenir.
- `src/App.tsx` — accordion UI, zaman filtreleri (`DONEMLER`), üst kartlar, ECharts grafiği.
- `src/styles.css` — mobile-first; `.main { max-width: 720px }`.
- `src/lib/finansal.test.ts` + `src/lib/payroll.test.ts` — **Vitest** (24 test).

---

## 4. Maaş/bordro modeli — SAF ARREARS (önemli!)

Gösterilen her ay **M**, bir önceki ay **eym = M − 1** işgücünün giderini yansıtır; maaş o ayın **5'inde** ödenir.

- Kurucular **Ağustos 2026'da** işbaşı yapar (`istihdamYm = "2026-08"`).
- **Eylül 2026** satırı = Ağustos işgücünün maaşı (5 Eylül'de ödenir) → ilk maaş Eylül'de görünür.
- **Aralık** işgücünün maaşı 5 Ocak'ta ödenir → **Ocak 2027** satırında çıkar, "2026 sonu (Eyl–Ara)" görünümüne GİRMEZ.
- **İkramiye** ödendiği aya (ym) göre kaydedilir (yıl-sonu primi Aralık'ta kalır).
- **Ağustos** operasyonel ay DEĞİL; ayrı CAPEX item'ıdır. **Temmuz** = yazılım geliştirme avansı (2 eşit taksit: 5 Temmuz + 5 Ağustos).

Accordion numaralandırma: Tem=1, Ağu=2, Eyl=3, … (operasyonel aylar `no = i + 3`).

---

## 5. Güncelleme iş akışı (adım adım)

1. **Geliştirici/AI:** yereldeki `src/` dosyalarını düzenler.
2. `DEFAULT_DATA` (roles/params/olgun vb.) değiştiyse → **`SCHEMA_VERSION`'ı yükselt** (`finansal.ts`). Yapılmazsa eski `localStorage` eski veriyi gösterir; değişiklik canlıda görünmez. (En sık hata budur.)
3. **Test:** `npx vitest run` → tüm testler yeşil olmalı.
4. **Deploy** (CI'a göndermek): aşağıdaki komut şablonu.
5. **CI (GitHub Actions):** push'ta testleri çalıştırır; geçerse Pages'e yayınlar. Test kırmızıysa deploy DURUR.
6. **Doğrulama:** ~3–5 dk sonra canlı JS hash'i (`index-XXXX.js`) build çıktısındaki hash ile eşleşince ve sayfada değişiklik göründüğünde tamamdır.

### Deploy komut şablonu

```bash
# TOKEN = private repoya yazma izinli GitHub PAT (ayrı verilir — bu dosyaya YAZMA)
cd /tmp && rm -rf deploy_tmp
git clone --depth 1 https://TOKEN@github.com/karacaismail/finalarsa.git deploy_tmp
# değişen dosyaları yerelden repo kopyasına aktar:
cp /Users/karaca/Documents/sonbirarsa/arsafinal/src/<...> /tmp/deploy_tmp/arsafinal/src/<...>
cd /tmp/deploy_tmp/arsafinal
npm ci && npm run test && npm run build      # test kırmızıysa DURDUR
cd /tmp/deploy_tmp
git add -A && git commit -m "<açıklama>" && git push origin main
```

---

## 6. GitHub token ile iş akışı

- **Token:** klasik Personal Access Token (PAT), `karacaismail/finalarsa` private reposuna **yazma** izniyle.
- Sadece git'i yetkilendirir (clone/push URL'inde `https://TOKEN@github.com/...`). Asıl build + Pages deploy'unu CI yapar.
- **Güvenlik:** Token'ı ASLA repoya/koda yazma. İş bitince iptal et (GitHub → Settings → Developer settings → Personal access tokens), yeni ajana yenisini ver.

---

## 7. Yeni AI ajanına mutlaka söylenecekler (özet)

- **Şema kuralı:** `DEFAULT_DATA` değişince `SCHEMA_VERSION` yükselt; yoksa değişiklik canlıda görünmez.
- **Test kapısı:** push'tan önce `vitest run` yeşil olmalı; CI kırmızıda deploy etmez.
- **Maaş modeli saf arrears:** ay M = önceki ay (eym) işgücü; kurucular 2026-08; Aralık maaşı Oca 2027'ye kayar; Ağustos = CAPEX item, Temmuz = yazılım avansı.
- **Veri statik:** backend/fetch yok; tek kalıcılık `localStorage`.
- **Deploy:** clone → kopyala → build/test → push → canlı hash doğrula.
- Sayfada eski veri görürsen: tarayıcıda hard-refresh + (gerekirse) `localStorage` temizle ya da şema yükselt.

---

## 8. Ayrı parça: Google Sheet (bağlı DEĞİL)

`master_plan_arsam_edit-sync-v9-15` adlı Google E-Tablosu bu uygulamadan **bağımsızdır** (canlı bağ yok; `roles.ts` o tablodan bir kez üretilip dondurulmuştur). O tabloda İK PLANI maaşları, yeni `ESLESME` sekmesi + `INDEX/MATCH` formülüyle `MAAŞ PARAMETRELERİ` matrisinden dinamik çekilecek şekilde düzenlendi; ayrıntılı özet: repo kökünde değil, çalışma klasöründeki `../ESLESME_maas_dinamik_OZET.md`.
