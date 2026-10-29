#!/usr/bin/env node
/* scroll-pass: the rebuild's verification harness (docs/redesign/SPEC.md §10).

   The last build passed full-page screenshots and failed in use: its defects
   showed only mid-scroll and after a resize. This scrolls a page the way a
   visitor does, 0.4 viewport at a time, waits 600 ms, then runs the frame
   probes and takes a viewport screenshot (never a full-page one) at every
   step. After the pass it records the page's numbers and checks them against
   scripts/scroll-pass.budgets.json. Probes (--probes) script the flows that
   broke before: the menu, focus, anchors, the theme, resize and rotate, no JS.

     NODE_PATH=$(npm root -g) node scripts/scroll-pass.js [options]

   --base URL         site under test (default http://localhost:8123). If nothing
                      answers on a localhost base, the harness serves --root
                      itself with python3 -m http.server and stops it after.
   --root DIR         what to serve then (default: this repo)
   --live             the deployed site: base https://preflopapp.com unless --base
                      says otherwise; the zone's two injected scripts are listed
                      apart instead of failing
   --pages /,/faq/    pages to pass (default /)
   --plan phase|full  the run set when no --viewports/--schemes/--modes is given:
                      phase = SPEC §10.3 (13 viewports dark; light at 390, 820,
                      1440; reduced and nojs at 390 and 1440; iphone at 390),
                      full = 13 viewports x dark,light x default,reduced,nojs,iphone
   --viewports WxH,…  (default: the 13 standard viewports)
   --schemes dark,light  (default dark)
   --modes default,reduced,nojs,blockedjs,iphone  (default default)
   --probes all|name,…  menu keyfocus anchors theme nojs resize rotate fastjump
                      axe live demo explorer (default: none)
   --no-passes        run the probes only
   --phase N          which budgets are due (default: "phase" in the budgets file)
   --jobs N           passes run side by side (default 3); throttled iphone runs
                      always run alone, after the others
   --axe PATH         axe.min.js (default: axe-core on NODE_PATH, else
                      $TMPDIR/scroll-pass-axe/node_modules/axe-core/axe.min.js;
                      install it there, never in the repo)
   --out DIR          output (default $TMPDIR/scroll-pass/<stamp>); refused inside the repo
   --label TEXT       a title for the report
   --budgets FILE     (default scripts/scroll-pass.budgets.json)

   Writes report.md, report.json, frames/<run>/*.png and contact/<run>.png (a
   grid of every frame of a run, failing frames outlined). Prints one line per
   run and per probe, and exits non-zero on any FAIL. Chromium only: WebKit
   and iOS Safari can't run here (SPEC §10.4). */
"use strict";
const fs = require("fs"), path = require("path"), os = require("os"), zlib = require("zlib"),
  crypto = require("crypto"), net = require("net"), { spawn, execFileSync } = require("child_process");
const { chromium, devices } = require("playwright");

const REPO = path.resolve(__dirname, "..");
const STANDARD = ["320x568", "360x740", "390x844", "430x932", "600x960", "768x1024", "820x1180",
  "1024x768", "1280x720", "1440x900", "1920x1080", "2560x1440", "844x390"];
const PROBE_NAMES = ["menu", "keyfocus", "anchors", "theme", "nojs", "resize", "rotate", "fastjump",
  "axe", "live", "demo", "explorer"];
const SETTLE = 600;           // ms after each scroll step (SPEC §4.7 rule 6)
const STEP = 0.4;             // of the viewport height
const MAX_STEPS = 160;
const PROBE_TIMEOUT = 300000; // a probe that hangs is a FAIL, not a stuck run
const LIVE = "https://preflopapp.com";
// The zone injects these into every live page (ISSUES LIVE-01); the page CSP
// blocks both. Only the owner can switch them off, so --live lists them apart.
const ZONE = /cloudflareinsights|Executing inline script violates|\/cdn-cgi\//;

/* ---- options -------------------------------------------------------------- */

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i];
    if (!a.startsWith("--")) throw new Error(`unexpected argument ${a}`);
    a = a.slice(2);
    let v = true;
    const eq = a.indexOf("=");
    if (eq >= 0) { v = a.slice(eq + 1); a = a.slice(0, eq); }
    else if (!["live", "no-passes"].includes(a)) v = argv[++i];
    if (v === undefined) throw new Error(`--${a} needs a value`);
    o[a.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = v;
  }
  return o;
}

function size(s) {
  const m = /^(\d+)x(\d+)$/.exec(s.trim());
  if (!m) throw new Error(`bad viewport ${s}`);
  return { w: +m[1], h: +m[2] };
}

function plan(o) {
  const pages = (o.pages || "/").split(",").map((p) => p.trim()).filter(Boolean);
  const runs = [];
  const add = (page, vp, scheme, mode) => runs.push({ page, vp: size(vp), scheme, mode });
  for (const page of pages) {
    if (o.viewports || o.schemes || o.modes) {
      const vps = o.viewports ? o.viewports.split(",") : STANDARD;
      for (const vp of vps) for (const scheme of (o.schemes || "dark").split(","))
        for (const mode of (o.modes || "default").split(",")) add(page, vp, scheme.trim(), mode.trim());
    } else if ((o.plan || "phase") === "full") {
      for (const vp of STANDARD) for (const scheme of ["dark", "light"])
        for (const mode of ["default", "reduced", "nojs", "iphone"]) add(page, vp, scheme, mode);
    } else {
      for (const vp of STANDARD) add(page, vp, "dark", "default");
      for (const vp of ["390x844", "820x1180", "1440x900"]) add(page, vp, "light", "default");
      for (const mode of ["reduced", "nojs"]) for (const vp of ["390x844", "1440x900"]) add(page, vp, "dark", mode);
      add(page, "390x844", "dark", "iphone");
    }
  }
  for (const r of runs) {
    if (!["dark", "light"].includes(r.scheme)) throw new Error(`bad scheme ${r.scheme}`);
    if (!["default", "reduced", "nojs", "blockedjs", "iphone"].includes(r.mode)) throw new Error(`bad mode ${r.mode}`);
    r.key = `${r.vp.w}x${r.vp.h}`;
    r.id = `${slug(r.page)}-${r.key}-${r.scheme}-${r.mode}`;
  }
  return runs;
}

function slug(page) {
  const s = page.replace(/^\/+|\/+$/g, "").replace(/[^\w]+/g, "-");
  return s || "home";
}

function stamp() { return new Date().toISOString().replace(/[:.]/g, "-").replace(/-\d\dZ$/, "Z"); }

/* ---- browser contexts ----------------------------------------------------- */

function contextOptions(vp, scheme, mode) {
  const opts = {
    viewport: { width: vp.w, height: vp.h }, colorScheme: scheme,
    reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
    javaScriptEnabled: mode !== "nojs", deviceScaleFactor: 1,
  };
  if (mode === "iphone" || mode === "touch") {
    const d = devices["iPhone 13"];
    Object.assign(opts, { userAgent: d.userAgent, deviceScaleFactor: mode === "iphone" ? 3 : 1, isMobile: true, hasTouch: true });
  }
  return opts;
}

/* Injected before any page script: layout shifts (without recent input), LCP
   and long tasks, as the audit measured them (METRICS "Method"). */
function observe() {
  var s = window.__sp = { shifts: [], lcp: [], tasks: [], scrollStart: null };
  function name(n) {
    if (!n || n.nodeType !== 1) return n ? n.nodeName : null;
    if (n.id) return n.tagName.toLowerCase() + "#" + n.id;
    return n.tagName.toLowerCase() + (n.classList && n.classList.length ? "." + Array.prototype.join.call(n.classList, ".") : "");
  }
  try {
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) {
        if (!e.hadRecentInput) s.shifts.push({ t: e.startTime, v: e.value, nodes: (e.sources || []).map(function (x) { return name(x.node); }) });
      });
    }).observe({ type: "layout-shift", buffered: true });
  } catch (e) { /* not supported */ }
  try {
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) { s.lcp.push({ t: e.startTime, size: e.size, el: name(e.element) }); });
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) { /* not supported */ }
  try {
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) { s.tasks.push({ t: e.startTime, d: e.duration }); });
    }).observe({ type: "longtask", buffered: true });
  } catch (e) { /* not supported */ }
}

/* ---- in-page probes ------------------------------------------------------- */

