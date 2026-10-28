#!/usr/bin/env python3
"""Static checks for the site. Run before every deploy.

Fails on: an internal link or asset that does not exist, a shared block
(head/header/footer) that differs from index.html's copy, a page missing its
<title>/description/canonical, a canonical page whose og:title/og:description/
og:url are missing or whose og:url is not its canonical, a page without exactly
one <h1>, an <img> without alt/width/height, the old product name, or a price
or free-tier number that disagrees with facts.json (see check_facts).

Anywhere on the site it also fails an external asset (a src, srcset, or a
<link> stylesheet/preload/icon pointing off the origin, or a url()/@import in a
local stylesheet): the privacy page promises no third-party requests.

Pages under /next/ (the redesign preview) have their own rules, see
check_next: noindex and out of the sitemap, a page CSP that allows only
'self' scripts, no inline script or style, no render-blocking script, the CTA
link in step with next/js/config.js, and JS/CSS byte budgets.
"""
import gzip, json, pathlib, re, sys
from html.parser import HTMLParser

SHARED = ("head", "header", "footer")
# The playable landing page and the shared-hand page (s/) intentionally use
# their own app-matched layouts.
# All metadata, link, asset, and banned-name checks still apply.
INDEPENDENT_LAYOUTS = {"landing/index.html", "s/index.html"}
NEXT_PREFIX = "next/"  # the /next/ preview: independent layout, see check_next
# Gzipped bytes, summed over the files a /next/ page loads. The spec's budget is
# 150 KB of JS (GSAP core + ScrollTrigger are ~46 KB of it); CSS has no spec
# number, 30 KB is generous for a token sheet and a component sheet.
JS_BUDGET = 150 * 1024
CSS_BUDGET = 30 * 1024
ASSET_RELS = {"stylesheet", "preload", "modulepreload", "prefetch", "icon",
              "shortcut", "apple-touch-icon", "manifest"}
BANNED = ("Preflop Trainer",)
SKIP_DIRS = {"scripts", "_site", "node_modules"}

