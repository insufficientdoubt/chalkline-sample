// PDF viewer: draws PDFs with pdf.js into the boxes that the pdf-viewer shortcode leaves
// (see pdf-viewer.lua). Three parts:
//   Viewer   one page at a time, with ‹ › buttons and pens   (layout="viewer")
//   Gallery  every page as a thumbnail                       (layout="gallery")
//   Popup    one big page in a window you can drag and resize; opened from either
// Ink is saved per PDF page in this browser (localStorage) and shows wherever that page is
// shown, until someone presses Clear.

import * as pdfjs from "./pdf.min.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("./pdf.worker.min.mjs", import.meta.url).href;

const PRINT = /print-pdf/i.test(location.search);   // reveal.js print layout (slide PDFs)

// ---- Loading PDFs: each one once, however many viewers show it ----

const docs = new Map();
function loadPdf(url) {
  if (!docs.has(url)) docs.set(url, pdfjs.getDocument({ url, isEvalSupported: false }).promise);
  return docs.get(url);
}

// The box's PDF: the preferred version (data-prefer, e.g. a student copy) if it's there, else data-src
async function openPdf(root) {
  if (root.dataset.prefer) {
    const url = new URL(root.dataset.prefer, document.baseURI).href;
    try { return [url, await loadPdf(url)]; } catch (e) { /* not there: use the usual file */ }
  }
  const url = new URL(root.dataset.src, document.baseURI).href;
  return [url, await loadPdf(url)];
}

// ---- Ink: a list of strokes per PDF page. Points are fractions of the page (0–1), so the
// same ink fits a thumbnail, a slide and the big popup. ----

const PENS = {
  red:   { label: "Red pen",     color: "#d62828", width: 0.004 },
  blue:  { label: "Blue pen",    color: "#1d4ed8", width: 0.004 },
  black: { label: "Black pen",   color: "#111827", width: 0.004 },
  hi:    { label: "Highlighter", color: "#facc15", width: 0.024, alpha: 0.4 },
};
const STORE = "pdf-viewer-ink:";
const inkMemory = new Map();   // works even where localStorage is blocked
const pageViews = new Set();   // every page on screen, to redraw ink drawn somewhere else

const inkKey = (url, n) => STORE + new URL(url).pathname + "#" + n;
function readInk(url, n) {
  const key = inkKey(url, n);
  if (!inkMemory.has(key)) {
    let strokes = [];
    try { strokes = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { /* blocked or bad */ }
    inkMemory.set(key, strokes);
  }
  return inkMemory.get(key);
}
function writeInk(url, n, strokes) {
  const key = inkKey(url, n);
  inkMemory.set(key, strokes);
  try {
    if (strokes.length) localStorage.setItem(key, JSON.stringify(strokes));
    else localStorage.removeItem(key);
  } catch (e) { /* kept in memory only */ }
  for (const view of pageViews) if (view.url === url && view.n === n) view.drawInk();
}

// ---- Icons (simple line drawings, so they match on every computer) ----

const ICONS = {
  prev: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  hand: '<path d="M7 11V6.5a1.5 1.5 0 013 0V11m0-1V4.5a1.5 1.5 0 013 0V10m0 0V5.5a1.5 1.5 0 013 0V11m0 0V8.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-1a7 7 0 01-6-3.4L4 14.5a1.5 1.5 0 012.6-1.5L8 15"/>',
  eraser: '<path d="M4 16l9-9 6 6-7 7H8z"/><path d="M12 20h8"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/>',
  clear: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  big: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
  open: '<path d="M14 4h6v6M20 4L10 14"/><path d="M18 14v6H4V6h6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};
function button(icon, label, onClick, cls = "") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "pdfv-btn " + cls;
  b.title = label;
  b.setAttribute("aria-label", label);
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[icon] || "") + "</svg>";
  b.addEventListener("click", (e) => { e.stopPropagation(); onClick(e); });
  return b;
}
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

// ---- One PDF page on screen: the page itself, with an ink layer on top ----

class PageView {
  constructor(url, getTool) {
    this.url = url;
    this.n = 0;
    this.getTool = getTool;   // () => pen name, "eraser" or null; null = drawing off
    this.el = el("div", "pdfv-page");
    this.pdf = el("canvas", "pdfv-pdf");
    this.ink = el("canvas", "pdfv-ink");
    this.el.append(this.pdf, this.ink);
    pageViews.add(this);
    if (getTool) this.listen();
  }

