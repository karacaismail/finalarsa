# -*- coding: utf-8 -*-
"""
arsam.net — section-ux-strateji-elestiri.md çerçevesine göre YENİDEN yazım.
17 bölümlük yatırımcı-merkezli akış; yasaklı dil yok; iddia etiketleri (claim tag).
Çıktı: database/sections/ (yeni 17 dosya) + manifest.json güncel. shared/ ve data/ DOKUNULMAZ.
Sonunda yasaklı kelime taraması yapılır.
"""
import json, os, re, sys

# DEVRE DIŞI (21.06.2026 — 256 master göçü): section JSON'ları elle güncellendi (256/2031,
# finansal recalc, Ağustos başlangıç). Bu script section'ları yeniden üretir ve o düzeltmeleri
# GERİ ALIR (satır içi caption literal'leri eski 19/149 taşır). Çalıştırmak için ALLOW_LEGACY_BUILD=1.
if os.environ.get("ALLOW_LEGACY_BUILD") != "1":
    sys.exit("build2.py DEVRE DIŞI: section'lar 256 master'a göre elle güncellendi. "
             "Çalıştırmak değişiklikleri geri alır. Bilerek devam için ALLOW_LEGACY_BUILD=1 verin.")

# database/ (göreli, oturumdan bağımsız)
OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "1.0.0"
SECTIONS = []

def env(id_, kind, **x):
    d = {"id": id_, "kind": kind, "schemaVersion": V, "lang": "tr"}; d.update(x); return d

def b(t, **kw): kw["type"] = t; return kw
def eyebrow(t): return b("eyebrow", text=t)
def heading(level, t, accent=None): return b("heading", level=level, text=t, accent=accent)
def lead(t): return b("lead", text=t)
def para(t): return b("paragraph", text=t)
def note(t, tone="info"): return b("note", text=t, tone=tone)
def stat(label, ref=None, value=None, tone=None, sub=None, tag=None):
    d = b("stat", label=label, tone=tone)
    if ref: d["valueRef"] = ref
    if value is not None: d["value"] = value
    if sub: d["sub"] = sub
    if tag: d["tag"] = tag
    return d
def statGrid(cols, items): return b("statGrid", cols=cols, items=items)
def card(title, body=None, eyebrow=None, tone=None, valueRef=None, tag=None):
    d = b("card", title=title, tone=tone)
    if body: d["body"] = body
    if eyebrow: d["eyebrow"] = eyebrow
    if valueRef: d["valueRef"] = valueRef
    if tag: d["tag"] = tag
    return d
def cardGrid(cols, items): return b("cardGrid", cols=cols, items=items)
def li(title, body=None, num=None):
    d = {"title": title}
    if body: d["body"] = body
    if num: d["num"] = num
    return d
def listb(items, ordered=False): return b("list", ordered=ordered, items=items)
def table(columns, rows): return b("table", columns=columns, rows=rows)
def timeline(items): return b("timeline", items=items)
def chart(chartType, dataRef, caption=None, **extra): return b("chart", chartType=chartType, dataRef=dataRef, caption=caption, **extra)
def cta(label, action, meta=None): return b("cta", label=label, action=action, meta=meta)
def ctaStack(items): return b("ctaStack", items=items)
def claimLegend(): return b("claimLegend")

TOK = re.compile(r"\{\{metric:([a-zA-Z0-9_.]+)\}\}")
def collect(blocks):
    found = set()
    def w(x):
        if isinstance(x, dict):
            if isinstance(x.get("valueRef"), str): found.add(x["valueRef"])
            for v in x.values(): w(v)
        elif isinstance(x, list):
            for v in x: w(v)
        elif isinstance(x, str):
            for m in TOK.findall(x): found.add(m)
    w(blocks); return sorted(found)

def section(order, slug, num, navlabel, background, title, blocks, refs=None):
    refs = refs or {}
    refs["metrics"] = sorted(set(refs.get("metrics", [])) | set(collect(blocks)))
    doc = env(slug, "section", order=order, slug=slug, nav={"num": num, "label": navlabel},
              background=background, title=title, blocks=blocks, refs=refs)
    SECTIONS.append((order, slug, doc))

TOTAL = "17"
DOG = "doğrulanmış kaynak"; VAR = "model varsayımı"; HED = "hedef"; TAH = "şirket tahmini"