/* Runs in the page at every step. Returns the issues SPEC §10.1 step 5 names. */
function frameProbe(cfg) {
  var vw = innerWidth, vh = innerHeight, root = document.documentElement, issues = [];
  var styles = new Map(), rects = new Map();
  function st(el) { var s = styles.get(el); if (!s) { s = getComputedStyle(el); styles.set(el, s); } return s; }
  function R(el) { var r = rects.get(el); if (!r) { r = el.getBoundingClientRect(); rects.set(el, r); } return r; }
  function name(el) {
    var cls = el.classList && el.classList.length ? "." + Array.prototype.slice.call(el.classList, 0, 2).join(".") : "";
    return el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + cls;
  }
  function desc(el) {
    var parts = [];
    for (var n = el, i = 0; n && n.nodeType === 1 && n !== document.body && i < 3; n = n.parentElement, i++) parts.unshift(name(n));
    return parts.join(" > ");
  }
  function opac(el) { var o = 1; for (var n = el; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(st(n).opacity); return o; }
  /* Rendered: not display none, not visibility hidden, and not inside a
     closed <details> (whose content keeps stale layout boxes in Chromium). */
  function shown(el) {
    if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true })) return false;
    return st(el).visibility === "visible" && el.getClientRects().length > 0;
  }
  function inView(r) { return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw; }
  function outermost(els) {
    var set = new Set(els);
    return els.filter(function (el) { for (var a = el.parentElement; a; a = a.parentElement) if (set.has(a)) return false; return true; });
  }
  function list(items) { return items.slice(0, 5).join("; ") + (items.length > 5 ? " (+" + (items.length - 5) + " more)" : ""); }
  function add(kind, level, items) { if (items.length) issues.push({ kind: kind, level: level, n: items.length, detail: list(items) }); }
  var all = Array.prototype.slice.call(document.body.getElementsByTagName("*"));

  /* overflow: anything wider than the viewport, unless an ancestor (other than
     body/html) clips it inside the viewport, or it is in a [data-scroller]. */
  var wide = [];
  if (root.scrollWidth > vw + 1) wide.push("document scrollWidth " + root.scrollWidth + " > " + vw);
  wide = wide.concat(outermost(all.filter(function (el) {
    var r = R(el);
    if (!(r.width > 0 && r.height > 0) || r.right <= vw + 1 || el.closest("[data-scroller]") || !shown(el)) return false;
    for (var a = el.parentElement; a && a !== document.body; a = a.parentElement)
      if (st(a).overflowX !== "visible" && R(a).right <= vw + 1) return false;
    return true;
  })).map(function (el) { return desc(el) + " right=" + Math.round(R(el).right); }));
  add("overflow", "fail", wide);

  /* position: sticky or fixed anywhere but the allowed elements (SPEC §4.1). */
  add("position", "fail", all.filter(function (el) {
    var p = st(el).position;
    return (p === "sticky" || p === "fixed") && el.getClientRects().length > 0 && !el.matches(cfg.positionAllowed);
  }).map(function (el) { return desc(el) + " (" + st(el).position + ")"; }));

  /* double exposure: two visible images overlapping by more than half of the smaller. */
  var imgs = all.filter(function (el) { return el.tagName === "IMG" && shown(el) && opac(el) > 0.05; })
    .filter(function (el) { var r = R(el); return r.width >= 32 && r.height >= 32 && inView(r); });
  var doubles = [];
  for (var i = 0; i < imgs.length; i++) for (var j = i + 1; j < imgs.length; j++) {
    var a = R(imgs[i]), b = R(imgs[j]);
    var ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ix > 0 && iy > 0 && ix * iy > 0.5 * Math.min(a.width * a.height, b.width * b.height))
      doubles.push(desc(imgs[i]) + " [" + opac(imgs[i]).toFixed(2) + "] x " + desc(imgs[j]) + " [" + opac(imgs[j]).toFixed(2) + "]");
  }
  add("double-exposure", "fail", doubles);

  /* half-faded: on screen at an opacity strictly between 0.05 and 0.9. */
  add("half-faded", "fail", outermost(all.filter(function (el) {
    if (parseFloat(st(el).opacity) >= 1 || el.matches(":disabled") || el.closest("[data-dim]")) return false;
    if (!shown(el) || !inView(R(el))) return false;
    var o = opac(el);
    return o > 0.05 && o < 0.9;
  })).map(function (el) { return desc(el) + " @" + opac(el).toFixed(2); }));

  /* pending: an entrance that should have run. The old design's [data-reveal]
     hidden while in view counts too, so the baseline shows it. */
  add("pending", "fail", all.filter(function (el) {
    if (!inView(R(el))) return false;
    if (el.getAttribute("data-enter") === "pending") return true;
    return el.hasAttribute("data-reveal") && shown(el) && opac(el) <= 0.05;
  }).map(desc));

  /* running: finite animations still going 600 ms after the step. */
  var anims = document.getAnimations ? document.getAnimations() : [];
  function label(an) {
    var t = an.effect && an.effect.target;
    return (an.animationName || an.transitionProperty || an.id || "animation") + " on " + (t && t.nodeType === 1 ? desc(t) : "?");
  }
  var infinite = anims.filter(function (an) { return an.playState === "running" && an.effect && an.effect.getComputedTiming().iterations === Infinity; });
  add("running", "warn", anims.filter(function (an) { return an.playState === "running" && infinite.indexOf(an) < 0; }).map(label));

  /* text overlap: text of two components drawn over each other, outside
     [data-overlay]. The sticky nav is left out, and so is text scrolled
     under it: an opaque bar covers that text, it doesn't overlap it. */
  var TEXT = /^(H1|H2|H3|P|LI|FIGCAPTION|BUTTON|A)$/, items = [];
  var bar = document.querySelector(cfg.navSelector || ".nav"), barBottom = bar ? bar.getBoundingClientRect().bottom : 0;
  all.forEach(function (el) {
    if (!TEXT.test(el.tagName) || el.closest("[data-overlay], .sr-only") || (bar && bar.contains(el)) || !shown(el) || !inView(R(el)) || opac(el) <= 0.05) return;
    var rs = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), t;
    while ((t = walk.nextNode())) {
      var p = t.parentElement;
      if (!t.nodeValue.trim() || !p || p.closest(".sr-only") || !shown(p) || opac(p) <= 0.05) continue;
      var range = document.createRange(); range.selectNodeContents(t);
      /* A text rect is the font's whole content area, taller than the glyphs:
         a heading's touches the eyebrow above it without any ink meeting.
         Trimmed by 15% top and bottom, only drawn text over drawn text counts. */
      Array.prototype.forEach.call(range.getClientRects(), function (q) {
        if (!(q.width > 1 && q.height > 1 && inView(q) && q.bottom > barBottom + 2)) return;
        var trim = q.height * 0.15;
        rs.push({ left: q.left, right: q.right, top: q.top + trim, bottom: q.bottom - trim });
      });
    }
    if (rs.length) items.push([el, rs]);
  });
  var overlaps = [];
  for (i = 0; i < items.length; i++) for (j = i + 1; j < items.length; j++) {
    var A = items[i], B = items[j];
    if (A[0].contains(B[0]) || B[0].contains(A[0])) continue;
    var hit = A[1].some(function (p) {
      return B[1].some(function (q) { return Math.min(p.right, q.right) - Math.max(p.left, q.left) > 2 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 2; });
    });
    if (hit) overlaps.push(desc(A[0]) + " x " + desc(B[0]));
  }
  add("text-overlap", "warn", overlaps);

  return { y: Math.round(scrollY), height: root.scrollHeight, vh: vh, issues: issues, infinite: infinite.length, infiniteNames: infinite.slice(0, 8).map(label) };
}

/* Runs once after the pass: heights, sections, layers, the observers' data. */
function pageStats(sections) {
  var root = document.documentElement;
  function name(el) {
    if (el.id) return "#" + el.id;
    var lab = el.getAttribute("aria-label");
    if (lab) return "[" + lab + "]";
    var by = el.getAttribute("aria-labelledby"), h = by && document.getElementById(by);
    if (h) return "“" + h.textContent.trim().slice(0, 32) + "”";
    return el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : "");
  }
  var tops = Array.prototype.filter.call(document.querySelectorAll("main section, body > footer"), function (el) {
    return !(el.parentElement && el.parentElement.closest("main section"));
  }).map(function (el) {
    var r = el.getBoundingClientRect();
    return { name: name(el), top: Math.round(r.top + scrollY), height: Math.round(r.height) };
  });
  var heights = (sections || []).map(function (s) {
    var els = s.select.map(function (q) { return document.querySelector(q); });
    return { name: s.name, px: els.some(function (e) { return !e; }) ? null : Math.round(els.reduce(function (sum, e) { return sum + e.getBoundingClientRect().height; }, 0)) };
  });
  var blur = [];
  Array.prototype.forEach.call(document.getElementsByTagName("*"), function (el) {
    var s = getComputedStyle(el), f = s.filter, b = s.getPropertyValue("backdrop-filter") || s.getPropertyValue("-webkit-backdrop-filter");
    if ((f && f !== "none") || (b && b !== "none")) blur.push(el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : "") + " (" + (f !== "none" ? f : b) + ")");
  });
  var anims = document.getAnimations ? document.getAnimations() : [];
  return {
    height: root.scrollHeight, vh: innerHeight, tops: tops, heights: heights,
    elements: document.getElementsByTagName("*").length, blur: blur,
    media: document.querySelectorAll("video, canvas").length,
    infinite: anims.filter(function (an) { return an.playState === "running" && an.effect && an.effect.getComputedTiming().iterations === Infinity; }).length,
    sp: window.__sp || null,
  };
}

/* Text boxes in main: which are present and which can be seen, by tag and
   text, plus any drawn at a faded opacity. Works with JS off (no timers). */
function textBoxes() {
  function opac(el) { var o = 1; for (var n = el; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity); return o; }
  var present = [], visible = [], faded = [];
  document.querySelectorAll("main h1, main h2, main h3, main p, main li, main figcaption").forEach(function (el) {
    var text = el.textContent.trim().replace(/\s+/g, " ");
    if (!text || el.closest("[hidden], noscript, .sr-only")) return;
    var key = el.tagName.toLowerCase() + "|" + text.slice(0, 60), r = el.getBoundingClientRect(), s = getComputedStyle(el);
    present.push(key);
    if (!(r.width > 0 && r.height > 0) || s.visibility !== "visible") return;
    if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true })) return;
    var o = opac(el);
    if (o < 0.9) { faded.push(el.tagName.toLowerCase() + " “" + text.slice(0, 30) + "” @" + o.toFixed(2)); return; }
    visible.push(key);
  });
  var empty = Array.prototype.filter.call(document.querySelectorAll("main section"), function (el) { return !el.getBoundingClientRect().height; }).length;
  return { present: present, visible: visible, faded: faded, emptySections: empty };
}

/* ---- scrolling ------------------------------------------------------------ */

/* A finger drag up by dy: real touch events, held still before lifting so
   nothing flings. (Input.synthesizeScrollGesture with gestureSourceType
   "touch" scrolled nothing in this Chromium, with or without throttling.)
   The first ~15 px are touch slop, so a step scrolls a little less than dy. */
async function swipe(cdp, page, x, y, dy) {
  const n = 12;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let i = 1; i <= n + 2; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: Math.round(y - dy * Math.min(i, n) / n) }] });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

async function scrollStep(page, cdp, touch, dy, vp) {
  if (touch) await swipe(cdp, page, Math.round(vp.w / 2), Math.round(vp.h * 0.8), Math.round(dy));
  else await page.mouse.wheel(0, Math.round(dy));
}

async function wait(page, ms) { await page.waitForTimeout(ms); }

/* ---- network and console bookkeeping ------------------------------------- */

function watch(page, o, mode) {
  const w = { requests: 0, beforeLoad: 0, loaded: false, bytes: {}, fonts: new Set(), suits: {}, urls: new Map(), failed: [], console: [], pending: [] };
  page.on("load", () => { w.loaded = true; });
  page.on("request", (req) => {
    w.requests++;
    if (!w.loaded) w.beforeLoad++;
    const u = req.url(), bare = u.split("#")[0].split("?")[0];
    if (!w.urls.has(bare)) w.urls.set(bare, new Set());
    w.urls.get(bare).add(u.split("#")[0]);
  });
  page.on("requestfinished", (req) => {
    w.pending.push((async () => {
      const s = await req.sizes().catch(() => null);
      const type = req.resourceType(), bytes = s ? s.responseBodySize : 0;
      w.bytes[type] = (w.bytes[type] || 0) + bytes;
      const u = req.url().split("?")[0];
      if (type === "font") w.fonts.add(u);
      if (/\/assets\/suits\/[^/]+\.svg$/.test(u)) w.suits[u.replace(/^.*\/assets\//, "assets/")] = bytes;
    })());
  });
  page.on("requestfailed", (req) => w.failed.push({ url: req.url(), why: (req.failure() || {}).errorText || "failed" }));
  page.on("response", (res) => { if (res.status() >= 400) w.failed.push({ url: res.url(), why: `HTTP ${res.status()}` }); });
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") w.console.push({ type: m.type(), text: m.text(), url: (m.location() || {}).url || "" });
  });
  page.on("pageerror", (e) => w.console.push({ type: "pageerror", text: String(e.message || e), url: "" }));
  w.classify = () => {
    const bucket = (x) => {
      const t = `${x.text} ${x.url}`;
      if (o.live && ZONE.test(t)) return "zone";
      if (mode === "blockedjs" && /\/next\/js\//.test(t)) return "blocked";
      return "own";
    };
    return {
      console: w.console.map((x) => ({ ...x, bucket: bucket(x) })),
      failed: w.failed.map((x) => ({ ...x, bucket: bucket({ text: x.why, url: x.url }) })),
    };
  };
  return w;
}

/* ---- one pass ------------------------------------------------------------- */

async function pass(browser, run, o, B, out) {
  const touch = run.mode === "iphone";
  const ctx = await browser.newContext(contextOptions(run.vp, run.scheme, run.mode));
  if (run.mode === "blockedjs") await ctx.route("**/next/js/**", (r) => r.abort());
  await ctx.addInitScript(observe);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  if (run.mode === "iphone") {
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  }
  const w = watch(page, o, run.mode);
  const dir = path.join(out, "frames", run.id);
  fs.mkdirSync(dir, { recursive: true });
  const frames = [];
  const t0 = Date.now();
  let error = null;
  try {
    await page.goto(o.base + run.page, { waitUntil: "load", timeout: 90000 });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await wait(page, 500);
    if (!touch) await page.mouse.move(Math.round(run.vp.w / 2), Math.round(run.vp.h / 2));
    if (run.mode !== "nojs") await page.evaluate(() => { if (window.__sp) window.__sp.scrollStart = performance.now(); });
    let still = 0;
    for (let step = 0; step <= MAX_STEPS; step++) {
      if (step > 0) {
        const before = frames[frames.length - 1].y;
        await scrollStep(page, cdp, touch, STEP * run.vp.h, run.vp);
        await wait(page, SETTLE);
        const y = await page.evaluate(() => Math.round(scrollY));
        if (y === before) {
          const atEnd = await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2);
          if (atEnd || ++still >= 3) {
            if (!atEnd) frames[frames.length - 1].issues.push({ kind: "stuck", level: "fail", n: 1, detail: `scroll stopped at ${y} before the end` });
            break;
          }
          continue;
        }
        still = 0;
      }
      const f = await page.evaluate(frameProbe, { positionAllowed: B.positionAllowed });
      f.step = step;
      f.file = `${run.id}-${String(step).padStart(3, "0")}-y${f.y}.png`;
      await page.screenshot({ path: path.join(dir, f.file), scale: "css" });
      frames.push(f);
    }
    var stats = await page.evaluate(pageStats, (B.sectionHeights || {}).sections || []);
  } catch (e) {
    error = String(e && e.message || e).split("\n")[0];
  }
  await Promise.all(w.pending);
  const seen = w.classify();
  await ctx.close();
  const res = { ...run, ms: Date.now() - t0, frames, stats: stats || null, error, net: {
    requests: w.requests, beforeLoad: w.beforeLoad, bytes: w.bytes, fonts: [...w.fonts], suits: w.suits,
    /* One file under two URLs downloads twice (a stamped and an unstamped
       reference, or a preload whose ?v= differs from its @font-face). */
    twice: [...w.urls].filter(([, set]) => set.size > 1).map(([bare]) => bare.replace(/^https?:\/\/[^/]+/, "")),
  }, console: seen.console, failed: seen.failed };
  res.metrics = metrics(res);
  return res;
}

