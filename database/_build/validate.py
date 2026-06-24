# -*- coding: utf-8 -*-
"""arsam.net JSON veritabanı doğrulayıcı: geçerlilik + ref bütünlüğü + tekrar taraması + matematik."""
import json, os, re, glob

# DB = database/ (bu dosya database/_build/ içinde) — göreli, oturumdan bağımsız.
DB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors, warns, oks = [], [], []
def E(m): errors.append(m)
def W(m): warns.append(m)
def OK(m): oks.append(m)

# 1) Tüm JSON parse
docs = {}
STRAYS = {"t.json", "_wtest"}
for path in glob.glob(DB + "/**/*.json", recursive=True):
    if "/_build/" in path: continue
    if os.path.basename(path) in STRAYS: continue  # önceki yazma testinden kalan, silinecek
    rel = os.path.relpath(path, DB)
    try:
        docs[rel] = json.load(open(path, encoding="utf-8"))
    except Exception as ex:
        E(f"JSON PARSE HATASI: {rel} :: {ex}")
OK(f"{len(docs)} JSON dosyası parse edildi")

metrics = docs["shared/metrics.json"]["metrics"]
sources = docs["shared/sources.json"]["items"]
glossary = docs["shared/glossary.json"]["terms"]
mkeys = set(metrics.keys())

REF_RE = re.compile(r"\{\{metric:([a-zA-Z0-9_.]+)\}\}")
def strings_of(x, acc):
    if isinstance(x, dict):
        for v in x.values(): strings_of(v, acc)
    elif isinstance(x, list):
        for v in x: strings_of(v, acc)
    elif isinstance(x, str): acc.append(x)
# Tekrar taraması için: render edilen ANA metin alanları (accent/caption/title/tone gibi
# metadata ve styling ipuçları hariç). Token'lar zaten çıkarılır.
SCAN_SKIP_KEYS = {"type", "accent", "caption", "tone", "state", "action", "num", "badge",
                  "chartType", "dataRef", "field", "columns", "highlightYears", "targetRef", "valueRef", "ref"}
def render_strings(x, acc):
    if isinstance(x, dict):
        for k, v in x.items():
            if k in SCAN_SKIP_KEYS: continue
            render_strings(v, acc)
    elif isinstance(x, list):
        for v in x: render_strings(v, acc)
    elif isinstance(x, str): acc.append(x)
def valuerefs_of(x, acc):
    if isinstance(x, dict):
        if isinstance(x.get("valueRef"), str): acc.append(x["valueRef"])
        if isinstance(x.get("ref"), str): acc.append(x["ref"])
        for v in x.values(): valuerefs_of(v, acc)
    elif isinstance(x, list):
        for v in x: valuerefs_of(v, acc)

# 2) Ref bütünlüğü (sections)
sec_files = sorted([r for r in docs if r.startswith("sections/")])
data_files = set(r.split("/")[1].replace(".json","") for r in docs if r.startswith("data/"))
used_metrics = set()
for rel in sec_files:
    d = docs[rel]
    blocks = d.get("blocks", [])
    # valueRef + {{metric}} çözümleme
    vrefs = []; valuerefs_of(blocks, vrefs)
    strs = []; strings_of(blocks, strs); strings_of(d.get("title",{}), strs)
    tokrefs = []
    for s in strs: tokrefs += REF_RE.findall(s)
    for k in vrefs + tokrefs:
        used_metrics.add(k)
        if k not in mkeys: E(f"{rel}: KIRIK metric ref '{k}'")
    # refs bloğu tutarlılığı
    refs = d.get("refs", {})
    for k in refs.get("metrics", []):
        if k not in mkeys: E(f"{rel}: refs.metrics KIRIK '{k}'")
    for s in refs.get("sources", []):
        if s not in sources: E(f"{rel}: KIRIK source ref '{s}'")
    for g in refs.get("glossary", []):
        if g not in glossary: E(f"{rel}: KIRIK glossary ref '{g}'")
    for dt in refs.get("data", []):
        if dt not in data_files: E(f"{rel}: KIRIK data ref '{dt}'")
    # refs.metrics, gerçekte kullanılanları kapsıyor mu
    declared = set(refs.get("metrics", []))
    actual = set(vrefs + tokrefs)
    missing = actual - declared
    if missing: W(f"{rel}: refs.metrics eksik (otomatik toplanmalıydı): {sorted(missing)}")
