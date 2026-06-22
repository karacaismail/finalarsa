# RAPOR 07 · Gelir Modeli, Hizmet Paketleri ve Rakip Fiyatlandırma

> arsam.net / ParselQ · 2026-06-22
> Bu rapor iki işi birleştirir: (1) rakip platformların güncel ilan/paket fiyatları, (2) bunlara göre konumlanan yeni hizmet paketleri ve ek gelir modülleri. İstihdam–ivme tarafı için bkz. RAPOR-06.

Sade dille: gelirimizi **komisyondan değil**, tekrarlayan abonelik ve ek modüllerden kazanıyoruz. Satıcıyı komisyonla sıkmıyoruz; satıcı tarafını bilinçli olarak ucuz tutup, asıl geliri emlakçı abonelikleri + yedi ek modülden alıyoruz. Aşağıdaki sayılar canonik gelir hedefini (2032 medyan 5,5 milyar ₺ / %35 online arsa payı) **değiştirmez**; bunlar o geliri üreten paket ve modül fiyatlarıdır.

---

## 1. Neden bu konum? (satıcı-dostu, pazar-kıyaslı)

Piyasada ilan vermek pahalı ve satıcıyı zorluyor. sahibinden'de bireysel bir emlak ilanı **1.999 ₺/ilan** (ilk ilan indirimli 1.659 ₺, ikinciden itibaren 1.999 ₺ — resmî, güncel). Bir satıcı birkaç ilan verince maliyet hızla büyüyor; emlakçılar da bu yüzden pahalı kurumsal paketlere geçmek zorunda kalıyor.

Bizim açımız: **satıcı tarafı ucuz, hatta giriş ücretsiz.** Satıcı platforma kolayca girer (arz birikir), para ise tekrarlayan emlakçı abonelikleri ve ek modüllerden gelir. Bu, RAPOR-06'daki tezle birebir uyumludur: agresif/öne-yüklü saha istihdamı **arz likiditesini** kurar; buradaki paketler ve modüller o likiditeyi **gelire** çevirir.

---

## 2. Hizmet paketleri

Fiyatlar tek kaynaktan (`database/shared/metrics.json` · `pricing.*`) gelir; sitede 08-gelir-modelleri bölümünde aynen görünür.

| Paket | Kime | İlan hakkı | Fiyat |
|---|---|---|---|
| Ücretsiz | Satıcı (bireysel) | Ayda 1 ilan | 0 ₺ |
| Tekli ilan | Satıcı | 1 ilan | 999 ₺/ilan |
| Başlangıç | Emlakçı | 25 ilan + 5 öne çıkarma | 1.500 ₺/ay |
| Vitrin / Pro | Emlakçı | 75 ilan + vitrin | 3.000 ₺/ay |
| Premium | Emlakçı / kurumsal | 200 ilan + API/veri | 7.500 ₺/ay (90.000 ₺/yıl) |
| Öne çıkar | Herkes | tekil görünürlük | 500 ₺/sefer |

Mantık: satıcı bireysel girişte sahibinden'in 1.999 ₺'sine karşı **ayda 1 ücretsiz / 999 ₺ tekli ilan** (yaklaşık yarısı). Emlakçı paketleri ise pazar bandındadır (aşağıdaki rakip tablosuyla kıyaslanabilir) ve her paket net bir **ilan hakkıyla** gelir — "şu kadar ilan, şu fiyat" belirsizliği yok.

---

## 3. Ek gelir modülleri (yedi akış)

Paket geliri tek başına değildir; toplam geliri yedi modül birlikte taşır. 2032 medyan kırılımı:

| Modül | 2032 medyan |
|---|---|
| ParselQ-RFQ (talep→teklif, amiral) | 1,65 milyar ₺ |
| İlan & görünürlük | 1,10 milyar ₺ |
| Veri & API & rapor | 0,88 milyar ₺ |
| Emlakçı lead ağı | 0,77 milyar ₺ |
| Reklam & sponsorluk | 0,44 milyar ₺ |
| Profesyonel SaaS (emlakçı OS) | 0,385 milyar ₺ |
| Saha hizmetleri (drone/değerleme/foto) | 0,275 milyar ₺ |
| **Toplam (2032 medyan)** | **5,5 milyar ₺** |

Bu yedi modülün toplamı, paket abonelik gelirini de kapsayacak şekilde, canonik 5,5 milyar ₺ hedefine oturur (kötümser 2,48 · iyimser 9,07 milyar ₺).

---

## 4. Rakip fiyatlandırma (2026)

Önemli gerçek: rakiplerin **kurumsal/emlakçı paket fiyatları çoğunlukla kamuya kapalı** — bölgeye ve ilan sayısına göre müşteri temsilcisiyle belirleniyor (Ankara ile Amasya farklı). Kamuya açık tek net rakam bireysel ilan başı ücret. Bu yüzden aşağıda kurumsal satırlar "teklifle" olarak işaretli.

| Platform | Birim / paket | Fiyat (2026) | Not |
|---|---|---|---|
| Sahibinden | Bireysel emlak ilanı | 1.999 ₺/ilan | ilk ilan 1.659 ₺ · resmî, güncel |
| Sahibinden | Kurumsal mağaza | teklifle | ilan sayısına göre |
| Emlakjet | Kurumsal paket | ~300–1.000 ₺/ay | bölgeye göre · bireysel 2/yıl bedava |
| Hürriyet / Milliyet | Kurumsal paket | teklifle | ilan-sayısı kademeli (50→1000) |
| Hepsiemlak | 150 / 400 ilan paketi | teklifle | yıllık |
| ParselQ (biz) | Tekli ilan / abonelik | 999 ₺ / 1.500–7.500 ₺/ay | komisyon yok · satıcı-dostu |

Paket yapısı tarihsel olarak ilan adedine göre kademelidir (örn. Hürriyet: 50 · 100 · 150 · 250 · 400 · 1000 ilan). Güncel ₺ değerleri teklifle alındığı için kamuya açık değil; bizim avantajımız şeffaf, sabit ve düşük satıcı maliyeti.

---

## 5. Karar ve bağ (RAPOR-06 ile)

Konum: **satıcı-dostu, pazar-kıyaslı, komisyonsuz.** Satıcı ucuz girer → arz birikir → emlakçı abonelikleri ve ek modüller geliri taşır. Bu, RAPOR-06'daki agresif/öne-yüklü saha istihdamının (arz likiditesi) doğal gelir karşılığıdır: önce Saha Keşif arzı doldurur, sonra paketler/modüller parayı üretir.

Doğrulama: tüm paket fiyatları metrics tek kaynağındadır; site (08-gelir-modelleri) bu metriklerden beslenir; `database/` güncellendi ve `validate.py` **GEÇTİ** (0 hata). Canonik gelir (5,5 milyar ₺ / %35, 2032) ve kadro (38→256) değişmemiştir.

---

## Kaynaklar

- Sahibinden — Ek İlan Ücretleri (resmî, güncel): yardim.sahibinden.com/hc/tr/articles/115004690434
- Sahibinden — ücretsiz ilan limitleri: yardim.sahibinden.com/hc/tr/articles/115004672373
- EmlakBroker — portal kurumsal paket yapısı (tier/ilan adedi; fiyatlar tarihsel): emlakbroker.com
- Dopigo — Sahibinden kurumsal ilan ücretleri (teklifle): dopigo.com/sahibinden-com-ilan-ucretleri
- Şikayetvar — Emlakjet ücret örnekleri: sikayetvar.com/emlakjet/ucret