function metrics(res) {
  const sp = res.stats && res.stats.sp;
  if (!sp || res.mode === "nojs") return null; // no observer callback runs with JS off
  const start = sp.scrollStart == null ? Infinity : sp.scrollStart;
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  const lcps = sp.lcp.filter((e) => e.t < start);
  const lcp = lcps[lcps.length - 1] || sp.lcp[sp.lcp.length - 1] || null;
  const loadTasks = sp.tasks.filter((t) => t.t < start);
  return {
    clsLoad: sum(sp.shifts.filter((s) => s.t < start).map((s) => s.v)),
    clsScroll: sum(sp.shifts.filter((s) => s.t >= start).map((s) => s.v)),
    shiftNodes: [...new Set(sp.shifts.flatMap((s) => s.nodes || []))].slice(0, 8),
    lcpEl: lcp && lcp.el, lcpMs: lcp && Math.round(lcp.t),
    tbt: Math.round(sum(loadTasks.map((t) => Math.max(0, t.d - 50)))),
    longest: Math.round(Math.max(0, ...sp.tasks.map((t) => t.d))),
  };
}

/* ---- budgets -------------------------------------------------------------- */

function due(from, phase) { return from == null || from <= phase; }

function budgets(res, B, phase, o) {
  const out = [];
  const add = (id, value, limit, from, okFn, level = "fail") => {
    if (value == null) return;
    const ok = okFn(value, limit);
    out.push({ id, value, limit, from, status: ok ? "pass" : due(from, phase) ? level : "due" });
  };
  const le = (v, l) => v <= l;
  const s = res.stats, m = res.metrics, key = res.key;
  if (!s) return out;
  const screens = +(s.height / s.vh).toFixed(2);
  if (B.length && res.page === B.length.page && B.length.screens[key]) {
    const L = B.length.screens[key];
    add("length (screens), ceiling", screens, L.ceiling, B.length.from, le);
    add("length (screens), target", screens, L.target, B.length.from, le, "warn");
  }
  if (B.sectionTops && res.page === B.sectionTops.page && B.sectionTops.screens[key]) {
    for (const [sel, lim] of Object.entries(B.sectionTops.screens[key])) {
      const t = s.tops.find((x) => x.name === sel);
      if (t) add(`${sel} top (screens)`, +(t.top / s.vh).toFixed(2), lim, B.sectionTops.from[sel], le);
    }
  }
  if (B.sectionHeights && res.page === B.sectionHeights.page) {
    for (const sec of B.sectionHeights.sections) {
      const h = s.heights.find((x) => x.name === sec.name);
      if (h && h.px != null && sec.px[key] != null) add(`${sec.name} height (px)`, h.px, sec.px[key], sec.from, le);
    }
  }
  if (m && B.lcp && res.page === B.lcp.page) {
    out.push({ id: "LCP element", value: m.lcpEl, limit: B.lcp.element, from: B.lcp.from,
      status: m.lcpEl === B.lcp.element ? "pass" : due(B.lcp.from, phase) ? "fail" : "due" });
    if (!o.live && res.mode !== "nojs") {
      const lim = res.mode === "iphone" ? B.lcp.iphoneMs : B.lcp.desktopMs;
      add("LCP (ms)", m.lcpMs, lim, B.lcp.from, le);
    }
  }
  if (m && B.cls) {
    add("CLS load", +m.clsLoad.toFixed(4), B.cls.load, B.cls.from, le);
    add("CLS scroll", +m.clsScroll.toFixed(4), B.cls.scroll, B.cls.from, le);
  }
  if (m && B.tbt && res.mode === "iphone") add("TBT, throttled (ms)", m.tbt, B.tbt.iphoneMs, B.tbt.from, le);
  if (B.images && res.page === B.images.page && B.images.bytes[key] && res.mode !== "iphone")
    add("image bytes over the pass", res.net.bytes.image || 0, B.images.bytes[key], B.images.from, le);
  if (B.fonts && res.mode !== "nojs") add("font files", res.net.fonts.length, B.fonts.files, B.fonts.from, le);
  const fontTwice = res.net.twice.filter((u) => /\.(woff2?|ttf|otf)$/.test(u));
  add("fonts fetched under two URLs", fontTwice.length, 0, 0, le);
  if (B.requestsBeforeLoad && key === B.requestsBeforeLoad.viewport && res.mode === "default")
    add("requests before load", res.net.beforeLoad, B.requestsBeforeLoad.max, B.requestsBeforeLoad.from, le);
  if (B.infiniteAnimations) {
    const most = Math.max(s.infinite, ...res.frames.map((f) => f.infinite || 0));
    add("infinite animations", most, B.infiniteAnimations.max, B.infiniteAnimations.from, le);
  }
  if (B.blurLayers) add("blur layers", s.blur.length, B.blurLayers.max, B.blurLayers.from, le);
  if (B.media) add("video/canvas", s.media, B.media.max, B.media.from, le);
  if (B.suitSvgBytes) for (const [u, b] of Object.entries(res.net.suits)) add(`${u} bytes`, b, B.suitSvgBytes.max, B.suitSvgBytes.from, le);
  return out;
}

async function staticChecks(api, o, B, phase, pages) {
  const out = [];
  for (const page of pages) {
    if (!B.html || page !== B.html.page) continue;
    const res = await api.get(o.base + page);
    const body = await res.body();
    const gz = zlib.gzipSync(body, { level: 9 }).length;
    const text = body.toString("utf8").replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "<$1>");
    const elements = (text.match(/<[a-zA-Z][\w-]*/g) || []).length;
    const st = (v, l) => (v <= l ? "pass" : due(B.html.from, phase) ? "fail" : "due");
    out.push({ page, id: "HTML raw bytes", value: body.length, limit: B.html.rawBytes, from: B.html.from, status: st(body.length, B.html.rawBytes) });
    out.push({ page, id: "HTML gzip bytes", value: gz, limit: B.html.gzipBytes, from: B.html.from, status: st(gz, B.html.gzipBytes) });
    out.push({ page, id: "elements before JS", value: elements, limit: B.html.elementsBeforeJs, from: B.html.from, status: st(elements, B.html.elementsBeforeJs) });
  }
  return out;
}

/* ---- verdicts and lines --------------------------------------------------- */

function verdict(res) {
  const fails = {}, warns = {};
  for (const f of res.frames) for (const i of f.issues) {
    const bag = i.level === "fail" ? fails : warns;
    bag[i.kind] = (bag[i.kind] || 0) + 1;
  }
  const own = res.console.filter((c) => c.bucket === "own");
  const ownFailed = res.failed.filter((c) => c.bucket === "own");
  if (own.length) fails.console = own.length;
  if (ownFailed.length) fails["failed requests"] = ownFailed.length;
  if (res.error) fails.error = 1;
  if (res.net.twice.length) warns["fetched under two URLs"] = res.net.twice.length;
  const b = res.budgets || [];
  for (const x of b) {
    if (x.status === "fail") fails[`budget: ${x.id}`] = 1;
    if (x.status === "warn") warns[`budget: ${x.id}`] = 1;
  }
  res.fails = fails; res.warns = warns;
  res.result = Object.keys(fails).length ? "FAIL" : Object.keys(warns).length ? "WARN" : "PASS";
  return res.result;
}

function fmtKinds(bag) { return Object.entries(bag).map(([k, n]) => (n > 1 ? `${k} ×${n}` : k)).join(", "); }

function line(res) {
  const m = res.metrics, s = res.stats;
  const bits = [`${res.result.padEnd(4)} ${slug(res.page)} ${res.key} ${res.scheme} ${res.mode}`];
  if (s) bits.push(`${(s.height / s.vh).toFixed(1)} screens (${s.height} px)`);
  if (m) bits.push(`CLS ${m.clsLoad.toFixed(4)}/${m.clsScroll.toFixed(4)}`, `LCP ${m.lcpEl || "?"} ${m.lcpMs == null ? "?" : (m.lcpMs / 1000).toFixed(2) + " s"}`, `TBT ${m.tbt} ms`);
  bits.push(`${res.frames.length} frames`);
  if (Object.keys(res.fails).length) bits.push(`fail: ${fmtKinds(res.fails)}`);
  if (Object.keys(res.warns).length) bits.push(`warn: ${fmtKinds(res.warns)}`);
  const pend = (res.budgets || []).filter((x) => x.status === "due");
  if (pend.length) bits.push(`due later: ${pend.map((x) => `${x.id} ${x.value}>${x.limit} (P${x.from})`).join(", ")}`);
  if (res.error) bits.push(`error: ${res.error}`);
  return bits.join(" · ");
}

/* ---- contact sheets ------------------------------------------------------- */