  // Fit page n into a box of w × h (layout pixels) and draw it sharp at the real screen size.
  async show(doc, n, w, h) {
    this.n = n;
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const fit = Math.max(0.05, Math.min(w / base.width, h / base.height));
    this.w = Math.round(base.width * fit);
    this.h = Math.round(base.height * fit);
    this.el.style.width = this.w + "px";
    this.el.style.height = this.h + "px";
    // reveal.js scales the whole slide, so the page can be bigger on screen than its layout size
    const zoom = (this.el.getBoundingClientRect().width / this.w) || 1;
    const px = Math.min(4, zoom * (window.devicePixelRatio || 1));
    const viewport = page.getViewport({ scale: fit * px });
    for (const c of [this.pdf, this.ink]) {
      c.width = Math.round(viewport.width);
      c.height = Math.round(viewport.height);
    }
    this.drawInk();
    if (this.task) this.task.cancel();
    this.task = page.render({ canvasContext: this.pdf.getContext("2d"), viewport });
    try { await this.task.promise; } catch (e) { if (e.name !== "RenderingCancelledException") throw e; }
  }

  drawInk() {
    const c = this.ink, ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    if (!this.n) return;
    ctx.lineCap = ctx.lineJoin = "round";
    for (const s of readInk(this.url, this.n)) {
      ctx.globalAlpha = s.a || 1;
      ctx.strokeStyle = s.c;
      ctx.lineWidth = Math.max(1, s.w * c.width);
      ctx.beginPath();
      ctx.moveTo(s.p[0] * c.width, s.p[1] * c.height);
      if (s.p.length === 2) ctx.lineTo(s.p[0] * c.width + 0.1, s.p[1] * c.height);   // a dot
      for (let i = 2; i < s.p.length; i += 2) ctx.lineTo(s.p[i] * c.width, s.p[i + 1] * c.height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Where a pointer is on the page, as fractions
  spot(e) {
    const r = this.ink.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  }

  listen() {
    const ink = this.ink;
    let stroke = null, erasing = false, frame = 0;
    const redraw = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; this.drawInk(); }); };
    let last = null;   // where the eraser was a moment ago: a fast swipe skips over lines otherwise
    const erase = (e) => {
      const ratio = this.h / this.w, reach = 0.02;
      const [x, y] = this.spot(e), [x0, y0] = last || [x, y];
      last = [x, y];
      const steps = Math.ceil(Math.hypot(x - x0, (y - y0) * ratio) / reach) || 1;
      const spots = [];
      for (let k = 1; k <= steps; k++) spots.push([x0 + (x - x0) * k / steps, (y0 + (y - y0) * k / steps) * ratio]);
      const strokes = readInk(this.url, this.n);
      const kept = strokes.filter((s) => {
        for (let i = 0; i < s.p.length; i += 2) {   // near any part of the line, not just its points
          const j = Math.max(0, i - 2);
          for (const [ex, ey] of spots) {
            if (nearLine(ex, ey, s.p[j], s.p[j + 1] * ratio, s.p[i], s.p[i + 1] * ratio) < reach + s.w / 2) return false;
          }
        }
        return true;
      });
      if (kept.length !== strokes.length) { inkMemory.set(inkKey(this.url, this.n), kept); redraw(); }
    };
    ink.addEventListener("pointerdown", (e) => {
      const tool = this.getTool();
      if (!tool || !this.n) return;
      e.preventDefault();
      e.stopPropagation();
      ink.setPointerCapture(e.pointerId);
      if (tool === "eraser") { erasing = true; last = null; erase(e); return; }
      const pen = PENS[tool];
      stroke = { c: pen.color, w: pen.width, p: this.spot(e).map((v) => +v.toFixed(4)) };
      if (pen.alpha) stroke.a = pen.alpha;
      readInk(this.url, this.n).push(stroke);
      redraw();
    });
    ink.addEventListener("pointermove", (e) => {
      if (erasing) { erase(e); return; }
      if (!stroke) return;
      for (const ev of (e.getCoalescedEvents ? e.getCoalescedEvents() : [e])) {
        stroke.p.push(...this.spot(ev).map((v) => +v.toFixed(4)));
      }
      redraw();
    });
    const finish = () => {
      if (!stroke && !erasing) return;
      stroke = null;
      erasing = false;
      writeInk(this.url, this.n, readInk(this.url, this.n));
    };
    ink.addEventListener("pointerup", finish);
    ink.addEventListener("pointercancel", finish);
  }
}

// How far point (x, y) is from the line from (ax, ay) to (bx, by)
function nearLine(x, y, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len)) : 0;
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
}

// ---- The pen toolbar (viewer and popup each have one) ----