# ============ 01 · Özel karar notu (hero) ============
section(1, "karar-notu", "01", "Karar notu", "bg-1",
    {"text": "Arsa işini dijitalde güvenli, ölçülebilir ve ölçeklenebilir bir işletmeye çevirme planı", "accent": "güvenli, ölçülebilir ve ölçeklenebilir"},
    [
        eyebrow("arsam.net · karar notu · 01 / " + TOTAL),
        heading(1, "Arsa işini dijitalde güvenli, ölçülebilir ve ölçeklenebilir bir işletmeye çevirme planı.", accent="güvenli, ölçülebilir ve ölçeklenebilir"),
        lead("Bu not, önceki üç görüşmede konuşulan ürünü, stratejiyi ve finansal planı karar aşamasına taşımak için hazırlanmıştır."),
        note("arsam.net bir web sitesi değildir. Arsa satışında güven, doğrulama, ilan, veri, pazarlama ve operasyonu tek panele toplayan dikey bir pazar işletmesidir.", tone="accent"),
        para("İsmail · CPO · Haziran 2026"),
    ], refs={"shared": ["brand"]})

# ============ 02 · Önceki toplantıların özeti ============
section(2, "toplanti-ozeti", "02", "Süreç", "bg-2",
    {"text": "Bugüne kadar ne konuştuk?", "accent": "ne konuştuk"},
    [
        eyebrow("süreç · 02 / " + TOTAL),
        heading(2, "Bugüne kadar ne konuştuk?", accent="ne konuştuk"),
        lead("Üç görüşmede ürün, strateji ve finansal plan konuşuldu. Bugün karar adımındayız."),
        timeline([
            {"when": "Görüşme 1", "what": "arsam.net'in bir web sitesi değil, arsa satışında dikey bir pazar işletmesi (B2B2C) olduğu konuşuldu.", "state": "done"},
            {"when": "Görüşme 2", "what": "Ürün, yönetim süreci ve pazara giriş planı konuşuldu.", "state": "done"},
            {"when": "Görüşme 3", "what": "Finansal plan, gider, gelir, senaryo ve çalışma modeli konuşuldu.", "state": "done"},
            {"when": "Bugün", "what": "Başabaş, insan kaynağı, yan haklar, yatırım seçeneği ve karar adımı.", "state": "now"},
        ]),
        note("Bu özet, sürecin baştan ciddiyetle yürütüldüğünü gösterir."),
    ])

# ============ 03 · Neden bu yatırımcı doğru ortak? ============
section(3, "neden-ortak", "03", "Ortaklık", "bg-3",
    {"text": "Neden doğru ortak sizsiniz?", "accent": "doğru ortak"},
    [
        eyebrow("stratejik ortaklık · 03 / " + TOTAL),
        heading(2, "Neden doğru ortak sizsiniz?", accent="doğru ortak"),
        lead("Bu iş yalnızca yazılımla kurulmaz; arsa piyasasının güven, saha ve satış refleksi gerekir."),
        note("Bu işin yazılım tarafını biz kurarız; fakat arsa piyasasının güven, saha ve satış refleksi olmadan kategori kurulmaz.", tone="accent"),
        cardGrid(2, [
            card("Siz: saha ve güven", "Lokasyon bilgisi, satıcı ağı, tapu ve satış refleksi, bölgesel itibar.", eyebrow="ortaklık", tone="gold"),
            card("Biz: yazılım ve operasyon", "Doğrulama altyapısı, veri standardı, panel ve AI destekli operasyon disiplini.", eyebrow="ortaklık", tone="accent"),
        ]),
    ], refs={"shared": ["brand"]})

# ============ 04 · Problem ============
section(4, "problem", "04", "Problem", "bg-4",
    {"text": "Arsa, dijitalde güven maliyeti yüksek bir üründür", "accent": "güven maliyeti yüksek"},
    [
        eyebrow("problem · 04 / " + TOTAL),
        heading(2, "Arsa, dijitalde güven maliyeti yüksek bir üründür.", accent="güven maliyeti yüksek"),
        lead("Alıcı yalnızca fotoğrafa değil; tapu, imar, konum, emsal fiyat ve satıcı doğruluğuna bakar. Mevcut yatay platformlar bu bilgileri standart bir güven dosyasına dönüştürmez."),
        listb([
            li("Aynı parsel, farklı ilanlarda farklı fiyat", "Emsal ve doğrulama standardı olmadığı için fiyat dağınık kalır.", num="01"),
            li("Tapu ve imar bilgisi ilanda standart değil", "Alıcı kritik bilgiyi ilan dışından, dağınık biçimde arar.", num="02"),
            li("Kapora ve sahte ilan riski alıcı güvenini düşürür", "Ön ödeme için güvenli bir protokol yoktur.", num="03"),
            li("EİDS ve ilan doğrulama dönemi eski ilan mantığını zorlar", "İlan doğrulama artık yasal bir gerekliliktir.", num="04"),
        ]),
        note("Amaç korkutmak değil; arsa için neden dikey uzmanlık gerektiğini göstermek."),
    ], refs={"glossary": ["EİDS"]})

