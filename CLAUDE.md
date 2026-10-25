# Chalkline sample course

- Read `README.md` first. Content lives in `course/` and `vocab/`, appearance in `brand/`, Chalkline itself (the tool) in `_extensions/chalkline/`.
- Every slide deck and printable has labels at the top: `title`, `type` (slides, worksheet, checklist, handout, reference, game), `order`, `audience` ([teacher, student, parent]) and `description`. Keep them.
- **Vocab:** `vocab/data/vocab.csv` is the source of truth; run `python chalkline.py validate` after editing it. Follow the rules in `vocab/README.md`: English is the target, 中文 is support; 中文 appears in reference materials, never in review materials (quizzes, flashcards); `short_def` is simple English, 75 characters or fewer; IDs are permanent.
- **Gloss key vocab:** on slides, write key words as `{{< vocab "democracy" >}}` (a pop-up with picture and 中文). On printables, use `{{< vocab "democracy" zh=true >}}` so the 中文 is printed too, except on quizzes and tests.
- Write for middle-school English learners: short sentences, simple words, one idea per bullet.
- Teacher-only content (answer keys, look-fors) goes inside `::: {.content-visible when-profile="teacher"}`.
- **Pictures:** use files with a clear license, or original drawings. Credit every outside picture in the `CREDITS.md` next to it (`images/CREDITS.md` in a unit, `vocab/images/CREDITS.md` for vocab). Outside *links* (websites, articles) go in `course/links.yml`.
- **Vocab pictures: a real photo first, a drawing only when a photo can't show it.** When you add or replace a vocab word's picture, first look for a high-quality real image with an open license: Wikimedia Commons, Unsplash, Pexels, Openverse, or museum open-access collections (the Met, Smithsonian, Rijksmuseum). Most concrete words (temple, aqueduct, gladiator, quarry) are clearer and more memorable as a real photo. Make an original drawing only when no open image shows the idea clearly and distinctly: abstract ideas, or when the photos are blurry, busy or watermarked. The steps and quality checks are in `vocab/README.md` ("Pictures").

## Editing printables and slides

Keep the edit loop quick:

1. While working on one worksheet (or deck), re-render **only that file** after each change: `quarto render course/units/<unit>/<file>.qmd` (add `--to typst` to check just the PDF). Don't run a full `quarto render` and don't rebuild packets on every change.
2. When that file is done: save/commit it, then rebuild its unit packet once: `python chalkline.py packets --unit <unit number or folder>`.
3. A full render (`quarto render`) or the launcher's startup check rebuilds everything else (the year packet, slide PDFs).

If `quarto preview` is running, don't run a full `quarto render` at the same time: it empties `_site/` while the preview is serving it.

## Changing the tool (not the content): keep a log

This repo has two kinds of files:

- **Content** (lessons, worksheets, vocab words, pictures): everything in `course/`, plus `vocab/data/` and `vocab/images/`. Change these freely. No log needed.
- **The tool** (how Chalkline works and looks): `_extensions/`, `chalkline.py`, `brand/`, `vocab/config.js`, `vocab/tools/`, `vocab/schema.yaml`, `_quarto*.yml`, `index.qmd`, the `Start Chalkline` launchers, `.vscode/` and `.github/`.

**Whenever you change a tool file, add an entry to the top of `TOOL-CHANGES.md`** (create it if it's missing), in the same change. Use this form:

```markdown
## YYYY-MM-DD: short title
- **Asked for:** what the teacher wanted, in their words if they gave them.
- **Why:** the reason they gave, or "not given".
- **Changed:** each file and what changed in it, in a line or two.
- **Who it helps:** this course only, or probably every Chalkline course.
- **AI assistant:** which one made the change (Claude, Gemini, WorkBuddy, …).
```

Never delete or rewrite earlier entries. These logs are collected as design feedback and may become improvements to Chalkline for everyone, so the reasons matter as much as the changes.
- **Emoji:** avoid 🤖, 💩 and 🔒 in slides and pages. The brand font (Source Sans 3) has its own black-and-white versions of them, so they never show in color. Other common emoji are fine.
