"""Fill in a new course: a starter unit (one slide deck, one handout, four vocab words) and the
course files a build needs, from Chalkline's starter/ folder.

    python chalkline.py setup

`python chalkline.py build` (the launchers and VS Code) runs this first, so a new course made with
`quarto use template` has a working unit the first time it starts. It never changes a file that's
already there, and it adds the starter unit only to a course with no units yet.
"""

import shutil
import sys

from extension import EXT, ROOT  # noqa: E402

STARTER = EXT / "starter"
UNIT_ONLY = ("course/units/", "course/vocab/")   # only for a course with no units yet


def has_units():
    units = ROOT / "course" / "units"
    return units.is_dir() and any(d.is_dir() and (d / "index.qmd").exists() for d in units.iterdir())


def ensure(quiet=False):
    """Copy every starter file that's missing. Returns the files added."""
    add_unit = not has_units()
    added = []
    for src in sorted(STARTER.rglob("*")):
        rel = src.relative_to(STARTER).as_posix()
        dest = ROOT / rel
        if src.is_dir() or dest.exists() or (rel.startswith(UNIT_ONLY) and not add_unit):
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        added.append(rel)
    if added and not quiet:
        print("Chalkline setup: added " + ", ".join(added))
        if add_unit:
            print("Your first unit is in course/units/01-first-unit/. Copy it to make more units.")
    return added


def main():
    if not ensure():
        print("Chalkline setup: nothing to add; this course has everything it needs.")


if __name__ == "__main__":
    sys.exit(main())
