/* The app gallery (redesign SPEC §6.6): previous and next buttons for the
   track of screenshots.

   - They show only when the track overflows on a device that hovers. On touch,
     without JS, or where all five shots fit (1440), the track simply scrolls.
   - A press moves one shot; the track's scroll-snap lines it up. A button is
     disabled at its end, and if it had the focus the other button takes it.
   - The track is a focusable scroller, so the arrow keys scroll it natively. */
(function () {
  "use strict";
  var doc = document, root = doc.getElementById("app");
  var track = root && root.querySelector(".gallery__track"), nav = root && root.querySelector(".gallery__nav");
  if (!track || !nav) return;
  var buttons = nav.querySelectorAll("button"), prev = buttons[0], next = buttons[1];
  var hover = matchMedia("(hover: hover)"), reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var queued = 0;

  function step() {
    var items = track.children;
    return items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth;
  }
  function set(button, off, other) {
    if (button.disabled === off) return;
    if (off && doc.activeElement === button) other.focus();
    button.disabled = off;
  }
  function update() {
    queued = 0;
    var max = track.scrollWidth - track.clientWidth;
    nav.hidden = !(max > 1 && hover.matches);
    set(prev, track.scrollLeft <= 1, next);
    set(next, track.scrollLeft >= max - 1, prev);
  }
  function soon() { if (!queued) queued = requestAnimationFrame(update); }

  nav.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || b.disabled) return;
    track.scrollBy({ left: step() * parseFloat(b.getAttribute("data-step")), behavior: reduce.matches ? "auto" : "smooth" });
  });
  track.addEventListener("scroll", soon, { passive: true });
  addEventListener("resize", soon);
  if (hover.addEventListener) hover.addEventListener("change", soon);
  update();
})();
