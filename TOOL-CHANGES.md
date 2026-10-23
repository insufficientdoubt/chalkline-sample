# Changes to the tool

A log of changes to how Chalkline works or looks (code, styles, settings), as opposed to lesson content. AI assistants add an entry here whenever they change a tool file (see "Changing the tool" in `CLAUDE.md`); you can add entries by hand too.

**Why it matters:** this is design feedback. Send this file to John now and then: useful changes may be built into Chalkline for every teacher.

Newest entries first.

<!-- Entries go below this line. Copy this template:

## YYYY-MM-DD: short title
- **Asked for:** what the teacher wanted, in their words if they gave them.
- **Why:** the reason they gave, or "not given".
- **Changed:** each file and what changed in it.
- **Who it helps:** this course only, or probably every Chalkline course.
- **AI assistant:** which one made the change.
-->

## 2026-10-23: Review games page: a more professional look
- **Asked for:** "Restyle the review games page. It looks very AI/vibe coded (which it is, but still). Give it a more professional look."
- **Why:** the rainbow pills and emoji looked unpolished.
- **Changed:** `_extensions/classroom/games/games.js`, `games.css`:
  - **Header:** one quiet header row. The games are a segmented control (a grey track with the chosen game raised in white) with simple line icons instead of emoji. Next to it are a **Unit** dropdown (it scales to any number of units) and a plain "← Overview" link. Only brand navy is used, with a thin rule under the header.
  - **The games, on this page only:** plain-word buttons (no emoji; Jeopardy's 🔀 becomes "New board") with small corners and thin borders, and navy picture tiles instead of many colors. The game slides in decks keep their playful look.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: A Review games page: any game, any unit
- **Asked for:** "Add a web page called review games. It should allow teachers to select a game and a units and play immediately."
- **Why:** to play a review game without making a deck first.
- **Changed:**
  - `course/review-games.qmd` (new): a one-slide page (no title slide, controls or progress bar) with the game picker. It's listed in the overview under "Whole year", and left out of the family site.
  - `_extensions/classroom/games/games.js`, `games.css`: the picker. A row of games (Snowman, Picture reveal, Jeopardy, Quick-fire), a row of units (All units, then each unit with its number), and the game below, using that unit's vocab. A ⌂ link goes back to the overview. The last choice is remembered in the browser. "Reset for the next class" restarts the current game. Keys typed for a game that has been replaced are ignored.
  - `_extensions/classroom/shortcodes.lua`: `{{< game-picker >}}`; game words now carry their units.
  - `scripts/vocab_terms.py`: `generated/vocab-terms.json` also lists each unit's number and title (from `course/vocab/*.yml`).
  - `_quarto.yml`: "Review games" in the sidebar, under the vocab app. `_quarto-parent.yml`: the overview script added the page to the family site's left-out list.
  - `README.md`; the Start-here "what else" slide links to it.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Jeopardy: scores under the board; rename teams, change scores
- **Asked for:** "visually segregate the score keeping area. Move scores to the bottom and add some space and a decorative line between the scores and the gameplay part. Allow the teacher to change team's names. Allow the teacher to click on the score to manually change it."
- **Why:** the scores above the board looked like part of the game.
- **Changed:** `_extensions/classroom/games/games.js`: the team bar is now under the board, after a divider. Tap a team's name to rename it, tap its score to type a new one (Enter or tapping away keeps it, Esc cancels), or tap the team anywhere else to give it the turn. Names stay when the board is reset. `games.css`: a gold dashed line with "SCORES" between the board and the teams; styles for the name, score and typing box. `README.md` and the Greek Word Games notes: updated.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Noise meter: the voice level sets the line; a cleaner look
- **Asked for:** "For the noise meter: the target sound level should be set by the voice level instruction. Not a separate slider. Also just put a bit of effort into making it look nicer/more cohesion."
- **Why:** the voice level already says how loud the room should be.
- **Changed:** `_extensions/classroom/toolbox/toolbox.js`: each voice level has a "too loud" line (Silent 22 to Presenter 74 on the meter's 0–100 scale), and picking a level moves it. The "Too loud at" slider is gone. Because microphones differ, ⚙ opens a **microphone sensitivity** setting (−3 to +3, saved) that moves every level's line together. The noise-meter button is a drawn microphone instead of 🔊. `toolbox.css`: the meter uses the level's color, with the track tinted up to the line and red after it, and the level's icon on the line. The status and count are chips, and Start/Stop, beep and ⚙ are small round buttons on one row. The "nearly too loud" color is amber, with no color transition (it flickered into olive). The narrow layout matches. `README.md`: updated.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Reset for the next class
- **Asked for:** "Add a global reset for the deck. Teachers should be able to reset all the games at once when they go to the next class."
- **Why:** to start fresh with the next class.
- **Changed:**
  - `_extensions/classroom/toolbox/toolbox.js`, `toolbox.css`: **↺ Reset for the next class…** at the bottom of the toolbox menu. It opens a checklist of what's in the deck: games, poll votes and timers (ticked), pen marks on PDFs and toolbox scores (not ticked), and going back to the first slide (ticked). It sends one `chalkline:reset` event, and the toolbox part resets scores, the noise count, the stopwatch and picked names.
  - `_extensions/classroom/games/games.js`: every game resets on the event (random games get a new word or board).
  - `_extensions/classroom/poll.html`: votes go back to 0 (no "Sure?" needed). `_extensions/classroom/countdown.html`: timers stop and go back to the start.
  - `_extensions/pdf-viewer/pdf-viewer.js`: clears the ink on every page of the deck's PDFs, including viewers on slides not shown yet.
  - `README.md`: documented.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Jeopardy: teams, turns and scores
- **Asked for:** "For the jeopardy game - add support for 2-4 teams and score keeping/ turn taking (highlight the current team)."
- **Why:** not given (Jeopardy is usually played in teams).
- **Changed:** `_extensions/classroom/games/games.js`: a team bar above the board (2 to 4 teams, with − and +). The current team is filled in and marked ▶. After **Show the answer**, **✓ Right +200** or **✗ Wrong** scores the clue and passes the turn; tap a team to give it the turn. A crown marks the leader, a winner card ends the game, and **Play again** restarts it. The clue card covers only the board, so the teams stay visible. Still separate from the toolbox scoreboard. `games.css`: team styles; the squares are a little shorter to make room. `shortcodes.lua`, `filter.lua`: `teams=` (default 2, `0` = no teams). `README.md` and the Greek Word Games deck: documented.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: A ↓ button when there's a slide below
- **Asked for:** "add a down arrow to the slides that have a slide below them." Also "put a code box on the first page which shows the short code that generates the game" (in the Greek Word Games deck: content, no log needed).
- **Why:** a column of slides is easy to miss: the only sign was reveal.js's small corner arrows.
- **Changed:** `_extensions/classroom/down-arrow.html` (new): a bouncing ↓ at the bottom center whenever the slide has one below it. Click it or press ↓; it hides in the overview, speaker-view previews and the slide PDFs. The running timer's small box moves up above it. `_extensions/classroom/filter.lua`: adds it to every deck (`down-arrow: false` turns it off). `README.md`: documented.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: AI instructions: real photos first for vocab pictures
- **Asked for:** "When adding vocabulary, prefer high quality creative Commons or public source images. Wikimedia, unsplash, etc. generate original images when the public source images don't provide a high quality image that is distinct, clear, and memorable ... New one should be reserved for cases where we don't have a good way to illustrate the point."
- **Why:** many vocab words are clearer and more memorable as a real image than as a generated drawing.
- **Changed:** `CLAUDE.md` (which `AGENTS.md` and `GEMINI.md` point to): a rule to look for an open-licensed real image first, and to make a drawing only when none works; picture credits go in `CREDITS.md` (`course/links.yml` is for links). `vocab/README.md`: a "Pictures" section: where to search, which licenses to use or avoid, quality checks, size (4:3, about 800 × 600, under 200 KB) and how to credit. `vocab/images/CREDITS.md` (new): the credits table for vocab pictures. Not tool files, but logged because the rule would suit every course.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Slide games: Snowman, Picture reveal, Jeopardy, Quick-fire
- **Asked for:** "build snowman hangman, picture reveal and jeopardy. Do not integrate these with the group score tools ... Keep them separate. Give teachers the option of having random vocabulary, unit specific vocabulary, or writing the answers in the shortcode directly. If it's random ... a replay button ... If it's not random then it shouldn't have that." Also "a trivia style game ... the teacher would just point to the student and they would answer orally and then reveal the answer and mark it as right or wrong but keep score."
- **Why:** templates for interactive review on the board.
- **Changed:**
  - `_extensions/classroom/games/games.js`, `games.css` (new): the four games. Typed letters go to Snowman, not to the slide shortcuts. 🔀 appears only when the word is random. Quick-fire keeps its own score and has a timer that runs out. No 中文 anywhere (review material).
  - `_extensions/classroom/games/games.lua` (new): shared helpers that turn a game into a `<div>` with its settings, plus a one-line note outside slides.
  - `_extensions/classroom/shortcodes.lua`: `{{< snowman >}}`, `{{< picture-reveal >}}`, `{{< jeopardy >}}` and `{{< trivia >}}`, with random words (all vocab or `unit=N`), a named vocab word, or your own word, hint and image (copied to the site).
  - `_extensions/classroom/filter.lua`: `::: {.jeopardy}` and `::: {.trivia}` with your own clues (`clue | answer` lists).
  - `scripts/vocab_terms.py`: each term now also gets its unit numbers (from `course/vocab/*.yml`) and its example sentence (for "Fill the gap").
  - `_quarto-parent.yml`: the overview script added the new deck to the list kept off the family site (it's for teachers and students).
  - `README.md`: a "Slide games" section.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Toolbox: slide size, voice level with the noise meter, windows without title bars
- **Asked for:** "Try adding the margin tool. We can see how it works and remove later if it sucks." "Merge noise meter and voice level tools into one (set voice level, and optionally enable noise meter). Also make the warning sound louder and add a visual cue flash the whole meter box red when triggered. Like the score box, this needs a vertical version." "For the gadgets ... they don't need the top bar and label. Give them a more modern look with no name and just a light x to close them."
- **Why:** the slide margins are narrow, and the right amount depends on the screen. Fewer, cleaner windows on the board.
- **Changed:**
  - `_extensions/classroom/toolbox/toolbox.js`: new **Slide size** tool: a slider for the space around the slide (0–30%) and Standard / Wide (16:9), applied live with `Reveal.configure`. It's saved per computer and applied in every deck, even with the window closed. Reset goes back to the deck's own size. **Voice level** now holds the noise meter: 🔊 turns it on (and makes the window taller) or off (and stops the microphone). The alarm is louder (three square-wave beeps) and on by default. An old saved "noise meter" window opens as Voice level. Windows have no title bar: drag any empty part (after 6px, so taps still work), and a light × closes them.
  - `_extensions/classroom/toolbox/toolbox.css`: windows have a small grab bar and a light ×. When it's too loud, a red layer flashes over the whole window. Below 260px wide, the voice level stacks and the noise meter stands up. Styles for Slide size.
  - `README.md`: the tool table and how to move windows.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Toolbox: name picker, groups, a narrow scoreboard, a noise count
- **Asked for:** "name lists and let the teacher add more classes and quickly switch between them. Include a small note saying that this is stored in the browser so no one complains about pipl compliance." "For the group points gadget - add a vertical orientation when it's resized to be narrow. So the group name appears above the score and -/+ buttons. That way it will fit in the margin better." "For the noise meter add a function to count how many times is triggered."
- **Why:** name pickers and group makers need class lists, and the students have no class numbers. Lists must stay off the public site and out of the repo (PIPL). The scoreboard should fit in the slide margin.
- **Changed:**
  - `_extensions/classroom/toolbox/toolbox.js`: two new tools. **Name picker** picks each student present once before anyone twice. **Groups** makes "groups of n" or "n groups" with sizes that differ by at most one. They share class lists: any number of classes, a class menu to switch (both tools follow it), **+ New class…** and **Edit** (paste names one on each line, delete a class), and **Who's here?** to mark students away for the day. The class editor shows a note that names stay only in this browser. **Scoreboard** can now be made as narrow as 150px. **Noise meter** counts the times it went over the line (saved, with Reset). Esc closes the toolbox menu without also opening reveal.js's slide overview.
  - `_extensions/classroom/toolbox/toolbox.css`: styles for the class menu, editor, attendance chips, picker and group cards. Below 250px wide, the scoreboard puts each team's name above its − score +. The noise meter's info row has the count.
  - `README.md`: the new tools, class lists and where they are stored.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Classroom toolbox on every slide deck (scoreboard, voice level, traffic light, noise meter, QR code, stopwatch, dice)
- **Asked for:** classroom-management tools like Classroomscreen's: "Add numbers 2-6" (a points scoreboard as a ClassDojo stand-in, work symbols and a traffic light, a noise meter, a QR code for the current page, a stopwatch and dice). "All of the classroom management ones should be visible across slides not connected to the current slide."
- **Why:** Classroomscreen's classroom-management tools are good, but they live in another tab. ClassDojo can't be built in: it has no public API, and like most sites with a login it can't be shown inside another site.
- **Changed:**
  - `_extensions/classroom/toolbox/toolbox.js` and `toolbox.css` (new): a toolbox button in the bottom-left row of slide icons (or press **W**) opens a menu of 7 tools. Each opens in a window that floats above the slides, so it stays when you change slides (and in fullscreen). Drag by the title bar; drag the corner to resize (contents grow with it, and touch works). Open windows, positions, scores and settings are saved in the browser and come back in the next deck; other tabs update too. Nothing is sent anywhere. The noise meter uses the microphone only after **Start**. Not shown in speaker-view previews or slide PDFs.
  - `_extensions/classroom/toolbox/qrcode.js` and `LICENSE-qrcode.txt` (new): qrcode-generator 2.0.4 (MIT) for the QR code. It loads only when the QR window opens.
  - `_extensions/classroom/filter.lua`: adds the toolbox to every slide deck. `classroom-tools: false` turns it off for a deck; `classroom-tools: {qr-site: "https://…/"}` makes the QR code point to the published site instead of `localhost`.
  - `_quarto.yml`, `brand/README.md`: comments mention the toolbox. `README.md`: a "Classroom tools" section and a line in "Things to try".
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Download button: just the icon
- **Asked for:** "I like the menu but the word download takes up a lot of horizontal space and is breaking some of the layouts. So keep the menu part but make it just the icon on the button."
- **Why:** the word made the button too wide for some layouts.
- **Changed:** `_extensions/pdf-viewer/pdf-viewer.js`, `pdf-viewer.css`: the Download button is the ⬇ icon only (its tooltip still says what it does); the menu with the spelled-out choices is unchanged. `README.md`: wording.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Clearer download buttons in the PDF viewer
- **Asked for:** "Make the buttons for 'download annotated version' and 'download original version' more obvious in their functions."
- **Why:** two icon-only buttons (⬇ and ↗) didn't say what they did; ↗ looked like "download original" but opened a new tab.
- **Changed:** `_extensions/pdf-viewer/pdf-viewer.js`, `pdf-viewer.css`: one **⬇ Download** button (with the word, except in a narrow viewer) opens a menu with the choices spelled out: **With my notes** (saves `<name>-with-notes.pdf`), **Original** (saves the PDF as it is), **Open in a new tab**. Big, easy-to-tap rows; Esc or tapping elsewhere closes it. `pdf-viewer.lua`, `README.md`: documented.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Download a PDF with its ink
- **Asked for:** "How difficult is it to add a download function for the edited PDFs?", then "build it with pdf-lib".
- **Why:** to keep or share a worksheet after writing on it in class.
- **Changed:**
  - `_extensions/pdf-viewer/pdf-lib.esm.min.js` and `LICENSE-pdf-lib.txt` (new): pdf-lib 1.17.1 (MIT), which adds the ink to a copy of the PDF in the browser. It loads only when someone presses Download, so slides don't load any slower.
  - `_extensions/pdf-viewer/pdf-viewer.js`: a ⬇ button in the viewer, the gallery and the large window saves `<name>-annotated.pdf`. Pen and highlighter marks go in as lines (sharp, see-through highlighter); typed English as real text; typed text the built-in PDF fonts can't show (Chinese) as a picture. Rotated pages are handled.
  - `_extensions/pdf-viewer/pdf-viewer.css`: in a narrow viewer the "open in a new tab" button hides to make room (the large window still has it).
  - `_extensions/pdf-viewer/pdf-viewer.lua`, `README.md`: documented.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Zoom and a text tool in the PDF viewer
- **Asked for:** "Add a zoom function for the viewer. I think it's fine on the classroom display, but a bit tough on the teachers laptop. Also for annotation - add a text tool."
- **Why:** the worksheet is hard to read on a laptop screen.
- **Changed:**
  - `_extensions/pdf-viewer/pdf-viewer.js`: zoom (− 100% + in the viewer's bottom bar and the large window's title bar, 100–400%; Ctrl/⌘ + scroll or a trackpad pinch; + − 0 keys in the large window; tap 100% to fit the page again). Zoomed in, the page scrolls, or drag it with the mouse. A **T** text tool: tap the page, type, Enter; the text is in the last pen's color, saved with the ink, and the eraser and undo remove it. Typing doesn't trigger slide shortcuts.
  - `_extensions/pdf-viewer/pdf-viewer.css`: a scrollable page area, the typing box, zoom buttons; buttons on slides are 40px so everything fits in a narrow column (the title hides when the viewer is narrow).
  - `_extensions/pdf-viewer/pdf-viewer.lua`, `README.md`: documented.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: The online build uses the project's own Chinese font
- **Asked for:** "Why does it need to reinstall the font", after the publish build hung twice on downloading it.
- **Why:** each GitHub build starts on a fresh computer, so it downloaded the Chinese font package from Ubuntu every time; today that download hung and the site didn't update.
- **Changed:** `.github/workflows/publish.yml`: instead of `apt-get install fonts-noto-cjk`, copy `brand/fonts/print/NotoSansSC-*.otf` (already in the project) into the build computer's font folder. Takes about a second, needs no network, and the slide PDFs use the same Chinese font as the worksheets.
- **Who it helps:** probably every Chalkline course that publishes with GitHub Pages.
- **AI assistant:** Claude.

## 2026-10-23: Slides show the student copy of a PDF, even on the teacher site
- **Asked for:** "the slides should always default to showing the Student version. Teachers never need to project the teacher version in a normal context. I can imagine a time like when giving professional development when you might want that but the default behavior would be the Student version."
- **Why:** so answer keys don't end up on the board.
- **Changed:**
  - `scripts/packets.py`: the teacher build also writes a student copy of every printable, `<name>-student.pdf`, next to its teacher edition (one extra Quarto run, alongside the packets). `--unit` and `--stale` work for these too.
  - `_quarto-teacher.yml`: `pdf-viewer: prefer: "{name}-student.pdf"`, so slides on the teacher site show that copy.
  - `_extensions/pdf-viewer/pdf-viewer.lua`, `pdf-viewer.js`: a new project option `pdf-viewer: prefer:` (tried first, falling back to the named file) and `prefer=false` on one shortcode to show the named file as it is (the teacher edition, for training).
  - `README.md`: how it works, and `prefer=false`.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: PDFs on slides (viewer and gallery, with pens), and the chalkboard
- **Asked for:** "Teachers want to embed the worksheet PDF in the reveal.js presentation, so that they can have slides that show the workbook together with in-class instructions or resources." Two ways: a gallery of pages that opens a large popup (draggable, resizable), and a PDF on the slide with on-screen page controls. Both with ink for touch screens, kept until Clear. Plus an example of the built-in chalkboard.
- **Why:** to show the worksheet next to in-class instructions, and write on it with the class.
- **Changed:**
  - `_extensions/pdf-viewer/` (new, a separate extension that works in any Quarto project): `{{< pdf-viewer "file.pdf" >}}` shortcode (`pdf-viewer.lua`); viewer, gallery, popup and pens (`pdf-viewer.js`, `pdf-viewer.css`); pdf.js 4.10.38, legacy build (`pdf.min.mjs`, `pdf.worker.min.mjs`, Apache-2.0, `LICENSE-pdfjs.txt`). The PDF loads when the slide is shown, so a deck can show a PDF made by the same build. Ink is saved per PDF page in the browser's localStorage. If the PDF isn't there (the family site), it says so.
  - `scripts/slides_pdf.py`: waits for PDF viewers to finish drawing before printing a deck.
  - `_extensions/classroom/clock.html`: in decks with the chalkboard on, the clock moves right so it doesn't cover the chalkboard buttons.
  - `README.md`: the new shortcode and the chalkboard in the shortcuts table.
- **Who it helps:** probably every Chalkline course. The `pdf-viewer` extension can be copied into any Quarto project.
- **AI assistant:** Claude.

## 2026-10-15: Vocab pictures and diagrams for a third unit (Göbekli Tepe)
- **Asked for:** "a new unit about that ancient site in Turkey … Göbekli Tepe … in the same style as the other two."
- **Why:** not given.
- **Changed:** `vocab/schema.yaml`: new domain `GBT` (ID pattern and its subdomains). `vocab/config.js`: names for `GBT` in English and 中文, 中文 for the new subdomains, three "Read more" links. `vocab/tools/draw_icons.py`: helpers for a T-pillar, a fox and a ring of pillars; 12 new icons (GBT-001 to GBT-012); two new diagrams (`how-old`, `pillar-parts`); `DIAGRAMS` now says which unit folder each diagram goes in (it used to put every diagram in `02-ancient-rome`).
- **Who it helps:** the domain and icons, this course only. Per-unit diagram folders in `draw_icons.py`, probably every Chalkline course that draws its own diagrams.
- **AI assistant:** Claude.
