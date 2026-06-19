# -*- coding: utf-8 -*-
"""arsam.net JSON veritabanı doğrulayıcı: geçerlilik + ref bütünlüğü + tekrar taraması + matematik."""
import json, os, re, glob

DB = "/sessions/elegant-funny-archimedes/mnt/database"
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

# 5) MATEMATİK / TUTARLILIK
def mv(k): return metrics[k]["value"]
def approx(a,b,tol=0.02): return abs(a-b) <= tol*max(abs(a),abs(b),1)
# huni oranları
if approx(mv("market.sam_try")/mv("market.tam_try"), 0.187): OK("SAM/TAM ≈ %18,7 ✓")
else: E("SAM/TAM oranı tutmuyor")
if approx(mv("market.som_try")/mv("market.sam_try"), 0.10): OK("SOM/SAM ≈ %10 ✓")
else: E("SOM/SAM oranı tutmuyor")
if approx(mv("market.som_try")*mv("market.take_rate"), mv("revenue.median"), tol=0.01): OK("SOM × take_rate ≈ revenue.median (519M) ✓")
else: E(f"SOM×take_rate={mv('market.som_try')*mv('market.take_rate'):.0f} ≠ revenue.median")
# tam değer ile yuvarlanmış tutar
if approx(mv("revenue.potential_exact"), mv("revenue.median"), tol=0.005): OK("revenue.potential_exact ≈ revenue.median ✓")
else: W("revenue.potential_exact ile revenue.median farkı > %0,5")
# sermaye çıpası
if mv("capital.investor_pocket")==15000000 and mv("capital.breakeven_spend")==15000000: OK("investor_pocket = breakeven_spend = 15M ✓ (iki kaynak uyumlu)")
# pricing
if approx(mv("pricing.premium_annual")/12, mv("pricing.premium_monthly"), tol=0.01): OK("premium_annual/12 ≈ premium_monthly ✓")
else: W("premium yıllık/aylık tutmuyor")
# finansal model yıllık net = gelir - gider
fin = docs["data/financial-model.json"]["yearly"]
bad=[y["year"] for y in fin if y["revenue"]-y["expense"]!=y["net"]]
if not bad: OK("Finansal model: tüm yıllarda gelir − gider = net ✓")
else: E(f"Finansal model net tutmuyor: {bad}")
# headcount metric ile data uyumu
hc2032 = [y for y in fin if y["year"]=="2032"][0]["headcount"]
if hc2032==mv("fin.headcount_2032"): OK("Kadro 2032: metric == data (149) ✓")
else: E("Kadro 2032 metric/data farkı")
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
