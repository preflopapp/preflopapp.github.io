#!/usr/bin/env python3
"""Stamp every local asset URL with ?v=<hash of the file>, so a URL changes
when its file does.

Live /next/css and /next/js were served with a 4-hour max-age under fixed
names (ISSUES LIVE-02, docs/redesign/SPEC.md §4.8), so after a deploy a
visitor could get new HTML with old CSS and JS. With a stamped URL the HTML
names the exact bytes it was written against, and _headers can make the
files immutable.

What it stamps: src, srcset and <link rel=stylesheet|preload|icon|
apple-touch-icon> href on every HTML page except s/index.html (the shared-hand
page keeps its own pinned head), and every url() in next/css/*.css. The CSS
goes first, because stamping a font changes tokens.css and so its own stamp.
A font's preload and its @font-face url() come out identical (one hash of one
file), so the font downloads once.

The stamp is the first 8 hex characters of the file's SHA-256. Run it after
changing any asset, before committing; check-site.py fails a missing or stale
stamp. URLs that JS builds (the suits in demo.js) are not stamped, not even
where the HTML names them too (the no-JS copy of the demo's first hand): a
stamped copy beside the script's plain URL downloads the file twice. Rename
those files when they change (.claude/rules/cache-and-headers.md).

    python3 scripts/stamp-assets.py [root]           rewrite in place
    python3 scripts/stamp-assets.py --check [root]   list what is stale, exit 1
"""
import hashlib, pathlib, re, sys

SKIP_DIRS = {"scripts", "_site", "node_modules", "docs"}
UNSTAMPED_PAGES = {"s/index.html"}
STAMP_RELS = {"stylesheet", "preload", "icon", "apple-touch-icon"}
# Files whose URLs JS builds; kept in step with check-site.py's UNSTAMPED.
UNSTAMPED = ("assets/suits/",)

TAG = re.compile(r"<(?P<name>[a-zA-Z][\w-]*)\b(?P<attrs>[^>]*)>")
ATTR = re.compile(r"""(?P<key>[\w:-]+)\s*=\s*(?P<q>["'])(?P<value>.*?)(?P=q)""", re.S)
CSS_URL = re.compile(r"""url\(\s*(?P<q>["']?)(?P<value>[^"')]+)(?P=q)\s*\)""")


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:8]


def pages(root):
    out = []
    for p in sorted(root.rglob("*.html")):
        rel = p.relative_to(root)
        if any(part.startswith(".") or part in SKIP_DIRS for part in rel.parts): continue
        if rel.as_posix() in UNSTAMPED_PAGES: continue
        out.append(p)
    return out


def target(root, base, url):
    """The local file a URL names, or None (off-site, data:, missing)."""
    path = url.split("#")[0].split("?")[0]
    if not path or re.match(r"^(?:[a-z][a-z0-9+.-]*:|//)", path, re.I): return None
    f = root / path.lstrip("/") if path.startswith("/") else base / path
    return f if f.is_file() else None


def stamped(root, base, url):
    """The URL with ?v= set to its file's hash; unchanged if it isn't a local
    file or carries a query other than v (that would need a person)."""
    f = target(root, base, url)
    if not f: return url
    rest, frag = (url.split("#", 1) + [""])[:2]
    path, _, query = rest.partition("?")
    if query and not re.fullmatch(r"v=[0-9a-f]*", query): return url
    if f.resolve().relative_to(root.resolve()).as_posix().startswith(UNSTAMPED):
        return path + (f"#{frag}" if frag else "")
    return f"{path}?v={digest(f)}" + (f"#{frag}" if frag else "")


def stamp_css(root, css):
    text = css.read_text()
    new = CSS_URL.sub(lambda m: f"url({m['q']}{stamped(root, css.parent, m['value'])}{m['q']})", text)
    return text, new


def stamp_html(root, page):
    text = page.read_text()

    def tag(m):
        name, attrs = m["name"].lower(), m["attrs"]
        rel = ""
        for a in ATTR.finditer(attrs):
            if a["key"].lower() == "rel": rel = a["value"].lower()
        keys = {"src", "srcset"}
        if name == "link" and set(rel.split()) & STAMP_RELS: keys.add("href")

        def attr(a):
            key = a["key"].lower()
            if key not in keys: return a.group(0)
            if key == "srcset":
                parts = [p.strip() for p in a["value"].split(",")]
                value = ", ".join(" ".join([stamped(root, page.parent, p.split()[0])] + p.split()[1:]) for p in parts if p)
            else:
                value = stamped(root, page.parent, a["value"])
            return f"{a['key']}={a['q']}{value}{a['q']}"
        return f"<{m['name']}{ATTR.sub(attr, attrs)}>"

    # Comments are left as they are (a commented-out tag is not a reference).
    parts = re.split(r"(<!--.*?-->)", text, flags=re.S)
    new = "".join(p if p.startswith("<!--") else TAG.sub(tag, p) for p in parts)
    return text, new


def run(root, write):
    changed = []
    for css in sorted((root / "next/css").glob("*.css")):
        old, new = stamp_css(root, css)
        if old != new:
            changed.append(css.relative_to(root).as_posix())
            if write: css.write_text(new)
    for page in pages(root):
        old, new = stamp_html(root, page)
        if old != new:
            changed.append(page.relative_to(root).as_posix())
            if write: page.write_text(new)
    return changed


def main(argv):
    args = [a for a in argv[1:] if a != "--check"]
    check = "--check" in argv
    root = pathlib.Path(args[0] if args else ".")
    changed = run(root, write=not check)
    for c in changed: print(("stale " if check else "stamped ") + c)
    if check:
        print(f"{len(changed)} file(s) need scripts/stamp-assets.py" if changed else "all stamps current")
        return 1 if changed else 0
    print(f"{len(changed)} file(s) updated")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
