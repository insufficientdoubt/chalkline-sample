# Chalkline sample course

**Chalkline** turns plain-text lesson files into slides, web pages, printable PDFs, unit packets and three websites (students, teachers, families), all in your school's style. This is a **sample course** to try it with: three history units (Ancient Greece, Ancient Rome and Göbekli Tepe), a 37-word bilingual vocab list, and a slide deck about Chalkline itself.

**See it online:** https://insufficientdoubt.github.io/chalkline-sample/ (the teacher version, rebuilt on every push).

> **Beta.** You're one of the first teachers to use this. Note anything confusing or broken, and tell John.

## What's in here

| Part | Where | Look for |
|---|---|---|
| **Start here** | `course/units/00-start-here/` | A short slide deck: what Chalkline does and how to make your own unit |
| **Unit 1: Ancient Greece** | `course/units/01-ancient-greece/` | 2 slide decks, 3 printables (a worksheet, fact cards, a class vote) |
| **Unit 2: Ancient Rome** | `course/units/02-ancient-rome/` | 2 slide decks, 3 printables (a sorting worksheet, Roman numerals, an aqueduct design challenge) |
| **Unit 3: Göbekli Tepe** | `course/units/03-gobekli-tepe/` | 2 slide decks, 3 printables (an evidence-or-guess worksheet, animal fact cards, a T-pillar design challenge) |
| **Vocab** | `vocab/` | 37 words with pictures, 中文 and simple definitions, in the vocab app (sidebar: **History vocab 词汇**) |
| **Appearance** | `brand/` | Colors, fonts and logos for everything |
| **Code** | `_extensions/`, `scripts/` | You don't need to touch these |
| **AI instructions** | `CLAUDE.md` (also `AGENTS.md`, `GEMINI.md`) | Rules any AI assistant should read first; tool changes get logged in `TOOL-CHANGES.md` |

Things to try once the site is open:

- Hover or tap a word with a dotted line on any slide: its vocab card pops up.
- Open a unit page and click **Unit packet (PDF)**: every printable in one file, ready to copy.
- Open a slide deck and press **S** for speaker notes, **T** for the timer.
- In the overview, each deck has a **PDF** too.
- **Terminal > Run Task… > Open family site (parents)**: the version families see.
- **Terminal > Run Task… > Open student site**: what students see, without the answer keys and teacher notes.
- In *From Republic to Empire*, hover the boxes of the infographic: it was made in **draw.io** (`drawio/republic.drawio`), and any draw.io diagram can go in a slide the same way.

## One-time setup

