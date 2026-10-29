/* The playable demo in the hero: three real hands from the app's practice
   screen (A5s, J8s, KTs), graded by the app's rule, with the app's own
   explanation after each answer and that spot's range chart one tap away
   (redesign SPEC §6.2). The hands come from app-data.js, which
   scripts/gen-app-data.py builds from the app's spots.json and ranges.json.

   - The HTML already holds hand 1, dealt, for no-JS visitors. This script
     draws it again from the data, identically, and never re-deals it.
   - No style="" in any markup it writes (the page CSP): seat positions are
     data-i rules in demo.css; the few dynamic values go through the CSSOM.
   - Only transform and opacity animate, with the durations and easings from
     tokens.css (window.PreflopMotion). Reduce Motion: every hand is printed at
     once and nothing animates; a tap on the table skips a deal too.

   After changing renderTable() or hand 1, refresh the HTML copy with
   scripts/capture-demo-static.js (.claude/rules/next.md). */
(function () {
  "use strict";
  var doc = document, app = window.PreflopApp, phone = doc.getElementById("demo");
  if (!phone || !app || !app.spots || !window.PreflopChart || !window.PreflopMotion) return;
  var SPOTS = app.spots, CH = window.PreflopChart, M = window.PreflopMotion;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)");

  var $ = function (id) { return doc.getElementById(id); };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  };
  var DISP = { utg: "UTG", hj: "HJ", co: "CO", btn: "BTN", sb: "SB", bb: "BB" };
  var SUIT = { h: ["heart", "hearts"], d: ["diamond", "diamonds"], s: ["spade", "spades"], c: ["club", "clubs"] };
  var RANK = { A: "Ace", K: "King", Q: "Queen", J: "Jack", T: "Ten", "9": "Nine", "8": "Eight", "7": "Seven", "6": "Six", "5": "Five", "4": "Four", "3": "Three", "2": "Two" };
  /* Where each seat sits on the stage, as a fraction (demo.css data-i rules):
     a dealt card starts at the pot and flies out to its seat. */
  var SEAT_AT = [[0.5, 0.16], [0.8648, 0.34], [0.8716, 0.63], [0.5, 0.79], [0.1284, 0.63], [0.1352, 0.34]];
  var POT_AT = [0.5, 0.42];

  /* ---- Grading: AnswerResult.grade and ActionMix in the app ----------------
     Correct is the chart's top action. Mixed is within ten points of the top
     (a hand raised 54% and folded 46% has no one right answer), or any line
     the chart plays at least a quarter of the time. Wrong is the rest. When
     the top two are within ten points of each other, either is Mixed. Ties in
     share break in the app's button order (fold first). */
  var CLOSE = 10, PLAYED = 25;
  function ranked(spot) {
    return spot.options.slice().sort(function (a, b) {
      return b.pct - a.pct || spot.options.indexOf(a) - spot.options.indexOf(b);
    });
  }
  function grade(spot, o) {
    var order = ranked(spot), top = order[0], short = Math.max(0, top.pct - o.pct);
    var tied = order.length > 1 && top.pct - order[1].pct <= CLOSE;
    if (tied && short <= CLOSE) return "mixed";
    if (o === top) return "correct";
    if (short <= CLOSE) return "mixed";
    return o.pct >= PLAYED ? "mixed" : "wrong";
  }
  function headline(spot, g) {
    if (g === "correct") return "Correct";
    if (g === "wrong") return "Wrong";
    var lines = spot.options.filter(function (o) { return o.pct >= PLAYED; }).length;
    return "Mixed" + (lines === 2 ? " — the chart plays both" : lines === 3 ? " — the chart plays all three" : "");
  }
  /* The app's own words: its summary for Correct and Mixed, the summary for
     the line you picked when Wrong. The generator keeps the first sentence. */
  function why(spot, o, g) {
    return g === "wrong" ? spot.explain[o.label] || spot.explain.correct : spot.explain.correct;
  }

  /* ---- The table's state: blinds, then the actions before the hero's ---- */
  function fresh(spot) {
    return { chips: { sb: spot.blinds.sb, bb: spot.blinds.bb }, folded: {}, allin: {}, acting: null };
  }
  function apply(t, a) {
    if (a[1] === "fold") { t.folded[a[0]] = true; return; }
    t.chips[a[0]] = a[2];
    t.acting = a[0];
    if (a[1] === "all_in") t.allin[a[0]] = true;
  }
  function dealt(spot) {
    var t = fresh(spot);
    spot.actions.forEach(function (a) { apply(t, a); });
    return t;
  }
  function pot(t) {
    var n = 0;
    for (var k in t.chips) n += t.chips[k];
    return Math.round(n * 10) / 10;
  }

  /* ---- Drawn pieces --------------------------------------------------------- */
  function cardHTML(c, cls) {
    var s = SUIT[c[1]], red = c[1] === "h" || c[1] === "d";
    return '<span class="pcard' + (cls ? " " + cls : "") + (red ? " pcard--red" : "") + '" role="img" aria-label="' + RANK[c[0]] + " of " + s[1] + '">' + c[0] +
      '<img class="pcard__suit" src="/assets/suits/' + s[0] + '-v2.svg" alt="" width="26" height="26"></span>';
  }
  function chipHTML(kind) {
    return '<svg class="chip chip--' + kind + '" viewBox="0 0 19 19" aria-hidden="true">' +
      '<circle class="chip__body" cx="9.5" cy="9.5" r="9.5"/><circle class="chip__ring" cx="9.5" cy="9.5" r="6.4"/></svg>';
  }
  function betHTML(t, seat) {
    var amt = t.chips[seat];
    if (amt == null) return "";
    var acting = t.acting === seat, kind = acting ? "acting" : amt <= 1 ? "blind" : "live";
    return '<span class="bet' + (acting ? " bet--acting" : "") + '">' + chipHTML(kind) + "<span>" + amt + "bb</span></span>";
  }
  function detail(spot, t, seat) {
    return t.folded[seat] ? "fold" : t.allin[seat] ? "all-in" : spot.depth + "bb";
  }
  /* Chips sit on the side of the pod that faces the pot. */
  function above(i) { return i === 2 || i === 3 || i === 4; }

  function renderTable(spot, t) {
    var html = '<div class="rail"></div><div class="felt"></div><div class="bet-line"></div>' +
      '<div class="centre-mark t-label">Preflop</div>' +
      '<div class="pot"><div class="pot__label t-label">Pot</div><div class="pot__amount">' + pot(t) + "bb</div>" +
      '<div class="pot__bars"><i></i><i></i><i></i></div><div class="pot__meta">' + spot.depth + "bb effective · 6-max</div></div>";
    spot.seats.forEach(function (seat, i) {
      if (seat === spot.hero) {
        html += '<div class="seat seat--hero" data-seat="' + seat + '" data-i="' + i + '">' +
          '<div class="bet-slot">' + betHTML(t, seat) + "</div>" +
          '<div class="hero-cards">' + spot.hand.map(function (c) { return cardHTML(c); }).join("") + "</div>" +
          '<div class="hero-badge">' + DISP[seat] + "</div></div>";
        return;
      }
      var folded = t.folded[seat];
      html += '<div class="seat' + (folded ? " folded" : "") + (t.acting === seat ? " acting" : "") + '" data-seat="' + seat + '" data-i="' + i + '">' +
        (above(i) ? '<div class="bet-slot bet-slot--above">' + betHTML(t, seat) + "</div>" : "") +
        '<div class="pod-wrap">' + (folded ? "" : '<div class="fan"><span class="fan__back"></span><span class="fan__back"></span></div>') +
        '<div class="pod"><div class="pod__name">' + DISP[seat] + '</div><div class="pod__detail">' + detail(spot, t, seat) + "</div></div></div>" +
        (above(i) ? "" : '<div class="bet-slot bet-slot--below">' + betHTML(t, seat) + "</div>") + "</div>";
    });
    var d = spot.seats.indexOf("btn");
    html += '<div class="dealer" data-i="' + d + '"' + (spot.hero === "btn" ? " data-hero" : "") + ">D</div>";
    return html;
  }

  /* ---- Motion ------------------------------------------------------------------ */
  function still() { return reduced.matches || !Element.prototype.animate; }
  function play(el, frames, opts) {
    if (!el || still()) return null;
    return el.animate(frames, Object.assign({ fill: "backwards" }, opts));
  }
  function pause(t) { return new Promise(function (r) { setTimeout(r, t); }); }

  /* ---- The demo ------------------------------------------------------------------ */
  var screen = phone.querySelector(".phone__screen"), area = $("demo-area"), stage = $("demo-stage");
  var decisions = $("demo-decisions"), title = $("demo-title"), count = $("demo-count"), dots = $("demo-dots");
  var status = $("demo-status"), line = $("demo-line"), announce = $("demo-announce");
  var state = { i: 0, answers: [], answered: false, ready: false, run: 0 };
  var card = null, chart = null, score = null, table = null;

  function say(text) { announce.textContent = text; }
  function seatNode(seat) { return stage.querySelector('[data-seat="' + seat + '"]'); }
  function drop(el) { if (el) el.remove(); return null; }

  function renderDecisions(spot) {
    decisions.innerHTML = spot.options.map(function (o, k) {
      return '<button class="dbtn dbtn--' + o.colour + '" type="button" data-k="' + k + '" disabled>' +
        '<span class="dbtn__fill"></span><span class="dbtn__label">' + esc(o.label) + "</span></button>";
    }).join("");
  }

  function paintProgress() {
    Array.prototype.forEach.call(dots.children, function (dot, i) {
      var a = state.answers[i];
      dot.className = a ? (a === "wrong" ? "miss" : a) : i === state.i ? "now" : "";
    });
    var spot = SPOTS[state.i];
    count.textContent = Math.min(state.i + 1, SPOTS.length) + " / " + SPOTS.length;
    status.textContent = spot ? "Hand " + (state.i + 1) + " of " + SPOTS.length + " · " + spot.depth + "bb · 6-max" : "That was all three.";
  }

  function finishDeal(focus, quiet) {
    var spot = SPOTS[state.i];
    state.ready = true;
    stage.classList.remove("is-dealing");
    line.textContent = spot.prompt;
    if (!quiet) say(spot.head + ". " + spot.title + ". " + spot.prompt);
    decisions.querySelectorAll("button").forEach(function (b) { b.disabled = false; });
    if (focus) decisions.querySelector("button").focus({ preventScroll: true });
  }

  /* One action before the hero's turn, as the app plays it: a fold greys the
     seat and its cards go; a bet slides its chips in and the pot grows. */
  function step(spot, a) {
    var seat = a[0], node = seatNode(seat), prev = table.acting, hero = seat === spot.hero;
    apply(table, a);
    if (a[1] === "fold") {
      node.classList.add("folded");
      var fan = node.querySelector(".fan");
      if (fan) fan.remove();
      line.textContent = DISP[seat] + " folds";
    } else {
      [prev, seat].forEach(function (s) {
        var n = s && seatNode(s);
        if (!n) return;
        n.classList.toggle("acting", s === table.acting && s !== spot.hero);
        n.querySelector(".bet-slot").innerHTML = betHTML(table, s);
      });
      var i = spot.seats.indexOf(seat);
      play(node.querySelector(".bet"), [{ opacity: 0, transform: "translateY(" + (above(i) ? 12 : -12) + "px)" }, { opacity: 1, transform: "none" }],
        { duration: M.dur.emphasis, easing: M.ease.emphasis });
      stage.querySelector(".pot__amount").textContent = pot(table) + "bb";
      line.textContent = a[1] === "all_in" ? DISP[seat] + " moves all-in for " + a[2] + "bb"
        : (hero ? "You open to " : DISP[seat] + " raises to ") + a[2] + "bb";
    }
    var d = node.querySelector(".pod__detail");
    if (d) d.textContent = detail(spot, table, seat);
  }

  /* The deal, at 0.6 of the app's pace: seats 66 ms apart, a 150 ms pause,
     the hero's cards turn, each action 300 ms apart, 210 ms before the
     decision. A tap on the table, or Reduce Motion, prints the hand at once. */
  function renderHand(focus) {
    var run = ++state.run, spot = SPOTS[state.i];
    state.answered = false; state.ready = false;
    card = drop(card); chart = drop(chart); score = drop(score);
    phone.classList.remove("is-scored", "is-charting");
    title.textContent = spot.head;
    renderDecisions(spot);
    paintProgress();
    if (still()) { table = dealt(spot); stage.innerHTML = renderTable(spot, table); finishDeal(focus); return; }

    table = fresh(spot);
    stage.innerHTML = renderTable(spot, table);
    stage.classList.add("is-dealing");
    line.textContent = "Dealing…";
    var hands = spot.seats.map(function (seat) { return seatNode(seat).querySelector(".fan, .hero-cards"); });
    hands.forEach(function (h) { h.style.opacity = "0"; });
    (async function () {
      for (var n = 0; n < hands.length; n++) {
        if (run !== state.run) return;
        var from = SEAT_AT[n], w = stage.clientWidth, h = stage.clientHeight;
        hands[n].style.opacity = "";
        play(hands[n], [{ opacity: 0, transform: "translate(" + (POT_AT[0] - from[0]) * w + "px, " + (POT_AT[1] - from[1]) * h + "px) scale(.5)" }, { opacity: 1, transform: "none" }],
          { duration: M.dur.emphasis, easing: M.ease.emphasis });
        await pause(66);
      }
      await pause(150);
      if (run !== state.run) return;
      stage.classList.remove("is-dealing");
      play(stage.querySelector(".hero-cards"), [{ transform: "perspective(400px) rotateY(90deg)" }, { transform: "none" }], { duration: M.dur.slide, easing: M.ease.slide });
      for (var a = 0; a < spot.actions.length; a++) {
        await pause(300);
        if (run !== state.run) return;
        step(spot, spot.actions[a]);
      }
      await pause(210);
      if (run !== state.run) return;
      finishDeal(focus);
    })();
  }

  function skipDeal() {
    if (state.ready || state.answered || score) return;
    state.run++;
    stage.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
    table = dealt(SPOTS[state.i]);
    stage.innerHTML = renderTable(SPOTS[state.i], table);
    finishDeal(true);
  }
  stage.addEventListener("click", skipDeal);
  reduced.addEventListener("change", function () { if (reduced.matches) skipDeal(); });

  /* ---- The answer: slabs fill to the chart's mix, the card rises ---------------- */
  var TICK = '<svg class="answer__tick" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10"/><path d="M5.6 10.4l2.9 2.9 5.9-6.3"/></svg>';

  function choose(k) {
    if (state.answered || !state.ready) return;
    var spot = SPOTS[state.i], o = spot.options[k], g = grade(spot, o), last = state.i === SPOTS.length - 1;
    state.answered = true;
    state.answers.push(g);
    decisions.querySelectorAll(".dbtn").forEach(function (btn, j) {
      var opt = spot.options[j], pc = doc.createElement("span");
      btn.disabled = true;
      btn.style.setProperty("--f", opt.pct / 100);
      btn.classList.add("is-revealed");
      if (j === k) { btn.classList.add("is-picked"); btn.setAttribute("data-grade", g); }
      pc.className = "dbtn__pc";
      pc.textContent = opt.pct + "%";
      btn.appendChild(pc);
      btn.setAttribute("aria-label", opt.label + ": " + opt.pct + "%" + (j === k ? ", your choice" : ""));
    });
    var head = headline(spot, g), text = why(spot, o, g);
    card = doc.createElement("div");
    card.className = "answer answer--" + g;
    card.setAttribute("data-overlay", "");
    card.innerHTML =
      '<div class="answer__head"><span class="answer__cards">' + spot.hand.map(function (c) { return cardHTML(c, "pcard--mini"); }).join("") + "</span>" +
      '<span class="answer__id"><strong class="answer__title">' + esc(spot.title) + '</strong><span class="answer__ctx">' + esc(spot.context) + "</span></span></div>" +
      '<p class="answer__grade">' + (g === "wrong" ? "" : TICK) + "<span>" + esc(head) + "</span></p>" +
      '<p class="answer__why">' + esc(text) + "</p>" +
      '<div class="answer__actions"><button class="btn btn--secondary btn--sm answer__chart" type="button" aria-pressed="false">Chart</button>' +
      '<button class="btn btn--primary btn--sm answer__next" type="button">' + (last ? "See your score" : "Next hand") + "</button></div>";
    screen.appendChild(card);
    card.querySelector(".answer__chart").addEventListener("click", toggleChart);
    card.querySelector(".answer__next").addEventListener("click", advance);

    /* t=0 the card rises; 240 ms the grade; 280 ms the reason. Correct: the
       tick lands with a small overshoot. */
    play(card, [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: M.dur.emphasis, easing: M.ease.emphasis });
    var lift = [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }];
    play(card.querySelector(".answer__grade"), lift, { duration: M.dur.entrance, easing: M.ease.out, delay: 240 });
    play(card.querySelector(".answer__why"), lift, { duration: M.dur.entrance, easing: M.ease.out, delay: 280 });
    if (g === "correct") {
      var total = M.dur.emphasis + M.dur.settle;
      play(card.querySelector(".answer__tick"), [{ transform: "scale(.6)", easing: M.ease.emphasis }, { transform: "scale(1.12)", offset: M.dur.emphasis / total, easing: M.ease.out }, { transform: "none" }],
        { duration: total, delay: 240 });
    }
    line.textContent = "You chose " + o.label.toLowerCase() + ".";
    say(head + ". " + text);
    card.querySelector(".answer__next").focus({ preventScroll: true });
    paintProgress();
  }

  /* Chart: the table area swaps to this spot's range chart, hero ringed; the
     card keeps only its buttons. Back to answer swaps it back. */
  function toggleChart() {
    var btn = card.querySelector(".answer__chart"), on = !phone.classList.contains("is-charting"), spot = SPOTS[state.i];
    if (on && !chart) {
      var c = app.charts[spot.chart];
      chart = doc.createElement("div");
      chart.className = "dchart";
      chart.innerHTML = '<p class="dchart__title"><strong>' + esc(c.title) + "</strong><span>" + esc(c.sub) + "</span></p>";
      var fit = doc.createElement("div");
      fit.className = "dchart__fit";
      fit.appendChild(CH.grid(c));
      chart.appendChild(fit);
      chart.appendChild(CH.legend(c));
      screen.insertBefore(chart, card);
    }
    phone.classList.toggle("is-charting", on);
    btn.textContent = on ? "Back to answer" : "Chart";
    btn.setAttribute("aria-pressed", String(on));
    play(on ? chart : area, [{ opacity: 0.6 }, { opacity: 1 }], { duration: M.dur.snappy, easing: M.ease.out });
    say(on ? CH.summary(app.charts[spot.chart]) : headline(spot, state.answers[state.i]) + ".");
  }

  function advance() {
    state.i++;
    if (state.i >= SPOTS.length) { renderScore(); return; }
    renderHand(true);
  }

  function ctaHTML() {
    var cfg = (window.PreflopConfig || {}).cta;
    if (!cfg) return "";
    if (cfg.mode === "coming-soon") return '<span class="badge-soon">Coming soon</span>';
    return '<a class="btn btn--primary btn--sm" data-cta href="' + esc(cfg.testflightUrl) + '">' + esc(cfg.label || "Join the beta") + "</a>";
  }

  function renderScore() {
    var kept = state.answers.filter(function (r) { return r !== "wrong"; }).length;
    var closing = kept === 3 ? { t: "Three for three.", c: "Preflop has 25,000+ more spots like these, each with the full mix and the reason." }
      : kept === 2 ? { t: "Two out of three.", c: "Preflop keeps track of the spots you miss, so you can drill them." }
      : { t: "These spots are hard.", c: "Preflop explains every answer and keeps track of the spots you miss." };
    card = drop(card); chart = drop(chart);
    phone.classList.remove("is-charting");
    phone.classList.add("is-scored");
    title.textContent = "Your score";
    line.textContent = "";
    score = doc.createElement("div");
    score.className = "score";
    score.innerHTML = '<div class="score__head"><strong class="score__figure">' + kept + "<span> / 3</span></strong>" +
      '<span class="score__label t-label">Correct or mixed</span></div>' +
      '<p class="score__title">' + closing.t + '</p><p class="score__copy">' + closing.c + "</p>" +
      '<div class="score__actions">' + ctaHTML() + '<button class="btn btn--secondary btn--sm" type="button" data-again>Play again</button></div>';
    screen.appendChild(score);
    play(score, [{ opacity: 0, transform: "translateY(" + M.rise + "px)" }, { opacity: 1, transform: "none" }], { duration: M.dur.entrance, easing: M.ease.out });
    score.querySelector("[data-again]").addEventListener("click", function () { state.i = 0; state.answers = []; renderHand(true); });
    say("Demo complete. " + kept + " of 3 correct or mixed.");
    paintProgress();
    score.querySelector("a, button").focus({ preventScroll: true });
  }

  decisions.addEventListener("click", function (e) {
    var btn = e.target.closest(".dbtn");
    if (btn && !btn.disabled) choose(+btn.getAttribute("data-k"));
  });

  /* Nudge: if the demo sits on screen untouched for 3 s, the slabs hop once,
     4 px, so it reads as something to play. Once per page view, never with
     Reduce Motion, never after an answer. */
  (function () {
    if (still() || !("IntersectionObserver" in window)) return;
    var seen = false, timer = 0, INPUT = ["scroll", "wheel", "pointerdown", "pointermove", "touchstart", "keydown"];
    var io = new IntersectionObserver(function (es) { seen = es[0].intersectionRatio >= 0.6; arm(); }, { threshold: [0, 0.6] });
    function arm() { clearTimeout(timer); timer = setTimeout(hop, 3000); }
    function stop() {
      clearTimeout(timer); io.disconnect();
      INPUT.forEach(function (ev) { removeEventListener(ev, arm, true); });
    }
    function hop() {
      if (!seen) return;
      stop();
      if (state.i || !state.ready || state.answered || still()) return;
      decisions.querySelectorAll(".dbtn").forEach(function (b, j) {
        b.animate([{ transform: "none", easing: M.ease.inOut }, { transform: "translateY(-4px)", easing: M.ease.inOut }, { transform: "none" }],
          { duration: 2 * M.dur.snappy, delay: j * 60 });
      });
    }
    io.observe(phone);
    INPUT.forEach(function (ev) { addEventListener(ev, arm, { capture: true, passive: true }); });
  })();

  /* The HTML holds hand 1, dealt. Draw it again from the data so what is on
     screen is what this script draws, then switch the slabs on. */
  table = dealt(SPOTS[0]);
  stage.innerHTML = renderTable(SPOTS[0], table);
  renderDecisions(SPOTS[0]);
  phone.setAttribute("data-enhanced", "");
  paintProgress();
  finishDeal(false, true);
})();
