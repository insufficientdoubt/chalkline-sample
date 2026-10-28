/*
  Slide style, in the browser (every deck with a styled slide, student site too):
    - click a card or a paragraph to select it: it takes the scheme's highlight colour and grows a little.
      Click it again, click the slide, or press Esc to clear. Tab and Enter (or Space) work too.
    - the slide's colour fills the whole screen, not just the 1280 x 720 box, and follows a scheme change.
  The settings themselves (data-ss-*) come from the deck's file; the Slide style tool in the
  teacher's toolbox (toolbox/tools/style.js) changes them live.
*/
(function () {
  var SEL = ".ss-card, .ss-narr > p";
  function items(root) { return [].slice.call(root.querySelectorAll(SEL)); }
  function clear(root, except) {
    items(root).forEach(function (it) {
      if (it !== except && it.classList.contains("ss-selected")) { it.classList.remove("ss-selected"); it.setAttribute("aria-pressed", "false"); }
    });
  }
  function toggle(it) {
    var root = it.closest("section.ss");
    var on = !it.classList.contains("ss-selected");
    clear(root, it);
    it.classList.toggle("ss-selected", on);
    it.setAttribute("aria-pressed", on ? "true" : "false");
  }
  function wire(slide) {
    items(slide).forEach(function (it) { it.setAttribute("tabindex", "0"); it.setAttribute("role", "button"); it.setAttribute("aria-pressed", "false"); });
    slide.addEventListener("click", function (e) {
      var it = e.target.closest(SEL);
      if (it && slide.contains(it)) toggle(it); else clear(slide);
    });
    slide.addEventListener("keydown", function (e) {
      var it = e.target.closest ? e.target.closest(SEL) : null;
      if ((e.key === "Enter" || e.key === " ") && it) { e.preventDefault(); e.stopPropagation(); toggle(it); }
      else if (e.key === "Escape" && slide.querySelector(".ss-selected")) { e.stopPropagation(); clear(slide); }
    });
  }

  // reveal.js draws each slide's background in its own layer, over the whole screen
  function paintBackground(slide) {
    if (!window.Reveal || !Reveal.getSlideBackground) return;
    var bg = Reveal.getSlideBackground(slide);
    if (bg) bg.style.background = getComputedStyle(slide).getPropertyValue("--bg").trim();
  }
  window.ChalklineSlideStyle = { paintBackground: paintBackground, clear: clear };

  function start() {
    [].forEach.call(document.querySelectorAll("section.ss"), function (s) { wire(s); paintBackground(s); });
  }
  if (window.Reveal && Reveal.isReady && Reveal.isReady()) start();
  else if (window.Reveal) Reveal.on("ready", start);
  else document.addEventListener("DOMContentLoaded", start);
  if (window.Reveal) Reveal.on("slidechanged", function (e) { if (e.previousSlide) clear(e.previousSlide); });
})();
