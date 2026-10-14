"""Season facts (dates, team numbers) from course/season.yml, for slides and printables.

    import sys; sys.path.append("scripts")
    from season import season, events_list
    print(events_list())        # in a cell marked  #| output: asis
"""

import datetime
from pathlib import Path

import yaml

SEASON_FILE = Path(__file__).resolve().parent.parent / "course" / "season.yml"


def season():
    return yaml.safe_load(SEASON_FILE.read_text(encoding="utf-8"))


def events_list(upcoming_only=False):
    """A bulleted list of events: date, name, kind."""
    today = datetime.date.today()
    lines = []
    for e in season().get("events", []):
        if upcoming_only and e["date"] < today:
            continue
        lines.append(f"- **{e['date']:%b} {e['date'].day}, {e['date'].year}** · {e['name']} · {e.get('kind', '')}")
    return "\n".join(lines) + "\n"


def next_event():
    today = datetime.date.today()
    for e in season().get("events", []):
        if e["date"] >= today:
            return e
    return None
