/* The chart explorer: the app's own range charts (app-data.js, generated from
   the app's data) drawn as 13 x 13 squares, each holding a bar that is how
   often the chart folds, calls and raises with that hand. Pick a hand, by
   pointer, tap or arrow keys, and the inspector shows its mix.

   Enhancement: without JS the section shows the app's own screenshot of the
   chart instead. Works under Reduce Motion too; only the entrance and the
   fades are skipped. */
(function () {
  "use strict";
  var doc = document, app = window.PreflopApp, root = doc.querySelector(".explorer");
  if (!app || !app.charts || !root) return;
  var live = root.querySelector("[data-chart]"), tabs = root.querySelector("[data-tabs]"), insp = root.querySelector("[data-inspector]");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var RANKS = "AKQJT98765432", KIND = { f: "fold", c: "call", r: "raise" };
  var chart, grid, cells = [], rows = {}, sel = -1, heroIdx = -1;

  function handAt(i) {
    var r = Math.floor(i / 13), c = i % 13;
    return r === c ? RANKS[r] + RANKS[r] : c > r ? RANKS[r] + RANKS[c] + "s" : RANKS[c] + RANKS[r] + "o";
  }
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

  function drawChart(index) {
    chart = app.charts[index];
    live.textContent = "";
    grid = el("div", "cgrid");
    grid.setAttribute("role", "group");
    grid.setAttribute("tabindex", "0");
    grid.setAttribute("aria-label", chart.title + ", " + chart.sub + ". A 13 by 13 chart of hands. Use the arrow keys to move between hands.");
    cells = chart.cells.map(function (code, i) {
      var cell = el("div", "cell"), h = handAt(i), parts = parse(code);
      cell.dataset.i = i;
      if (!parts.length) cell.classList.add("cell--empty");
      var run = 0;
      parts.forEach(function (p) {
        var seg = el("span", "cell__seg cell__seg--" + p[0]);
        seg.style.width = p[1] + "%";
        cell.appendChild(seg);
        /* The label sits at the cell's middle, so its ink follows the segment under it. */
        if (run <= 50 && run + p[1] > 50) cell.classList.add("cell--ink-" + p[0]);
        run += p[1];
      });
      cell.appendChild(el("span", "cell__t", h));
      if (h === chart.hero) cell.classList.add("is-hero");
      grid.appendChild(cell);
      return cell;
    });
    heroIdx = chart.cells.map(function (_, i) { return handAt(i); }).indexOf(chart.hero);
    live.appendChild(grid);

    /* One row per action this chart has, in the app's order. */
    insp.textContent = "";
    var head = el("div", "insp__head");
    head.appendChild(el("strong", "insp__hand"));
    head.appendChild(el("span", "insp__where", chart.title + " · " + chart.sub));
    insp.appendChild(head);
    var wrap = el("div", "insp__rows mix");
    rows = {};
    ["f", "c", "r"].forEach(function (k) {
      if (!chart.labels[k]) return;
      var row = el("div", "mix__row"), track = el("span", "mix__track"), bar = el("span", "mix__bar mix__bar--" + KIND[k]);
      track.appendChild(bar);
      row.appendChild(el("span", "mix__name", chart.labels[k]));
      row.appendChild(track);
      var pct = el("span", "mix__pct", "0%");
      row.appendChild(pct);
      wrap.appendChild(row);
      rows[k] = { bar: bar, pct: pct };
    });
    insp.appendChild(wrap);
    insp.appendChild(el("p", "insp__note"));
    sel = -1;
    select(heroIdx);
  }

  function select(i) {
    if (i < 0 || i > 168 || i === sel) return;
    if (sel >= 0) cells[sel].classList.remove("is-sel");
    sel = i;
    cells[i].classList.add("is-sel");
    var parts = parse(chart.cells[i]), h = handAt(i), total = {}, top = 0;
    parts.forEach(function (p) { total[p[0]] = p[1]; top = Math.max(top, p[1]); });
    insp.querySelector(".insp__hand").textContent = h;
    Object.keys(rows).forEach(function (k) {
      var v = total[k] || 0;
      rows[k].bar.style.setProperty("--f", v / 100);
      rows[k].pct.textContent = v + "%";
    });
    var note = !parts.length ? "The chart never plays this hand."
      : top >= 95 ? "A clear line: the chart does the same thing almost every time."
      : "A mixed hand: the chart takes more than one line with it.";
    if (h === chart.hero) note = "The hand from the app's example spot. " + note;
    insp.querySelector(".insp__note").textContent = note;
  }

  function buildTabs() {
    app.charts.forEach(function (c, i) {
      var b = el("button", "explorer__tab", c.title);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        tabs.querySelectorAll("[role=tab]").forEach(function (t) { t.setAttribute("aria-selected", t === b ? "true" : "false"); });
        if (!reduce && live.animate) live.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 240, easing: "ease-out" });
        drawChart(i);
      });
      tabs.appendChild(b);
    });
  }

  /* Pointer: a mouse follows the hover, a finger taps. Keyboard: arrows. */
  live.addEventListener("pointerover", function (e) {
    if (e.pointerType !== "mouse") return;
    var c = e.target.closest(".cell");
    if (c) select(+c.dataset.i);
  });
  live.addEventListener("click", function (e) {
    var c = e.target.closest(".cell");
    if (c) select(+c.dataset.i);
  });
  live.addEventListener("keydown", function (e) {
    var d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -13, ArrowDown: 13 }[e.key];
    if (!d) return;
    e.preventDefault();
    var n = sel + d;
    if ((d === -1 && sel % 13 === 0) || (d === 1 && sel % 13 === 12)) return;
    select(Math.max(0, Math.min(168, n)));
  });

  buildTabs();
  drawChart(0);
  root.setAttribute("data-enhanced", "");
  live.hidden = tabs.hidden = insp.hidden = false;

  /* The squares wash in once, when the chart first scrolls into view. */
  if (!reduce && window.gsap && "IntersectionObserver" in window) {
    var played = false;
    new IntersectionObserver(function (entries, io) {
      if (played || !entries[0].isIntersecting) return;
      played = true; io.disconnect();
      window.gsap.from(cells, {
        opacity: 0, scale: 0.4, duration: 0.45, ease: "power2.out", clearProps: "opacity,transform",
        stagger: { amount: 0.8, grid: [13, 13], from: "start" }
      });
    }, { threshold: 0.3 }).observe(live);
  }
})();
