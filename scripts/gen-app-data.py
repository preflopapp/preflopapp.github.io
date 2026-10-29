#!/usr/bin/env python3
"""Turns the app's own data (docs/app-handoff/data/) into what the homepage loads.

Writes next/js/app-data.js: the range charts (the explorer and the demo's Chart
view draw them) and the demo's three hands (redesign SPEC §6.2).

The source JSON comes from the app repo (see docs/app-handoff/README.md); do not
edit values here. Re-run after refreshing it:

    python3 scripts/gen-app-data.py
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "docs/app-handoff/data"
RANKS = "AKQJT98765432"

# Chart ids -> the words the app uses for them and the hand its spot is about.
CHARTS = {
    "rfi-6max-btn": dict(title="Opening from the button", hero="A5s", kind="rfi"),
    "vsopen-6max-bb-vs-btn": dict(title="Big blind facing a button open", hero="J8s", kind="vsopen"),
    "vsallin-6max-20bb-co-vs-bb-rejam": dict(title="Cutoff facing a big-blind re-jam", hero="KTs", kind="jam"),
}
# The app draws a cell as a bar split left to right: fold, call, then the
# aggressive actions. In an opening chart the "call" cell is the open, drawn
# in the raise colour (ranges.json note). f=fold c=call r=raise-coloured.
LABELS = {
    "rfi": {"f": "Fold", "r": "Raise"},
    "vsopen": {"f": "Fold", "c": "Call", "r": "3-Bet"},
    "jam": {"f": "Fold", "c": "Call"},
}


def cell_code(mix, kind):
    if mix is None:
        return ""
    parts = {"f": 0.0, "c": 0.0, "r": 0.0}
    for key, v in mix.items():
        if key == "fold": parts["f"] += v
        elif key == "call": parts["r" if kind == "rfi" else "c"] += v
        elif key in ("raise", "three_bet", "four_bet", "all_in", "limp", "check"): parts["r"] += v
    out = "".join(f"{k}{round(v * 100)}" for k, v in parts.items() if round(v * 100) > 0)
    return out


def hand(i, j):
    if i == j: return RANKS[i] * 2
    return RANKS[i] + RANKS[j] + "s" if j > i else RANKS[j] + RANKS[i] + "o"


def charts():
    src = json.loads((DATA / "ranges.json").read_text())["charts"]
    out = []
    for cid, meta in CHARTS.items():
        c = src[cid]
        cells = []
        for i, row in enumerate(c["grid"]):
            for j, cell in enumerate(row):
                assert cell["hand"] == hand(i, j), (cid, cell["hand"], hand(i, j))
                cells.append(cell_code(cell["mix"], meta["kind"]))
        seat = {"btn": "BTN", "bb": "BB", "co": "CO"}
        opp = c.get("opponentPosition")
        sub = f'{c["stackDepth"]}bb · {c["tableSize"].replace("max", "-max")}'
        if c["situation"] == "facing_all_in": sub += " · re-jam"
        elif c.get("openSizingBB"): sub += f' · {c["openSizingBB"]:g}bb open'
        out.append(dict(id=cid, title=meta["title"], sub=sub, hero=meta["hero"], kind=meta["kind"],
                        labels=LABELS[meta["kind"]], cells=cells))
    return out


# The demo's three hands (SPEC §6.2): the app's spots that also have a chart.
# The wording around them is the site's; the hand, the action, the mix and the
# explanation are the app's.
SPOTS = [
    dict(id="gen-rfi-6max-btn-A5s", head="Opening", title="A5s from the button",
         context="Folded to you · 100bb · 6-max", prompt="UTG, HJ and CO fold. Your move."),
    dict(id="gen-vsopen-6max-bb-vs-btn-J8s", head="Facing an open", title="J8s from the big blind",
         context="vs a 3bb BTN open · 100bb · 6-max", prompt="BTN raises to 3bb. SB folds. Your move."),
    dict(id="gen-vsallin-6max-20bb-co-vs-bb-rejam-KTs", head="Facing an all-in", title="KTs from the cutoff",
         context="vs a BB jam · 20bb · 6-max", prompt="You open to 2bb. BB moves all-in for 20bb. Your move."),
]
SEATS = ["utg", "hj", "co", "btn", "sb", "bb"]
# Models/Spot.swift defaultDecisions, for a spot whose "buttons" is null.
DEFAULT_BUTTONS = {"rfi": ["Fold", "Raise"], "facing_open": ["Fold", "Call", "3-Bet"], "facing_all_in": ["Fold", "Call"]}
# A slab's colour: red folds, blue calls, green puts money in.
COLOUR = {"Fold": "fold", "Call": "call", "Raise": "raise", "3-Bet": "raise", "4-Bet": "raise"}
# The chart cell's segment each button reads (f/c/r, as in cell_code).
SEGMENT = {"Fold": "f", "Call": "c", "Raise": "r", "3-Bet": "r", "4-Bet": "r"}


def first_sentence(text):
    """Up to and including the first ". " (SPEC §6.2: the card never scrolls)."""
    cut = text.find(". ")
    return text if cut < 0 else text[:cut + 1]


def seat_order(hero):
    """Clockwise from the top with the hero at the bottom (data-i 3), as in the
    app's practice screen: for BTN, UTG on top, HJ and CO right, SB and BB left."""
    h = SEATS.index(hero)
    return [SEATS[(h + k) % 6] for k in (3, 4, 5, 0, 1, 2)]


