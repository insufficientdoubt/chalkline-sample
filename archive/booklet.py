"""Make A3 booklet versions of long worksheets: print double-sided, fold down the middle.

Runs automatically after each render (`post-render` in _quarto.yml).

The rule: every worksheet (`type: worksheet`) whose PDF has more than 2 pages
also gets a booklet, saved next to it as name-booklet.pdf. The regular A4 PDF
is kept. Override in a document's front matter:
    booklet: true     always make a booklet (any type)
    booklet: false    never make one

The A4 pages go two to a side on A3 landscape sheets, in booklet order, padded
with blank pages to a multiple of 4. The worksheet's page and the overview
get an "A3 booklet" link next to the PDF link.

Print the booklet double-sided with the printer's normal setting (flip on the
long edge), then fold. The inside pages are stored upside down on purpose.

Uses Typst (bundled with Quarto), so no extra Python packages are needed.
"""

import os
import re
import subprocess
import tempfile
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent

LAYOUT = r"""
#set page(paper: "a3", flipped: true, margin: 0pt)
#let src = sys.inputs.src
#let n = int(sys.inputs.pages)
#let sheets = int(calc.ceil(n / 4))
#let total = sheets * 4
#let half(p) = box(width: 50%, height: 100%,
  if p <= n { image(src, page: p, width: 100%, height: 100%) })
#for i in range(sheets) {
  // Outside of the sheet: last page on the left, first page on the right.
  if i > 0 { pagebreak() }
  half(total - 2 * i) + half(2 * i + 1)
  pagebreak()
  // Inside: the next two pages, side by side, turned upside down so a printer
  // that flips on the long edge (the usual default) prints them right way up.
  rotate(180deg, box(width: 100%, height: 100%, half(2 * i + 2) + half(total - 2 * i - 1)))
}
"""


def front_matter(path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    return yaml.safe_load(text.split("---", 2)[1]) or {}


def page_count(pdf):
    # Typst writes each page as a plain "/Type /Page" object (no compressed object streams).
    return len(re.findall(rb"/Type\s*/Page\b(?!s)", pdf.read_bytes()))


def wants_booklet(meta, pages):
    choice = meta.get("booklet")
    if choice is not None:
        return choice is True
    return meta.get("type") == "worksheet" and pages > 2


def make_booklet(pdf, booklet, pages):
    with tempfile.TemporaryDirectory(dir=pdf.parent) as tmp:
        layout = Path(tmp) / "booklet.typ"
        layout.write_text(LAYOUT)
        subprocess.run(
            ["quarto", "typst", "compile", "--root", str(pdf.parent),
             "--input", f"src=/{pdf.name}", "--input", f"pages={pages}", str(layout), str(booklet)],
            check=True)
    print(f"booklet: {booklet.relative_to(ROOT)} ({pages} A4 pages -> A3 booklet)")


def add_links(out_dir):
    """Put an "A3 booklet" link beside the PDF link wherever one is shown. Safe to run again."""
    for booklet in out_dir.rglob("*-booklet.pdf"):
        pdf_name = booklet.name.replace("-booklet.pdf", ".pdf")
        page = booklet.with_name(pdf_name).with_suffix(".html")
        pages = [(page, pdf_name, booklet.name)]
        index = out_dir / "index.html"
        pages.append((index, booklet.parent.relative_to(out_dir).as_posix() + "/" + pdf_name,
                      booklet.relative_to(out_dir).as_posix()))
        for html, pdf_href, booklet_href in pages:
            if not html.exists():
                continue
            text = html.read_text(encoding="utf-8")
            if f'href="{booklet_href}"' in text:
                continue
            # The worksheet's own page: Quarto's "Other Formats" list.
            text = text.replace(
                f'<li><a href="{pdf_href}"><i class="bi bi-file-pdf"></i>PDF</a></li>',
                f'<li><a href="{pdf_href}"><i class="bi bi-file-pdf"></i>PDF</a></li>'
                f'<li><a href="{booklet_href}"><i class="bi bi-book"></i>A3 booklet</a></li>')
            # The overview's Print column.
            text = text.replace(
                f'<a href="{pdf_href}">PDF</a></td>',
                f'<a href="{pdf_href}">PDF</a> <a href="{booklet_href}">A3 booklet</a></td>')
            html.write_text(text, encoding="utf-8")


def main():
    out_dir = ROOT / os.environ.get("QUARTO_PROJECT_OUTPUT_DIR", "_site")
    for f in os.environ.get("QUARTO_PROJECT_OUTPUT_FILES", "").splitlines():
        pdf = Path(f) if Path(f).is_absolute() else ROOT / f
        if pdf.suffix != ".pdf" or pdf.stem.endswith("-booklet") or not pdf.exists():
            continue
        source = ROOT / pdf.relative_to(out_dir).with_suffix(".qmd")
        if not source.exists():
            continue
        booklet = pdf.with_name(pdf.stem + "-booklet.pdf")
        pages = page_count(pdf)
        if wants_booklet(front_matter(source), pages):
            make_booklet(pdf, booklet, pages)
        else:
            booklet.unlink(missing_ok=True)   # e.g. the worksheet got shorter
    add_links(out_dir)


if __name__ == "__main__":
    main()
