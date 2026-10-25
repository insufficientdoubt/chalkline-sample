# Chalkline

A Quarto extension for bilingual (English / 中文) middle-school courses: slide decks with classroom
tools, printable worksheets and packets, review games, and a vocab app, all from one set of files.

## Use it in a course

Start a new course from the course template (it has all of this set up), or add Chalkline to a
Quarto website:

```bash
quarto add insufficientdoubt/project-chalkline   # installs only _extensions/insufficientdoubt/chalkline/
```

Install it *before* setting `type: chalkline` in `_quarto.yml`: until it's installed, Quarto doesn't know
that project type and `quarto add` stops with "Unsupported project type".

Then in the course's `_quarto.yml`:

```yaml
project:
  type: chalkline        # Chalkline's page, slide and PDF layouts, and its build steps
school: "Your School"    # printed in PDF headers and footers
brand: brand/_brand.yml  # the school's colors (palette names navy, blue, turquoise, orange, sky), fonts, logos
filters:
  - chalkline
```

A course also needs `chalkline.py` and `requirements.txt` from the course template, and the
folders Chalkline reads: `course/units/`, `course/vocab/`, `course/season.yml`, `vocab/data/`,
`vocab/config.js`, `vocab/schema.yaml`.

## Update

```bash
quarto update insufficientdoubt/project-chalkline
```

Never edit the files in this folder inside a course: an update replaces them. Change the look
in the course's `brand/` files, and put a course's own shortcodes or filters in its own
extension (for example `_extensions/my-tools/`).

## What's in here

| Folder or file | What it does |
|---|---|
| `_extension.yml` | The `chalkline` project type, filters and shortcodes |
| `shortcodes.lua`, `filter.lua`, `blocks.lua`, `games/`, `quickref.*`, `video-shape.lua` | Shortcodes and content markers (see the comments at the top of each file) |
| `toolbox/`, `ui/`, `pdf-viewer/` | The classroom toolbox, the shared design layer, the PDF viewer |
| `styles/`, `typst/`, `fonts/print/` | Web page, slide and PDF layouts; PDF fonts |
| `scripts/` | Build steps and commands, run with `python chalkline.py <command>` from the course |
| `vocab-app/` | The vocab app, copied into the course's `vocab/app/` before each build |
| `templates/` | Starter files for `python chalkline.py new slides 2 "Title"` |

What changed in each version: `CHANGELOG.md`.
