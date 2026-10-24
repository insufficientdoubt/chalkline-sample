/*
  Classroom tools for reveal.js slides: a toolbox button in the bottom-left corner (or press W)
  opens a menu of tools. Each tool is a floating panel on top of the slides, not on one slide,
  so it stays where you put it while you change slides.

    Name picker     picks a student from a class list, everyone once before anyone twice
    Groups          random groups from a class list (groups of n, or n groups)
    Scoreboard      points for teams (names, colors, + and −); narrow, it stacks each team   tools/scoreboard.js
    Voice level     0 Silent to 4 Presenter; the microphone button adds a noise meter: the room's
                    sound level, with a "too loud" line set by the voice level, an alarm and a
                    red flash over it, and a count of the times
    Slide size      the space around the slides, and standard or wide (16:9), on this screen
    Traffic light   red, yellow, green; side by side when it's wide                         tools/traffic.js
    QR code         a code for this deck's address (or any link) for students' tablets
    Stopwatch       counts up                                                              tools/stopwatch.js
    Clock           the time; open unless you close it (K shows and hides it)
    Spotlight       darkens the screen except a circle you drag, to show where to look
    Dice            1 to 6 dice
    Music           YouTube's player for a song or playlist; ⋯ (or a right-click) to change it or pop it out
    Vocab           the unit's words in a sidebar; tap one for its card (picture, 中文, meaning, 🔊)
    Packet          the unit packet as pages in a sidebar; tap one to open it large (zoom, pens)

  The tools in tools/*.js are web components (see kit.js): the way to build the others as they're
  redesigned. A panel has no title bar: × shows when you point at it.
  Drag a panel by any empty part of it; drag the corner to make it bigger (everything inside grows).
  Narrow panels (scoreboard, voice level) change to a layout that stacks.
  Which panels are open, where they are, the scores and the other settings are remembered in
  this browser, so they come back in the next slide deck. Nothing is sent anywhere. Class lists
  too: they stay in this browser, never in the course files or on the website.
*/
(function () {
  // Speaker view previews and the slide PDF export get no tools, and nor does a deck shown inside
  // another page (a quick reference pop-up): the tools belong to the deck you're presenting.
  if (/[?&](receiver|print-pdf)/.test(location.search)) return;
  if (window.self !== window.top) return;

  const BASE = document.currentScript ? document.currentScript.src.replace(/[^/]*$/, "") : "";
  const PREFIX = "chalkline-tools:";

  // The shared kit (kit.js): storage, the element builder, icons, sounds, the button that asks twice
  const { load, save, h, icon, beep, sureButton, COLORS } = window.ChalklineToolbox;

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

  const TOOLS = {
    picker: {
      title: "Name picker", icon: "hand", w: 400, h: 280, minW: 260, minH: 230, keys: ["classes"],
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
      title: "Groups", icon: "users", w: 480, h: 340, minW: 300, minH: 240, keys: ["classes", "groups"],
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

    voice: {
      title: "Voice level", icon: "volume-2", w: 400, h: 250, minW: 150, minH: 200, keys: ["voice", "noise-count", "noise-sense"],
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
        const resetCount = h("button", { class: "ct-noise-mini", title: "Count from 0 again", "aria-label": "Reset the count",
          onclick: function () { times = 0; save("noise-count", 0); paintCount(); } }, icon("rotate-ccw"));
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
        const gear = h("button", { class: "ct-noise-mini", title: "Microphone sensitivity", onclick: function () { settings.hidden = !settings.hidden; } }, icon("settings"));
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
          alarmBtn.replaceChildren(icon(alarmOn ? "bell" : "bell-off"));
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
      title: "Clock", icon: "clock", w: 128, h: 52, minW: 100, minH: 44, keys: [],
      // Where it starts: off the slide, so it covers nothing. In the space beside the slide (left,
      // above the menu buttons; or right, under the slide number) when there's room; if not, the
      // top-right corner. It moves with the screen until it's dragged.
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
      title: "Spotlight", icon: "flashlight", w: 240, h: 96, minW: 180, minH: 86, keys: [],
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
      title: "Slide size", icon: "ruler", w: 340, h: 190, minW: 220, minH: 170, keys: ["slide"],
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

    qr: {
      title: "QR code", icon: "qr-code", w: 300, h: 360, minW: 220, minH: 260, keys: [],
      build: function (body) {
        // Students get this deck on the STUDENT site, never this (teacher) site with its answer keys:
        // the student site's address (student-site: in _quarto.yml) plus this deck's path in the site.
        const meta = function (name) { return (document.querySelector('meta[name="' + name + '"]') || {}).content || ""; };
        const site = meta("chalkline-student-site"), page = meta("chalkline-page");
        const deckUrl = site && page ? site.replace(/\/?$/, "/") + page.replace(/^\//, "") : "";
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
          h("button", { class: "ct-btn", text: "This deck", disabled: !deckUrl, title: deckUrl ? "This deck on the student site" : "Needs the student site's address",
            onclick: function () { url = deckUrl; field.value = url; paint(); } })));

        function paint() {
          if (!url) {   // no student site yet: a code for this page would open the teacher site
            code.textContent = "";
            caption.classList.add("ct-warn");
            caption.textContent = "No student site yet: a code for this page would open the teacher site, with the answer keys. "
              + "Add student-site: \"https://…/\" to _quarto.yml, or use Edit link.";
            return;
          }
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

    vocab: {
      title: "Vocab", icon: "book-a", w: 230, h: 520, minW: 170, minH: 200, keys: [],
      // A sidebar at the right edge, the screen's full height, until it's dragged
      start: function () { return { x: window.innerWidth - 238, y: 8, h: window.innerHeight - 16 }; },
      build: function (body, panel) {
        // The unit's words, always at hand while students work or talk: just the words (no meanings
        // or 中文), to point at. Tap one for its card beside the list: picture, word, 中文, meaning and
        // an example, with 🔊 to read it aloud. Starts on this deck's unit; the menu picks another,
        // or all of them. The words come from vocab/data/vocab.csv.
        const data = course();
        if (!data || !data.words.length) { body.append(h("div", { class: "ct-empty", text: "This course has no vocab list yet." })); return {}; }
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
          card.style.zIndex = ++zTop;
          layer.append(card);
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
      },
    },

    packet: {
      title: "Packet", icon: "files", w: 220, h: 520, minW: 170, minH: 240, keys: [],
      // A sidebar at the left edge, above the menu buttons and the clock, until it's dragged
      start: function () { return { x: 8, y: 8, h: Math.max(240, window.innerHeight - 190) }; },
      build: function (body) {
        // The unit packet as pages: tap one to open it large, in the PDF viewer's window (zoom, pens,
        // arrow keys to turn pages). The student copy, or the teacher edition with the answer keys.
        // Starts on this deck's unit; the menu picks another.
        const data = course();
        const units = data ? data.units.filter(function (u) { return u.packet; }) : [];
        if (!units.length) { body.append(h("div", { class: "ct-empty", text: "This course has no unit packets yet." })); return {}; }
        let unit = (units.find(function (u) { return u.id === data.unit; }) || units[0]).id, teacher = false;
        const key = h("button", { class: "ct-btn ct-small ct-packet-key", "aria-pressed": "false", text: "Answer key",
          title: "Show the teacher edition, with the answer keys", onclick: function () {
            teacher = !teacher; key.setAttribute("aria-pressed", String(teacher)); paint();
          } });
        const pages = h("div", { class: "ct-packet-pages ct-nodrag" });
        body.append(h("div", { class: "ct-packet-head" }, unitMenu(units, unit, null, function (v) { unit = v; paint(); }), key), pages);

        function paint() {
          const u = units.find(function (x) { return x.id === unit; });
          const box = h("div", { class: "pdfv pdfv-gallery", "data-layout": "gallery", "data-ink": "true", "data-prevent-swipe": "",
            "data-src": data.root + (teacher ? u.packet.replace(/-packet\.pdf$/, "-teacher-packet.pdf") : u.packet),
            "data-title": u.title + (teacher ? " · Teacher edition" : " · Packet") });
          pages.replaceChildren(box);
          if (window.PdfViewer) window.PdfViewer.start(box);
          else document.addEventListener("pdf-viewer-ready", function () { window.PdfViewer.start(box); }, { once: true });
        }
        paint();
        return {};
      },
    },

    music: {
      title: "Music", icon: "music", w: 340, h: 240, minW: 230, minH: 236, keys: [],
      build: function (body, panel) {
        // Classroom music from YouTube: YouTube's own player (its play, pause and volume) filling the
        // panel. The ⋯ button by the × (or a right-click on the panel's edge) opens a menu: change the
        // song (a link to a song or a playlist), the last songs, and Pop out, which opens the song on
        // YouTube in its own small window that can be minimized. The video stays at least 200 × 200:
        // YouTube's rules for embedded players don't allow hiding it or playing only its sound. It
        // keeps playing as you change slides.
        // Remembered in this browser: { link, recent: [links], titles: {link: title} }.
        const state = function () { return Object.assign({ link: "", recent: [], titles: {} }, load("music", {})); };
        const screen = h("div", { class: "ct-music-screen" });
        const menu = h("div", { class: "ct-music-menu", role: "menu", hidden: true });
        const more = h("button", { class: "ct-ctrl ct-music-more", "aria-label": "Music menu", title: "Change the song, recent songs, pop out",
          onclick: function (e) { e.stopPropagation(); showMenu(menu.hidden); } }, icon("ellipsis"));
        const ctrls = panel.querySelector(".ct-ctrls");
        ctrls.insertBefore(more, ctrls.lastChild);
        body.append(screen, menu);
        panel.addEventListener("contextmenu", function (e) { e.preventDefault(); showMenu(true); });
        function outside(e) { if (!menu.hidden && !menu.contains(e.target) && !more.contains(e.target)) showMenu(false); }
        document.addEventListener("pointerdown", outside);

        let player = null;

        // A box for a link: in the menu, and in the middle of the panel before the first song
        function linkBox(focus) {
          const field = h("input", { class: "ct-input ct-music-field", type: "url", value: state().link,
            placeholder: "Paste a YouTube link: a song or a playlist", "aria-label": "YouTube link",
            onkeydown: function (e) { if (e.key === "Enter") use(field.value); } });
          if (focus) setTimeout(function () { field.select(); }, 0);
          return h("div", { class: "ct-music-link" }, field, h("button", { class: "ct-btn ct-primary ct-small", text: "Play", onclick: function () { use(field.value); } }));
        }
        function showMenu(on) {
          if (!on) { menu.hidden = true; return; }
          const s = state();
          menu.replaceChildren(h("div", { class: "ct-music-menu-label", text: "Change song" }), linkBox(true));
          const others = s.recent.filter(function (x) { return x !== s.link; });
          if (others.length) {
            menu.append(h("div", { class: "ct-music-menu-label", text: "Last songs" }));
            others.forEach(function (link) {
              menu.append(h("button", { class: "ct-music-item", role: "menuitem", title: link,
                text: s.titles[link] || link.replace(/^https?:\/\/(www\.)?/, ""), onclick: function () { use(link); } }));
            });
          }
          if (s.link) menu.append(h("button", { class: "ct-music-item ct-music-pop", role: "menuitem",
            title: "Opens the song on YouTube in its own small window: minimize it and the music keeps playing",
            text: "Pop out to a small YouTube window", onclick: popOut }));
          menu.hidden = false;
        }

        // A YouTube link to { id, list }: watch?v=, youtu.be/, shorts/, embed/, a playlist (list=), or a bare video id
        function parse(link) {
          link = (link || "").trim();
          if (/^[\w-]{11}$/.test(link)) return { id: link, list: null };
          try {
            const u = new URL(/^\w+:\/\//.test(link) ? link : "https://" + link);
            if (!/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/.test(u.hostname)) return null;
            const id = /youtu\.be$/.test(u.hostname) ? u.pathname.slice(1, 12)
              : u.searchParams.get("v") || (u.pathname.match(/\/(shorts|embed|live)\/([\w-]{11})/) || [])[2] || null;
            const list = u.searchParams.get("list");
            return id || list ? { id: id, list: list } : null;
          } catch (e) { return null; }
        }

        // YouTube's player code, loaded once for the page
        function api(then) {
          if (window.YT && window.YT.Player) return then();
          const wait = window.chalklineYT = window.chalklineYT || [];
          wait.push(then);
          if (wait.length > 1) return;
          const before = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = function () {
            if (before) before();
            wait.splice(0).forEach(function (f) { f(); });
          };
          document.head.append(h("script", { src: "https://www.youtube.com/iframe_api", onerror: function () {
            wait.length = 0;
            note("Can't reach YouTube from here.");
          } }));
        }
        function note(text) { screen.replaceChildren(h("div", { class: "ct-music-note", text: text })); }

        // Play a link (start: false when the panel comes back in the next deck: ready, not playing)
        function use(link, start) {
          const v = parse(link);
          if (!v) { showMenu(true); menu.prepend(h("div", { class: "ct-music-error", text: "That isn't a YouTube link." })); return; }
          const s = state();
          s.link = link.trim();
          s.recent = [s.link].concat(s.recent.filter(function (x) { return x !== s.link; })).slice(0, 5);
          save("music", s);
          showMenu(false);
          note("…");
          api(function () {
            // a new link gets a new player: simplest for switching between songs and playlists
            if (player && player.destroy) player.destroy();
            const holder = h("div", {});   // YouTube's player replaces this
            screen.replaceChildren(holder);
            const vars = { playsinline: 1, rel: 0, autoplay: start === false ? 0 : 1 };
            if (v.list) { vars.listType = "playlist"; vars.list = v.list; }
            player = new YT.Player(holder, {
              width: "100%", height: "100%", videoId: v.id || undefined, playerVars: vars,
              events: {
                onStateChange: function () {   // remember the song's name for the menu
                  const d = player.getVideoData && player.getVideoData(), now = state();
                  if (d && d.title && now.titles[now.link] !== d.title) { now.titles[now.link] = d.title; save("music", now); }
                },
                onError: function () { note("YouTube won't play this one here (it may not allow playing on other sites). Try another link: ⋯"); },
              },
            });
          });
        }
        function popOut() {
          const v = parse(state().link);
          showMenu(false);
          if (!v) return;
          const url = "https://www.youtube.com/" + (v.id ? "watch?v=" + v.id + (v.list ? "&list=" + v.list : "") : "playlist?list=" + v.list);
          if (player && player.pauseVideo) player.pauseVideo();   // one at a time
          window.open(url, "chalkline-music", "width=520,height=380");
        }

        if (state().link) use(state().link, false);   // ready to go, not playing yet
        else screen.replaceChildren(h("div", { class: "ct-music-ask" },
          h("div", { class: "ct-music-note", text: "Music from YouTube" }), linkBox(true)));
        return { close: function () {
          document.removeEventListener("pointerdown", outside);
          if (player && player.destroy) player.destroy();
          player = null;
        } };
      },
    },

    dice: {
      title: "Dice", icon: "dices", w: 360, h: 240, minW: 250, minH: 190, keys: ["dice"],
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
  // The tools in their own files (tools/*.js): web components, each with its own tag and styles
  Object.assign(TOOLS, window.ChalklineToolbox.tools);

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
  function fromControl(e) {   // the path, not just the target: inside a tool's web component too
    return e.composedPath().some(function (n) { return n.nodeType === 1 && n.matches(NO_DRAG); });
  }
  function dragger(panel, id, handle, resize) {
    handle.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || (!resize && fromControl(e))) return;
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
        if (dragging) { delete p.auto; saveLayout(); }   // moved or resized on purpose: it stays that way
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
    const saved = layout.pos[id];
    if (tool.start && (!saved || saved.auto || (tool.oldDefault && tool.oldDefault(saved)))) {
      layout.pos[id] = Object.assign({ w: tool.w, h: tool.h }, tool.start(), { auto: true });   // until it's dragged (start may size it too)
    }
    const p = layout.pos[id] || (layout.pos[id] = { x: 80 + 36 * n, y: 70 + 36 * n, w: tool.w, h: tool.h });
    const close = h("button", { class: "ct-ctrl ct-close", "aria-label": "Close " + tool.title, title: "Close", onclick: function () { closeTool(id); } }, icon("x"));
    const body = h("div", { class: "ct-body ct-" + id });
    const grip = h("div", { class: "ct-grip", title: "Drag to resize" });
    // No title bar: the tool is the message. × (and a tool's own extras) show when you point at it.
    // A free tool draws its own card (the traffic light's case), so it has no white card around it.
    const panel = h("div", { class: "ct-panel" + (tool.free ? " ct-free" : ""), role: "dialog", "aria-label": tool.title },
      body, h("div", { class: "ct-ctrls" }, close), grip);
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
    let api;
    if (tool.element) {   // a tool in its own file: its web component fills the panel
      const el = document.createElement(tool.element);
      body.append(el);
      api = { refresh: function () { el.refresh(); }, close: function () { el.close(); } };
    }
    else api = tool.build(body, panel, grow) || {};
    open[id] = { panel: panel, api: api };
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
    const b = e.composedPath().find(function (n) { return n.tagName === "BUTTON"; });   // inside a web component too
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

  // The menu: the tools as tiles, in groups
  const MENU = [
    ["People", ["picker", "groups", "scoreboard"]],
    ["Attention", ["voice", "traffic", "spotlight"]],
    ["Time", ["clock", "stopwatch"]],
    ["This unit", ["vocab", "packet", "qr"]],
    ["More", ["music", "dice", "slide"]],
  ];
  function paintMenu() {
    menu.textContent = "";
    menu.append(h("div", { class: "ct-menu-title" }, "Classroom tools", h("kbd", { class: "ct-menu-key", title: "Press W to open and close this menu", text: "W" })));
    const listed = [].concat.apply([], MENU.map(function (g) { return g[1]; }));
    const groups = MENU.map(function (g) { return [g[0], g[1].slice()]; });
    Object.keys(TOOLS).forEach(function (id) { if (listed.indexOf(id) < 0) groups[groups.length - 1][1].push(id); });   // a new tool goes under More
    groups.forEach(function (g) {
      const ids = g[1].filter(function (id) { return TOOLS[id]; });
      if (!ids.length) return;
      menu.append(h("div", { class: "ct-menu-group", text: g[0] }));
      const grid = h("div", { class: "ct-menu-grid" });
      ids.forEach(function (id) {
        const t = TOOLS[id];
        grid.append(h("button", { class: "ct-menu-item" + (open[id] ? " ct-on" : ""), role: "menuitemcheckbox",
          "aria-checked": open[id] ? "true" : "false",
          onclick: function () { open[id] ? closeTool(id) : openTool(id); } },
          h("span", { class: "ct-menu-icon" }, icon(t.icon)), h("span", { class: "ct-menu-name", text: t.title }),
          open[id] ? h("span", { class: "ct-check" }, icon("check")) : null));
      });
      menu.append(grid);
    });
    const foot = h("div", { class: "ct-menu-foot" });
    if (Object.keys(open).length) {
      foot.append(h("button", { class: "ct-menu-action",
        onclick: function () { Object.keys(open).forEach(function (id) { closeTool(id); }); toggleMenu(false); } },
        icon("x"), h("span", { text: "Close all" })));
    }
    foot.append(h("button", { class: "ct-menu-action", onclick: function () { toggleMenu(false); showReset(); } },
      icon("rotate-ccw"), h("span", { text: "Reset for the next class…" })));
    menu.append(foot);
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
        h("button", { class: "ct-btn ct-primary", onclick: function () {
          const pick = {};
          items.forEach(function (i) { pick[i.key] = boxes[i.key].checked; });
          resetAll(pick);
          close();
        } }, icon("rotate-ccw"), " Reset"),
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
  // The slide's size settles once the deck is ready, and changes with the window: a clock that
  // hasn't been dragged follows the space beside the slide.
  function reseatClock() {
    const p = layout.pos.clock;
    if (!open.clock || !p || !p.auto) return;
    Object.assign(p, TOOLS.clock.start());
    place(open.clock.panel, clampPos(p, TOOLS.clock));
  }
  if (Reveal.isReady()) reseatClock(); else Reveal.on("ready", reseatClock);
  Reveal.on("resize", reseatClock);
  paintMenu();
})();
