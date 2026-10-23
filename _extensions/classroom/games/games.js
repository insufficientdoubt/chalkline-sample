/*
  Slide games: Snowman, Picture reveal, Jeopardy and Quick-fire. Each one is a
  <div class="cg-game" data-game="..." data-config="{json}"> made by shortcodes.lua
  (words from the vocab list) or filter.lua (questions you write in a ::: div).

  config.words   [{ word, hint, image, example }] from the vocab list, or your own word
  config.random  true: a random word (🔀 picks a new one); false: always the same word or questions

  The games keep their own score (if any). They don't use the classroom toolbox's scoreboard,
  so they work the same whether or not it's open.
*/
(function () {
  const COLORS = ["#0087ff", "#ff8c0f", "#2e9e4f", "#7b4fc9", "#e5383b", "#1a9e9e", "#d6458f", "#e0a800"];

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
  function list(x) { return Array.isArray(x) ? x : []; }   // an empty Lua table arrives as {}
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // A random word, not the same as last time when there's a choice.
  function picker(words) {
    let last = -1;
    return function () {
      if (words.length < 2) return words[0];
      let i;
      do { i = Math.floor(Math.random() * words.length); } while (i === last);
      last = i;
      return words[i];
    };
  }
  function beep(freq, length, volume, delay) {
    try {
      const ctx = beep.ctx || (beep.ctx = new (window.AudioContext || window.webkitAudioContext)());
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + (delay || 0);
      o.frequency.value = freq;
      g.gain.setValueAtTime(volume, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + length);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + length);
    } catch (e) { /* no sound available */ }
  }
  function cheer() { [523, 659, 784, 1047].forEach(function (f, i) { beep(f, 0.25, 0.15, i * 0.09); }); }
  function button(text, onclick, cls) { return h("button", { class: "cg-btn" + (cls ? " " + cls : ""), text: text, onclick: onclick }); }
  function onCurrentSlide(el) {
    return !window.Reveal || (Reveal.getCurrentSlide() && Reveal.getCurrentSlide().contains(el));
  }
  // Clicked buttons give the focus back to the slides, so Space and the arrows still change slides.
  document.addEventListener("click", function (e) {
    const b = e.target.closest && e.target.closest(".cg-game button");
    if (b) b.blur();
  });

  // Letters typed on the keyboard go to the game on the current slide (not to reveal.js's shortcuts).
  const keyHandlers = [];
  window.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test((document.activeElement || {}).tagName)) return;
    for (const k of keyHandlers) {
      if (onCurrentSlide(k.el) && k.fn(e)) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    }
  }, true);

  /* ---------------- Snowman (hangman, but a snowman melts) ---------------- */

  // The parts that melt away, one for each wrong letter; the last wrong letter melts the rest.
  const PARTS = ["hat", "arm-left", "arm-right", "scarf", "buttons", "nose", "face"];
  const SNOWMAN_SVG =
    '<svg viewBox="0 0 220 290" aria-hidden="true">' +
    '<ellipse class="cg-puddle" cx="110" cy="272" rx="92" ry="12"/>' +
    '<g class="cg-body">' +
      '<circle cx="110" cy="222" r="54" class="cg-snow"/>' +
      '<circle cx="110" cy="140" r="40" class="cg-snow"/>' +
      '<circle cx="110" cy="76" r="30" class="cg-snow"/>' +
      '<g class="cg-part" data-part="buttons"><circle cx="110" cy="124" r="4.5"/><circle cx="110" cy="142" r="4.5"/><circle cx="110" cy="160" r="4.5"/></g>' +
      '<g class="cg-part" data-part="face"><circle cx="99" cy="70" r="4"/><circle cx="121" cy="70" r="4"/>' +
        '<path d="M98 88 Q110 96 122 88" fill="none" stroke="#22262e" stroke-width="3" stroke-linecap="round"/></g>' +
      '<path class="cg-part" data-part="nose" d="M110 78 L136 83 L110 86 Z" fill="#ff8c0f"/>' +
      '<g class="cg-part" data-part="scarf" fill="#e5383b"><rect x="80" y="100" width="60" height="12" rx="6"/><rect x="118" y="104" width="12" height="34" rx="5"/></g>' +
      '<path class="cg-part" data-part="arm-left" d="M74 132 L32 104 M46 113 L36 96 M46 113 L28 116" stroke="#7a4b24" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<path class="cg-part" data-part="arm-right" d="M146 132 L188 104 M174 113 L184 96 M174 113 L192 116" stroke="#7a4b24" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<g class="cg-part" data-part="hat" fill="#22262e"><rect x="82" y="44" width="56" height="8" rx="3"/><rect x="92" y="8" width="36" height="40" rx="4"/>' +
        '<rect x="92" y="36" width="36" height="7" fill="#0087ff"/></g>' +
    '</g></svg>';

  function snowman(root, cfg) {
    const words = list(cfg.words), next = picker(words);
    let w, guessed, wrong, over;
    const figure = h("div", { class: "cg-snowman-figure" });
    figure.innerHTML = SNOWMAN_SVG;
    const word = h("div", { class: "cg-word" });
    const status = h("div", { class: "cg-status" });
    const hint = h("div", { class: "cg-hint", hidden: true });
    const keys = h("div", { class: "cg-keys" });
    const hintBtn = button("💡 Hint", function () { hint.hidden = !hint.hidden; });
    const tools = h("div", { class: "cg-tools" }, hintBtn, button("Show the word", function () { finish(false, true); }),
      cfg.random ? button("🔀 New word", start, "cg-new") : "");
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function (L) {
      keys.append(h("button", { class: "cg-key", text: L, "data-key": L, onclick: function () { guess(L); } }));
    });
    root.append(figure, h("div", { class: "cg-snowman-play" }, word, status, keys, hint, tools));

    function letters() { return w.word.toUpperCase(); }
    function isLetter(ch) { return /\p{L}/u.test(ch); }
    function start() {
      w = next();
      if (!w) { status.textContent = "No words."; return; }
      guessed = new Set(); wrong = 0; over = false;
      root.classList.remove("cg-won", "cg-lost");
      figure.querySelectorAll(".cg-part").forEach(function (p) { p.classList.remove("cg-gone"); });
      hint.hidden = true;
      hint.textContent = "";
      if (w.image) hint.append(h("img", { src: w.image, alt: "" }));
      hint.append(h("span", { text: w.hint || "No hint for this one." }));
      keys.querySelectorAll(".cg-key").forEach(function (k) { k.disabled = false; k.className = "cg-key"; });
      paint();
    }
    function paint(reveal) {
      word.textContent = "";
      letters().split(" ").forEach(function (part) {
        const group = h("span", { class: "cg-word-part" });
        Array.from(part).forEach(function (ch) {
          const shown = !isLetter(ch) || guessed.has(ch) || reveal;
          group.append(h("span", { class: "cg-letter" + (isLetter(ch) ? "" : " cg-mark") + (reveal && !guessed.has(ch) && isLetter(ch) ? " cg-missed" : ""),
            text: shown ? ch : "" }));
        });
        word.append(group);
      });
      const left = PARTS.length - wrong;
      status.textContent = over ? status.textContent : left + (left === 1 ? " wrong guess left" : " wrong guesses left");
    }
    function guess(L) {
      if (over || !w || guessed.has(L)) return;
      guessed.add(L);
      const key = keys.querySelector('[data-key="' + L + '"]');
      const hit = letters().indexOf(L) >= 0;
      if (key) { key.disabled = true; key.classList.add(hit ? "cg-hit" : "cg-miss"); }
      if (!hit) {
        const part = figure.querySelector('[data-part="' + PARTS[wrong] + '"]');
        if (part) part.classList.add("cg-gone");
        wrong++;
        beep(220, 0.2, 0.12);
      } else beep(660, 0.12, 0.1);
      paint();
      if (Array.from(letters()).every(function (ch) { return !isLetter(ch) || guessed.has(ch); })) finish(true);
      else if (wrong >= PARTS.length) finish(false);
    }
    function finish(won, shown) {
      if (over || !w) return;
      over = true;
      root.classList.add(won ? "cg-won" : "cg-lost");
      if (!won) figure.querySelectorAll(".cg-part").forEach(function (p) { p.classList.add("cg-gone"); });
      status.textContent = won ? "You saved the snowman! ⛄" : shown ? "The word was:" : "Oh no, it melted! The word was:";
      paint(!won);
      if (won) cheer();
    }
    keyHandlers.push({ el: root, fn: function (e) {
      if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) return false;
      guess(e.key.toUpperCase());
      return true;
    } });
    start();
    return start;   // reset: a fresh game (a new word if it's random)
  }

  /* ---------------- Picture reveal ---------------- */

  function pictureReveal(root, cfg) {
    const words = list(cfg.words), next = picker(words);
    const n = Math.round(Math.sqrt(cfg.tiles || 16)) || 4;   // 9, 16 or 25 tiles: 3, 4 or 5 a side
    let w, opened;
    const img = h("img", { class: "cg-reveal-img", alt: "" });
    const tiles = h("div", { class: "cg-tiles", style: "--n:" + n });
    const answer = h("div", { class: "cg-answer" });
    const count = h("div", { class: "cg-status" });
    root.append(h("div", { class: "cg-reveal-box" }, img, tiles),
      h("div", { class: "cg-reveal-side" }, count, answer,
        h("div", { class: "cg-tools cg-tools-column" },
          button("Show the answer", function () { showAnswer(); }, "cg-primary"),
          button("Show the whole picture", function () { tiles.querySelectorAll(".cg-tile").forEach(function (t) { t.classList.add("cg-open"); }); }),
          cfg.random ? button("🔀 New picture", start, "cg-new") : "")));

    function start() {
      w = next();
      if (!w) { count.textContent = "No pictures."; return; }
      opened = 0;
      img.src = w.image;
      answer.textContent = "";
      answer.classList.remove("cg-shown");
      tiles.textContent = "";
      for (let i = 0; i < n * n; i++) {
        tiles.append(h("button", { class: "cg-tile", text: i + 1, style: "--tile:" + COLORS[(i + Math.floor(i / n)) % COLORS.length],
          onclick: function (e) {
            if (e.currentTarget.classList.contains("cg-open")) return;
            e.currentTarget.classList.add("cg-open");
            opened++;
            paint();
          } }));
      }
      paint();
    }
    function paint() { count.textContent = "Tiles opened: " + opened + " of " + n * n; }
    function showAnswer() {
      if (!w) return;
      answer.textContent = w.word;
      answer.classList.add("cg-shown");
      tiles.querySelectorAll(".cg-tile").forEach(function (t) { t.classList.add("cg-open"); });
      cheer();
    }
    start();
    return start;
  }

  /* ---------------- Jeopardy ---------------- */

  // From the vocab list: three kinds of clue, one column each, a different word in every square.
  function vocabBoard(words, rows) {
    function gap(w) {   // the example sentence with the word blanked out, or "" if it isn't in there
      if (!w.example) return "";
      const re = new RegExp(w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      return re.test(w.example) ? w.example.replace(re, "_____") : "";
    }
    const pool = shuffle(words);
    const take = function (ok) {
      const i = pool.findIndex(ok);
      return i < 0 ? null : pool.splice(i, 1)[0];
    };
    rows = Math.max(1, Math.min(rows || 4, Math.floor(words.length / 3)));
    const cols = [
      { name: "What's the word?", make: function (w) { return { q: w.hint, a: w.word }; }, ok: function (w) { return !!w.hint; } },
      { name: "Picture", make: function (w) { return { q: "What is this?", image: w.image, a: w.word }; }, ok: function (w) { return !!w.image; } },
      { name: "Fill the gap", make: function (w) { return { q: gap(w), a: w.word }; }, ok: function (w) { return !!gap(w); } },
    ];
    return cols.map(function (c) {
      const clues = [];
      for (let r = 0; r < rows; r++) {
        const w = take(c.ok) || take(function () { return true; });
        if (w) clues.push(c.ok(w) ? c.make(w) : { q: w.hint, a: w.word });
      }
      return { name: c.name, clues: clues };
    });
  }

  // Teams (2 to 4, or teams=0 for none) take turns: the team whose turn it is chooses a square,
  // answers, and the teacher marks it right (the points go to that team) or wrong (no points).
  // Either way the turn passes to the next team. Tap a team to give it the turn.
  const TEAM_COLORS = ["#0087ff", "#ff8c0f", "#2e9e4f", "#7b4fc9"];

  function jeopardy(root, cfg) {
    const useTeams = cfg.teams !== 0;
    let teams = [], turn = 0, cells = 0, used = 0;
    const bar = h("div", { class: "cg-teams" });
    const board = h("div", { class: "cg-board" });
    const card = h("div", { class: "cg-clue", hidden: true });
    root.append(useTeams ? bar : "", h("div", { class: "cg-board-wrap" }, board, card),   // the clue covers the board, not the teams
      !useTeams && cfg.random ? h("div", { class: "cg-tools" }, button("🔀 New board", start, "cg-new")) : "");

    function setTeams(n) {
      n = Math.max(2, Math.min(4, n));
      while (teams.length < n) teams.push({ name: "Team " + (teams.length + 1), score: 0 });
      teams.length = n;
      turn = turn % n;
      paintTeams();
    }
    function paintTeams() {
      if (!useTeams) return;
      bar.textContent = "";
      const top = Math.max.apply(null, teams.map(function (t) { return t.score; }));
      teams.forEach(function (t, i) {
        bar.append(h("button", { class: "cg-team" + (i === turn ? " cg-turn" : ""), style: "--team:" + TEAM_COLORS[i],
          title: "Give this team the turn", onclick: function () { turn = i; paintTeams(); } },
          h("span", { class: "cg-team-name", text: (i === turn ? "▶ " : "") + t.name + (top > 0 && t.score === top ? " 👑" : "") }),
          h("span", { class: "cg-team-score", text: t.score })));
      });
      bar.append(h("span", { class: "cg-team-tools" },
        h("button", { class: "cg-btn cg-small", text: "−", title: "Fewer teams", onclick: function () { setTeams(teams.length - 1); } }),
        h("button", { class: "cg-btn cg-small", text: "+", title: "More teams", onclick: function () { setTeams(teams.length + 1); } }),
        cfg.random ? button("🔀", start, "cg-new cg-small") : ""));
    }
    function start() {
      const cats = cfg.random ? vocabBoard(list(cfg.words), cfg.rows) : list(cfg.categories);
      const rows = Math.max.apply(null, cats.map(function (c) { return list(c.clues).length; }).concat([0]));
      const points = list(cfg.points);
      board.textContent = "";
      board.style.setProperty("--cols", Math.max(cats.length, 1));
      cats.forEach(function (c, i) { board.append(h("div", { class: "cg-cat", style: "--cat:" + COLORS[i % COLORS.length], text: c.name })); });
      cells = 0; used = 0;
      for (let r = 0; r < rows; r++) {
        cats.forEach(function (c, i) {
          const clue = list(c.clues)[r];
          const value = points[r] || (r + 1) * 100;
          if (clue) cells++;
          board.append(clue
            ? h("button", { class: "cg-cell", style: "--cat:" + COLORS[i % COLORS.length], text: value,
                onclick: function (e) { open(e.currentTarget, c.name, value, clue); } })
            : h("div", { class: "cg-cell cg-empty" }));
        });
      }
      teams.forEach(function (t) { t.score = 0; });
      turn = 0;
      card.hidden = true;
      paintTeams();
    }
    function open(cell, cat, value, clue) {
      const team = teams[turn];
      const answer = h("div", { class: "cg-clue-answer", hidden: true, text: clue.a });
      const marking = h("div", { class: "cg-tools", hidden: true },
        button("✓ Right  +" + value, function () { done(cell, true, value); }, "cg-right-btn"),
        button("✗ Wrong", function () { done(cell, false, value); }, "cg-wrong-btn"));
      const tools = h("div", { class: "cg-tools" });
      const show = button("Show the answer", function () {
        answer.hidden = false; show.hidden = true; cheer();
        if (useTeams) { marking.hidden = false; tools.hidden = true; }
        else cell.classList.add("cg-done");
      }, "cg-primary");
      tools.append(show, button("Back to the board", function () { card.hidden = true; }));
      card.textContent = "";
      card.style.setProperty("--team", useTeams ? TEAM_COLORS[turn] : "transparent");
      card.append(h("div", { class: "cg-clue-head", text: (useTeams ? team.name + " · " : "") + cat + " · " + value }),
        clue.image ? h("img", { class: "cg-clue-img", src: clue.image, alt: "" }) : "",
        h("div", { class: "cg-clue-q", text: clue.q }), answer, tools, marking);
      card.classList.toggle("cg-team-card", useTeams);
      card.hidden = false;
    }
    function done(cell, right, value) {
      if (!cell.classList.contains("cg-done")) used++;
      cell.classList.add("cg-done");
      if (right) { teams[turn].score += value; beep(880, 0.15, 0.12); } else beep(196, 0.25, 0.12);
      turn = (turn + 1) % teams.length;
      card.hidden = true;
      paintTeams();
      if (used >= cells) finish();
    }
    function finish() {
      const top = Math.max.apply(null, teams.map(function (t) { return t.score; }));
      const winners = teams.filter(function (t) { return t.score === top; });
      card.textContent = "";
      card.style.setProperty("--team", winners.length === 1 ? TEAM_COLORS[teams.indexOf(winners[0])] : "#ffc61a");
      card.append(h("div", { class: "cg-clue-head", text: "Game over" }),
        h("div", { class: "cg-clue-q cg-winner", text: winners.length === 1 ? winners[0].name + " wins! 🏆" : "It's a tie! 🤝" }),
        h("div", { class: "cg-final" }, ...teams.map(function (t, i) {
          return h("span", { class: "cg-final-team", style: "--team:" + TEAM_COLORS[i], text: t.name + ": " + t.score });
        })),
        h("div", { class: "cg-tools" }, button("Play again", start, "cg-primary"), button("Back to the board", function () { card.hidden = true; })));
      card.classList.add("cg-team-card");
      card.hidden = false;
      cheer();
    }
    if (useTeams) setTeams(cfg.teams || 2);
    start();
    return start;   // reset: scores to 0, turn to team 1, every square back (a new board if it's random)
  }

  /* ---------------- Quick-fire (trivia) ---------------- */

  // A question pops up with a countdown; the teacher points to a student, who answers out loud.
  // Show the answer, then mark it right or wrong. The score is kept here, for this game only.
  const BACKS = [["#ff5f6d", "#ffc371"], ["#2193b0", "#6dd5ed"], ["#8e2de2", "#4a00e0"], ["#11998e", "#38ef7d"],
    ["#fc4a1a", "#f7b733"], ["#ee0979", "#ff6a00"], ["#0575e6", "#00f260"], ["#c94b4b", "#4b134f"]];

  function trivia(root, cfg) {
    const pick = picker(list(cfg.words));
    let qs, i, marks, timer = 0;
    const stage = h("div", { class: "cg-quiz-stage" });
    const dots = h("div", { class: "cg-dots" });
    const score = h("div", { class: "cg-score" });
    root.append(h("div", { class: "cg-quiz-top" }, dots, score), stage);

    function questions() {
      if (!cfg.random) return list(cfg.questions);
      const out = [], seen = new Set(), n = Math.min(cfg.count || 5, list(cfg.words).length);
      while (out.length < n) {
        const w = pick();
        if (seen.has(w.word)) continue;
        seen.add(w.word);
        out.push(w.image && out.length % 2 ? { q: "What is this?", image: w.image, a: w.word } : { q: "Which word means: " + w.hint, a: w.word });
      }
      return out;
    }
    function begin(fresh) {
      if (fresh || !qs) qs = questions();
      i = -1; marks = [];
      stop();
      stage.textContent = "";
      stage.style.background = "linear-gradient(135deg, #003477, #0087ff)";
      stage.append(h("div", { class: "cg-quiz-title", text: cfg.title || "Quick-fire!" }),
        h("div", { class: "cg-quiz-sub", text: qs.length + " questions" + (cfg.seconds ? " · " + cfg.seconds + " seconds each" : "") }),
        h("div", { class: "cg-tools" }, button("Start ▶", next, "cg-big")));
      paintTop();
    }
    function stop() { clearInterval(timer); timer = 0; }
    function paintTop() {
      dots.textContent = "";
      (qs || []).forEach(function (_, j) {
        dots.append(h("span", { class: "cg-dot" + (marks[j] === true ? " cg-right" : marks[j] === false ? " cg-wrong" : j === i ? " cg-now" : "") }));
      });
      const right = marks.filter(function (m) { return m === true; }).length;
      score.textContent = "✓ " + right + "   ✗ " + (marks.length - right);
    }
    function next() {
      stop();
      i++;
      if (i >= qs.length) { end(); return; }
      const q = qs[i], back = BACKS[i % BACKS.length];
      const bar = h("div", { class: "cg-timer-fill" });
      const answer = h("div", { class: "cg-quiz-answer", hidden: true, text: q.a });
      const marking = h("div", { class: "cg-tools", hidden: true },
        button("✓ Right", function () { mark(true); }, "cg-right-btn"),
        button("✗ Wrong", function () { mark(false); }, "cg-wrong-btn"));
      const show = button("Show the answer", function () {
        stop(); show.hidden = true; answer.hidden = false; marking.hidden = false;
      }, "cg-big");
      stage.textContent = "";
      stage.style.background = "linear-gradient(135deg, " + back[0] + ", " + back[1] + ")";
      stage.append(h("div", { class: "cg-quiz-num", text: "Question " + (i + 1) + " of " + qs.length }),
        q.image ? h("img", { class: "cg-quiz-img", src: q.image, alt: "" }) : "",
        h("div", { class: "cg-quiz-q", text: q.q }),
        cfg.seconds ? h("div", { class: "cg-timer" }, bar) : "",
        answer, h("div", { class: "cg-tools" }, show), marking);
      stage.classList.remove("cg-pop"); void stage.offsetWidth; stage.classList.add("cg-pop");
      paintTop();
      if (cfg.seconds) {
        const endAt = Date.now() + cfg.seconds * 1000;
        timer = setInterval(function () {
          const left = Math.max(0, endAt - Date.now());
          bar.style.width = (100 * left / (cfg.seconds * 1000)) + "%";
          bar.parentNode.classList.toggle("cg-hurry", left < 3000);
          if (!left) {
            stop();
            bar.parentNode.classList.add("cg-out");
            beep(330, 0.35, 0.2); beep(262, 0.5, 0.2, 0.3);
          }
        }, 50);
      }
    }
    function mark(ok) {
      marks[i] = ok;
      if (ok) beep(880, 0.15, 0.12); else beep(196, 0.25, 0.12);
      next();
    }
    function end() {
      const right = marks.filter(function (m) { return m === true; }).length;
      stage.textContent = "";
      stage.style.background = "linear-gradient(135deg, #003477, #7b4fc9)";
      stage.append(h("div", { class: "cg-quiz-title", text: right + " of " + qs.length + " right!" }),
        h("div", { class: "cg-quiz-sub", text: right === qs.length ? "Perfect! 🎉" : right >= qs.length / 2 ? "Great work! 👏" : "Good try! Let's review. 💪" }),
        h("div", { class: "cg-tools" }, button("Start over", function () { begin(false); }),
          cfg.random ? button("🔀 New questions", function () { begin(true); }, "cg-new") : ""));
      paintTop();
      if (right === qs.length) cheer();
    }
    begin(true);
    return function () { begin(!!cfg.random); };   // reset: back to Start (new questions if random)
  }

  /* ---------------- Start every game on the page ---------------- */

  const GAMES = { "snowman": snowman, "picture-reveal": pictureReveal, "jeopardy": jeopardy, "trivia": trivia };
  const resets = [];
  document.querySelectorAll(".cg-game").forEach(function (el) {
    let cfg = {};
    try { cfg = JSON.parse(el.dataset.config || "{}"); } catch (e) { /* leave it empty */ }
    if (GAMES[el.dataset.game]) resets.push(GAMES[el.dataset.game](el, cfg));
  });
  // The toolbox's "Reset for the next class" starts every game in the deck again.
  document.addEventListener("chalkline:reset", function (e) {
    if (e.detail && e.detail.games) resets.forEach(function (r) { if (r) r(); });
  });
})();
