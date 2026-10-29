/* Range charts drawn the way the app draws them (RangeChartView): 13 x 13
   hands, pairs on the diagonal, suited above it, offsuit below, each cell a
   bar split left to right into fold, call and raise by how often the chart
   plays each. The data is app-data.js, generated from the app's ranges.json.

   Shared: the demo's Chart view uses it now, How it teaches (redesign
   Phase 3) next. Segment widths go through the CSSOM, because the page CSP
   blocks style="" in markup. Nothing here moves: no transform on a cell, ever
   (a scaled cell would cover its neighbours). */
(function () {
  "use strict";
  var doc = document, RANKS = "AKQJT98765432";

  function hand(i) {
    var r = Math.floor(i / 13), c = i % 13;
    return r === c ? RANKS[r] + RANKS[r] : c > r ? RANKS[r] + RANKS[c] + "s" : RANKS[c] + RANKS[r] + "o";
  }
  /* "f73r27" -> [["f", 73], ["r", 27]] */
  function parse(code) {
    var out = [], re = /([fcr])(\d+)/g, m;
    while ((m = re.exec(code))) out.push([m[1], +m[2]]);
    return out;
  }
  function el(tag, cls, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* The grid. opts.labels adds each hand's name, inked to read on the
     segment under its middle. The hero's hand gets the amber ring. */
  function grid(chart, opts) {
    var g = el("div", "cgrid");
    chart.cells.forEach(function (code, i) {
      var cell = el("div", "cell"), h = hand(i), parts = parse(code), run = 0;
      if (!parts.length) cell.classList.add("cell--empty");
      parts.forEach(function (p) {
        var seg = el("span", "cell__seg cell__seg--" + p[0]);
        seg.style.width = p[1] + "%";
        cell.appendChild(seg);
        if (run <= 50 && run + p[1] > 50) cell.classList.add("cell--ink-" + p[0]);
        run += p[1];
      });
      if (opts && opts.labels) cell.appendChild(el("span", "cell__t", h));
      if (h === chart.hero) cell.classList.add("is-hero");
      g.appendChild(cell);
    });
    return g;
  }

  /* One swatch per action the chart has, in the app's order. */
  function legend(chart) {
    var ul = el("ul", "clegend");
    ["f", "c", "r"].forEach(function (k) {
      if (!chart.labels[k]) return;
      var li = el("li");
      li.appendChild(el("i", "clegend__sw clegend__sw--" + k));
      li.appendChild(doc.createTextNode(chart.labels[k]));
      ul.appendChild(li);
    });
    return ul;
  }

  /* What a screen reader hears: "Chart: Opening from the button, 100bb.
     A5s: Raise 100%." */
  function summary(chart) {
    var code = chart.cells[chart.cells.map(function (_, i) { return hand(i); }).indexOf(chart.hero)];
    var mix = parse(code).map(function (p) { return chart.labels[p[0]] + " " + p[1] + "%"; }).join(", ");
    return "Chart: " + chart.title + ", " + chart.sub.split(" · ")[0] + ". " + chart.hero + ": " + mix + ".";
  }

  window.PreflopChart = { hand: hand, parse: parse, grid: grid, legend: legend, summary: summary };
})();