async function contactSheet(browser, res, out) {
  if (!res.frames.length) return null;
  const thumb = res.vp.w < 600 ? 120 : res.vp.w < 1100 ? 180 : 240;
  const cols = Math.max(1, Math.floor(1600 / (thumb + 12)));
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const cells = res.frames.map((f) => {
    const kinds = f.issues.filter((i) => i.level === "fail").map((i) => i.kind);
    const warn = f.issues.filter((i) => i.level === "warn").map((i) => i.kind);
    const cls = kinds.length ? "fail" : warn.length ? "warn" : "";
    return `<figure class="${cls}"><img src="../frames/${esc(res.id)}/${esc(f.file)}"><figcaption>#${f.step} y=${f.y}${kinds.length ? " · " + esc([...new Set(kinds)].join(", ")) : ""}</figcaption></figure>`;
  }).join("");
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:12px;background:#fff;color:#111;font:12px/1.3 system-ui,sans-serif}
    h1{font-size:14px;margin:0 0 8px} .g{display:grid;grid-template-columns:repeat(${cols},${thumb}px);gap:12px}
    figure{margin:0;border:3px solid transparent} figure.fail{border-color:#d00} figure.warn{border-color:#e90}
    img{display:block;width:${thumb}px;height:auto;outline:1px solid #ccc} figcaption{padding-top:2px}
  </style><h1>${esc(res.id)} · ${esc(res.result)} · ${esc(line(res).split(" · ").slice(1, 3).join(" · "))}</h1><div class="g">${cells}</div>`;
  const dir = path.join(out, "contact");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${res.id}.html`);
  fs.writeFileSync(file, html);
  const ctx = await browser.newContext({ viewport: { width: cols * (thumb + 12) + 24, height: 600 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto("file://" + file, { waitUntil: "load" });
  const png = path.join(dir, `${res.id}.png`);
  await page.screenshot({ path: png, fullPage: true });
  await ctx.close();
  return png;
}

/* ---- probes --------------------------------------------------------------- */

/* A probe gets a helper bag and returns { checks: [{what, ok, detail, from}] }.
   A failed check that is not due yet (its phase is later) shows as "due". */
function probeKit(browser, o, B, out, name) {
  const dir = path.join(out, "probes");
  fs.mkdirSync(dir, { recursive: true });
  const kit = {
    checks: [], shots: [], notes: [], from: B.probes ? B.probes[name] : 0,
    check(what, ok, detail, from) { kit.checks.push({ what, ok: !!ok, detail: detail == null ? "" : String(detail), from: from == null ? kit.from : from }); },
    note(t) { kit.notes.push(t); },
    async shot(page, label) {
      const f = path.join(dir, `${name}-${label}.png`.replace(/[^\w.-]+/g, "-"));
      await page.screenshot({ path: f, scale: "css" });
      kit.shots.push(path.relative(out, f));
    },
    async open(vp, scheme, mode, extra) {
      const ctx = await browser.newContext({ ...contextOptions(vp, scheme || "dark", mode || "default"), ...(extra || {}) });
      const page = await ctx.newPage();
      const w = watch(page, o, mode || "default");
      return { ctx, page, w };
    },
    async load(page, p) {
      await page.goto(o.base + (p || "/"), { waitUntil: "load", timeout: 90000 });
      await page.evaluate(() => document.fonts.ready.then(() => true));
      await page.waitForTimeout(500);
    },
    y: (page) => page.evaluate(() => Math.round(scrollY)),
  };
  return kit;
}

const inPage = {
  navBottom: () => { const n = document.querySelector(".nav"); return n ? n.getBoundingClientRect().bottom : 0; },
  h2Top: (hash) => {
    const t = document.getElementById(hash.replace(/^#/, ""));
    if (!t) return null;
    const h = t.querySelector("h2") || t;
    const n = document.querySelector(".nav");
    return { top: Math.round(h.getBoundingClientRect().top), nav: n ? Math.round(n.getBoundingClientRect().bottom) : 0, vh: innerHeight };
  },
  holder: () => {
    const n = document.querySelector(".nav"), y = (n ? n.getBoundingClientRect().bottom : 0) + 1;
    const secs = Array.prototype.filter.call(document.querySelectorAll("main section, body > footer"), (el) => !(el.parentElement && el.parentElement.closest("main section")));
    const hit = secs.find((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    if (!hit) return null;
    secs.forEach((el, i) => el.setAttribute("data-sp-section", String(i)));
    return { index: hit.getAttribute("data-sp-section"), name: hit.id ? "#" + hit.id : hit.className.split(" ").slice(0, 2).join(".") };
  },
  stillThere: (index) => {
    const el = document.querySelector(`[data-sp-section="${index}"]`);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight;
  },
};

const PROBES = {
  /* NAV-01 on a phone: opening and closing the menu must not move the page. */
  async menu(k) {
    const vp = { w: 390, h: 844 };
    const { ctx, page } = await k.open(vp, "dark", "touch");
    await k.load(page, "/");
    for (const how of ["button", "escape", "scrim"]) {
      await page.evaluate(() => window.scrollTo(0, 3000));
      await page.waitForTimeout(SETTLE);
      const y0 = await k.y(page);
      await page.tap(".nav__toggle");
      await page.waitForTimeout(450);
      const yOpen = await k.y(page);
      const lock = await page.evaluate(() => {
        const nav = document.querySelector(".nav"), sc = document.querySelector(".nav__scrim"), r = sc ? sc.getBoundingClientRect() : null;
        /* Whatever a finger lands on must refuse to pan: the bar and the scrim. */
        const pans = [0.04, 0.5, 0.95].map((f) => document.elementFromPoint(innerWidth / 2, innerHeight * f))
          .filter((el) => { for (let n = el; n; n = n.parentElement) { if (getComputedStyle(n).touchAction === "none") return false; if (n === nav) break; } return true; })
          .map((el) => el ? el.tagName.toLowerCase() + "." + el.className : "nothing");
        return {
          open: nav.hasAttribute("data-open"), navTop: Math.round(nav.getBoundingClientRect().top),
          html: getComputedStyle(document.documentElement).overflowY, pans,
          scrimBottom: r ? Math.round(r.bottom) : null, vh: innerHeight,
        };
      });
      if (how === "button") await k.shot(page, "open-390");
      k.check(`menu opens (${how} run)`, lock.open, "");
      k.check(`opening moves the page ≤ 2 px (${how} run)`, Math.abs(yOpen - y0) <= 2, `${y0} → ${yOpen}`);
      k.check(`the open nav stays on screen (${how} run)`, lock.navTop === 0, `nav top ${lock.navTop}`);
      k.check(`html locked and nothing on screen pans while open (${how} run)`, lock.html === "hidden" && !lock.pans.length, `html ${lock.html}${lock.pans.length ? ", pannable: " + lock.pans.join(", ") : ""}`);
      k.check(`scrim reaches the bottom of the screen (${how} run)`, lock.scrimBottom != null && lock.scrimBottom >= lock.vh, `scrim bottom ${lock.scrimBottom}, viewport ${lock.vh}`);
      if (how === "button") {
        const cdp = await page.context().newCDPSession(page);
        const yb = await k.y(page);
        await swipe(cdp, page, Math.round(vp.w / 2), Math.round(vp.h * 0.7), 300);
        await page.waitForTimeout(300);
        const ya = await k.y(page);
        k.check("a swipe on the open menu doesn't scroll the page", Math.abs(ya - yb) <= 2, `${yb} → ${ya}`);
        await cdp.detach();
      }
      if (how === "button") await page.tap(".nav__toggle");
      else if (how === "escape") await page.keyboard.press("Escape");
      else await page.touchscreen.tap(Math.round(vp.w / 2), Math.round(vp.h * 0.8));
      await page.waitForTimeout(450);
      const y1 = await k.y(page);
      const closed = await page.evaluate(() => !document.querySelector(".nav").hasAttribute("data-open"));
      k.check(`closes with ${how}`, closed, "");
      k.check(`closing with ${how} moves the page ≤ 2 px`, Math.abs(y1 - y0) <= 2, `${y0} → ${y1}`);
      if (how === "button") await k.shot(page, "after-close-390");
    }
    await page.tap(".nav__toggle");
    await page.waitForTimeout(450);
    await page.tap('#nav-menu a[href$="#pricing"]');
    await page.waitForTimeout(900);
    const p = await page.evaluate(inPage.h2Top, "#pricing");
    k.check("menu → Pricing lands its h2 below the nav", p && p.top >= p.nav + 8 && p.top <= p.vh * 0.4, p && `h2 top ${p.top}, nav bottom ${p.nav}, 40% vh ${Math.round(p.vh * 0.4)}`);
    await k.shot(page, "pricing-390");
    await ctx.close();
  },

  /* NAV-01 with a keyboard, and FOCUS-01: every focus stop visible and opaque. */
  async keyfocus(k) {
    const vp = { w: 1440, h: 900 };
    const { ctx, page } = await k.open(vp, "dark", "default");
    await k.load(page, "/");
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(SETTLE);
    await page.evaluate(() => {
      const first = document.querySelector("main a[href], main button:not([disabled]), main summary, main [tabindex='0']");
      if (first) first.focus({ preventScroll: true });
    });
    const y0 = await k.y(page);
    for (let i = 1; i <= 3; i++) {
      await page.keyboard.press("Shift+Tab");
      await page.waitForTimeout(300);
      const at = await page.evaluate(() => { const a = document.activeElement; return { inNav: !!(a && a.closest(".nav")), text: a ? (a.textContent || a.getAttribute("aria-label") || a.tagName).trim().slice(0, 24) : "" }; });
      const y = await k.y(page);
      k.check(`Shift+Tab ${i} into the nav moves the page ≤ 2 px`, Math.abs(y - y0) <= 2, `${y0} → ${y} (focus: ${at.text}${at.inNav ? ", in nav" : ""})`);
    }
    await k.shot(page, "shift-tab-1440");
    /* Tab through the page from the top of a fresh load, so the walk starts
       at the skip link (a blur would leave the start point in the nav). */
    await k.load(page, "/");
    const bad = { outline: [], covered: [], opacity: [] };
    let first = null, stops = 0;
    for (let i = 0; i < 300; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(60);
      const a = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el), r = el.getBoundingClientRect();
        let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
        const nav = document.querySelector(".nav"), inNav = !!(nav && nav.contains(el));
        const top = Math.max(r.top, 0), bottom = Math.min(r.bottom, innerHeight);
        const cx = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1), cy = (top + bottom) / 2;
        const hit = bottom > top ? document.elementFromPoint(cx, cy) : null;
        const covered = !hit || !(el === hit || el.contains(hit) || hit.contains(el));
        const ring = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 1) || (s.boxShadow && s.boxShadow !== "none");
        const id = el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + " “" + (el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 28) + "”";
        return { id, key: id + r.left + r.top + scrollY, inNav, ring, covered, opacity: +o.toFixed(2), y: Math.round(scrollY) };
      });
      if (!a) break;
      if (i === 0 && !/skip/i.test(a.id)) k.note(`the first Tab stop is ${a.id}, not the skip link`);
      if (first && a.key === first) break;
      if (!first) first = a.key;
      stops++;
      if (!a.ring) bad.outline.push(a.id);
      if (a.covered) bad.covered.push(`${a.id} at y=${a.y}`);
      if (a.opacity < 0.999) bad.opacity.push(`${a.id} @${a.opacity}`);
    }
    k.check("every focus stop shows a focus ring", !bad.outline.length, bad.outline.slice(0, 6).join("; ") || `${stops} stops`);
    k.check("no focus stop is covered (by the nav or anything else)", !bad.covered.length, bad.covered.slice(0, 6).join("; ") || `${stops} stops`);
    k.check("every focus stop is at opacity 1 when focused (FOCUS-01)", !bad.opacity.length, bad.opacity.slice(0, 6).join("; ") || `${stops} stops`, B_probes(k, "keyfocus.opacity"));
    k.note(`Tab walk: ${stops} stops from the skip link to the end of the page`);
    await ctx.close();
  },

  /* ANCHOR-01 and the nav links, plus NAV-02's aria-current on /faq/. */
  async anchors(k) {
    for (const vp of [{ w: 390, h: 844 }, { w: 1440, h: 900 }]) {
      const { ctx, page } = await k.open(vp, "dark", "default");
      await k.load(page, "/");
      const links = await page.evaluate(() => Array.prototype.map.call(document.querySelectorAll(".nav__links a"), (a) => a.getAttribute("href")));
      for (const href of links.filter((h) => h.includes("#"))) {
        await k.load(page, "/");
        const narrow = await page.evaluate(() => { const t = document.querySelector(".nav__toggle"); return !!t && getComputedStyle(t).display !== "none"; });
        if (narrow) { await page.click(".nav__toggle"); await page.waitForTimeout(400); }
        await page.click(`.nav__links a[href="${href}"]`);
        await page.waitForTimeout(900);
        const hash = href.slice(href.indexOf("#"));
        const p = await page.evaluate(inPage.h2Top, hash);
        k.check(`${vp.w}: ${href} lands its h2 between nav + 8 and 40% vh`, p && p.top >= p.nav + 8 && p.top <= p.vh * 0.4,
          p ? `h2 top ${p.top}, nav bottom ${p.nav}, 40% vh ${Math.round(p.vh * 0.4)}` : "no target");
        await k.shot(page, `${hash.slice(1)}-${vp.w}`);
      }
      await ctx.close();
    }
    const { ctx, page } = await k.open({ w: 1440, h: 900 }, "dark", "default");
    await k.load(page, "/faq/");
    const cur = await page.evaluate(() => Array.prototype.map.call(document.querySelectorAll('.nav [aria-current="page"]'), (a) => a.getAttribute("href")));
    k.check("on /faq/ the FAQ nav link has aria-current=page (NAV-02)", cur.length === 1 && cur[0] === "/faq/", cur.join(", ") || "none");
    await k.shot(page, "faq-current-1440");
    await ctx.close();
  },

  /* THEME-01: the toggle, the stored choice and both theme-color metas. */
  async theme(k) {
    for (const start of ["dark", "light"]) {
      const want = start === "dark" ? "light" : "dark";
      const { ctx, page } = await k.open({ w: 390, h: 844 }, start, "default");
      const state = () => page.evaluate(() => ({
        theme: document.documentElement.getAttribute("data-theme"),
        bg: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim().toLowerCase(),
        metas: Array.prototype.map.call(document.querySelectorAll('meta[name="theme-color"]'), (m) => (m.getAttribute("content") || "").toLowerCase()),
      }));
      await k.load(page, "/");
      await page.click("[data-theme-toggle]");
      await page.waitForTimeout(300);
      const ok = (s) => s.theme === want && s.metas.length >= 1 && s.metas.every((m) => m === s.bg);
      const show = (s) => `data-theme ${s.theme}, --bg ${s.bg}, metas ${s.metas.join(" / ")}`;
      let s = await state();
      k.check(`${start} → toggle → ${want}: theme set and both theme-color metas = --bg`, ok(s), show(s));
      await page.reload({ waitUntil: "load" });
      await page.waitForTimeout(400);
      s = await state();
      k.check(`${want} persists after a reload, metas follow`, ok(s), show(s));
      await k.load(page, "/faq/");
      s = await state();
      k.check(`${want} carries to /faq/, metas follow`, ok(s), show(s));
      await k.shot(page, `faq-${want}`);
      await ctx.close();
    }
  },

  /* NOJS-01 and blocked scripts: the page is complete without them. */
  async nojs(k, o, B) {
    let url = null;
    const api = await k.open({ w: 390, h: 844 }, "dark", "default");
    const cfg = await api.ctx.request.get(o.base + "/next/js/config.js").then((r) => r.text()).catch(() => "");
    await api.ctx.close();
    const m = /testflightUrl:\s*["']([^"']+)/.exec(cfg);
    if (m) url = m[1];
    /* The text a visitor sees with JS, after a full scroll, at each width:
       without JS the same text must show (CSS may hide some on purpose at a
       width, like the QR on a phone; that is hidden with JS as well). */
    const seenWithJs = {};
    for (const vp of [{ w: 390, h: 844 }, { w: 1440, h: 900 }]) {
      const { ctx, page } = await k.open(vp, "dark", "default");
      await k.load(page, "/");
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
        await new Promise((r) => setTimeout(r, 900));
      });
      seenWithJs[vp.w] = (await page.evaluate(textBoxes)).visible;
      await ctx.close();
    }
    for (const mode of ["nojs", "blockedjs"]) for (const vp of [{ w: 390, h: 844 }, { w: 1440, h: 900 }]) {
      const { ctx, page, w } = await k.open(vp, "dark", mode);
      if (mode === "blockedjs") await ctx.route("**/next/js/**", (r) => r.abort());
      await k.load(page, "/");
      const tag = `${mode} ${vp.w}`;
      const t = await page.evaluate(textBoxes);
      const present = new Set(t.present), shown = new Set(t.visible);
      const lost = seenWithJs[vp.w].filter((key) => present.has(key) && !shown.has(key));
      k.check(`${tag}: the text shown with JS shows without it`, !lost.length && !t.faded.length && !t.emptySections,
        [...lost.map((x) => x.replace("|", " “").slice(0, 44) + "”"), ...t.faded].slice(0, 6).join("; ") || (t.emptySections ? `${t.emptySections} empty sections` : `${t.visible.length} text boxes`));
      const r = await page.evaluate((nojs) => {
        const line = Array.prototype.find.call(document.querySelectorAll("main p"), (p) => p.textContent.includes(nojs.noscriptText));
        const lr = line && line.getBoundingClientRect();
        return { noscript: !!(lr && lr.width > 0 && lr.height > 0), ctas: Array.prototype.map.call(document.querySelectorAll("a[data-cta]"), (a) => a.getAttribute("href")) };
      }, B.nojs);
      if (mode === "nojs") k.check(`${tag}: the demo's no-JS line shows`, r.noscript, B.nojs.noscriptText);
      for (const sel of B.nojs.fallbacks) {
        /* Timers never fire with JS off, so the wait happens out here. */
        const found = await page.evaluate((q) => { const el = document.querySelector(q); if (el) el.scrollIntoView({ block: "center" }); return !!el; }, sel);
        await page.waitForTimeout(800);
        const f = !found ? null : await page.evaluate((q) => {
          const el = document.querySelector(q), r = el.getBoundingClientRect();
          return { box: r.width > 0 && r.height > 0, loaded: el.tagName !== "IMG" || (el.complete && el.naturalWidth > 0) };
        }, sel).catch(() => null);
        if (mode === "nojs") k.check(`${tag}: fallback ${sel} visible and loaded`, f && f.box && f.loaded, f ? JSON.stringify(f) : "missing");
        else k.note(`${tag}: fallback ${sel} ${f && f.box ? "visible" : "hidden"} (blocked scripts can't run the JS that swaps it)`);
      }
      k.check(`${tag}: every a[data-cta] links to config's testflightUrl`, url && r.ctas.length && r.ctas.every((h) => h === url), `${r.ctas.length} CTAs`);
      await page.waitForTimeout(300);
      const seen = w.classify();
      const own = seen.console.filter((c) => c.bucket === "own");
      k.check(`${tag}: no console errors`, !own.length, own.slice(0, 3).map((c) => c.text.slice(0, 120)).join(" | ") || "0");
      if (vp.w === 390) await k.shot(page, `${mode}-390`);
      await ctx.close();
    }
  },

  /* RESIZE-01: a resize keeps the reader where they were. */
  async resize(k) {
    for (const [a, b, start] of [["820x1180", "1180x820", 0.4], ["390x844", "1440x900", 0.4], ["1440x900", "390x844", 0.4], ["1000x800", "1440x900", 0.4]]) {
      const from = size(a), to = size(b);
      const { ctx, page } = await k.open(from, "dark", "default");
      await k.load(page, "/");
      await page.evaluate((f) => window.scrollTo(0, document.documentElement.scrollHeight * f), start);
      await page.waitForTimeout(SETTLE);
      const held = await page.evaluate(inPage.holder);
      const y0 = await k.y(page);
      await page.setViewportSize({ width: to.w, height: to.h });
      await page.waitForTimeout(1000);
      const y1 = await k.y(page);
      const there = held ? await page.evaluate(inPage.stillThere, held.index) : false;
      k.check(`${a} → ${b} keeps the place`, y1 > 0 && there, `${y0} → ${y1}, ${held ? held.name : "?"} ${there ? "still in view" : "gone"}`);
      await k.shot(page, `${a}-to-${b}`);
      await ctx.close();
    }
  },

  /* RESIZE-01 on a phone: rotate mid-page and back. */
  async rotate(k) {
    const { ctx, page } = await k.open({ w: 390, h: 844 }, "dark", "touch");
    await k.load(page, "/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.5));
    await page.waitForTimeout(SETTLE);
    for (const [w, h] of [[844, 390], [390, 844]]) {
      const held = await page.evaluate(inPage.holder);
      const y0 = await k.y(page);
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(1000);
      const y1 = await k.y(page);
      const there = held ? await page.evaluate(inPage.stillThere, held.index) : false;
      k.check(`rotate to ${w}x${h} keeps the place`, y1 > 0 && there, `${y0} → ${y1}, ${held ? held.name : "?"} ${there ? "still in view" : "gone"}`);
      await k.shot(page, `rotate-${w}x${h}`);
    }
    await ctx.close();
  },

  /* STORY-04: End, Home, then step down; nothing pending or half-faded. */
  async fastjump(k, o, B) {
    for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844 }]) {
      const { ctx, page } = await k.open(vp, "dark", "default");
      await k.load(page, "/");
      await page.mouse.move(vp.w / 2, vp.h / 2);
      const stops = [];
      const look = async (label) => {
        await page.waitForTimeout(SETTLE);
        const f = await page.evaluate(frameProbe, { positionAllowed: B.positionAllowed });
        const bad = f.issues.filter((i) => ["pending", "half-faded", "double-exposure"].includes(i.kind));
        stops.push(`${label}@${f.y}${bad.length ? ": " + bad.map((i) => `${i.kind} (${i.detail.slice(0, 80)})`).join("; ") : ""}`);
        k.check(`${vp.w}: ${label} shows nothing pending, half-faded or doubled`, !bad.length, bad.map((i) => `${i.kind}: ${i.detail.slice(0, 120)}`).join(" | ") || `y=${f.y}`);
        await k.shot(page, `${vp.w}-${label}`);
      };
      await page.keyboard.press("End"); await look("end");
      await page.keyboard.press("Home"); await look("home");
      for (let i = 1; i <= 3; i++) { await page.mouse.wheel(0, STEP * vp.h); await look(`down${i}`); }
      await ctx.close();
    }
  },

  /* axe-core after a full scroll, both schemes, 390 and 1440. */
  async axe(k, o) {
    const src = axeSource(o);
    if (!src) { k.skip = "axe-core not found: npm install --prefix $TMPDIR/scroll-pass-axe axe-core (outside the repo), or pass --axe"; return; }
    for (const scheme of ["dark", "light"]) for (const vp of [{ w: 390, h: 844 }, { w: 1440, h: 900 }]) {
      const { ctx, page } = await k.open(vp, scheme, "default");
      await k.load(page, "/");
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
        await new Promise((r) => setTimeout(r, 800));
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(SETTLE);
      await page.evaluate(src);
      const v = await page.evaluate(() => window.axe.run(document, { resultTypes: ["violations"] }).then((r) =>
        r.violations.map((x) => ({ id: x.id, impact: x.impact, n: x.nodes.length, nodes: x.nodes.slice(0, 3).map((n) => n.target.join(" ")) }))));
      const bad = v.filter((x) => x.impact === "serious" || x.impact === "critical");
      k.check(`${scheme} ${vp.w}: no serious or critical axe violations`, !bad.length, bad.map((x) => `${x.id} (${x.impact}) ×${x.n}: ${x.nodes.join(", ")}`).join(" | ") || "0");
      const minor = v.filter((x) => !bad.includes(x));
      if (minor.length) k.note(`${scheme} ${vp.w}: ${minor.map((x) => `${x.id} (${x.impact}) ×${x.n}`).join(", ")}`);
      await ctx.close();
    }
  },

  /* LIVE-02 and LIVE-01 on the deployed site. */
  async live(k, o) {
    if (!o.live) { k.skip = "needs --live"; return; }
    const { ctx } = await k.open({ w: 1440, h: 900 }, "dark", "default");
    const html = await ctx.request.get(o.base + "/").then((r) => r.text());
    const refs = [...new Set((html.match(/\/next\/(?:css|js)\/[\w.-]+\.(?:css|js)(?:\?v=[0-9a-f]+)?/g) || []))];
    const unstamped = refs.filter((r) => !/\?v=/.test(r));
    k.check("the live homepage references only stamped /next/ CSS and JS", refs.length && !unstamped.length, unstamped.join(", ") || `${refs.length} stamped`);
    for (const ref of refs.filter((r) => /\?v=/.test(r))) {
      const res = await ctx.request.get(o.base + ref);
      const cc = res.headers()["cache-control"] || "";
      const body = await res.body();
      const v = ref.split("?v=")[1], hash = crypto.createHash("sha256").update(body).digest("hex").slice(0, 8);
      k.check(`${ref.split("?")[0]} is immutable and matches its stamp`, /immutable/.test(cc) && /max-age=31536000/.test(cc) && v === hash, `cache-control: ${cc}; stamp ${v}, served ${hash}`);
    }
    for (const vp of [{ w: 390, h: 844, mode: "iphone" }, { w: 1440, h: 900, mode: "default" }]) {
      const t = await k.open(vp, "dark", vp.mode);
      await k.load(t.page, "/");
      await t.page.waitForTimeout(1000);
      const seen = t.w.classify();
      const own = seen.console.filter((c) => c.bucket === "own"), zone = seen.console.filter((c) => c.bucket === "zone");
      k.check(`${vp.w}: no console errors besides the zone's`, !own.length, own.map((c) => c.text.slice(0, 100)).join(" | ") || "0");
      k.note(`${vp.w}: zone-injected (owner action, SPEC §12 #5): ${zone.length} console errors`);
      await t.ctx.close();
    }
    await ctx.close();
  },

  /* The hero demo (SPEC §6.2, §10.2): every hand x every slab grades as the
     app does, the answer card names the hand and fits, text keeps its floors,
     Chart draws 169 cells with one hero ring, the score's CTA is config's, and
     Reduce Motion runs nothing. Plus the hero's own layout numbers. */
  async demo(k, o) {
    const TITLES = ["A5s from the button", "J8s from the big blind", "KTs from the cutoff"];
    const EXPECT = [{ Fold: "Wrong", Raise: "Correct" }, { Fold: "Wrong", Call: "Mixed", "3-Bet": "Correct" }, { Fold: "Mixed", Call: "Correct" }];
    const ready = (page) => page.waitForFunction(() => { const b = document.querySelector("#demo-decisions .dbtn"); return b && !b.disabled; }, null, { timeout: 15000 });
    const labels = (page) => page.$$eval("#demo-decisions .dbtn .dbtn__label", (els) => els.map((e) => e.textContent));
    /* Answer the hands before `hand` with the first slab, skipping each deal. */
    async function reach(page, hand) {
      await ready(page);
      for (let h = 0; h < hand; h++) {
        await page.click("#demo-decisions .dbtn >> nth=0");
        await page.click(".answer__next");
        await page.click("#demo-stage");
        await ready(page);
      }
    }
    const inspect = () => {
      const phone = document.getElementById("demo"), card = phone.querySelector(".answer");
      const head = phone.querySelector(".phone__head").getBoundingClientRect();
      const small = [];
      phone.querySelectorAll("*").forEach((el) => {
        const own = Array.prototype.some.call(el.childNodes, (n) => n.nodeType === 3 && n.textContent.trim());
        if (!own || !el.checkVisibility || !el.checkVisibility({ visibilityProperty: true })) return;
        const fs = parseFloat(getComputedStyle(el).fontSize), floor = el.closest(".pod__detail, .pot__meta") ? 10 : 11;
        if (fs < floor - 0.01) small.push(`${el.className || el.tagName} "${el.textContent.trim().slice(0, 20)}" ${fs.toFixed(1)}px`);
      });
      const r = card && card.getBoundingClientRect();
      return {
        title: card ? card.querySelector(".answer__title").textContent : null,
        grade: card ? card.querySelector(".answer__grade").textContent : null,
        why: card ? card.querySelector(".answer__why").textContent : "",
        fits: card ? card.scrollHeight <= card.clientHeight + 1 && r.top >= head.bottom - 1 : false,
        cardBox: r ? `${Math.round(r.top)}-${Math.round(r.bottom)}, head ${Math.round(head.bottom)}, scroll ${card.scrollHeight}/${card.clientHeight}` : "",
        focus: document.activeElement && document.activeElement.className,
        pcts: Array.prototype.map.call(phone.querySelectorAll(".dbtn__pc"), (e) => e.textContent).join(" "),
        small,
      };
    };

    /* 1. Every hand x every slab at 390, a fresh load each. */
    const { ctx, page, w } = await k.open({ w: 390, h: 844 }, "dark", "default");
    for (let h = 0; h < 3; h++) {
      await k.load(page, "/");
      await reach(page, h);
      const names = await labels(page);
      for (let s = 0; s < names.length; s++) {
        if (s) { await k.load(page, "/"); await reach(page, h); }
        await page.click(`#demo-decisions .dbtn >> nth=${s}`);
        await page.waitForTimeout(900);
        const r = await page.evaluate(inspect);
        const want = EXPECT[h][names[s]];
        k.check(`hand ${h + 1} ${names[s]}: ${want}`, r.grade && r.grade.startsWith(want), `${r.grade} · ${r.pcts}`);
        k.check(`hand ${h + 1} ${names[s]}: the card names the hand, explains, and fits`, r.title === TITLES[h] && r.why.length > 20 && r.fits, `${r.title}; ${r.cardBox}`);
        k.check(`hand ${h + 1} ${names[s]}: focus moves to Next`, /answer__next/.test(r.focus || ""), r.focus);
        if (s === names.length - 1) await k.shot(page, `answer-${h + 1}-390`);
      }
    }
    /* 2. Chart view, then the deal's length and the score. */
    await k.load(page, "/");
    await ready(page);
    await page.click("#demo-decisions .dbtn >> nth=1");
    await page.click(".answer__chart");
    await page.waitForTimeout(500);
    const ch = await page.evaluate(() => {
      const d = document.querySelector(".dchart"), cells = d ? d.querySelectorAll(".cell") : [], hero = d ? d.querySelectorAll(".cell.is-hero") : [];
      const lg = d && d.querySelector(".clegend").getBoundingClientRect(), act = document.querySelector(".answer__actions").getBoundingClientRect();
      const grid = d && d.querySelector(".cgrid").getBoundingClientRect(), ph = document.getElementById("demo").getBoundingClientRect();
      return { cells: cells.length, hero: hero.length, btn: document.querySelector(".answer__chart").textContent, clear: lg && lg.bottom <= act.top + 1,
        inside: grid && grid.left >= ph.left && grid.right <= ph.right && grid.top >= ph.top, live: document.getElementById("demo-announce").textContent };
    });
    k.check("Chart: 169 cells, one hero ring", ch.cells === 169 && ch.hero === 1, `${ch.cells} cells, ${ch.hero} ring`);
    k.check("Chart: the button reads Back to answer; the legend clears it; the grid is inside the phone", ch.btn === "Back to answer" && ch.clear && ch.inside, `${ch.btn}; legend clear ${ch.clear}; inside ${ch.inside}`);
    k.check("Chart: the live region reads the summary", /^Chart: Opening from the button, 100bb\. A5s: Raise 100%\.$/.test(ch.live), ch.live);
    await k.shot(page, "chart-390");
    await page.click(".answer__chart");
    await page.waitForTimeout(300);
    k.check("Back to answer brings the card back", await page.evaluate(() => getComputedStyle(document.querySelector(".answer__why")).display !== "none"), "");
    for (let h = 1; h < 3; h++) {
      await page.click(".answer__next");
      const t0 = Date.now();
      await ready(page);
      const ms = Date.now() - t0;
      const after = await page.evaluate(() => ({
        hidden: Array.prototype.filter.call(document.querySelectorAll("#demo-stage .fan, #demo-stage .hero-cards"), (e) => getComputedStyle(e).opacity !== "1").length,
        line: document.getElementById("demo-line").textContent,
      }));
      k.check(`hand ${h + 1} deals in under 3.5 s and leaves every hand showing`, ms < 3500 && !after.hidden, `${ms} ms; ${after.hidden} hidden; "${after.line}"`);
      if (h === 1) await k.shot(page, "dealt-2-390");
      await page.click("#demo-decisions .dbtn >> nth=1");
      await page.waitForTimeout(700);
    }
    await page.click(".answer__next");
    await page.waitForTimeout(600);
    const sc = await page.evaluate(() => {
      const s = document.querySelector(".score"), a = s && s.querySelector("a[data-cta]"), cfg = window.PreflopConfig && window.PreflopConfig.cta;
      return { fig: s && s.querySelector(".score__figure").textContent, href: a && a.getAttribute("href"), want: cfg && cfg.testflightUrl, label: a && a.textContent, wantLabel: cfg && cfg.label };
    });
    k.check("score: the CTA's href and label are config's", sc.href && sc.href === sc.want && sc.label === sc.wantLabel, `${sc.fig}; ${sc.href} "${sc.label}"`);
    await k.shot(page, "score-390");
    await page.click(".score [data-again]");
    await ready(page);
    k.check("Play again deals hand 1 again", await page.evaluate(() => !document.querySelector(".score") && document.getElementById("demo-count").textContent === "1 / 3"), "");
    const errs = w.console.filter((c) => c.type !== "warning");
    k.check("no console errors while playing", !errs.length, errs.slice(0, 3).map((c) => c.text).join(" | "));
    await ctx.close();

    /* 3. Text floors and the card at 320, 390 and 1440, after each hand. */
    for (const vp of [{ w: 320, h: 568 }, { w: 390, h: 844 }, { w: 1440, h: 900 }]) {
      const o2 = await k.open(vp, "dark", "default");
      await k.load(o2.page, "/");
      const before = await o2.page.evaluate(inspect);
      k.check(`${vp.w}: table text ≥ 11 px (pod details ≥ 10)`, !before.small.length, before.small.slice(0, 4).join("; "));
      for (let h = 0; h < 3; h++) {
        if (h) { await o2.page.click(".answer__next"); await o2.page.click("#demo-stage"); }
        await ready(o2.page);
        await o2.page.click("#demo-decisions .dbtn >> nth=0");
        await o2.page.waitForTimeout(900);
        const r = await o2.page.evaluate(inspect);
        k.check(`${vp.w} hand ${h + 1}: the card names the hand and fits; text ≥ 11 px`, r.title === TITLES[h] && r.fits && !r.small.length, `${r.cardBox}${r.small.length ? "; small: " + r.small.slice(0, 3).join("; ") : ""}`);
        if (vp.w === 320) await k.shot(o2.page, `answer-${h + 1}-320`);
      }
      await o2.ctx.close();
    }

    /* 4. Reduce Motion: nothing animates, during or after a hand. */
    const rm = await k.open({ w: 390, h: 844 }, "dark", "reduced");
    await k.load(rm.page, "/");
    await ready(rm.page);
    const counts = [];
    const sample = async () => counts.push(await rm.page.evaluate(() => document.getAnimations().length));
    await rm.page.click("#demo-decisions .dbtn >> nth=1"); await sample(); await rm.page.waitForTimeout(150); await sample();
    await rm.page.click(".answer__chart"); await sample();
    await rm.page.click(".answer__chart");
    await rm.page.click(".answer__next"); await sample(); await rm.page.waitForTimeout(150); await sample();
    const instant = await rm.page.evaluate(() => !document.querySelector("#demo-decisions .dbtn").disabled);
    k.check("Reduce Motion: getAnimations() stays empty and the next hand is dealt at once", counts.every((n) => n === 0) && instant, `counts ${counts.join(",")}; dealt ${instant}`);
    await rm.ctx.close();

    /* 5. The hero's layout numbers (§6.2 Accept, copy positions). */
    for (const vp of [{ w: 320, h: 568 }, { w: 390, h: 844 }, { w: 1280, h: 720 }, { w: 1440, h: 900 }, { w: 844, h: 390 }]) {
      const o3 = await k.open(vp, "dark", "default");
      await k.load(o3.page, "/");
      const g = await o3.page.evaluate(() => {
        const R = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
        const h1 = R("#hero-title"), line = R(".hero__line"), cta = R(".hero__cta .btn"), note = R(".hero__note"), ph = R("#demo"), hero = R("#top"), slabs = R("#demo-decisions");
        const demo = document.querySelector(".hero__demo"), hits = [];
        for (let fx = 0.1; fx < 1; fx += 0.2) for (let fy = 0.05; fy < 1; fy += 0.15) {
          const x = ph.left + ph.width * fx, y = ph.top + ph.height * fy;
          if (y < 0 || y > innerHeight) continue;
          const el = document.elementFromPoint(x, y);
          if (el && !demo.contains(el) && !el.contains(demo) && !el.closest(".nav")) hits.push(el.tagName.toLowerCase() + "." + el.className);
        }
        return { vh: innerHeight, h1Top: Math.round(h1.top), copyBottom: Math.round(Math.max(line.bottom, note.bottom)), ctaBottom: Math.round(cta.bottom),
          phoneTop: Math.round(ph.top), phoneW: Math.round(ph.width), heroBottom: Math.round(hero.bottom), slabsBottom: Math.round(slabs.bottom), hits };
      });
      const tag = `${vp.w}x${vp.h}`;
      k.check(`${tag}: nothing outside the phone lies over it`, !g.hits.length, g.hits.slice(0, 3).join(", "));
      if (vp.w <= 390) {
        k.check(`${tag}: h1, line, CTA and note in the first screen, ≥ 120 px of the phone`, g.copyBottom <= g.vh && g.vh - g.phoneTop >= 120, `copy bottom ${g.copyBottom}, phone top ${g.phoneTop}, vh ${g.vh}`);
        if (vp.w === 390) k.check("390: h1 at y≈88, CTA bottom ≤ 330, phone top ≤ 390", Math.abs(g.h1Top - 88) <= 4 && g.ctaBottom <= 330 && g.phoneTop <= 390, `h1 ${g.h1Top}, CTA ${g.ctaBottom}, phone ${g.phoneTop}`);
      } else if (vp.h > 500) {
        k.check(`${tag}: the hero and the slabs end inside the first screen`, g.heroBottom <= g.vh && g.slabsBottom <= g.vh, `hero ${g.heroBottom}, slabs ${g.slabsBottom}, vh ${g.vh}`);
      } else {
        k.check(`${tag}: landscape stacks the copy over a phone at --s 0.85`, g.phoneTop >= g.copyBottom && Math.abs(g.phoneW - Math.round(402 * 0.85)) <= 1, `copy bottom ${g.copyBottom}, phone top ${g.phoneTop}, width ${g.phoneW}`);
      }
      await o3.ctx.close();
    }

    /* 6. The proof figure keeps its number when it starts on screen (§6.3). */
    const pf = await k.open({ w: 1440, h: 900 }, "dark", "default");
    await pf.page.goto(o.base + "/", { waitUntil: "commit" });
    const seen = new Set();
    let below = null;
    for (let i = 0; i < 30; i++) {
      const s = await pf.page.evaluate(() => { const e = document.querySelector("[data-count='25000']"); return e ? [e.textContent.trim(), e.getBoundingClientRect().top > innerHeight] : null; }).catch(() => null);
      if (s) { seen.add(s[0]); if (below === null) below = s[1]; }
      await pf.page.waitForTimeout(50);
    }
    k.check("1440: the 25,000 figure never shows another value unless it began below the screen", below || [...seen].every((t) => t === "25,000"), `${below ? "below the screen" : "on screen"}; saw ${[...seen].join(", ")}`);
    await pf.ctx.close();
  },
  /* How it teaches (SPEC §6.4, EXPL-01..05) and Every seat (§6.5): hovering
     never moves anything, a wheel under a still pointer changes nothing, the
     tabs and the grid follow the keyboard pattern, the columns line up, the
     two rings differ, and no coverage row runs past three lines at 320. */
  async explorer(k) {
    const { ctx, page, w } = await k.open({ w: 1440, h: 900 }, "dark", "default");
    await k.load(page, "/");
    await page.evaluate(() => document.getElementById("teach-chart").scrollIntoView({ block: "center" }));
    await page.waitForTimeout(900);
    const state = () => page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll("#teach-chart .cell")), sel = cells.findIndex((c) => c.classList.contains("is-sel"));
      const tabs = Array.from(document.querySelectorAll('#features [role="tab"]'));
      return {
        sel, hero: cells.findIndex((c) => c.classList.contains("is-hero")), n: cells.length,
        card: Math.round(document.getElementById("teach-card").getBoundingClientRect().height * 10) / 10,
        hand: document.querySelector(".teach__hand").textContent, live: document.getElementById("teach-announce").textContent,
        tabs: tabs.map((t) => [t.id, t.getAttribute("aria-selected"), t.tabIndex]),
        panel: [document.getElementById("teach-chart").getAttribute("role"), document.getElementById("teach-chart").getAttribute("aria-labelledby")],
        active: document.activeElement && (document.activeElement.id || document.activeElement.className),
      };
    });
    /* Hover 20 random cells: no layout shift, the card keeps its height. */
    await page.evaluate(() => { window.__sp_hover = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__sp_hover += e.value; })).observe({ type: "layout-shift" }); });
    const s0 = await state(), boxes = await page.$$eval("#teach-chart .cell", (cs) => cs.map((c) => { const r = c.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }));
    const heights = new Set([s0.card]);
    let seed = 7;
    for (let i = 0; i < 20; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const [x, y] = boxes[Math.floor(seed / 233280 * boxes.length)];
      await page.mouse.move(x, y, { steps: 3 });
      await page.waitForTimeout(60);
      heights.add((await state()).card);
    }
    await page.waitForTimeout(400);
    const cls = await page.evaluate(() => window.__sp_hover);
    const s1 = await state();
    k.check("1440: hovering 20 cells adds 0 to CLS", cls === 0, `CLS +${cls.toFixed(4)}`);
    k.check("1440: the card's height never changes while hovering", heights.size === 1, [...heights].join(" / ") + " px");
    k.check("hovering previews the hand under the pointer", s1.sel >= 0 && s1.sel !== s0.sel, `selected ${s0.sel} → ${s1.sel}, card "${s1.hand}"`);
    await k.shot(page, "hover-1440");
    /* A wheel under a still pointer: the page scrolls, the selection stays. */
    const yb = await k.y(page), before = (await state()).sel;
    await page.mouse.wheel(0, 240);
    await page.waitForTimeout(600);
    const ya = await k.y(page), after = (await state()).sel;
    k.check("a wheel scroll with the pointer still leaves the selection unchanged", ya > yb && after === before, `scrollY ${yb} → ${ya}; selected ${before} → ${after}`);
    /* Leaving the chart returns to the pinned hand (the spot's, by default). */
    await page.mouse.move(5, 5);
    await page.waitForTimeout(200);
    const s2 = await state();
    k.check("pointer out: back to the pinned hand", s2.sel === s2.hero, `selected ${s2.sel}, hero ${s2.hero}`);
    /* The two rings: amber for the spot's hand, --text for the selection. */
    const rings = await page.evaluate(() => {
      const hero = document.querySelector("#teach-chart .cell.is-hero");
      hero.classList.add("is-sel");
      const a = getComputedStyle(hero, "::before").borderTopColor, b = getComputedStyle(hero).outlineColor;
      const tok = (n) => { const d = document.createElement("i"); d.style.setProperty("color", `var(${n})`); document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
      return { ring: a, sel: b, accent: tok("--accent"), text: tok("--text") };
    });
    k.check("the hero ring is amber and the selected ring is --text", rings.ring === rings.accent && rings.sel === rings.text && rings.ring !== rings.sel, `ring ${rings.ring}, selected ${rings.sel}`);
    await page.evaluate(() => document.getElementById("teach-chart").scrollIntoView({ block: "center" }));
    await page.waitForTimeout(300);
    /* EXPL-01: the columns end together at 1440. */
    const cols = await page.evaluate(() => {
      const left = Math.max(...[".teach__head", ".teach__tabs", "#teach-card"].map((s) => document.querySelector(s).getBoundingClientRect().bottom));
      const right = document.getElementById("teach-chart").getBoundingClientRect().bottom;
      return { left: Math.round(left), right: Math.round(right) };
    });
    k.check("1440: the left and right columns end within 120 px (EXPL-01)", Math.abs(cols.left - cols.right) <= 120, `left ${cols.left}, right ${cols.right}`);
    /* Tabs: click each; then the keyboard pattern. */
    for (const [id, hand] of [["teach-tab-j8s", "J8s"], ["teach-tab-a5s", "A5s"], ["teach-tab-kts", "KTs"]]) {
      await page.click("#" + id);
      await page.waitForTimeout(300);
      const s = await state();
      const one = s.tabs.filter((t) => t[1] === "true");
      k.check(`tab ${hand}: selected alone, roving tabindex, panel labelled by it, card on ${hand}`,
        one.length === 1 && one[0][0] === id && s.tabs.every((t) => t[2] === (t[0] === id ? 0 : -1)) && s.panel[0] === "tabpanel" && s.panel[1] === id && s.hand === hand && s.sel === s.hero && s.n === 169,
        `${JSON.stringify(s.tabs)} panel ${s.panel.join(" ")} card ${s.hand}`);
      if (hand === "J8s") await k.shot(page, "tab-j8s-1440");
    }
    await page.focus("#teach-tab-kts");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(250);
    let s = await state();
    k.check("tabs: ArrowRight selects and focuses the next tab", s.active === "teach-tab-j8s" && s.tabs[1][1] === "true", `focus ${s.active}`);
    await page.keyboard.press("End");
    await page.waitForTimeout(250);
    s = await state();
    k.check("tabs: End goes to the last tab", s.active === "teach-tab-a5s" && s.tabs[2][1] === "true", `focus ${s.active}`);
    await page.keyboard.press("Home");
    await page.waitForTimeout(250);
    s = await state();
    k.check("tabs: Home goes to the first tab", s.active === "teach-tab-kts" && s.tabs[0][1] === "true", `focus ${s.active}`);
    /* The grid: one Tab stop, arrows move the pin, Home returns to the hand. */
    await page.keyboard.press("Tab");
    s = await state();
    const inGrid = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains("cgrid"));
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(200);
    const moved = await state();
    await page.keyboard.press("Home");
    await page.waitForTimeout(200);
    const home = await state();
    k.check("grid: one Tab stop after the tabs; arrows move the pin; Home returns to the spot's hand",
      inGrid && moved.sel === s.hero + 12 && home.sel === home.hero && /^KTs: /.test(home.live), `in grid ${inGrid}; ${s.hero} → ${moved.sel} → ${home.sel}; live "${home.live}"`);
    const errs = w.console.filter((c) => c.type !== "warning");
    k.check("no console errors", !errs.length, errs.slice(0, 3).map((c) => c.text).join(" | "));
    await ctx.close();

    /* §6.5: no coverage row wraps past three lines at 320. */
    const sm = await k.open({ w: 320, h: 568 }, "dark", "default");
    await k.load(sm.page, "/");
    /* A row's lines: the name's (the chips and Level pill share its first line) plus "who". */
    const lines = await sm.page.evaluate(() => Array.from(document.querySelectorAll(".spot")).map((row) => {
      const count = (el) => { const r = document.createRange(); r.selectNodeContents(el); return new Set(Array.from(r.getClientRects()).map((x) => Math.round(x.top))).size; };
      return [row.querySelector(".spot__name").textContent, count(row.querySelector(".spot__name")) + count(row.querySelector(".spot__who"))];
    }));
    k.check("320: no coverage row runs past three lines", lines.every((l) => l[1] <= 3), lines.map((l) => `${l[0]} ${l[1]}`).join(", "));
    await sm.ctx.close();
  },
};

