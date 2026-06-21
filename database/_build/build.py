# -*- coding: utf-8 -*-
"""
!!! UYARI (19.06.2026): JSON dosyalarına bu builder'dan SONRA dış-kaynak doğrulama
düzeltmeleri elle uygulandı (data/incentives.json, shared/metrics.json,
data/strategy-arsenal.json; bkz. verification/dogrulama-raporu.md). Bu script'i yeniden
çalıştırmak o düzeltmeleri GERİ ALIR. Regenerate edecekseniz önce düzeltmeleri buraya taşıyın.

arsam.net pitch verisi -> yapısal JSON üretici (builder).
Bu script tek kaynaktan (metrics) tutarlı JSON dosyaları üretir.
Çıktı: database/ altında shared/, sections/, data/, schema/, manifest.json, reconciliation.json
NOT: Üretilen JSON dosyaları kanoniktir; bu script yalnızca üretim/doğrulama aracıdır.
"""
import json, os, re, hashlib, sys

# ============================================================================
# DEVRE DIŞI (21.06.2026 — 256 MASTER GÖÇÜ):
# JSON dosyaları artık ELLE BAKIMLI kanonik kaynaktır. Kadro IK_PLANI_AI_FIRST_256_v1
# (Aralık 2031 = 256), finansal model bu kadroya göre YENİDEN HESAPLANDI (gelir korundu,
# gider/net/marj/başabaş revize). Bu builder'daki literal'ler ESKİ 149/2032 modelidir.
# Bu script'i çalıştırmak göçü ve finansal recalc'ı GERİ ALIR.
# Çalıştırmadan önce: literal'leri (headcount/AI/CPO) ve finansal mantığı master'a taşıyın,
# hr-master-256.json'u kaynak alın; sonra ALLOW_LEGACY_BUILD=1 ile çalıştırın.
# ============================================================================
if os.environ.get("ALLOW_LEGACY_BUILD") != "1":
    sys.exit("build.py DEVRE DIŞI: JSON kanonik + 256 master + finansal recalc elle bakımlı. "
             "Çalıştırmak göçü geri alır. Bilerek devam için ALLOW_LEGACY_BUILD=1 verin.")

# database/ (bu dosya database/_build/ içinde) — göreli, oturumdan bağımsız.
OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = {}  # rel_path -> python obj

def reg(rel, obj):
    FILES[rel] = obj

VERSION = "1.0.0"

def env(id_, kind, **extra):
    """Ortak zarf (envelope)."""
    d = {"id": id_, "kind": kind, "schemaVersion": VERSION, "lang": "tr"}
    d.update(extra)
    return d

# ============================================================
# SHARED · BRAND
# ============================================================
brand = env("brand", "shared",
    name="arsam.net",
    legalNote="A.Ş. (kuruluş planı: Q3 2026)",
    tagline="Türkiye'nin ilk dikey arsa pazaryeri",
    positioning="sahibinden yatay; biz dikey. arsa, tarla, bağ, çiftlik, hisseli, hobi bahçesi — tek kategoride hâkim.",
    founder={"name": "İsmail", "role": "CPO", "title": "Chief Product Officer"},
    contact={
        "email": "cpo@arsam.net",
        "phone": "+90 532 295 10 80",
        "phoneHref": "tel:+905322951080",
        "city": "İstanbul"
    },
    officeTarget={"name": "İTÜ ARI Teknokent", "district": "Maslak", "access": "M2 metrosu"},
    competitors=[
        {"name": "sahibinden.com", "axis": "yatay · açık", "note": "hâkim konum; arsa kategorisinde %68 pay"},
        {"name": "hepsiemlak", "axis": "yatay · açık"},
        {"name": "emlakjet", "axis": "yatay · küratoryal kısmi"}
    ],
    preparedAt="Nisan 2026",
    domain="arsam.net"
)
reg("shared/brand.json", brand)

# ============================================================
# SHARED · SOURCES (atıflar — tek kaynak)
# ============================================================
sources = env("sources", "shared", items={
    "tkgm-2024": {"label": "TKGM 2024", "full": "Tapu ve Kadastro Genel Müdürlüğü 2024 yılı taşınmaz satış istatistikleri"},
    "tuik-2024": {"label": "TÜİK 2024", "full": "TÜİK Konut Satış İstatistikleri 2024"},
    "tuik-tapu-2025": {"label": "TÜİK Tapu 2025", "full": "TÜİK Tapu İstatistikleri (2025 kayıt)"},
    "rekabet-kurulu": {"label": "Rekabet Kurulu", "full": "Rekabet Kurulu kararları (sahibinden.com hâkim konum tespiti)"},
    "similarweb": {"label": "SimilarWeb", "full": "SimilarWeb trafik verileri (2025-2026)"},
    "gyoder-webrazzi": {"label": "GYODER & Webrazzi 2024", "full": "Online emlak pazar payı sektör tahminleri"},
    "kanun-4691": {"label": "4691 sayılı Kanun", "full": "Teknoloji Geliştirme Bölgeleri Kanunu (Teknopark vergi istisnaları)"},
    "kanun-5746": {"label": "5746 sayılı Kanun", "full": "Ar-Ge ve Tasarım Faaliyetlerinin Desteklenmesi Hakkında Kanun"},
    "model-v9-15": {"label": "Finansal model v9-15", "full": "master_plan_arsam_edit-sync-v9-15.xlsx · 78 aylık projeksiyon (Tem 2026 – Ara 2032)"},
    "helmer-7powers": {"label": "7 Powers (Hamilton Helmer)", "full": "Counter-positioning ve moat çerçevesi"},
    "chen-coldstart": {"label": "Cold Start Theory (Andrew Chen)", "full": "Atomik ağ / cold-start"},
    "wei-saas": {"label": "Status as a Service (Eugene Wei)", "full": "Statü mühendisliği"},
    "levinson-1984": {"label": "Guerrilla Marketing (Levinson, 1984)", "full": "Klasik gerilla pazarlama referansı"}
})
reg("shared/sources.json", sources)

# ============================================================
# SHARED · GLOSSARY (sözlük — terim tek kaynak)
# ============================================================
glossary = env("glossary", "shared", terms={
    "TAM": "Toplam Adreslenebilir Pazar — teorik üst sınır (tüm işlemler × ortalama değer).",
    "SAM": "Hizmet Verilebilir Pazar — TAM'ın dijitale/online açık olan kısmı.",
    "SOM": "Elde Edilebilir Pazar — gerçekçi olarak ele geçirilebilecek pay (taahhüt).",
    "EİDS": "Elektronik İlan Doğrulama Sistemi — Şubat 2026'da zorunlu hale gelen yasal ilan doğrulama şartı.",
    "TAKBİS": "Tapu ve Kadastro Bilgi Sistemi — resmi tapu kayıt entegrasyonu.",
    "4691": "Teknoloji Geliştirme Bölgeleri Kanunu — teknopark vergi istisnalarının dayanağı.",
    "take rate": "Platformun işlem/ilan hacminden aldığı gelir oranı (burada %1,5).",
    "CAC": "Müşteri Edinme Maliyeti (Customer Acquisition Cost).",
    "LTV": "Müşteri Yaşam Boyu Değeri (Lifetime Value).",
    "EBITDA": "Faiz, vergi, amortisman öncesi kâr.",
    "Counter-Positioning": "Liderin kopyalarsa kendi modelini öldüreceği bir konum seçme (Helmer, 7 Powers).",
    "Atomic Network": "Tek bir küçük pazarda tam doygunluk sağlayıp sonra yayılma (Chen).",
    "Programmatic SEO": "Tek şablonla devasa sayıda otomatik sayfa üreterek uzun-kuyruk aramada hâkimiyet.",
    "Memetic Warfare": "Reklam bütçesi yerine organik kültürel/mem yayılımıyla farkındalık.",
    "Status as a Service": "Kıtlık + emek-kanıtı ile statü üreterek kullanıcı çekme (Wei).",
    "Trojan Horse": "Rakibin/üçüncü tarafların sitesine gömülü araçla dağıtım (Airbnb-Craigslist mantığı).",
    "SAFe": "Scaled Agile Framework — ölçekli çevik organizasyon modeli.",
    "ART": "Agile Release Train — SAFe'de bir ürün değer akışını yürüten takım grubu.",
    "CPO": "Chief Product Officer — Ürün/strateji sorumlusu (burada kurucu rol)."
})
reg("shared/glossary.json", glossary)

# ============================================================
# SHARED · METRICS (TEK KAYNAK — tüm rakamlar burada)
# Her bölüm bu anahtarlara {{metric:key}} ile referans verir.
# ============================================================
def M(value, unit, display, label, source=None, note=None):
    d = {"value": value, "unit": unit, "display": display, "label": label}
    if source: d["source"] = source
    if note: d["note"] = note
    return d