def spots(chart_list):
    src = {x["id"]: x for x in json.loads((DATA / "spots.json").read_text())["spots"]}
    index = {c["id"]: i for i, c in enumerate(chart_list)}
    out = []
    for meta in SPOTS:
        sp = src[meta["id"]]
        chart = chart_list[index[sp["chartId"]]]
        hand = sp["heroHand"]
        code = hand[0][0] + hand[1][0] + ("s" if hand[0][1] == hand[1][1] else "o")
        assert code == chart["hero"], (meta["id"], code, chart["hero"])
        buttons = sp["buttons"] or DEFAULT_BUTTONS[sp["situation"]]
        options = [dict(label=b, colour=COLOUR[b], pct=sp["mixPercent"].get(b, 0)) for b in buttons]
        # The spot's mix and its chart's cell for the same hand must agree.
        cell = dict((k, 0) for k in "fcr")
        hero_cell = chart["cells"][[hand_at(i) for i in range(169)].index(code)]
        for seg, n in re.findall(r"([fcr])(\d+)", hero_cell):
            cell[seg] = int(n)
        for o in options:
            assert cell[SEGMENT[o["label"]]] == o["pct"], (meta["id"], o, hero_cell)
        ex = sp["explanation"]
        out.append(dict(
            id=meta["id"], chart=index[sp["chartId"]], head=meta["head"], title=meta["title"],
            context=meta["context"], prompt=meta["prompt"], hero=sp["heroPosition"], depth=sp["stackDepthBB"],
            hand=[[c[0], c[1]] for c in hand], seats=seat_order(sp["heroPosition"]),
            blinds=sp["blindsBB"], actions=[[a["position"], a["action"], a["sizingBB"]] for a in sp["actionSequence"]],
            options=options,
            explain=dict(correct=first_sentence(ex["correctSummary"]),
                         **{k: first_sentence(v) for k, v in ex["mistakeSummaries"].items()})))
    return out


def hand_at(i):
    return hand(i // 13, i % 13)


def main():
    chart_list = charts()
    js = "window.PreflopApp = " + json.dumps({"charts": chart_list, "spots": spots(chart_list)},
                                             separators=(",", ":"), ensure_ascii=False) + ";\n"
    header = ("/* Generated by scripts/gen-app-data.py from the app's own data (docs/app-handoff/data/: "
              "ranges.json, spots.json). Do not edit. Cells: f=fold c=call r=raise-coloured, then whole percent. */\n")
    (ROOT / "next/js/app-data.js").write_text(header + js)
    print(f"app-data.js: {len(chart_list)} charts, {len(SPOTS)} demo hands")


if __name__ == "__main__":
    main()