function B_probes(k, key) { return k.budgets && k.budgets.probes && k.budgets.probes[key] != null ? k.budgets.probes[key] : k.from; }

function axeSource(o) {
  const tries = [o.axe];
  try { tries.push(require.resolve("axe-core/axe.min.js")); } catch (e) { /* not on NODE_PATH */ }
  tries.push(path.join(os.tmpdir(), "scroll-pass-axe/node_modules/axe-core/axe.min.js"));
  if (process.env.TMPDIR) tries.push(path.join(process.env.TMPDIR, "scroll-pass-axe/node_modules/axe-core/axe.min.js"));
  const f = tries.find((t) => t && fs.existsSync(t));
  return f ? fs.readFileSync(f, "utf8") : null;
}

async function runProbe(browser, name, o, B, phase, out) {
  const k = probeKit(browser, o, B, out, name);
  k.budgets = B;
  const t0 = Date.now();
  let timer;
  const limit = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`timed out after ${PROBE_TIMEOUT / 1000} s`)), PROBE_TIMEOUT); });
  try { await Promise.race([PROBES[name](k, o, B), limit]); }
  catch (e) { k.checks.push({ what: "probe ran", ok: false, detail: String(e && e.message || e).split("\n")[0], from: k.from }); }
  finally { clearTimeout(timer); }
  const failed = k.checks.filter((c) => !c.ok);
  const result = k.skip ? "SKIP" : failed.some((c) => due(c.from, phase)) ? "FAIL" : failed.length ? "DUE" : "PASS";
  return { name, result, from: k.from, skip: k.skip || null, checks: k.checks, notes: k.notes, shots: k.shots, ms: Date.now() - t0 };
}

