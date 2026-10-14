"""Open the teacher or family site: build it if anything changed, then serve the finished files.

    python scripts/open_site.py parent     the family site at http://localhost:4102
    python scripts/open_site.py teacher    the teacher site at http://localhost:4101

The everyday site (student version) uses `quarto preview` instead, which rebuilds pages as
you edit (the "Start Chalkline" launchers). These two are served as plain files, so they can
run alongside it: two Quarto previews of the same project at once get in each other's way.
After editing, stop this (Ctrl+C) and run it again to rebuild.
"""

import functools
import http.server
import subprocess
import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORTS = {"teacher": 4101, "parent": 4102}


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main():
    profile = sys.argv[1] if len(sys.argv) > 1 else ""
    if profile not in PORTS:
        sys.exit("Usage: python scripts/open_site.py parent|teacher")
    subprocess.run([sys.executable, "scripts/build_if_needed.py", "--profile", profile], cwd=ROOT)
    site = ROOT / f"_site-{profile}"
    port = PORTS[profile]
    url = f"http://localhost:{port}/"
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(QuietHandler, directory=str(site)))
    print(f"Chalkline: the {profile} site is at {url}  (Ctrl+C or close this window to stop)")
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