OK(f"{len(sec_files)} bölüm ref bütünlüğü kontrol edildi")

# 3) TEKRAR TARAMASI — metric display'i bir bölümde satır içi (ref dışı) geçiyor mu?
#    Kanonik rakamların elle tekrarını yakalar.
def norm(s): return re.sub(r"\s+", " ", s).strip()
# taranacak display'ler: yalnız ₺/sayı içeren, ayırt edici olanlar
scan_displays = {}
for k, m in metrics.items():
    disp = str(m.get("display",""))
    if re.search(r"\d", disp) and len(disp) >= 4:  # sayısal ve yeterince ayırt edici
        scan_displays[k] = disp
dup_hits = []
compiled = {k: re.compile(r"(?<!\d)" + re.escape(disp) + r"(?!\d)") for k, disp in scan_displays.items()}
for rel in sec_files:
    strs = []; render_strings(docs[rel].get("blocks", []), strs)  # yalnız blok ana metinleri
    for s in strs:
        s_wo_tokens = REF_RE.sub("", s)  # {{metric:}} token'larını çıkar
        for k, disp in scan_displays.items():
            if compiled[k].search(s_wo_tokens):
                dup_hits.append((rel, k, disp, norm(s)[:90]))
if dup_hits:
    for rel, k, disp, ctx in dup_hits:
        W(f"OLASI TEKRAR: {rel} satır içi '{disp}' ({k}) → '{ctx}'")
else:
    OK("Tekrar taraması: bölümlerde kanonik metric display'in satır içi tekrarı YOK")

# 4) Kullanılmayan metric (bilgi)
unused = mkeys - used_metrics
if unused: W(f"{len(unused)} metric hiçbir bölümde ref edilmemiş (veri dosyalarında kullanılıyor olabilir): {sorted(unused)[:12]}{'...' if len(unused)>12 else ''}")

# 4b) ACCORDION GRUPLAMA KAPISI — gelecekte SESSİZ kırılmayı önler.
#     accordion-groups.json VARSA: grupların 'sections' slug listeleri ile bölümlerin
#     gerçek 'slug' alanları BİREBİR örtüşmeli. Dosya YOKSA bu kontrol tamamen atlanır.
if "data/accordion-groups.json" in docs:
    ag = docs["data/accordion-groups.json"]
    grouped = []                      # gruplarda geçen slug'lar (tekrar dahil)
    for g in ag.get("groups", []):
        for sl in g.get("sections", []):
            if isinstance(sl, str): grouped.append(sl)
    real_slugs = set()                # bölüm dosyalarındaki gerçek slug'lar
    for rel in sec_files:
        sl = docs[rel].get("slug")
        if isinstance(sl, str): real_slugs.add(sl)
    grouped_set = set(grouped)
    # (a) accordion-groups'ta olup gerçek bölümü olmayan slug
    for sl in sorted(grouped_set - real_slugs):
        E(f"accordion-groups: '{sl}' grupta var ama gerçek bölüm (slug) YOK")
    # (b) gerçek bölüm olup hiçbir grupta yer almayan slug (render edilmeyen bölüm)
    for sl in sorted(real_slugs - grouped_set):
        E(f"accordion-groups: bölüm '{sl}' HİÇBİR grupta yok — render EDİLMEZ")
    # (c) birden çok grupta tekrar eden slug
    for sl in sorted(k for k in grouped_set if grouped.count(k) > 1):
        E(f"accordion-groups: '{sl}' birden çok grupta TEKRAR ediyor ({grouped.count(sl)}×)")
    # decisionBox.items valueRef'leri metrics'te var mı (varsa)
    for it in ag.get("decisionBox", {}).get("items", []):
        vr = it.get("valueRef")
        if isinstance(vr, str) and vr not in mkeys:
            W(f"accordion-groups: decisionBox valueRef '{vr}' metrics.json'da YOK")
    if not (grouped_set - real_slugs) and not (real_slugs - grouped_set) and \
       not [k for k in grouped_set if grouped.count(k) > 1]:
        OK(f"Accordion gruplama: {len(grouped)} slug ↔ {len(real_slugs)} bölüm BİREBİR örtüşüyor ✓ (eksik/fazla/tekrar yok)")
