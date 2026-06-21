# IK_PLANI_AI_FIRST_256_v1 Master Data Çakışma Raporu

Tarih: 2026-06-21  
Master kabul edilen dosya: `/Users/karaca/Documents/sonbirarsa/IK_PLANI_AI_FIRST_256_v1.xlsx`  
Karşılaştırılan proje/veri alanı: `/Users/karaca/Documents/sonbirarsa/database` ve `/Users/karaca/Documents/sonbirarsa/landing/src`

## 1. Yönetici Özeti

Excel dosyası açık biçimde yeni master data yönünü veriyor: **Aralık 2031 hedefi 256 kişi**. Mevcut JSON veri katmanı ise hâlâ eski finansal model çizgisini taşıyor: **2032 sonunda 149 kişi**.

Bu yalnızca küçük bir metin farkı değil. Çakışma şu katmanlara yayılmış durumda:

- `data/hr-plan.json`
- `data/financial-model.json`
- `data/financial-detail.json`
- `shared/metrics.json`
- `database/reconciliation.json`
- `sections/11-ik-plani.json`
- `sections/10-ai-operasyon.json`
- `sections/12-basabas.json`
- `manifest.json`
- `_build/build.py`
- `_build/build2.py`
- landing chart/component metinleri

En kritik sonuç: Excel master kabul edilirse mevcut finansal model geçersiz hale geliyor. Çünkü Excel master’da yalnızca **2031 Aralık aylık maaş toplamı 17.569.645 ₺**. Bu yıllıklandırıldığında **210.835.740 ₺** eder. Mevcut JSON finansal modelinde ise **2031 toplam gider 82.811.715 ₺**. Yani master İK planı uygulanırsa, mevcut finansal modeldeki yıllık toplam gider sadece maaşı bile karşılamıyor.

İkinci kritik sonuç: `reconciliation.json` içinde eski karar olarak "149 kanonik" yazıyor. Kullanıcı bu Excel’i master data ilan ettiği için bu karar artık tersine çevrilmeli. Yeni kanonik değer **2031 sonunda 256 kişi** olmalı; 149 kişi eski finansal model kalıntısı olarak işaretlenmeli.

Üçüncü kritik sonuç: Excel master dosyasının kendi içinde de bazı ara toplam farkları var. `İK PLANI` rol satırları 2031 sonunda 256 kişiyle tutarlı; fakat `SAFe TAKIMLAR` ara yıl toplamları ve `AI VERİMLİLİK` toplamı bazı yerlerde farklı rakamlar veriyor. Bu yüzden master’ın içindeki öncelikli kaynak hiyerarşisi belirlenmeli.

## 2. Excel Master Data Özeti

Workbook sayfaları:

- `GEREKÇE & ÖZET`
- `İK PLANI`
- `SAFe TAKIMLAR`
- `AI VERİMLİLİK`
- `DEPARTMAN ÖZETİ`

### 2.1. Master headline

`GEREKÇE & ÖZET` sayfası:

- Başlık: `ARSAM.NET — AI-FIRST İK PLANI (Hedef: Aralık 2031 = 256 kişi)`
- Hazırlanma tarihi: `2026-05-06`
- Hedef kadro: `Dec 2031 = 256 kişi`
- Mevcut plan referansı: `Dec 2031 = 139 kişi (master_plan_arsam_edit-sync-v9-15)`
- Büyüme çarpanı: `≈ 1.84x`

Yorum: Excel dosyası, eski `master_plan_arsam_edit-sync-v9-15` modelini büyütmek için hazırlanmış yeni İK master planı gibi duruyor. Dolayısıyla mevcut JSON’lardaki `model-v9-15` kaynaklı 149 kişi çizgisi eski baz kabul edilmeli.

### 2.2. İK PLANI rol satırlarından çıkan ana timeline

`İK PLANI` sayfasında numerik `Sıra` alanı olan 256 rol satırı esas alınmıştır.

| Dönem | Master rol sayısı | Aylık maaş toplamı |
|---|---:|---:|
| Ara 2026 | 18 | 1.244.628 ₺ |
| Ara 2027 | 69 | 5.068.072 ₺ |
| Ara 2028 | 110 | 7.823.158 ₺ |
| Ara 2029 | 172 | 12.137.779 ₺ |
| Ara 2030 | 222 | 15.492.054 ₺ |
| Ara 2031 | 256 | 17.569.645 ₺ |