# ============ 05 · Çözüm (ürün) ============
section(5, "cozum", "05", "Çözüm", "bg-1",
    {"text": "Tek panel, tek güven dosyası", "accent": "güven dosyası"},
    [
        eyebrow("çözüm · 05 / " + TOTAL),
        heading(2, "Tek panel, tek güven dosyası.", accent="güven dosyası"),
        note("İlan sayfası yalnızca fotoğraf göstermez; parselin güven dosyasını gösterir.", tone="accent"),
        chart("panelMock", "brand", caption="İlan güven dosyası · örnek panel"),
        listb([
            li("İlan kimliği ve yetki doğrulama", "İlan sahibi ve ilan, EİDS uyumlu biçimde doğrulanır.", num="01"),
            li("Parsel, konum ve imar katmanı", "Kadastro ve imar bilgisi haritada tek ekranda.", num="02"),
            li("Emsal fiyat ve bölgesel m² aralığı", "Fiyat, bölgesel emsalle şeffaflaşır.", num="03"),
            li("Drone ve yerinde keşif materyali", "Premium ilanda arsa gerçekten görünür.", num="04"),
            li("Kapora ve ön ödeme güven protokolü", "Bedel, tapu transferine kadar güvende kalır.", num="05"),
        ]),
    ], refs={"glossary": ["EİDS", "TAKBİS"]})

# ============ 06 · Pazar ve varsayımlar ============
section(6, "pazar", "06", "Pazar", "bg-2",
    {"text": "Pazar büyük; biz ölçülü bir dilim hedefliyoruz", "accent": "ölçülü bir dilim"},
    [
        eyebrow("pazar ve varsayımlar · 06 / " + TOTAL),
        heading(2, "Pazar büyük; biz ölçülü bir dilim hedefliyoruz.", accent="ölçülü bir dilim"),
        lead("Resmi veriyi, model varsayımını ve hedefi ayrı tutuyoruz; her rakamın türünü etiketliyoruz."),
        claimLegend(),
        statGrid(3, [
            stat("2024 toplam taşınmaz satışı", ref="market.total_realestate_2024", tag=DOG),
            stat("Arsa + tarla + ticari", ref="market.land_commercial_2024", tone="accent", tag=DOG),
            stat("Konut", ref="market.housing_2024", tag=DOG),
        ]),
        note("Değer hunisi · Türkçesiyle: TAM = toplam pazar, SAM = dijitale açık pazar, SOM = ulaşılabilir hedef pazar."),
        chart("funnel", "market-tam-sam-som", caption="Toplam pazar (varsayım) → ulaşılabilir hedef gelir (hedef)"),
        chart("scenarioYears", "market-tam-sam-som", caption="Senaryo bazında yıllık gelir hedefi · 2028'de tutturulur"),
        note("TKGM/TÜİK işlem adetleri doğrulanmış kaynaktır; online penetrasyon, ortalama arsa işlem değeri ve pazar payı model varsayımıdır."),
    ], refs={"shared": ["sources", "glossary"], "sources": ["tkgm-2024", "tuik-2024"],
             "data": ["market-tam-sam-som"], "glossary": ["TAM", "SAM", "SOM"]})

# ============ 07 · İş modeli ============
section(7, "model", "07", "İş modeli", "bg-3",
    {"text": "Satıştan pay almayız; hizmetten gelir üretiriz", "accent": "hizmetten gelir"},
    [
        eyebrow("iş modeli · 07 / " + TOTAL),
        heading(2, "Satıştan pay almayız; hizmetten gelir üretiriz.", accent="hizmetten gelir"),
        note("arsam.net satıştan pay almaz; doğrulanmış ilan, görünürlük, vitrin, veri ve operasyonel hizmetlerden gelir üretir.", tone="accent"),
        statGrid(4, [
            stat("Premium yıllık", ref="pricing.premium_annual", tag=VAR),
            stat("Vitrin", ref="pricing.vitrin_monthly", tag=VAR),
            stat("Başlangıç paketi", ref="pricing.starter_monthly", tag=VAR),
            stat("Öne çıkar", ref="pricing.doping_per", tag=VAR),
        ]),
        note("Komisyon baskısı yerine satıcı dostu, tekrarlayan gelir."),
    ], refs={"data": ["financial-model"]})

