#!/usr/bin/env python3
"""Static checks for the site. Run before every deploy.

Fails on: an internal link or asset that does not exist, a shared block
(head/header/footer) that differs from index.html's copy, a page missing its
<title>/description/canonical, or the old product name.
"""
import pathlib, re, sys
from html.parser import HTMLParser

SHARED = ("head", "header", "footer")
BANNED = ("Preflop Trainer",)
SKIP_DIRS = {"scripts", "_site", "node_modules"}

class _Refs(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs = []; self.meta = set(); self.title = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for key in ("href", "src"):
            if a.get(key): self.refs.append(a[key])
        if a.get("srcset"):
            self.refs += [part.strip().split()[0] for part in a["srcset"].split(",")]
        if tag == "title": self.title = True
        if tag == "meta" and a.get("name") == "description" and a.get("content"): self.meta.add("description")
        if tag == "link" and a.get("rel") == "canonical" and a.get("href"): self.meta.add("canonical")

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
        for n in SHARED:
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