Bu tablo raporda master kabul edilmiştir, çünkü doğrudan rol satırlarından türetilmiştir.

### 2.3. Master departman final dağılımı

`DEPARTMAN ÖZETİ` ve rol satırları aynı final dağılıma çok yakın şekilde işaret ediyor:

| Departman | Master kişi |
|---|---:|
| Strateji / C-Level | 5 |
| Headship / Direktörlük | 8 |
| SAFe / Agile | 10 |
| Product & Design | 26 |
| Engineering — Platform | 80 |
| Engineering — AI / Data / GIS | 56 |
| Marketing & Growth | 24 |
| Customer & Seller Ops | 26 |
| Finance & Legal | 11 |
| People / HR | 6 |
| Admin & Office | 4 |
| Toplam | 256 |

### 2.4. Master CPO değeri

`İK PLANI` rol satırında CPO:

- Rol kodu: `R-CPO`
- Rol adı: `CPO / Strateji`
- Departman: `1. Strateji / C-Level`
- Maaş: `339.191 ₺`
- İstihdam tarihi: `01.08.2026`

Mevcut JSON tarafında CPO maaşı çoğunlukla `350.000 ₺/ay` veya `$7.500` olarak duruyor. Bu master ile birebir aynı değil.

## 3. Excel Master İçindeki İç Tutarsızlıklar

Excel master kabul edilecekse bile önce dosya içi kaynak önceliği netleşmeli.

### 3.1. İK PLANI rol toplamı ile SAFe toplamı ara yıllarda farklı

`İK PLANI` rol satırlarından çıkan yıl sonu toplamları:

- Ara 2026: 18
- Ara 2027: 69
- Ara 2028: 110
- Ara 2029: 172
- Ara 2030: 222
- Ara 2031: 256

`SAFe TAKIMLAR` içindeki `TOPLAM KADRO` satırı:

- Ara 2026: 22
- Ara 2027: 75
- Ara 2028: 128
- Ara 2029: 178
- Ara 2030: 218
- Ara 2031: 256

Yorum: Final hedefte ikisi 256’da birleşiyor, ama ara yıllar farklı. Finansal model için ay/çeyrek bazında gider hesaplanacaksa `İK PLANI` rol satırları master alınmalı; `SAFe TAKIMLAR` ara yıl toplamları ya güncellenmeli ya da "organizasyon hedef taslağı" olarak etiketlenmeli.

### 3.2. AI/Data/GIS 55 mi 56 mı?

Dosya içinde farklı değerler var:

- `GEREKÇE & ÖZET`: `AI/Data/GIS 55`
- `SAFe TAKIMLAR`: ART-2 yaklaşık `55 kişi`
- `AI VERİMLİLİK`: `ARSAM.NET 2031 Hedef = 55`
- `DEPARTMAN ÖZETİ`: `Engineering — AI / Data / GIS = 56`
- `İK PLANI` rol satırları: `Engineering — AI / Data / GIS = 56`

Yorum: Rol satırları ve departman özeti 56’yı destekliyor. 55 değerleri muhtemelen yuvarlama/eski ara toplam.

### 3.3. AI VERİMLİLİK toplamı 256 değil 265

`AI VERİMLİLİK` sayfasındaki `TOPLAM` satırı:

- Sahibinden benchmark: `1185`
- ARSAM.NET 2031 hedef: `265`
- AI’sız theoretical: `544`
- AI tasarrufu: `279`

Bu, workbook ana hedefi olan 256 kişiyle çelişiyor. Muhtemel neden: AI verimlilik kategorileri departman özetindeki departmanlarla birebir aynı değil; bazı alanlar bindirilmiş veya farklı sınıflanmış.

Yorum: Bu sayfa "benchmark/verimlilik mantığı" olarak kullanılabilir; resmi kadro toplamı olarak kullanılmamalı. Resmi kadro toplamı `İK PLANI` + `DEPARTMAN ÖZETİ` olmalı.

## 4. JSON ile Ana Çakışmalar

## 4.1. Kadro timeline çakışması

Mevcut JSON:

- [hr-plan.json](/Users/karaca/Documents/sonbirarsa/database/data/hr-plan.json:7) `headcountGrowth`
- [financial-model.json](/Users/karaca/Documents/sonbirarsa/database/data/financial-model.json:14) `yearly`
- [financial-detail.json](/Users/karaca/Documents/sonbirarsa/database/data/financial-detail.json:8) `graduated`

| Yıl | Excel master | JSON mevcut |
|---|---:|---:|
| 2026 sonu | 18 | 19 |
| 2027 sonu | 69 | 63 |
| 2028 sonu | 110 | 84 |
| 2029 sonu | 172 | 101 |
| 2030 sonu | 222 | 117 |
| 2031 sonu | 256 | 133 |
| 2032 sonu | Master kapsamı yok | 149 |

Karar: Excel master kabul edilirse JSON’daki `2026 H2 → 2032 / 149 kişi` çizgisi güncel değildir. Yeni çizgi `2026 Ağustos → 2031 Aralık / 256 kişi` olmalıdır.

## 4.2. Section 11 metinleri eski modeli gösteriyor

Kaynak: [11-ik-plani.json](/Users/karaca/Documents/sonbirarsa/database/sections/11-ik-plani.json:32)

Mevcut metinler:

- `2026 · aylık işe alım (Temmuz 6 → Aralık 19 kişi)`
- `Kadro büyümesi · 2026 (19) → 2032 (149)`
- `Kadro 2026'da 19 kişiyle başlar, 2032'de yaklaşık 149'a ulaşır`

Master ile çelişki:

- Master’da ilk ay `Ağu 2026 = 5 kişi`.
- Master’da Ara 2026 `18 kişi`.
- Master’da final `Ara 2031 = 256 kişi`.

Önerilen yeni ifade:

> Kadro 2026 Ağustos’ta 5 çekirdek rolle başlar; 2026 sonunda 18 kişiye, 2031 sonunda 256 kişilik AI-first organizasyona ulaşır.

## 4.3. `shared/metrics.json` eski headcount ve AI metriklerini taşıyor

Kaynak: [metrics.json](/Users/karaca/Documents/sonbirarsa/database/shared/metrics.json:355)

Çakışan metrikler:

- `fin.headcount_2026 = 19 kişi`
- `fin.headcount_2027 = 63 kişi`
- `fin.headcount_2032 = 149 kişi`
- `ai.fte_without = 74 FTE`
- `ai.fte_with = 38 FTE`
- `ai.fte_saved = 36 FTE`
- `ai.annual_saving = 21 milyon ₺`
- `team.efficiency_multiple = 6-7×`
- `team.lean = 7 kişi`

Master Excel ile uyumlu yeni metrikler:

- `fin.headcount_2026 = 18 kişi`
- `fin.headcount_2027 = 69 kişi`
- `fin.headcount_2028 = 110 kişi`
- `fin.headcount_2029 = 172 kişi`
- `fin.headcount_2030 = 222 kişi`
- `fin.headcount_2031 = 256 kişi`
- `ai.benchmark_total = 1185 kişi` veya daha kontrollü bir aralık
- `ai.target_2031 = 256 kişi`
- `ai.without_theoretical = 544 kişi`
- `ai.saved_fte = 279 FTE`

Not: `AI VERİMLİLİK` sayfası kendi içinde 265 hedef verdiği için `ai.target_2031` için resmi değer 256; `AI VERİMLİLİK` toplamı ayrıca düzeltilmeli veya kategori toplamı olarak etiketlenmeli.

## 4.4. AI operasyon verisi tamamen eski ölçekte

Kaynak: [hr-plan.json](/Users/karaca/Documents/sonbirarsa/database/data/hr-plan.json:89)

Mevcut JSON:

- AI’sız gerekli kadro: 74
- AI ile gerekli kadro: 38
- Tasarruf: 36
- Yıllık tasarruf: 21M ₺
- hedef: `110-150 kişi → ~6-7× verimlilik`

Master Excel:

- Sahibinden benchmark: 1185
- ARSAM 2031 hedef: ana dosyada 256; AI sheet toplam satırında 265
- AI’sız theoretical: 544
- AI tasarrufu: 279

Yorum: Bu iki veri seti aynı ölçeği anlatmıyor. JSON’daki `74/38/36` küçük operasyon modeli; Excel master ise 256 kişilik ölçek organizasyonu. İkisi aynı sunumda yan yana kalamaz.

