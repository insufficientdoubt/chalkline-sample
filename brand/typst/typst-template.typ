// Branded worksheet layout for PDF (Typst) output.
//
// Colors and logos come from brand/_brand.yml, so this file shouldn't need
// editing when the real brand kit arrives. Edit here to change the *layout*:
// title banner, name box, headings, answer-key boxes, header, and footer.

#let brand-school = "Mingwan School"

// Brand logo paths are relative to the project folder; "/" tells Typst to start there.
#let root-path(p) = if p.starts-with("/") { p } else { "/" + p }

// Brand colors, shared with the helpers below. Filled in by `article` at
// render time; until then the fallback colors in each helper are used.
#let worksheet-colors = state("worksheet-colors", (:))
#let worksheet-heading-font = state("worksheet-heading-font", none)
#let poster-dark = state("poster-dark", false)

// Chinese text: fall back to Noto Sans SC (brand/fonts/print/, found through font-paths in _quarto.yml).
#let with-cjk(f) = if f == none { none } else if type(f) == array { (..f, "Noto Sans SC") } else { (f, "Noto Sans SC") }

// Colors for the helpers below (fallbacks match brand/_brand.yml).
#let brand-colors(c) = (
  navy: c.at("navy", default: rgb("#003477")),
  blue: c.at("blue", default: rgb("#0087ff")),
  turquoise: c.at("turquoise", default: rgb("#14d7cd")),
  orange: c.at("orange", default: rgb("#ff8c0f")),
  sky: c.at("sky", default: rgb("#ebf7fd")),
)

// Ruled lines for students to write on. Use in a .qmd file with:
//   ```{=typst}
//   #answer-lines(4)
//   ```
#let answer-lines(n, gap: 0.42in) = {
  v(0.2em)
  for _ in range(n) {
    v(gap - 0.5pt)
    line(length: 100%, stroke: 0.5pt + luma(170))
  }
  v(0.6em)
}

// A big box with a dot grid for students to draw in. Use in a .qmd file with:
//   ```{=typst}
//   #drawing-box(height: 4in, label: "Side view")
//   ```
// height: 1fr fills the rest of the page.
#let drawing-box(height: 4in, label: none) = context {
  let c = worksheet-colors.get()
  let navy = c.at("navy", default: rgb("#003477"))
  let dots = tiling(size: (0.25in, 0.25in))[
    #place(dx: 0.125in - 0.7pt, dy: 0.125in - 0.7pt, circle(radius: 0.7pt, fill: luma(185)))
  ]
  block(width: 100%, height: height, fill: dots, stroke: 1.2pt + navy.lighten(30%),
        radius: 8pt, inset: 10pt, above: 0.6em, below: 0.6em)[
    #if label != none {
      box(fill: white, inset: (x: 5pt, y: 2pt), radius: 3pt,
        text(size: 8pt, weight: 700, tracking: 0.1em, fill: navy.lighten(20%))[#upper(label)])
    }
  ]
}

// A line to write on, inside a sentence or heading. Use {{< blank 1.5in >}} in a .qmd file.
#let blank(width) = context {
  let navy = worksheet-colors.get().at("navy", default: rgb("#003477"))
  box(width: width, height: 0.8em, stroke: (bottom: 1pt + navy.lighten(35%)))
}

// ::: {.keep}  keeps everything inside on one page.
#let keep(body) = block(breakable: false, width: 100%, body)

// ::: {.write-in}  around a table: taller rows for handwriting.
#let write-in(body) = {
  set table(inset: (x: 8pt, y: 14pt))
  body
}

// ---- Poster pieces ----------------------------------------------------------

