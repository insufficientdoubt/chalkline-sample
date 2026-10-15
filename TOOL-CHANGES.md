# Changes to the tool

A log of changes to how Chalkline works or looks (code, styles, settings), as opposed to lesson content. AI assistants add an entry here whenever they change a tool file (see "Changing the tool" in `CLAUDE.md`); you can add entries by hand too.

**Why it matters:** this is design feedback. Send this file to John now and then: useful changes may be built into Chalkline for every teacher.

Newest entries first.

<!-- Entries go below this line. Copy this template:

## YYYY-MM-DD: short title
- **Asked for:** what the teacher wanted, in their words if they gave them.
- **Why:** the reason they gave, or "not given".
- **Changed:** each file and what changed in it.
- **Who it helps:** this course only, or probably every Chalkline course.
- **AI assistant:** which one made the change.
-->

## 2026-10-15: Vocab pictures and diagrams for a third unit (Göbekli Tepe)
- **Asked for:** "a new unit about that ancient site in Turkey … Göbekli Tepe … in the same style as the other two."
- **Why:** not given.
- **Changed:** `vocab/schema.yaml`: new domain `GBT` (ID pattern and its subdomains). `vocab/config.js`: names for `GBT` in English and 中文, 中文 for the new subdomains, three "Read more" links. `vocab/tools/draw_icons.py`: helpers for a T-pillar, a fox and a ring of pillars; 12 new icons (GBT-001 to GBT-012); two new diagrams (`how-old`, `pillar-parts`); `DIAGRAMS` now says which unit folder each diagram goes in (it used to put every diagram in `02-ancient-rome`).
- **Who it helps:** the domain and icons, this course only. Per-unit diagram folders in `draw_icons.py`, probably every Chalkline course that draws its own diagrams.
- **AI assistant:** Claude.
