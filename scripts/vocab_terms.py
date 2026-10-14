"""Read every term in vocab/data/vocab.csv for the {{< vocab "chain wrap" >}} pop-ups.

Runs automatically before each render (`pre-render` in _quarto.yml), so pop-ups always
match the vocab list. Picture and link paths are relative to the site root; the shortcode
adds the "../" a page needs.

Writes:
    generated/vocab-terms.json
"""

import csv
import json
from pathlib import Path

from genfile import write_if_changed

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "vocab" / "data" / "vocab.csv"
OUT = ROOT / "generated" / "vocab-terms.json"


def main():
    terms = []
    with open(SRC, encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            terms.append({
                "id": r["id"],
                "term": r["term_en"],
                "aka": [a.strip() for a in r["aka"].split(";") if a.strip()],
                "zh": r["zh"],                    # shown in pop-ups (reference), never in flashcards or quizzes
                "definition": r["short_def"],
                "image": "vocab/images/" + r["image"] if r["image"] else "",
                "url": "vocab/app/#id=" + r["id"],
            })
    OUT.parent.mkdir(exist_ok=True)
    write_if_changed(OUT, json.dumps({"terms": terms}, ensure_ascii=False, indent=0))
    print(f"vocab_terms.py: {len(terms)} terms")


if __name__ == "__main__":
    main()
