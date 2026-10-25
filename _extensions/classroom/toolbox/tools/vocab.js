/*
  Vocab: the unit's words in a sidebar at the right edge (] opens and closes it), as a clean list
  to point at; tap one for its card beside the list: picture, word, 中文, meaning and an example, with 🔊 to read it aloud. Starts on this deck's
  unit; the menu picks another, or all of them. The words come from vocab/data/vocab.csv.
  No shadow root: the word card opens on the tools' layer, beside the list.
*/
(function () {
  const T = window.ChalklineToolbox;
  const { load, save, h, icon, course, unitMenu } = T;

  function build(body, panel) {
    const data = course();
    if (!data || !data.words.length) { body.append(h("div", { class: "ui-empty", text: "This course has no vocab list yet." })); return {}; }
    const inUnit = function (w, u) { return (w.units || []).indexOf(u.number) >= 0; };
    const units = data.units.filter(function (u) { return data.words.some(function (w) { return inUnit(w, u); }); });
    let unit = units.some(function (u) { return u.id === data.unit; }) ? data.unit : "all";
    const list = h("div", { class: "ct-vocab-list ct-nodrag" }), count = h("div", { class: "ct-vocab-count" });
    body.append(unitMenu(units, unit, ["all", "All units"], function (v) { unit = v; hideCard(); paint(); }), count, list);
    let card = null, current = null;

    function paint() {
      list.textContent = "";
      const u = units.find(function (x) { return x.id === unit; });
      const words = data.words.filter(function (w) { return !u || inUnit(w, u); });
      count.textContent = words.length + (words.length === 1 ? " word" : " words");
      words.forEach(function (w) {
        const b = h("button", { class: "ct-vocab-word", text: w.term, onclick: function () { if (current === w) hideCard(); else showCard(w, b); } });
        list.append(b);
      });
    }
    function say(text, lang) {
      return h("button", { class: "ct-say", "aria-label": "Read it aloud", title: "Read it aloud", onclick: function () {
        const s = window.speechSynthesis;
        if (!s) return;
        s.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang; u.rate = 0.9;
        s.speak(u);
      } }, icon("volume-2"));
    }
    function showCard(w, button) {
      hideCard();
      current = w;
      button.classList.add("ct-on");
      card = h("div", { class: "ct-vcard", role: "dialog", "aria-label": w.term },
        h("button", { class: "ct-ctrl ct-close", "aria-label": "Close", title: "Close (Esc)", onclick: hideCard }, icon("x")),
        w.image ? h("div", { class: "ct-vcard-pic" }, h("img", { src: data.root + w.image, alt: "" })) : null,
        h("div", { class: "ct-vcard-text" },
          h("div", { class: "ct-vcard-term" }, h("span", { text: w.term }), say(w.term, "en-US")),
          w.zh ? h("div", { class: "ct-vcard-zh" }, h("span", { text: w.zh }), say(w.zh, "zh-CN")) : null,
          h("div", { class: "ct-vcard-def", text: w.def }),
          w.example ? h("div", { class: "ct-vcard-ex", text: w.example }) : null,
          w.url ? h("a", { class: "ct-vcard-link", href: data.root + w.url, target: "_blank", rel: "noopener" }, "In the vocab app", icon("arrow-up-right")) : null));
      card.style.zIndex = 99990;   // over the tools, under the toolbox menu
      document.getElementById("ct-layer").append(card);
      // beside the list, on the side with room, level with the word
      const p = panel.getBoundingClientRect(), b = button.getBoundingClientRect(), c = card.getBoundingClientRect();
      const x = p.left >= c.width + 16 ? p.left - c.width - 8 : Math.min(p.right + 8, window.innerWidth - c.width - 8);
      card.style.left = Math.max(8, x) + "px";
      card.style.top = Math.max(8, Math.min(b.top - 24, window.innerHeight - c.height - 8)) + "px";
    }
    function hideCard() {
      if (card) card.remove();
      card = current = null;
      list.querySelectorAll(".ct-on").forEach(function (x) { x.classList.remove("ct-on"); });
    }
    function esc(e) { if (e.key === "Escape" && card) { e.preventDefault(); e.stopImmediatePropagation(); hideCard(); } }
    window.addEventListener("keydown", esc, true);
    paint();
    return { close: function () { hideCard(); window.removeEventListener("keydown", esc, true); } };
  }

  T.tool("vocab", {
    title: "Vocab", icon: "book-a", w: 230, minW: 170, maxW: 380, keys: [],
    // A sidebar at the right edge; the slides move over to make room. ] opens and closes it.
    dock: "right", key: { keyCode: 221, key: "]" },
  }, class extends T.ToolElement {
    static shadow = false;
    static css = `
/* A sidebar: the unit menu, the count and the words, edge to edge */
.ct-body.ct-vocab { padding: 10px 0 0; }
ct-vocab { gap: 8px; }
ct-vocab > .ui-select { margin: 0 10px; }
.ct-vocab-count {
  flex: none; padding: 4px 16px 6px; border-bottom: 1px solid var(--ui-line);
  color: var(--ui-muted); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
}
/* The words: a plain list with thin lines between, big enough to read from across the room */
.ct-vocab-list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; padding-bottom: 14px; }
.ct-vocab-word {
  position: relative; flex: none; padding: 9px 16px; border: 0; border-bottom: 1px solid #eef1f5; border-radius: 0; background: transparent;
  color: var(--ui-ink); text-align: left; font-size: clamp(16px, 9cqw, 24px) !important; font-weight: 600 !important; line-height: 1.2; cursor: pointer;
  transition: background 0.1s, color 0.1s;
}
.ct-vocab-word:hover { background: var(--ui-soft); }
.ct-vocab-word.ct-on { background: var(--ui-accent-soft); color: var(--ui-accent); }
.ct-vocab-word.ct-on::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--ui-accent); }
/* The word's card, beside the list */
.ct-vcard {
  position: fixed; width: 380px; max-height: calc(100vh - 16px); overflow: auto; padding: 10px;
  border-radius: 18px; background: #fff; color: var(--ui-ink); pointer-events: auto;
  box-shadow: var(--ui-shadow-pop);
  font-family: "Source Sans 3", system-ui, -apple-system, "PingFang SC", sans-serif;
}
.ct-vcard > .ct-close { position: absolute; top: 16px; right: 16px; z-index: 1; }
.ct-vcard-pic { display: grid; place-items: center; height: 210px; border-radius: 12px; background: var(--ui-soft); overflow: hidden; }
.ct-vcard-pic img { display: block; width: 100%; height: 100%; object-fit: contain; }
.ct-vcard-text { padding: 12px 8px 6px; }
.ct-vcard-term { display: flex; align-items: center; gap: 8px; font-size: 32px; font-weight: 700; line-height: 1.1; color: var(--ui-ink); }
.ct-vcard-zh { display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 22px; color: var(--ui-muted); }
.ct-vcard-def { margin-top: 12px; font-size: 19px; line-height: 1.4; }
.ct-vcard-ex { margin-top: 8px; padding-left: 10px; border-left: 3px solid var(--ui-line); color: var(--ui-muted); font-size: 16px; line-height: 1.4; font-style: italic; }
.ct-vcard-link { display: inline-flex; align-items: center; gap: 3px; margin-top: 14px; color: var(--ui-focus); font-size: 14px; font-weight: 600; text-decoration: none; }
.ct-vcard-link:hover { text-decoration: underline; }
.ct-say {
  flex: none; display: inline-grid; place-items: center; width: 30px; height: 30px; padding: 0; border: 0; border-radius: 50%;
  background: var(--ui-accent-soft); color: var(--ui-accent); font-size: 16px !important; cursor: pointer; transition: background 0.1s;
}
.ct-say:hover { background: #d3e0f1; }
.ct-vcard-zh .ct-say { width: 26px; height: 26px; background: var(--ui-soft); font-size: 14px !important; color: var(--ui-muted); }
`;
    build(root) { this.api = build(root, this.panel) || {}; }
    refresh() { if (this.api.refresh) this.api.refresh(); }
    close() { if (this.api.close) this.api.close(); }
  });
})();
