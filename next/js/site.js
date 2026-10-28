/* Behaviour for /next/ pages: CTA slots, the nav menu, the theme toggle and
   scroll reveals.
   Everything here is enhancement. With no JS, or with Reduce Motion, the page
   is complete and nothing is hidden. Animates transform and opacity only, with
   the durations and easing parsed from tokens.css so the numbers live once. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;

  /* ---- CTA slots -------------------------------------------------------- */
  var cfg = (window.PreflopConfig || {}).cta;
  if (cfg) {
    doc.querySelectorAll("a[data-cta]").forEach(function (a) {
      if (cfg.mode === "coming-soon") {
        var badge = doc.createElement("span");
        badge.className = "badge-soon";
        badge.textContent = "Coming soon";
        a.replaceWith(badge);
      } else if (a.getAttribute("href") !== cfg.testflightUrl) {
        a.setAttribute("href", cfg.testflightUrl);
      }
    });
  }

  /* ---- Nav menu ----------------------------------------------------------
     Below the nav's container breakpoint the links sit behind a toggle. Open:
     aria-expanded is true, focus moves to the first link, Tab stays inside the
     bar, and the rest of the page is inert. Escape, a click outside, a link,
     or growing to the wide layout closes it and Escape returns focus to the
     toggle. Without JS the links are a plain row under the bar. */
  doc.querySelectorAll("[data-nav]").forEach(function (nav) {
    var toggle = nav.querySelector(".nav__toggle");
    var panel = toggle && doc.getElementById(toggle.getAttribute("aria-controls"));
    if (!toggle || !panel) return;
    nav.setAttribute("data-enhanced", "");

    var inerted = [];
    function setInert(on) {
      if (!on) { inerted.forEach(function (el) { el.inert = false; }); inerted = []; return; }
      for (var node = nav; node && node !== doc.body; node = node.parentNode) {
        Array.prototype.forEach.call(node.parentNode.children, function (sib) {
          if (sib !== node && sib.tagName !== "SCRIPT" && !sib.inert) { sib.inert = true; inerted.push(sib); }
        });
      }
    }
    function focusables() {
      return Array.prototype.filter.call(
        nav.querySelectorAll("a[href], button"),
        function (el) { return el.offsetParent !== null; });
    }
    function isOpen() { return nav.hasAttribute("data-open"); }
    function locks() { return getComputedStyle(nav).position === "sticky"; }

    function open() {
      nav.setAttribute("data-open", "");
      toggle.setAttribute("aria-expanded", "true");
      setInert(true);
      if (locks()) root.style.overflow = "hidden";
      var first = panel.querySelector("a[href]");
      if (first) first.focus();
    }
    function close(returnFocus) {
      nav.removeAttribute("data-open");
      toggle.setAttribute("aria-expanded", "false");
      setInert(false);
      root.style.overflow = "";
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", function () { if (isOpen()) close(true); else open(); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) close(false); });
    doc.addEventListener("click", function (e) {
      if (isOpen() && (!nav.contains(e.target) || e.target.closest(".nav__scrim"))) close(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (!isOpen()) return;
      if (e.key === "Escape") { e.preventDefault(); close(true); return; }
      if (e.key !== "Tab") return;
      var items = focusables();
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1], at = doc.activeElement;
      if (!nav.contains(at)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && at === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus(); }
    });
    /* Growing past the breakpoint (rotating a tablet) leaves the links inline,
       so a menu left open would hold the page inert for nothing. */
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        if (isOpen() && getComputedStyle(toggle).display === "none") close(false);
      }).observe(nav);
    }
  });

  /* ---- Theme toggle: system by default, data-theme once the visitor picks - */
  var light = matchMedia("(prefers-color-scheme: light)");
  function isDark() {
    var set = root.getAttribute("data-theme");
    return set ? set === "dark" : !light.matches; /* dark is the default */
  }
  doc.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.hidden = false;
    function label() { btn.textContent = isDark() ? "Light mode" : "Dark mode"; }
    label();
    btn.addEventListener("click", function () {
      root.setAttribute("data-theme", isDark() ? "light" : "dark");
      label();
    });
  });

  /* ---- Scroll reveals ---------------------------------------------------- */
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!gsap || !ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  var css = getComputedStyle(root);
  function token(name, fallback) { return css.getPropertyValue(name).trim() || fallback; }
  function ms(name, fallback) { return parseFloat(token(name, fallback)) / 1000; }
  function px(name, fallback) { return parseFloat(token(name, fallback)); }

  /* cubic-bezier(x1, y1, x2, y2) from tokens.css as a GSAP ease function. */
  function bezier(str) {
    var p = (str.match(/-?[\d.]+/g) || [0, 0, 0.58, 1]).map(Number);
    var x1 = p[0], y1 = p[1], x2 = p[2], y2 = p[3];
    function at(a, b, t) { var u = 1 - t; return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t; }
    return function (x) {
      if (x <= 0 || x >= 1) return x;
      var lo = 0, hi = 1, t = x;
      for (var i = 0; i < 24; i++) {
        t = (lo + hi) / 2;
        if (at(x1, x2, t) < x) lo = t; else hi = t;
      }
      return at(y1, y2, t);
    };
  }

  var ease = bezier(token("--ease-out", "cubic-bezier(0, 0, 0.58, 1)"));
  var dur = ms("--dur-entrance", "240ms");
  var rise = px("--entrance-rise", "12");
  var step = ms("--entrance-step", "40ms");
  var maxDelay = ms("--entrance-max-delay", "160ms");

  function play(els) {
    gsap.fromTo(els,
      { opacity: 0, y: rise },
      { opacity: 1, y: 0, duration: dur, ease: ease, clearProps: "transform,opacity",
        delay: function (i) { return Math.min(i * step, maxDelay); } });
  }

  /* Items already on screen at load stay put: reveals are for what scrolls in,
     and nothing above the fold waits on this script. */
  var groups = [];
  doc.querySelectorAll("[data-reveal-group]").forEach(function (g) {
    groups.push({ trigger: g, items: g.querySelectorAll("[data-reveal]") });
  });
  doc.querySelectorAll("[data-reveal]").forEach(function (el) {
    if (!el.closest("[data-reveal-group]")) groups.push({ trigger: el, items: [el] });
  });

  groups.forEach(function (g) {
    if (!g.items.length) return;
    if (g.trigger.getBoundingClientRect().top < innerHeight * 0.88) return;
    gsap.set(g.items, { opacity: 0, y: rise });
    ScrollTrigger.create({
      trigger: g.trigger, start: "top 88%", once: true,
      onEnter: function () { play(g.items); }
    });
  });

  /* Replay buttons run the same animation on demand (style guide). */
  doc.querySelectorAll("[data-reveal-replay]").forEach(function (btn) {
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var scope = doc.querySelector(btn.getAttribute("data-reveal-replay"));
      if (!scope) return;
      var items = scope.querySelectorAll("[data-reveal]");
      gsap.set(items, { opacity: 0, y: rise });
      play(items);
    });
  });
})();