metrics = {}
# --- SERMAYE / BOOTSTRAP ---
metrics["capital.investor_pocket"] = M(15000000, "TRY", "15 milyon ₺", "Yatırımcı cebinden çıkan", "model-v9-15", "Her iki pitch sürümünde de tutarlı.")
metrics["capital.total_raised"]   = M(40000000, "TRY", "40 milyon ₺", "Başlangıç sermayesi (model tabanı)", "model-v9-15")
metrics["capital.breakeven_spend"]= M(15000000, "TRY", "15 milyon ₺", "Başabaşa kadar kümülatif gider", "model-v9-15")
metrics["capital.reserve"]        = M(25000000, "TRY", "25 milyon ₺", "Başabaş sonrası kasada kalan yedek", "model-v9-15")
metrics["capital.ops_funded"]     = M(34000000, "TRY", "34 milyon ₺", "Operasyonun kendi cirosundan finanse ettiği gider")
metrics["capital.lifetime_spend"] = M(49000000, "TRY", "49 milyon ₺", "Toplam harcanan (15M cep + 34M operasyon)", note="arsam-pitch sürümünün çerçevesi; reconciliation: capital.total_raised ile karşılaştır.")
metrics["capital.min_return"]     = M(259000000, "TRY", "259 milyon ₺", "Minimum kazanç (kötümser senaryo geliri)")
# --- GELİR SENARYOLARI ---
metrics["revenue.pessimist"] = M(259000000, "TRY", "259 milyon ₺", "Kötümser senaryo yıllık gelir", note="Bazı bölümlerde 260M olarak yuvarlanır.")
metrics["revenue.median"]    = M(519000000, "TRY", "519 milyon ₺", "Medyan (plan baz) yıllık gelir", "model-v9-15", "TAM_SAM_SOM tam değer: 518.667.093 ₺.")
metrics["revenue.optimist"]  = M(823000000, "TRY", "823 milyon ₺", "İyimser senaryo yıllık gelir")
metrics["revenue.potential_exact"] = M(518667093, "TRY", "518.667.093 ₺", "SOM × take rate tam değer", "model-v9-15")
# --- PAZAR (işlem adedi görünümü · 2024) ---
metrics["market.total_realestate_2024"] = M(3065872, "adet", "3.065.872", "2024 toplam taşınmaz satışı", "tkgm-2024")
metrics["market.land_commercial_2024"]  = M(1587847, "adet", "1.587.847", "Arsa + tarla + ticari (arsam.net direkt pazarı)", "tkgm-2024")
metrics["market.housing_2024"]          = M(1478025, "adet", "1.478.025", "Konut satışı", "tuik-2024")
metrics["market.daily_transfers"]       = M(8400, "adet/gün", "8.400", "Günlük ortalama tapu devri", "tkgm-2024")
metrics["market.monthly_transfers"]     = M(255490, "adet/ay", "~255.490", "Aylık ortalama tapu devri", "tkgm-2024")
# --- PAZAR (değer hunisi · 2025 model) ---
metrics["market.tam_try"] = M(1850000000000, "TRY", "1,85 trilyon ₺", "TAM — arsa toplam pazar", "model-v9-15", "1,4M işlem × ~1,32M ₺ ort. değer")
metrics["market.sam_try"] = M(346000000000, "TRY", "346 milyar ₺", "SAM — dijitale açık pay", "model-v9-15")
metrics["market.som_try"] = M(34600000000, "TRY", "34,6 milyar ₺", "SOM — elde edilebilir pay", "model-v9-15")
metrics["market.online_penetration"] = M(0.187, "ratio", "%18,7", "Online penetrasyon", "model-v9-15")
metrics["market.take_rate"] = M(0.015, "ratio", "%1,5", "İlan-reklam geliri oranı (take rate)", "model-v9-15")
metrics["market.land_tx_annual"] = M(1400000, "adet", "1,4 milyon", "Yıllık arsa işlemi", "model-v9-15")
metrics["market.avg_land_value"] = M(1320000, "TRY", "1,32 milyon ₺", "Ortalama arsa işlem değeri", "model-v9-15", "Model tam değer: 1.323.162 ₺")
metrics["market.emlak_tam_try"] = M(5500000000000, "TRY", "5,5 trilyon ₺", "Emlak (arsa hariç) TAM", "model-v9-15")
metrics["market.sahibinden_share_land"] = M(0.68, "ratio", "%68", "sahibinden arsa kategorisi payı", "rekabet-kurulu")
metrics["market.sahibinden_share_realestate"] = M(0.55, "ratio", "%55", "sahibinden genel emlak payı", "rekabet-kurulu")
# --- TEKNOPARK / VERGİ (4691) ---
metrics["tax.saving_2027"] = M(131000000, "TRY", "~131 milyon ₺", "İlk yıl (2027) vergi tasarrufu", "kanun-4691", "arsam-pitch çerçevesi; code2 muhafazakar türevi ~115M (389M net × %25 + personel kalemleri).")
metrics["tax.saving_mature_annual"] = M(120000000, "TRY", "~120 milyon ₺", "Olgun yıllık vergi tasarrufu", "kanun-4691")
metrics["tax.saving_two_year"] = M(240000000, "TRY", "240 milyon ₺", "2027-2028 iki yıl garanti tasarruf", "kanun-4691")
metrics["tax.saving_cumulative_7y"] = M(1000000000, "TRY", "~1 milyar ₺", "7 yıl (2026-2032) kümülatif tasarruf", "kanun-4691")
metrics["tax.corporate_rate"] = M(0.25, "ratio", "%25 → %0", "Kurumlar vergisi istisnası", "kanun-4691")
metrics["tax.income_withholding"] = M(1.00, "ratio", "%100", "Gelir vergisi stopajı muafiyeti (Ar-Ge personeli)", "kanun-4691")
metrics["tax.sgk_employer"] = M(0.50, "ratio", "%50", "SGK işveren payı hazine desteği", "kanun-4691")
metrics["tax.ebitda_2032"] = M(0.926, "ratio", "~%92,6", "2032 EBITDA marjı (vergi yükü kalkınca)")
metrics["tax.ebitda_total"] = M(0.90, "ratio", "~%90", "Toplam EBITDA marjı")
metrics["tax.valid_until"] = M("2028-12-31", "date", "31/12/2028", "4691 istisna süresi (tarihsel olarak uzatılagelmiş)", "kanun-4691")
metrics["tax.investment_multiple"] = M(40, "x", "40 kat", "Kümülatif tasarrufun yatırım turuna oranı")
# --- FİYATLANDIRMA ---
metrics["pricing.premium_annual"] = M(90000, "TRY/yıl", "90.000 ₺/yıl", "Premium yıllık abonelik", "model-v9-15")
metrics["pricing.premium_monthly"] = M(7500, "TRY/ay", "7.500 ₺/ay", "Premium aylık karşılığı", "model-v9-15")
metrics["pricing.vitrin_monthly"] = M(3000, "TRY/ay", "3.000 ₺/ay", "Vitrin slot", "model-v9-15")
metrics["pricing.starter_monthly"] = M(1500, "TRY/ay", "1.500 ₺/ay", "Başlangıç paketi", "model-v9-15")
metrics["pricing.doping_per"] = M(500, "TRY", "500 ₺/sefer", "Doping · öne çıkar", "model-v9-15")
metrics["pricing.premium_conversion"] = M(0.003, "ratio", "%0,3", "Premium dönüşüm oranı", "model-v9-15")
# --- FİNANSAL (yıllık özet · model) ---
metrics["fin.revenue_2027"] = M(429141625, "TRY", "429M ₺", "2027 gelir", "model-v9-15")
metrics["fin.net_2027"] = M(389127572, "TRY", "+389M ₺", "2027 net kâr", "model-v9-15")
metrics["fin.cash_2032"] = M(4224379820, "TRY", "4,2 milyar ₺", "2032 yıl sonu nakit", "model-v9-15")
metrics["fin.profit_margin_min"] = M(0.88, "ratio", "%88+", "2027'den itibaren kâr marjı", "model-v9-15")
metrics["fin.headcount_2026"] = M(19, "kişi", "19 kişi", "2026 sonu kadro", "model-v9-15")
metrics["fin.headcount_2027"] = M(63, "kişi", "63 kişi", "2027 sonu kadro", "model-v9-15")
metrics["fin.headcount_2032"] = M(149, "kişi", "149 kişi", "2032 sonu kadro", "model-v9-15", "Pitch'in eski s06 yorumundaki '256' modelle uyumsuz; kanonik 149.")
metrics["fin.projection_months"] = M(78, "ay", "78 ay", "Projeksiyon süresi (Tem 2026 – Ara 2032)", "model-v9-15")
metrics["fin.breakeven_month"] = M("2027-01", "month", "Oca 2027", "Operasyonel başabaş ayı", "model-v9-15")
metrics["fin.breakeven_months"] = M(18, "ay", "18 ay", "Başabaşa kalan süre")
# --- STRATEJİ / CEPHANE ---
metrics["strategy.total_models"] = M(470, "model", "470 model", "Toplam asimetrik pazarlama modeli envanteri", note="130 hijack + 130 topluluk + 210 ürün-içi = 470. arsam-pitch'teki '14+468=482' reconciliation'da 470'e sabitlendi.")
metrics["strategy.hero_weapons"] = M(6, "silah", "6 silah", "Pitch'te detaylandırılan ana silah")
metrics["strategy.named_strategies"] = M(14, "strateji", "14 strateji", "Adı listelenen strateji (arsam-pitch s04)")
metrics["strategy.prioritized"] = M(45, "model", "45 model", "arsam.net için önceliklendirilmiş filtre")
metrics["strategy.manifesto_items"] = M(14, "madde", "14 madde", "Kapanış manifestosu madde sayısı")
metrics["strategy.seo_pages"] = M(448000, "sayfa", "~448.000 sayfa", "Programatik SEO sayfa sayısı", note="81 il × 922 ilçe × 6 ilan tipi ≈ 448.000. arsam-pitch'teki '4.865 ilçe sayfası' ilçe-bazlı eski türev; reconciliation'a bakınız.")
# --- YATIRIM TURU ---
metrics["invest.seed_amount"] = M(5000000, "TRY", "5M ₺", "Çekirdek tur tutarı")
metrics["invest.seed_equity"] = M(0.025, "ratio", "%2,5", "Çekirdek hisse")
metrics["invest.seed_valuation"] = M(200000000, "TRY", "200M ₺", "Çekirdek valuation")
metrics["invest.strategic_amount"] = M(15000000, "TRY", "15M ₺", "Stratejik (önerilen) tur tutarı")
metrics["invest.strategic_equity"] = M(0.07, "ratio", "%7", "Stratejik hisse")
metrics["invest.strategic_valuation"] = M(215000000, "TRY", "215M ₺", "Stratejik valuation")
metrics["invest.lead_amount"] = M(25000000, "TRY", "25M ₺", "Lider tur tutarı")
metrics["invest.lead_equity"] = M(0.10, "ratio", "%10", "Lider hisse + yönetim kurulu koltuğu")
metrics["invest.revenue_multiple"] = M(15, "x", "15× gelir", "4 yıl sonra gelir çarpanı")
# --- PENCERE / FOMO ---
metrics["window.slots_total"] = M(8, "slot", "8 slot", "Erken-yatırımcı toplam slot")
metrics["window.slots_open"] = M(3, "slot", "3 slot", "Açık kalan slot")
metrics["window.close"] = M("2026-12", "month", "Aralık 2026", "Erken-yatırımcı penceresi kapanışı / ulusal kampanya")
metrics["window.countdown_target"] = M("2026-12-01", "date", "1 Aralık 2026", "Ulusal kampanya geri sayım hedefi")
# --- EKİP / AI VERİMLİLİK ---
metrics["team.lean"] = M(7, "kişi", "7 kişi", "Yalın çekirdek ekip (700 kişinin işini yapar)")
metrics["team.sahibinden_benchmark"] = M("750-1000", "kişi", "750-1000 kişi", "sahibinden çalışan sayısı benchmark")
metrics["team.efficiency_multiple"] = M("6-7", "x", "6-7×", "Hedef verimlilik çarpanı (2032)")
metrics["ai.fte_without"] = M(74, "FTE", "74 FTE", "AI'sız gerekli kadro")
metrics["ai.fte_with"] = M(38, "FTE", "38 FTE", "AI ile gerekli kadro")
metrics["ai.fte_saved"] = M(36, "FTE", "36 FTE", "AI ile tasarruf edilen kadro")
metrics["ai.annual_saving"] = M(21000000, "TRY", "21 milyon ₺", "AI verimlilik yıllık tasarruf")
# --- MAKRO ---
metrics["macro.usdtry_start"] = M(44.5, "TL/USD", "44,50", "USD/TRY başlangıç (Tem 2026)", "model-v9-15")
metrics["macro.usdtry_2026"] = M(51.09, "TL/USD", "51,09", "USD/TRY yıl sonu 2026", "model-v9-15")
metrics["macro.usdtry_2027"] = M(56.0, "TL/USD", "56,00", "USD/TRY yıl sonu 2027", "model-v9-15")
metrics["macro.min_wage_net_2026"] = M(28075.5, "TRY/ay", "28.075,5 ₺", "2026 net asgari ücret", "model-v9-15")
metrics["macro.employer_multiplier"] = M(1.34, "x", "1,34×", "İşveren maliyeti çarpanı (SGK+işsizlik)", "model-v9-15")
# --- CPO ÇALIŞMA MODELİ ---
metrics["cpo.salary_usd"] = M(7500, "USD/ay", "$7.500", "CPO aylık sabit maaş (plan baz)", "model-v9-15")
metrics["cpo.salary_try"] = M(350000, "TRY/ay", "350.000 ₺/ay", "CPO maaş TL karşılığı (Tem-Ara 2026 sabit)", "model-v9-15")
metrics["cpo.car"] = M("Škoda Superb", "vehicle", "Škoda Superb", "CPO araç tahsisi (rica; karar yatırımcıda)")
# --- RAKİP ---
metrics["competitor.sahibinden_visitors"] = M(519000000, "ziyaretçi", "519 milyon", "sahibinden yıllık ziyaretçi (retorik)", note="revenue.median (519M ₺) ile aynı rakam ama FARKLI birim/anlam — ziyaretçi vs gelir.")
metrics["competitor.sahibinden_commission"] = M(2400000000, "TRY", "~2,4 milyar ₺", "sahibinden'in vazgeçemeyeceği yıllık ilan komisyonu")