# ============ 08 · GTM / Ege pilotu ============
section(8, "gtm", "08", "Pazara giriş", "bg-4",
    {"text": "Önce Ege'de dar bir bölgede yoğunlaşıyoruz", "accent": "dar bir bölgede"},
    [
        eyebrow("pazara giriş planı · 08 / " + TOTAL),
        heading(2, "Önce Ege'de dar bir bölgede yoğunlaşıyoruz.", accent="dar bir bölgede"),
        lead("Amaç, ulusal kampanyadan önce arz kalitesi ve satış sinyali üretmektir."),
        listb([
            li("Dar bölgede yoğunlaş", "Söke, Bodrum, Aydın — arsa ilgisi yüksek, sahaya yakın bölgeler.", num="01"),
            li("Satıcı arzını kur", "Kurucu satıcı programıyla ilk doğrulanmış ilanları topla.", num="02"),
            li("İlan kalitesini standardize et", "Her ilan aynı güven dosyası standardına geçer.", num="03"),
            li("Alıcı güvenini veriyle artır", "Emsal fiyat, doğrulama ve drone ile güven üret.", num="04"),
            li("Formülü başka bölgelere taşı", "Başarılı bölge modeli adım adım ölçeklenir.", num="05"),
        ]),
        heading(3, "İlk 6 uygulanabilir büyüme hamlesi"),
        listb([
            li("Bölgesel arz toplama", "Sahadaki satıcı ağından ilk doğrulanmış ilanlar.", num="01"),
            li("Kurucu satıcı programı", "İlk satıcılara kalıcı kurucu statüsü ve öncelik.", num="02"),
            li("Programatik bölge sayfaları", "Her il, ilçe ve arsa tipi için aranabilir sayfa.", num="03"),
            li("Drone ve doğrulama ile premium ilan", "Güven dosyası tam dolu, öne çıkan ilan.", num="04"),
            li("Diaspora alıcı kanalı", "Yurt dışındaki Türk alıcıya yönelik satış kanalı.", num="05"),
            li("Emlakçı paneli ve CRM", "Saha emlakçısı için ilan ve müşteri yönetim ekranı.", num="06"),
        ]),
        note("Bu plan 'rakibi nasıl yeneriz' değil, 'nasıl kazanırız' sorusunu cevaplar."),
    ])
# ============ 09 · Rekabet ve savunma ============
section(9, "rekabet", "09", "Rekabet", "bg-1",
    {"text": "Savunmamız trafik değil; arsa derinliği", "accent": "arsa derinliği"},
    [
        eyebrow("rekabet ve savunma · 09 / " + TOTAL),
        heading(2, "Savunmamız trafik değil; arsa derinliği.", accent="arsa derinliği"),
        note("Büyük yatay platformlar trafik avantajına sahiptir. arsam.net'in savunması arsa özelinde doğrulama, veri standardı, bölgesel arz ve satıcı operasyonudur.", tone="accent"),
        table(["Oyuncu", "Konum", "Arsa derinliği", "Doğrulama", "Model"], [
            ["sahibinden", "yatay · açık", "düşük", "kısmi", "komisyon + ilan"],
            ["hepsiemlak", "yatay · açık", "düşük", "yok", "ilan + emlakçı"],
            ["emlakjet", "yatay · küratoryal kısmi", "düşük", "kısmi", "ilan"],
            ["arsam.net", "dikey · küratoryal", "yüksek", "tam · EİDS", "ilan + hizmet geliri"],
        ]),
        note("Rakip yarın dikey bir sayfa açabilir; ama saha arzını, doğrulamayı ve satıcı ilişkisini bir günde kuramaz."),
    ], refs={"shared": ["sources"], "sources": ["rekabet-kurulu"], "glossary": ["EİDS"]})

# ============ 10 · AI destekli operasyon ============
section(10, "ai-operasyon", "10", "AI operasyon", "bg-2",
    {"text": "AI, insanı değil maliyeti azaltır", "accent": "maliyeti azaltır"},
    [
        eyebrow("AI destekli operasyon · 10 / " + TOTAL),
        heading(2, "AI, insanı değil maliyeti azaltır.", accent="maliyeti azaltır"),
        note("AI; ilan kontrolü, müşteri yönlendirme, içerik üretimi, veri temizliği ve raporlama maliyetini düşürmek için kullanılır. İnsan karar ve denetim zinciri korunur.", tone="accent"),
        statGrid(3, [
            stat("AI'sız gerekli kadro", ref="ai.fte_without", tag=VAR),
            stat("AI ile gerekli kadro", ref="ai.fte_with", tone="accent", tag=VAR),
            stat("Yıllık operasyon tasarrufu", ref="ai.annual_saving", tone="gold", tag=VAR),
        ]),
        chart("aiEfficiency", "hr-plan", caption="Departman bazında AI'sız ve AI ile gerekli kadro"),
        note("Hedef, insanı azaltmak değil; aynı işi daha düşük maliyet ve daha hızlı denetim döngüsüyle yapmaktır."),
    ], refs={"data": ["hr-plan"]})

