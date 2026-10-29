/* How it teaches (redesign SPEC §6.4): the app's three range charts, one per
   tab, drawn by chart.js from app-data.js, beside an answer card with the mix
   and the app's own explanation for the spot's hand.

   - Without JS the section shows the KTs card (static HTML) and the app's own
     capture of that chart; this script hides the capture before it loads.
   - A hand is previewed by the mouse only when the pointer really moves, so a
     wheel scroll under a still pointer changes nothing (EXPL-02). A click or
     tap pins it; arrow keys move the pin and Home returns to the spot's hand.
   - The card never changes height while you browse: the explanation keeps the
     measured height of the spot's own explanation (--why-h).
   - Motion: the chart's first paint washes in (only if it starts below the
     screen), the mix rows fill on each selection, a tab change swaps. Reduce
     Motion: none of it. Nothing on a cell ever transforms. */
(function () {
  "use strict";
  var doc = document, app = window.PreflopApp, CH = window.PreflopChart, M = window.PreflopMotion;
  var root = doc.getElementById("features");
  if (!app || !app.charts || !CH || !M || !root || !Element.prototype.closest) return;

  var tablist = root.querySelector(".teach__tabs"), tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  var figure = doc.getElementById("teach-chart"), live = figure.querySelector("[data-chart]"), key = figure.querySelector(".teach__key");
  var legendBox = figure.querySelector("[data-legend]"), cap = figure.querySelector(".teach__cap"), fallback = figure.querySelector(".teach__static");
  var card = doc.getElementById("teach-card"), handEl = card.querySelector(".teach__hand"), whereEl = card.querySelector(".teach__where");
  var mixEl = card.querySelector(".teach__mix"), whyEl = card.querySelector(".teach__why"), announce = doc.getElementById("teach-announce");
  var OTHER = "Every hand the app deals you comes with its own explanation. Pick the ringed hand to read this spot’s.";
  var BAR = { f: "fold", c: "call", r: "raise" };
  var byId = {};
  app.charts.forEach(function (c) { byId[c.id] = c; });
  var chart, cells = [], rows = {}, spot = 0, pinned = 0, shown = -1, lastX = -1, lastY = -1;

  function el(tag, cls, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function still() { return M.reduce || matchMedia("(prefers-reduced-motion: reduce)").matches || !Element.prototype.animate; }

  /* ---- The card ------------------------------------------------------------ */
  function buildRows() {
    mixEl.textContent = "";
    rows = {};
    CH.mix(chart, spot).forEach(function (p) {
      var row = el("div", "mix__row"), track = el("span", "mix__track"), bar = el("span", "mix__bar mix__bar--" + BAR[p[0]]);
      bar.style.setProperty("--f", p[1] / 100);
      track.appendChild(bar);
      row.appendChild(el("span", "mix__name", chart.labels[p[0]]));
      row.appendChild(track);
      rows[p[0]] = { bar: bar, pct: el("span", "mix__pct", p[1] + "%") };
      row.appendChild(rows[p[0]].pct);
      mixEl.appendChild(row);
    });
  }
  /* The explanation box keeps the height of the spot's own explanation at
     this width, so a shorter text for another hand leaves the card as it is. */
  function measure() {
    var probe = whyEl.cloneNode(false);
    probe.textContent = chart.why;
    probe.style.setProperty("position", "absolute");
    probe.style.setProperty("visibility", "hidden");
    probe.style.setProperty("min-height", "0");
    probe.style.setProperty("width", whyEl.clientWidth + "px");
    card.appendChild(probe);
    card.style.setProperty("--why-h", Math.ceil(probe.getBoundingClientRect().height) + "px");
    probe.remove();
  }
  function show(i) {
    if (cells[shown]) cells[shown].classList.remove("is-sel");
    shown = i;
    cells[i].classList.add("is-sel");
    var empty = !chart.cells[i];
    handEl.textContent = CH.hand(i) + (empty ? " · " + chart.empty : "");
    CH.mix(chart, i).forEach(function (p) {
      rows[p[0]].bar.style.setProperty("--f", p[1] / 100);
      rows[p[0]].pct.textContent = p[1] + "%";
    });
    whyEl.textContent = i === spot ? chart.why : empty ? chart.emptyNote : OTHER;
  }
  function pin(i, speak) {
    pinned = i;
    show(i);
    if (!speak) return;
    announce.textContent = CH.hand(i) + ": " + (chart.cells[i]
      ? CH.mix(chart, i).map(function (p) { return chart.labels[p[0]] + " " + p[1] + "%"; }).join(", ") : chart.empty.toLowerCase()) + ".";
  }

  /* ---- The chart ------------------------------------------------------------- */
  function draw(c) {
    chart = c;
    spot = CH.indexOf(c.hero);
    var grid = CH.grid(c, { labels: true });
    grid.setAttribute("role", "group");
    grid.setAttribute("tabindex", "0");
    grid.setAttribute("aria-label", c.title + ", " + c.sub + ". A 13 by 13 chart of hands: arrow keys move between hands, Home goes back to " + c.hero + ".");
    live.textContent = "";
    live.appendChild(grid);
    cells = Array.prototype.slice.call(grid.children);
    shown = -1;
    legendBox.textContent = "";
    legendBox.appendChild(CH.legend(c));
    whereEl.textContent = c.title + " · " + c.sub;
    buildRows();
    measure();
    pin(spot, false);
    return grid;
  }

  live.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || (e.clientX === lastX && e.clientY === lastY)) return;
    lastX = e.clientX; lastY = e.clientY;
    var c = e.target.closest(".cell"), i = c ? cells.indexOf(c) : -1;
    if (i >= 0 && i !== shown) show(i);
  });
  live.addEventListener("pointerleave", function () { if (shown !== pinned) show(pinned); });
  live.addEventListener("click", function (e) {
    var c = e.target.closest(".cell");
    if (c) pin(cells.indexOf(c), true);
  });
  live.addEventListener("keydown", function (e) {
    var r = Math.floor(pinned / 13), col = pinned % 13;
    if (e.key === "ArrowUp") r = Math.max(0, r - 1);
    else if (e.key === "ArrowDown") r = Math.min(12, r + 1);
    else if (e.key === "ArrowLeft") col = Math.max(0, col - 1);
    else if (e.key === "ArrowRight") col = Math.min(12, col + 1);
    else if (e.key === "Home") { r = Math.floor(spot / 13); col = spot % 13; }
    else return;
    e.preventDefault();
    pin(r * 13 + col, true);
  });

  /* ---- Tabs: the ARIA tab pattern, selection follows focus ------------------- */
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    figure.setAttribute("aria-labelledby", tab.id);
    if (focus) tab.focus();
    draw(byId[tab.getAttribute("data-chart")]);
    if (!still()) [figure, card].forEach(function (x) { x.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: M.dur.snappy, easing: M.ease.out }); });
    pin(spot, true);
  }
  tablist.addEventListener("click", function (e) {
    var t = e.target.closest('[role="tab"]');
    if (t && t.getAttribute("aria-selected") !== "true") select(t, false);
  });
  tablist.addEventListener("keydown", function (e) {
    var i = tabs.indexOf(doc.activeElement), n = tabs.length;
    if (i < 0) return;
    var to = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i + n - 1) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    select(tabs[to], true);
  });

  /* ---- Enhance ------------------------------------------------------------------ */
  fallback.hidden = true;
  live.hidden = false;
  key.hidden = false;
  cap.hidden = false;
  tablist.hidden = false;
  figure.setAttribute("role", "tabpanel");
  var first = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
  figure.setAttribute("aria-labelledby", first.id);
  var grid = draw(byId[first.getAttribute("data-chart")]);

  var timer = 0, width = innerWidth;
  addEventListener("resize", function () {
    if (innerWidth === width) return;
    width = innerWidth;
    clearTimeout(timer);
    timer = setTimeout(measure, 150);
  });

  /* Wash: the chart's first paint brightens from 0.25 in a diagonal sweep,
     8 ms a step (at most 432 ms), when any of it comes on screen. Only if it
     starts below the screen, so it is never dim where someone is reading. */
  if (still() || !("IntersectionObserver" in window) || figure.getBoundingClientRect().top <= innerHeight) return;
  grid.setAttribute("data-wash", "pending");
  function wash() {
    if (grid.getAttribute("data-wash") !== "pending") return;
    io.disconnect();
    grid.removeAttribute("data-wash");
    if (!grid.isConnected || still()) return;
    cells.forEach(function (c, i) {
      c.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: M.dur.entrance, delay: (Math.floor(i / 13) + i % 13) * 8, easing: M.ease.out, fill: "backwards" });
    });
  }
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) wash(); });
  io.observe(grid);
  addEventListener("beforeprint", wash);
  tablist.addEventListener("click", wash);
})();