// ::: {.value word="Respect" zh="尊重" pinyin="zūnzhòng"}  one row of a values poster.
#let poster-value(word: "", zh: "", pinyin: "", body) = context {
  let k = brand-colors(worksheet-colors.get())
  let hf = worksheet-heading-font.get()
  block(width: 100%, breakable: false, above: 0.8em, below: 0.8em, radius: 10pt, clip: true,
    grid(columns: (46%, 1fr), inset: (x: 20pt, y: 14pt),
      fill: (x, y) => if x == 0 { k.navy } else { k.sky },
      [
        #set text(font: hf) if hf != none
        #set text(fill: white)
        #text(size: 32pt, weight: 700)[#text(fill: k.orange)[#word.first()]#word.slice(1)]
        #v(-10pt)
        #text(size: 26pt, weight: 700)[#zh] #h(6pt) #text(size: 17pt, fill: white.darken(15%))[#pinyin]
      ],
      [
        #set text(size: 17pt)
        #set par(leading: 0.5em)
        #set list(spacing: 0.45em, marker: text(fill: k.blue)[▸])
        #body
      ],
    ))
}

// ::: {.big-quote zh="..."}  a large quote, with an optional Chinese line.
#let poster-quote(zh: none, body) = context {
  let k = brand-colors(worksheet-colors.get())
  let hf = worksheet-heading-font.get()
  let dark = poster-dark.get()
  block(width: 100%, inset: (y: 18pt))[
    #set text(font: hf) if hf != none
    #set par(leading: 0.5em)
    #text(size: 58pt, weight: 700, fill: if dark { white } else { k.navy })[#body]
    #if zh != none [
      #v(14pt)
      #text(size: 44pt, weight: 700, fill: if dark { k.orange } else { k.navy.lighten(15%) })[#zh]
    ]
    #v(6pt)
    #line(length: 30%, stroke: 8pt + k.orange)
  ]
}

// ::: {.steps title="..."}  a numbered list drawn as a row of cards with arrows.
#let poster-steps(title: none, body) = context {
  let k = brand-colors(worksheet-colors.get())
  let hf = worksheet-heading-font.get()
  let dark = poster-dark.get()
  block(width: 100%, breakable: false, above: 1.2em, below: 1.2em)[
    #if title != none {
      text(font: hf, size: 30pt, weight: 700, fill: if dark { white } else { k.navy })[#title]
      v(4pt)
    }
    #show enum: it => {
      let n = it.children.len()
      let cells = ()
      for (i, item) in it.children.enumerate() {
        if i > 0 { cells.push(align(horizon + center, text(size: 28pt, fill: k.blue)[→])) }
        cells.push([
          #circle(radius: 17pt, fill: k.orange)[#set align(center + horizon); #text(fill: k.navy, weight: 700, size: 17pt)[#(i + 1)]]
          #v(4pt)
          #set text(size: 17pt, fill: k.navy)
          #item.body
        ])
      }
      grid(
        columns: range(2 * n - 1).map(j => if calc.even(j) { 1fr } else { 32pt }),
        inset: (x, y) => if calc.even(x) { 16pt } else { 0pt },
        fill: (x, y) => if calc.even(x) { if dark { white } else { k.sky } } else { none },
        ..cells,
      )
    }
    #body
  ]
}

// Wave bands along the bottom of a poster, echoing the school emblem.
#let poster-waves(k) = context {
  let w = page.width
  let h = page.height
  let band(color, base, amp, phase) = {
    let pts = range(0, 61).map(i => (w * i / 60, h - base + amp * calc.sin(i / 60 * 540deg + phase)))
    polygon(fill: color, (0pt, h), ..pts, (w, h))
  }
  place(top + left, band(k.turquoise.transparentize(30%), 38mm, 4mm, 0deg))
  place(top + left, band(k.blue.transparentize(10%), 28mm, 5mm, 60deg))
  place(top + left, band(k.navy, 17mm, 4mm, 140deg))
}

// Callout boxes. "Answer key" and "Teacher …" boxes (teacher build only) get an orange
// teacher style. Every other callout (like the word bank) gets a blue style.
#let callout(body: [], title: "Callout", background_color: none, icon: none, icon_color: none, body_background_color: none) = context {
  let c = worksheet-colors.get()
  let navy = c.at("navy", default: rgb("#003477"))
  let blue = c.at("blue", default: rgb("#0087ff"))
  let orange = c.at("orange", default: rgb("#ff8c0f"))
  let sky = c.at("sky", default: rgb("#ebf7fd"))

  let title-text = if type(title) == str { title } else { repr(title) }
  let is-key = title-text.contains("Answer") or title-text.contains("Teacher")
  let accent = if is-key { orange } else { blue }
  let fill = if is-key { orange.lighten(87%) } else { sky }

  block(
    width: 100%,
    breakable: false,
    above: 1em,
    below: 1em,
    fill: fill,
    stroke: (left: 4pt + accent),
    radius: (right: 5pt),
    inset: (left: 14pt, right: 12pt, y: 10pt),
  )[
    #text(size: 0.78em, weight: 700, tracking: 0.12em, fill: navy)[
      #if is-key [✓ ] #upper(title)
    ]
    #v(0.15em)
    #body
  ]
}