metrics_doc = env("metrics", "shared",
    description="Tüm kanonik rakamların tek kaynağı. Bölümler {{metric:<key>}} ile referans verir; sayı asla bölüm içinde elle tekrarlanmaz.",
    count=len(metrics), metrics=metrics)
reg("shared/metrics.json", metrics_doc)

# ============================================================
# SHARED · DESIGN TOKENS (radius-audit + rapor3 renk paleti)
# ============================================================
design = env("design-tokens", "shared",
    theme={"mode": "dark", "mood": "sıcak (warm brown)", "uiStyle": "minimalist · flat · shadcn/Flowbite estetiği"},
    color={
        "bg-1": "#1a1410", "bg-2": "#241a12", "bg-3": "#2c2017", "bg-4": "#34261b",
        "soil-deep": "#0f0a07",
        "grass": "#7cb342", "grass-deep": "#5a8a2e",
        "gold": "#cc9900",
        "warn": "#e2723a",
        "t1": "#f5efe6", "t2": "#cabfae", "t3": "#9a8d78", "t4": "#6b6052",
        "line-1": "rgba(255,255,255,.06)", "line-2": "rgba(255,255,255,.10)", "line-3": "rgba(255,255,255,.16)"
    },
    colorRoles={"primary": "#ffffff (beyaz)", "accent": "#7cb342 (çimen yeşili · büyüme/tarım)",
                "secondary": "#cc9900 (altın · değer saklama)", "warn": "#e2723a (uyarı · risk/kapanış)"},
    glassTokens=["--glass-blur", "--glass-blur-strong", "--glass-bg-1", "--glass-bg-2", "--glass-bg-3",
                 "--glass-edge", "--glass-edge-hi", "--glass-spec", "--glass-shade"],
    radius={"root": "1rem", "shell": "1rem", "surface": ".75rem", "control": ".5rem",
            "micro": ".25rem", "chip": "9999px", "dot": "50%", "cornerSmoothing": "0.6"},
    radiusInnerHelper={
        "formula": "radiusInner(outer, padding) = max(outer - padding, 0)",
        "rule": "İç içe köşelerde iç radius = dış radius − padding (concentric nesting).",
        "cssVars": ["--radius-inner-shell-1_75", "--radius-inner-shell-2_25", "--radius-inner-shell-2_5"]
    },
    typography={"family": "Roboto", "weights": [300, 400, 500], "minSize": "1.5rem (24px)",
                "h1Max": "4rem", "border": "0.5px", "shadow": "none"},
    spacing={"card": "1.75–2.5rem", "banner": "2.5rem 1.5rem", "btn": "1rem 1.75rem (min-height 56px)",
             "pill": ".625rem 1.125rem", "chartBox": "1rem"},
    motion={"ease": "var(--ease)"},
    backgrounds={"bg-1": "en koyu", "bg-2": "", "bg-3": "", "bg-4": "en açık", "sec-bg-end": "kapanış"},
    note="Değerler arsam-pitch.html :root + docs/radius-audit.md FAZ 1 token katmanından alınmıştır. t1-t4 ve line-* yaklaşık eşleştirmedir; ham hex yalnız bg-1/bg-4/soil-deep/grass/gold/warn için belgelenmiştir."
)
reg("shared/design-tokens.json", design)

# ============================================================
# RECONCILIATION (kaynaklar arası farklar + kanonik karar)
# ============================================================
reconciliation = env("reconciliation", "meta",
    description="İki pitch sürümü (arsam-pitch.html = güncel/8 bölüm, code2 = 15 bölüm) ve Excel modeli arasındaki rakam/ifade farkları ve verilen kanonik kararlar.",
    items=[
        {"topic": "Sermaye çerçevesi", "values": {"arsam-pitch": "15M cep + 34M operasyon = 49M toplam harcanır",
            "code2/excel": "40M başlangıç sermayesi = 15M (başabaşa) + 25M (yedek)"},
            "decision": "İkisi farklı metrik olarak korundu. investor_pocket=15M (iki kaynakta da aynı) ortak çıpa. total_raised=40M (model), lifetime_spend=49M (güncel anlatı).",
            "canonical": ["capital.investor_pocket", "capital.total_raised", "capital.lifetime_spend"]},
        {"topic": "Teknopark 2027 tasarrufu", "values": {"arsam-pitch": "~131 milyon ₺", "code2": "~115 milyon ₺ (389M net × %25 + personel)"},
            "decision": "131M kanonik başlık; 115M muhafazakar türev olarak not edildi.", "canonical": ["tax.saving_2027"]},
        {"topic": "Strateji model toplamı", "values": {"code2/pazarlama": "470 (130+130+210)", "arsam-pitch": "14 listelenen + 468 = 482"},
            "decision": "470 kanonik. '+N daha' ifadesi 470 − gösterilen olarak türetilir.", "canonical": ["strategy.total_models"]},
        {"topic": "Programatik SEO sayfa sayısı", "values": {"code2": "~448.000 (81×922×6)", "arsam-pitch": "4.865 ilçe sayfası"},
            "decision": "448.000 kanonik (tam programatik). 4.865 ilçe-bazlı eski türev olarak not.", "canonical": ["strategy.seo_pages"]},
        {"topic": "Maksimum kadro", "values": {"model 2032": "149 kişi", "eski s06 yorumu": "256"},
            "decision": "149 kanonik (model DASHBOARD).", "canonical": ["fin.headcount_2032"]},
        {"topic": "Pazar çerçevesi", "values": {"arsam-pitch": "işlem adedi (2024 TKGM/TÜİK)", "code2/excel": "₺ değer hunisi TAM/SAM/SOM (2025)"},
            "decision": "İkisi tamamlayıcı görünüm olarak korundu; medyan gelir 519M her ikisinde tutarlı.",
            "canonical": ["revenue.median"]},
        {"topic": "Kötümser gelir", "values": {"arsam-pitch": "259M (%5)", "senaryo kartı": "260M"},
            "decision": "259M kanonik; 260M yuvarlama.", "canonical": ["revenue.pessimist"]},
        {"topic": "Pazar payı yüzde etiketleri", "values": {"hedef pay": "%5 / %10 (online arsa SOM payı)", "senaryo": "%0,75 / %1,5 / %2,4 (toplam pazar)", "take rate": "%1,5"},
            "decision": "Gelir rakamları kanonik; yüzde etiketleri kendi tanımına göre korundu, bölümlerde bağlamıyla yazıldı.", "canonical": ["market.take_rate"]},
        {"topic": "Model iç tutarsızlıkları (rapor2)", "values": {"gözlem": "GELİR SENARYOSU gerçekleşen pay SOM'u ~2× aşıyor; plateau 5.000 arsa ilanı düşük; ilan başı 14.200₺/ay yüksek; DASHBOARD TAM/SOM hücreleri kopuk; #VALUE! hataları"},
            "decision": "data/financial-model.json içinde 'knownIssues' olarak belgelendi; pitch rakamları muhafazakar başlık olarak kullanıldı.", "canonical": []}
    ]
)
reg("reconciliation.json", reconciliation)

# ============================================================
# BÖLÜM ALTYAPISI · tipli bloklar (TS discriminated-union dostu)
# ============================================================
def b(type_, **kw): kw["type"] = type_; return kw
def eyebrow(t): return b("eyebrow", text=t)
def heading(level, t, accent=None): return b("heading", level=level, text=t, accent=accent)
def para(t): return b("paragraph", text=t)
def lead(t): return b("lead", text=t)
def stat(label, ref=None, value=None, unit=None, tone=None, sub=None):
    d = b("stat", label=label, tone=tone)
    if ref: d["valueRef"] = ref
    if value is not None: d["value"] = value
    if unit: d["unit"] = unit
    if sub: d["sub"] = sub
    return d
def statGrid(cols, items): return b("statGrid", cols=cols, items=items)
def card(title, body=None, eyebrow=None, tone=None, value=None, valueRef=None):
    d = b("card", title=title, tone=tone)
    if body: d["body"] = body
    if eyebrow: d["eyebrow"] = eyebrow
    if value is not None: d["value"] = value
    if valueRef: d["valueRef"] = valueRef
    return d
def cardGrid(cols, items): return b("cardGrid", cols=cols, items=items)
def listb(items, ordered=False): return b("list", ordered=ordered, items=items)
def li(title, body=None, num=None):
    d = {"title": title}
    if body: d["body"] = body
    if num: d["num"] = num
    return d
def table(columns, rows): return b("table", columns=columns, rows=rows)
def timeline(items): return b("timeline", items=items)
def funnel(rows): return b("funnel", rows=rows)
def pills(items): return b("pillRow", items=items)
def quote(t, cite=None): return b("quote", text=t, cite=cite)
def cta(label, action, meta=None): return b("cta", label=label, action=action, meta=meta)
def chart(chartType, dataRef, caption=None, **extra): return b("chart", chartType=chartType, dataRef=dataRef, caption=caption, **extra)
def note(t, tone="info"): return b("note", text=t, tone=tone)

REF_RE = re.compile(r"\{\{metric:([a-zA-Z0-9_.]+)\}\}")
def collect_metric_refs(blocks):
    found = set()
    def walk(x):
        if isinstance(x, dict):
            if "valueRef" in x and isinstance(x["valueRef"], str): found.add(x["valueRef"])
            for v in x.values(): walk(v)
        elif isinstance(x, list):
            for v in x: walk(v)
        elif isinstance(x, str):
            for m in REF_RE.findall(x): found.add(m)
    walk(blocks)
    return sorted(found)

SECTIONS = []
def section(order, slug, nav_num, nav_label, background, title, blocks, refs=None):
    refs = refs or {}
    refs.setdefault("metrics", collect_metric_refs(blocks))
    refs["metrics"] = sorted(set(refs["metrics"]) | set(collect_metric_refs(blocks)))
    doc = env(slug, "section", order=order, slug=slug,
              nav={"num": nav_num, "label": nav_label}, background=background,
              title=title, blocks=blocks, refs=refs)
    SECTIONS.append((order, slug, doc))
    reg("sections/%02d-%s.json" % (order, slug), doc)

# NOT: title = sayısız kısa önizleme etiketi (manifest/nav/SEO). Render edilen sayılar
# yalnızca blok içinde {{metric:}} token'ı veya valueRef ile gelir — böylece tek kaynak korunur.

# ---------- 01 · HERO ----------
section(1, "hero", "01", "Hero", "bg-1",
    {"text": "Türkiye'nin ilk dikey arsa pazaryeri", "accent": "dikey arsa pazaryeri"},
    [
        eyebrow("arsam.net · 01 / 16"),
        heading(1, "Türkiye'nin ilk dikey arsa pazaryeri.", accent="dikey arsa pazaryeri"),
        lead("sahibinden yatay; biz dikey. arsa, tarla, bağ, çiftlik, hisseli, hobi bahçesi. Tek kategoride hâkim."),
        para("İsmail · CPO · Şubat 2026"),
        b("scrollHint", label="başla")
    ], refs={"shared": ["brand"]})

