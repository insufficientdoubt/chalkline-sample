# Changelog

## Unreleased

- A new course: `quarto use template insufficientdoubt/project-chalkline` copies the course files
  without the sample's content, and `python chalkline.py setup` (run by the first build) adds a starter
  unit (one slide deck, one handout, four vocab words) and the course files from `starter/`.
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
