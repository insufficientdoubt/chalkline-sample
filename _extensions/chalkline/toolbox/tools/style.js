/*
  Slide style: change how the deck's styled slides look (the ones with {.styled kind="..."} on their
  heading, see slide-style/slide-style.lua) while their words stay the same: the languages shown and
  which is large, the look, the colours, and for each kind of slide its layout. Only in a deck that
  has styled slides, and only in the teacher site.

  Changes apply to every styled slide at once (a control for another kind of slide is hidden
  until you get to that slide, and applies there). They are remembered in this browser, for this deck. The
  deck's file is not changed: Copy settings puts the current slide's settings on the clipboard,
  to paste onto its heading. Reset goes back to what the file says.

  A slide written in one language only has nothing to switch, so Languages and Large language are
  greyed out when it is showing. The colour schemes are the built-in five, plus any the deck's own
  CSS adds (named under slide-style: schemes: in the deck's labels; they are listed as "Your own CSS").
*/
(function () {
  const T = window.ChalklineToolbox;
  const SECTIONS = function () { return [].slice.call(document.querySelectorAll("section.ss")); };
  if (!SECTIONS().length) return;   // a deck with no styled slides has no use for this

  const cfgEl = document.getElementById("slide-style-config");
  let CONFIG = { schemes: ["brand", "ink", "mono", "dusk", "warm"], own: [] };
  try { if (cfgEl) CONFIG = JSON.parse(cfgEl.textContent); } catch (e) { /* use the defaults */ }

  const cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  const label = function (s) { return cap(s); };
  const KEY = "style:" + location.pathname;
  const DS = function (k) { return "ss" + cap(k); };   // data-ss-look is dataset.ssLook

  // What the file says, kept to go back to
  const original = new Map();
  SECTIONS().forEach(function (s) {
    const o = {};
    ["type", "look", "scheme", "primary", "show", "img", "flow", "pic", "count"].forEach(function (k) { o[k] = s.dataset[DS(k)]; });
    original.set(s, o);
  });

  // The controls: [setting, name, kind it belongs to (or null for all), choices]
  const GROUPS = [
    ["show", "Languages", null, [["both", "Both"], ["en", "English"], ["zh", "中文"]], true],
    ["primary", "Large language", null, [["en", "English"], ["zh", "中文"]], true],
    ["look", "Look", null, [["plain", "Plain"], ["game", "Game"], ["brutal", "Brutal"]]],
    ["scheme", "Colours", null, CONFIG.schemes.map(function (n) { return [n, label(n)]; })],
    ["type", "Layout", "cards", [["row", "Row"], ["grid", "Grid"], ["table", "Table"]]],
    ["img", "Pictures", "cards", [["none", "None"], ["thumb", "Thumb"], ["banner", "Banner"], ["frame", "Frame"], ["duotone", "Duotone"], ["bg", "Background"]]],
    ["flow", "Translation", "narrative", [["interleave", "Under each other"], ["side", "Side by side"]]],
    ["pic", "Picture", "narrative", [["none", "None"], ["side", "Side"], ["top", "Top strip"]]],
  ];
  if (CONFIG.own && CONFIG.own.length) {
    GROUPS.splice(4, 0, ["scheme", "Your own CSS", null, CONFIG.own.map(function (n) { return [n, label(n)]; })]);
  }

  // ---------- applying ----------
  let state = T.load(KEY, {});   // setting -> value, for everything the teacher has changed

  function paint(section) {
    if (window.ChalklineSlideStyle) ChalklineSlideStyle.paintBackground(section);
  }
  function setItems(section, n) {
    const cards = [].slice.call(section.querySelectorAll(".ss-card"));
    n = Math.max(1, Math.min(n, cards.length));
    cards.forEach(function (c, i) { c.classList.toggle("ss-off", i >= n); });
    section.dataset.ssCount = String(Math.min(n, 9));
  }
  function applyOne(section, k, v) {
    if (k === "items") { if (section.classList.contains("ss-cards")) setItems(section, +v); return; }
    // a slide in one language keeps showing it
    if ((k === "show" || k === "primary") && section.dataset.ssLangs !== "both") return;
    section.dataset[DS(k)] = v;
  }
  function applyAll() {
    SECTIONS().forEach(function (s) {
      Object.keys(state).forEach(function (k) { applyOne(s, k, state[k]); });
      paint(s);
    });
  }
  function set(k, v) {
    state[k] = v;
    T.save(KEY, state);
    applyAll();
    T.changed("style");
  }
  function reset() {
    state = {};
    try { localStorage.removeItem("chalkline-tools:" + KEY); } catch (e) { /* private window */ }
    original.forEach(function (o, s) {
      Object.keys(o).forEach(function (k) { if (o[k] != null) s.dataset[DS(k)] = o[k]; });
      s.querySelectorAll(".ss-off").forEach(function (c) { c.classList.remove("ss-off"); });
      if (s.classList.contains("ss-cards") && s.dataset.ssItemsFile) setItems(s, +s.dataset.ssItemsFile);
      paint(s);
    });
    T.changed("style");
  }
  // What the file asks for: cards beyond data-ss-count were hidden by the filter (items="5")
  SECTIONS().forEach(function (s) {
    if (s.classList.contains("ss-cards")) s.dataset.ssItemsFile = s.dataset.ssCount;
  });

  if (T.active) {
    const go = function () { applyAll(); };
    if (window.Reveal && !Reveal.isReady()) Reveal.on("ready", go); else go();
  }

  // The slide on screen: the first styled slide if it isn't one
  function current() {
    const s = window.Reveal ? Reveal.getCurrentSlide() : null;
    return s && s.classList.contains("ss") ? s : null;
  }
  function value(k) {
    const s = current() || SECTIONS()[0];
    return s ? s.dataset[DS(k)] : null;
  }
  function cardsSlide() { return SECTIONS().filter(function (s) { return s.classList.contains("ss-cards"); })[0]; }

  // The settings of the slide on screen, as they'd be typed on its heading
  function headingAttributes() {
    const s = current() || SECTIONS()[0];
    const kind = ["cards", "narrative", "bigidea"].filter(function (k) { return s.classList.contains("ss-" + k); })[0];
    const keys = { cards: ["type", "look", "scheme", "primary", "show", "img"], narrative: ["look", "scheme", "primary", "show", "flow", "pic"], bigidea: ["look", "scheme", "primary", "show"] }[kind];
    const parts = ['.styled', 'kind="' + kind + '"'].concat(keys.map(function (k) { return k + '="' + s.dataset[DS(k)] + '"'; }));
    if (kind === "cards") parts.push('items="' + s.dataset.ssCount + '"');
    return "{" + parts.join(" ") + "}";
  }

  T.tool("style", { title: "Slide style", icon: "palette", w: 440, h: 540, minW: 340, minH: 300, keys: ["style"] },
    class extends T.ToolElement {
      static css = `
.wrap { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 2px 2px 6px; }
.row { display: flex; flex-direction: column; gap: 4px; transition: opacity .15s; }
.row[hidden] { display: none; }
.row.locked { opacity: .35; pointer-events: none; }
.ui-seg { flex-wrap: wrap; }
.ui-seg > button { font-size: 0.85em; }
.note { margin: 0; font-size: 0.78em; color: var(--ui-muted); line-height: 1.35; }
.slider { display: flex; align-items: center; gap: 10px; }
.slider input { flex: 1; accent-color: var(--ui-accent); }
.slider b { min-width: 1.4em; text-align: right; font-variant-numeric: tabular-nums; }
.foot { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; border-top: 1px solid var(--ui-line); padding-top: 8px; }
.status { font-size: 0.78em; color: var(--ui-muted); }
`;
      build(root) {
        const h = T.h, self = this;
        this.rows = {};
        this.btns = {};
        const wrap = h("div", { class: "wrap" });
        this.where = h("p", { class: "note" });
        wrap.append(this.where);
        GROUPS.forEach(function (g) {
          const k = g[0], seg = h("div", { class: "ui-seg", role: "group", "aria-label": g[1] });
          const row = h("div", { class: "row" }, h("div", { class: "ui-label", text: g[1] }), seg);
          g[3].forEach(function (c) {
            const b = h("button", { type: "button", text: c[1], "data-k": k, "data-v": c[0], onclick: function () { set(k, c[0]); } });
            seg.append(b);
            (self.btns[k + ":" + c[0]] = b);
          });
          row._g = g;
          self.rows[g[1]] = row;
          wrap.append(row);
          if (g[1] === "Large language") self.langNote = null;
          if (g[1] === "Layout") {   // the number of cards sits right under the layout
            self.slider = h("input", { type: "range", min: 1, max: 9, "aria-label": "Number of cards", oninput: function () { set("items", +self.slider.value); } });
            self.count = h("b");
            self.itemsRow = h("div", { class: "row" }, h("div", { class: "ui-label", text: "Cards shown" }), h("div", { class: "slider" }, self.slider, self.count));
            self.itemsRow._kind = "cards";
            wrap.append(self.itemsRow);
          }
        });
        this.status = h("span", { class: "status" });
        const foot = h("div", { class: "foot" },
          h("button", { class: "ui-btn ui-small", type: "button", text: "Copy settings", onclick: function () {
            const txt = headingAttributes();
            const done = function () { self.status.textContent = "Copied. Paste it on the slide's heading."; setTimeout(function () { self.status.textContent = ""; }, 2500); };
            try { navigator.clipboard.writeText(txt).then(done, function () { self.status.textContent = txt; }); } catch (e) { self.status.textContent = txt; }
          } }),
          T.sureButton("Reset", reset, "ui-btn ui-small"),
          this.status);
        root.append(wrap, foot);
        this.onSlide = function () { self.paint(); };
        if (window.Reveal) { Reveal.on("slidechanged", this.onSlide); }
        this.paint();
      }
      paint() {
        const cur = current();
        const kind = cur ? ["cards", "narrative", "bigidea"].filter(function (k) { return cur.classList.contains("ss-" + k); })[0] : null;
        const langs = (cur || SECTIONS()[0]).dataset.ssLangs;
        const self = this;
        this.where.textContent = cur
          ? "Changes apply to every styled slide. Only this slide's own controls are shown."
          : "Go to a styled slide to see what you change. Changes apply to every styled slide.";
        GROUPS.forEach(function (g) {
          const row = self.rows[g[1]], k = g[0];
          row.hidden = !!(g[2] && kind && g[2] !== kind);   // another kind of slide's control: still applies when you get there
          row.classList.toggle("locked", !!(g[4] && langs !== "both"));
          g[3].forEach(function (c) { self.btns[k + ":" + c[0]].classList.toggle("ui-on", value(k) === c[0]); });
        });
        const cs = cardsSlide();
        this.itemsRow.hidden = !!(kind && kind !== "cards");
        if (cs) {
          const max = cs.querySelectorAll(".ss-card").length;
          this.slider.max = max;
          this.slider.value = cs.dataset.ssCount;
          this.count.textContent = cs.dataset.ssCount;
        }
        this.rows["Languages"].title = langs !== "both" ? "This slide is written in one language only" : "";
      }
      refresh() { this.paint(); }
      close() { if (window.Reveal && this.onSlide) Reveal.off("slidechanged", this.onSlide); }
    });
})();