function penBar(owner) {
  const bar = el("div", "pdfv-pens");
  const buttons = {};
  owner.tool = null;
  const pick = (tool) => {
    owner.tool = owner.tool === tool ? null : tool;   // tap the same pen again: drawing off
    for (const [name, b] of Object.entries(buttons)) b.setAttribute("aria-pressed", String(name === (owner.tool || "hand")));
    owner.root.classList.toggle("pdfv-drawing", !!owner.tool);
  };
  buttons.hand = button("hand", "Drawing off", () => pick(null));
  bar.append(buttons.hand);
  for (const [name, pen] of Object.entries(PENS)) {
    const b = button("", pen.label, () => pick(name), "pdfv-swatch" + (pen.alpha ? " pdfv-hi" : ""));
    b.style.setProperty("--pen", pen.color);
    buttons[name] = b;
    bar.append(b);
  }
  buttons.eraser = button("eraser", "Eraser: rub out a line", () => pick("eraser"));
  bar.append(buttons.eraser,
    button("undo", "Undo the last line", () => {
      const strokes = readInk(owner.url, owner.n);
      if (strokes.length) writeInk(owner.url, owner.n, strokes.slice(0, -1));
    }),
    button("clear", "Clear the ink on this page", () => {
      if (readInk(owner.url, owner.n).length && confirm("Clear all the ink on page " + owner.n + "?")) writeInk(owner.url, owner.n, []);
    }));
  pick(null);
  return bar;
}

function showError(root, title) {
  root.replaceChildren(el("p", "pdfv-error", "This PDF isn't available here: " + title + "."));
}

// ---- Viewer: one page at a time ----

class Viewer {
  constructor(root) {
    this.root = root;
    this.title = root.dataset.title;
    this.n = parseInt(root.dataset.page, 10) || 1;
    this.stage = el("div", "pdfv-stage");
    this.page = new PageView(null, () => this.tool);
    this.stage.append(this.page.el);
    this.prev = button("prev", "Previous page", () => this.go(this.n - 1));
    this.next = button("next", "Next page", () => this.go(this.n + 1));
    this.count = el("span", "pdfv-count");
    const nav = el("div", "pdfv-bar");
    nav.append(this.prev, this.count, this.next, el("span", "pdfv-title", this.title),
      button("big", "Open large", () => popup.open(this.url, this.title, this.n)),
      openLink(() => this.url));
    root.replaceChildren(...(root.dataset.ink === "false" ? [] : [penBar(this)]), this.stage, nav);
  }
  async start() {
    [this.url, this.doc] = await openPdf(this.root);
    this.page.url = this.url;
    await this.go(this.n);
  }
  async go(n) {
    if (!this.doc) return;
    this.n = Math.min(Math.max(1, n), this.doc.numPages);
    this.count.textContent = this.n + " / " + this.doc.numPages;
    this.prev.disabled = this.n === 1;
    this.next.disabled = this.n === this.doc.numPages;
    await this.page.show(this.doc, this.n, this.stage.clientWidth, this.stage.clientHeight);
  }
  refresh() { return this.go(this.n); }
}

function openLink(getUrl) {
  return button("open", "Open the PDF in a new tab", () => window.open(getUrl(), "_blank", "noopener"));
}

// ---- Gallery: every page as a thumbnail ----

class Gallery {
  constructor(root) {
    this.root = root;
    this.title = root.dataset.title;
    this.strip = el("div", "pdfv-strip");
    this.thumbs = [];
    const head = el("div", "pdfv-bar");
    this.count = el("span", "pdfv-count");
    head.append(el("span", "pdfv-title", this.title), this.count, openLink(() => this.url));
    root.replaceChildren(this.strip, head);
  }
  async start() {
    [this.url, this.doc] = await openPdf(this.root);
    const pages = this.doc.numPages;
    this.count.textContent = pages + (pages === 1 ? " page" : " pages") + " · tap one to open it";
    for (let n = 1; n <= pages; n++) {
      const view = new PageView(this.url, null);
      const thumb = el("button", "pdfv-thumb");
      thumb.type = "button";
      thumb.setAttribute("aria-label", "Open page " + n);
      thumb.append(view.el, el("span", "pdfv-num", String(n)));
      thumb.addEventListener("click", () => popup.open(this.url, this.title, n));
      this.strip.append(thumb);
      this.thumbs.push(view);
    }
    await this.refresh();
  }
  async refresh() {
    if (!this.doc) return;
    const h = this.thumbs[0] ? this.thumbs[0].el.parentElement.clientHeight - 28 : 160;
    for (let n = 1; n <= this.thumbs.length; n++) await this.thumbs[n - 1].show(this.doc, n, 1000, h);
  }
}

// ---- Popup: one big page, movable and resizable; arrow keys turn its pages while it's open ----