else:
    OK("Accordion gruplama kapısı atlandı (accordion-groups.json yok)")

# 5) MATEMATİK / TUTARLILIK
def mv(k): return metrics[k]["value"]
def approx(a,b,tol=0.02): return abs(a-b) <= tol*max(abs(a),abs(b),1)
# huni oranları
if approx(mv("market.sam_try")/mv("market.tam_try"), 0.187): OK("SAM/TAM ≈ %18,7 ✓")
else: E("SAM/TAM oranı tutmuyor")
if approx(mv("market.som_try")/mv("market.sam_try"), 0.38): OK("SOM/SAM ≈ %38 ✓ (2032 hedef pay)")
else: E(f"SOM/SAM oranı %38 tutmuyor: {mv('market.som_try')/mv('market.sam_try'):.3f}")
# ÇOK-AKIŞLI MODEL: gelir artık SOM×take_rate tek formülüyle değil, 7 gelir akışının toplamıyla doğar.
# Bu yüzden eski 'SOM×take==median' tek-formül kontrolü kaldırıldı; yerine akış-toplamı = medyan kontrolü konuldu.
bd = docs["data/financial-breakdown.json"]["revenueStreams"]
streams_2032 = sum(s["y2032_medyan"] for s in bd["streams"])
if approx(streams_2032, mv("revenue.median"), tol=0.005): OK(f"Gelir akışları 2032 medyan toplamı ({streams_2032:,}) == revenue.median ✓")
else: E(f"Gelir akışları toplamı {streams_2032:,} ≠ revenue.median {mv('revenue.median'):,}")
# totalByYear medyan son yıl == streams toplamı (iç tutarlılık)
tby = bd["totalByYear"]["medyan"]
if approx(tby.get("2032", 0), streams_2032, tol=0.01): OK(f"totalByYear medyan 2032 ({tby.get('2032'):,}) == akış toplamı ✓")
else: E(f"totalByYear medyan 2032={tby.get('2032'):,} ≠ akış toplamı {streams_2032:,}")
# hedef pay metriği var mı + değeri 0.38
if "market.target_share_2032" in metrics and approx(mv("market.target_share_2032"), 0.38, tol=0.001):
    OK("market.target_share_2032 == 0.38 ✓")