# ---------- 02 · PROBLEM ----------
section(2, "problem", "02", "Problem", "bg-2",
    {"text": "Arsa almak tehlikeli", "accent": "tehlikeli"},
    [
        eyebrow("problem · 02 / 16"),
        heading(2, "Arsa almak tehlikeli.", accent="tehlikeli"),
        lead("Sahte ilan, kapora dolandırıcılığı, fiyat dağınıklığı. Mevcut platformlar arsa için tasarlanmadı."),
        cardGrid(2, [
            card("Aynı parsel, üç farklı ilan, üç farklı fiyat.", "m² fiyatı 1.000 ile 4.000 ₺ arası gezen aynı bölge. Emsal yok, doğrulama yok.", eyebrow="sahte ilan", tone="warn"),
            card("Para alınır, satıcı kaybolur.", "Tapu öncesi güven boşluğu. Emanet hesap yok, iade mekanizması yok.", eyebrow="kapora dolandırıcılığı", tone="warn"),
            card("EİDS zorunluluğu başladı.", "Elektronik ilan doğrulama artık yasal şart. Mevcut platformlar uyumsuz; idari ceza riski yüksek.", eyebrow="regülasyon · Şub 2026", tone="warn"),
            card("Arsa, evin yanına atılmış kategori.", "İmar durumu, kadastro, jeoloji, drone tur — hiçbiri standart değil. Arsa-spesifik araç yok.", eyebrow="kategori körlüğü", tone="warn")
        ])
    ], refs={"shared": ["glossary"], "glossary": ["EİDS"]})

# ---------- 03 · PAZAR ----------
section(3, "pazar", "03", "Pazar", "bg-3",
    {"text": "Erişilmemiş dikey pazar", "accent": "Erişilmemiş"},
    [
        eyebrow("pazar · 03 / 16"),
        heading(2, "{{metric:market.tam_try}} erişilmemiş dikey.", accent="erişilmemiş"),
        lead("Türkiye yıllık {{metric:market.land_tx_annual}} arsa işlemi. Ortalama değer {{metric:market.avg_land_value}}. Dijital penetrasyon henüz {{metric:market.online_penetration}}."),
        para("2024'te Türkiye'de toplam taşınmaz satış adedi · TKGM 2024 · TÜİK 2024"),
        statGrid(2, [
            stat("toplam taşınmaz · TKGM 2024", ref="market.total_realestate_2024"),
            stat("arsa + tarla + ticari · arsam.net direkt pazarı", ref="market.land_commercial_2024", tone="accent"),
            stat("konut · TÜİK 2024", ref="market.housing_2024"),
            stat("günlük ortalama tapu devri", ref="market.daily_transfers", sub="{{metric:market.monthly_transfers}} / ay")
        ]),
        heading(3, "Değer hunisi · TAM / SAM / SOM"),
        statGrid(2, [
            stat("TAM · toplam pazar", ref="market.tam_try", tone="gold", sub="yıllık arsa işlemi × ortalama değer"),
            stat("SAM · dijitale açık pay", ref="market.sam_try", tone="accent", sub="{{metric:market.online_penetration}} online penetrasyon")
        ]),
        heading(3, "Hedeflediğimiz pazar payı"),
        statGrid(2, [
            stat("Kötümser senaryo · %5 pazar payı", ref="revenue.pessimist", tone="warn"),
            stat("Medyan senaryo · %10 pazar payı", ref="revenue.median", tone="gold")
        ]),
        heading(3, "Trafik karması · gelir karması"),
        lead("Reklam yatırımı arsa + arazi + tarla'ya. Gelen trafik konut + dükkan kategorilerinde de değer üretir."),
        cardGrid(2, [
            card("Arsa · arazi · tarla", "Reklam bütçesi buraya. Düşük rekabet, düşük CPC, yüksek satın alma niyeti — birim CAC arsa segmentinde sektör ortalamasının üçte biri.", eyebrow="%80", tone="accent"),
            card("Konut · dükkan · işyeri", "Sıfır CAC ile gelen ek katmanlar. Aynı kullanıcı, aynı pazaryeri — cross-sell oranı %38, müşteri yaşam değeri 4,7×.", eyebrow="%20", tone="gold")
        ]),
        heading(3, "Üç senaryo · yıllık gelir"),
        chart("funnel", "market-tam-sam-som", "Hedef pazar köprüsü · üç senaryo"),
        cardGrid(3, [
            card("Kötümser", "Pazar payı %0,75 · CAC 2× · 2027 baz alınır", eyebrow="senaryo", tone="warn", valueRef="revenue.pessimist"),
            card("Medyan", "Pazar payı {{metric:market.take_rate}} · plan baz · finansal modelin temeli", eyebrow="senaryo", tone="gold", valueRef="revenue.median"),
            card("İyimser", "Pazar payı %2,4 · diaspora dahil · kanal ortaklıkları aktif", eyebrow="senaryo", tone="accent", valueRef="revenue.optimist")
        ]),
        note("Kaynaklar: TKGM 2024 taşınmaz satış istatistikleri · TÜİK Konut Satış İstatistikleri 2024 · Online emlak pazar payı: GYODER & Webrazzi 2024 sektör tahminleri.")
    ], refs={"shared": ["sources", "glossary"], "sources": ["tkgm-2024", "tuik-2024", "gyoder-webrazzi"],
             "data": ["market-tam-sam-som"], "glossary": ["TAM", "SAM", "SOM", "CAC", "LTV"]})

# ---------- 04 · ÜRÜN ----------
section(4, "urun", "04", "Ürün", "bg-4",
    {"text": "Arsa için tasarlanmış platform", "accent": "tasarlanmış"},
    [
        eyebrow("ürün · 04 / 16"),
        heading(2, "Arsa için tasarlanmış platform.", accent="tasarlanmış"),
        lead("sahibinden'de bulunmayan beş katman. Her biri güven üreten, her biri ayrı ücretlendirme imkânı."),
        listb(ordered=True, items=[
            li("Tapu doğrulama", "EİDS entegre. Her ilan tapu kayıtlarıyla eşlenmiş. Sahte ilan sıfır.", num="T"),
            li("Drone tur", "Premium ilanlara ücretsiz drone keşif. Arsa fotoğrafçılığı çözümlü.", num="D"),
            li("Emsal fiyat grafiği", "Aynı parsel için bölgesel m² geçmişi. Fiyat dağınıklığı şeffaflıkla çözülür.", num="F"),
            li("İnteraktif harita", "Kadastro + imar + jeoloji katmanları. Tek ekranda arsanın tüm hikâyesi.", num="H"),
            li("Emanet ödeme", "Tapu transferine kadar bedel arsam.net'te. Kapora kaybolmaz.", num="E")
        ])
    ], refs={"glossary": ["EİDS", "TAKBİS"]})

# ---------- 05 · İŞ MODELİ ----------
section(5, "model", "05", "Model", "bg-1",
    {"text": "İlan reklamı. Komisyon yok.", "accent": "komisyon yok"},
    [
        eyebrow("iş modeli · 05 / 16"),
        heading(2, "İlan reklamı. Komisyon yok.", accent="komisyon yok"),
        lead("sahibinden yıllık komisyon baskısıyla satıcı kaybediyor. Biz reklam modeliyle satıcının yanındayız."),
        statGrid(4, [
            stat("premium yıllık", ref="pricing.premium_annual"),
            stat("vitrin slot", ref="pricing.vitrin_monthly"),
            stat("başlangıç paketi", ref="pricing.starter_monthly"),
            stat("doping · öne çıkar", ref="pricing.doping_per")
        ]),
        note("Satılırsa komisyon yok. arsam.net satışın değil, ilanın platformu.", tone="accent")
    ], refs={"data": ["financial-model"]})

# ---------- 06 · STRATEJİ (manifesto) ----------
section(6, "strateji", "06", "Strateji", "bg-2",
    {"text": "Asimetrik komando", "accent": "tek bir gerillayla"},
    [
        eyebrow("strateji · 06 / 16"),
        quote("sahibinden {{metric:competitor.sahibinden_visitors}} ziyaretçiyle gelir. Biz tek bir gerillayla giriyoruz."),
        heading(1, "sahibinden {{metric:competitor.sahibinden_visitors}} ziyaretçiyle gelir. Biz tek bir gerillayla giriyoruz.", accent="tek bir gerillayla"),
        lead("Klasik gerilla pazarlama, Levinson'un 1984 kitabıdır — ucuz reklamcılığın küçük versiyonu. Bizim 2026 paradigmamız farklı: tek bir gerilla, bir komando timini yok edecek silahla donatılır. Rakibin büyüklüğü hızsızlığa, geniş kategorisi odak kaybına, marka kabuğu atalet ivmesine dönüşür."),
        para("guerilla marketing klasik kaldı. Asimetrik komando, rakibin ağırlığını silaha çevirir."),
        b("scrollHint", label="cephaneye in")
    ], refs={"shared": ["sources"], "sources": ["levinson-1984"], "data": ["strategy-arsenal"]})

# ---------- 07 · CEPHANE ----------
section(7, "cephane", "07", "Cephane", "bg-3",
    {"text": "Seçilmiş silahlar", "accent": "silahlar"},
    [
        eyebrow("cephane · 07 / 16"),
        heading(2, "{{metric:strategy.total_models}}den {{metric:strategy.hero_weapons}}.", accent="silah"),
        lead("Her biri rakibin kopyalayamayacağı. Çünkü kopyalamak kendi modelini öldürmek."),
        chart("weaponGrid", "strategy-arsenal", caption="Altı hero silah · detay strategy-arsenal verisinde"),
        b("fomoVeil", big="+ {{metric:strategy.total_models}} envanterinden seçilmiş silahlar; kalan görüşmede.",
          sub="Tamamı {{metric:strategy.manifesto_items}}lik manifesto altında. Ulusal kampanya öncesi sadece yatırımcı görüşmesinde."),
        note("Peki bu silahlar pazar payına nasıl dönüşüyor? sahibinden'in %68 hâkim payı altında %10 SOM'a giden mantık zinciri sonraki bölümde.")
    ], refs={"data": ["strategy-arsenal"], "glossary": ["Counter-Positioning", "Atomic Network", "Programmatic SEO", "Memetic Warfare", "Status as a Service", "Trojan Horse"]})

# ---------- 08 · KÖPRÜ ----------
section(8, "kopru", "08", "Köprü", "bg-4",
    {"text": "TAM'dan SOM'a mantık zinciri", "accent": "SOM'a"},
    [
        eyebrow("köprü · 08 / 16"),
        heading(2, "TAM'dan SOM'a mantık zinciri.", accent="SOM'a"),
        lead("TAM hayal; SOM taahhüt. {{metric:strategy.hero_weapons}} ikisinin köprüsü."),
        funnel([
            {"key": "TAM · toplam pazar", "valueRef": "market.tam_try", "desc": "yıllık arsa işlemi × ortalama değer · TÜİK", "width": 1.0},
            {"key": "SAM · dijitale açık pay", "valueRef": "market.sam_try", "desc": "{{metric:market.online_penetration}} online penetrasyon", "width": 0.187},
            {"key": "SOM · elde edilebilir pay", "valueRef": "market.som_try", "desc": "SAM'ın %10'u · sahibinden'in arsa boşluğu", "width": 0.10, "tone": "accent"},
            {"key": "yıllık gelir potansiyeli", "valueRef": "revenue.median", "desc": "SOM × {{metric:market.take_rate}} ilan-reklam oranı", "width": 0.015, "tone": "gold"}
        ]),
        note("Köprü: Counter-Positioning karşı saldırıyı imkânsız kılar. Atomic Network 81 ili tek tek doyurur. Programmatic SEO CAC'ı sıfıra çeker. Status as a Service tedarikçi kaynağını kilitler. Memetic Warfare ulusal kampanya gerektirmeden farkındalık üretir. Trojan Horse rakibin sitesini bile dağıtım kanalı yapar.")
    ], refs={"shared": ["glossary"], "glossary": ["TAM", "SAM", "SOM", "take rate"], "data": ["market-tam-sam-som"]})