Öneri:

- Section 10 "AI operasyon" master Excel’e göre yeniden yazılmalı.
- `aiEfficiency.departments` tamamen yeniden oluşturulmalı.
- `annualSaving` yeniden hesaplanmadan kullanılmamalı; Excel’de 279 FTE tasarruf var ama ₺ tasarruf hesabı doğrudan verilmemiş.

## 4.5. CPO maaşı master ile birebir aynı değil

Kaynaklar:

- Excel `İK PLANI`: `R-CPO = 339.191 ₺`
- [financial-model.json](/Users/karaca/Documents/sonbirarsa/database/data/financial-model.json:94): `fixed_2026 = 350.000`
- [metrics.json](/Users/karaca/Documents/sonbirarsa/database/shared/metrics.json:583): `$7.500`
- [metrics.json](/Users/karaca/Documents/sonbirarsa/database/shared/metrics.json:589): `350.000 ₺/ay`

Yorum: Fark küçük görünse de master-data prensibinde önemlidir. Eğer Excel master ise CPO maaşı `339.191 ₺` olmalı. Eğer yatırım sunumunda yuvarlak gösterim isteniyorsa `~340.000 ₺/ay` denebilir; `350.000 ₺/ay` eski veya yuvarlak varsayım olarak etiketlenmelidir.

## 4.6. Finansal gider modeli master İK planını karşılamıyor

Kaynak: [financial-model.json](/Users/karaca/Documents/sonbirarsa/database/data/financial-model.json:14)

Excel master’daki aylık maaş toplamlarını yıllıklandırınca mevcut JSON toplam giderleriyle çelişiyor:

| Yıl | Excel master kişi | Excel aylık maaş | Excel yıllıklandırılmış maaş | JSON kişi | JSON toplam gider | Maaş - JSON gider farkı |
|---|---:|---:|---:|---:|---:|---:|
| 2026 H2 | 18 | 1.244.628 ₺ | 14.935.536 ₺ | 19 | 9.238.891 ₺ | +5.696.645 ₺ |
| 2027 | 69 | 5.068.072 ₺ | 60.816.864 ₺ | 63 | 40.014.053 ₺ | +20.802.811 ₺ |
| 2028 | 110 | 7.823.158 ₺ | 93.877.896 ₺ | 84 | 56.595.782 ₺ | +37.282.114 ₺ |
| 2029 | 172 | 12.137.779 ₺ | 145.653.348 ₺ | 101 | 64.605.927 ₺ | +81.047.421 ₺ |
| 2030 | 222 | 15.492.054 ₺ | 185.904.648 ₺ | 117 | 73.198.235 ₺ | +112.706.413 ₺ |
| 2031 | 256 | 17.569.645 ₺ | 210.835.740 ₺ | 133 | 82.811.715 ₺ | +128.024.025 ₺ |

Bu tablo en kritik bulgudur. Mevcut finansal modelin toplam gideri, master İK planındaki maaş toplamından bile düşük kalıyor. Üstelik bu karşılaştırma işveren SGK yükü, yan haklar, ofis, araç, yazılım, ekipman ve enflasyon artışlarını eklemeden yapılmıştır.

Karar: Excel master kabul edilirse `financial-model.json`, `financial-detail.json` ve `financial-breakdown.json` komple yeniden hesaplanmalı. Sadece headcount sayılarını değiştirmek yetmez.

## 4.7. `financial-detail.json` aylık işe alım master ile uyumsuz

Kaynak: [financial-detail.json](/Users/karaca/Documents/sonbirarsa/database/data/financial-detail.json:154)

Mevcut JSON 2026:

- Tem 26: 6 kişi
- Ağu 26: 9 kişi
- Eyl 26: 11 kişi
- Eki 26: 14 kişi
- Kas 26: 16 kişi
- Ara 26: 19 kişi

Excel master rol satırları:

- Ağu 26: 5 kişi
- Eyl 26: 12 kişi
- Eki 26: 13 kişi
- Kas 26: 15 kişi
- Ara 26: 18 kişi

Çakışma:

- JSON Temmuz 2026’da kadro başlatıyor; master Ağustos 2026’da başlıyor.
- Ay ay kadro değerleri farklı.
- 2027 sonrası JSON çeyrek/yıl kırılımı master’ın yeni büyüme dalgalarıyla uyumlu değil.

