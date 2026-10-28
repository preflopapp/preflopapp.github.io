/* The playable demo on /next/: three real hands from the app's practice screen,
   graded the way the app grades them. Ported from /landing/ (same spots, same
   grading rules) and rebuilt for the /next/ page CSP:

   - No inline style="" in any markup it writes: seat positions are CSS (data-i),
     and the few dynamic values (a bar's share) go through the CSSOM.
   - Only transform and opacity animate (Web Animations, easing and durations
     read from tokens.css so the numbers live once).
   - Reduce Motion: the hand is simply dealt, nothing animates.
   - Without JS the HTML already shows the first hand; this script enhances it.

   The first hand is rendered into the HTML too (for no-JS). To refresh that
   markup after changing renderTable(), see .claude/rules/next.md. */
(function () {
  "use strict";
  var doc = document;
  var phone = doc.getElementById("demo");
  if (!phone) return;

  /* The three hands. freq is the chart's mix, in percent. */
  const SPOTS = [
  {"prompt": "You’re first to act. What’s your move?", "heroPosition": "utg", "context": "100bb · 6-max", "hand": [{"r": "K", "s": "spades"}, {"r": "5", "s": "spades"}], "spotType": "rfi", "seatOrder": ["btn", "sb", "bb", "utg", "hj", "co"], "folded": [], "acting": null, "chips": {"sb": "0.5", "bb": "1"}, "pot": "1.5", "freq": {"fold": 61, "call": 39}, "actionSequence": []},
  {"prompt": "UTG raises to 3bb. Your move.", "heroPosition": "hj", "context": "vs a 3bb UTG open · 100bb · 6-max", "hand": [{"r": "A", "s": "hearts"}, {"r": "Q", "s": "diamonds"}], "spotType": "facing_open", "seatOrder": ["sb", "bb", "utg", "hj", "co", "btn"], "folded": [], "acting": "utg", "chips": {"sb": "0.5", "bb": "1", "utg": "3"}, "pot": "4.5", "freq": {"call": 49, "three_bet": 51}, "actionSequence": [{"position": "utg", "action": "raise", "sizingBB": 3.0}]},
  {"prompt": "BB 3-bets to 12bb. Your move.", "heroPosition": "btn", "context": "vs a 12bb BB 3-bet · 100bb · 6-max", "hand": [{"r": "A", "s": "clubs"}, {"r": "J", "s": "spades"}], "spotType": "facing_three_bet", "seatOrder": ["utg", "hj", "co", "btn", "sb", "bb"], "folded": ["sb", "utg", "hj", "co"], "acting": "bb", "chips": {"sb": "0.5", "bb": "12", "btn": "3"}, "pot": "15.5", "freq": {"call": 72, "four_bet": 28}, "actionSequence": [{"position": "utg", "action": "fold", "sizingBB": null}, {"position": "hj", "action": "fold", "sizingBB": null}, {"position": "co", "action": "fold", "sizingBB": null}, {"position": "btn", "action": "raise", "sizingBB": 3.0}, {"position": "sb", "action": "fold", "sizingBB": null}, {"position": "bb", "action": "raise", "sizingBB": 12.0}]}
];

  var $ = function (id) { return doc.getElementById(id); };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  };

  var DISP = { utg: "UTG", hj: "HJ", co: "CO", btn: "BTN", sb: "SB", bb: "BB" };
  /* HeroDecision.allCases: the order a tie breaks in. */
  var DEC_ORDER = ["fold", "call", "three_bet", "four_bet"];
  var HEAD = { rfi: "Raise first in", facing_open: "Facing an open", facing_three_bet: "Facing a 3-bet" };
  var SUIT_FILE = { spades: "spade", hearts: "heart", diamonds: "diamond", clubs: "club" };
  var RANK_NAME = { A: "Ace", K: "King", Q: "Queen", J: "Jack", T: "Ten", "9": "Nine", "8": "Eight", "7": "Seven", "6": "Six", "5": "Five", "4": "Four", "3": "Three", "2": "Two" };

  function decisionsFor(type) {
    if (type === "rfi") return ["fold", "call"];
    if (type === "facing_open") return ["fold", "call", "three_bet"];
    return ["fold", "call", "four_bet"];
  }
  /* An RFI's "call" slot is the open, so it reads Raise. */
  function labelFor(d, type) {
    if (d === "fold") return "Fold";
    if (d === "call") return type === "rfi" ? "Raise" : "Call";
    return d === "three_bet" ? "3-Bet" : "4-Bet";
  }
  /* Red folds, blue calls, green puts money in. */
  function kindFor(d, type) {
    if (d === "fold") return "fold";
    if (d === "call") return type === "rfi" ? "raise" : "call";
    return "raise";
  }

  /* ---- Grading (AnswerResult.grade, ActionMix.topAction / tiedActions) ---- */
  function pct(spot, d) { return spot.freq[d] || 0; }
  function ranked(spot) {
    return Object.keys(spot.freq).sort(function (a, b) {
      return spot.freq[b] - spot.freq[a] || DEC_ORDER.indexOf(a) - DEC_ORDER.indexOf(b);
    });
  }
  function topAction(spot) { return ranked(spot)[0]; }
  /* Ten points: a hand the chart raises 54% and folds 46% has no one right
     answer, and the app doesn't pretend it does. A line the chart plays at
     least a quarter of the time is also credited. The app calls this grade
     Mixed on screen; "close" is only its stored name, kept here for the CSS. */
  function withinClose(points) { return points <= 10 + 1e-9; }
  var PLAYED_LINE = 25;
  function grade(spot, answer) {
    var top = topAction(spot), short = Math.max(0, pct(spot, top) - pct(spot, answer));
    if (tiedActions(spot) && withinClose(short)) return "close";
    if (answer === top) return "correct";
    if (withinClose(short)) return "close";
    return pct(spot, answer) >= PLAYED_LINE ? "close" : "wrong";
  }
  function playedLines(spot) { return ranked(spot).filter(function (d) { return pct(spot, d) >= PLAYED_LINE; }).length; }
  function tiedActions(spot) {
    var order = ranked(spot);
    if (order.length < 2) return null;
    return withinClose(pct(spot, order[0]) - pct(spot, order[1])) ? [order[0], order[1]] : null;
  }
  /* The action as the app words it on this spot: on an opening, "call" is the raise. */
  function nm(spot, d) { return labelFor(d, spot.spotType).toLowerCase(); }
  function closeCallNote(spot, picked) {
    var tie = tiedActions(spot);
    if (!tie) return null;
    var top = tie[0], runner = tie[1];
    if (picked !== top && picked !== runner) {
      return "The chart is split here: " + nm(spot, top) + " " + pct(spot, top) + "% of the time, " + nm(spot, runner) + " " + pct(spot, runner) + "%.";
    }
    var other = picked === top ? runner : top;
    return "The chart splits this one: " + nm(spot, picked) + " " + pct(spot, picked) + "% of the time, " + nm(spot, other) + " " + pct(spot, other) + "%. Either is defensible.";
  }
  /* A line the chart plays, but not its main one. */
  function playedLineNote(spot, picked) {
    var top = topAction(spot);
    if (picked === top || pct(spot, picked) < PLAYED_LINE) return null;
    return "The chart plays this line too: " + nm(spot, picked) + " " + pct(spot, picked) + "% of the time. The main line is " + nm(spot, top) + ", at " + pct(spot, top) + "%.";
  }
  function missNote(spot, picked) {
    var top = topAction(spot);
    return "You chose " + nm(spot, picked) + ". The chart plays " + nm(spot, top) + " here, " + pct(spot, top) + "% of the time.";
  }

  /* ---- Drawn pieces ------------------------------------------------------- */
  function cardHTML(c) {
    var red = c.s === "hearts" || c.s === "diamonds";
    return '<span class="pcard' + (red ? " pcard--red" : "") + '" role="img" aria-label="' + RANK_NAME[c.r] + " of " + c.s + '">' + c.r +
      '<img class="pcard__suit" src="/assets/suits/' + SUIT_FILE[c.s] + '.svg" alt="" width="26" height="26"></span>';
  }
  function chipHTML(kind) {
    return '<svg class="chip chip--' + kind + '" viewBox="0 0 19 19" aria-hidden="true">' +
      '<circle class="chip__body" cx="9.5" cy="9.5" r="9.5"/><circle class="chip__ring" cx="9.5" cy="9.5" r="6.4"/></svg>';
  }
  function betHTML(spot, seat) {
    var amt = spot.chips[seat];
    if (amt == null) return "";
    var acting = spot.acting === seat;
    var kind = acting ? "acting" : parseFloat(amt) <= 1 ? "blind" : "live";
    return '<span class="bet' + (acting ? " bet--acting" : "") + '">' + chipHTML(kind) + "<span>" + amt + "bb</span></span>";
  }

  function renderTable(spot) {
    var html =
      '<div class="rail"></div><div class="felt"></div><div class="bet-line"></div>' +
      '<div class="centre-mark t-label">Preflop</div>' +
      '<div class="pot"><div class="pot__label t-label">Pot</div><div class="pot__amount">' + spot.pot + "bb</div>" +
      '<div class="pot__bars"><i></i><i></i><i></i></div><div class="pot__meta">100bb effective · 6-max</div></div>';

    spot.seatOrder.forEach(function (seat, i) {
      var folded = spot.folded.indexOf(seat) >= 0, acting = spot.acting === seat;
      if (seat === spot.heroPosition) {
        html += '<div class="seat seat--hero" data-seat="' + seat + '" data-i="' + i + '">' +
          '<div class="bet-slot">' + betHTML(spot, seat) + "</div>" +
          '<div class="hero-cards">' + spot.hand.map(cardHTML).join("") + "</div>" +
          '<div class="hero-badge">' + DISP[seat] + "</div></div>";
        return;
      }
      /* Chips sit on the side of the pod that faces the pot. */
      var above = i === 2 || i === 3 || i === 4;
      html += '<div class="seat' + (folded ? " folded" : "") + (acting ? " acting" : "") + '" data-seat="' + seat + '" data-i="' + i + '">' +
        (above ? '<div class="bet-slot bet-slot--above">' + betHTML(spot, seat) + "</div>" : "") +
        '<div class="pod-wrap">' + (folded ? "" : '<div class="fan"><span class="fan__back"></span><span class="fan__back"></span></div>') +
        '<div class="pod"><div class="pod__name">' + DISP[seat] + '</div><div class="pod__detail">' + (folded ? "folded" : "100bb") + "</div></div></div>" +
        (above ? "" : '<div class="bet-slot bet-slot--below">' + betHTML(spot, seat) + "</div>") + "</div>";
    });

    var di = spot.seatOrder.indexOf("btn");
    html += '<div class="dealer" data-i="' + di + '"' + (spot.heroPosition === "btn" ? " data-hero" : "") + ">D</div>";
    return html;
  }

  /* ---- Motion -------------------------------------------------------------- */
  var reduced = matchMedia("(prefers-reduced-motion: reduce)");
  var tokens = getComputedStyle(doc.documentElement);
  function tok(name, fallback) { return tokens.getPropertyValue(name).trim() || fallback; }
  var EASE = tok("--ease-out", "cubic-bezier(0, 0, 0.58, 1)");
  function ms(name, fallback) { return parseFloat(tok(name, fallback)); }
  function motion(el, frames, duration, delay) {
    if (!el || reduced.matches || !el.animate) return;
    el.animate(frames, { duration: duration, delay: delay || 0, easing: EASE, fill: "backwards" });
  }
  function pause(t) { return new Promise(function (r) { setTimeout(r, t); }); }

  /* ---- The demo ------------------------------------------------------------- */
  var stage = $("demo-stage"), fb = $("demo-feedback"), decisions = $("demo-decisions");
  var title = $("demo-title"), count = $("demo-count"), dots = $("demo-dots");
  var status = $("demo-status"), line = $("demo-line"), announce = $("demo-announce");
  var state = { i: 0, answers: [], answered: false, ready: false, run: 0 };
  var table;

  function seatNode(seat) { return stage.querySelector('[data-seat="' + seat + '"]'); }
  function say(text) { announce.textContent = text; }

  function renderDecisions(spot) {
    decisions.hidden = false;
    decisions.innerHTML = decisionsFor(spot.spotType).map(function (d) {
      return '<button class="dbtn dbtn--' + kindFor(d, spot.spotType) + '" type="button" data-d="' + d + '" disabled>' +
        '<span class="dbtn__bar"></span><span class="dbtn__label">' + labelFor(d, spot.spotType) + "</span></button>";
    }).join("");
  }

  function paintProgress() {
    Array.prototype.forEach.call(dots.children, function (dot, i) {
      dot.className = i < state.answers.length ? state.answers[i] === "wrong" ? "miss" : state.answers[i] : i === state.i ? "now" : "";
    });
    count.textContent = Math.min(state.i + 1, SPOTS.length) + " / " + SPOTS.length;
    status.textContent = state.i < SPOTS.length ? "Hand " + (state.i + 1) + " of " + SPOTS.length + " · " + SPOTS[state.i].context : "That was all three.";
  }

  function updateTable(action) {
    var spot = SPOTS[state.i], kind = action.action, pos = action.position;
    if (kind !== "blind" && kind !== "fold") table.acting = pos;
    if (kind === "fold") table.folded.push(pos); else table.chips[pos] = String(action.sizingBB);
    stage.querySelectorAll(".seat").forEach(function (el) {
      el.classList.toggle("acting", el.dataset.seat === table.acting);
      el.querySelector(".bet-slot").innerHTML = betHTML(table, el.dataset.seat);
    });
    var el = seatNode(pos), fromBelow = pos === spot.heroPosition || [2, 3, 4].indexOf(spot.seatOrder.indexOf(pos)) >= 0;
    if (kind === "fold") {
      el.classList.add("folded");
      var fan = el.querySelector(".fan");
      if (fan) { motion(fan, [{ opacity: 1, translate: "0 0" }, { opacity: 0, translate: "0 12px" }], ms("--dur-entrance", "240")); fan.style.opacity = "0"; }
    } else {
      motion(el.querySelector(".bet"), [{ opacity: 0, transform: "translateY(" + (fromBelow ? 22 : -22) + "px) scale(.8)" }, { opacity: 1, transform: "none" }], ms("--dur-emphasis", "370"));
    }
    var detail = el.querySelector(".pod__detail");
    if (detail) detail.textContent = kind === "fold" ? "folded" : "100bb";
    if (kind !== "blind") motion(el.querySelector(".pod-wrap") || el.querySelector(".hero-badge"), [{ scale: "1" }, { scale: "1.18", offset: 0.4 }, { scale: "1" }], ms("--dur-emphasis", "370"));
    var total = 0;
    for (var k in table.chips) total += Number(table.chips[k]);
    if (total !== Number(table.pot)) {
      table.pot = String(total);
      var amount = stage.querySelector(".pot__amount");
      amount.textContent = total + "bb";
      motion(amount, [{ opacity: 0.4, translate: "0 3px" }, { opacity: 1, translate: "0 0" }], ms("--dur-entrance", "240"));
    }
    var hero = pos === spot.heroPosition;
    line.textContent = kind === "blind" ? DISP[pos] + " posts " + action.sizingBB + "bb"
      : kind === "fold" ? DISP[pos] + " folds"
      : (hero ? "You raise" : DISP[pos] + " raises") + " to " + action.sizingBB + "bb";
  }

  function finishDeal() {
    state.ready = true;
    stage.classList.remove("is-dealing");
    stage.querySelectorAll(".fan,.hero-cards").forEach(function (el) { el.style.visibility = ""; });
    var spot = SPOTS[state.i];
    line.textContent = spot.prompt;
    say(HEAD[spot.spotType] + ". " + spot.prompt);
    decisions.querySelectorAll("button").forEach(function (b) { b.disabled = false; });
  }

  /* A tap on the table skips the deal. */
  function skipDeal() {
    if (state.ready || state.answered) return;
    state.run++;
    stage.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
    stage.innerHTML = renderTable(SPOTS[state.i]);
    finishDeal();
  }
  stage.addEventListener("click", skipDeal);
  reduced.addEventListener("change", function () { if (reduced.matches) skipDeal(); });

  function renderHand(focus) {
    var run = ++state.run, spot = SPOTS[state.i];
    state.answered = false; state.ready = false;
    title.textContent = HEAD[spot.spotType];
    fb.innerHTML = "";
    phone.classList.remove("is-scored");
    renderDecisions(spot); paintProgress();
    function focusFirst() { if (focus) decisions.querySelector("button").focus({ preventScroll: true }); }
    if (reduced.matches) { stage.innerHTML = renderTable(spot); finishDeal(); focusFirst(); return Promise.resolve(); }

    table = { prompt: spot.prompt, heroPosition: spot.heroPosition, hand: spot.hand, seatOrder: spot.seatOrder, chips: {}, folded: [], acting: null, pot: "0" };
    stage.innerHTML = renderTable(table);
    stage.classList.add("is-dealing");
    stage.querySelectorAll(".fan,.hero-cards").forEach(function (el) { el.style.visibility = "hidden"; });
    line.textContent = "Dealing…";

    var actions = [{ position: "sb", action: "blind", sizingBB: 0.5 }, { position: "bb", action: "blind", sizingBB: 1 }].concat(spot.actionSequence);
    return (async function () {
      for (var n = 0; n < spot.seatOrder.length; n++) {
        if (run !== state.run) return;
        var seat = spot.seatOrder[n], node = seatNode(seat), cards = node.querySelector(".fan,.hero-cards");
        var pos = { 0: [0.5, 0.16], 1: [0.8648, 0.34], 2: [0.8716, 0.63], 3: [0.5, 0.79], 4: [0.1284, 0.63], 5: [0.1352, 0.34] }[n];
        cards.style.visibility = "visible";
        motion(cards, [{ opacity: 0, translate: (0.5 - pos[0]) * 180 + "px " + (0.42 - pos[1]) * 180 + "px", scale: ".5" }, { opacity: 1, translate: "0 0", scale: "1" }], ms("--dur-emphasis", "370"));
        await pause(85);
      }
      for (var a = 0; a < actions.length; a++) {
        await pause(actions[a].action === "fold" ? 200 : 320);
        if (run !== state.run) return;
        updateTable(actions[a]);
      }
      await pause(240);
      if (run !== state.run) return;
      finishDeal();
      motion(stage.querySelector(".hero-cards"), [{ transform: "rotateY(90deg)" }, { transform: "rotateY(0)" }], ms("--dur-slide", "330"));
      focusFirst();
    })();
  }

  function choose(d) {
    if (state.answered || !state.ready) return;
    var spot = SPOTS[state.i], result = grade(spot, d), top = topAction(spot);
    state.answered = true;
    state.answers.push(result);
    var lines = playedLines(spot);
    var headline = result === "correct" ? "Correct"
      : result === "close" ? "Mixed" + (lines === 2 ? " — the chart plays both" : lines === 3 ? " — the chart plays all three" : "")
      : "Wrong";
    var message = result === "correct" ? labelFor(top, spot.spotType) + " is the chart’s top play."
      : result === "close" ? playedLineNote(spot, d) || closeCallNote(spot, d)
      : missNote(spot, d);
    decisions.querySelectorAll("button").forEach(function (btn) {
      var action = btn.dataset.d, share = pct(spot, action);
      btn.disabled = true;
      btn.classList.add("is-revealed");
      btn.classList.toggle("is-picked", action === d);
      btn.style.setProperty("--f", share / 100);
      var pc = doc.createElement("span");
      pc.className = "dbtn__pc";
      pc.textContent = share + "%";
      btn.appendChild(pc);
      btn.setAttribute("aria-label", labelFor(action, spot.spotType) + ": " + share + "%" + (action === d ? ", your choice" : ""));
    });
    if (d === "fold") motion(stage.querySelector(".hero-cards"), [{ translate: "0 0", opacity: 1 }, { translate: "0 -18px", opacity: 0.3 }], ms("--dur-settle", "300"));
    else motion(stage.querySelector(".hero-badge"), [{ scale: "1" }, { scale: "1.18" }, { scale: "1" }], ms("--dur-emphasis", "370"));
    var last = state.i === SPOTS.length - 1;
    fb.innerHTML = '<div class="phone__result ' + (result === "correct" ? "is-correct" : "is-miss") + '"><div class="phone__result-copy"><strong>' + headline + "</strong><p>" + esc(message) + "</p></div>" +
      '<button class="btn btn--primary btn--sm" id="demo-next" type="button">' + (last ? "See result" : "Next hand") + '<span aria-hidden="true"> →</span></button></div>';
    line.textContent = "You chose " + labelFor(d, spot.spotType).toLowerCase() + ".";
    say(headline + ". " + message);
    var next = $("demo-next");
    next.addEventListener("click", advance);
    next.focus({ preventScroll: true });
    paintProgress();
  }

  function advance() {
    state.i++;
    if (state.i >= SPOTS.length) { renderScore(); paintProgress(); return; }
    renderHand(true);
  }

  function ctaHTML() {
    var cfg = (window.PreflopConfig || {}).cta;
    if (!cfg) return "";
    if (cfg.mode === "coming-soon") return '<span class="badge-soon">Coming soon</span>';
    return '<a class="btn btn--primary btn--sm" data-cta href="' + esc(cfg.testflightUrl) + '">Join the beta</a>';
  }

  function renderScore() {
    var kept = state.answers.filter(function (r) { return r !== "wrong"; }).length;
    var closing = kept === 3 ? { t: "Three for three.", c: "Preflop has 25,000+ more spots like these, each with the full mix and the reason." }
      : kept === 2 ? { t: "Two out of three.", c: "Preflop keeps track of the spots you miss, so you can drill them." }
      : { t: "These spots are hard.", c: "Preflop explains every answer and keeps track of the spots you miss." };
    decisions.hidden = true;
    phone.classList.add("is-scored");
    line.textContent = "Demo complete";
    fb.innerHTML = '<div class="score"><div class="score__head"><strong class="score__figure">' + kept + "<span> / 3</span></strong>" +
      '<span class="score__label t-label">Correct or mixed</span></div>' +
      '<h3 class="score__title">' + closing.t + '</h3><p class="score__copy">' + closing.c + "</p>" +
      '<div class="score__actions">' + ctaHTML() + '<button class="btn btn--secondary btn--sm" id="demo-again" type="button">Play again <span aria-hidden="true">↻</span></button></div></div>';
    say("Demo complete. " + kept + " of 3 correct or mixed.");
    $("demo-again").addEventListener("click", function () { state.i = 0; state.answers = []; renderHand(true); });
    var first = fb.querySelector("a, button");
    if (first) first.focus({ preventScroll: true });
  }

  decisions.addEventListener("click", function (e) {
    var btn = e.target.closest(".dbtn");
    if (btn && !btn.disabled) choose(btn.dataset.d);
  });

  /* The HTML holds hand one, dealt. Render it again from the data so what is
     on screen is always what this script draws, then switch the buttons on. */
  stage.innerHTML = renderTable(SPOTS[0]);
  renderDecisions(SPOTS[0]);
  phone.setAttribute("data-enhanced", "");
  paintProgress();
  finishDeal();
})();