# ---------- 09 · BOOTSTRAP ----------
section(9, "bootstrap", "09", "Bootstrap", "bg-1",
    {"text": "Bootstrap · kontrollü yakım", "accent": "kontrollü yakım"},
    [
        eyebrow("başabaş · 09 / 16"),
        heading(2, "{{metric:capital.investor_pocket}}. Sonra makine kendi enerjisini üretir.", accent="kendi enerjisini üretir"),
        lead("Klasik startup'ın 30-50M $'lık burn rate'i yok. Risk belirsiz değil — ölçülmüş, sınırlı."),
        b("feature", title="başabaş — operasyonel", valueRef="capital.breakeven_spend",
          desc="18. ay ({{metric:fin.breakeven_month}}) itibarıyla aylık gelir, aylık gideri karşılıyor. Bu noktadan sonra net pozitif.",
          items=[
            li("Personel · maaş + sigorta + ikramiye", num="01"),
            li("CPO araç tahsisi", num="02"),
            li("Ofis kurulumu + sabit gider", num="03"),
            li("Dijital pazarlama bütçesi", num="04"),
            li("AI + yazılım altyapısı", num="05"),
            li("Hukuk + danışmanlık + sertifikasyon", num="06")
          ]),
        statGrid(3, [
            stat("başlangıç sermayesi", ref="capital.total_raised", sub="finansal modelin tabanı · ilk kurulum + ilk {{metric:fin.breakeven_months}}"),
            stat("başabaşa kadar harcanacak", ref="capital.breakeven_spend", tone="gold", sub="altı ana kalem dahil, tam yüklü hesap"),
            stat("başabaş sonrası kasada", ref="capital.reserve", tone="accent", sub="2027 ulusal kampanyaya kadar yedek")
        ]),
        timeline([
            {"when": "Tem 2026", "what": "yazılım hazır · soft launch · ilk 100 ilan", "state": "done"},
            {"when": "Ara 2026", "what": "{{metric:fin.headcount_2026}} · 1,4M ₺ kümülatif gelir", "state": "done"},
            {"when": "{{metric:fin.breakeven_month}} · başabaş", "what": "aylık gelir > aylık gider · {{metric:capital.breakeven_spend}} harcandı · makine kendi enerjisini üretir", "state": "now"},
            {"when": "Ara 2027", "what": "{{metric:fin.headcount_2027}} · {{metric:fin.revenue_2027}} yıllık gelir · ulusal kampanya başlar", "state": "next"}
        ]),
        note("Webvan 830M $'la battı çünkü ürün-pazar uyumu kanıtlanmadan ölçeklendi. Biz tersine: {{metric:capital.breakeven_spend}}'lik kontrollü yakım, sonra kâr ile büyüme.")
    ], refs={"data": ["financial-model"]})

# ---------- 10 · TEKNOPARK ----------
section(10, "teknopark", "10", "Teknopark", "bg-2",
    {"text": "Mecidiyeköy değil İTÜ ARI", "accent": "İTÜ ARI"},
    [
        eyebrow("teknopark · 4691 · 10 / 16"),
        heading(2, "Eğer şirketi teknopark'ta açarsak, {{metric:tax.saving_2027}} ilk yıl vergi tasarrufu.", accent="vergi tasarrufu"),
        lead("Kira benzer. Vergi sıfır. 4691 sayılı kanun, yazılım kazançlarını {{metric:tax.valid_until}}'e kadar kurumlar vergisinden istisna tutar."),
        pills(["İstanbul Aydın Üni.", "Zaim Üni.", "Entertech İstanbul Teknokent", "YTÜ Yıldız Teknopark",
               "İTÜ ARI Teknokent", "ODTÜ Teknokent", "Teknopark İstanbul", "Hacettepe Teknokent",
               "Cyberpark Bilkent", "Sabancı Teknopark", "Marmara Teknopark"]),
        statGrid(3, [
            stat("Kurumlar vergisi istisnası", ref="tax.corporate_rate", tone="gold"),
            stat("Gelir vergisi stopajı muafiyeti", ref="tax.income_withholding", tone="gold"),
            stat("SGK işveren payı desteği", ref="tax.sgk_employer", tone="gold")
        ]),
        b("feature", title="olgun yıllık vergi tasarrufu", valueRef="tax.saving_mature_annual",
          desc="Dört ana kalem birlikte. Ek olarak damga vergisi muafiyeti, AR-GE proje hizmetlerinde gümrük ve fon istisnası.",
          items=[
            li("Kurumlar vergisi · {{metric:tax.corporate_rate}} · münhasıran yazılım kazançları", num="01"),
            li("AR-GE personel gelir vergisi · tam istisna ({{metric:tax.income_withholding}} stopaj)", num="02"),
            li("SGK işveren payı · {{metric:tax.sgk_employer}} hazine desteği", num="03"),
            li("Yazılım satışı KDV istisnası · onaylı proje kapsamında", num="04")
          ]),
        heading(3, "EBITDA marjı · 7 yıllık etki"),
        chart("ebitda", "financial-model", caption="EBITDA marjı 7 yıllık projeksiyon"),
        cardGrid(2, [
            card("7 yıl kümülatif", "2027–2032 · 4691 no'lu kanun kapsamı · yatırım turunun {{metric:tax.investment_multiple}}ı", eyebrow="Kümülatif", tone="gold", valueRef="tax.saving_cumulative_7y"),
            card("2032 EBITDA marjı", "vergi yükü kalktığında", eyebrow="olgun", tone="gold", valueRef="tax.ebitda_2032")
        ]),
        note("Süre sınırı {{metric:tax.valid_until}} ama tarihsel olarak hep uzatıldı (2013 → 2023 → 2028 → muhtemel 2033). Model bu uzatmayı dahil etmiyor; muhafazakar varsayım altında bile 2027-2028 iki yılda {{metric:tax.saving_two_year}} garanti tasarruf.")
    ], refs={"shared": ["sources"], "sources": ["kanun-4691", "kanun-5746"], "data": ["incentives", "financial-model"], "glossary": ["4691", "EBITDA"]})

# ---------- 11 · ROADMAP + RİSK ----------
section(11, "roadmap", "11", "Roadmap · Risk", "bg-3",
    {"text": "Rakip gördüğünde ne yapar?", "accent": "gördüğünde"},
    [
        eyebrow("roadmap + risk · 11 / 16"),
        heading(2, "Sahibinden bizi farkettiğinde savunma cephanemiz hazır.", accent="savunma cephanemiz hazır"),
        lead("Her riskin yanıtı önceden çizildi. Sürpriz yok, senaryo var."),
        heading(3, "Kopyalanamaz olduğumuz alanlar"),
        cardGrid(2, [
            card("Sahibinden kendi gelirini öldüremez.", "Modelimizi kopyalamak için yıllık {{metric:competitor.sahibinden_commission}} ilan komisyonundan vazgeçmek zorunda. Yapısal tuzak.", eyebrow="01 · Komisyonsuz model", tone="accent"),
            card("Genel emlak ≠ arsa uzmanlığı.", "TAKBİS API, drone, imar AI, parsel sınır overlay — yatay platformlar bu derinliğe inerse kendi konfor alanlarını bozar.", eyebrow="02 · Dikey pazaryeri", tone="accent"),
            card("Tek ilçe, tam doygunluk.", "Söke + Bodrum + Aydın'da %60+ pazar payı. Ulusal oyuncunun zaman matematiği tutmaz.", eyebrow="03 · Atomik ağ", tone="accent"),
            card("Resmi entegrasyon, bürokratik moat.", "TAKBİS resmi API entegrasyonu ~14 ay onay süreci. Bu süreçte biz pazarı kuruyor olacağız.", eyebrow="04 · Tapu doğrulama", tone="accent"),
            card("Türkiye dışından alıcı havuzu.", "Berlin, Köln, KKTC, Bakü ofis ağı. €/TRY arbitrajıyla doğal moat.", eyebrow="05 · Diaspora kanalı", tone="accent"),
            card("{{metric:team.lean}}, 700 kişiyi yener.", "Biz bir günde test edip yayına alırız. Karar hızı = kapatılamayacak uçurum.", eyebrow="06 · Hız asimetrisi", tone="accent")
        ]),
        heading(3, "12 ay · dört dönüm"),
        cardGrid(2, [
            card("Kuruluş + atomik ağ", "A.Ş. tescili · Söke pilot · 100 satıcı.", eyebrow="Q3 2026"),
            card("Ulusal lansman", "81 il · 5.000 ilan hedefi.", eyebrow="Q4 2026"),
            card("Operasyonel başabaş", "Aylık gelir > gider · {{metric:fin.headcount_2027}}.", eyebrow="H1 2027"),
            card("Diaspora yayılımı", "Berlin · Köln · Lefkoşa · Bakü.", eyebrow="2028+")
        ]),
        heading(3, "Risk · yanıt"),
        table(["Risk", "Seviye", "Yanıt"], [
            ["Sahibinden agresif reklamı / tepki", "Yüksek", "Counter-positioning · komisyon modelini bırakamaz (gelirinin ~%30'u); taklit kendi ekonomisini bozar"],
            ["EİDS / SPK ek regülasyon", "Orta", "Tapu doğrulama ilk günden EİDS uyumlu; ek katman bizim avantajımıza"],
            ["Tedarikçi kaynağı kuruması (cold-start)", "Orta", "Mevcut arsa stoğu seed · ilk 1000 satıcıya kurucu rozeti + ücretsiz drone"],
            ["USD/TRY kur volatilitesi", "Düşük", "USD bazlı maliyet OPEX'in %18'i · hibrit AI altyapı · %20 cap"],
            ["Avrupa diaspora kaybı", "Düşük", "'Toprağını geri al' anlatısı + dil katmanları (DE, NL, FR) + SEPA/IBAN"]
        ])
    ], refs={"glossary": ["EİDS", "TAKBİS", "Counter-Positioning"]})

# ---------- 12 · REKABET ----------
section(12, "rekabet", "12", "Rekabet", "bg-4",
    {"text": "Sadece biz dikey + küratoryal", "accent": "dikey + küratoryal"},
    [
        eyebrow("rekabet · 12 / 16"),
        heading(2, "Sadece biz dikey + küratoryal.", accent="dikey + küratoryal"),
        lead("Konumlanma haritası. İki eksen: kategori (yatay/dikey), kalite (açık/küratoryal). Tek başına bir kadrandayız."),
        table(["Oyuncu", "Konum", "Arsa odaklı", "Tapu doğrulama", "Drone tur", "Model"], [
            ["sahibinden", "yatay · açık", "hayır", "kısmi", "hayır", "komisyon + ilan"],
            ["hepsiemlak", "yatay · açık", "hayır", "hayır", "hayır", "ilan + emlakçı"],
            ["emlakjet", "yatay · küratoryal kısmi", "hayır", "kısmi", "hayır", "ilan"],
            ["arsam.net", "dikey · küratoryal", "evet", "tam · EİDS", "premium dahil", "ilan reklamı"]
        ]),
        note("Moat: rakibin bizim kadranımıza geçmesi, kategori-genişliğini ve komisyon ekonomisini bırakması demek. 7 Powers'ın counter-positioning ilkesi: taklit, intihar olur.")
    ], refs={"shared": ["brand", "sources"], "sources": ["helmer-7powers", "rekabet-kurulu"], "glossary": ["Counter-Positioning"]})

