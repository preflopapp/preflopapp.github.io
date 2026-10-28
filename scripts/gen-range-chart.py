#!/usr/bin/env python3
"""Prints the 13x13 range-chart markup for the bento card on /next/.

The mix per hand is the RANGE the landing demo already carries (HJ facing a
UTG open, 100bb, 6-max), read straight from landing/index.html, so the picture
is the app's own data rather than something invented. Each cell is an <i>
classed by its leading continue action and how often the chart continues:

    r1..r4  raise, 25/50/75/100% (from the share of the hand that continues)
    c1..c4  call, the same
    (none)  a fold, or close to one

Cells carry no text: the chart is a picture (the card names it), and the
colours are CSS (next/css/sections.css), so they follow both schemes. The hand
the demo asks about (AQo) is ringed with .sel.

    python3 scripts/gen-range-chart.py    # paste into index.html
"""
import json, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
text = (root / "landing/index.html").read_text()
range_ = json.loads(re.search(r"const RANGE = (\{.*?\})\s*;", text, re.S).group(1))
ranks = "AKQJT98765432"
SELECTED = "AQo"

cells = []
for i, row in enumerate(ranks):
    for j, col in enumerate(ranks):
        hi, lo = ranks[min(i, j)], ranks[max(i, j)]
        name = hi + lo if i == j else hi + lo + ("s" if i < j else "o")
        fold, call, raise_ = range_[name]
        go = 1 - fold
        classes = []
        if go >= 0.05:
            kind = "r" if raise_ >= call else "c"
            classes.append(f"{kind}{max(1, min(4, -(-int(go * 100) // 25)))}")
        if name == SELECTED: classes.append("sel")
        cells.append(f'<i class="{" ".join(classes)}"></i>' if classes else "<i></i>")
sys.stdout.write("".join(cells))
