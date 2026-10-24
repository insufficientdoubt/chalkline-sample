/*
  Clock: the time, on a small white pill. Open in every deck unless you close it (or press K);
  clock: false in a deck's labels leaves it closed there. It starts off the slide, so it covers
  nothing: in the space beside the slide (left, above the menu buttons; or right, under the slide
  number) when there's room; if not, the top-right corner. It moves with the screen until it's dragged.
*/
(function () {
  const T = window.ChalklineToolbox;

  T.tool("clock", { title: "Clock", icon: "clock", w: 128, h: 52, minW: 96, minH: 40, free: true,
    start: function () {
      const r = (document.querySelector(".reveal .slides") || document.body).getBoundingClientRect();
      const W = window.innerWidth, H = window.innerHeight, w = 128, h = 52;
      const left = Math.max(r.left, 0), right = W - Math.min(r.right, W);
      if (left >= w + 12) return { x: Math.round((left - w) / 2), y: H - h - 56 };
      if (right >= w + 12) return { x: Math.round(Math.min(r.right, W) + (right - w) / 2), y: 40 };
      return { x: W - w - 8, y: 36 };
    },
    // A clock still where an earlier version put it (bottom left, over the slide) moves too.
    oldDefault: function (p) { return (p.x === 96 || p.x === 172) && p.w === 150 && p.h === 58; },
  }, class extends T.ToolElement {
    static css = `
.pill {
  flex: 1; display: grid; place-items: center; border-radius: 999px; background: var(--ui-surface); color: var(--ui-ink);
  box-shadow: var(--ui-shadow-float);
  font-size: min(52cqh, 24cqw); font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1; white-space: nowrap;
}
`;
    build(root) {
      const self = this;
      this.pill = T.h("div", { class: "pill" });
      root.append(this.pill);
      this.tick();
      this.timer = setInterval(function () { self.tick(); }, 1000);
    }
    tick() { this.pill.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }   // the computer's 12- or 24-hour setting
    close() { clearInterval(this.timer); }
  });
})();