## 4.8. `reconciliation.json` artık ters karar taşıyor

Kaynak: [reconciliation.json](/Users/karaca/Documents/sonbirarsa/database/reconciliation.json:57)

Mevcut karar:

- `model 2032: 149 kişi`
- `eski s06 yorumu: 256`
- `decision: 149 kanonik`

Yeni master kabule göre bu karar yanlış hale geliyor.

Önerilen yeni karar:

```json
{
  "topic": "Maksimum kadro",
  "values": {
    "IK_PLANI_AI_FIRST_256_v1.xlsx": "2031 Aralık = 256 kişi",
    "model-v9-15": "2032 = 149 kişi"
  },
  "decision": "256 kişi / Aralık 2031 yeni kanonik İK master. 149 kişi eski finansal model baz çizgisi olarak arşivlenir.",
  "canonical": [
    "fin.headcount_2031",
    "hr-plan.headcountGrowth",
    "IK_PLANI_AI_FIRST_256_v1.xlsx"
  ]
}
```

## 4.9. Build scriptleri eski veriyi geri üretebilir

Kaynaklar:

- `/Users/karaca/Documents/sonbirarsa/database/_build/build.py`
- `/Users/karaca/Documents/sonbirarsa/database/_build/build2.py`

Bu dosyalarda eski değerler hard-coded veya generate logic içinde duruyor:

- 149 kişi / 2032
- `fin.headcount_2032`
- `ai.fte_without = 74`
- `ai.fte_with = 38`
- `ai.fte_saved = 36`
- `ai.annual_saving = 21M`
- CPO `350.000 ₺`
- Eski section metinleri

Risk: JSON dosyaları elle düzeltilse bile build script tekrar çalışırsa eski veri geri gelir. Önce build scriptlerin veri kaynağı Excel master’a bağlanmalı veya bu hard-coded değerler temizlenmeli.

## 5. Diğer Alanlarda Çakışma

### 5.1. Landing componentleri doğrudan JSON’dan okuduğu için eski veriyi gösteriyor

Landing tarafındaki render dosyaları JSON’u tüketiyor:

- `/Users/karaca/Documents/sonbirarsa/landing/src/components/ChartViews.tsx`
- `/Users/karaca/Documents/sonbirarsa/landing/src/components/charts.ts`
- `/Users/karaca/Documents/sonbirarsa/landing/src/components/Blocks.tsx`

Kodun kendisi çoğu değeri hard-code etmiyor; fakat chart başlıkları ve aria label’lar hâlâ `2032` anlatısını taşıyor. JSON düzeltilmeden UI doğru görünmez.

### 5.2. `sources.json` yeni master dosyayı tanımıyor

Kaynak: `/Users/karaca/Documents/sonbirarsa/database/shared/sources.json`

Mevcut kaynak:

- `model-v9-15`: `master_plan_arsam_edit-sync-v9-15.xlsx · 78 aylık projeksiyon (Tem 2026 – Ara 2032)`

Eksik kaynak:

- `IK_PLANI_AI_FIRST_256_v1.xlsx`

Öneri:

```json
"ik-ai-first-256-v1": {
  "label": "İK AI-FIRST 256 v1",
  "full": "IK_PLANI_AI_FIRST_256_v1.xlsx · AI-first İK planı · Aralık 2031 = 256 kişi"
}
```

### 5.3. Manifest ve section başlıkları eski finansal ufku koruyor

Kaynaklar:

- `manifest.json`
- `sections/12-basabas.json`
- `sections/11-ik-plani.json`

Örnek eski ifadeler:

- `Para, ilk aydan 2032'ye kronolojik olarak izlenir`
- `2032 vizyonu`
- `2026 (19) → 2032 (149)`

Excel master sonrası bu ifadeler ayrıştırılmalı:

- Finansal model hâlâ 2032’ye uzayacaksa: "finansal ufuk 2032"
- İK master: "organizasyon hedefi 2031 sonunda 256 kişi"

İkisi aynı çizgi gibi gösterilmemeli.

## 6. Çelişki Sınıflandırması

### C1 - Kritik / yatırımcı sunumunu doğrudan bozar