#let article(
  title: none,
  subtitle: none,
  doc-type: none,
  edition: none,
  name-box: false,
  lang: "en",
  region: "US",
  font: none,
  fontsize: 11pt,
  heading-family: none,
  colors: (:),
  logos: (:),
  school: none,
  layout: none,           // "poster" for posters; anything else is a worksheet
  poster-theme: none,     // "dark" for a navy poster with white text
  poster-title: true,     // false: don't print the title (when a big quote is the headline)
  poster-center: false,   // true: center the content vertically
  doc,
) = {
  // Color roles: navy = all text and banners; blue = stripes and rules;
  // turquoise = decoration; orange = warm highlight and teacher-only items; sky = panels.
  let navy = colors.at("navy", default: rgb("#003477"))
  let blue = colors.at("blue", default: rgb("#0087ff"))
  let turquoise = colors.at("turquoise", default: rgb("#14d7cd"))
  let orange = colors.at("orange", default: rgb("#ff8c0f"))
  let sky = colors.at("sky", default: rgb("#ebf7fd"))
  let ink = colors.at("ink", default: rgb("#1F2933"))
  let logo-full = logos.at("full", default: none)
  let logo-mark = logos.at("mark", default: none)
  let is-teacher = edition != none

  worksheet-colors.update(colors)
  let font = with-cjk(font)
  let heading-family = with-cjk(heading-family)
  worksheet-heading-font.update(heading-family)

  set document(title: title)
  set text(lang: lang, region: region, size: fontsize, fill: ink)
  set text(font: font) if font != none

  // --- Poster layout ------------------------------------------------------
  if layout == "poster" {
    let dark = poster-theme == "dark"
    poster-dark.update(dark)
    let k = brand-colors(colors)
    set page(
      margin: (x: 18mm, top: 18mm, bottom: 48mm),
      fill: if dark { k.navy } else { white },
      background: poster-waves(k),
      header: none,
      footer: context {
        set text(size: 10pt, fill: white)
        grid(columns: (auto, 1fr), column-gutter: 8pt, align: horizon,
          if logo-mark != none { image(root-path(logo-mark.path), height: 18pt) },
          [#if school != none [#school] #if doc-type != none [ · #doc-type]],
        )
      },
      footer-descent: 22mm,
    )
    set text(fill: if dark { white } else { ink }, size: 17pt)
    show heading: set text(font: heading-family) if heading-family != none
    show heading: set text(fill: if dark { white } else { navy })
    if title != none and poster-title {
      block(below: 8pt)[
        #set text(font: heading-family) if heading-family != none
        #text(size: 64pt, weight: 700, fill: if dark { white } else { navy })[#title]
      ]
      if subtitle != none { text(size: 28pt, fill: if dark { k.orange } else { navy.lighten(20%) })[#subtitle] }
      v(6pt)
      line(length: 100%, stroke: 4pt + if dark { k.orange } else { k.blue })
      v(10pt)
    }
    if poster-center { block(height: 100%, width: 100%, align(horizon, doc)) } else { doc }
  } else {
  // --- Worksheet layout ---------------------------------------------------
  set par(justify: false, leading: 0.72em, spacing: 1.05em)
  set enum(spacing: 1.15em, indent: 0.2em, body-indent: 0.6em)

  // Teacher pages get an orange tab in the corner so they're easy to spot in a stack.
  let teacher-tab = if is-teacher {
    place(top + right, dx: 0pt, dy: 0pt,
      block(fill: orange, inset: (x: 14pt, y: 7pt), radius: (bottom-left: 8pt))[
        #set text(font: heading-family, size: 8pt, weight: 700, fill: navy, tracking: 0.1em)
        #upper(edition)
      ])
  }

  set page(
    margin: (x: 0.75in, top: 0.95in, bottom: 0.85in),
    background: teacher-tab,
    header: context {
      if counter(page).get().first() > 1 {
        set text(size: 8.5pt, fill: navy.lighten(25%))
        grid(columns: (auto, 1fr), column-gutter: 8pt, align: horizon,
          if logo-mark != none { image(root-path(logo-mark.path), height: 16pt) },
          [#title],
        )
        v(-4pt)
        line(length: 100%, stroke: 0.5pt + navy.lighten(70%))
      }
    },
    footer: context {
      set text(size: 8.5pt, fill: navy.lighten(30%))
      line(length: 100%, stroke: 1.5pt + blue)
      v(-2pt)
      grid(columns: (1fr, auto),
        [#if school != none [#school] #if doc-type != none [ · #doc-type]],
        [Page #counter(page).display() of #counter(page).final().first()],
      )
    },
  )

  // Section headings: navy text on a soft sky band with a blue edge.
  show heading: set text(font: heading-family) if heading-family != none
  show heading.where(level: 1): it => block(
    width: 100%,
    sticky: true,          // never leave a heading alone at the bottom of a page
    above: 1.6em,
    below: 0.9em,
    fill: sky,
    stroke: (left: 5pt + blue),
    inset: (left: 12pt, y: 8pt),
    radius: (right: 5pt),
    text(size: 1.25em, weight: 700, fill: navy, it.body),
  )
  show heading.where(level: 2): it => block(above: 1.2em, below: 0.6em, sticky: true,
    text(size: 1.05em, weight: 700, fill: navy, it.body))

  show link: set text(fill: navy)
  show link: underline
  show strong: set text(fill: navy)

  // Type ☐ in a .qmd file to get a drawn checkbox (works in any font).
  show "☐": box(width: 0.85em, height: 0.85em, baseline: 0.1em,
    stroke: 1.2pt + navy, radius: 2pt) + h(0.4em)

  // Tables: navy header row, soft striped rows.
  set table(
    stroke: (x, y) => (bottom: 0.5pt + luma(210)),
    inset: 7pt,
    fill: (x, y) => if y == 0 { navy } else if calc.even(y) { sky } else { none },
  )
  show table.cell.where(y: 0): set text(fill: white, weight: 700)

  // --- Page 1 title area: logo and title banner on one line ------------
  v(-0.3in)              // page 1 has no running header, so use some of its space
  grid(columns: if logo-full != none { (auto, 1fr) } else { (1fr,) }, column-gutter: 14pt, align: horizon,
    ..if logo-full != none { (image(root-path(logo-full.path), height: 0.8in, alt: logo-full.at("alt", default: none)),) },
    block(width: 100%, fill: navy, radius: 6pt, inset: (left: 18pt, right: 64pt, y: 14pt), clip: true)[
      #place(right + horizon, dx: 104pt,
        circle(radius: 46pt, fill: none, stroke: 10pt + turquoise.transparentize(35%)))
      #set text(font: heading-family, fill: white)
      #text(size: 20pt, weight: 700)[#title]
      #if subtitle != none { linebreak(); text(size: 11pt, fill: orange)[#subtitle] }
      #v(-4pt)
      #line(length: 2.2in, stroke: 2.5pt + orange)
    ],
  )

  if name-box {
    v(0.1in)
    let field(label, width) = box(width: width)[
      #text(size: 8pt, weight: 700, fill: navy, tracking: 0.12em)[#upper(label)]
      #v(-6pt)
      #line(length: 100%, stroke: 0.7pt + navy.lighten(40%))
    ]
    block(width: 100%, inset: (x: 2pt, top: 14pt, bottom: 4pt),
      grid(columns: (3fr, 1fr, 1.4fr), column-gutter: 18pt,
        field("Name", 100%), field("Period", 100%), field("Date", 100%)))
  }
  v(0.05in)

  doc
  }
}

// Show callouts plainly (no "Note 1:" numbering that Quarto adds by default).
#show figure: it => {
  if type(it.kind) == str and it.kind.starts-with("quarto-callout-") { it.body } else { it }
}
