/* Behaviour for /next/ pages: CTA slots, the nav menu, the theme toggle, the
   motion tokens (window.PreflopMotion), picture entrances, the proof
   figures' count-up, the coverage bars' fill, and Free for everyone's pop
   and draw. No library: IntersectionObserver, the Web Animations API
   and requestAnimationFrame.
   Everything here is enhancement. With no JS, or with Reduce Motion, the page
   is complete and nothing is hidden. Animates transform and opacity only, with
   the durations and easing parsed from tokens.css so the numbers live once. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;

  /* ---- CTA slots -------------------------------------------------------- */
  var cfg = (window.PreflopConfig || {}).cta;
  if (cfg) {
    /* The QR encodes the same URL, so it goes when the link does. */
    if (cfg.mode === "coming-soon") doc.querySelectorAll("[data-cta-qr]").forEach(function (el) { el.hidden = true; });
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
     toggle. Without JS the links are a plain row under the bar.
     Every focus() here passes preventScroll: the nav is sticky, and focusing
     inside it scrolled the page up ~450 px on each open and close (NAV-01). */
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

    /* The page stays put behind the open menu: overflow hidden on html, and
       touch-action none on the open bar and scrim (components.css), which
       cover the whole screen, for iOS. Not on body: with html hidden too,
       body becomes the sticky nav's scroll container and the nav leaves
       the screen (found by the harness's menu probe, Phase 0). */
    function lock(on) { root.style.overflow = on ? "hidden" : ""; }
    function open() {
      nav.setAttribute("data-open", "");
      toggle.setAttribute("aria-expanded", "true");
      setInert(true);
      if (locks()) lock(true);
      var first = panel.querySelector("a[href]");
      if (first) first.focus({ preventScroll: true });
    }
    function close(returnFocus) {
      nav.removeAttribute("data-open");
      toggle.setAttribute("aria-expanded", "false");
      setInert(false);
      lock(false);
      if (returnFocus) toggle.focus({ preventScroll: true });
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
      if (!nav.contains(at)) { e.preventDefault(); first.focus({ preventScroll: true }); }
      else if (e.shiftKey && at === first) { e.preventDefault(); last.focus({ preventScroll: true }); }
      else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus({ preventScroll: true }); }
    });
    /* Growing past the breakpoint (rotating a tablet) leaves the links inline,
       so a menu left open would hold the page inert for nothing. */
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        if (isOpen() && getComputedStyle(toggle).display === "none") close(false);
      }).observe(nav);
    }

    /* The page you are on. The header is shared by every page, so the markup
       can't mark it (NAV-02); a link to a part of a page (/#pricing) never is. */
    nav.querySelectorAll(".nav__links a[href]").forEach(function (a) {
      if (!a.hash && a.pathname === location.pathname) a.setAttribute("aria-current", "page");
    });
  });

  /* ---- Theme toggle: system by default, data-theme once the visitor picks - */
  /* A choice made on one page carries to the next. Stored on this device only,
     and the page works the same when storage is blocked. */
  var KEY = "preflop-theme";
  function saved() { try { var v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : null; } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: per page load, as before */ } }
  /* Safari tints its bars from <meta name=theme-color>. Both metas follow the
     system scheme by their media queries, so once the visitor picks a theme
     both get that theme's --bg, or a dark iPhone set to Light keeps a dark
     bar over a light page (THEME-01). */
  function tintBar() {
    var bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    if (bg) doc.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.setAttribute("content", bg); });
  }
  if (saved()) { root.setAttribute("data-theme", saved()); tintBar(); }
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
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      save(next);
      tintBar();
      label();
    });
  });

  /* ---- A link to one FAQ answer (/faq/#restore) opens that answer --------- */
  function openTarget() {
    var el = location.hash.length > 1 && doc.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el && el.tagName === "DETAILS" && !el.open) { el.open = true; el.scrollIntoView(); }
  }
  openTarget();
  addEventListener("hashchange", openTarget);

  /* ---- Keep the reader's place when the width changes --------------------
     Rotating a phone or resizing a window reflows the page, and the browser
     keeps the same scroll offset, which is now another part of the page.
     Chromium's scroll anchoring stands down whenever the anchor's ancestors
     change padding or margin (every breakpoint does) and WebKit has none. So
     this remembers the first block of text on screen once scrolling stops
     (reading only, no style writes) and, after a width change, puts it back
     where it was: one instant scroll, never animated. A height-only change
     (the iOS toolbar showing or hiding) is left alone. */
  (function () {
    var nav = doc.querySelector(".nav"), width = innerWidth, mark = null, timer = 0;
    var BLOCKS = "main h2, main h3, main p, main li, main figure, main summary, body > footer";
    function line() { return nav && getComputedStyle(nav).position === "sticky" ? nav.getBoundingClientRect().bottom : 0; }
    function remember() {
      if (innerWidth !== width) return;
      var y = line(), list = doc.querySelectorAll(BLOCKS);
      mark = null;
      for (var i = 0; i < list.length; i++) {
        var r = list[i].getBoundingClientRect();
        if (r.height > 0 && r.bottom > y) { mark = { el: list[i], top: r.top }; return; }
      }
    }
    addEventListener("scroll", function () { clearTimeout(timer); timer = setTimeout(remember, 120); }, { passive: true });
    addEventListener("load", remember);
    addEventListener("resize", function () {
      if (innerWidth === width) return;
      width = innerWidth;
      if (!mark || !mark.el.isConnected || scrollY === 0) return;
      var shift = mark.el.getBoundingClientRect().top - mark.top;
      if (Math.abs(shift) > 1) window.scrollTo(0, scrollY + shift);
    });
  })();

  /* ---- Motion: the tokens -------------------------------------------------
     Durations and easings live once, in tokens.css. This reads them for the
     page's scripts: milliseconds and CSS easing strings, for the Web
     Animations API and requestAnimationFrame. Under Reduce Motion the tokens
     are zero and nothing below runs. */
  var css = getComputedStyle(root);
  function token(name, fallback) { return css.getPropertyValue(name).trim() || fallback; }
  function ms(name, fallback) { return parseFloat(token(name, fallback)); }

  /* cubic-bezier(x1, y1, x2, y2) as a function of progress, for what CSS
     can't animate (the count's digits). */
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

  var still = !matchMedia("(prefers-reduced-motion: no-preference)").matches;
  var M = window.PreflopMotion = Object.freeze({
    reduce: still,
    rise: parseFloat(token("--entrance-rise", "12")),
    step: ms("--entrance-step", "40ms"),
    maxDelay: ms("--entrance-max-delay", "160ms"),
    dur: Object.freeze({
      snappy: ms("--dur-snappy", "200ms"), settle: ms("--dur-settle", "300ms"),
      entrance: ms("--dur-entrance", "240ms"), emphasis: ms("--dur-emphasis", "370ms"),
      slide: ms("--dur-slide", "330ms"), press: ms("--dur-press", "240ms"), count: ms("--dur-count", "900ms")
    }),
    ease: Object.freeze({
      out: token("--ease-out", "cubic-bezier(0, 0, 0.58, 1)"), inOut: token("--ease-in-out", "ease-in-out"),
      emphasis: token("--ease-emphasis", "ease-out"), slide: token("--ease-slide", "ease-out"), press: token("--ease-press", "ease-out")
    }),
    bezier: bezier
  });

  /* ---- Motion: entrance, count, fill, pop and draw ------------------------
     Nothing on the page waits for these, and CSS hides nothing by itself. An
     element gets a start state (data-enter, -fill, -pop or -draw "pending", or a count's 0) only
     when all of these hold (redesign SPEC §4.7, rule 5): motion is allowed,
     IntersectionObserver exists, the element is still below the screen now,
     and the observer that reveals it is registered here, in the same task.
     Each plays once. A safety net reveals anything left: before printing, on a
     page restored from the back/forward cache, at load and every 4 s for
     whatever is on screen. */
  if (still || !("IntersectionObserver" in window) || !Element.prototype.animate) return;

  var waiting = new Map(); /* element -> function (instant) that shows it */
  function release(el, instant) {
    var show = waiting.get(el);
    if (!show) return;
    waiting.delete(el);
    observer.unobserve(el);
    show(instant);
  }
  /* Released the moment any part is on screen: an element still hidden while
     visible (at a -10% bottom margin, for one) is the half-shown state the
     harness fails. */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) release(e.target, false); });
  });
  function below(el) { return el.getBoundingClientRect().top > innerHeight; }
  function onScreen(el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }

  /* Entrance: a picture ([data-enter]) fades in and rises 12px; in a
     [data-enter-group] its pictures follow 40ms apart, at most 160ms late. */
  function enterItems(target) {
    return target.hasAttribute("data-enter-group")
      ? Array.prototype.slice.call(target.querySelectorAll("[data-enter]")) : [target];
  }
  doc.querySelectorAll("[data-enter-group], [data-enter]").forEach(function (target) {
    if (target.hasAttribute("data-enter") && target.parentElement && target.parentElement.closest("[data-enter-group]")) return;
    if (!below(target)) return;
    var items = enterItems(target);
    items.forEach(function (el) { el.setAttribute("data-enter", "pending"); });
    waiting.set(target, function (instant) {
      items.forEach(function (el, i) {
        el.setAttribute("data-enter", "done");
        if (instant) return;
        el.animate([
          { opacity: 0, transform: "translateY(" + M.rise + "px)" },
          { opacity: 1, transform: "none" }
        ], { duration: M.dur.entrance, delay: Math.min(i * M.step, M.maxDelay), easing: M.ease.out, fill: "backwards" });
      });
    });
    observer.observe(target);
  });

  /* Count: a figure ([data-count] holding its final number) counts up from 0
     once. Only the digits change, never the layout or the opacity: the figure
     sits on its own line in tabular digits. A number already on screen when
     the script runs is never reset. */
  doc.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count"));
    if (!(end > 0) || !below(el)) return;
    var final = el.textContent, curve = bezier(M.ease.out);
    el.textContent = "0";
    waiting.set(el, function (instant) {
      if (instant) { el.textContent = final; return; }
      var t0 = performance.now();
      (function tick(now) {
        var p = Math.min(1, Math.max(0, (now - t0) / M.dur.count));
        el.textContent = p < 1 ? Math.round(end * curve(p)).toLocaleString("en-US") : final;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
    observer.observe(el);
  });

  /* Fill: a group of bars ([data-fill], each scaleX(var(--f)) in CSS) grows
     from zero once, 60ms apart (the delays are in CSS). JS only switches the
     group between data-fill="pending" (zero) and "done" (the CSS lengths), so
     without JS, or with Reduce Motion, the bars simply have their length. */
  doc.querySelectorAll("[data-fill]").forEach(function (el) {
    if (!below(el)) return;
    el.setAttribute("data-fill", "pending");
    waiting.set(el, function () { el.setAttribute("data-fill", "done"); });
    observer.observe(el);
  });

  /* Pop: Free for everyone's streak circles and badge discs ([data-pop]) scale
     up from 0.6 and fade in once, each row's items [data-pop-step] ms apart. */
  doc.querySelectorAll("[data-pop]").forEach(function (el) {
    if (!below(el)) return;
    el.setAttribute("data-pop", "pending");
    waiting.set(el, function (instant) {
      el.setAttribute("data-pop", "done");
      if (instant) return;
      el.querySelectorAll("[data-pop-step]").forEach(function (row) {
        var step = parseFloat(row.getAttribute("data-pop-step")) || 0;
        row.querySelectorAll(":scope > .is-on").forEach(function (item, i) {
          item.animate([{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "none" }],
            { duration: M.dur.entrance, delay: i * step, easing: M.ease.out, fill: "backwards" });
        });
      });
    });
    observer.observe(el);
  });

  /* Draw: a line ([data-draw]) is uncovered left to right once, by a cover in
     the card's colour sliding off it. The cover exists only while it waits or
     moves, so without JS or with Reduce Motion there is none. */
  doc.querySelectorAll("[data-draw]").forEach(function (el) {
    if (!below(el)) return;
    var cover = doc.createElement("span");
    cover.className = "trend__cover";
    el.appendChild(cover);
    el.setAttribute("data-draw", "pending");
    waiting.set(el, function (instant) {
      el.setAttribute("data-draw", "done");
      if (instant) { cover.remove(); return; }
      cover.animate([{ transform: "none" }, { transform: "translateX(101%)" }],
        { duration: M.dur.emphasis, easing: M.ease.inOut, fill: "forwards" }).onfinish = function () { cover.remove(); };
    });
    observer.observe(el);
  });

  function sweep(all) {
    Array.from(waiting.keys()).forEach(function (el) { if (all || onScreen(el)) release(el, all); });
  }
  addEventListener("beforeprint", function () { sweep(true); });
  addEventListener("pageshow", function (e) { if (e.persisted) sweep(true); });
  addEventListener("load", function () { sweep(false); });
  var net = setInterval(function () { sweep(false); if (!waiting.size) clearInterval(net); }, 4000);
})();