1. 149/2032 eski İK hedefi ile 256/2031 master hedefi çelişiyor.
2. Finansal gider modeli master maaş toplamını karşılamıyor.
3. AI verimlilik sayıları eski küçük modele göre kalmış.
4. `reconciliation.json` yeni master kabule ters karar taşıyor.
5. Build scriptleri eski verileri geri üretebilir.

### C2 - Önemli / veri güvenini düşürür

1. CPO maaşı 339.191 ₺ vs 350.000 ₺.
2. 2026 aylık kadro başlangıcı Temmuz 6 kişi vs Ağustos 5 kişi.
3. SAFe ara yıl toplamları ile İK rol satırları farklı.
4. AI/Data/GIS 55 vs 56.
5. AI VERİMLİLİK toplamı 265, ana hedef 256.

### C3 - Dokümantasyon / anlatı düzeltmesi

1. `2032 vizyonu` ile `2031 organizasyon hedefi` ayrılmalı.
2. `model-v9-15` kaynak etiketi yeni master yanında eski baz olarak işaretlenmeli.
3. Section notları ve chart caption’ları güncellenmeli.
4. Eski doğrulama/strateji raporlarında geçen 149 kanonik kararları güncellenmeli veya arşiv notu düşülmeli.

## 7. Önerilen Kanonik Veri Hiyerarşisi

Excel master kendi içinde de ara farklar taşıdığı için şu hiyerarşi önerilir:

1. **İK PLANI rol satırları**: kişi bazlı master. Ay ay işe alım ve maaş toplamı buradan alınmalı.
2. **DEPARTMAN ÖZETİ**: final departman dağılımı. 256 kişi final dağılım için kullanılmalı.
3. **SAFe TAKIMLAR**: organizasyon tasarımı. Final hedef 256 için kullanılabilir; ara yıl toplamları rol satırlarıyla hizalanmalı.
4. **AI VERİMLİLİK**: benchmark/verimlilik mantığı. Resmi headcount toplamı olarak kullanılmadan önce 265 → 256 farkı çözülmeli.
5. **GEREKÇE & ÖZET**: anlatı ve yönetici özeti. Sayısal değerleri rol satırlarıyla doğrulanarak kullanılmalı.

## 8. Güncellenmesi Gereken Dosya Listesi

### Mutlaka güncellenmeli

- `/Users/karaca/Documents/sonbirarsa/database/data/hr-plan.json`
- `/Users/karaca/Documents/sonbirarsa/database/data/financial-model.json`
- `/Users/karaca/Documents/sonbirarsa/database/data/financial-detail.json`
- `/Users/karaca/Documents/sonbirarsa/database/data/financial-breakdown.json`
- `/Users/karaca/Documents/sonbirarsa/database/shared/metrics.json`
- `/Users/karaca/Documents/sonbirarsa/database/shared/sources.json`
- `/Users/karaca/Documents/sonbirarsa/database/reconciliation.json`
- `/Users/karaca/Documents/sonbirarsa/database/sections/10-ai-operasyon.json`
- `/Users/karaca/Documents/sonbirarsa/database/sections/11-ik-plani.json`
- `/Users/karaca/Documents/sonbirarsa/database/sections/12-basabas.json`

### Build kaynakları güncellenmeli

- `/Users/karaca/Documents/sonbirarsa/database/_build/build.py`
- `/Users/karaca/Documents/sonbirarsa/database/_build/build2.py`
- `/Users/karaca/Documents/sonbirarsa/database/_build/validate.py`

### UI tarafı kontrol edilmeli

- `/Users/karaca/Documents/sonbirarsa/landing/src/components/ChartViews.tsx`
- `/Users/karaca/Documents/sonbirarsa/landing/src/components/charts.ts`
- `/Users/karaca/Documents/sonbirarsa/landing/src/components/Blocks.tsx`

## 9. Düzeltme Planı

### Faz 1 - Master extract

Excel’den üretilecek yeni JSON:

- `data/hr-master-256.json`

İçeriği:

- Rol satırları.
- Ay ay headcount.
- Ay ay maaş toplamı.
- Yıl sonu özetleri.
- Departman dağılımı.
- Ünvan dağılımı.
- CPO satırı.
- SAFe takım eşlemesi.
- AI verimlilik benchmark satırları.

### Faz 2 - Eski HR verisini değiştirme