else: E("market.target_share_2032 metriği yok veya 0.38 değil")
# Her akışın 2032 byYearMedyan == y2032_medyan (iç tutarlılık)
bad_str = [s["key"] for s in bd["streams"] if s["byYearMedyan"].get("2032") != s["y2032_medyan"]]
if not bad_str: OK("Gelir akışları: her akışın byYearMedyan[2032] == y2032_medyan ✓")
else: E(f"Gelir akışı 2032 byYearMedyan tutmuyor: {bad_str}")
# Senaryo toplamları 2032: kötümser == revenue.pessimist, iyimser == revenue.optimist
tby_all = bd["totalByYear"]
if approx(tby_all["kotumser"]["2032"], mv("revenue.pessimist"), tol=0.005): OK("Gelir akışı kötümser 2032 == revenue.pessimist ✓")
else: E(f"kötümser 2032 {tby_all['kotumser']['2032']:,} ≠ revenue.pessimist {mv('revenue.pessimist'):,}")
if approx(tby_all["iyimser"]["2032"], mv("revenue.optimist"), tol=0.005): OK("Gelir akışı iyimser 2032 == revenue.optimist ✓")
else: E(f"iyimser 2032 {tby_all['iyimser']['2032']:,} ≠ revenue.optimist {mv('revenue.optimist'):,}")
# İK 2031 departman dağılımı toplamı == 256
deps = docs["data/hr-plan.json"].get("departmentsFinal2031", [])
dsum = sum(x["count"] for x in deps)
if dsum == 256: OK(f"İK departman dağılımı toplamı == 256 ✓ ({len(deps)} departman)")
else: E(f"İK departman toplamı {dsum} ≠ 256 — Bölüm 12 tablosuyla çelişir")
# tam değer ile yuvarlanmış tutar
if approx(mv("revenue.potential_exact"), mv("revenue.median"), tol=0.005): OK("revenue.potential_exact ≈ revenue.median ✓")
else: W("revenue.potential_exact ile revenue.median farkı > %0,5")
# sermaye çıpası (256 göçü sonrası: investor_pocket 15M sabit; breakeven_spend ~32M kümülatif)
if mv("capital.investor_pocket")==15000000: OK("investor_pocket = 15M ✓ (yatırımcı çıpası)")
if mv("capital.breakeven_spend")>=30000000: OK("breakeven_spend ≥ 30M ✓ (256 model kümülatif gider)")
else: W("breakeven_spend 256 modeliyle güncel değil olabilir")
# pricing
if approx(mv("pricing.premium_annual")/12, mv("pricing.premium_monthly"), tol=0.01): OK("premium_annual/12 ≈ premium_monthly ✓")
else: W("premium yıllık/aylık tutmuyor")
# finansal model yıllık net = gelir - gider
fin = docs["data/financial-model.json"]["yearly"]
bad=[y["year"] for y in fin if y["revenue"]-y["expense"]!=y["net"]]
if not bad: OK("Finansal model: tüm yıllarda gelir − gider = net ✓")
else: E(f"Finansal model net tutmuyor: {bad}")
# headcount metric ile data uyumu (256 master)
hc2032 = [y for y in fin if y["year"]=="2032"][0]["headcount"]
if hc2032==mv("fin.headcount_2032"): OK(f"Kadro 2032: metric == data ({hc2032}) ✓")
else: E("Kadro 2032 metric/data farkı")
# 256 MASTER kuralları (IK_PLANI_AI_FIRST_256_v1)
hc2031 = [y for y in fin if y["year"]=="2031"][0]["headcount"]
if hc2031==256 and mv("fin.headcount_2031")==256: OK("Kadro 2031 == 256 (İK master) ✓")
else: E(f"Kadro 2031 256 değil: data={hc2031}, metric={mv('fin.headcount_2031')}")
exp2031 = [y for y in fin if y["year"]=="2031"][0]["expense"]
if exp2031 >= 210835740: OK(f"2031 gider ({exp2031:,}) ≥ master yıllık brüt maaş (210.8M) ✓")
else: E(f"2031 gider {exp2031:,} master maaşını (210.8M) karşılamıyor — 256 modeli tutarsız")
# KADRO EĞRİSİ: 2026≤30, monoton artan, 2031=256 (pragmatik büyüme rampası)
hcCurve = docs["data/financial-model.json"]["parameters"].get("headcountCurve")
if hcCurve:
    yrs = sorted(hcCurve, key=lambda k: int(k))
    vals = [hcCurve[k] for k in yrs]
    if hcCurve.get("2026", 0) <= 38: OK(f"Kadro 2026 ≤ 38 ({hcCurve.get('2026')}) ✓ (agresif plan tavanı)")
    else: E(f"Kadro 2026 > 38: {hcCurve.get('2026')} — agresif plan tavanı aşıldı")
    if all(vals[i] <= vals[i+1] for i in range(len(vals)-1)): OK(f"Kadro eğrisi monoton artan ✓ {vals}")
    else: E(f"Kadro eğrisi monoton değil: {vals}")
    if hcCurve.get("2031")==256: OK("Kadro eğrisi 2031 == 256 ✓")
    else: E(f"Kadro eğrisi 2031 ≠ 256: {hcCurve.get('2031')}")
