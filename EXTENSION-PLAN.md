# Plan: Chalkline as a Quarto extension

The map for splitting Chalkline into **a Quarto extension** (the shared tool) and **a course template** (a starter course). The why is in `IDEAS.md` ("Chalkline as a Quarto extension"). This file says where every file goes and in what order to do the work.

Status: **steps 1–4 done** (2026-10-25). Next: step 5.

## The three places

| Place | What it is | Who changes it | How it updates |
|---|---|---|---|
| **Extension** | The `chalkline` repository: one Quarto extension | Only Chalkline's maintainers | `quarto update` in each course |
| **Template** | A starter course repository ("Use this template" on GitHub) | Copied once when a course is made, then the course owns it | Never on its own. Changes come as notes in the release notes |
| **Course** | One teacher's own content and settings | The teacher | — |

Rule of thumb: **if a bug fix in this file should reach every course, it goes in the extension.** If every course needs its own copy, it goes in the template. If it's about one subject or one school, it belongs to the course.

## Where every file goes

### `_extensions/` → extension

| Now | Goes to | Notes |
|---|---|---|
| `_extensions/classroom/**` (filters, shortcodes, toolbox, games, activities, quickref, ui, video fit, polls, countdown) | **Extension** | All of it. This is the heart of Chalkline. |
| `_extensions/pdf-viewer/**` (with pdf.js and pdf-lib) | **Extension** | Merge it into the one Chalkline extension, so a course installs one thing. |

