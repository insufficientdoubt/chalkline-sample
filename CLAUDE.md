# Chalkline sample course

- Read `README.md` first. Content lives in `course/` and `vocab/`, appearance in `brand/`, code in `_extensions/` and `scripts/`.
- Every slide deck and printable has labels at the top: `title`, `type` (slides, worksheet, checklist, handout, reference), `order`, `audience` ([teacher, student, parent]) and `description`. Keep them.
- **Vocab:** `vocab/data/vocab.csv` is the source of truth; run `python vocab/validate.py` after editing it. Follow the rules in `vocab/README.md`: English is the target, 中文 is support; 中文 appears in reference materials, never in review materials (quizzes, flashcards); `short_def` is simple English, 75 characters or fewer; IDs are permanent.
- **Gloss key vocab:** on slides, write key words as `{{< vocab "democracy" >}}` (a pop-up with picture and 中文). On printables, use `{{< vocab "democracy" zh=true >}}` so the 中文 is printed too, except on quizzes and tests.
- Write for middle-school English learners: short sentences, simple words, one idea per bullet.
- Teacher-only content (answer keys, look-fors) goes inside `::: {.content-visible when-profile="teacher"}`.
- Use original drawings or files with a clear license; credit outside sources in `course/links.yml`.

## Editing printables and slides

Keep the edit loop quick:

1. While working on one worksheet (or deck), re-render **only that file** after each change: `quarto render course/units/<unit>/<file>.qmd` (add `--to typst` to check just the PDF). Don't run a full `quarto render` and don't rebuild packets on every change.
2. When that file is done: save/commit it, then rebuild its unit packet once: `python scripts/packets.py --unit <unit number or folder>`.
3. A full render (`quarto render`) or the launcher's startup check rebuilds everything else (the year packet, slide PDFs).

If `quarto preview` is running, don't run a full `quarto render` at the same time: it empties `_site/` while the preview is serving it.
