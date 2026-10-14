# History vocab (sample)

A bilingual (English / 简体中文) vocab list for the two sample units, and the vocab app that shows it (`app/`, on the site under **History vocab** in the sidebar).

- `data/vocab.csv`: the terms. **The source of truth**: slides' vocab pop-ups (`{{< vocab "democracy" >}}`) and the unit vocab cards read it.
- `data/frames.csv`: sentence frames for discussion and writing.
- `images/`: one picture per term, named by ID. These are simple drawings made by `tools/draw_icons.py`; replace any with your own.
- `config.js`: the app's title, topic names (in English and 中文) and quick-reference links.
- `schema.yaml` + `validate.py`: the column rules. Run `python vocab/validate.py` after editing the CSV.

## Rules

1. **English is the target.** 中文 (`zh`) is support only.
2. **中文 appears in reference materials, never in review materials** (quizzes, flashcards, Kahoots).
3. **`short_def` stands on its own in simple English, 75 characters or fewer.**
4. **IDs are permanent.** Never reuse or renumber one.
5. To add a topic, add a domain (ID prefix) in `schema.yaml` and give it names in `config.js`.

## Sources

Facts are from Wikipedia ([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)), rewritten in simple English. Each term's `ref_url` links to the article it's based on.
