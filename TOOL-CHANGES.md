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

## 2026-10-23: A playful worksheet layout for younger students
- **Asked for:** worksheets that look "more like" Teachers Pay Teachers primary worksheets: "a certain kind of chalky style", "little line drawings that can be colored", "lots of space for the kids to work", "handwritten style fonts". "Make a playful worksheet. I want to see what it would look like as something more kid friendly."
- **Why:** to make printables more child friendly than the clean, professional worksheet style.
- **Changed:** `brand/typst/typst-template.typ`: a `layout: playful` option (handwriting fonts, a hand-drawn double frame, a dashed "cloud" title, a big Name/Date line, the teacher tab, a gentle footer) and a playful kit for worksheets: `doodle()` (seven line-art doodles drawn for Chalkline: robot, pencil, star, gear, sun, cloud, sparkle), `star-num()` and `work-box()`. `brand/fonts/print/`: Patrick Hand and Fredoka (OFL, with their licences). `brand/README.md` and README document it. Example: `course/units/04-stem/robot-times-tables.qmd` (its problems from `playful.py`).
- **Who it helps:** probably every Chalkline course with younger students.
- **AI assistant:** Claude.

## 2026-10-23: The Start here catalogue matches the new look
- **Asked for:** "make it match, drop the emoji" (the "So what else can you do?" slide).
- **Why:** it kept its own emoji and colored badges after the toolbox, games and activities moved to one design.
- **Changed:** `_extensions/classroom/ui/icons.js`: a microphone icon (for the catalogue's Noise meter chip). The slide itself (content): no emoji, chips and boxes use the shared design values, and the toolbox chips show the toolbox's line icons. IDEAS.md: two intro decks added to the to-do list.
- **Who it helps:** this course (the icon: every Chalkline course).
- **AI assistant:** Claude.

## 2026-10-23: One design for the tools, games and activities; line icons instead of emoji
- **Asked for:** "go with option 1": after comparing the look with Shoelace and Bootstrap, use Chalkline's own design values and a free icon set, to lose the "vibe coded look".
- **Why:** "I was thinking about the vibe coded look." In the test, the frameworks' controls were too small for a board, and Bootstrap clashed with reveal.js (it hid the deck and the tool windows); most of the casual look came from emoji icons and small inconsistencies.
- **Changed:** `_extensions/classroom/ui/ui.css` (new): one set of colors, corners and shadows. `ui/icons.js` (new) and `LUCIDE-LICENSE.txt`: 20 Lucide line icons. `toolbox/toolbox.js`: the menu and the controls (close, check, bell, settings, reset, crown) use the icons; the voice levels keep their emoji (pictures for students). `toolbox.css`, `games/games.css`, `activities.css`, `timeline.css`: buttons, chips, word banks, menus, windows and right/wrong use the shared values. `filter.lua` and `games/games.lua`: load them. README credits and `brand/README.md` updated.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: The clock starts beside the slide, not on it
- **Asked for:** "move the clock default so it doesn't cover slide content"
- **Why:** at the bottom left, it covered the bottom of full slides.
- **Changed:** `_extensions/classroom/toolbox/toolbox.js`: the clock starts in the empty space beside the slide (left, above the menu buttons; or right) when there's room, or else in the top-right corner, and follows the screen size until it's moved or resized. A clock still at the old default spot moves too. It's a little smaller (128 × 52). README updated.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Build the sentence, Fill in the blanks, Put it in order, a Venn diagram, and a Spotlight
- **Asked for:** whiteboard learning activities: "build those five" (a sentence builder, fill in the blanks, put it in order, a Venn layout for Sort it, and a spotlight; a screen shade was dropped because fragments already do it).
- **Why:** "Are there any obvious learning activities that work well with interactive whiteboards that we should include?"
- **Changed:** `_extensions/classroom/games/activities.js` and `activities.css` (new): the three activities, each working by drag or by tap-then-tap. `games.lua`: loads them. `timeline.js`: shares its drag helper. `filter.lua`: reads `::: {.sentence-builder}`, `{.fill-blanks}`, `{.put-in-order}` and Sort it's `layout="venn"`. `games.js` and `games.css`: the Venn layout. `toolbox/toolbox.js` and `toolbox.css`: a 🔦 Spotlight tool (not reopened in the next deck). A new demo deck in Unit 2, the Start here catalogue (46 features), README and IDEAS.md updated.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: The clock is a toolbox tool; see-through grey tool windows
- **Asked for:** "Remember the clock we have on each side? Make it into one of the new teacher tools so we can drag it around. have it always on by default and have it have a gray translucent background. Actually give all of the teacher tools a grey translucent background."
- **Why:** not given (the fixed corner clock couldn't be moved).
- **Changed:** `_extensions/classroom/toolbox/toolbox.js`: a new 🕒 Clock tool, open by default at the top left; closing it (× or **K**) is remembered, and someone who hid the old clock keeps it hidden; **K** shows and hides it; a deck with `clock: false` leaves it closed. `toolbox.css`: every tool window is light grey and see-through (blurred slide behind); the clock's style; the rules that moved the old clock removed. `filter.lua`: no longer adds the old clock; `clock: false` is passed to the toolbox. `_extensions/classroom/clock.html` deleted. README and the Start here slides updated.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Timelines (to teach with, across slides, and for students) and Label it
- **Asked for:** "A timeline template slide ... for introducing a timeline when teaching. It should have all the events preloaded with photos and allow the speaker to scrub through them chronologically, or to click on any item to pull up more information on it (like a zoom-in function). A timeline activity slide for students where they have to place items correctly on the timeline ... the correct order and they have to slide it to the correct year. A labeling activity slide. Using a photograph students need to drag labels onto the correct region ... do whatever is best practice." And: "An option for a timeline to run across multiple slides ... the timeline can be an automatic insert and then later on you can use the timeline element to click on it and either get the info back from the slides or go directly to the slide."
- **Why:** to teach chronology, and for labelling activities.
- **Changed:**
  - `_extensions/classroom/games/timeline.js` and `timeline.css` (new):
    - **Timeline to teach with:** a big card above the line; ‹ ›, tap or drag along the line; tap the card to zoom in.
    - **Strips:** on slides that events link to. Tap an event for its card, then **Go to this slide** or **The timeline**.
    - **Timeline activity:** drag events onto the line at their year (or tap, then tap the line). Check marks each one (tolerance, snap) and the order.
    - **Label it:** numbered dots on a photo; drag or tap labels on; feedback with reasons; L finds and copies a place. Wide photos use the whole width.
    - Dates like "509 BC", "AD 80" and "c. 9600 BC" are read and sorted; there's no "AD 0".
  - `_extensions/classroom/games/games.js`: shares its helpers (`window.ChalklineGames`) so timeline.js can add games, and starts the games once the page has loaded. `games.lua`: loads timeline.js and timeline.css.
  - `_extensions/classroom/filter.lua`: `::: {.timeline-interactive}` and `::: {.timeline-activity}` (events as `::: {.event}` divs, or a list) and `::: {.label-it}`. A new pass gives each timeline an id and puts a strip on every slide an event links to. Plain `::: {.timeline}` stays the simple styled list.
  - `course/units/02-ancient-rome/rome-timeline-slides.qmd` (new demo deck), `README.md`, the Start-here slide.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Sort it: a reason for each item, feedback straight away, pictures
- **Asked for:** "Definitely add the option for immediate feedback if the kid gets the answer wrong, a little explanation of why. I think a third group support for both is fine but we'll already have that if we support multiple groups. And yes I want the option for pictures as items." (After: "So we can sort based on characteristics that are not specifically listed in the vocabulary. For example in a biology class sorting animals by habitat.")
- **Why:** to use Sort it for higher-order sorts, with feedback that teaches.
- **Changed:**
  - `_extensions/classroom/games/games.js`: Sort it items can have a reason and a picture.
    - **Feedback straight away** (the usual): a right item locks in green; a wrong one shows red in that group, shakes, goes back to the bank, and its reason shows in a red box. It counts mistakes.
    - `feedback="end"`: the old way, with Check showing up to three reasons.
    - From the vocab: the reason is the word's meaning, and `with="picture"` shows the vocab pictures.
  - `filter.lua`: `::: {.sort}` items can have `![Name](path)` pictures (copied to the site) and `| reason`; `feedback=` on the div. `shortcodes.lua`: `with=` and `feedback=` for `{{< sort >}}`.
  - `games.css`: picture items and the reason box.
  - `README.md`; the Greek Word Games deck: reasons on *Athens or Sparta?*, a new *Greek or Roman?* photo sort, and an updated code box and credits.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Word scramble, Sort it, and Bingo with cards made on demand
- **Asked for:** "add bingo and sort it. Figure out where bingo would live because the process for that is a little different. The teacher would not do that live in class they would prepare it ahead of time and print the cards. Add word scramble." Then, on bingo: "Bingo cards should not be generated at build time ... Can we just use that [the PDF library] to generate printable PDF cards on demand? ... the teacher could reuse the game without regenerating the site. Change the number of cards the number of items etc."
- **Why:** more review games. Bingo needs paper cards, prepared before class.
- **Changed:**
  - `_extensions/classroom/games/games.js`: three new games.
    - **Word scramble:** tap or type the mixed-up letters in order.
    - **Sort it:** a word bank and 2–3 groups; tap a word, then its group; Check; from the vocab, by topic (one unit) or by unit (several).
    - **Bingo**, in two steps. *Make cards*: grid 3–5, free square, number of cards; a PDF made in the browser by pdf-lib when the teacher presses Download (nothing at build time). *Call*: one meaning at a time; check a card by its number for a full line. A game code (unit-grid-free-number) printed on every card makes the same cards again with a repeatable random generator, so any card can be checked on any computer; the game and the words called are saved in the browser.
    - The Review games page lists nine games in a full-width row, with the unit menu under it.
  - `games.css`: styles for the three games and the two-row header. `games.lua`: ships `../pdf-viewer/pdf-lib.esm.min.js` next to `games.js`.
  - `shortcodes.lua`: `{{< scramble >}}`, `{{< sort >}}`, `{{< bingo >}}`; vocab game settings carry the unit list. `filter.lua`: `::: {.sort}` (groups in bold, words under them).
  - `scripts/vocab_terms.py`: each term's topic (its `subdomain`), for Sort it.
  - `README.md`; the Greek Word Games deck (Scramble, Sort it and Bingo sections); the Start-here slide. `IDEAS.md` (new): the game ideas not built yet (Heads up / Taboo, Spin the wheel and others), and next steps for Bingo.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: The calm style for every game; Matching and Memory
- **Asked for:** "apply the calmer style to the game slides too. Oh and let's add a matching game, and memory (the card flipping game)."
- **Why:** to match the Review games page; two more classic review games.
- **Changed:**
  - `_extensions/classroom/games/games.js`: every game uses the calm look: plain-word buttons, with the emoji taken off ("🔀 New word" → "New word"), also on buttons a game adds later. Two new games:
    - **Matching:** words on the left, their meanings or pictures (`with=`) on the right, mixed up. Tap one, then its partner: a right pair locks in, in its own color; a wrong pair shakes. It counts the tries.
    - **Memory:** cards that turn over (3D flip). Each word pairs with its picture or meaning; a pair stays up, a miss turns back after a moment. It counts the turns.
    Both take 6 pairs (`count=`), from random vocab (all or one unit, with **New words** / **New cards**) or written pairs. Both reset with "Reset for the next class". The Review games page lists all six games ("Picture" for short, every label on one line), and its "Unit" label is gone (the menu's "All units" says it).
  - `games.css`: the calm styles now apply to every game; styles for Matching and Memory; a tighter header.
  - `shortcodes.lua`: `{{< matching >}}` and `{{< memory >}}` (`unit=`, `count=`, `with="meaning"|"picture"`). `filter.lua`: `::: {.matching}` and `::: {.memory}` with `word | partner` lines.
  - `README.md`, the Greek Word Games deck (Matching and Memory sections, with code boxes; button names without emoji), the Review games page notes, and the Start-here "what else" slide.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

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