`hr-plan.json` şu yapıya taşınmalı:

```json
{
  "source": "ik-ai-first-256-v1",
  "target": {
    "year": "2031",
    "month": "Ara",
    "headcount": 256
  },
  "headcountGrowth": [
    { "year": "2026", "count": 18 },
    { "year": "2027", "count": 69 },
    { "year": "2028", "count": 110 },
    { "year": "2029", "count": 172 },
    { "year": "2030", "count": 222 },
    { "year": "2031", "count": 256 }
  ]
}
```

### Faz 3 - Finansal model recalculation

Sadece headcount değerleri değiştirilmeyecek. Şunlar yeniden hesaplanmalı:

- Personel giderleri.
- İşveren maliyeti.
- Yan haklar.
- CPO paketi.
- Office/seat cost.
- AI tool cost.
- Ekipman/welcome package.
- CAPEX/OPEX kırılımı.
- Başabaş ayı.
- Kasa dip noktası.
- Yatırım ihtiyacı.
- 2027-2032 gider ve net kâr.

### Faz 4 - Section ve UI metinleri

Özellikle:

- Section 10: AI verimlilik.
- Section 11: İK planı.
- Section 12: finansal model.
- Section 15: CPO.

Yeniden yazılmalı.

### Faz 5 - Validation

Yeni validation kuralları:

- `hr-plan.headcountGrowth[2031] == 256`
- `metrics.fin.headcount_2031 == 256`
- `financial-model.yearly[2031].expense >= annualized_salary_2031`
- `financial-detail` ay/yıl headcount değerleri Excel extract ile eşleşmeli.
- `reconciliation` artık 256’yı kanonik göstermeli.

## 10. Claude'a Verilecek Kısa Talimat

```text
IK_PLANI_AI_FIRST_256_v1.xlsx yeni master data kabul edilecek. Eski model-v9-15 İK verileri artık kanonik değil.

İK için master kaynak sırası: önce İK PLANI rol satırları, sonra DEPARTMAN ÖZETİ, sonra SAFe TAKIMLAR, en son AI VERİMLİLİK. Ara yıl toplamlarında çelişki varsa rol satırları kazanır.

JSON tarafında 2026=19, 2027=63, 2028=84, 2029=101, 2030=117, 2031=133, 2032=149 çizgisi eski modeldir. Yeni çizgi: 2026=18, 2027=69, 2028=110, 2029=172, 2030=222, 2031=256.

AI operasyon verisi eski 74/38/36 FTE değil; Excel master benchmark mantığına göre yeniden kurulmalı. Ancak AI VERİMLİLİK sayfasındaki toplam 265 ile ana hedef 256 çeliştiği için resmi hedef 256 alınmalı, AI sheet kategori toplamı düzeltilmeli veya açıklanmalı.

Finansal model yeniden hesaplanmadan eski gelir/gider/net kâr rakamlarını 256 kişilik planla birlikte gösterme. Excel master maaş toplamı 2031'de aylık 17.569.645 ₺; mevcut JSON 2031 toplam gideri 82.811.715 ₺ olduğu için mevcut finansal model master İK planını karşılamıyor.

reconciliation.json içindeki '149 kanonik' kararı tersine çevrilmeli: 256 kişi / Aralık 2031 yeni kanonik İK hedefidir; 149 kişi eski finansal model baz çizgisidir.
```

## 11. Sonuç

Excel master kabul edilirse mevcut proje verisiyle büyük ve yapısal çakışma var. Bu çakışma yalnızca İK metinlerini değil, finansal modelin tamamını etkiliyor.

En doğru uygulama şu sırayla yapılmalı:

1. Excel’den yeni `hr-master-256.json` türet.
2. `hr-plan.json` ve `metrics.json` içindeki eski headcount/AI değerlerini değiştir.
3. Finansal model giderlerini 256 kişilik plana göre yeniden hesapla.
4. Section 10, 11, 12 ve ilgili chart metinlerini güncelle.
5. Build script ve validation kurallarını master Excel’e göre düzelt.

Bu yapılmadan yatırımcı sunumunda `256 kişi`, `149 kişi`, `2031`, `2032`, `38 FTE`, `279 FTE`, `350.000 ₺`, `339.191 ₺` gibi değerler birlikte görünürse veri güveni ciddi şekilde zarar görür.