# ---------- 13 · FİNANSAL ----------
section(13, "finansal", "13", "Finansal", "bg-1",
    {"text": "Finansal model · yedi yıl", "accent": "yedi yıl"},
    [
        eyebrow("finansal · {{metric:fin.projection_months}} · 13 / 16"),
        heading(2, "7 yıl. 7 senaryo değil, 1 plan.", accent="1 plan"),
        lead("{{metric:fin.projection_months}}lık model, 15 sayfalık excel. Ana hatlar:"),
        # Yıllık rakamlar yalnız data/financial-model.json'da yaşar; bölüm onları dataRef ile çeker (tekrar yok).
        chart("yearlyHighlights", "financial-model", caption="Yıllık gelir / gider / net / kadro / nakit",
              field="yearly", highlightYears=["2026 H2", "2027", "2028", "2032"],
              columns=["revenue", "expense", "net", "headcount", "cashEnd"]),
        chart("cashTeam", "financial-model", caption="Nakit + kadro · {{metric:fin.projection_months}}", field="yearly"),
        note("Kâr marjı 2027'den itibaren {{metric:fin.profit_margin_min}}. İlan reklam modelinde marjinal maliyet sıfıra yaklaşır; ek ilan ek maliyetsiz gelir.")
    ], refs={"shared": ["sources"], "sources": ["model-v9-15"], "data": ["financial-model", "hr-plan"]})

# ---------- 14 · CPO ÇALIŞMA MODELİ ----------
section(14, "cpo", "14", "CPO Modeli", "bg-2",
    {"text": "Tam odak için iki şart", "accent": "iki şart"},
    [
        eyebrow("CPO · çalışma modeli · 14 / 16"),
        heading(2, "Tam odak için iki şart.", accent="iki şart"),
        lead("Şeffaf olmayı tercih ediyorum. Çalışma şartlarım iki maddeden ibaret."),
        statGrid(2, [
            stat("Aylık sabit maaş · plan baz", ref="cpo.salary_usd", tone="accent", sub="USD / ay"),
            stat("Araç tahsisi", ref="cpo.car", tone="gold", sub="veya benzer segment bir araç")
        ]),
        note("Bu projeye tam odaklanmam, mevcut işlerimden tamamen ayrılmam anlamına gelir. Bu adımdan sonra tek gelirim bu projeden olacak; mevcut aracımı da şirkete devrediyorum. Bir araç tahsisini açıkça rica ediyorum. Maaş plan baz; araç ise bir rica — takdir sizindir.", tone="accent"),
        quote("Bu kalemler önce sunduğum tüm finansal plana zaten dahildi — yukarıdaki rakamları değiştirmiyor.")
    ], refs={"shared": ["brand"], "data": ["financial-model"]})

# ---------- 15 · YATIRIM TURU ----------
section(15, "yatirim", "15", "Yatırım", "bg-3",
    {"text": "Üç katman. Tek pencere.", "accent": "tek pencere"},
    [
        eyebrow("yatırım turu · 15 / 16"),
        heading(2, "Üç katman. Tek pencere.", accent="tek pencere"),
        lead("{{metric:window.close}} ulusal kampanyaya kadar açık. Sonra valuation katlanır, koşullar sertleşir."),
        cardGrid(3, [
            card("çekirdek", "2 dev · 1 designer · 6 ay runway · Söke + Bodrum atomik ağ", eyebrow="{{metric:invest.seed_equity}} hisse · {{metric:invest.seed_valuation}} valuation", valueRef="invest.seed_amount"),
            card("stratejik · önerilen", "başabaşa tam yükleme · CPO araç + 6 kalem · programmatic SEO motoru · ilk 1000 kurucu satıcı kampanyası", eyebrow="{{metric:invest.strategic_equity}} hisse · {{metric:invest.strategic_valuation}} valuation", tone="gold", valueRef="invest.strategic_amount"),
            card("lider", "stratejik + yedek · 2027 ulusal kampanya yedekle finanse · yönetim kurulu koltuğu", eyebrow="{{metric:invest.lead_equity}} hisse · board seat", valueRef="invest.lead_amount")
        ]),
        note("Valuation referansı: emlakjet 2024 turu 28M $ post-money @ ~5M $ gelir. Biz {{metric:fin.projection_months}}lık projeksiyonda 4 yıl sonra {{metric:invest.revenue_multiple}}.")
    ], refs={"data": ["financial-model"]})

# ---------- 16 · KAPANIŞ (FOMO pencere + ortaklık kapanışı) ----------
section(16, "kapanis", "16", "Kapanış", "bg-end",
    {"text": "Tohum sizden, toprak bizden. Hasat ortak.", "accent": "Hasat ortak"},
    [
        eyebrow("kapanan pencere · 16 / 16"),
        heading(2, "Bu fırsat herkes için değil.", accent="herkes için"),
        lead("{{metric:window.close}}'da metro, havalimanı, maç arası kampanya başlar. O tarihten sonra erken-yatırımcı kategorisi kapanır."),
        b("crisisBox", title="bu sayfayı 5 yatırımcı daha gördü. Açık {{metric:window.slots_open}} kaldı.", cells=[
            stat("slot", ref="window.slots_open", sub="/ {{metric:window.slots_total}}", tone="warn"),
            stat("kapanma", ref="window.close", tone="gold"),
            stat("başabaş", ref="fin.breakeven_months", tone="accent")
        ]),
        b("countdown", targetRef="window.countdown_target", label="ulusal kampanyaya kalan"),
        heading(2, "Tohum sizden, toprak bizden. Hasat ortak.", accent="Hasat ortak"),
        lead("Konuşmaya kaldığımız yerden başlayalım."),
        b("ctaStack", items=[
            cta("şimdi konuş", "contact", meta="5 dk"),
            cta("direkt ara", "phone", meta="CPO")
        ]),
        para("İsmail · cpo@arsam.net · +90 532 295 10 80"),
        note("Hazırlık tamamlandı · Nisan 2026 · arsam.net")
    ], refs={"shared": ["brand"]})

print("part4 ok: bölüm 9-16 (toplam %d bölüm)" % len(SECTIONS))

# ============================================================
# DATA · FINANSAL MODEL (xlsx · 78 ay · v9-15)
# ============================================================
fin = env("financial-model", "data",
    source="model-v9-15",
    scenario="Muhafazakar",
    projection={"months": 78, "start": "2026-07", "end": "2032-12", "years": 6.5},
    yearly=[
        {"year": "2026 H2", "revenue": 1409045, "expense": 9238891, "net": -7829846, "headcount": 19, "cashEnd": 32170154},
        {"year": "2027", "revenue": 429141625, "expense": 40014053, "net": 389127572, "headcount": 63, "cashEnd": 421297726},
        {"year": "2028", "revenue": 753714895, "expense": 56595782, "net": 697119113, "headcount": 84, "cashEnd": 1118416839},
        {"year": "2029", "revenue": 837058287, "expense": 64605927, "net": 772452360, "headcount": 101, "cashEnd": 1890869199},
        {"year": "2030", "revenue": 851808419, "expense": 73198235, "net": 778610184, "headcount": 117, "cashEnd": 2669479383},
        {"year": "2031", "revenue": 862086515, "expense": 82811715, "net": 779274800, "headcount": 133, "cashEnd": 3448754183},
        {"year": "2032", "revenue": 869655899, "expense": 94030262, "net": 775625637, "headcount": 149, "cashEnd": 4224379820}
    ],
    breakeven={"operational": "2027-01", "operationalLabel": "Oca 2027",
               "investmentPayback": "Tem 2026'dan itibaren sermaye girişiyle karşılanmış (40M ₺ kümülatif)"},
    parameters={
        "usdtry": {"start_2026_07": 44.5, "end_2026": 51.09, "end_2027": 56.0},
        "inflation_monthly": {"2026_h2": 0.013, "2027_plus": 0.008},
        "corporateTax": 0.25, "vat": 0.20,
        "minWage2026": {"net": 28075.5, "gross": 33030.0, "employerMultiplier": 1.34},
        "cpoSalary": {"fixed_2026": 350000, "usd_2027_plus": [10000, 15000, 20000]},
        "officeRent_monthly": 150000, "officeDeposit_months": 3,
        "initialCapital": 40000000,
        "welcomePackagePerPerson": 5950,
        "capexFirstMonth": 2863100
    },
    pricing={"premiumAnnual": 90000, "premiumMonthlyEq": 7500, "vitrinMonthly": 3000,
             "starterMonthly": 1500, "dopingPer": 500, "premiumConversion": 0.003, "takeRate": 0.015},
    revenueLogic={
        "listingGrowth_monthly": 0.25,
        "plateau_2027_12": {"land": 5000, "realestate": 15000},
        "organicGrowth_annual": 0.03,
        "realestateMultiplier": "arsa gelirinin 1/10'u (risk hedge)"
    },
    opexGroups=["İK personel", "Ofis sabit", "Dijital altyapı (AWS/CDN/Maps API/SMS)",
                "AI & yazılım araçları", "Platform AI/Agent (Anthropic API token)", "Hukuki & idari"],
    digitalMarketing={"2026_07": 163000, "2027_12": 2290000, "2032_12": 2900000},
    legalThresholds={"isgOsgb": ">=1 çalışan (8K ₺/ay)", "isgKurulu": "50+ kişi",
                     "sozlesmeliAvukat": "A.Ş. sermayesi 1.25M ₺+", "engelliIstihdam": "%3 · 50+ kişi",
                     "calisanTemsilcisi": "2+ kişi"},
    knownIssues=[
        "GELİR SENARYOSU 'Arsa Gerçekleşen Pay' Haz 27'den 1.0+, Ara 30'da 2.0 — üretilen gelir SOM'u ~2× aşıyor (SOM tanım gereği aşılamaz).",
        "Plateau 5.000 arsa ilanı, sahibinden'in ~100K+ aktif ilanına göre düşük; akış (1,4M işlem) ile stok (aktif ilan) karışmış.",
        "Plateau ilan başı gelir ~14.200 ₺/ay/ilan; premium 7.500 ₺/ay ile çelişir → 519M SOM'un modelde 800-870M'ye çıkma nedeni.",
        "DASHBOARD B8 (Arsa TAM)=0, B9 (Arsa SOM) boş — TAM_SAM_SOM referansı kopuk.",
        "ÇAĞRI MERKEZİ ve YAZILIM EKİBİ sayfalarında #VALUE! hataları; İK doğrulama formülleri (R18, R21-R22) çalışmıyor."
    ],
    note="Yıllık tablo DASHBOARD sayfasından birebir. knownIssues rapor2.md analizinden; pitch'te muhafazakar başlık rakamlar kullanıldı."
)
reg("data/financial-model.json", fin)

# ============================================================
# DATA · MARKET TAM/SAM/SOM (iki görünüm + senaryolar)
# ============================================================
market = env("market-tam-sam-som", "data",
    transactionView={
        "year": 2024, "sources": ["tkgm-2024", "tuik-2024"],
        "totalRealEstate": 3065872, "landCommercial": 1587847, "housing": 1478025,
        "dailyTransfers": 8400, "monthlyTransfers": 255490
    },
    valueFunnel={
        "year": 2025, "source": "model-v9-15",
        "tam": {"value": 1850000000000, "basis": "1,4M işlem × ~1,32M ₺ ort. değer"},
        "sam": {"value": 346000000000, "basis": "TAM × %18,7 online penetrasyon"},
        "som": {"value": 34600000000, "basis": "SAM × %10 hedef pay"},
        "annualRevenuePotential": {"value": 518667093, "basis": "SOM × %1,5 take rate"},
        "onlinePenetration": 0.187, "takeRate": 0.015,
        "emlakTam": 5500000000000, "emlakTargetShare": 0.01
    },
    competitorShares={"sahibinden_land": 0.68, "sahibinden_realestate": 0.55,
                      "hepsiemlak_land": 0.12, "emlakjet_land": 0.10, "other": 0.10},
    scenarios=[
        {"id": "pessimist", "label": "Kötümser", "revenue": 259000000, "revenueRounded": 260000000,
         "shareLabel": "%5 (online arsa) / %0,75 (toplam)", "note": "CAC 2× · 2027 baz"},
        {"id": "median", "label": "Medyan", "revenue": 519000000,
         "shareLabel": "%10 (online arsa) / %1,5 (take rate)", "note": "plan baz · finansal modelin temeli"},
        {"id": "optimist", "label": "İyimser", "revenue": 823000000,
         "shareLabel": "%2,4 (toplam)", "note": "diaspora dahil · kanal ortaklıkları aktif"}
    ],
    trafficMix={"land": {"share": 0.80, "note": "reklam bütçesi · düşük CAC · CAC sektörün 1/3'ü"},
                "realestate": {"share": 0.20, "note": "sıfır CAC · cross-sell %38 · LTV 4,7×"}},
    crossCategoryEvidence=["Zillow rental→sales ilk yıl %8 cross-sell", "Trendyol moda→elektronik ilk yıl %12",
                           "1/10 çarpanı sektör ortalamasının alt bandı — muhafazakar"]
)
reg("data/market-tam-sam-som.json", market)