# ============ 11 · İK planı ============
section(11, "ik-plani", "11", "İK planı", "bg-3",
    {"text": "Kadro, gelir ve riske göre büyür", "accent": "gelir ve riske göre"},
    [
        eyebrow("İK planı · 11 / " + TOTAL),
        heading(2, "Kadro, gelir ve riske göre büyür.", accent="gelir ve riske göre"),
        lead("Hangi rol gelir üretir, hangi rol riski azaltır — kadro buna göre planlanır."),
        chart("headcountMonthly", "financial-detail", caption="2026 · aylık işe alım (Temmuz 6 → Aralık 19 kişi)"),
        chart("headcountGrowth", "hr-plan", caption="Kadro büyümesi · 2026 (19) → 2032 (149)"),
        cardGrid(3, [
            card("Gelir üreten roller", "Satış/satıcı operasyonu, pazarlama, ürün ve büyüme.", eyebrow="kadro", tone="accent"),
            card("Riski azaltan roller", "Hukuk ve uyum, doğrulama/güven, finans.", eyebrow="kadro", tone="gold"),
            card("Operasyon rolleri", "Müşteri deneyimi, moderasyon, içerik.", eyebrow="kadro"),
        ]),
        note("Kadro 2026'da 19 kişiyle başlar, 2032'de yaklaşık 149'a ulaşır; her ekleme bir gerekçeye bağlıdır."),
    ], refs={"data": ["hr-plan", "financial-detail"]})

# ============ 12 · Finansal plan (kronolojik · grafik+tablo çiftleri) ============
section(12, "basabas", "12", "Finansal", "dark",
    {"text": "Para, ilk aydan 2032'ye kronolojik olarak izlenir", "accent": "kronolojik olarak"},
    [
        eyebrow("finansal plan · 12 / " + TOTAL),
        heading(2, "Para, ilk aydan 2032'ye kronolojik olarak izlenir.", accent="kronolojik olarak"),
        lead("Her görünüm bir grafik ve onun tablosu olarak verilir; sıra zaman çizgisini izler: ilk ay kuruluş yatırımı, aylık işletme gideri, 2026 ve 2027 aylık, başabaş ve 2032 vizyonu."),
        claimLegend(),

        # --- 1) İlk ay · CAPEX ---
        heading(3, "İlk ay · kuruluş yatırımı (CAPEX)"),
        lead("İlk ayda bir kerelik kurulum yatırımı yapılır; sonraki aylar tekrarlayan işletme giderine döner. CAPEX, kuruluş gideridir."),
        chart("capexBreakdown", "financial-breakdown", caption="Kuruluş yatırımı kategori kırılımı · büyük kısmı ilk ay (Tem 2026) · grafik + tablo"),

        # --- 2) OPEX ---
        heading(3, "Aylık işletme gideri (OPEX)"),
        lead("OPEX, her ay tekrar eden işletme gideridir: personel, ofis, dijital altyapı, AI/yazılım araçları ve idari kalemler. Kadro büyüdükçe İK personeli en büyük kaleme döner."),
        chart("opexComposition", "financial-breakdown", caption="Açılış ayı (Tem 2026) işletme gideri kompozisyonu · grafik + tablo"),

        # --- 3) 2026 aylık ---
        heading(3, "2026 · aylık finansal (Tem – Ara)"),
        lead("Soft-launch dönemi. Gider üç bileşene ayrışır: OPEX + Pazarlama + CAPEX. Bu özdeşlik her ay tutar."),
        chart("monthly2026", "financial-breakdown", caption="2026 aylık: gelir, gider kırılımı (OPEX/Pazarlama/CAPEX) ve kümülatif nakit · grafik + tablo"),

        # --- 4) 2027 aylık ---
        heading(3, "2027 · aylık finansal (Oca – Ara)"),
        lead("Gelirin gideri geçtiği yıl. Aylık akış, başabaşın nasıl ve ne zaman geldiğini gösterir."),
        chart("monthly2027", "financial-breakdown", caption="2027 aylık: gelir, gider kırılımı ve kümülatif nakit · grafik + tablo"),

        # --- 5) Başabaş analizi (eksik olan grafik) ---
        heading(3, "Başabaş analizi"),
        lead("Başabaşa kadar yaklaşık 15 milyon ₺ harcanır; kümülatif gelir, kümülatif gideri Mart 2027'de bu seviyede geçer. O noktadan sonra gelir gideri karşılar. 40 milyon ₺ sermaye bunu rahatça finanse eder; kasa hiç 32 milyon ₺ altına inmez."),
        chart("breakeven", "financial-breakdown", caption="Kümülatif gelir vs kümülatif gider · kesişim (başabaş) ~Mart 2027, ~15 milyon ₺ · grafik + özet tablo"),

        # --- 6) 2032 vizyonu · yıllık (1 grafik + 1 tablo) ---
        heading(3, "2032 vizyonu · yıllık (2026 → 2032)"),
        lead("Tek finansal grafik ve tek finansal tablo: yedi yılın geliri, gideri, net kârı, kadrosu ve yıl sonu nakdi."),
        chart("yearlyTable", "financial-model", caption="Yıllık gelir, gider, net kâr + tablo (kadro, yıl sonu nakit) · net marj ~%90"),

        # --- 7) Teknopark vergi avantajı · interaktif ---
        heading(3, "Teknopark vergi avantajı · senaryona göre"),
        lead("Şirket teknopark çatısına alındığında yazılım kazancı kurumlar vergisinden istisna olur. Avantajın ₺ tutarı kazanca bağlıdır: aşağıdaki yatay çubuğu sürükle (Kötümser ↔ Medyan ↔ İyimser); avantaj canlı hesaplanır."),
        chart("taxSlider", "financial-breakdown", caption="Sürükle: gelir senaryosu → vergi öncesi kâr → KV istisnası + stopaj/SGK avantajı"),
        note("Risk belirsiz değil; ölçülmüş ve zaman çizgisine yayılmıştır. Vergi avantajının mekanizması yasal-kesindir; ₺ tutarı kazanç düzeyine bağlı model varsayımıdır.", tone="info"),
    ], refs={"data": ["financial-model", "financial-detail", "financial-breakdown"]})

