/* Motion for the home page's sections: the scroll-read statement, the pinned
   story, the bento pictures, and the parallax on the hero's floating pieces.

   All enhancement. Every start state is set here, in JS, so with no JS, a
   blocked script or Reduce Motion the page is complete and nothing is hidden.
   Animates transform and opacity only, with the durations and easing parsed
   from tokens.css by site.js (window.PreflopMotion). */
(function () {
  "use strict";
  var doc = document, M = window.PreflopMotion, gsap = window.gsap, ST = window.ScrollTrigger;
  if (!M || !gsap || !ST || M.reduce) return;
  gsap.registerPlugin(ST);
  var ease = M.ease, slide = M.dur.reveal;

  function all(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  /* Play once when the element scrolls in. The start state is set first, so a
     picture that enters already past the line plays from its start. */
  function once(trigger, prep, play) {
    prep();
    ST.create({ trigger: trigger, start: "top 82%", once: true, onEnter: play });
  }

  /* ---- Statement: words light up as it scrolls through ------------------------ */
  all("[data-scrub]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    var spans = words.map(function (w, i) {
      var s = doc.createElement("span");
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(doc.createTextNode(" "));
      return s;
    });
    gsap.set(spans, { opacity: 0.4 });
    gsap.to(spans, {
      opacity: 1, ease: "none", stagger: 0.12,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.4 }
    });
  });

  /* ---- Story: one sticky phone, chapters scroll past it ------------------------ */
  var mm = gsap.matchMedia();
  function indexPieces(root) {
    all(".piece", root).forEach(function (p) { p.style.setProperty("--i", p.getAttribute("data-i") || 0); });
  }
  /* Stacked (a phone, a tablet): each chapter's pieces rise in as it scrolls in. */
  all(".story").forEach(function (story) {
    story.setAttribute("data-fx", "");
    all(".story__chapter", story).forEach(function (c) {
      var set = c.querySelector(".pieces");
      if (!set) return;
      indexPieces(set);
      ST.create({ trigger: c, start: "top 70%", once: true, onEnter: function () { all(".piece", set).forEach(function (p) { p.classList.add("is-in"); }); } });
    });
  });

  /* ---- Badges: each starts unearned and its tiers fill in ---------------------- */
  all(".badges").forEach(function (sec) {
    sec.setAttribute("data-fx", "");
    var n = 0;
    all(".badge", sec).forEach(function (b) {
      ST.create({ trigger: b, start: "top 92%", once: true, onEnter: function () { setTimeout(function () { b.classList.add("is-in"); }, (n++ % 6) * 90); } });
    });
  });
  mm.add("(min-width: 64rem)", function () {
    var inner = doc.querySelector("[data-story]"), story = inner && inner.closest(".story");
    if (!story) return;
    var chapters = all("[data-chapter]", story), screens = all(".story__img", story), dots = all(".story__dots li", story);
    var stage = story.querySelector("[data-stage]"), sets = [];
    story.setAttribute("data-pin", "");
    /* Each chapter's pieces get a set on the stage, which rises in when its
       chapter is the one being read. */
    chapters.forEach(function (c) {
      var src = c.querySelector(".pieces"), set = doc.createElement("div");
      set.className = "pieceset";
      set.setAttribute("aria-hidden", "true");
      if (src) Array.prototype.forEach.call(src.children, function (p) { set.appendChild(p.cloneNode(true)); });
      indexPieces(set);
      if (stage) stage.appendChild(set);
      sets.push(set);
    });
    function show(n) {
      chapters.forEach(function (c, i) { c.classList.toggle("is-active", i === n); });
      screens.forEach(function (s, i) { s.classList.toggle("is-active", i === n); });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === n); });
      sets.forEach(function (s, i) { all(".piece", s).forEach(function (p) { p.classList.toggle("is-in", i === n); }); });
    }
    show(0);
    chapters.forEach(function (c, i) {
      ST.create({ trigger: c, start: "top 58%", end: "bottom 58%", onToggle: function (self) { if (self.isActive) show(i); } });
    });
    ST.refresh();
    return function () {
      story.removeAttribute("data-pin");
      chapters.concat(screens, dots).forEach(function (el) { el.classList.remove("is-active"); });
      sets.forEach(function (s) { s.remove(); });
    };
  });

  /* ---- Bento: each picture plays once ------------------------------------------ */
  all("[data-anim]").forEach(function (card) {
    var kind = card.getAttribute("data-anim");
    if (kind === "mix") {
      var bars = all(".mix__bar", card);
      var targets = bars.map(function (b) { return parseFloat(getComputedStyle(b).getPropertyValue("--f")) || 0; });
      once(card, function () { gsap.set(bars, { scaleX: 0 }); }, function () {
        bars.forEach(function (b, i) {
          gsap.to(b, { scaleX: targets[i], duration: slide * 1.4, delay: 0.15 + i * 0.12, ease: ease, clearProps: "transform" });
        });
      });
    } else if (kind === "chart") {
      var cells = all(".chart__grid i", card);
      once(card, function () { gsap.set(cells, { opacity: 0, scale: 0.4 }); }, function () {
        gsap.to(cells, {
          opacity: 1, scale: 1, duration: M.dur.entrance * 1.6, ease: ease, clearProps: "transform,opacity",
          stagger: { amount: 0.9, grid: [13, 13], from: "start" }
        });
      });
    } else if (kind === "pop") {
      var items = all("[data-pop]", card);
      once(card, function () { gsap.set(items, { opacity: 0, scale: 0.6 }); }, function () {
        gsap.to(items, { opacity: 1, scale: 1, duration: M.dur.entrance * 1.5, ease: ease, stagger: 0.07, delay: 0.1, clearProps: "transform,opacity" });
      });
    } else if (kind === "rise") {
      var rises = all("[data-rise]", card);
      once(card, function () { gsap.set(rises, { opacity: 0, y: M.rise * 2 }); }, function () {
        gsap.to(rises, { opacity: 1, y: 0, duration: M.dur.reveal, ease: ease, stagger: 0.12, delay: 0.1, clearProps: "transform,opacity" });
      });
    } else if (kind === "trend") {
      /* A panel-coloured cover slides off the line, drawing it left to right. */
      var svg = card.querySelector("svg");
      var cover = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
      cover.setAttribute("class", "trend__cover");
      cover.setAttribute("x", "0"); cover.setAttribute("y", "-4");
      cover.setAttribute("width", "330"); cover.setAttribute("height", "130");
      svg.appendChild(cover);
      once(card, function () {}, function () {
        gsap.to(cover, { x: 340, duration: 1.4, delay: 0.15, ease: ease, onComplete: function () { cover.remove(); } });
      });
    }
  });

  /* ---- Page progress: a thin amber line along the top fills as you scroll ------ */
  all("[data-progress]").forEach(function (bar) {
    gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  });

  /* ---- Parallax: pieces drift against the scroll ---------------------------------
     data-parallax="N" moves the element N px up (negative: down) across its
     section. Only where the pieces are shown (a desktop). */
  mm.add("(min-width: 60rem)", function () {
    all("[data-parallax]").forEach(function (el) {
      var d = parseFloat(el.getAttribute("data-parallax")) || 0;
      gsap.fromTo(el, { y: d }, {
        y: -d, ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el.parentNode, start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });
    /* The demo leans a few degrees toward the pointer, then settles. Only with a
       real pointer; a touch screen has nothing to lean toward. */
    var undo, hero = doc.querySelector(".hero__demo"), phone = doc.getElementById("demo");
    if (hero && phone && matchMedia("(hover: hover) and (pointer: fine)").matches) {
      var rx = gsap.quickTo(phone, "rotationX", { duration: 0.6, ease: "power3.out" });
      var ry = gsap.quickTo(phone, "rotationY", { duration: 0.6, ease: "power3.out" });
      gsap.set(phone, { transformPerspective: 1100 });
      var lean = function (e) {
        var r = hero.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 7);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
      };
      var settle = function () { rx(0); ry(0); };
      hero.addEventListener("pointermove", lean);
      hero.addEventListener("pointerleave", settle);
      undo = function () { hero.removeEventListener("pointermove", lean); hero.removeEventListener("pointerleave", settle); gsap.set(phone, { clearProps: "transform" }); };
    }
    /* The floating pieces arrive after the hero has painted. */
    var floats = all(".float");
    gsap.set(floats, { opacity: 0, scale: 0.85 });
    gsap.to(floats, { opacity: 1, scale: 1, duration: M.dur.reveal, ease: ease, stagger: 0.15, delay: 0.5, clearProps: "opacity" });
    return function () { if (undo) undo(); };
  });
})();
