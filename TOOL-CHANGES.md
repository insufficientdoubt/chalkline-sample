# Changes to the tool

A log of changes to how Chalkline works or looks (code, styles, settings), as opposed to lesson content. AI assistants add an entry here whenever they change a tool file (see "Changing the tool" in `CLAUDE.md`); you can add entries by hand too.

**Why it matters:** this is design feedback. Send this file to John now and then: useful changes may be built into Chalkline for every teacher.

Newest entries first.

<!-- Entries go below this line. Copy this template:

## 2026-10-24: A more modern look for the teacher tools
- **Asked for:** "I still don't love the overall look and feel of the teacher tools. We moved to a more modern design style for the UI. Can you work on updating the design style of the teacher tools to look a bit more modern and nice?"
- **Why:** to match the newer, more polished look of the rest of the interface.
- **Changed:** `_extensions/classroom/toolbox/toolbox.js`: each panel now has a slim header with the tool's icon and name (the × sits in it, and Music's ⋯ too); the clock stays bare with a small grab bar. The W menu is now a grid of tiles in groups (People, Attention, Time, This unit, More), with a tick on open tools and "Close all" / "Reset for the next class…" at the bottom. `_extensions/classroom/toolbox/toolbox.css`: frosted white, slightly see-through panels with rounder corners and softer shadows; one button style for every tool (bigger, white with a border, the main button filled); a small corner mark for resizing; styles for the new menu; tool padding adjusted for the header.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: Vocab and Packet in the toolbox: the unit's words and worksheets on any slide
- **Asked for:** "a sidebar that has the entire vocabulary list for the unit ... click on an item to pull up its card ... The second one is a similar thing for the worksheets. Make the unit packet available as a series of preview pages that you can click on to pop out."
- **Why:** "These two features will allow teachers to access the vocabulary and the worksheets on any slide without planning in advance when teaching."
- **Changed:**
  - `_extensions/classroom/toolbox/toolbox.js`:
    - **Vocab** is a sidebar at the right edge (full height until it's dragged) with the unit's words only. Tapping one shows its card beside the list: picture, word, 中文, meaning, example, 🔊, and a link to the vocab app.
    - **Packet** is a sidebar at the left edge with the unit packet's pages. Tapping one opens it large in the PDF viewer's window, and **Answer key** switches to the teacher edition.
    - Both start on the deck's unit and have a unit menu.
    - A tool's `start()` can now set its starting size too.
  - `_extensions/classroom/toolbox/toolbox.css`: the sidebars and the card.
  - `_extensions/classroom/filter.lua`: puts the course's units, packets and vocab words into each teacher deck as JSON, and loads the PDF viewer there.
  - `_extensions/pdf-viewer/pdf-viewer.js`: `window.PdfViewer.start(box)` starts a viewer added later (and a box never starts twice).
  - `scripts/catalog.py`: also writes `generated/units.json`.
  - `_extensions/classroom/ui/icons.js`: book-a and files icons.
  - `README.md`: Vocab and Packet rows. (Content: the Start Here catalogue and toolbox list.)
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: Quick reference: links open in a pop-up
- **Asked for:** "Can we make it so clicking on those opens them in a pop-up?"
- **Why:** to show a worksheet or another deck without leaving the slides.
- **Changed:**
  - `_extensions/classroom/quickref.js` (new): on a quick reference slide, decks, printables and PDFs open in a large pop-up over the slides (their name, Open in new tab, ×; Esc or a click outside closes it, without opening reveal's slide overview). Key slides in this deck still go there; outside sites open in a new tab (most refuse to be shown inside another page); Ctrl/Cmd-click is left to the browser.
  - `_extensions/classroom/quickref.css`: the pop-up, above the toolbox.
  - `_extensions/classroom/quickref.lua`: loads it.
  - `_extensions/classroom/toolbox/toolbox.js`: no toolbox in a deck shown inside another page (the pop-up), so its clock and tools don't appear twice.
  - `README.md`: the pop-up, under "Quick reference slide".
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: Quick reference slide: every link in a unit
- **Asked for:** "a slide template for a grid of all links + specified instructional slides within a unit... like a 'quick reference' slide for in class use."
- **Why:** one slide to jump from, in class, to any deck, printable or key slide in the unit.
- **Changed:**
  - `_extensions/classroom/quickref.lua` (new): `::: {.quick-ref}` with a list of links becomes numbered "Key slides" (any slide, in this deck or another), beside a grid of everything in the unit (packet student copy, decks, printables, outside links) in the overview's type colors, with PDF buttons and a "this deck" tag. `unit="..."` picks another unit. Other formats get a plain list.
  - `_extensions/classroom/quickref.css` (new): its layout and colors.
  - `_extensions/classroom/filter.lua`: runs it for `.quick-ref` divs.
  - `scripts/catalog.py`: also writes `generated/catalog.json`, which the slide reads, so it's always up to date.
  - `README.md`: "Quick reference slide". (Content: an example at the end of *City-States and Democracy*, and a chip on the Start Here catalogue.)
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: QR codes point at the student site
- **Asked for:** "the qr code teacher tool points at the teacher site, right? it should point at the student link (once student links actually exist...)"
- **Why:** the toolbox only runs on the teacher site, so the QR code showed the teacher site's address, with the answer keys, to students.
- **Changed:**
  - `_extensions/classroom/filter.lua`: gives each deck its path in the site, and the student site's address from a new `student-site:` setting (the older `classroom-tools: qr-site:` still works).
  - `_extensions/classroom/toolbox/toolbox.js`: the QR code is the student site's address plus this deck's path. With no student site set, it shows no code and explains why ("This deck" is greyed out; Edit link still works).
  - `_quarto.yml`: a commented-out `student-site:` line to fill in when the student site is published.
  - `README.md`: the QR row.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: Music: just YouTube's player, with a ⋯ menu
- **Asked for:** "maybe it's better to just have the embedded player and use a context menu to change the link".
- **Why:** since the video has to stay visible anyway, YouTube's own controls are enough. That's the smallest, plainest version.
- **Changed:**
  - `_extensions/classroom/toolbox/toolbox.js`: the Music panel is now only YouTube's player (play, pause, volume, fullscreen are YouTube's own), at 340 × 240, resizable, never under 200 × 200. A **⋯** button by the × (or a right-click on the panel's edge) opens a menu: change the song, the last five songs (by name), and Pop out. Before the first song, the link box sits in the middle of the panel. This replaces the compact strip of big buttons (entry below).
  - `_extensions/classroom/toolbox/toolbox.css`: the player and the menu.
  - `_extensions/classroom/ui/icons.js`: an ellipsis icon. The play, pause, skip and volume-1 icons are removed (nothing uses them now).
  - `README.md`: the Music row.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: Music: a compact strip, and Pop out
- **Asked for:** "The music player works, but it's still a bit bulky. Any ideas for how to make a more streamlined version? Or let it get minimized to just a little round icon", then "1 sounds good" (the compact strip), and "can't we just keep playing the YouTube stream but hide the actual video?"
- **Why:** smaller on the board. Hiding the video while YouTube keeps playing breaks YouTube's rules for embedded players (they can't be hidden, smaller than 200 × 200, or used for sound only), so Chalkline doesn't do it. Pop out gets the same result through YouTube itself.
- **Changed:**
  - `_extensions/classroom/toolbox/toolbox.js`: the Music panel is a short strip (400 × 240 instead of 320 × 400). The video tile is on the left (never under 200 × 200), with the big buttons beside it. The link box and last songs fold away under **Song** (the panel grows only while it's open). **Pop out** opens the song on YouTube in its own small window (which can be minimized) and pauses the one in the panel.
  - `_extensions/classroom/toolbox/toolbox.css`: the strip layout.
  - `README.md`: the Music row.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: Music in the toolbox: a small YouTube player with big buttons
- **Asked for:** "a tiny floating YouTube player with oversized controls in the teacher tools for classroom music. Or just a plain embedded YouTube player is fine if it's resizable."
- **Why:** classroom music (clean-up songs, work music) without leaving the slides.
- **Changed:**
  - `_extensions/classroom/toolbox/toolbox.js`: a **Music** tool. Paste a YouTube link (a song, a Short, or a playlist). Big round buttons play/pause, go back to the start (or the previous song) and skip to the next song in a playlist; big volume down/up buttons show the level. The video shows small above the buttons, because YouTube's rules don't allow hiding it; the panel resizes like the others. It keeps playing across slides. The last four links are one-tap buttons, remembered in this browser. It uses YouTube's own player code (loaded when the tool opens), and a clear message if YouTube can't be reached or won't play a video on other sites.
  - `_extensions/classroom/toolbox/toolbox.css`: its layout, sized to the panel.
  - `_extensions/classroom/ui/icons.js`: Lucide music, play, pause, skip-back, skip-forward and volume-1 icons.
  - `README.md`: the Music row in the tools table.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: Two sites, not three: a "For families" page instead of the family site
- **Asked for:** "Do we actually need separate student and family sites? ... should it just be a teacher version and a student/public version", then "Yes, bundle it all".
- **Why:** nothing on the student site is secret from families, so the family site was only a shorter list. The real line is class versus public, which needs password-protected hosting (later). One fewer build, one fewer thing to explain.
- **Changed:**
  - `_quarto-parent.yml` → `_quarto-student.yml`: the student profile, now the default build (`profile: default: student` in `_quarto.yml`). It leaves out any page whose `audience` label leaves out `student` (a teachers-only page), so such pages are not in the student site's pages, sidebar or search. Before, the student site had every page.
  - `scripts/parent_site.py` → `scripts/student_site.py`: tidies the student site after a render (removes the teachers-only stubs and their PDFs, and the vocab app's teacher page).
  - `scripts/catalog.py`: writes the student site's teachers-only list (was: the family site's list). New `markdown_family_picks()` for the families page. The "Who sees it" tag "Families" is now "For families" (listed on that page).
  - `families.qmd` (new): **For families 给家长**, a welcome in English and 中文, the vocab app, each unit's goals, and the files marked `audience: [..., parent]`. In the sidebar (`_quarto.yml`).
  - `index.qmd`: the family-site parts removed.
  - `_extensions/classroom/shortcodes.lua`, `filter.lua`, `scripts/packets.py`, `scripts/build_if_needed.py`, `scripts/open_site.py`, `.vscode/tasks.json`, `.gitignore`, `brand/styles.scss`: the family site's special cases and its "Open family site" task removed.
  - `README.md`: "Students, families and teachers" replaces "Family site".
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: "Who sees it" switch on the teacher overview
- **Asked for:** "a toggleable slide highlight for teachers so that they can see which slides are shared with families/students and which aren't on the overview."
- **Why:** to see at a glance what students and families get, before sharing.
- **Changed:**
  - `scripts/catalog.py`: each overview row carries its audience (Students, Families, or Teachers only, from the file's `audience` label). The teacher site gets a "Who sees it" switch at the end of the type chips. The student site's catalog now keeps only items marked for students, as the family site already did for families, so two teacher-only outside links no longer show there.
  - `brand/styles.scss`: the switch, the audience tags, green rows for the family site, striped rows for teachers only.
  - `index.qmd`: the switch's script (remembered in the browser).
  - `README.md`: "Who sees what".
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: Toolbox and speaker notes: teacher site only
- **Asked for:** "The teacher toolkit doesn't go on any parent or student facing site. Neither do speaker notes from the teacher."
- **Why:** they're for the teacher. On the student site, anyone could press S and read the notes, or open the class lists in the toolbox.
- **Changed:**
  - `_extensions/classroom/filter.lua`: the classroom toolbox (and its clock) is added only in the teacher build (`--profile teacher`). `::: notes` divs are removed from every other build. The shared design styles still load for the games on every site.
  - `README.md`: says so under the toolbox and speaker view.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: Videos: centered, in their own shape, Shorts full height
- **Asked for:** "It looks like the horizontal videos aren't centered and the vertical videos aren't going as tall as they ought to."
- **Why:** the first version made each video a box as wide as its space, but reveal.js caps embeds at 95% of the slide, so they sat left of center, and a Short in a wide box had black bars. It also took height away for text in the *other* column.
- **Changed:**
  - `_extensions/classroom/video-shape.lua` (new, runs before Quarto turns `{{< video >}}` into a player, while the link is still the author's): marks each video wide (16:9) or tall (9:16, for `youtube.com/shorts/` links); Quarto's `aspect-ratio="9x16"` (ignored on slides) sets it by hand. Videos with their own width/height are left alone.
  - `_extensions/classroom/_extension.yml`: runs it (`at: pre-ast`).
  - `_extensions/classroom/video-fit.html`: each video is now as big as it can be in its own shape, centered in its column or on the slide, with the height measured only in its own column (what's above and below it).
  - `README.md`: "Videos on slides" says how shapes work.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-24: Videos fill their slide
- **Asked for:** "my YouTube videos didn't fill the slide ... Do you have to use an iframe or can {{< video>}} fill the space?"
- **Why:** the videos came out tiny (the browser's default 300 × 150 box), because Quarto gives `{{< video >}}` no size on slides, and its `aspect-ratio` option is ignored there.
- **Changed:**
  - `_extensions/classroom/video-fit.html` (new): on each slide, a YouTube or Vimeo video with no width or height of its own fills the room left: full width (or its column's) and the height under the title and any text. Videos stacked in one place share the height. A video with its own `width`/`height` keeps them.
  - `_extensions/classroom/filter.lua`: adds it to every deck.
  - `README.md`: a "Videos on slides" section.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Unit pages and the rest of the site match the new overview
- **Asked for:** "Make sure the unit pages and everything in that interface matches."
- **Why:** one look across the site, after the overview restyle.
- **Changed:**
  - `brand/styles.scss`:
    - The title banner on every web page is the same card as the overview's header (soft gradient, small breadcrumbs, a short orange rule).
    - Section headings lose the blue band (a short blue bar instead).
    - Callout boxes are rounded cards.
    - Material tables are a rounded card, with one colour per type, the same as the overview (a bar on the left edge, the type in colour). The 📊/📦/🔑/🎒 emoji are gone.
    - The packet cards put the Student copy first in solid green and the Teacher edition in muted orange, with line icons. On the student site, the single "Unit packet" button is green.
  - `_extensions/classroom/shortcodes.lua`:
    - `{{< packet >}}`: no emoji, and the student copy first.
    - `{{< objectives >}}`: a card headed "In this unit", with green ticks (web only; PDFs keep the plain list).
  - `brand/type-colors.html`: tags every table row with its type (`row-t-worksheet`, …), not just slides and packets.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Overview: the student copy is the main packet button
- **Asked for:** "I'd like the student edition to be green and this teacher edition to be that muted Orange ... Teachers first move is to print the student edition and the second move is to reference the one with answer keys (if they ever do). So the UI should reflect those priorities."
- **Why:** printing the student copy is what teachers do most; the answer keys come second.
- **Changed:**
  - `brand/styles.scss`: the Student copy button is solid green; the Teacher edition is the quiet orange outline.
  - `scripts/catalog.py`: the Student copy comes first in each unit's header.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Overview: colour coding back, and a more polished look
- **Asked for:** "I think we still need some level of color highlighting to make it quick for teachers to find the right materials. I just wanted to be a bit more modern and restrained. The whole thing should feel a bit more polished than the default quarto look."
- **Why:** colour helps teachers find the right materials fast; the first restyle was too plain.
- **Changed:**
  - `brand/styles.scss`:
    - Each type has one colour, used three ways: a bar on the row's left edge, the icon tile and the type label. Slides (teal) and packets (orange) stand out most, with solid tiles and orange packet buttons, as before.
    - A new page header replaces Quarto's title banner on the overview: course name, season, counts and the next events as date cards.
    - The teacher-site warning is now a slim notice with a key icon.
    - The Everything table keeps teal and orange bars for slides and packets, and the Categories list is quieter.
    - Sidebar, on every page: slide decks get a small teal presentation icon instead of 📊, and the current page shows as a soft pill.
  - `scripts/catalog.py`: filter chips above the units (All, Slides, Worksheets, …, Outside links, each with its colour and count). The rows say what the chips match. `markdown_season()` builds the new header.
  - `index.qmd`: the chips' script (it shows one kind and hides units with none of it), the teacher notice, and a shorter intro.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: The overview in the new style
- **Asked for:** "Rebuild the overview with the new styles."
- **Why:** not given. (The overview still had the old look: tables, coloured rows and emoji, while the catalogue, tools and games now share one design.)
- **Changed:**
  - `scripts/catalog.py`: the overview builders write cards instead of tables. Each unit is a card with its number, title, description and packet buttons (Teacher edition solid, Student copy outlined). Each document is a row with a line icon for its type, its title and description, and a PDF button; outside links show their source with an outside-link icon. "By type" uses the same cards, "Coming up" shows each event as a small card, and the family site's unit goals are cards too. The Lucide icons are drawn inline (no script). The packet titles lose their 🔑/🎒 emoji (the overview shows a key or a backpack icon instead) and get an `edition` field.
  - `brand/styles.scss`: a new "Overview" section with the same values as `ui.css` (white cards, thin borders, one quiet colour per type). The tabs are a segmented control. The Everything tab's table is restyled, without the coloured rows or emoji.
  - `index.qmd`: the page is wrapped in `.overview`. `README.md`: "builds the table" now describes the cards. A small script shows the Categories filter only on the Everything tab, where it works.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## 2026-10-23: Traffic light shows its lights again
- **Asked for:** "for a teacher tools the traffic light is broken right now."
- **Why:** it was broken: the panel opened, but the lights had no shape or colour.
- **Changed:** `_extensions/classroom/toolbox/toolbox.css`: put back the traffic light's styles (the dark box, the three round lights, the glow on the one that's on, the coloured label). An earlier noise-meter restyle deleted them by mistake.
- **Who it helps:** probably every Chalkline course.
- **AI assistant:** Claude.

## YYYY-MM-DD: short title
- **Asked for:** what the teacher wanted, in their words if they gave them.
- **Why:** the reason they gave, or "not given".
- **Changed:** each file and what changed in it.
- **Who it helps:** this course only, or probably every Chalkline course.
- **AI assistant:** which one made the change.
-->

## 2026-10-23: A nature theme for playful worksheets
- **Asked for:** "Give the playful worksheet a nature theme."
- **Why:** not given.
- **Changed:** `brand/typst/typst-template.typ`: `playful-theme: nature` (a green frame and title, leaves in two corners of the frame and beside headings), eight more doodles to color (leaf, flower, tree, ladybug, butterfly, mushroom, bee, snail) and `flower-num()` (a number in a flower). `brand/typst/typst-show.typ`: passes `playful-theme` through. `brand/README.md` and README updated. The example worksheet became `course/units/04-stem/garden-times-tables.qmd` ("Garden Times Tables!", garden story problems, a garden to color).
- **Who it helps:** probably every Chalkline course with younger students.
- **AI assistant:** Claude.

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