else: W("parameters.headcountCurve yok — kadro eğrisi kontrol edilemedi")
if mv("ai.fte_with")==256: OK("ai.fte_with == 256 (resmi hedef) ✓")
else: E(f"ai.fte_with 256 değil: {mv('ai.fte_with')}")
# 5b) ÇAPRAZ KAYNAK EŞİTLİĞİ — başlık metric'leri data hücreleriyle birebir aynı mı (sürükleme yok)
y = {r["year"]: r for r in fin}
xchecks = [
    ("fin.revenue_2027", y["2027"]["revenue"]), ("fin.net_2027", y["2027"]["net"]),
    ("fin.cash_2032", y["2032"]["cashEnd"]), ("fin.headcount_2026", y["2026 H2"]["headcount"]),
    ("fin.headcount_2027", y["2027"]["headcount"]), ("fin.headcount_2032", y["2032"]["headcount"]),
]
pr = docs["data/financial-model.json"]["pricing"]
xchecks += [("pricing.premium_annual", pr["premiumAnnual"]), ("pricing.vitrin_monthly", pr["vitrinMonthly"]),
            ("pricing.starter_monthly", pr["starterMonthly"]), ("pricing.doping_per", pr["dopingPer"]),
            ("market.take_rate", pr["takeRate"])]
ai = docs["data/hr-plan.json"]["aiEfficiency"]
xchecks += [("ai.fte_without", ai["fteWithout"]), ("ai.fte_with", ai["fteWith"]),
            ("ai.fte_saved", ai["fteSaved"]), ("ai.annual_saving", ai["annualSaving"])]
mk = docs["data/market-tam-sam-som.json"]
xchecks += [("market.total_realestate_2024", mk["transactionView"]["totalRealEstate"]),
            ("market.land_commercial_2024", mk["transactionView"]["landCommercial"]),
            ("market.tam_try", mk["valueFunnel"]["tam"]["value"]),
            ("market.som_try", mk["valueFunnel"]["som"]["value"]),
            ("revenue.median", mk["scenarios"][1]["revenue"]),
            ("revenue.optimist", mk["scenarios"][2]["revenue"])]
xbad = [(k, v, mv(k)) for k, v in xchecks if mv(k) != v]
if not xbad: OK(f"Çapraz eşitlik: {len(xchecks)} başlık metric, data hücreleriyle BİREBİR aynı ✓ (sürükleme yok)")
else:
    for k, v, mvv in xbad: E(f"ÇAPRAZ SÜRÜKLEME: {k} metric={mvv} ≠ data={v}")

# reconciliation kanonik anahtarları var mı
for it in docs["reconciliation.json"]["items"]:
    for k in it.get("canonical", []):
        if k not in mkeys: E(f"reconciliation kanonik anahtar yok: {k}")
OK("Reconciliation kanonik anahtarları metrics'te mevcut")

# 6) MANIFEST ENVANTER DRIFT — generated envanter gerçek dosyalarla tutarlı mı (elle-yönetilen indeks riskini önler)
man = docs.get("manifest.json", {})
real_sec_files = sorted(os.path.basename(p) for p in glob.glob(DB + "/sections/*.json"))
real_data_files = sorted(os.path.basename(p) for p in glob.glob(DB + "/data/*.json"))
ordered_slugs = []
for p in sorted(glob.glob(DB + "/sections/*.json"), key=lambda x: os.path.basename(x)):
    try: sl = json.load(open(p, encoding="utf-8")).get("slug")
    except Exception: sl = None
    if sl: ordered_slugs.append(sl)
mc = man.get("counts", {})
if mc.get("sections") == len(real_sec_files): OK(f"Manifest counts.sections == gerçek ({len(real_sec_files)}) ✓")
else: E(f"Manifest counts.sections={mc.get('sections')} ≠ gerçek {len(real_sec_files)} (envanter drift)")
if mc.get("dataFiles") == len(real_data_files): OK(f"Manifest counts.dataFiles == gerçek ({len(real_data_files)}) ✓")
else: E(f"Manifest counts.dataFiles={mc.get('dataFiles')} ≠ gerçek {len(real_data_files)} (envanter drift)")
if man.get("sectionOrder") == ordered_slugs: OK(f"Manifest sectionOrder gerçek bölüm sırasıyla bire bir ✓ ({len(ordered_slugs)} slug)")
else: E("Manifest sectionOrder gerçek slug sırasıyla uyuşmuyor (envanter drift)")
if mc.get("metrics") == len(metrics): OK(f"Manifest counts.metrics == gerçek ({len(metrics)}) ✓")
else: W(f"Manifest counts.metrics={mc.get('metrics')} ≠ gerçek {len(metrics)}")

