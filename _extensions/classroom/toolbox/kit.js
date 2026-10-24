/*
  The classroom tools' shared kit: what every tool uses, and the way to build a tool on its own.
  Loaded before the tools (tools/*.js) and the toolbox (toolbox.js), which read it as
  window.ChalklineToolbox.

    load(key, fallback), save(key, value)   settings and scores, in this browser only
    changed(key)                            after saving: the other open tools that show it redraw
    h(tag, attrs, ...children)              a tiny element builder
    icon(name)                              a line icon (ui/icons.js)
    beep(...), sureButton(label, action), COLORS
    course(), unitMenu(...)                 the course's units, packets and words; a unit menu
    active                                  false in speaker view, the PDF export and pop-ups: no tools there
    ToolElement                             the base for a tool built as a web component (below)
    tools                                   the tools in their own files, by id: the toolbox adds them to its menu

  A tool in its own file is a web component: its own tag (<ct-stopwatch>) with its own styles inside
  it (a shadow root), so the slides' styles can't change it and its styles can't leak out. It looks
  like this:

    ChalklineToolbox.tool("stopwatch", { title, icon, w, h, minW, minH, keys, free },
      class extends ChalklineToolbox.ToolElement {
        static css = `...`;                 // its styles; kit's button styles (.ct-btn) come with it
        build(root) { ... }                 // draws it into root
        refresh() { ... }                   // a saved setting in keys changed (another deck): redraw
        close() { ... }                     // tidy up: stop timers
      });

  free: true means the tool draws its own card (the traffic light is its dark case), so the toolbox
  leaves out the white card around it. Inside, this.panel is the tool's panel and this.grow(dh)
  makes it taller (or shorter).

  static shadow = false: no shadow root, for a tool that hosts another library's player or viewer
  (YouTube, the PDF viewer), which expects to be in the page. Its css goes on the page instead, so
  every rule must start with the tool's own class names (.ct-music-…).
*/
(function () {
  const PREFIX = "chalkline-tools:";

  function load(key, fallback) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* private window */ }
  }
  function changed(key) { window.dispatchEvent(new CustomEvent("chalkline-tools-changed", { detail: key })); }

  // Speaker view previews, the slide PDF export and a deck shown inside another page (a quick
  // reference pop-up) get no tools: the tools belong to the deck you're presenting.
  const active = !/[?&](receiver|print-pdf)/.test(location.search) && window.self === window.top;

  // A line icon (ui/icons.js, Lucide). The tools' controls use these; the voice levels keep
  // their emoji, which are pictures for the students.
  function icon(name) {
    return window.ChalklineIcons ? ChalklineIcons.el(name) : document.createTextNode("");
  }

  // Tiny element builder: h("div", {class: "x", onclick: fn}, child, "text", ...)
  function h(tag, attrs) {
    const el = document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "text") el.textContent = v;
      else if (k === "style") el.style.cssText = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (let i = 2; i < arguments.length; i++) {
      const c = arguments[i];
      if (c != null && c !== false) el.append(c);
    }
    return el;
  }

  function beep(freq, length, volume, type, delay) {
    try {
      const ctx = beep.ctx || (beep.ctx = new (window.AudioContext || window.webkitAudioContext)());
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + (delay || 0);
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(volume || 0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + length);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + length);
    } catch (e) { /* no sound available */ }
  }

  // A button that needs a second tap within 3 seconds ("Reset" → "Sure?").
  function sureButton(label, action, cls) {
    let armed = null;
    const b = h("button", { class: cls || "ct-btn", text: label, onclick: function () {
      if (armed) { clearTimeout(armed); armed = null; b.textContent = label; b.classList.remove("ct-armed"); action(); return; }
      b.textContent = "Sure?"; b.classList.add("ct-armed");
      armed = setTimeout(function () { armed = null; b.textContent = label; b.classList.remove("ct-armed"); }, 3000);
    } });
    return b;
  }

  const COLORS = ["#0087ff", "#ff8c0f", "#2e9e4f", "#7b4fc9", "#C8372D", "#1a9e9e", "#d6458f", "#003477"];

  // The course's units, packets and vocab words (filter.lua puts them in each teacher deck as JSON)
  let courseData;
  function course() {
    if (courseData === undefined) {
      const el = document.getElementById("chalkline-course");
      try { courseData = el ? JSON.parse(el.textContent) : null; } catch (e) { courseData = null; }
    }
    return courseData;
  }
  // A unit menu for Vocab and Packet: starts on this deck's unit
  function unitMenu(units, value, extra, onchange) {
    const pick = h("select", { class: "ct-pick", "aria-label": "Unit", onchange: function () { onchange(pick.value); } });
    units.forEach(function (u) { pick.append(h("option", { value: u.id, text: u.title })); });
    if (extra) pick.append(h("option", { value: extra[0], text: extra[1] }));
    pick.value = value;
    return h("label", { class: "ct-pick-box" }, pick, h("span", { class: "ct-pick-arrow" }, icon("chevron-down")));
  }

  // The styles every tool shares: icons and buttons. On the page (for the tools that aren't web
  // components yet) and inside each web component.
  const KIT_CSS = `
.ui-icon { display: inline-flex; flex: none; width: 1em; height: 1em; vertical-align: -0.125em; }
.ui-icon svg { width: 100%; height: 100%; }
.ct-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.35em;
  min-height: 2.1em; padding: 0.25em 1em;
  border: 0; border-radius: 999px;
  background: var(--ui-soft, #f3f5f8); color: var(--ui-ink, #10233f);
  font: inherit; font-weight: 600 !important; cursor: pointer;
  transition: background 0.12s, transform 0.06s;
}
.ct-btn:hover { background: #e6ebf1; }
.ct-btn:active { transform: scale(0.97); }
.ct-btn.ct-primary { background: var(--ui-accent, #003477); color: #fff; }
.ct-btn.ct-primary:hover { background: var(--ui-accent-hover, #0a4389); }
.ct-btn.ct-small { min-height: 1.8em; padding: 0.1em 0.75em; }
.ct-btn.ct-armed { background: #C8372D; color: #fff; }
.ct-btn:disabled { opacity: 0.45; cursor: default; transform: none; }
/* A tool without a shadow root (Music, Vocab, Packet) fills its panel like the others */
.ct-tool { flex: 1; min-height: 0; display: flex; flex-direction: column; }
/* A row of buttons, sized to the tool */
.ct-foot {
  flex: none; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px;
  padding-top: 8px; font-size: clamp(14px, 6.5cqmin, 24px);
}
/* Fields and menus */
.ct-input {
  padding: 8px 12px; border: 1px solid var(--ui-line, #d6dee8); border-radius: 10px;
  background: var(--ui-soft, #f3f5f8); color: var(--ui-ink, #10233f); font: inherit; font-size: 16px;
}
.ct-input:focus { outline: none; border-color: var(--ui-focus, #0087ff); background: #fff; box-shadow: 0 0 0 3px var(--ui-focus-soft, #eaf4ff); }
.ct-pick-box { position: relative; display: block; flex: none; }
.ct-pick {
  width: 100%; min-width: 0; height: 36px; padding: 0 30px 0 12px;
  border: 1px solid var(--ui-line, #d6dee8); border-radius: 10px; background: var(--ui-soft, #f3f5f8);
  color: var(--ui-ink, #10233f); font-family: inherit; font-size: 15px; font-weight: 600; appearance: none; -webkit-appearance: none; cursor: pointer;
}
.ct-pick:hover { border-color: var(--ui-line-strong, #aebdd0); }
.ct-pick:focus-visible { outline: 2px solid var(--ui-focus, #0087ff); outline-offset: 1px; }
.ct-pick-arrow { position: absolute; right: 10px; top: 50%; display: inline-flex; color: var(--ui-muted, #5b6b80); font-size: 16px; transform: translateY(-50%); pointer-events: none; }
.ct-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 10px; color: var(--ui-muted, #5b6b80); text-align: center; font-size: 15px; }
.ct-empty p { margin: 0; }
`;
  // Inside a web component only: a clean start (form controls take the tool's font)
  const SHADOW_CSS = `
:host { flex: 1; min-height: 0; display: flex; flex-direction: column; container-type: size; }
*, *::before, *::after { box-sizing: border-box; }
button, input, select, textarea { font: inherit; color: inherit; }
`;
  const kitSheet = new CSSStyleSheet();
  kitSheet.replaceSync(KIT_CSS);
  document.adoptedStyleSheets = document.adoptedStyleSheets.concat(kitSheet);
  const shadowSheet = new CSSStyleSheet();
  shadowSheet.replaceSync(SHADOW_CSS);

  // The base for a tool built as a web component.
  class ToolElement extends HTMLElement {
    connectedCallback() {
      if (this.built) return;
      this.built = true;
      const C = this.constructor;
      if (C.css && !C.sheet) {
        C.sheet = new CSSStyleSheet();
        C.sheet.replaceSync(C.css);
        if (C.shadow === false) document.adoptedStyleSheets = document.adoptedStyleSheets.concat(C.sheet);
      }
      if (C.shadow === false) { this.classList.add("ct-tool"); this.build(this); return; }
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [kitSheet, shadowSheet].concat(C.sheet ? [C.sheet] : []);
      // Typing in a field stays in the field: the slides see only this element, not the field
      // inside it, so they would take W or the arrow keys as their own.
      this.shadowRoot.addEventListener("keydown", function (e) {
        if (e.composedPath()[0].matches("input, textarea, select")) e.stopPropagation();
      });
      this.build(this.shadowRoot);
    }
    build() {}
    refresh() {}
    close() {}
  }

  const tools = {};
  function tool(id, def, element) {
    const tag = "ct-" + id;
    if (!customElements.get(tag)) customElements.define(tag, element);
    tools[id] = Object.assign({ element: tag, keys: [] }, def);
  }

  window.ChalklineToolbox = { load, save, changed, h, icon, beep, sureButton, COLORS, course, unitMenu, active, ToolElement, tools, tool };
})();
