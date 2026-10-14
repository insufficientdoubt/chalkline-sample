# Archive

Code that works but is switched off for now. Nothing here runs during a build.

| File | What it did | To turn it back on |
|---|---|---|
| `booklet.py` | Made an A3 fold-in-half booklet PDF (`name-booklet.pdf`) for every worksheet over 2 pages, and added an "A3 booklet" link next to the PDF link. Archived 2026-10-14. | Move it back to `scripts/` and add `- scripts/booklet.py` under `post-render:` in `_quarto.yml`. It worked on single worksheets; it was never tried on packets. |
