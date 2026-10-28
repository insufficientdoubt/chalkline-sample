# Changelog

## Unreleased

- **Hosting** (`HOSTING.md`, `hosting/`): step-by-step setup for a student site and a teacher site with
  email-code sign-in on Cloudflare Workers, mostly done by Claude with the Cloudflare API connector.
  `hosting/` has the GitHub workflow and Worker settings to copy into a course.
- **View source** (U, in the toolbox): the current slide's source as typed, with colors and line numbers;
  Copy, and Open in VS Code on your own computer. Teacher site only. `toolbox/source.lua` cuts the deck
  into slides; `toolbox/tools/source.js` shows them.
- A new course: `quarto use template insufficientdoubt/project-chalkline` copies the course files
  without the sample's content, and `python chalkline.py setup` (run by the first build) adds a starter
  unit (one slide deck, one handout, four vocab words) and the course files from `starter/`.
- **All slides** (`{{< slide-wall >}}`, the course's `all-slides.qmd`): every unit's decks as rows of slide
  pictures; a click opens the deck at that slide. `scripts/slide_pictures.py` takes the pictures after each
  full build. Slide PDFs and pictures also work with a Chromium installed by Playwright (build servers).
- The robotics-only slide styles are gone; VEX names in the code are general.

## 0.1.0 (2026-10-25)

The first version as a Quarto extension, taken out of the Chalkline sample course
(insufficientdoubt/project-chalkline, which keeps the earlier history; see its TOOL-CHANGES.md).

- One extension: the classroom shortcodes and filters, games, toolbox and PDF viewer.
- A `chalkline` project type: page, slide and PDF layouts, print fonts, and the build steps.
- Scripts run with `python chalkline.py <command>` from a course.
- Shortcodes instead of Python cells: `vocab-cards`, `word-bank`, `vocab-table`, `vocab-list`,
  `fill-in-the-blank`, `overview`, `season-events`.
- The vocab app and vocab checker; starter templates for a slide deck and a worksheet.
