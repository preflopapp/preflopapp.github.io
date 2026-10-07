#!/usr/bin/env python3
"""Static checks for the site. Run before every deploy.

Fails on: an internal link or asset that does not exist, a shared block
(head/header/footer) that differs from index.html's copy, a page missing its
<title>/description/canonical, a canonical page whose og:title/og:description/
og:url are missing or whose og:url is not its canonical, a page without exactly
one <h1>, an <img> without alt/width/height, the old product name, or a price
or free-tier number that disagrees with facts.json (see check_facts).
"""
import json, pathlib, re, sys
from html.parser import HTMLParser

SHARED = ("head", "header", "footer")
# The playable landing page and the shared-hand page (s/) intentionally use
# their own app-matched layouts.
# All metadata, link, asset, and banned-name checks still apply.
INDEPENDENT_LAYOUTS = {"landing/index.html", "s/index.html"}
BANNED = ("Preflop Trainer",)
SKIP_DIRS = {"scripts", "_site", "node_modules"}

class _Refs(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []; self.meta = set(); self.title = False
        self.canonical = None; self.og = {}; self.h1 = 0; self.bad_imgs = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for key in ("href", "src"):
            if a.get(key): self.refs.append(a[key])
        if a.get("srcset"):
            self.refs += [part.strip().split()[0] for part in a["srcset"].split(",")]
        if tag == "title": self.title = True
        if tag == "h1": self.h1 += 1
        if tag == "img":
            missing = [k for k in ("alt", "width", "height") if k not in a]
            if missing: self.bad_imgs.append(f"{a.get('src')} (no {'/'.join(missing)})")
        if tag == "meta" and (a.get("property") or "").startswith("og:"): self.og[a["property"]] = a.get("content") or ""
        if tag == "meta" and a.get("name") == "description" and a.get("content"): self.meta.add("description")
        if tag == "link" and a.get("rel") == "canonical" and a.get("href"):
            self.meta.add("canonical"); self.canonical = a["href"]

def html_pages(root):
    out = []
    for p in sorted(root.rglob("*.html")):
        rel = p.relative_to(root).parts
        if any(part.startswith(".") or part in SKIP_DIRS for part in rel): continue
        out.append(p)
    return out

def extract_block(text, name):
    m = re.search(rf"<!-- shared:{name} -->(.*?)<!-- /shared:{name} -->", text, re.S)
    return m.group(1) if m else None

def _resolves(root, ref):
    path = ref.split("#")[0].split("?")[0]
    if not path: return True
    target = root / path.lstrip("/")
    if path.endswith("/"): return (target / "index.html").is_file()
    return target.is_file() or (target / "index.html").is_file()

# A dollar amount written on a page, and "20 hands a day" / "20 more every
# day" / "20 free hands every day" and the like.
PRICE = re.compile(r"\$(\d+\.\d\d)")
DAILY = re.compile(r"\b(\d+) (?:more |new |free )?hands? (?:a day|every day|each day)", re.I)
FACT = re.compile(r"<!-- fact:(\w+) -->(.*?)<!-- /fact -->", re.S)

def check_facts(root, pages):
    """Every price and daily-hand figure on the site against facts.json.

    The site sold $11.99 a month and a $59.99 lifetime for days after the app
    moved to other prices, because nothing tied the two together. facts.json is
    that tie: the iOS repo checks it against the app's StoreKit configuration,
    and this checks every page against it. A `<!-- fact:key -->` marker must
    hold that fact's value exactly; any other dollar amount must be one of the
    plan prices; any "N hands a day" must be the daily free figure.
    """
    errors = []
    path = root / "facts.json"
    if not path.is_file():
        return [f"ERROR facts.json: missing"]
    facts = json.loads(path.read_text())
    values = {**facts["prices"], "annualPerMonth": facts["annualPerMonth"],
              "dailyFreeHands": str(facts["dailyFreeHands"]),
              "freeHistoryHands": str(facts["freeHistoryHands"])}
    # The plan prices, and annual as a monthly figure ("about $3.33 a month").
    prices = set(facts["prices"].values()) | {facts["annualPerMonth"]}
    for page in pages:
        rel = page.relative_to(root).as_posix()
        # Inline images and fonts are base64; nothing in them is a claim.
        text = re.sub(r"data:[\w/+.-]+;base64,[A-Za-z0-9+/=]+", "", page.read_text())
        for key, value in FACT.findall(text):
            if key not in values:
                errors.append(f"ERROR {rel}: unknown fact '{key}'")
            elif value.strip() != values[key]:
                errors.append(f"ERROR {rel}: fact {key} says {value.strip()}, facts.json says {values[key]}")
        for amount in PRICE.findall(text):
            if amount not in prices:
                errors.append(f"ERROR {rel}: price ${amount} is not a plan price in facts.json")
        for count in DAILY.findall(text):
            if count != values["dailyFreeHands"]:
                errors.append(f"ERROR {rel}: '{count} hands a day' but facts.json says {values['dailyFreeHands']}")
    return errors

def check_site(root):
    root = pathlib.Path(root); errors = []
    pages = html_pages(root)
    index = root / "index.html"
    canon = {n: extract_block(index.read_text(), n) for n in SHARED} if index.is_file() else {}
    for page in pages:
        rel = page.relative_to(root).as_posix(); text = page.read_text()
        for bad in BANNED:
            if bad in text: errors.append(f"ERROR {rel}: contains banned string '{bad}'")
        parser = _Refs(); parser.feed(text)
        if not parser.title: errors.append(f"ERROR {rel}: missing <title>")
        if "description" not in parser.meta: errors.append(f"ERROR {rel}: missing meta description")
        if rel != "404.html" and "canonical" not in parser.meta: errors.append(f"ERROR {rel}: missing canonical link")
        # Link previews (iMessage, Slack, social) read these, not <title>.
        if parser.canonical:
            for prop in ("og:title", "og:description", "og:url"):
                if not parser.og.get(prop): errors.append(f"ERROR {rel}: missing {prop}")
            if parser.og.get("og:url") and parser.og["og:url"] != parser.canonical:
                errors.append(f"ERROR {rel}: og:url {parser.og['og:url']} differs from canonical {parser.canonical}")
        if parser.h1 != 1: errors.append(f"ERROR {rel}: {parser.h1} <h1> elements, expected 1")
        for img in parser.bad_imgs: errors.append(f"ERROR {rel}: <img> {img}")
        for n in (() if rel in INDEPENDENT_LAYOUTS else SHARED):
            block = extract_block(text, n)
            if block is None: errors.append(f"ERROR {rel}: missing shared:{n} block")
            elif canon.get(n) is not None and block != canon[n]:
                errors.append(f"ERROR {rel}: shared:{n} block differs from index.html")
        for ref in parser.refs:
            if re.match(r"^[a-z]+:", ref) or ref.startswith("//") or ref.startswith("#"): continue
            if ref.startswith("/") or not ref.startswith(("http", "mailto")):
                absolute = ref if ref.startswith("/") else "/" + (page.parent.relative_to(root) / ref).as_posix()
                if not _resolves(root, absolute):
                    errors.append(f"ERROR {rel}: broken link {ref}")
    errors += check_facts(root, pages)
    sitemap = root / "sitemap.xml"
    if sitemap.is_file():
        for loc in re.findall(r"<loc>https://preflopapp\.com(/[^<]*)</loc>", sitemap.read_text()):
            if not _resolves(root, loc):
                errors.append(f"ERROR sitemap.xml: {loc} does not exist")
    return errors

def main(argv):
    root = pathlib.Path(argv[1] if len(argv) > 1 else ".")
    errors = check_site(root)
    for e in errors: print(e)
    print(f"{len(html_pages(root))} pages checked, {len(errors)} problem(s)")
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv))