# ============ 13 · Risk ve kontrol kapıları ============
section(13, "risk", "13", "Risk", "bg-1",
    {"text": "Her riskin bir ölçümü ve bir kararı var", "accent": "ölçümü ve bir kararı"},
    [
        eyebrow("risk ve kontrol kapıları · 13 / " + TOTAL),
        heading(2, "Her riskin bir ölçümü ve bir kararı var.", accent="ölçümü ve bir kararı"),
        lead("Önemli olan rakip değil; hangi sırayla ne yapacağımız ve nerede duracağımız."),
        table(["Risk", "Ölçüm", "Karar kapısı", "Aksiyon"], [
            ["Satıcı arzı beklenenden yavaş oluşur", "İlk 90 günde aktif doğrulanmış ilan sayısı", "Hedefin altındaysa", "Bölge daraltma · kurucu satıcı teşviki · saha satış desteği"],
            ["Alıcı güveni düşük kalır", "İlan başına iletişim ve dönüşüm", "Eşik altındaysa", "Doğrulama katmanını ve emsal veriyi güçlendir"],
            ["Kur oynaklığı maliyeti artırır", "USD bazlı gider payı (OPEX)", "%20 üstüne çıkarsa", "Hibrit altyapı · harcama kısıtı"],
            ["Regülasyon (EİDS/SPK) sıkılaşır", "Uyum açığı", "Yeni şart geldiğinde", "İlk günden EİDS-uyumlu altyapı avantaja döner"],
        ]),
        note("Bu tablo sürpriz değil, senaryo üretir; her risk bir karar kapısına bağlıdır."),
    ], refs={"glossary": ["EİDS"]})