/* ---- serving -------------------------------------------------------------- */

function answers(base) {
  const u = new URL(base);
  return new Promise((res) => {
    const s = net.connect({ host: u.hostname, port: +u.port || 80 }, () => { s.end(); res(true); });
    s.on("error", () => res(false));
  });
}

async function serve(o) {
  const u = new URL(o.base);
  if (!["localhost", "127.0.0.1"].includes(u.hostname) || await answers(o.base)) return null;
  const root = path.resolve(o.root || REPO);
  const child = spawn("python3", ["-m", "http.server", String(u.port || 80), "--bind", "127.0.0.1", "--directory", root], { stdio: "ignore" });
  for (let i = 0; i < 50 && !(await answers(o.base)); i++) await new Promise((r) => setTimeout(r, 100));
  console.log(`serving ${root} at ${o.base}`);
  return child;
}

/* ---- report --------------------------------------------------------------- */

function report(all, o, phase, out) {
  const L = [];
  const commit = (() => { try { return execFileSync("git", ["-C", o.root ? path.resolve(o.root) : REPO, "rev-parse", "--short", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch (e) { return "?"; } })();
  L.push(`# scroll-pass${o.label ? ": " + o.label : ""}`, "");
  L.push(`- Base: ${o.base}${o.live ? " (live)" : ""}; commit ${o.live ? "(deployed)" : commit}; phase ${phase}; ${new Date().toISOString()}`);
  L.push(`- Chromium ${all.version}; ${all.runs.length} passes, ${all.probes.length} probes; output ${out}`);
  L.push(`- Result: **${all.result}**`, "");
  if (all.runs.length) {
    L.push("## Passes", "", "```");
    for (const r of all.runs) L.push(line(r));
    L.push("```", "");
    L.push("| Run | Result | Screens | Section tops (screens) | CLS load / scroll | LCP | TBT / longest | Requests (before load) | JS / CSS / img / font KB | Console (own / zone) |", "|---|---|---|---|---|---|---|---|---|---|");
    for (const r of all.runs) {
      const s = r.stats, m = r.metrics, b = r.net.bytes, kb = (x) => ((x || 0) / 1024).toFixed(0);
      const tops = s ? s.tops.filter((t) => t.name.startsWith("#")).map((t) => `${t.name} ${(t.top / s.vh).toFixed(1)}`).join(", ") : "";
      const own = r.console.filter((c) => c.bucket === "own").length, zone = r.console.filter((c) => c.bucket === "zone").length;
      L.push(`| ${r.id} | ${r.result} | ${s ? (s.height / s.vh).toFixed(1) : "?"} | ${tops} | ${m ? m.clsLoad.toFixed(4) + " / " + m.clsScroll.toFixed(4) : "n/a"} | ${m ? `${m.lcpEl} ${m.lcpMs} ms` : "n/a"} | ${m ? `${m.tbt} / ${m.longest} ms` : "n/a"} | ${r.net.requests} (${r.net.beforeLoad}) | ${kb(b.script)} / ${kb(b.stylesheet)} / ${kb(b.image)} / ${kb(b.font)} | ${own} / ${zone} |`);
    }
    L.push("");
    L.push("### Failing and warning frames", "");
    for (const r of all.runs) {
      const hits = r.frames.filter((f) => f.issues.length);
      if (!hits.length && !r.error) continue;
      L.push(`**${r.id}** (${r.result})${r.contact ? ` · contact sheet \`${path.relative(out, r.contact)}\`` : ""}`, "");
      const byKind = {};
      for (const f of hits) for (const i of f.issues) (byKind[i.kind] = byKind[i.kind] || []).push({ f, i });
      for (const [kind, xs] of Object.entries(byKind)) {
        const first = xs[0];
        L.push(`- ${kind} (${first.i.level}) in ${xs.length} frame(s), first at step ${first.f.step} y=${first.f.y} \`${first.f.file}\`: ${first.i.detail}`);
      }
      if (r.error) L.push(`- error: ${r.error}`);
      L.push("");
    }
    L.push("### Budgets", "");
    L.push("| Run | Budget | Value | Limit | Status |", "|---|---|---|---|---|");
    for (const r of all.runs) for (const x of r.budgets || []) if (x.status !== "pass") L.push(`| ${r.id} | ${x.id} | ${x.value} | ${x.limit} | ${x.status === "due" ? `due Phase ${x.from}` : x.status.toUpperCase()} |`);
    for (const x of all.static) L.push(`| ${x.page} (as served) | ${x.id} | ${x.value} | ${x.limit} | ${x.status === "due" ? `due Phase ${x.from}` : x.status.toUpperCase()} |`);
    L.push("", "Budgets not listed passed.", "");
    const twice = [...new Set(all.runs.flatMap((r) => r.net.twice))];
    if (twice.length) L.push(`Fetched under two URLs (downloads twice): ${twice.join(", ")}`, "");
    const blur = [...new Set(all.runs.flatMap((r) => (r.stats ? r.stats.blur : [])))];
    const inf = [...new Set(all.runs.flatMap((r) => r.frames.flatMap((f) => f.infiniteNames || [])))];
    if (blur.length) L.push(`Blur layers: ${blur.join("; ")}`, "");
    if (inf.length) L.push(`Infinite animations seen: ${inf.slice(0, 24).join("; ")}`, "");
    const cons = all.runs.flatMap((r) => r.console.map((c) => ({ ...c, run: r.id })));
    const fails = all.runs.flatMap((r) => r.failed.map((c) => ({ ...c, run: r.id })));
    if (cons.length || fails.length) {
      L.push("### Console and failed requests", "");
      const uniq = new Map();
      /* The zone's inline script differs per request, so its hash is folded. */
      for (const c of cons) { const k2 = `${c.bucket}|${c.type}|${c.text.replace(/sha256-[\w+/=]+/g, "sha256-…").slice(0, 160)}`; uniq.set(k2, (uniq.get(k2) || 0) + 1); }
      for (const [k2, n] of uniq) { const [bucket, type, text] = k2.split("|"); L.push(`- ${bucket === "zone" ? "zone-injected (owner action)" : bucket} ${type} ×${n}: ${text}`); }
      const uf = new Map();
      for (const c of fails) { const k2 = `${c.bucket}|${c.url.slice(0, 120)}|${c.why}`; uf.set(k2, (uf.get(k2) || 0) + 1); }
      for (const [k2, n] of uf) { const [bucket, url, why] = k2.split("|"); L.push(`- failed request (${bucket === "zone" ? "zone-injected" : bucket}) ×${n}: ${url} ${why}`); }
      L.push("");
    }
  }
  if (all.probes.length) {
    L.push("## Probes", "", "```");
    for (const p of all.probes) L.push(`${p.result.padEnd(4)} ${p.name}${p.skip ? ` (${p.skip})` : ""} · ${p.checks.filter((c) => c.ok).length}/${p.checks.length} checks`);
    L.push("```", "");
    for (const p of all.probes) {
      L.push(`### ${p.name}: ${p.result}`, "");
      if (p.skip) L.push(`Skipped: ${p.skip}`, "");
      for (const c of p.checks) L.push(`- ${c.ok ? "✓" : due(c.from, phase) ? "✗" : `✗ (due Phase ${c.from})`} ${c.what}${c.detail ? ` — ${c.detail}` : ""}`);
      for (const n of p.notes) L.push(`- note: ${n}`);
      if (p.shots.length) L.push(`- screenshots: ${p.shots.map((s) => "`" + s + "`").join(", ")}`);
      L.push("");
    }
  }
  return L.join("\n");
}

/* ---- main ----------------------------------------------------------------- */

async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.live && !o.base) o.base = LIVE;
  o.base = (o.base || "http://localhost:8123").replace(/\/+$/, "");
  const B = JSON.parse(fs.readFileSync(o.budgets || path.join(__dirname, "scroll-pass.budgets.json"), "utf8"));
  const phase = o.phase != null ? +o.phase : B.phase;
  const out = path.resolve(o.out || path.join(process.env.TMPDIR || os.tmpdir(), "scroll-pass", stamp()));
  const rel = path.relative(REPO, out);
  if (!rel.startsWith("..") && !path.isAbsolute(rel)) {
    throw new Error(`--out ${out} is inside the repo; harness output stays outside it (copy the chosen evidence in by hand)`);
  }
  fs.mkdirSync(out, { recursive: true });
  const runs = o.noPasses ? [] : plan(o);
  const probes = !o.probes ? [] : o.probes === "all" ? PROBE_NAMES : o.probes.split(",").map((p) => p.trim());
  for (const p of probes) if (!PROBES[p]) throw new Error(`unknown probe ${p}`);
  const server = await serve(o);
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch({ proxy: proxy ? { server: proxy, bypass: "localhost,127.0.0.1" } : undefined });
  const all = { version: browser.version(), runs: [], probes: [], static: [] };
  try {
    const jobs = Math.max(1, +(o.jobs || 3));
    const queue = runs.filter((r) => r.mode !== "iphone"), alone = runs.filter((r) => r.mode === "iphone");
    const done = async (res) => {
      res.budgets = budgets(res, B, phase, o);
      verdict(res);
      res.contact = await contactSheet(browser, res, out);
      all.runs.push(res);
      console.log(line(res));
    };
    await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, async () => {
      while (queue.length) await done(await pass(browser, queue.shift(), o, B, out));
    }));
    for (const r of alone) await done(await pass(browser, r, o, B, out));
    all.runs.sort((a, b) => runs.indexOf(runs.find((r) => r.id === a.id)) - runs.indexOf(runs.find((r) => r.id === b.id)));
    if (runs.length) {
      const ctx = await browser.newContext();
      all.static = await staticChecks(ctx.request, o, B, phase, [...new Set(runs.map((r) => r.page))]);
      await ctx.close();
      for (const x of all.static) console.log(`${x.status === "pass" ? "PASS" : x.status === "due" ? "DUE " : x.status.toUpperCase()} ${x.page} ${x.id} ${x.value} (limit ${x.limit})`);
    }
    for (const name of probes) {
      const p = await runProbe(browser, name, o, B, phase, out);
      all.probes.push(p);
      console.log(`${p.result.padEnd(4)} probe ${name}${p.skip ? ` (${p.skip})` : ""} · ${p.checks.filter((c) => c.ok).length}/${p.checks.length} checks${p.checks.filter((c) => !c.ok).map((c) => `\n       ✗ ${c.what}${due(c.from, phase) ? "" : ` (due Phase ${c.from})`}: ${c.detail}`).join("")}`);
    }
  } finally {
    await browser.close();
    if (server) server.kill();
  }
  const failed = all.runs.some((r) => r.result === "FAIL") || all.probes.some((p) => p.result === "FAIL") || all.static.some((x) => x.status === "fail");
  all.result = failed ? "FAIL" : all.runs.some((r) => r.result === "WARN") ? "WARN" : "PASS";
  fs.writeFileSync(path.join(out, "report.json"), JSON.stringify({ options: o, phase, ...all }, null, 1));
  fs.writeFileSync(path.join(out, "report.md"), report(all, o, phase, out));
  console.log(`${all.result}: report ${path.join(out, "report.md")}`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e) => { console.error(e && e.stack || e); process.exitCode = 2; });
