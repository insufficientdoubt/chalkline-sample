/*
  Classroom tools for reveal.js slides: a toolbox button in the bottom-left corner (or press W)
  opens a menu of tools. Each tool is a floating panel on top of the slides, not on one slide,
  so it stays where you put it while you change slides.

    Name picker     picks a student from a class list, everyone once before anyone twice
    Groups          random groups from a class list (groups of n, or n groups)
    Scoreboard      points for teams (names, colors, + and −); narrow, it stacks each team
    Voice level     0 Silent to 4 Presenter; the microphone button adds a noise meter: the room's
                    sound level, with a "too loud" line set by the voice level, an alarm and a
                    red flash over it, and a count of the times
    Slide size      the space around the slides, and standard or wide (16:9), on this screen
    Traffic light   red, yellow, green
    QR code         a code for this deck's address (or any link) for students' tablets
    Stopwatch       counts up
    Clock           the time; open unless you close it (K shows and hides it)
    Spotlight       darkens the screen except a circle you drag, to show where to look
    Dice            1 to 6 dice

  Drag a panel by any empty part of it; drag the corner to make it bigger (everything inside grows).
  Narrow panels (scoreboard, voice level) change to a layout that stacks.
  Which panels are open, where they are, the scores and the other settings are remembered in
  this browser, so they come back in the next slide deck. Nothing is sent anywhere. Class lists
  too: they stay in this browser, never in the course files or on the website.
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
  function sureButton(label, action) {
    let armed = null;
    const b = h("button", { class: "ct-btn", text: label, onclick: function () {
      if (armed) { clearTimeout(armed); armed = null; b.textContent = label; b.classList.remove("ct-armed"); action(); return; }
      b.textContent = "Sure?"; b.classList.add("ct-armed");
      armed = setTimeout(function () { armed = null; b.textContent = label; b.classList.remove("ct-armed"); }, 3000);
    } });
    return b;
  }

  /* ---------------- Class lists (name picker and groups) ----------------
     Saved as { current: index, classes: [{ name, names: [...], picked: [...], absent: { day, names },
     groups: [[...], ...] }] }. Only in this browser: never in the course files or on the website. */

  const PRIVACY = "Names are saved only in this browser, on this computer. They are not uploaded, " +
    "and they are not in the course files or on the website.";

  function today() { return new Date().toDateString(); }
  function loadClasses() { return load("classes", { current: 0, classes: [] }); }
  function saveClasses(c) {
    save("classes", c);
    refreshTools("classes");   // the other class tool in this tab shows the change too
  }
  function absentToday(k) { return k.absent && k.absent.day === today() ? k.absent.names : []; }
  function present(k) {
    const away = absentToday(k);
    return k.names.filter(function (n) { return away.indexOf(n) < 0; });
  }
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // The class menu at the top of both tools: switch class, add one, or edit this one.
  function classBar(c, edit) {
    const select = h("select", { class: "ct-class-select", "aria-label": "Class", onchange: function () {
      select.blur();   // so the arrow keys change slides again
      if (select.value === "new") { edit(true); return; }
      const now = loadClasses();
      now.current = +select.value;
      saveClasses(now);
    } });
    c.classes.forEach(function (k, i) { select.append(h("option", { value: i, text: k.name + " (" + k.names.length + ")" })); });
    select.append(h("option", { value: "new", text: "+ New class…" }));
    select.value = String(c.current);
    return h("div", { class: "ct-class-bar" }, select,
      h("button", { class: "ct-btn ct-small", text: "Edit", onclick: function () { edit(false); } }));
  }

  // No classes yet.
  function noClasses(edit) {
    return h("div", { class: "ct-empty" },
      h("p", { text: "Add a class list to start." }),
      h("button", { class: "ct-btn ct-primary", text: "+ New class", onclick: function () { edit(true); } }),
      h("p", { class: "ct-privacy", text: PRIVACY }));
  }

  // Add a class (isNew) or edit the current one, inside a panel body; done() goes back.
  function classEditor(body, isNew, done) {
    const c = loadClasses();
    const i = isNew || !c.classes[c.current] ? -1 : c.current;
    const k = i >= 0 ? c.classes[i] : { name: "", names: [] };
    const name = h("input", { class: "ct-input", placeholder: "Class name, like 7A", maxlength: 30, "aria-label": "Class name" });
    name.value = k.name;
    const list = h("textarea", { class: "ct-input ct-names", "aria-label": "Names",
      placeholder: "One name on each line.\nYou can paste a column from a spreadsheet." });
    list.value = k.names.join("\n");
    const msg = h("p", { class: "ct-privacy", text: PRIVACY });
    const saveBtn = h("button", { class: "ct-btn ct-primary", text: "Save", onclick: function () {
      const names = [];
      list.value.split(/[\r\n\t]+/).forEach(function (n) {
        n = n.trim();
        if (n && names.indexOf(n) < 0) names.push(n);
      });
      if (!names.length) { msg.textContent = "Add at least one name."; msg.classList.add("ct-warn"); return; }
      const now = loadClasses();
      const label = name.value.trim() || "Class " + (now.classes.length + (i >= 0 ? 0 : 1));
      if (i >= 0 && now.classes[i]) {
        const old = now.classes[i];
        old.name = label;
        old.names = names;
        old.picked = (old.picked || []).filter(function (n) { return names.indexOf(n) >= 0; });
        old.groups = null;   // the old groups may name students who left
      } else {
        now.classes.push({ name: label, names: names, picked: [] });
        now.current = now.classes.length - 1;
      }
      saveClasses(now);
      done();
    } });
    body.textContent = "";
    body.append(h("div", { class: "ct-edit" }, name, list, msg,
      h("div", { class: "ct-foot" }, saveBtn,
        c.classes.length ? h("button", { class: "ct-btn", text: "Cancel", onclick: done }) : null,
        i >= 0 ? sureButton("Delete class", function () {
          const now = loadClasses();
          now.classes.splice(i, 1);
          now.current = 0;
          saveClasses(now);
          done();
        }) : null)));
    (i >= 0 ? list : name).focus();
  }

  // Who's here today: tap the students who are away (it starts fresh each day).
  function attendance(k, done) {
    const grid = h("div", { class: "ct-here-grid ct-nodrag" });
    function paint() {
      const away = absentToday(k);
      grid.textContent = "";
      k.names.forEach(function (n) {
        grid.append(h("button", { class: "ct-chip" + (away.indexOf(n) >= 0 ? " ct-away" : ""), text: n, onclick: function () {
          const now = loadClasses(), cls = now.classes[now.current];
          const list = absentToday(cls).slice(), j = list.indexOf(n);
          if (j >= 0) list.splice(j, 1); else list.push(n);
          cls.absent = { day: today(), names: list };
          k.absent = cls.absent;
          saveClasses(now);
          paint();
        } }));
      });
    }
    paint();
    return h("div", { class: "ct-here" },
      h("p", { class: "ct-hint", text: "Tap the students who are away today. This starts fresh tomorrow." }),
      grid,
      h("div", { class: "ct-foot" }, h("button", { class: "ct-btn ct-primary", text: "Done", onclick: done })));
  }

  /* ---------------- The tools ----------------
     Each tool: title, icon, default size, and build(body) which fills the panel body and may
     return { refresh(), close() }: refresh redraws after another tab changes the saved state,
     close tidies up (stops the microphone, timers). */

  const COLORS = ["#0087ff", "#ff8c0f", "#2e9e4f", "#7b4fc9", "#C8372D", "#1a9e9e", "#d6458f", "#003477"];

  const TOOLS = {
    picker: {
      title: "Name picker", icon: "🙋", w: 400, h: 280, minW: 260, minH: 230, keys: ["classes"],
      build: function (body) {
        // Picks each student present once, then starts again. Picked names are remembered per class.
        let mode = "pick", rolling = 0, last = null;   // last: { cls, name } shown on the big card
        function show(m, isNew) {
          mode = m;
          clearInterval(rolling); rolling = 0;
          if (m === "edit") { classEditor(body, isNew, function () { show("pick"); }); return; }
          const c = loadClasses(), k = c.classes[c.current];
          body.textContent = "";
          if (!k) { body.append(noClasses(function (n) { show("edit", n); })); return; }
          const bar = classBar(c, function (n) { show("edit", n); });
          if (m === "here") { body.append(bar, attendance(k, function () { show("pick"); })); return; }
          const here = present(k), picked = k.picked || [];
          const left = here.filter(function (n) { return picked.indexOf(n) < 0; });
          const name = last && last.cls === k.name ? last.name : "";
          const card = h("button", { class: "ct-pick-card" + (name ? "" : " ct-idle"), onclick: pick, text: name || "Tap to pick" });
          fit(card, name || "Tap to pick");
          body.append(bar, card,
            h("div", { class: "ct-pick-info", text: here.length ? left.length + " of " + here.length + " not picked yet" : "Everyone is away today." }),
            h("div", { class: "ct-foot" },
              h("button", { class: "ct-btn ct-primary", text: "Pick", onclick: pick }),
              h("button", { class: "ct-btn", text: "Start again", onclick: function () {
                const now = loadClasses();
                now.classes[now.current].picked = [];
                last = null;
                saveClasses(now);
                show("pick");
              } }),
              h("button", { class: "ct-btn", text: "Who's here?", onclick: function () { show("here"); } })));

          function pick() {
            if (rolling || !here.length) return;
            const pool = left.length ? left : here;   // everyone picked: start a new round
            const winner = pool[Math.floor(Math.random() * pool.length)];
            let n = 0;
            card.classList.remove("ct-idle", "ct-won");
            rolling = setInterval(function () {
              if (++n < 14) {
                const any = here[Math.floor(Math.random() * here.length)];
                card.textContent = any; fit(card, any);
                return;
              }
              clearInterval(rolling); rolling = 0;
              const now = loadClasses(), cls = now.classes[now.current];
              cls.picked = (left.length ? cls.picked || [] : []).concat([winner]);
              last = { cls: cls.name, name: winner };
              saveClasses(now);
              show("pick");
              body.querySelector(".ct-pick-card").classList.add("ct-won");
            }, 70);
          }
        }
        // Long names get a smaller font, so they fit on one line (Chinese characters count double).
        function fit(el, text) {
          const len = Array.from(text).reduce(function (a, ch) { return a + (/[⺀-￿]/.test(ch) ? 2 : 1); }, 0);
          el.style.setProperty("--len", Math.max(len, 7));
        }
        show("pick");
        return {
          refresh: function () { if (mode !== "edit" && !rolling) show(mode); },
          close: function () { clearInterval(rolling); },
        };
      },
    },

    groups: {
      title: "Groups", icon: "🧩", w: 480, h: 340, minW: 300, minH: 240, keys: ["classes", "groups"],
      build: function (body) {
        // Settings: { by: "size" (groups of n) or "count" (n groups), n }. The groups are kept per class.
        let mode = "groups";
        function show(m, isNew) {
          mode = m;
          if (m === "edit") { classEditor(body, isNew, function () { show("groups"); }); return; }
          const c = loadClasses(), k = c.classes[c.current];
          body.textContent = "";
          if (!k) { body.append(noClasses(function (n) { show("edit", n); })); return; }
          const bar = classBar(c, function (n) { show("edit", n); });
          if (m === "here") { body.append(bar, attendance(k, function () { show("groups"); })); return; }
          const s = load("groups", { by: "size", n: 4 });
          const cards = h("div", { class: "ct-group-cards ct-nodrag" });
          // Columns and rows from the number of groups, so the text can be as big as the panel allows.
          const count = (k.groups || []).length, cols = count <= 4 ? Math.max(count, 1) : count <= 6 ? 3 : count <= 8 ? 4 : 5;
          cards.style.setProperty("--cols", cols);
          cards.style.setProperty("--grid-rows", Math.max(1, Math.ceil(count / cols)));
          cards.style.setProperty("--most", Math.max.apply(null, (k.groups || [[]]).map(function (g) { return g.length; })));
          (k.groups || []).forEach(function (g, i) {
            cards.append(h("div", { class: "ct-group", style: "--team:" + COLORS[i % COLORS.length] },
              h("div", { class: "ct-group-title", text: "Group " + (i + 1) }),
              h("ul", null, ...g.map(function (n) { return h("li", { text: n }); }))));
          });
          if (!k.groups) cards.append(h("p", { class: "ct-hint", text: present(k).length + " students here. Press Make groups." }));
          function setting(by, n) { save("groups", { by: by, n: Math.max(by === "size" ? 2 : 1, Math.min(n, 12)) }); show("groups"); }
          body.append(bar, cards, h("div", { class: "ct-foot" },
            h("button", { class: "ct-btn ct-primary", text: "Make groups", onclick: make }),
            h("button", { class: "ct-btn ct-small", "aria-label": "Fewer", text: "−", onclick: function () { setting(s.by, s.n - 1); } }),
            h("button", { class: "ct-btn ct-small ct-group-mode", title: "Tap to switch", onclick: function () { setting(s.by === "size" ? "count" : "size", s.n); },
              text: s.by === "size" ? "Groups of " + s.n : s.n + " groups" }),
            h("button", { class: "ct-btn ct-small", "aria-label": "More", text: "+", onclick: function () { setting(s.by, s.n + 1); } }),
            h("button", { class: "ct-btn", text: "Who's here?", onclick: function () { show("here"); } })));

          function make() {
            const names = shuffle(present(k));
            if (!names.length) return;
            // Groups of n: no group bigger than n, and sizes differ by at most one.
            const count = Math.min(names.length, s.by === "size" ? Math.ceil(names.length / s.n) : s.n);
            const groups = [];
            for (let i = 0; i < count; i++) groups.push([]);
            names.forEach(function (n, i) { groups[i % count].push(n); });
            const now = loadClasses();
            now.classes[now.current].groups = groups;
            saveClasses(now);
            show("groups");
          }
        }
        show("groups");
        return { refresh: function () { if (mode !== "edit") show(mode); } };
      },
    },

    scoreboard: {
      title: "Scoreboard", icon: "🏆", w: 360, h: 300, minW: 150, minH: 230, keys: ["scores"],
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
              h("button", { class: "ct-round ct-minus", "aria-label": "Minus one", text: "−", onclick: function () { change(i, -1); } }),
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
      title: "Voice level", icon: "🤫", w: 400, h: 250, minW: 150, minH: 200, keys: ["voice", "noise-count", "noise-sense"],
      build: function (body, panel, grow) {
        // The voice level, and (the microphone button) a noise meter under it. The voice level sets
        // the "too loud" line: Silent is strict, Presenter allows the most. The meter also counts the
        // times the class went over the line, and flashes and beeps when it does.
        const LEVELS = [
          { icon: "🤫", label: "Silent", color: "#C8372D", limit: 22 },
          { icon: "💬", label: "Whisper", color: "#ff8c0f", limit: 34 },
          { icon: "🧑‍🤝‍🧑", label: "Partner talk", color: "#d4a000", limit: 47 },
          { icon: "👥", label: "Group talk", color: "#2e9e4f", limit: 60 },
          { icon: "🎤", label: "Presenter", color: "#0087ff", limit: 74 },
        ];
        const NOISE_HEIGHT = 150;   // the panel grows by this much when the noise meter is turned on
        const MIC = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/>' +
          '<path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/></svg>';
        const big = h("div", { class: "ct-voice-big" });
        const picks = h("div", { class: "ct-voice-picks" });
        LEVELS.forEach(function (l, i) {
          picks.append(h("button", { class: "ct-voice-pick", style: "--lvl:" + l.color, title: l.label, text: i,
            onclick: function () { save("voice", i); paint(); } }));
        });
        let noiseOn = load("noise-on", false);
        const toggle = h("button", { class: "ct-voice-pick ct-noise-toggle", title: "Noise meter on/off", "aria-label": "Noise meter",
          onclick: function () {
            noiseOn = !noiseOn;
            save("noise-on", noiseOn);
            grow(noiseOn ? NOISE_HEIGHT : -NOISE_HEIGHT);
            if (noiseOn) start(); else stop();
            paint();
          } });
        toggle.innerHTML = MIC;
        picks.append(toggle);

        // Microphones differ: "sensitivity" (−3 to +3) moves every level's line together.
        let sense = load("noise-sense", 0), alarmOn = load("noise-beep", true), times = load("noise-count", 0);
        let stream = null, ctx = null, raf = 0, level = 0, loudSince = 0, quietSince = 0, loud = false, limit = 50;
        const face = h("span", { class: "ct-noise-face", text: "🙂" });
        const meter = h("div", { class: "ct-noise-meter" }, h("div", { class: "ct-noise-fill" }),
          h("div", { class: "ct-noise-line" }, h("span", { class: "ct-noise-flag" })));
        const status = h("span", { class: "ct-noise-chip ct-noise-status", text: "Microphone off" });
        // How many times the class went over the line (kept until reset, also in the next deck).
        const count = h("span", { class: "ct-noise-count" });
        const resetCount = h("button", { class: "ct-noise-mini", title: "Count from 0 again", "aria-label": "Reset the count", text: "↺",
          onclick: function () { times = 0; save("noise-count", 0); paintCount(); } });
        const go = h("button", { class: "ct-noise-mini ct-noise-go", title: "Microphone on/off", onclick: function () { stream ? stop() : start(); } });
        const alarmBtn = h("button", { class: "ct-noise-mini", title: "Beep when too loud", onclick: function () {
          alarmOn = !alarmOn; save("noise-beep", alarmOn); paintButtons();
        } });
        const senseLabel = h("span", { class: "ct-noise-sense-value" });
        const settings = h("div", { class: "ct-noise-settings", hidden: true },
          h("span", { text: "Microphone sensitivity" }),
          h("button", { class: "ct-noise-mini", text: "−", "aria-label": "Less sensitive", onclick: function () { setSense(sense - 1); } }),
          senseLabel,
          h("button", { class: "ct-noise-mini", text: "+", "aria-label": "More sensitive", onclick: function () { setSense(sense + 1); } }));
        const gear = h("button", { class: "ct-noise-mini", title: "Microphone sensitivity", text: "⚙", onclick: function () { settings.hidden = !settings.hidden; } });
        const noise = h("div", { class: "ct-noise" },
          h("div", { class: "ct-noise-top" }, face, meter),
          h("div", { class: "ct-noise-info" }, status,
            h("span", { class: "ct-noise-chip" }, count, resetCount),
            h("span", { class: "ct-noise-buttons" }, go, alarmBtn, gear)),
          settings);
        body.append(big, picks, noise);

        function setSense(n) { sense = Math.max(-3, Math.min(3, n)); save("noise-sense", sense); paint(); }
        function paint() {
          const i = load("voice", 0), l = LEVELS[i] || LEVELS[0];
          // More sensitive = a lower line (each step is 6 on the meter's 0 to 100 scale).
          limit = Math.max(8, Math.min(95, l.limit - sense * 6));
          panel.style.setProperty("--lvl", l.color);
          big.textContent = "";
          big.append(h("span", { class: "ct-voice-num", text: i }), h("span", { class: "ct-voice-icon", text: l.icon }),
            h("span", { class: "ct-voice-label", text: l.label }));
          Array.prototype.forEach.call(picks.children, function (b, j) { b.classList.toggle("ct-on", j === i || (b === toggle && noiseOn)); });
          meter.style.setProperty("--limit", limit + "%");
          meter.querySelector(".ct-noise-flag").textContent = l.icon;
          senseLabel.textContent = sense > 0 ? "+" + sense : String(sense);
          noise.hidden = !noiseOn;
          paintButtons();
        }
        function paintButtons() {
          go.innerHTML = stream ? '<span class="ct-noise-stop"></span>' : MIC;
          go.classList.toggle("ct-on", !!stream);
          alarmBtn.textContent = alarmOn ? "🔔" : "🔕";
        }
        function paintCount() { count.textContent = "Too loud: " + times; }
        function fmt(ms) {
          const s = Math.floor(ms / 1000);
          return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
        }
        function alarm() {
          [0, 0.22, 0.44].forEach(function (t) { beep(988, 0.18, 0.5, "square", t); });
        }
        async function start() {
          if (stream) return;
          if (!window.isSecureContext || !navigator.mediaDevices) {
            status.textContent = "Needs localhost or https://";
            return;
          }
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
          } catch (e) {
            status.textContent = e.name === "NotAllowedError" ? "Microphone blocked: allow it in the address bar" : "No microphone found";
            return;
          }
          if (!noiseOn) { stop(); return; }   // turned off while the browser was asking
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 2048;
          ctx.createMediaStreamSource(stream).connect(analyser);
          const data = new Float32Array(analyser.fftSize);
          quietSince = Date.now(); loudSince = 0; loud = false;
          paintButtons();
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
              if (!loud && t - loudSince > 1000) {
                loud = true;
                times = load("noise-count", 0) + 1;
                save("noise-count", times);
                paintCount();
                if (alarmOn) alarm();
              }
            } else {
              loudSince = 0;
              if (loud) { loud = false; quietSince = t; }
            }
            meter.style.setProperty("--pct", level + "%");
            const zone = level > limit ? "loud" : level > limit * 0.8 ? "near" : "ok";
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
          meter.style.setProperty("--pct", "0%");
          meter.dataset.zone = "ok";
          face.textContent = "🙂";
          panel.classList.remove("ct-loud");
          status.textContent = "Microphone off";
          paintButtons();
        }
        paint(); paintCount();
        return {
          refresh: function () { times = load("noise-count", 0); sense = load("noise-sense", 0); paintCount(); paint(); },
          close: stop,
        };
      },
    },

    clock: {
      // The time, in a window you can drag and resize. Open in every deck unless you close it
      // (or press K); clock: false in a deck's labels leaves it closed there.
      title: "Clock", icon: "🕒", w: 150, h: 58, minW: 110, minH: 50, keys: [],
      start: function () {   // bottom left, beside the menu and toolbox buttons (and the chalkboard's, if there)
        return { x: document.querySelector(".slide-chalkboard-buttons") ? 172 : 96, y: window.innerHeight - 58 - 8 };
      },
      build: function (body) {
        const time = h("div", { class: "ct-clock-time" });
        function tick() { time.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }   // the computer's 12- or 24-hour setting
        body.append(time);
        tick();
        const timer = setInterval(tick, 1000);
        return { close: function () { clearInterval(timer); } };
      },
    },

    spotlight: {
      // Darkens the screen except a circle: drag it (or tap where it should go) to show the class
      // where to look. The slider (or the mouse wheel) sets its size. Close the window to end it.
      title: "Spotlight", icon: "🔦", w: 240, h: 96, minW: 180, minH: 86, keys: [],
      build: function (body) {
        const spot = { x: window.innerWidth / 2, y: window.innerHeight / 2, r: load("spotlight-size", 18) };
        const shade = h("div", { class: "ct-spot-shade", title: "Drag the light, or tap where it should go" });
        layer.prepend(shade);   // under the tool windows, over the slides
        const label = h("div", { class: "ct-slide-label" });
        const slider = h("input", { type: "range", min: 6, max: 45, "aria-label": "Size of the light", oninput: function () { size(+slider.value); } });
        body.append(label, h("div", { class: "ct-slide-range" }, slider));
        function size(v) { spot.r = Math.max(6, Math.min(45, v)); save("spotlight-size", spot.r); paint(); }
        function paint() {
          const r = spot.r / 100 * Math.min(window.innerWidth, window.innerHeight);
          shade.style.background = "radial-gradient(circle at " + spot.x + "px " + spot.y + "px, transparent " + r + "px, rgba(8, 14, 26, 0.86) " + (r + 3) + "px)";
          slider.value = spot.r;
          label.textContent = "Size of the light";
        }
        shade.addEventListener("pointerdown", function (e) {
          e.preventDefault();
          shade.setPointerCapture(e.pointerId);
          function to(ev) { spot.x = ev.clientX; spot.y = ev.clientY; paint(); }
          to(e);
          shade.onpointermove = to;
          shade.onpointerup = shade.onpointercancel = function () { shade.onpointermove = null; };
        });
        shade.addEventListener("wheel", function (e) { e.preventDefault(); size(spot.r + (e.deltaY < 0 ? 2 : -2)); }, { passive: false });
        window.addEventListener("resize", paint);
        paint();
        return { close: function () { shade.remove(); window.removeEventListener("resize", paint); } };
      },
    },

    slide: {
      title: "Slide size", icon: "📐", w: 340, h: 190, minW: 220, minH: 170, keys: ["slide"],
      build: function (body) {
        // Changes how this screen shows the slides: the space around them, and their shape.
        // Saved as { margin: 0 to 0.3, wide: true for 16:9 }; the deck files don't change.
        const label = h("div", { class: "ct-slide-label" });
        const slider = h("input", { type: "range", min: 0, max: 30, "aria-label": "Space around the slide", oninput: function () {
          const s = slideSetting();
          s.margin = +slider.value / 100;
          save("slide", s); applySlide(s); paint();
        } });
        const normal = h("button", { class: "ct-btn ct-small", text: "Standard", onclick: function () { setWide(false); } });
        const wide = h("button", { class: "ct-btn ct-small", text: "Wide (16:9)", onclick: function () { setWide(true); } });
        body.append(label, h("div", { class: "ct-slide-range" }, slider),
          h("div", { class: "ct-foot" }, normal, wide, h("button", { class: "ct-btn ct-small", text: "Reset", onclick: function () {
            try { localStorage.removeItem(PREFIX + "slide"); } catch (e) { /* private window */ }
            applySlide(slideSetting()); paint();
          } })));
        function setWide(on) { const s = slideSetting(); s.wide = on; save("slide", s); applySlide(s); paint(); }
        function paint() {
          const s = slideSetting();
          slider.value = Math.round(s.margin * 100);
          label.textContent = "Space around the slide: " + Math.round(s.margin * 100) + "%";
          normal.classList.toggle("ct-primary", !s.wide);
          wide.classList.toggle("ct-primary", !!s.wide);
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

  /* ---------------- Slide size (applied in every deck, even with its panel closed) ---------------- */

  const DECK = window.Reveal ? Reveal.getConfig() : {};
  const DECK_SIZE = { margin: DECK.margin == null ? 0.04 : DECK.margin, width: DECK.width || 960, height: DECK.height || 700 };
  function slideSetting() { return load("slide", { margin: DECK_SIZE.margin, wide: false }); }
  function applySlide(s) {
    if (!window.Reveal) return;
    Reveal.configure({
      margin: s.margin,
      width: s.wide ? Math.round(DECK_SIZE.height * 16 / 9) : DECK_SIZE.width,   // same height: nothing new to overflow
      height: DECK_SIZE.height,
    });
  }
  if (window.Reveal && load("slide", null)) {
    if (Reveal.isReady()) applySlide(slideSetting());
    else Reveal.on("ready", function () { applySlide(slideSetting()); });
  }

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

  // Move a panel by dragging any empty part of it (not a button, field or list that scrolls);
  // the drag starts after a few pixels, so taps still work. Resize it with the corner grip.
  const NO_DRAG = "button, input, select, textarea, label, a, .ct-nodrag, .ct-grip";
  function dragger(panel, id, handle, resize) {
    handle.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || (!resize && e.target.closest(NO_DRAG))) return;
      e.preventDefault();
      const p = layout.pos[id], sx = e.clientX, sy = e.clientY, start = Object.assign({}, p);
      let dragging = resize;
      function move(ev) {
        if (!dragging) {
          if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 6) return;
          dragging = true;
          panel.classList.add("ct-dragging");
        }
        if (resize) {   // the corner stays on the screen
          p.w = Math.min(start.w + ev.clientX - sx, window.innerWidth - p.x - 4);
          p.h = Math.min(start.h + ev.clientY - sy, window.innerHeight - p.y - 4);
        }
        else { p.x = start.x + ev.clientX - sx; p.y = start.y + ev.clientY - sy; }
        place(panel, clampPos(p, TOOLS[id]));
      }
      function up() {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        panel.classList.remove("ct-dragging");
        if (dragging) saveLayout();
      }
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    });
  }

  function openTool(id) {
    const tool = TOOLS[id];
    if (!tool) return;
    if (open[id]) { open[id].panel.style.zIndex = ++zTop; return; }
    const n = Object.keys(open).length;
    const start = tool.start ? tool.start() : { x: 80 + 36 * n, y: 70 + 36 * n };
    const p = layout.pos[id] || (layout.pos[id] = { x: start.x, y: start.y, w: tool.w, h: tool.h });
    const close = h("button", { class: "ct-close", "aria-label": "Close " + tool.title, title: "Close", text: "×", onclick: function () { closeTool(id); } });
    const body = h("div", { class: "ct-body ct-" + id });
    const grip = h("div", { class: "ct-grip", title: "Drag to resize" });
    const panel = h("div", { class: "ct-panel", role: "dialog", "aria-label": tool.title },
      h("div", { class: "ct-handle", "aria-hidden": "true" }), close, body, grip);
    panel.addEventListener("pointerdown", function () { panel.style.zIndex = ++zTop; });
    place(panel, clampPos(p, tool));
    panel.style.zIndex = ++zTop;
    layer.append(panel);
    dragger(panel, id, panel, false);
    dragger(panel, id, grip, true);
    function grow(dh) {   // a tool that shows more (the noise meter) makes its panel taller, or shorter again
      p.h = Math.max(tool.minH, p.h + dh);
      place(panel, clampPos(p, tool));
      saveLayout();
    }
    open[id] = { panel: panel, api: tool.build(body, panel, grow) || {} };
    if (id === "clock") save("clock-off", false);
    saveLayout();
    paintMenu();
  }

  function closeTool(id, keep) {   // keep: the clock closes for this deck only
    const o = open[id];
    if (!o) return;
    if (o.api.close) o.api.close();
    o.panel.remove();
    delete open[id];
    if (id === "clock" && !keep) save("clock-off", true);   // closed on purpose: it stays closed in the next deck
    saveLayout();
    paintMenu();
  }

  // Clicked buttons give the focus back to the slides, so Space and the arrows still change slides.
  layer.addEventListener("click", function (e) {
    const b = e.target.closest("button");
    if (b) b.blur();
  });

  // Redraw the open tools that show a saved setting (key) after it changed.
  function refreshTools(key) {
    for (const id in open) {
      if (TOOLS[id].keys.indexOf(key) >= 0 && open[id].api.refresh) open[id].api.refresh();
    }
  }
  // Another tab (say, the next deck) changed a score or setting: show it here too.
  window.addEventListener("storage", function (e) {
    if (e.key && e.key.indexOf(PREFIX) === 0) refreshTools(e.key.slice(PREFIX.length));
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
        onclick: function () { Object.keys(open).forEach(function (id) { closeTool(id); }); toggleMenu(false); } }));
    }
    menu.append(h("button", { class: "ct-menu-item ct-menu-reset", onclick: function () { toggleMenu(false); showReset(); } },
      h("span", { class: "ct-menu-icon", text: "↺" }), h("span", { text: "Reset for the next class…" })));
  }

  /* ---------------- Reset for the next class ----------------
     Starts this deck's games, polls and timers again (and, if ticked, clears the pen marks on its
     PDFs and the toolbox scores). Each part listens for the "chalkline:reset" event and resets
     itself; event.detail says which parts: { games, polls, timers, ink }. */

  function showReset() {
    const has = function (sel) { return !!document.querySelector(sel); };
    const items = [
      { key: "games", label: "Games: Snowman, Jeopardy, quick-fire…", on: true, show: has(".cg-game") },
      { key: "polls", label: "Poll votes", on: true, show: has(".poll") },
      { key: "timers", label: "Timers", on: true, show: has(".countdown") },
      { key: "ink", label: "Pen marks on this deck's PDFs (worksheets)", on: false, show: has(".pdfv") },
      { key: "tools", label: "Toolbox: scores, noise count, stopwatch, picked names", on: false, show: true },
      { key: "first", label: "Go back to the first slide", on: true, show: !!window.Reveal },
    ].filter(function (i) { return i.show; });
    const boxes = {};
    const dialog = h("div", { class: "ct-reset", role: "dialog", "aria-label": "Reset for the next class" },
      h("div", { class: "ct-reset-title", text: "Reset for the next class" }),
      h("p", { class: "ct-reset-hint", text: "Start this deck again, fresh for a new class." }),
      ...items.map(function (i) {
        boxes[i.key] = h("input", { type: "checkbox" });
        boxes[i.key].checked = i.on;
        return h("label", { class: "ct-reset-item" }, boxes[i.key], h("span", { text: i.label }));
      }),
      h("div", { class: "ct-foot" },
        h("button", { class: "ct-btn ct-primary", text: "↺ Reset", onclick: function () {
          const pick = {};
          items.forEach(function (i) { pick[i.key] = boxes[i.key].checked; });
          resetAll(pick);
          close();
        } }),
        h("button", { class: "ct-btn", text: "Cancel", onclick: close })));
    const shade = h("div", { class: "ct-shade", onclick: function (e) { if (e.target === shade) close(); } }, dialog);
    function close() { shade.remove(); }
    layer.append(shade);
  }

  function resetAll(pick) {
    document.dispatchEvent(new CustomEvent("chalkline:reset", { detail: pick }));
    if (pick.tools) {
      const scores = load("scores", null);
      if (scores) { scores.teams.forEach(function (t) { t.score = 0; }); save("scores", scores); }
      save("noise-count", 0);
      save("stopwatch", { since: 0, done: 0 });
      const c = loadClasses();
      c.classes.forEach(function (k) { k.picked = []; k.groups = null; });
      save("classes", c);
      ["scores", "noise-count", "stopwatch", "classes"].forEach(refreshTools);
    }
    if (pick.first && window.Reveal) Reveal.slide(0, 0);
  }
  function toggleMenu(show) {
    menu.hidden = show === undefined ? !menu.hidden : !show;
    if (!menu.hidden) paintMenu();
  }
  document.addEventListener("pointerdown", function (e) {
    if (!menu.hidden && !menu.contains(e.target) && !launch.contains(e.target)) toggleMenu(false);
  });
  // Esc closes the menu (and only the menu: reveal.js would also open the slide overview).
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) {
      e.preventDefault(); e.stopImmediatePropagation();
      toggleMenu(false);
    }
  }, true);
  if (window.Reveal) {
    Reveal.addKeyBinding({ keyCode: 87, key: "W", description: "Classroom tools" }, function () { toggleMenu(); });
    Reveal.addKeyBinding({ keyCode: 75, key: "K", description: "Show/hide the clock" }, function () { open.clock ? closeTool("clock") : openTool("clock"); });
  }

  // Fullscreen shows only one element: take the tools along into it, and back out again.
  document.addEventListener("fullscreenchange", function () {
    const fs = document.fullscreenElement;
    const home = fs && fs !== document.documentElement && fs !== document.body ? fs : document.body;
    if (layer.parentNode !== home) home.append(layer);
  });

  // Bring back the panels that were open in the last deck (the old noise meter is now in Voice level).
  (layout.open || []).map(function (id) { return id === "noise" ? "voice" : id; })
    .filter(function (id) { return id !== "spotlight"; })   // the spotlight is for one moment: not in the next deck
    .forEach(openTool);
  // The clock is on unless it was closed (or the old corner clock was hidden with K), or this deck
  // turns it off (clock: false).
  let clockOff = load("clock-off", null);
  if (clockOff === null) { try { clockOff = localStorage.getItem("slide-clock-visible") === "0"; } catch (e) { clockOff = false; } }
  const deckOff = (document.querySelector('meta[name="chalkline-clock"]') || {}).content === "off";
  if (deckOff) closeTool("clock", true);   // just this deck: it comes back in the next one
  else if (!clockOff) openTool("clock");
  paintMenu();
})();