1. **Install the programs** (normal installers, defaults are fine):
   - [VS Code](https://code.visualstudio.com/)
   - [Quarto](https://quarto.org/docs/get-started/). Typst for PDFs comes bundled, so you don't need LaTeX.
   - [Python 3](https://www.python.org/downloads/). On Windows, tick **"Add python.exe to PATH"**.
   - [Git](https://git-scm.com/downloads)
   - [Google Chrome](https://www.google.com/chrome/) or Microsoft Edge (already on Windows), for slide PDFs

2. **Get the project onto your computer.** In VS Code: **File > Open Folder…** and pick the `chalkline-sample` folder. (To download it from GitHub first, use the Command Palette, `Ctrl+Shift+P` or `Cmd+Shift+P`, then **Git: Clone**.)

3. **Install the extensions.** VS Code will show a pop-up offering to install the recommended extensions (Quarto, Python, Jupyter). Click **Install**. If you miss it, open the Extensions panel and search `@recommended`.

4. **Create a Python environment.** This is a private folder of Python packages just for this project, so it can't clash with anything else on your computer. Open a terminal in VS Code (**Terminal > New Terminal**) and run:

   ```bash
   python -m venv .venv
   ```

   (On a Mac, use `python3` instead of `python` if `python` isn't found.) VS Code will ask whether to use the new environment for this workspace: click **Yes**. Then **close that terminal and open a new one**. The prompt should now start with `(.venv)`, which means the environment is turned on.

5. **Install the Python packages** into that environment:

   ```bash
   pip install -r requirements.txt
   ```

6. **Check that everything is wired up:**

   ```bash
   quarto check
   ```

   You want to see a Python 3 path that includes `.venv`, plus "Jupyter: OK".


## Open the site

**Double-click `Start Chalkline.command`** (Mac) or **`Start Chalkline.bat`** (Windows). The site opens at **http://localhost:4100**, in the **teacher version** (answer keys and teacher notes showing), and updates every time you save a file. Leave the window open while you work; close it to stop. The first time, it installs the Python packages for you and builds the whole site, which takes a few minutes.

In **VS Code**, the site starts by itself when you open the folder (allow "automatic tasks" the first time).

Slide PDFs need **Google Chrome** or **Microsoft Edge** on your computer.

## Editing with an AI assistant

You can do almost everything here by asking an AI assistant: Claude, Gemini, ChatGPT/Codex, Copilot, Cursor, Tencent WorkBuddy or another one that can open files in a folder.

**First, point it at the rules.** Open this folder in the assistant and start with:

> *Read CLAUDE.md first and follow it.*

`CLAUDE.md` holds the instructions for this course: how the files are organized, the vocab rules (English first, 中文 as support, no Chinese in quizzes), and how to keep editing quick. Many assistants find it on their own; `AGENTS.md` and `GEMINI.md` point there too.

**Then just ask**, in plain words:

- *"Add a slide to the Rome engineering deck about Roman baths, with Chinese glosses on the key words."*
- *"Make the Athens vs Sparta worksheet easier for beginners: shorter questions and a word bank."*
- *"Add 'senator' to the vocab list, with a picture and Chinese."*
- *"Make an interactive timeline of the Roman kings for the Rome deck."*

**If it changes the tool, it keeps a log.** Changing lessons, worksheets and vocab is content: no log. Changing how Chalkline works or looks (its code, styles or settings) is a *tool* change, and the assistant records what it changed and why in `TOOL-CHANGES.md`. Please send that file to John from time to time: it's design feedback, and good ideas can become part of Chalkline for everyone.

## Make your own unit

1. Copy a unit folder, for example `course/units/01-ancient-greece`, and rename it (`03-my-unit`).
2. In its `index.qmd`, change `title`, `short-title`, `unit` and the `objectives`. The unit appears in the sidebar and overview by itself.
3. Edit or replace the slides and printables. Keep the labels at the top of each file: `type:` (slides, worksheet, handout, reference…), `order:` and `audience:` (who sees it: `teacher`, `student`, `parent`).
4. Add your words to `vocab/data/vocab.csv` (see `vocab/README.md`), then run `python vocab/validate.py`.
5. To use a unit's words on picture cards, import them: `python scripts/import_vex_vocab.py --unit 3 --title "My Unit" --folder 03-my-unit --ids GRC-001 GRC-002`.

When a worksheet is finished, rebuild its unit packet: `python scripts/packets.py --unit 3`. Packets and slide PDFs don't rebuild on every save, so editing stays quick; the launcher also rebuilds any that are out of date when it starts.

## Everyday commands

Run these in the VS Code terminal, or pick them from **Terminal > Run Task…**.

| What you want | Command |
|---|---|
| Build everything (student site) into `_site/` | `quarto render` |
| Build the teacher site into `_site-teacher/` | `quarto render --profile teacher` |
| Open the family site (port 4102) or student site (port 4101) | `python scripts/open_site.py parent` / `student` |
| Rebuild one unit's packet | `python scripts/packets.py --unit 1` |
| Rebuild slide PDFs | `python scripts/slides_pdf.py` |
| Check the vocab list | `python vocab/validate.py` |
| Make Quizlet / Kahoot / Anki files | `python scripts/export_vocab.py` |
| Update a draw.io diagram's picture after editing it in draw.io | `python scripts/drawio.py` (needs the draw.io app) |

## Unit packets

Every unit's printables (worksheets, checklists, handouts and references) are also built into one **unit packet** PDF, and all packets into a **year packet**: a cover with the objectives and contents, each printable on a new page, page numbers running through. Slide decks, posters and tests are left out. Add `packet: false` to a printable's labels to leave it out too. The teacher site has **both**: a 🔑 **Teacher edition** (answer keys, notes, TEACHER EDITION tab; `unit-teacher-packet.pdf`) and a 🎒 **Student copy** to print for class (`unit-packet.pdf`, the same file as on the student site), each with its own card on the unit page. To add an outside PDF to a packet, save it in the unit folder and list it in the unit's `index.qmd`:

```yaml
packet-extras:
  - file: map.pdf
    title: Map of the Mediterranean
    after: athens-vs-sparta.qmd     # optional
```

## Family site

Only files whose `audience:` includes `parent` appear on the family site, plus the unit pages (objectives) and the vocab app. In this sample that's the *City-States and Democracy* and *Roman Engineering* decks, the Greek Gods cards and the Roman Numerals reference. Hide part of a page from families with `::: {.content-hidden when-profile="parent"}`.

## How the overview finds things

You never edit the overview by hand. Before every render, `scripts/catalog.py` reads the labels at the top of each file in `course/` and builds the table. These are the labels:

```yaml
---
title: "Game Day Checklist"
type: checklist        # slides, worksheet, checklist, handout, poster, reference or vocab
description: "One sentence shown in the overview and on the unit page."
order: 2               # position on the unit page (slides are usually 1)
audience: [teacher, student]   # who it's for; not used yet (see planning/)
---
```

The unit comes from the folder the file is in. A file with no `type:` still appears, labeled "Other". Files whose names start with `_` are skipped, which is handy for drafts.

**Outside resources** (a Wikipedia article, an official website) aren't files here, so they're listed in `course/links.yml`. Each one shows its `source` (here, **Wikipedia**) as a badge in the overview; the school's own materials show **School**. Outside links appear in the overview only, not on unit pages.

**Slideshows open in a new tab**, so the overview stays open behind them. This works for any file whose name ends in `slides.qmd` (like `slides.qmd` or `review-slides.qmd`), so name decks that way. To turn it off, add the line `slides-new-tab: false` to `_quarto.yml` (on its own line, not indented).

**Two kinds of search.** The filter box on the overview searches only the table: titles, types, units and descriptions. The search box at the top of the sidebar searches the **full text** of every web page, including every slide and the speaker notes, and jumps straight to the matching slide or section. It doesn't search inside PDFs, but every PDF has a web version with the same text. On the student/public site, teacher-only content isn't searchable because it isn't there. The sidebar search needs a web address (`quarto preview` or a hosted site); it doesn't work on files opened from a folder.

**Season facts** (event dates, team numbers, overtime days) live once in `course/season.yml`. The overview counts down to the next event, and the slides and printables read the same file, so changing a date there updates everything.


## Several outputs from one file

The `format:` list at the top of a `.qmd` file decides what gets built. For example, a printable has:

```yaml
format:
  html: default     # web page
  typst: default    # PDF (A4)
```

Add `docx: default` for a Word file. PDFs are A4; posters set `papersize: a3`. Shared settings live in `_quarto.yml`.


## Teacher-only content

Wrap anything for teachers' eyes only like this:

```markdown
::: {.content-visible when-profile="teacher"}
The answer is 42.
:::
```

`quarto render` leaves it out. `quarto render --profile teacher` includes it and saves to a separate `_site-teacher/` folder, so the two versions never overwrite each other. Teacher PDFs get an orange **TEACHER EDITION** tab. In slides, `::: notes` blocks are speaker notes (press **S** during a slideshow to see them).


## Shortcuts you can type in any lesson

These come from `_extensions/classroom/`. Each one looks right on the web page, in the PDF and (where it makes sense) in slides.

| Type this | You get |
|---|---|
| `{{< lines 3 >}}` | 3 ruled writing lines. `gap="0.4in"` changes the spacing. |
| `{{< drawing-box label="Side view" >}}` | A dot-grid box for sketching. Fills the rest of the PDF page unless you add `height="2in"`. |
| `{{< objectives >}}` | The `objectives:` list from the unit's labels, as bullets. |
| `{{< pdf "scoring-sheet.pdf" >}}` | An outside PDF saved next to this file. In the PDF version its pages go in as full pages (`pages="2-3"` picks some); on the web page you get a download link and a viewer. |
| `{{< pdf-viewer "athens-vs-sparta.pdf" >}}` | **On a slide:** a PDF you can page through with ‹ ›, and pens for touch screens (pen, highlighter, **T** for typed text, eraser, undo, clear), and zoom (− 100% +, or Ctrl/⌘ + scroll; drag to move around). Ink stays on that computer until you press the bin button. ⤢ opens the page large, in a window you can drag and resize. Add `layout="gallery"` to show every page as a thumbnail: tap one to open it large. Works with a worksheet's own PDF (made by the same build) or the unit packet. Slides always show the **student copy**, even on the teacher site (it shows `athens-vs-sparta-student.pdf`, which the teacher build makes), so answer keys never go on the board. To show the teacher edition (for teacher training, say), add `prefer=false`. From `_extensions/pdf-viewer/`, which works in any Quarto project. In PDFs and Word it's just a link. |
| `{{< packet >}}` | On a unit page: the **Unit packet (PDF)** button. Shows nothing if the unit has no printables. |
| `{{< vocab "democracy" >}}` | A vocab word with a dotted underline. Hover (or tap) to see its vocab card: picture, 中文, definition and a link to the vocab app. Use a term, an "also called" name or an ID (`GRC-003`); `text="citizens"` changes the words shown. In PDFs and Word it's just bold; add `zh=true` to also print the 中文 after it (for reference sheets, never quizzes). Terms come straight from `vocab/data/vocab.csv`, read again before every render. |
| `chalkboard:` in a deck's labels | Draw on any slide: press **C** (or the pen button, bottom left) to draw on the slide, **B** for a blank chalkboard, **Delete** to clear. Copy the three lines from the top of `course/units/01-ancient-greece/city-states-slides.qmd`. |
| `{{< timer 20 >}}` | A 20-minute countdown on a slide (see below). In print it just says "Timer: 20 minutes". |
| `{{< pagebreak >}}` | Start a new PDF page. |
| `::: {.keep}` … `:::` | Keeps a question and its writing space together on one PDF page. |
| `::: {.write-in}` … `:::` around a table | Taller table rows, for handwriting. |
| `☐` | A drawn checkbox. |

Poster blocks (used in `course/posters/`):

```markdown
::: {.value word="Respect" zh="尊重" pinyin="zūnzhòng"}
Your teammates, your coaches, your school, and everyone you compete with.
:::

::: {.big-quote zh="偷最好的，发明其余的"}
Steal from the best. Invent the rest.
:::

::: {.steps title="The Ownership Check"}
1. Adapt it
2. Test it
3. Understand it
4. Credit it
:::
```

Poster options are listed in [brand/README.md](brand/README.md).


## Slide timer

Put `{{< timer 20 >}}` on a slide. It has Start/Pause, Reset and +1 min buttons (or press **T**), turns orange at 5 minutes and red at 1 minute, chimes at zero, and keeps running in a small box at the bottom of the screen if you change slides.

## Clock and transitions

Every slide deck shows the current time in the bottom-left corner. Press **K** to hide or show it (the choice is remembered on that computer), or turn it off for one deck with `clock: false` in its labels. Slides fade from one to the next; that's set under `revealjs:` in `_quarto.yml`.

Press **S** during a slideshow to open speaker view: your notes, the next slide, a clock and an elapsed-time timer, in a separate window for your laptop screen.

## Tap-to-vote polls

Any slide can have a poll that students answer by tapping the board (or you click while counting hands). It needs no server and no student devices. There are three types:

```markdown
::: {.poll type="smileys"}
How confident do you feel?
:::

::: {.poll type="choice" options="Swing arm | 4-bar | Chain-bar" correct="B"}
Which arm keeps the load mostly level?
:::

::: {.poll type="truefalse" correct="false"}
A swing arm keeps the load level.
:::
```

- `correct` is optional. On reveal, it outlines the right answer in green.
- Results stay hidden until you click **Show results** (or press **R**). Keys **1–6** also add votes.
- After each tap there's a 1-second pause, so one student can't vote many times in a row. Change it with `cooldown="2"`.
- Votes are saved in that browser, so they survive changing slides or a refresh, until you press **Reset** twice.

To show **every poll in the deck on one page** (with the date and time, ready to screenshot), add this slide, usually at the end:

```markdown
## Poll results {.poll-summary-slide}

::: {.poll-summary}
:::
```

Every deck in `course/units/` ends with an exit-ticket poll.


## Git basics

| What | Command |
|---|---|
| See what changed | `git status` and `git diff` |
| Save a snapshot (a "commit") | `git add .` then `git commit -m "Describe the change"` |
| Upload to GitHub | `git push` |
| Download changes from GitHub | `git pull` |

VS Code's **Source Control** panel (the branch icon on the left) does all of this with buttons, if you prefer.


## Credits

Unit content is written for this sample in simple English, with facts from Wikipedia ([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)); each vocab word links to the article it's based on. Vocab pictures are original drawings made by `vocab/tools/draw_icons.py`. Photos and paintings in the slides come from Wikimedia Commons (public domain, CC0 or CC BY-SA); each unit's `images/CREDITS.md` lists them, and each deck ends with a picture-credits slide.
