#!/usr/bin/env python3
"""Print WCAG contrast for the colour pairs the site draws, read from tokens.css.

    python3 scripts/contrast-table.py [light|dark]

Text needs 4.5:1; a fill that carries meaning needs 3:1 against what it sits on
(WCAG 1.4.11). A text pair under its bar is a FAIL and exits 1; a graphic under
3:1 is a WARN, listed but not fatal: the action colours are the app's own and
each of those graphics also has a label or caption next to it.
"""
import re, sys, pathlib

CSS = pathlib.Path(__file__).resolve().parent.parent / "next/css/tokens.css"


def tokens(scheme):
    text = CSS.read_text()
    if scheme == "dark":
        block = re.search(r":root,\s*\[data-theme=\"dark\"\] \{(.*?)\n\}", text, re.S).group(1)
    else:
        block = re.search(r"\[data-theme=\"light\"\] \{(.*?)\n\}", text, re.S).group(1)
    return dict(re.findall(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})", block))


def lum(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def pairs(t):
    bg, panel = t["bg"], t["panel"]
    rows = []
    for s, sv in (("bg", bg), ("panel", panel)):
        rows.append((f"--accent text/stroke on {s}", t["accent"], sv, 4.5))
    rows.append(("--accent-fill-ink on --accent-fill (buttons, chips)", t["accent-fill-ink"], t["accent-fill"], 4.5))
    for s, sv in (("bg", bg), ("panel", panel)):
        rows.append((f"--accent-fill (streak dots) on {s}", t["accent-fill"], sv, -3.0))
    for a in ("raise", "call", "fold"):
        rows.append((f"--act-ink on --act-{a} (button label)", t["act-ink"], t[f"act-{a}"], 4.5))
    for a in ("raise", "call", "fold"):
        rows.append((f"--act-{a} fill on --panel (legend, bar)", t[f"act-{a}"], panel, -3.0))
    for a in ("raise", "call", "fold"):
        rows.append((f"--accent-fill-ink on --act-{a} (range-chart cell)", t["accent-fill-ink"], t[f"act-{a}"], 4.5))
    return rows


bad = 0
for scheme in (sys.argv[1:] or ["light", "dark"]):
    t = tokens(scheme)
    print(f"\n{scheme}  (accent {t['accent']}, accent-fill {t['accent-fill']}, "
          f"raise {t['act-raise']}, call {t['act-call']}, fold {t['act-fold']}, act-ink {t['act-ink']})")
    print("| pair | fg | bg | ratio | needs | |")
    print("|---|---|---|---|---|---|")
    for name, fg, bgc, need in pairs(t):
        r = ratio(fg, bgc)
        graphic = need < 0  # negative = a graphic, not text
        need = abs(need)
        ok = r >= need
        bad += (not ok) and not graphic
        print(f"| {name} | {fg} | {bgc} | {r:.2f} | {need} | {'ok' if ok else ('WARN' if graphic else 'FAIL')} |")
sys.exit(1 if bad else 0)