# ============================================================
# DATA · İK PLANI + TAKIMLAR + AI VERİMLİLİK
# ============================================================
hr = env("hr-plan", "data",
    source="model-v9-15",
    headcountGrowth=[{"year": "2026 H2", "count": 19}, {"year": "2027", "count": 63}, {"year": "2028", "count": 84},
                     {"year": "2029", "count": 101}, {"year": "2030", "count": 117}, {"year": "2031", "count": 133}, {"year": "2032", "count": 149}],
    positionsModeled=152,
    jobFamilies=["Engineering & Platform", "Product / UX / Program", "Marketing / Growth / CRM",
                 "Customer & Seller Support / CX", "Finance / Legal / Corporate", "People / HR / Talent",
                 "Data / AI / Analytics", "Admin / PR / Office"],
    salaryAnchors={"netMinWage2026": 28075.5, "scale": "1.0×–3.5× asgari ücret",
                   "examples": {"CPO": "USD bazlı (≈350.000 ₺/ay)", "CMO/CRO": 250000, "ML Engineer": 70189,
                                "Senior (Lead)": 77208, "Mid": 56151, "Junior": 28076}},
    teamsSAFe={
        "ART-1 Platform": ["Backend Squad", "Frontend Squad", "Mobile Squad", "DevOps & Infra", "QA & Test", "Data / AI"],
        "ART-2 Growth": ["SEO & İçerik", "Performance Marketing", "Müşteri Deneyimi (CX)"],
        "Non-Agile": ["Hukuk & Uyum", "Finans & Muhasebe", "İnsan Kaynakları", "İdari & PR", "Ürün & Program"]
    },
    orgRules=["Ünvan = sorumluluk tanımı, statü değil", "2026'da IC ile C-Level arası max 2 katman",
              "Teknik kariyer hattı (Jr→Sr→Staff) ile yönetim hattı ayrı", "Aylık skip-level görüşme",
              "İnsan eklemek ≠ katman eklemek"],
    aiEfficiency={
        "fteWithout": 74, "fteWith": 38, "fteSaved": 36, "annualSaving": 21000000,
        "sahibindenBenchmark": "750-1000 çalışan", "target2032": "110-150 kişi → ~6-7× verimlilik",
        "departments": [
            {"dept": "Backend Dev", "without": 8, "with": 3, "tools": "GitHub Copilot, Claude Code, Cursor"},
            {"dept": "Müşteri Hizmetleri", "without": 12, "with": 5, "tools": "AI chatbot, Intercom AI"},
            {"dept": "SEO & İçerik", "without": 8, "with": 4, "tools": "SurferSEO, Jasper, ChatGPT"},
            {"dept": "QA & Test", "without": 6, "with": 3, "tools": "Testim AI, Playwright"},
            {"dept": "Frontend Dev", "without": 6, "with": 3, "tools": "v0.dev, Copilot, Bolt.new"}
        ]
    }
)
reg("data/hr-plan.json", hr)

# ============================================================
# DATA · STRATEGY ARSENAL (470 model · 5 kırılma · 6 silah · 14 strateji)
# ============================================================
arsenal = env("strategy-arsenal", "data",
    totalModels=470,
    inventory={"asymmetricHijack": 130, "communityCultMovement": 130, "productLedAiNative": 210},
    prioritizedForArsam=45, manifestoItems=14,
    radicalBreaks=[
        {"name": "Distribution = Product", "attribution": "Andrew Chen, Brian Balfour, Casey Winters"},
        {"name": "Counter-Positioning", "attribution": "Hamilton Helmer · 7 Powers", "examples": ["Netflix vs DVD", "Vanguard vs aktif fonlar"]},
        {"name": "Memetic Warfare", "examples": ["Liquid Death", "Duolingo", "Ryanair", "Cluely"]},
        {"name": "Status as a Service", "attribution": "Eugene Wei"},
        {"name": "Cold Start Theory", "attribution": "Andrew Chen"}
    ],
    heroWeapons=[
        {"idx": "01", "name": "Counter-Positioning", "tr": "karşı konumlama", "badge": "helmer",
         "body": "sahibinden komisyon-bazlı. İlan reklam modelini kopyalaması, 8M ilanlık akışı ücretsizleştirmek demek. Kazansa da kaybeder.",
         "example": "Vanguard'ın aktif fonlara, Netflix'in DVD'ye karşı yaptığı."},
        {"idx": "02", "name": "Atomic Network", "tr": "atomik ağ", "badge": "chen",
         "body": "Türkiye geneli yerine tek ilçede tam doygunluk. Söke. Bodrum. Yalova. Bir şehir kazanılır, diğerine sıçranır.",
         "example": "Facebook Harvard'da, Uber San Francisco'da."},
        {"idx": "03", "name": "Programmatic SEO", "tr": "programatik SEO", "badge": "SEO",
         "body": "81 il × 922 ilçe × 6 ilan tipi = ~448.000 sayfa. Tek şablon, dev katalog.",
         "example": "Zillow ve Zapier bu yolla milyarlarca trafik alıyor."},
        {"idx": "04", "name": "Memetic Warfare", "tr": "mem savaşı", "badge": "mem savaşı", "fomo": True,
         "body": "sahibinden TV reklamı verirken biz 'toprağını geri al' hareketinin sözcüsü oluruz. Sıfır medya alımı, milyonlarca organik gösterim.",
         "example": "Duolingo, Ryanair, Wendy's."},
        {"idx": "05", "name": "Status as a Service", "tr": "statü hizmeti", "badge": "wei", "fomo": True,
         "body": "İlk 1000 satıcı kalıcı kurucu rozeti. Numara 1/1000, 87/1000 olarak görünür. Statü sosyal sermaye olur.",
         "example": "Tinder, Clubhouse, Supreme."},
        {"idx": "06", "name": "Trojan Horse", "tr": "truva atı", "badge": "trojan", "fomo": True,
         "body": "Ücretsiz değerleme aracı + tapu sorgu widget'ı emlakçı sitelerine gömülür. Rakibin sitesi bizi taşır.",
         "example": "Airbnb Craigslist'i, Eventbrite e-postayı bu mantıkla kullandı."}
    ],
    namedStrategies=[
        {"idx": "01", "name": "Counter-Positioning", "claim": "Kopyalanamaz model."},
        {"idx": "02", "name": "Atomic Network", "claim": "Tek ilçe. Tam doygunluk."},
        {"idx": "03", "name": "Programmatic SEO", "claim": "Programatik ilçe sayfaları (~448.000)."},
        {"idx": "04", "name": "Drone Moat", "claim": "Hava görüntüsü, standart."},
        {"idx": "05", "name": "TAKBİS API", "claim": "Tapuyu kaynaktan doğrula."},
        {"idx": "06", "name": "Escrow Trust", "claim": "Kapora bize gelmez."},
        {"idx": "07", "name": "Diaspora First", "claim": "Berlin parası, Türk toprağı."},
        {"idx": "08", "name": "Bank Channel", "claim": "Banka gişesi = arsam standı."},
        {"idx": "09", "name": "İmar AI", "claim": "'Bu arsa ne yapılır?'"},
        {"idx": "10", "name": "Freemium Tier", "claim": "Listeleme bedava. Görünürlük ücretli."},
        {"idx": "11", "name": "İlçe Operatör", "claim": "Her ilçeye lokal CEO."},
        {"idx": "12", "name": "Land Storytelling", "claim": "Her arsanın bir hikâyesi."},
        {"idx": "13", "name": "Mikro Kredi Köprüsü", "claim": "Kredisi olmayana, kefil platform."},
        {"idx": "14", "name": "Üç Hatlı Ekosistem", "claim": "İlan + değerleme + tapu hizmeti."}
    ],
    note="Toplam 470 model (130+130+210). Pitch'te 6 silah detaylandırılır, 14 strateji adlandırılır. '+N daha' = 470 − gösterilen.",
    researchMeta={"sources": 195, "duration": "25m 53s", "context": "arsam.net · sahibinden rakibi · Türkiye + diaspora"}
)
reg("data/strategy-arsenal.json", arsenal)

# ============================================================
# DATA · STRATEGY FRAMEWORKS (rapor1 · iş stratejisi haritası)
# ============================================================
frameworks = env("strategy-frameworks", "data",
    description="İş stratejisi literatürü haritası (rapor1.md) — arsam.net'in konumlandığı çerçeveler.",
    categories=[
        {"name": "Klasik Konumlandırma", "models": [
            {"name": "Porter Jenerik Stratejileri", "author": "Michael Porter", "note": "maliyet liderliği / farklılaştırma / odaklanma"},
            {"name": "Değer Disiplinleri", "author": "Treacy & Wiersema"},
            {"name": "Konumlandırma", "author": "Ries & Trout"}]},
        {"name": "Yeni Pazar / Talep Yaratma", "models": [
            {"name": "Kategori Tasarımı", "author": "Play Bigger", "note": "kategori kralı pazar değerinin ~%76'sını alır"},
            {"name": "Yıkıcı İnovasyon", "author": "Clayton Christensen", "note": "Netflix vs Blockbuster"},
            {"name": "Jobs-to-be-Done", "author": "Christensen, Ulwick"}]},
        {"name": "Asimetrik / Savaş", "models": [
            {"name": "Marketing Warfare", "author": "Ries & Trout"},
            {"name": "Judo / Aikido", "author": "Yoffie & Kwak"},
            {"name": "Counter-positioning", "author": "Hamilton Helmer", "note": "Vanguard endeks fonları"}]},
        {"name": "Sürdürülebilir Avantaj (Moat)", "models": [
            {"name": "7 Powers", "author": "Hamilton Helmer", "note": "ölçek, ağ, counter-positioning, switching cost, marka, cornered resource, process power"},
            {"name": "Kirpi Konsepti", "author": "Jim Collins"},
            {"name": "Hidden Champions", "author": "Hermann Simon"}]},
        {"name": "Niş Hakimiyeti ve Yayılma", "models": [
            {"name": "Crossing the Chasm + Bowling Pin", "author": "Geoffrey Moore"},
            {"name": "Land and Expand"},
            {"name": "Long Tail", "author": "Chris Anderson"}]},
        {"name": "Platform / Ağ", "models": [
            {"name": "Platform Strategy / İki Taraflı Pazarlar", "author": "Rochet & Tirole; Eisenmann, Parker, Van Alstyne"},
            {"name": "Aggregation Theory", "author": "Ben Thompson"},
            {"name": "Freemium / Free", "author": "Chris Anderson"},
            {"name": "Product-Led Growth"}]}
    ]
)
reg("data/strategy-frameworks.json", frameworks)

