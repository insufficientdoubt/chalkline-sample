"""Tidy the family site (`--profile parent`) after each render.

Runs after each render (`post-render` in _quarto.yml) and does nothing in other builds.
Quarto leaves the pages the family site skips (the "drafts" listed at the end of
_quarto-parent.yml) as empty stub pages, and still writes their PDFs. This deletes them,
so the family site only holds what's meant for families. It also removes the vocab
app's teacher page (vocab by STEM Lab lesson).
"""

import os
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
TEACHER_ONLY = ["vocab/app/lessons.html"]


def is_parent_build():
    return ("parent" in os.environ.get("QUARTO_PROFILE", "").split(",")
            or "parent" in os.environ.get("QUARTO_PROJECT_OUTPUT_DIR", ""))


def main():
    if not is_parent_build():
        return
    out_dir = ROOT / os.environ.get("QUARTO_PROJECT_OUTPUT_DIR", "_site-parent")
    profile = yaml.safe_load((ROOT / "_quarto-parent.yml").read_text(encoding="utf-8"))
    removed = 0
    for draft in profile["website"].get("drafts") or []:
        for suffix in (".html", ".pdf", ".docx"):
            out = out_dir / Path(draft).with_suffix(suffix)
            if out.exists():
                out.unlink()
                removed += 1
    for rel in TEACHER_ONLY:
        if (out_dir / rel).exists():
            (out_dir / rel).unlink()
            removed += 1
    if removed:
        print(f"parent_site: removed {removed} files not meant for families")


if __name__ == "__main__":
    main()