Both become a single `_extension.yml` that adds the shortcodes, the filters and the formats (below). After `quarto add <owner>/chalkline`, it lands in `_extensions/<owner>/chalkline/`. (`IDEAS.md` says `_extensions/chalkline/`, but Quarto puts extensions installed from GitHub under the owner's name.) `_quarto.yml` still writes just `filters: [chalkline]`.

### Games and activities → extension; the pages that show them → template

| Now | Goes to | Notes |
|---|---|---|
| `_extensions/classroom/games/**` (every game, learning activities, timelines, Label it, their styles) | **Extension** | The game engine. A new game or a fix reaches every course with `quarto update`. |
| The `{{< game-picker >}}`, `{{< game >}}` and activity shortcodes | **Extension** | Part of `shortcodes.lua` / `games.lua`. |
| `course/review-games.qmd`, `course/play.qmd` | **Template** (then the course's) | Thin pages: a title, a few settings, one `{{< game-picker >}}`. A course can choose which games to show. |
| The words, questions and pictures the games use | **Course** | They come from `vocab/data/` and `course/vocab/`, so a game is about the course's subject with no code. |

### Slide templates → extension

Two kinds, both in the extension:

| What | Goes to | Notes |
|---|---|---|
| **Slide layouts**: the classes a deck uses (`.statement`, `.challenge`, `.card-grid`, `.goal`, timer slides, ...) | **Extension** (`chalkline-revealjs`) | Today they're in `brand/revealjs.scss`. A fix or a new layout reaches every course. Check each one when it moves: some were made for the robotics decks and may not be general. |
| **Starter decks and printables**: a `.qmd` you copy to start a new deck (labels filled in, the usual slides in place) | **Extension**, in `templates/` | A small command (`new.py slides "Roman roads"`, also a VS Code task) copies one into a unit folder. The copy belongs to the course. A newer template doesn't change decks already made. |
| A course's own starter decks | **Course** | The same command looks in a course's `templates/` folder too, so a teacher can make their own. |

Rule for new templates as they come: if the deck's *design* could serve any subject, its layouts go in the extension and its starter file in `templates/`. If it's one subject's deck, it's content.

### `brand/` → split in two

Most of `brand/` is **Chalkline's design**: it reads the colors and fonts from `_brand.yml` and lays out pages, slides and PDFs. Only a few files are **the school's**.

| Now | Goes to | Notes |
|---|---|---|
| `brand/styles.scss` (589 lines) | **Extension** | Section headings, callouts, posters, the overview, packet buttons. It already takes its colors from `_brand.yml`. Ships in a `chalkline-html` format. |
| `brand/revealjs.scss` | **Extension** | Same idea, for slides (a `chalkline-revealjs` format). |
| `brand/typst/typst-template.typ`, `typst-show.typ` | **Extension** | The worksheet and poster layouts. Ships in a `chalkline-typst` format, with `template-partials` pointing inside the extension. |
| `brand/type-colors.html` | **Extension** | Colors the overview by type. |
| `brand/fonts/print/` (Fredoka, Patrick Hand, Noto Sans SC) | **Extension** | Chalkline's print fonts, needed by the Typst template. 17 MB with Noto Sans SC, so check the download size (see questions). |
| `brand/_brand.yml` | **Course** (template ships an example) | The school's colors, fonts and logo. |
| `brand/logos/` | **Course** (template ships a placeholder) | The school's logo and icons. |
| `brand/fonts/*.ttf` (Source Sans 3, Poppins) | **Template** | The default web fonts, named in `_brand.yml`. A school can swap them. |
| `brand/README.md` | **Split** | How to change the brand → template. How the layouts work → extension docs. |
| *(new)* `brand/course.scss` | **Template**, empty | The school's own style overrides. It loads after Chalkline's, so it wins. |

### `scripts/` → extension, except two

| Now | Goes to | Notes |
|---|---|---|
| `catalog.py`, `lessons.py`, `freeze_check.py`, `vocab_terms.py`, `vocab_brand.py`, `genfile.py` | **Extension** | Pre-render steps. |
| `student_site.py`, `packets.py`, `slides_pdf.py` | **Extension** | Post-render steps. |
| `build_if_needed.py`, `open_site.py` | **Extension** | Used by the launchers and VS Code tasks. |
| `season.py`, `vocab.py` | **Extension** | Helpers imported by the pages' Python cells (see "Pages that import scripts" below). |
| `export_vocab.py`, `drawio.py` | **Extension** | Teacher tools, run by hand. |
| `import_vex_vocab.py` | **Course** (or delete) | Left over from the robotics course (VEX terms). Not general. |
| *(new)* `scripts/` | **Template**, empty | Where a course's own scripts go. |

The `pre-render` and `post-render` lists in the template's `_quarto.yml` point into the extension (`_extensions/<owner>/chalkline/scripts/catalog.py`, ...). One short list that a course doesn't change.

### `vocab/`

| Now | Goes to | Notes |
|---|---|---|
| `vocab/app/` (the vocab app, scratchblocks) | **Extension** | `IDEAS.md` puts it in the template. I suggest the extension instead: it's the same in every course, and it gets fixes. A pre-render step copies it into the site. |
| `vocab/validate.py`, `vocab/schema.yaml` | **Extension** | The same rules in every course. |
| `vocab/tools/draw_icons.py` | **Extension** | Draws pictures in the brand colors. |
| `vocab/config.js` | **Course** (template ships an example) | The app's title, topic names, links. Made for this. |
| `vocab/index.html` | **Template** | A one-line redirect into the app. |
| `vocab/data/`, `vocab/images/` | **Course** | Content. |
| `vocab/README.md` | **Split** | The rules for writing vocab (English target, 中文 support, 75 characters) → template. How the app works → extension docs. |
| `vocab/.gitattributes`, `vocab/.gitignore` | **Template** | |

### Project files at the top

| Now | Goes to | Notes |
|---|---|---|
| `_quarto.yml` | **Template** | Gets much shorter: formats become `chalkline-html` / `chalkline-revealjs` / `chalkline-typst`, scripts point into the extension. The course keeps its title, sidebar, `vocab-title`, `student-site`. |
| `_quarto-teacher.yml`, `_quarto-student.yml` | **Template** | The bottom of `_quarto-student.yml` is written by `catalog.py`. That's fine. |
| `index.qmd` (the overview) | **Template**, kept thin | Its listing and layout come from `catalog.py`. Move any logic still in the page into the extension, so the overview gets fixes. |
| `families.qmd` | **Template** (as an example) → **Course** | The welcome text belongs to each course. |
| `Start Chalkline.command`, `Start Chalkline.bat` | **Template**, kept thin | A launcher can't live in the extension (it has to be at the top, ready to double-click). Keep it to "find Quarto, set up Python, run the extension's start script", so new features come through the extension. |
| `requirements.txt` | **Template** | Lists the Python packages the extension's scripts need. Released with notes when it changes. |
| `.vscode/`, `.github/workflows/publish.yml` | **Template** | |
| `README.md`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` | **Template** | Rewrite the "Changing the tool" part (below). |
| `TOOL-CHANGES.md` | **Template**, empty | Stays as the log for a course's own layer. |
| `IDEAS.md`, this file | **Extension** repo | Chalkline's to-do list. |
| `.gitignore` | **Template** | |

### Content: stays in the course

`course/**` (units, lessons, `season.yml`, `links.yml`, `course/vocab/`), `vocab/data/`, `vocab/images/`, `archive/`. The template gets a small example unit from this sample (say `00-start-here` and one history unit).

## Things to fix before the move

These are places where content and tool are tangled today:

1. **Pages that import scripts.** 11 pages do `sys.path.append("scripts")` and then `from vocab import ...` / `from catalog import ...`. Once the scripts move, that path breaks. Options:
   - (a) Write `sys.path.append("_extensions/<owner>/chalkline/scripts")` in every page. Ugly, and it breaks if the owner changes.
   - (b) **Suggested:** turn these cells into shortcodes (`{{< vocab-list unit=2 >}}`, `{{< events >}}`). Pages get simpler, and no Python in content.
   - (c) A pre-render step that writes a tiny `scripts/chalkline.py` in the course that finds the extension.
   
   One more: `sys.path.append("course/units/04-stem")` (3 cells) is content importing content. That's fine, it stays.
2. **Paths fixed in the code.** The scripts and Lua filters assume `course/units/`, `course/lessons/`, `course/season.yml`, `vocab/data/vocab.csv`, `vocab/app/`. Fine for now (every Chalkline course uses this layout), but put them in one place (a `chalkline:` block in `_quarto.yml`, with these as defaults).
3. **`brand/styles.scss` mixes Chalkline's design and the school's.** It's mostly Chalkline's, but check for sample-only touches (the sailboat icon size) and move those to `brand/course.scss`.
4. ~~**The extension's own name.**~~ Done in step 1: `filters: [chalkline]`.

## Order of work

Each step leaves the sample working. Commit after each one.

1. ✅ **Gather into one extension, inside this repo.** Move `pdf-viewer` into `classroom`, rename it `_extensions/chalkline/`, and update `_quarto.yml`. Render, check that slides, PDFs and the overview look the same.
2. ✅ **Move Chalkline's styles and Typst template into the extension** as custom formats (`chalkline-html`, `chalkline-revealjs`, `chalkline-typst`). Leave `_brand.yml`, logos and an empty `brand/course.scss` in `brand/`. Compare PDFs before and after (page counts and a look at one worksheet, one poster, one deck).
3. ✅ **Move `scripts/` into the extension** (except `import_vex_vocab.py`), and fix the pages that import them (fix 1 above). Point `pre-render`/`post-render`, the launchers, `.vscode/tasks.json` and the publish workflow at the new paths.
4. ✅ **Move the vocab app, `validate.py` and `schema.yaml` into the extension.**
   Add `templates/` and the `new.py` command (start with a slide deck and a worksheet).
5. **Check:** a full `quarto render` for both profiles, the launcher on Mac and Windows, the publish workflow, a game and a vocab pop-up. At this point the sample is a course with Chalkline inside `_extensions/`, ready to split.
6. **Make the `chalkline` repository** from `_extensions/chalkline/` (keep its git history with `git subtree split` if we want it). Tag `v0.1.0`.
7. **Make the template repository:** this sample minus most units, with `quarto add <owner>/chalkline` done. Mark it as a template on GitHub.
8. **This sample becomes a course:** replace its `_extensions/chalkline/` with the installed one, and check that nothing changed.
9. **Move the alpha testers** (as in `IDEAS.md`): read each one's `TOOL-CHANGES.md`, pull good changes into Chalkline first, then swap their tool folders for the extension.

Steps 1 to 5 happen right here, and are worth doing even if we stop there: the tool ends up in one folder, which makes it easy to see what's tool and what's content.

## New rules for teachers and AI assistants (after step 8)

Replace "Changing the tool: keep a log" in `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` with:

- **Never edit `_extensions/<owner>/chalkline/`.** `quarto update` overwrites it.
- To change how something looks, edit `brand/_brand.yml` or `brand/course.scss`.
- To add a shortcode, filter or tool, put it in `_extensions/my-tools/` and log it in `TOOL-CHANGES.md` (the log stays: it's how good ideas reach Chalkline).
- Found a bug in Chalkline? Note it in `TOOL-CHANGES.md` and tell John, instead of fixing it in place.

## Questions to settle

- **The owner on GitHub:** `insufficientdoubt/chalkline`, or an organization (so the name doesn't depend on one person)? The owner shows up in every course's paths.
- **Version numbers:** `0.x` during alpha (anything may change), `1.0` when the template is stable.
- **Fonts:** the print fonts are 17 MB (mostly Noto Sans SC). Fine for `quarto add`? Or ship a smaller subset of the Chinese font?
- **Vocab app:** extension (suggested above) or template (as `IDEAS.md` says)?
- **Python cells in content:** shortcodes (suggested) or keep Python?
- **Custom project type:** Quarto may also let an extension supply the `project:` settings (pre/post-render, resources), so a course's `_quarto.yml` gets even shorter. Try it in step 3. If it doesn't work, the explicit list is fine.