# ============================================================
# DATA · INCENTIVES (devlet destekleri · 2025-2026)
# ============================================================
incentives = env("incentives", "data",
    description="Türkiye devlet destekleri, teşvikleri ve hibeleri envanteri (Nisan 2026 itibarıyla).",
    profile={"sector": "Emlak/arsa dikey pazaryeri", "model": "B2B2C ilan satış", "tech": "Django/Python",
             "location": "İstanbul", "team": "3→18 kişi", "launch": "Aralık 2026"},
    providers=["KOSGEB", "TÜBİTAK", "Sanayi ve Teknoloji Bakanlığı", "Ticaret Bakanlığı",
               "Hazine ve Maliye Bakanlığı", "İŞKUR", "SGK", "Kalkınma Ajansları", "TÜRKPATENT", "AB Fonları"],
    programs=[
        {"name": "Teknopark (4691 sayılı Kanun)", "provider": "Sanayi ve Teknoloji Bakanlığı",
         "benefit": "Kurumlar vergisi, gelir vergisi stopajı, SGK işveren payı muafiyetleri",
         "validUntil": "31/12/2028", "fit": "Yüksek", "priority": 1},
        {"name": "TÜBİTAK 1512 BİGG", "provider": "TÜBİTAK", "amount": "1.350.000 ₺ (%3 hisse karşılığı, 2026)",
         "requirement": "A.Ş. zorunlu", "deadline": "10 Mayıs 2026 (2026/1)", "fit": "Yüksek", "priority": 2},
        {"name": "TÜBİTAK 1507 — KOBİ Ar-Ge Başlangıç", "provider": "TÜBİTAK", "amount": "2.4 milyon ₺'ye kadar %75 hibe (geri ödemesiz)", "fit": "Yüksek", "priority": 3},
        {"name": "KOSGEB İleri Girişimci", "provider": "KOSGEB", "amount": "2 milyon ₺'ye kadar (kuruluş + iş geliştirme)", "fit": "Yüksek"},
        {"name": "KOSGEB Geleneksel/İleri Girişimci Kuruluş", "provider": "KOSGEB", "amount": "20.000 ₺ hibe (sermaye şirketi)", "requirement": "Girişimcilik eğitimi (ücretsiz, 32-70 saat)"},
        {"name": "TEKMER (Teknoloji Merkezi)", "provider": "KOSGEB", "amount": "%100 destek · yıllık 5 milyon ₺'ye kadar"},
        {"name": "TÜBİTAK 1501 — Sanayi Ar-Ge", "provider": "TÜBİTAK", "amount": "%60 hibe (KOBİ) · max 24 ay"},
        {"name": "TÜBİTAK 1711 — Yapay Zekâ Ekosistemi", "provider": "TÜBİTAK", "fit": "Orta-Yüksek (AI altyapı)"},
        {"name": "KOSGEB Sınai Mülkiyet Hakları", "provider": "KOSGEB", "amount": "%100 · üst limit 30.000 ₺ (yurtdışı marka %50 · 50.000 USD)"},
        {"name": "Girişimci Kredisi", "provider": "Kamu bankaları", "amount": "<45 yaş 600.000 ₺'ye kadar; <35 esnaf 300.000 ₺ sıfır faizli"},
        {"name": "İŞKUR İşbaşı Eğitim + SGK Teşviki", "provider": "İŞKUR / SGK", "amount": "Kursiyere 1.079,83 ₺/gün; SGK işveren payı 24-54 ay İşsizlik Fonundan"}
    ],
    argDecRade={"argument": "~%88 kâr marjı üstüne kurumlar vergisi istisnası → yatırımcı IRR'si yükselir",
                "itu_ari": {"girisimci": "18.500 ₺+KDV", "kulucka": "7.350 ₺+KDV", "rank": "#1 üniversite kuluçka (UBI Global)"},
                "argeMerkeziVsTeknopark": "Ar-Ge Merkezi min. 15 tam zamanlı Ar-Ge personeli; Teknopark 1 kişi de olur → 18 kişiye kadar Teknopark"}
)
reg("data/incentives.json", incentives)

print("part5 ok: 6 veri dosyası")

# ============================================================
# MANIFEST (katalog + bölüm sırası + ref grafiği)
# ============================================================
section_index = [{"order": o, "slug": s, "file": "sections/%02d-%s.json" % (o, s),
                  "nav": d["nav"], "title": d["title"]["text"],
                  "refs": d["refs"]} for (o, s, d) in sorted(SECTIONS)]

manifest = env("manifest", "meta",
    title="arsam.net — pitch içerik veritabanı",
    description="Landing page üretimi için parçalanmış, tekrarsız, tutarlı JSON içerik kümesi. 1 bölüm = 1 dosya; tüm rakamlar shared/metrics.json'da tek kaynak.",
    clusters={
        "shared": "Çapraz kesen tek kaynaklar (brand, metrics, sources, glossary, design-tokens)",
        "sections": "Sunum birimleri — her HTML bölümü için 1 dosya (16 adet)",
        "data": "Analitik veri kümeleri (finansal model, pazar, İK/AI, strateji cephanesi, çerçeveler, teşvikler)",
        "meta": "manifest + reconciliation + schema"
    },
    sectionOrder=[s for (_, s, _) in sorted(SECTIONS)],
    sections=section_index,
    shared=["shared/brand.json", "shared/metrics.json", "shared/sources.json", "shared/glossary.json", "shared/design-tokens.json"],
    data=["data/financial-model.json", "data/market-tam-sam-som.json", "data/hr-plan.json",
          "data/strategy-arsenal.json", "data/strategy-frameworks.json", "data/incentives.json"],
    meta=["manifest.json", "reconciliation.json", "schema/README.md", "schema/section.schema.json"],
    counts={"sections": len(SECTIONS), "metrics": len(metrics),
            "dataFiles": 6, "sharedFiles": 5, "totalFiles": None},
    renderHints={
        "uiLibrary": "Flowbite (mevcut pitch zaten Flowbite kullanıyor)",
        "tokenInterpolation": "Metinlerdeki {{metric:<key>}} ifadeleri shared/metrics.json[key].display ile değiştirilir.",
        "valueRefResolution": "stat/card/funnel bloklarındaki valueRef, metrics[key] nesnesinin tamamına çözülür (value+unit+display).",
        "blockTypes": ["eyebrow", "heading", "lead", "paragraph", "stat", "statGrid", "card", "cardGrid",
                       "list", "table", "timeline", "funnel", "pillRow", "quote", "cta", "ctaStack",
                       "chart", "note", "feature", "fomoVeil", "crisisBox", "countdown", "scrollHint", "badge"]
    }
)
reg("manifest.json", manifest)

# ============================================================
# SCHEMA · README (TS parser rehberi)  + JSON Schema
# ============================================================
readme = """# arsam.net içerik veritabanı — şema rehberi

Bu klasör, arsam.net pitch'inin tüm içeriğini **parçalanmış, tekrarsız ve tutarlı** JSON dosyaları halinde tutar.
Amaç: TypeScript ile parse edilip bir UI kütüphanesiyle (Flowbite) landing page'lere dönüştürülmek.

## Klasör yapısı
- `shared/` — çapraz kesen tek kaynaklar. **Rakamlar yalnızca burada** (metrics.json).
  - `brand.json` · marka, kurucu, iletişim, rakipler
  - `metrics.json` · TÜM kanonik rakamlar (value + unit + display + label + source)
  - `sources.json` · atıflar (TKGM, TÜİK, 4691, ...)
  - `glossary.json` · terim tanımları
  - `design-tokens.json` · renk, radius, tipografi, spacing
- `sections/` — `NN-slug.json`. Her dosya 1 HTML bölümü. Sıra dosya adındaki `NN` ile.
- `data/` — analitik veri kümeleri (finansal model, pazar, İK/AI, strateji, teşvikler, çerçeveler).
- `manifest.json` · tüm dosyaların kataloğu + bölüm sırası + ref grafiği.
- `reconciliation.json` · kaynaklar arası rakam farkları ve kanonik kararlar.

## Tekrarsızlık modeli (hibrit)
1. **Paylaşılan rakam** → yalnızca `metrics.json`'da yaşar. Bölüm onu **iki yolla** kullanır:
   - blok alanı: `"valueRef": "revenue.median"` → parser `metrics["revenue.median"]` nesnesine çözer.
   - metin içi: `"... yıllık {{metric:revenue.median}} gelir"` → parser `metrics["revenue.median"].display` ("519 milyon ₺") ile değiştirir.
2. **Bölüme özgü metin** → o bölüm dosyasında satır içi (tek yerde) yaşar.
3. Hiçbir rakam iki dosyada elle tekrarlanmaz.

## Bölüm zarfı (envelope)
```
{ "id", "kind":"section", "schemaVersion", "lang":"tr",
  "order":Number, "slug":String, "nav":{num,label}, "background":String,
  "title":{text, accent?}, "blocks":[ ... ], "refs":{ metrics:[], data:[], sources:[], glossary:[], shared:[] } }
```
`refs.metrics` otomatik toplanır (valueRef + {{metric:}} taraması). Parser kırık ref olursa hata vermelidir.

## Blok tipleri (discriminated union · `type` ayırıcı)
eyebrow · heading · lead · paragraph · stat · statGrid · card · cardGrid · list · table ·
timeline · funnel · pillRow · quote · cta · ctaStack · chart · note · feature · fomoVeil ·
crisisBox · countdown · scrollHint · badge

`chart` blokları `dataRef` ile `data/` dosyasına bağlanır (örn. EBITDA, funnel, yıllık tablo).

## TS önerisi (geliştirme sırası)
1. **Test/şema önce:** Zod ile blok union'ı + `MetricKey` tipini tanımla; metrics anahtarlarını literal union yap; her section dosyası için ref-çözümleme testi yaz.
2. **Veri modeli:** `loadMetrics()` → `Map<MetricKey, Metric>`; `resolveRefs(section)` kırık ref'te throw.
3. **Render:** blok → Flowbite bileşeni eşlemesi; `{{metric:}}` interpolasyonu tek util'de.
4. **Edge case:** eksik display, yüzde/ratio formatı, kırık dataRef, eksik glossary terimi.
"""
reg("schema/README.md", readme)

section_schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "arsam.net section",
    "type": "object",
    "required": ["id", "kind", "order", "slug", "title", "blocks", "refs"],
    "properties": {
        "id": {"type": "string"}, "kind": {"const": "section"},
        "schemaVersion": {"type": "string"}, "lang": {"type": "string"},
        "order": {"type": "integer", "minimum": 1}, "slug": {"type": "string"},
        "nav": {"type": "object", "required": ["num", "label"]},
        "background": {"type": "string"},
        "title": {"type": "object", "required": ["text"]},
        "blocks": {"type": "array", "items": {"type": "object", "required": ["type"]}},
        "refs": {"type": "object",
                 "properties": {"metrics": {"type": "array", "items": {"type": "string"}}}}
    }
}
reg("schema/section.schema.json", section_schema)

# ============================================================
# YAZMA
# ============================================================
written = []
for rel, obj in FILES.items():
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if isinstance(obj, str):
        with open(path, "w", encoding="utf-8") as f:
            f.write(obj)
    else:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2)
    written.append(rel)

# manifest totalFiles güncelle
mf_path = os.path.join(OUT, "manifest.json")
manifest["counts"]["totalFiles"] = len(written)
with open(mf_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print("\n=== YAZILDI: %d dosya ===" % len(written))
for w in sorted(written): print("  " + w)