class _Refs(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []; self.meta = set(); self.title = False
        self.canonical = None; self.og = {}; self.h1 = 0; self.bad_imgs = []
        self.assets = []; self.scripts = []; self.stylesheets = []; self.inline = []
        self.robots = ""; self.csp = ""; self.ctas = []; self._script = None
    def handle_endtag(self, tag):
        if tag == "script": self._script = None
    def handle_data(self, data):
        if self._script is not None and data.strip(): self.inline.append("inline <script>")
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script":
            self._script = tag
            if a.get("src"): self.scripts.append(a)
        for name in a:
            if name.startswith("on"): self.inline.append(f"{name}= attribute")
        if "style" in a: self.inline.append("style= attribute")
        if tag == "meta" and (a.get("name") or "").lower() == "robots": self.robots = (a.get("content") or "").lower()
        if tag == "meta" and (a.get("http-equiv") or "").lower() == "content-security-policy": self.csp = a.get("content") or ""
        if tag == "a" and "data-cta" in a: self.ctas.append(a.get("href") or "")
        if tag == "link":
            rels = set((a.get("rel") or "").lower().split())
            if rels & ASSET_RELS and a.get("href"):
                self.assets.append(a["href"])
                if "stylesheet" in rels: self.stylesheets.append(a["href"])
        for key in ("src", "srcset"):
            if a.get(key):
                self.assets += [part.strip().split()[0] for part in a[key].split(",")] if key == "srcset" else [a[key]]
        for key in ("href", "src"):
            if a.get(key): self.refs.append(a[key])
        if a.get("srcset"):
            self.refs += [part.strip().split()[0] for part in a["srcset"].split(",")]
        if tag == "title": self.title = True
        if tag == "h1": self.h1 += 1
        if tag == "img":
            missing = [k for k in ("alt", "width", "height") if k not in a]
            if missing: self.bad_imgs.append(f"{a.get('src')} (no {'/'.join(missing)})")
            bad = [k for k in ("width", "height") if k in a and not (a[k] or "").strip().isdigit()]
            if bad: self.bad_imgs.append(f"{a.get('src')} ({'/'.join(bad)} is not a pixel count)")
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
# A trial offer: "free trial", "7-day free", with the site's non-breaking hyphen.
TRIAL = re.compile(r"free trial|\d(?:&#8209;|[-\u2011 ])day free", re.I)

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
    # The app's only trial is on annual, and the paywall serves the lineup in
    # paywall.json. No annual there means no trial anywhere: a page that
    # advertises one is a promise the paywall breaks (app issue #551).
    paywall = root / "paywall.json"
    trial_offered = (not paywall.is_file()) or "annual" in json.loads(paywall.read_text()).get("plans", [])
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
        if not trial_offered and TRIAL.search(text):
            errors.append(f"ERROR {rel}: advertises a free trial but paywall.json has no annual plan")
        for count in DAILY.findall(text):
            if count != values["dailyFreeHands"]:
                errors.append(f"ERROR {rel}: '{count} hands a day' but facts.json says {values['dailyFreeHands']}")
    return errors

def _external(ref):
    return bool(re.match(r"^(?:[a-z][a-z0-9+.-]*:)?//", ref.strip(), re.I)) and not ref.strip().lower().startswith("data:")

def _local(root, page, ref):
    """The file a page's href/src names, or None if it is off-site or absent."""
    path = ref.split("#")[0].split("?")[0]
    if not path or _external(path) or re.match(r"^[a-z]+:", path): return None
    target = root / path.lstrip("/") if path.startswith("/") else page.parent / path
    return target if target.is_file() else None

def _stylesheets(root, pages):
    seen = {}
    for page in pages:
        parser = _Refs(); parser.feed(page.read_text())
        for ref in parser.stylesheets:
            f = _local(root, page, ref)
            if f: seen[f] = None
    return list(seen)

def check_css_assets(root, pages):
    """No url() or @import in a stylesheet may leave the origin."""
    errors = []
    for css in _stylesheets(root, pages):
        text = re.sub(r"/\*.*?\*/", "", css.read_text(), flags=re.S)
        for ref in re.findall(r"url\(\s*['\"]?([^'\")]+)", text) + re.findall(r"@import\s+['\"]([^'\"]+)", text):
            if _external(ref): errors.append(f"ERROR {css.relative_to(root).as_posix()}: external asset {ref}")
    return errors

def _gz(path):
    return len(gzip.compress(path.read_bytes(), 9, mtime=0))

def check_next(root, next_pages):
    """The /next/ preview: hidden, locked down, light on bytes, CTA in step.

    Not linked, so it must say noindex and stay out of the sitemap. Its pages
    carry their own CSP (the _headers rule removes the site-wide one, as for
    /landing and /s) allowing scripts from 'self' only, which means no inline
    script, no inline style and no event-handler attributes, and scripts that
    do not block first paint. Every a[data-cta] must link where
    next/js/config.js says, since without JS the HTML's href is what loads.
    """
    errors = []
    if not next_pages: return errors
    sitemap = root / "sitemap.xml"
    if sitemap.is_file() and re.search(r"<loc>[^<]*/next(?:/|<)", sitemap.read_text()):
        errors.append("ERROR sitemap.xml: lists a /next/ page")
    headers = root / "_headers"
    if headers.is_file():
        block = re.search(r"(?m)^/next/\*\s*\n((?:[ \t]+.*\n?)+)", headers.read_text())
        if not block or not re.search(r"^\s*! Content-Security-Policy\s*$", block.group(1), re.M):
            errors.append("ERROR _headers: /next/* must detach the site-wide Content-Security-Policy")
    config = root / "next/js/config.js"
    url = re.search(r"testflightUrl:\s*[\"']([^\"']+)", config.read_text()) if config.is_file() else None
    js_total = css_total = 0
    js_seen, css_seen = set(), set()
    for page, rel, p in next_pages:
        if "noindex" not in p.robots: errors.append(f"ERROR {rel}: /next/ page needs <meta name=robots content=noindex>")
        scripts = re.findall(r"script-src ([^;]*)", p.csp)
        if not scripts: errors.append(f"ERROR {rel}: missing page CSP with script-src")
        elif scripts[0].split() != ["'self'"]: errors.append(f"ERROR {rel}: script-src must be exactly 'self', found {scripts[0].strip()}")
        for what in sorted(set(p.inline)): errors.append(f"ERROR {rel}: {what} (blocked by the page CSP)")
        for a in p.scripts:
            if "defer" not in a and "async" not in a and a.get("type") != "module":
                errors.append(f"ERROR {rel}: render-blocking <script src={a['src']}>, add defer")
            f = _local(root, page, a["src"])
            if f and f not in js_seen: js_seen.add(f); js_total += _gz(f)
        for ref in p.stylesheets:
            f = _local(root, page, ref)
            if f and f not in css_seen: css_seen.add(f); css_total += _gz(f)
        if url:
            for href in p.ctas:
                if href != url.group(1):
                    errors.append(f"ERROR {rel}: a[data-cta] links to {href}, next/js/config.js says {url.group(1)}")
        elif p.ctas:
            errors.append(f"ERROR {rel}: a[data-cta] on the page but next/js/config.js has no testflightUrl")
    if js_total > JS_BUDGET: errors.append(f"ERROR /next/ JavaScript is {js_total} bytes gzipped, budget {JS_BUDGET}")
    if css_total > CSS_BUDGET: errors.append(f"ERROR /next/ CSS is {css_total} bytes gzipped, budget {CSS_BUDGET}")
    return errors

def check_site(root):
    root = pathlib.Path(root); errors = []
    pages = html_pages(root)
    next_pages = []
    index = root / "index.html"
    canon = {n: extract_block(index.read_text(), n) for n in SHARED} if index.is_file() else {}
    for page in pages:
        rel = page.relative_to(root).as_posix(); text = page.read_text()
        for bad in BANNED:
            if bad in text: errors.append(f"ERROR {rel}: contains banned string '{bad}'")
        parser = _Refs(); parser.feed(text)
        if not parser.title: errors.append(f"ERROR {rel}: missing <title>")
        if "description" not in parser.meta: errors.append(f"ERROR {rel}: missing meta description")
        is_next = rel.startswith(NEXT_PREFIX)
        if is_next: next_pages.append((page, rel, parser))
        if rel != "404.html" and not is_next and "canonical" not in parser.meta: errors.append(f"ERROR {rel}: missing canonical link")
        # Link previews (iMessage, Slack, social) read these, not <title>.
        if parser.canonical:
            for prop in ("og:title", "og:description", "og:url"):
                if not parser.og.get(prop): errors.append(f"ERROR {rel}: missing {prop}")
            if parser.og.get("og:url") and parser.og["og:url"] != parser.canonical:
                errors.append(f"ERROR {rel}: og:url {parser.og['og:url']} differs from canonical {parser.canonical}")
        if parser.h1 != 1: errors.append(f"ERROR {rel}: {parser.h1} <h1> elements, expected 1")
        for img in parser.bad_imgs: errors.append(f"ERROR {rel}: <img> {img}")
        for n in (() if rel in INDEPENDENT_LAYOUTS or is_next else SHARED):
            block = extract_block(text, n)
            if block is None: errors.append(f"ERROR {rel}: missing shared:{n} block")
            elif canon.get(n) is not None and block != canon[n]:
                errors.append(f"ERROR {rel}: shared:{n} block differs from index.html")
        for ref in parser.assets:
            if _external(ref): errors.append(f"ERROR {rel}: external asset {ref}")
        for ref in parser.refs:
            if re.match(r"^[a-z]+:", ref) or ref.startswith("//") or ref.startswith("#"): continue
            if ref.startswith("/") or not ref.startswith(("http", "mailto")):
                absolute = ref if ref.startswith("/") else "/" + (page.parent.relative_to(root) / ref).as_posix()
                if not _resolves(root, absolute):
                    errors.append(f"ERROR {rel}: broken link {ref}")
    errors += check_facts(root, pages)
    errors += check_css_assets(root, pages)
    errors += check_next(root, next_pages)
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