const popup = {
  build() {
    const root = this.root = el("div", "pdfv-popup");
    root.setAttribute("role", "dialog");
    root.dataset.preventSwipe = "";
    this.title = el("span", "pdfv-title");
    this.count = el("span", "pdfv-count");
    this.prev = button("prev", "Previous page", () => this.go(this.n - 1));
    this.next = button("next", "Next page", () => this.go(this.n + 1));
    const head = el("div", "pdfv-bar pdfv-head");
    head.append(this.title, this.prev, this.count, this.next, button("close", "Close (Esc)", () => this.close()));
    this.stage = el("div", "pdfv-stage");
    this.page = new PageView(null, () => this.tool);
    this.stage.append(this.page.el);
    const grip = el("div", "pdfv-grip");
    grip.title = "Drag to resize";
    root.append(head, penBar(this), this.stage, grip);
    document.body.append(root);

    // drag by the title bar, resize by the corner
    const track = (handle, move) => {
      handle.addEventListener("pointerdown", (e) => {
        if (e.target.closest("button")) return;
        e.preventDefault();
        handle.setPointerCapture(e.pointerId);
        const start = { x: e.clientX, y: e.clientY, r: root.getBoundingClientRect() };
        const onMove = (ev) => move(ev.clientX - start.x, ev.clientY - start.y, start.r);
        const onUp = () => {
          handle.removeEventListener("pointermove", onMove);
          handle.removeEventListener("pointerup", onUp);
          handle.removeEventListener("pointercancel", onUp);
          this.go(this.n);
        };
        handle.addEventListener("pointermove", onMove);
        handle.addEventListener("pointerup", onUp);
        handle.addEventListener("pointercancel", onUp);
      });
    };
    track(head, (dx, dy, r) => {
      root.style.left = Math.min(Math.max(r.left + dx, 60 - r.width), innerWidth - 60) + "px";
      root.style.top = Math.min(Math.max(r.top + dy, 0), innerHeight - 60) + "px";
    });
    let later = 0;
    track(grip, (dx, dy, r) => {
      root.style.width = Math.max(300, r.width + dx) + "px";
      root.style.height = Math.max(320, r.height + dy) + "px";
      clearTimeout(later);
      later = setTimeout(() => this.go(this.n), 150);
    });

    addEventListener("keydown", (e) => {
      if (!this.isOpen) return;
      const step = { ArrowLeft: -1, ArrowUp: -1, PageUp: -1, ArrowRight: 1, ArrowDown: 1, PageDown: 1, " ": 1 }[e.key];
      if (step) this.go(this.n + step);
      else if (e.key === "Escape") this.close();
      else return;
      e.preventDefault();
      e.stopImmediatePropagation();   // reveal.js doesn't change slides meanwhile
    }, true);
  },
  async open(url, title, n) {
    if (!this.root) this.build();
    const root = this.root;
    if (!this.isOpen) {   // large and in the middle each time it opens
      const h = innerHeight * 0.9, w = Math.min(innerWidth * 0.94, h * 0.8);
      Object.assign(root.style, { width: w + "px", height: h + "px", left: (innerWidth - w) / 2 + "px", top: (innerHeight - h) / 2 + "px" });
    }
    // it sits outside the slides, so borrow their font
    root.style.fontFamily = getComputedStyle(document.querySelector(".reveal") || document.body).fontFamily;
    root.classList.add("pdfv-open");
    this.isOpen = true;
    this.url = this.page.url = url;
    this.title.textContent = title;
    this.doc = await loadPdf(url);
    this.go(n);
  },
  close() {
    this.isOpen = false;
    this.root.classList.remove("pdfv-open");
  },
  async go(n) {
    if (!this.doc || !this.isOpen) return;
    this.n = Math.min(Math.max(1, n), this.doc.numPages);
    this.count.textContent = this.n + " / " + this.doc.numPages;
    this.prev.disabled = this.n === 1;
    this.next.disabled = this.n === this.doc.numPages;
    await this.page.show(this.doc, this.n, this.stage.clientWidth, this.stage.clientHeight);
  },
};

// ---- Start each box when it first comes into view (all at once when printing) ----

const started = [];
async function start(root) {
  const part = root.dataset.layout === "gallery" ? new Gallery(root) : new Viewer(root);
  try {
    await part.start();
    started.push(part);
  } catch (e) {
    console.warn("pdf-viewer:", root.dataset.src, e);
    showError(root, part.title);
  }
  root.removeAttribute("data-pending");   // scripts/slides_pdf.py waits for this when printing
}

const boxes = [...document.querySelectorAll(".pdfv")];
if (PRINT || !("IntersectionObserver" in window)) {
  boxes.forEach(start);
} else {
  const seen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) { seen.unobserve(entry.target); start(entry.target); }
    }
  });
  boxes.forEach((box) => seen.observe(box));
}

// Redraw sharp after the window (and so reveal.js's slide scale) changes size
let resizing = 0;
addEventListener("resize", () => {
  clearTimeout(resizing);
  resizing = setTimeout(() => {
    started.forEach((part) => part.refresh());
    if (popup.isOpen) popup.go(popup.n);
  }, 200);
});
