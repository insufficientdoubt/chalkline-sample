/*
  Classroom tools for reveal.js slides: a toolbox button in the bottom-left corner (or press W)
  opens a menu of tools. Each tool is a floating panel on top of the slides, not on one slide,
  so it stays where you put it while you change slides.

    Scoreboard      points for teams (names, colors, + and −)
    Voice level     0 Silent to 4 Presenter
    Traffic light   red, yellow, green
    Noise meter     the room's sound level from the microphone, with a "too loud" line
    QR code         a code for this deck's address (or any link) for students' tablets
    Stopwatch       counts up
    Dice            1 to 6 dice

  Drag a panel by its title bar; drag the corner to make it bigger (everything inside grows).
  Which panels are open, where they are, the scores and the other settings are remembered in
  this browser, so they come back in the next slide deck. Nothing is sent anywhere.
*/
(function () {
  // Speaker view previews and the slide PDF export get no tools.
  if (/[?&](receiver|print-pdf)/.test(location.search)) return;

  const BASE = document.currentScript ? document.currentScript.src.replace(/[^/]*$/, "") : "";
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

  function beep(freq, length, volume) {
    try {
      const ctx = beep.ctx || (beep.ctx = new (window.AudioContext || window.webkitAudioContext)());
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.frequency.value = freq;
      g.gain.setValueAtTime(volume || 0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + length);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + length);
    } catch (e) { /* no sound available */ }
  }

  // A button that needs a second tap within 3 seconds ("Reset" → "Sure?").
  function sureButton(label, action) {
    let armed = null;
    const b = h("button", { class: "ct-btn", text: label, onclick: function () {
      if (armed) { clearTimeout(armed); armed = null; b.textContent = label; b.classList.remove("ct-armed"); action(); return; }
      b.textContent = "Sure?"; b.classList.add("ct-armed");
      armed = setTimeout(function () { armed = null; b.textContent = label; b.classList.remove("ct-armed"); }, 3000);
    } });
    return b;
  }

  /* ---------------- The tools ----------------
     Each tool: title, icon, default size, and build(body) which fills the panel body and may
     return { refresh(), close() }: refresh redraws after another tab changes the saved state,
     close tidies up (stops the microphone, timers). */

  const COLORS = ["#0087ff", "#ff8c0f", "#2e9e4f", "#7b4fc9", "#C8372D", "#1a9e9e", "#d6458f", "#003477"];

  const TOOLS = {
    scoreboard: {
      title: "Scoreboard", icon: "🏆", w: 360, h: 300, minW: 300, minH: 230, keys: ["scores"],
      build: function (body) {
        function state() {
          return load("scores", { sound: true, teams: [1, 2, 3, 4].map(function (n) { return { name: "Team " + n, score: 0 }; }) });
        }
        let s = state();
        const rows = h("div", { class: "ct-score-rows" });
        const soundBtn = h("button", { class: "ct-btn", title: "Sound on/off", onclick: function () {
          s.sound = !s.sound; save("scores", s); paint();
        } });
        const addBtn = h("button", { class: "ct-btn", text: "+ Team", onclick: function () {
          if (s.teams.length >= 8) return;
          s.teams.push({ name: "Team " + (s.teams.length + 1), score: 0 }); save("scores", s); paint();
        } });
        const removeBtn = sureButton("− Team", function () {
          if (s.teams.length <= 1) return;
          s.teams.pop(); save("scores", s); paint();
        });
        body.append(rows, h("div", { class: "ct-foot" }, addBtn, removeBtn,
          sureButton("Reset", function () { s.teams.forEach(function (t) { t.score = 0; }); save("scores", s); paint(); }),
          soundBtn));

        function change(i, by) {
          s.teams[i].score += by;
          save("scores", s);
          if (s.sound) beep(by > 0 ? 880 : 330, 0.25, 0.12);
          paint();
          const el = rows.children[i] && rows.children[i].querySelector(".ct-score");
          if (el) { el.classList.remove("ct-pop"); void el.offsetWidth; el.classList.add("ct-pop"); }
        }
        function paint() {
          rows.textContent = "";
          rows.style.setProperty("--rows", s.teams.length);
          const top = Math.max.apply(null, s.teams.map(function (t) { return t.score; }));
          const leaders = s.teams.filter(function (t) { return t.score === top; }).length;
          s.teams.forEach(function (t, i) {
            const name = h("input", { class: "ct-team-name", value: t.name, maxlength: 24, "aria-label": "Team name",
              onchange: function () { t.name = name.value.trim() || "Team " + (i + 1); save("scores", s); },
              onkeydown: function (e) { if (e.key === "Enter") name.blur(); } });
            name.value = t.name;
            rows.append(h("div", { class: "ct-score-row", style: "--team:" + COLORS[i % COLORS.length] },
              h("button", { class: "ct-round", "aria-label": "Minus one", text: "−", onclick: function () { change(i, -1); } }),
              name,
              h("span", { class: "ct-crown", text: top > 0 && leaders === 1 && t.score === top ? "👑" : "" }),
              h("span", { class: "ct-score", text: t.score }),
              h("button", { class: "ct-round ct-plus", "aria-label": "Plus one", text: "+", onclick: function () { change(i, 1); } })));
          });
          soundBtn.textContent = s.sound ? "🔔" : "🔕";
        }
        paint();
        return { refresh: function () { s = state(); paint(); } };
      },
    },

    voice: {
      title: "Voice level", icon: "🤫", w: 340, h: 260, minW: 260, minH: 180, keys: ["voice"],
      build: function (body) {
        const LEVELS = [
          { icon: "🤫", label: "Silent", color: "#C8372D" },
          { icon: "💬", label: "Whisper", color: "#ff8c0f" },
          { icon: "🧑‍🤝‍🧑", label: "Partner talk", color: "#d4a000" },
          { icon: "👥", label: "Group talk", color: "#2e9e4f" },
          { icon: "🎤", label: "Presenter", color: "#0087ff" },
        ];
        const big = h("div", { class: "ct-voice-big" });
        const picks = h("div", { class: "ct-voice-picks" });
        LEVELS.forEach(function (l, i) {
          picks.append(h("button", { class: "ct-voice-pick", style: "--lvl:" + l.color, title: l.label, text: i,
            onclick: function () { save("voice", i); paint(); } }));
        });
        body.append(big, picks);
        function paint() {
          const i = load("voice", 0), l = LEVELS[i] || LEVELS[0];
          big.style.setProperty("--lvl", l.color);
          big.textContent = "";
          big.append(h("span", { class: "ct-voice-num", text: i }), h("span", { class: "ct-voice-icon", text: l.icon }),
            h("span", { class: "ct-voice-label", text: l.label }));
          Array.prototype.forEach.call(picks.children, function (b, j) { b.classList.toggle("ct-on", j === i); });
        }
        paint();
        return { refresh: paint };
      },
    },

    traffic: {
      title: "Traffic light", icon: "🚦", w: 220, h: 380, minW: 150, minH: 250, keys: ["traffic"],
      build: function (body) {
        const LIGHTS = [
          { id: "red", label: "Stop" },
          { id: "yellow", label: "Get ready" },
          { id: "green", label: "Go" },
        ];
        const box = h("div", { class: "ct-traffic-box" });
        const caption = h("div", { class: "ct-traffic-label" });
        LIGHTS.forEach(function (l) {
          box.append(h("button", { class: "ct-light ct-" + l.id, "aria-label": l.label, onclick: function () {
            save("traffic", load("traffic", "") === l.id ? "" : l.id); paint();
          } }));
        });
        body.append(box, caption);
        function paint() {
          const on = load("traffic", "");
          Array.prototype.forEach.call(box.children, function (b, i) { b.classList.toggle("ct-on", LIGHTS[i].id === on); });
          const l = LIGHTS.find(function (x) { return x.id === on; });
          caption.textContent = l ? l.label : "";
          caption.className = "ct-traffic-label" + (l ? " ct-" + l.id : "");
        }
        paint();
        return { refresh: paint };
      },
    },

    noise: {
      title: "Noise meter", icon: "🔊", w: 400, h: 240, minW: 320, minH: 190, keys: [],
      build: function (body, panel) {
        let limit = load("noise-limit", 60), beepOn = load("noise-beep", false);
        let stream = null, ctx = null, raf = 0, level = 0, loudSince = 0, quietSince = 0, loud = false;
        const face = h("span", { class: "ct-noise-face", text: "🙂" });
        const fill = h("div", { class: "ct-noise-fill" });
        const line = h("div", { class: "ct-noise-line" });
        const meter = h("div", { class: "ct-noise-meter" }, fill, line);
        const status = h("div", { class: "ct-noise-status", text: "Press Start to use the microphone." });
        const go = h("button", { class: "ct-btn ct-primary", text: "Start", onclick: function () { stream ? stop() : start(); } });
        const slider = h("input", { type: "range", min: 10, max: 95, value: limit, "aria-label": "Too loud at",
          oninput: function () { limit = +slider.value; save("noise-limit", limit); paintLine(); } });
        const beepBtn = h("button", { class: "ct-btn", title: "Beep when too loud", onclick: function () {
          beepOn = !beepOn; save("noise-beep", beepOn); beepBtn.textContent = beepOn ? "🔔" : "🔕";
        } });
        beepBtn.textContent = beepOn ? "🔔" : "🔕";
        body.append(h("div", { class: "ct-noise-top" }, face, meter), status,
          h("div", { class: "ct-foot" }, go, h("label", { class: "ct-noise-limit" }, "Too loud at ", slider), beepBtn));
        function paintLine() { line.style.left = limit + "%"; }
        paintLine();

        function fmt(ms) {
          const s = Math.floor(ms / 1000);
          return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
        }
        async function start() {
          if (!window.isSecureContext || !navigator.mediaDevices) {
            status.textContent = "The microphone works only on http://localhost or an https:// site.";
            return;
          }
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
          } catch (e) {
            status.textContent = e.name === "NotAllowedError"
              ? "The browser blocked the microphone. Allow it with the icon in the address bar."
              : "No microphone found.";
            return;
          }
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 2048;
          ctx.createMediaStreamSource(stream).connect(analyser);
          const data = new Float32Array(analyser.fftSize);
          quietSince = Date.now(); loudSince = 0; loud = false;
          go.textContent = "Stop";
          function frame() {
            analyser.getFloatTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
            const db = 20 * Math.log10(Math.sqrt(sum / data.length) || 1e-6);   // about −60 (quiet) to 0 (very loud)
            const now = Math.min(100, Math.max(0, (db + 60) / 60 * 100));
            level = now > level ? level * 0.6 + now * 0.4 : level * 0.94 + now * 0.06;   // rise fast, fall slowly
            const t = Date.now();
            if (level > limit) {
              if (!loudSince) loudSince = t;
              if (!loud && t - loudSince > 1000) { loud = true; if (beepOn) beep(660, 0.5, 0.2); }
            } else {
              loudSince = 0;
              if (loud) { loud = false; quietSince = t; }
            }
            fill.style.width = level + "%";
            const zone = level > limit ? "loud" : level > limit * 0.75 ? "near" : "ok";
            meter.dataset.zone = zone;
            face.textContent = loud ? "😣" : zone === "near" ? "😐" : "🙂";
            panel.classList.toggle("ct-loud", loud);
            status.textContent = loud ? "Too loud!" : "Quiet for " + fmt(t - quietSince);
            raf = requestAnimationFrame(frame);
          }
          frame();
        }
        function stop() {
          cancelAnimationFrame(raf);
          if (stream) stream.getTracks().forEach(function (tr) { tr.stop(); });
          if (ctx) ctx.close();
          stream = ctx = null; level = 0;
          fill.style.width = "0";
          face.textContent = "🙂";
          panel.classList.remove("ct-loud");
          go.textContent = "Start";
          status.textContent = "Microphone off.";
        }
        return { close: stop };
      },
    },

    qr: {
      title: "QR code", icon: "🔳", w: 300, h: 360, minW: 220, minH: 260, keys: [],
      build: function (body) {
        const site = (document.querySelector('meta[name="chalkline-qr-site"]') || {}).content || "";
        const local = location.protocol === "file:" || /^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(location.hostname);
        const deckUrl = local && site
          ? site.replace(/\/?$/, "/") + location.pathname.replace(/^\//, "")
          : location.origin + location.pathname;
        let url = deckUrl;
        const code = h("div", { class: "ct-qr-code" });
        const caption = h("div", { class: "ct-qr-caption" });
        const field = h("input", { class: "ct-qr-field", type: "url", "aria-label": "Link for the QR code", hidden: true,
          onchange: function () { url = field.value.trim() || deckUrl; paint(); },
          onkeydown: function (e) { if (e.key === "Enter") field.blur(); } });
        body.append(code, caption, field, h("div", { class: "ct-foot" },
          h("button", { class: "ct-btn", text: "Edit link", onclick: function () {
            field.hidden = !field.hidden; field.value = url; if (!field.hidden) field.select();
          } }),
          h("button", { class: "ct-btn", text: "This deck", onclick: function () { url = deckUrl; field.value = url; paint(); } })));

        function paint() {
          if (!window.qrcode) { code.textContent = "…"; return; }
          let qr;
          try {
            qr = window.qrcode(0, "M");
            qr.addData(encodeURI(decodeURI(url)));   // plain ASCII, whatever was typed
            qr.make();
          } catch (e) { code.textContent = "That link is too long for a QR code."; return; }
          const n = qr.getModuleCount(), q = 4;
          let d = "";
          for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += "M" + (c + q) + " " + (r + q) + "h1v1h-1z";
          code.innerHTML = '<svg viewBox="0 0 ' + (n + 2 * q) + " " + (n + 2 * q) + '" shape-rendering="crispEdges" role="img" aria-label="QR code">' +
            '<rect width="100%" height="100%" fill="#fff"/><path fill="#000" d="' + d + '"/></svg>';
          caption.textContent = url.replace(/^https?:\/\//, "");
          caption.title = url;
          const onlyHere = /^(file:|https?:\/\/(localhost|127\.|\[::1\]|0\.0\.0\.0))/.test(url);
          caption.classList.toggle("ct-warn", onlyHere);
          if (onlyHere) caption.textContent = "This link works only on this computer: students can't open it. Use Edit link.";
        }
        if (window.qrcode) paint();
        else {
          code.textContent = "…";
          document.head.append(h("script", { src: BASE + "qrcode.js", onload: paint }));
        }
        return {};
      },
    },

    stopwatch: {
      title: "Stopwatch", icon: "⏱️", w: 320, h: 200, minW: 220, minH: 150, keys: ["stopwatch"],
      build: function (body) {
        // Saved as { since: start time while running, or 0; done: ms counted before that }.
        const time = h("div", { class: "ct-sw-time" });
        const go = h("button", { class: "ct-btn ct-primary", onclick: function () {
          const s = load("stopwatch", { since: 0, done: 0 });
          if (s.since) save("stopwatch", { since: 0, done: s.done + Date.now() - s.since });
          else save("stopwatch", { since: Date.now(), done: s.done });
          paint();
        } });
        body.append(time, h("div", { class: "ct-foot" }, go,
          h("button", { class: "ct-btn", text: "Reset", onclick: function () {
            const s = load("stopwatch", { since: 0, done: 0 });
            save("stopwatch", { since: s.since ? Date.now() : 0, done: 0 }); paint();
          } })));
        function paint() {
          const s = load("stopwatch", { since: 0, done: 0 });
          const ms = s.done + (s.since ? Date.now() - s.since : 0);
          const sec = Math.floor(ms / 1000), hrs = Math.floor(sec / 3600), min = Math.floor(sec / 60) % 60;
          time.textContent = (hrs ? hrs + ":" + String(min).padStart(2, "0") : min) + ":" +
            String(sec % 60).padStart(2, "0") + "." + Math.floor(ms / 100) % 10;
          go.textContent = s.since ? "Pause" : ms ? "Resume" : "Start";
          time.classList.toggle("ct-running", !!s.since);
        }
        paint();
        const timer = setInterval(paint, 100);
        return { refresh: paint, close: function () { clearInterval(timer); } };
      },
    },

    dice: {
      title: "Dice", icon: "🎲", w: 360, h: 240, minW: 250, minH: 190, keys: ["dice"],
      build: function (body) {
        const PIPS = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
        let rolling = 0;
        const tray = h("div", { class: "ct-dice-tray", title: "Tap to roll", onclick: roll });
        const total = h("div", { class: "ct-dice-total" });
        const count = h("span", { class: "ct-dice-count" });
        body.append(tray, total, h("div", { class: "ct-foot" },
          h("button", { class: "ct-btn ct-primary", text: "Roll", onclick: roll }),
          h("button", { class: "ct-btn", "aria-label": "Fewer dice", text: "−", onclick: function () { setCount(-1); } }),
          count,
          h("button", { class: "ct-btn", "aria-label": "More dice", text: "+", onclick: function () { setCount(1); } })));
        function state() { return load("dice", { values: [6, 6] }); }
        function setCount(by) {
          const s = state(), n = Math.min(6, Math.max(1, s.values.length + by));
          while (s.values.length < n) s.values.push(1 + Math.floor(Math.random() * 6));
          s.values.length = n;
          save("dice", s); paint(s.values);
        }
        function roll() {
          if (rolling) return;
          const n = state().values.length;
          let k = 0;
          rolling = setInterval(function () {
            const v = [];
            for (let i = 0; i < n; i++) v.push(1 + Math.floor(Math.random() * 6));
            paint(v, true);
            if (++k === 10) { clearInterval(rolling); rolling = 0; save("dice", { values: v }); paint(v); }
          }, 70);
        }
        function paint(values, spinning) {
          values = values || state().values;
          tray.textContent = "";
          tray.style.setProperty("--cols", Math.min(values.length, 3));
          tray.style.setProperty("--rows", Math.ceil(values.length / 3));
          values.forEach(function (v) {
            const die = h("div", { class: "ct-die" + (spinning ? " ct-spin" : "") });
            for (let i = 0; i < 9; i++) die.append(h("span", { class: PIPS[v].indexOf(i) >= 0 ? "ct-pip" : "" }));
            tray.append(die);
          });
          total.textContent = values.length > 1 && !spinning ? "Total: " + values.reduce(function (a, b) { return a + b; }, 0) : "";
          count.textContent = values.length + (values.length === 1 ? " die" : " dice");
        }
        paint();
        return { refresh: function () { if (!rolling) paint(); }, close: function () { clearInterval(rolling); } };
      },
    },
  };

  /* ---------------- Panels ---------------- */

  const layer = h("div", { id: "ct-layer" });
  document.body.append(layer);
  let zTop = 1;
  const open = {};   // tool id -> { panel, api }
  const layout = load("layout", { open: [], pos: {} });

  function saveLayout() {
    layout.open = Object.keys(open);
    save("layout", layout);
  }

  function clampPos(p, tool) {
    const W = window.innerWidth, H = window.innerHeight;
    p.w = Math.max(tool.minW, Math.min(p.w, W - 8));
    p.h = Math.max(tool.minH, Math.min(p.h, H - 8));
    p.x = Math.max(4 - p.w + 120, Math.min(p.x, W - 120));   // keep part of the title bar reachable
    p.y = Math.max(4, Math.min(p.y, H - 48));
    return p;
  }
  function place(panel, p) {
    panel.style.left = p.x + "px"; panel.style.top = p.y + "px";
    panel.style.width = p.w + "px"; panel.style.height = p.h + "px";
  }

  // Drag `handle` to change the panel's position (move) or size (resize).
  function dragger(panel, id, handle, resize) {
    handle.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || e.target.closest("button")) return;
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      const p = layout.pos[id], sx = e.clientX, sy = e.clientY, start = Object.assign({}, p);
      function move(ev) {
        if (resize) {   // the corner stays on the screen
          p.w = Math.min(start.w + ev.clientX - sx, window.innerWidth - p.x - 4);
          p.h = Math.min(start.h + ev.clientY - sy, window.innerHeight - p.y - 4);
        }
        else { p.x = start.x + ev.clientX - sx; p.y = start.y + ev.clientY - sy; }
        place(panel, clampPos(p, TOOLS[id]));
      }
      function up() {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
        handle.removeEventListener("pointercancel", up);
        saveLayout();
      }
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
      handle.addEventListener("pointercancel", up);
    });
  }

  function openTool(id) {
    const tool = TOOLS[id];
    if (!tool) return;
    if (open[id]) { open[id].panel.style.zIndex = ++zTop; return; }
    const n = Object.keys(open).length;
    const p = layout.pos[id] || (layout.pos[id] = { x: 80 + 36 * n, y: 70 + 36 * n, w: tool.w, h: tool.h });
    const head = h("div", { class: "ct-head" },
      h("span", { class: "ct-title", text: tool.icon + " " + tool.title }),
      h("button", { class: "ct-close", "aria-label": "Close", title: "Close", text: "×", onclick: function () { closeTool(id); } }));
    const body = h("div", { class: "ct-body ct-" + id });
    const grip = h("div", { class: "ct-grip", title: "Drag to resize" });
    const panel = h("div", { class: "ct-panel", role: "dialog", "aria-label": tool.title }, head, body, grip);
    panel.addEventListener("pointerdown", function () { panel.style.zIndex = ++zTop; });
    place(panel, clampPos(p, tool));
    panel.style.zIndex = ++zTop;
    layer.append(panel);
    dragger(panel, id, head, false);
    dragger(panel, id, grip, true);
    open[id] = { panel: panel, api: tool.build(body, panel) || {} };
    saveLayout();
    paintMenu();
  }

  function closeTool(id) {
    const o = open[id];
    if (!o) return;
    if (o.api.close) o.api.close();
    o.panel.remove();
    delete open[id];
    saveLayout();
    paintMenu();
  }

  // Clicked buttons give the focus back to the slides, so Space and the arrows still change slides.
  layer.addEventListener("click", function (e) {
    const b = e.target.closest("button");
    if (b) b.blur();
  });

  // Another tab (say, the next deck) changed a score or setting: show it here too.
  window.addEventListener("storage", function (e) {
    if (!e.key || e.key.indexOf(PREFIX) !== 0) return;
    const key = e.key.slice(PREFIX.length);
    for (const id in open) {
      if (TOOLS[id].keys.indexOf(key) >= 0 && open[id].api.refresh) open[id].api.refresh();
    }
  });

  /* ---------------- The toolbox button and its menu ---------------- */

  const menu = h("div", { id: "ct-menu", role: "menu", hidden: true });
  const launch = h("button", { id: "ct-launch", title: "Classroom tools (W)", "aria-label": "Classroom tools",
    "aria-haspopup": "menu", onclick: function () { toggleMenu(); } });
  launch.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/>' +
    '<rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>' +
    '<path d="M17.5 14v7M14 17.5h7"/></svg>';
  layer.append(launch, menu);

  function paintMenu() {
    menu.textContent = "";
    menu.append(h("div", { class: "ct-menu-title", text: "Classroom tools" }));
    Object.keys(TOOLS).forEach(function (id) {
      const t = TOOLS[id];
      menu.append(h("button", { class: "ct-menu-item" + (open[id] ? " ct-on" : ""), role: "menuitemcheckbox",
        "aria-checked": open[id] ? "true" : "false",
        onclick: function () { open[id] ? closeTool(id) : openTool(id); } },
        h("span", { class: "ct-menu-icon", text: t.icon }), h("span", { text: t.title }),
        h("span", { class: "ct-check", text: open[id] ? "✓" : "" })));
    });
    if (Object.keys(open).length) {
      menu.append(h("button", { class: "ct-menu-item ct-menu-close", text: "Close all",
        onclick: function () { Object.keys(open).forEach(closeTool); toggleMenu(false); } }));
    }
  }
  function toggleMenu(show) {
    menu.hidden = show === undefined ? !menu.hidden : !show;
    if (!menu.hidden) paintMenu();
  }
  document.addEventListener("pointerdown", function (e) {
    if (!menu.hidden && !menu.contains(e.target) && !launch.contains(e.target)) toggleMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) toggleMenu(false);
  });
  if (window.Reveal) {
    Reveal.addKeyBinding({ keyCode: 87, key: "W", description: "Classroom tools" }, function () { toggleMenu(); });
  }

  // Fullscreen shows only one element: take the tools along into it, and back out again.
  document.addEventListener("fullscreenchange", function () {
    const fs = document.fullscreenElement;
    const home = fs && fs !== document.documentElement && fs !== document.body ? fs : document.body;
    if (layer.parentNode !== home) home.append(layer);
  });

  // Bring back the panels that were open in the last deck.
  (layout.open || []).forEach(openTool);
  paintMenu();
})();