# 7) dataRef BÜTÜNLÜĞÜ — bloklardaki her dataRef gerçek bir data/ veya shared/ dosyası mı (sessiz render kopması önlenir)
shared_slugs = set(r.split("/")[1].replace(".json", "") for r in docs if r.startswith("shared/"))
valid_refs = data_files | shared_slugs
def datarefs_of(x, acc):
    if isinstance(x, dict):
        if isinstance(x.get("dataRef"), str): acc.append(x["dataRef"])
        for v in x.values(): datarefs_of(v, acc)
    elif isinstance(x, list):
        for v in x: datarefs_of(v, acc)
dref_bad = []
for rel in sec_files:
    drs = []; datarefs_of(docs[rel].get("blocks", []), drs)
    for dr in drs:
        if dr not in valid_refs: dref_bad.append((rel, dr))
if not dref_bad: OK("Tüm section dataRef'leri gerçek data/shared dosyalarına işaret ediyor ✓")
else:
    for rel, dr in dref_bad: E(f"{rel}: KIRIK dataRef '{dr}'")

# 8) DATA DOSYASI valueRef BÜTÜNLÜĞÜ — investor-dashboard/accordion valueRef'leri metrics'te mi (düz string yerine tek kaynak)
def valuerefs_only(x, acc):
    if isinstance(x, dict):
        if isinstance(x.get("valueRef"), str): acc.append(x["valueRef"])
        for v in x.values(): valuerefs_only(v, acc)
    elif isinstance(x, list):
        for v in x: valuerefs_only(v, acc)
dvr_bad = []
for rel in [r for r in docs if r.startswith("data/")]:
    vr = []; valuerefs_only(docs[rel], vr)
    for k in vr:
        if k not in mkeys: dvr_bad.append((rel, k))
if not dvr_bad: OK("Data dosyası valueRef'leri metrics'te mevcut ✓")
else:
    for rel, k in dvr_bad: E(f"{rel}: KIRIK data valueRef '{k}'")

# 9) STATİK TABLO TEKRARI — dataRef component'i olan bölüm ayrıca statik 'table' bloğu taşıyor mu (P0 #2 regresyon kapısı)
# Yalnız statik tablonun YERİNE geçen component'ler (P0 #2). revenueDriverMatrix/kpiBoard hariç:
# o bölümler (08/01b) meşru biçimde ayrı tablolar da taşıyabilir.
COMPONENT_TYPES = {"riskGateMatrix", "capitalReleasePlan", "governanceMatrix", "investorReturnModel",
                   "investmentOptionsCompare"}
def block_types(x, acc):
    if isinstance(x, dict):
        if isinstance(x.get("type"), str): acc.add(x["type"])
        for v in x.values(): block_types(v, acc)
    elif isinstance(x, list):
        for v in x: block_types(v, acc)
stat_dup = []
for rel in sec_files:
    types = set(); block_types(docs[rel].get("blocks", []), types)
    comp = types & COMPONENT_TYPES
    if comp and "table" in types:
        stat_dup.append((rel, sorted(comp)))
if not stat_dup: OK("dataRef component'li bölümlerde statik 'table' tekrarı YOK ✓ (P0 #2 korunuyor)")
else:
    for rel, comp in stat_dup: W(f"OLASI STATİK TABLO TEKRARI: {rel} hem {comp} component'i hem 'table' bloğu taşıyor")

# RAPOR
print("="*60)
print("DOĞRULAMA RAPORU")
print("="*60)
print(f"\n✅ BAŞARILI ({len(oks)}):")
for m in oks: print("  •", m)
if warns:
    print(f"\n⚠️  UYARI ({len(warns)}):")
    for m in warns: print("  •", m)
if errors:
    print(f"\n❌ HATA ({len(errors)}):")
    for m in errors: print("  •", m)
else:
    print("\n❌ HATA: 0 — tüm kritik kontroller geçti.")
print("\nSONUÇ:", "GEÇTİ ✓" if not errors else "BAŞARISIZ ✗")