# ============ 14 · Teknopark ve teşvik ============
section(14, "teknopark", "14", "Teknopark", "bg-2",
    {"text": "Şartlar sağlandığında vergi avantajı kesindir", "accent": "kesindir"},
    [
        eyebrow("teknopark ve teşvik · 14 / " + TOTAL),
        heading(2, "Şartlar sağlandığında vergi avantajı kesindir.", accent="kesindir"),
        note("Şirket teknopark çatısına alınıp aşağıdaki şartları sağladığında, yazılım gelirlerinde 4691 kapsamlı vergi avantajı yasal olarak doğar. Avantajın mekanizması kesindir; değişen tek şey kazanç düzeyine bağlı tutardır.", tone="accent"),
        statGrid(3, [
            stat("Kurumlar vergisi istisnası", ref="tax.corporate_rate", tone="gold", tag=DOG),
            stat("Ar-Ge personel gelir vergisi", ref="tax.income_withholding", tone="gold", sub="stopaj istisnası (tavanlı)", tag=DOG),
            stat("SGK işveren payı desteği", ref="tax.sgk_employer", tone="gold", tag=DOG),
        ]),
        card("İlk yıl avantajı (model tahmini)", "Mekanizma yasal ve kesin; ₺ tutarı kazanç düzeyine bağlı olduğu için model tahminidir. İstisna süresi 31/12/2028.", eyebrow="~2027", tone="gold", valueRef="tax.saving_2027", tag=VAR),
        heading(3, "Avantajın şartları"),
        listb([
            li("Teknoparka kabul", "Yönetici şirkete proje başvurusu ve kabul; kazancın münhasıran onaylı yazılım/Ar-Ge faaliyetinden olması.", num="01"),
            li("Kurumlar vergisi yatırım yükümlülüğü", "İstisna kazanç eşiğin (2025: 2 milyon ₺) üstündeyse bir kısmı (≈%3, yıllık tavan 100 milyon ₺) yıl sonuna kadar girişim sermayesi fonuna veya kuluçka girişimine yatırılmalı; aksi halde istisnanın o kısmı kaybedilir.", num="02"),
            li("Stopaj tavanı ve oranlar", "Kişi başı aylık brüt asgari ücretin 40 katı tavanı (7555 sayılı Kanun, Ağu 2025); destek personeli %10 sınırı; bölge dışı çalışma oranı (BT personeli 2026 sonuna kadar %100).", num="03"),
            li("Süre", "Tüm avantajlar 31/12/2028'e kadar yasaldır; süre 2013 → 2023 → 2028 olarak uzatıldı, sonrası için yeni uzatma kararı beklenir.", num="04"),
        ]),
        note("Vergi avantajının mekanizması yasal ve kesindir. Yandaki ₺ tutarı kazanç düzeyine bağlı bir model tahminidir; şartlar sağlandığında avantajın kendisi kesin doğar."),
    ], refs={"shared": ["sources"], "sources": ["kanun-4691"], "data": ["incentives"], "glossary": ["4691"]})

# ============ 15 · CPO çalışma şartları ============
section(15, "cpo", "15", "CPO", "bg-3",
    {"text": "Tam zamanlı odak çalışma varsayımı", "accent": "tam zamanlı odak"},
    [
        eyebrow("CPO çalışma şartları · 15 / " + TOTAL),
        heading(2, "Tam zamanlı odak çalışma varsayımı.", accent="tam zamanlı odak"),
        note("Bu rol, mevcut işlerden ayrılarak tam zamanlı odak gerektirir. Bu nedenle modelde CPO için sabit ücret, mobilite ve aile dahil tam kapsamlı özel sağlık sigortası çalışma varsayımı olarak tanımlanmıştır.", tone="accent"),
        statGrid(3, [
            stat("Aylık sabit ücret", ref="cpo.salary_usd", tone="accent", sub="USD / ay · plan baz", tag=VAR),
            stat("Mobilite", ref="cpo.car", tone="gold", sub="araç tahsisi veya eşdeğer çözüm", tag=VAR),
            stat("Özel sağlık sigortası", value="Aile dahil", sub="genel, tam kapsamlı", tag=VAR),
        ]),
        note("Bu kalemlerin nihai biçimi ortak kararınızla netleşebilir; fakat model bu maliyeti baştan içerir."),
    ], refs={"shared": ["brand"], "data": ["financial-model"]})

# ============ 16 · Yatırım seçenekleri ============
section(16, "yatirim", "16", "Yatırım", "bg-4",
    {"text": "Üç seçenek, tek karar çerçevesi", "accent": "karar çerçevesi"},
    [
        eyebrow("yatırım seçenekleri · 16 / " + TOTAL),
        heading(2, "Üç seçenek, tek karar çerçevesi.", accent="karar çerçevesi"),
        lead("Her seçenek için: tutar, hisse, ne finanse ettiği, hangi riski kapattığı ve yatırımcının rolü."),
        cardGrid(3, [
            card("Çekirdek", "Ne finanse eder: 2 yazılımcı + 1 tasarımcı, 6 ay nakit çalışma süresi, Söke + Bodrum pilotu. Kapattığı risk: ürün-pazar uyumu. Rol: erken ortak.", eyebrow="{{metric:invest.seed_equity}} hisse · {{metric:invest.seed_valuation}} değerleme", valueRef="invest.seed_amount"),
            card("Stratejik · önerilen", "Ne finanse eder: başabaşa tam yükleme, pilot + pazara giriş, kurucu satıcı programı. Kapattığı risk: arz ve gelir sinyali. Rol: lider yatırımcı.", eyebrow="{{metric:invest.strategic_equity}} hisse · {{metric:invest.strategic_valuation}} değerleme", tone="gold", valueRef="invest.strategic_amount"),
            card("Lider", "Ne finanse eder: stratejik + yedek, ulusal kampanya hazırlığı. Kapattığı risk: ölçek finansmanı. Rol: yönetim kurulunda temsil ve stratejik karar katılımı.", eyebrow="{{metric:invest.lead_equity}} hisse · yönetim kurulunda temsil", valueRef="invest.lead_amount"),
        ]),
        note("Ulusal kampanya sonrası değerleme yeniden ele alınır. Bugünkü teklif, kampanya öncesi riskleri birlikte üstlenme teklifidir."),
    ], refs={"data": ["financial-model"]})

# ============ 17 · Kapanış ve ilk 30 gün ============
section(17, "ilk-30-gun", "17", "Karar", "bg-end",
    {"text": "Bugünkü karar: tutar, rol, ilk 30 gün", "accent": "tutar, rol, ilk 30 gün"},
    [
        eyebrow("karar · 17 / " + TOTAL),
        heading(2, "Bugünkü karar: tutar, rol, ilk 30 gün.", accent="tutar, rol, ilk 30 gün"),
        listb([
            li("Hangi yatırım seçeneğiyle ilerliyoruz?", "Çekirdek, stratejik veya lider.", num="01"),
            li("Yatırımcının rolü ne olacak?", "Erken ortak, lider yatırımcı veya stratejik karar katılımı.", num="02"),
            li("İlk 30 günde hangi işler yapılacak?", "A.Ş. tescili, Söke pilotu, ilk kurucu satıcıların kazanılması.", num="03"),
        ]),
        note("Karar sizde. Önerimiz: önce kontrollü pilotu başlatmak ve ilk 90 günde satıcı arzı, doğrulanmış ilan ve gelir sinyalini birlikte ölçmek.", tone="accent"),
        ctaStack([cta("Görüşmeyi sürdürelim", "contact", meta="5 dk"), cta("Doğrudan ara", "phone", meta="CPO")]),
        para("İsmail · cpo@arsam.net · +90 532 295 10 80"),
        note("Hazırlık · Haziran 2026 · arsam.net"),
    ], refs={"shared": ["brand"]})

# ============ MANIFEST + YASAKLI KELİME TARAMASI + YAZMA ============
order = [s for _, s, _ in sorted(SECTIONS)]
manifest_path = os.path.join(OUT, "manifest.json")
mf = json.load(open(manifest_path, encoding="utf-8"))
mf["sectionOrder"] = order
mf["sections"] = [{"order": o, "slug": s, "file": "sections/%02d-%s.json" % (o, s),
                   "nav": d["nav"], "title": d["title"]["text"], "refs": d["refs"]} for o, s, d in sorted(SECTIONS)]
mf["counts"]["sections"] = len(SECTIONS)
mf["_revision"] = {"at": "2026-06-20", "note": "section-ux-strateji-elestiri.md çerçevesine göre 17 bölümlük yatırımcı-merkezli akışa yeniden yazıldı."}

FORBIDDEN = ["silah", "cephane", "komando", "gerilla", "yok etmek", "ezmek", "öldürmek",
             "garanti", "sıfır risk", "kesin kazan", "fomo", "son fırsat", "slot kald", "herkes için değil"]
def scan(doc):
    hits = []
    def w(x):
        if isinstance(x, dict):
            for v in x.values(): w(v)
        elif isinstance(x, list):
            for v in x: w(v)
        elif isinstance(x, str):
            low = x.lower()
            for f in FORBIDDEN:
                if f in low: hits.append((f, x[:60]))
    w(doc); return hits

allhits = []
written = []
os.makedirs(os.path.join(OUT, "sections"), exist_ok=True)
for o, s, d in sorted(SECTIONS):
    allhits += scan(d)
    p = os.path.join(OUT, "sections", "%02d-%s.json" % (o, s))
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    written.append("sections/%02d-%s.json" % (o, s))
json.dump(mf, open(manifest_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print("build2 ok: %d yeni bölüm yazıldı" % len(written))
print("YASAKLI KELİME:", allhits if allhits else "yok — temiz")

