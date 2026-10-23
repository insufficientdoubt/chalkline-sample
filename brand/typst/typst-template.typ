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


// ---- Playful kit (layout: playful): for younger students ---------------------------------------
// Line-art doodles to color in, star number badges and roomy work boxes. Use them in a .qmd file:
//   ```{=typst}
//   #doodle("robot", width: 1.2in)     robot, pencil, star, gear, sun, cloud, sparkle
//   #star-num(3)                       a star with a number in it
//   #work-box(height: 1.4in)[Draw it!] a dashed box with room to work
//   ```
// The doodles are simple outlines drawn for Chalkline (no outside artwork), white inside so they
// can be colored. Fonts: Patrick Hand (text) and Fredoka (titles, numbers), in brand/fonts/print/.
#let playful-hand = ("Patrick Hand", "Noto Sans SC")
#let playful-round = ("Fredoka", "Noto Sans SC")
#let doodle-svg = (
  robot: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 120 150\" fill=\"#fff\" stroke=\"#1F2933\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"52\" y=\"78\" width=\"16\" height=\"12\" rx=\"3\"/><line x1=\"60\" y1=\"14\" x2=\"60\" y2=\"28\"/><circle cx=\"60\" cy=\"10\" r=\"6\"/><rect x=\"10\" y=\"42\" width=\"12\" height=\"22\" rx=\"5\"/><rect x=\"98\" y=\"42\" width=\"12\" height=\"22\" rx=\"5\"/><rect x=\"20\" y=\"28\" width=\"80\" height=\"54\" rx=\"16\"/><circle cx=\"44\" cy=\"52\" r=\"10\"/><circle cx=\"76\" cy=\"52\" r=\"10\"/><circle cx=\"46\" cy=\"54\" r=\"3.5\" fill=\"#1F2933\"/><circle cx=\"78\" cy=\"54\" r=\"3.5\" fill=\"#1F2933\"/><path d=\"M48 68 Q60 77 72 68\" fill=\"none\"/><path d=\"M28 98 Q8 104 12 122\" fill=\"none\"/><circle cx=\"12\" cy=\"127\" r=\"6\"/><path d=\"M92 98 Q112 104 108 122\" fill=\"none\"/><circle cx=\"108\" cy=\"127\" r=\"6\"/><rect x=\"26\" y=\"88\" width=\"68\" height=\"46\" rx=\"12\"/><path d=\"M60 106 C55 98 45 101 48 108 L60 118 L72 108 C75 101 65 98 60 106 Z\"/><rect x=\"34\" y=\"134\" width=\"20\" height=\"11\" rx=\"4\"/><rect x=\"66\" y=\"134\" width=\"20\" height=\"11\" rx=\"4\"/></svg>",
  pencil: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 150 44\" fill=\"#fff\" stroke=\"#1F2933\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"24,8 24,36 4,22\"/><polygon points=\"4,22 11,18 11,26\" fill=\"#1F2933\"/><rect x=\"24\" y=\"8\" width=\"92\" height=\"28\"/><line x1=\"24\" y1=\"17\" x2=\"116\" y2=\"17\"/><line x1=\"24\" y1=\"27\" x2=\"116\" y2=\"27\"/><rect x=\"116\" y=\"8\" width=\"10\" height=\"28\"/><rect x=\"126\" y=\"8\" width=\"20\" height=\"28\" rx=\"6\"/></svg>",
  star: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"#fff\" stroke=\"#1F2933\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"50.0,7.0 62.3,36.0 93.7,38.8 70.0,59.5 77.0,90.2 50.0,74.0 23.0,90.2 30.0,59.5 6.3,38.8 37.7,36.0\"/><path d=\"M38 56 Q50 66 62 56\" fill=\"none\"/><circle cx=\"40\" cy=\"44\" r=\"3\" fill=\"#1F2933\"/><circle cx=\"60\" cy=\"44\" r=\"3\" fill=\"#1F2933\"/></svg>",
  gear: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"#fff\" stroke=\"#1F2933\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M50.0,14.0 L59.0,4.9 L67.6,7.5 L70.0,20.1 L75.5,24.5 L88.2,24.4 L92.5,32.4 L85.3,43.0 L86.0,50.0 L95.1,59.0 L92.5,67.6 L79.9,70.0 L75.5,75.5 L75.6,88.2 L67.6,92.5 L57.0,85.3 L50.0,86.0 L41.0,95.1 L32.4,92.5 L30.0,79.9 L24.5,75.5 L11.8,75.6 L7.5,67.6 L14.7,57.0 L14.0,50.0 L4.9,41.0 L7.5,32.4 L20.1,30.0 L24.5,24.5 L24.4,11.8 L32.4,7.5 L43.0,14.7 Z\"/><circle cx=\"50\" cy=\"50\" r=\"14\"/></svg>",
  sun: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"#fff\" stroke=\"#1F2933\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"80.0\" y1=\"50.0\" x2=\"94.0\" y2=\"50.0\"/><line x1=\"71.2\" y1=\"71.2\" x2=\"81.1\" y2=\"81.1\"/><line x1=\"50.0\" y1=\"80.0\" x2=\"50.0\" y2=\"94.0\"/><line x1=\"28.8\" y1=\"71.2\" x2=\"18.9\" y2=\"81.1\"/><line x1=\"20.0\" y1=\"50.0\" x2=\"6.0\" y2=\"50.0\"/><line x1=\"28.8\" y1=\"28.8\" x2=\"18.9\" y2=\"18.9\"/><line x1=\"50.0\" y1=\"20.0\" x2=\"50.0\" y2=\"6.0\"/><line x1=\"71.2\" y1=\"28.8\" x2=\"81.1\" y2=\"18.9\"/><circle cx=\"50\" cy=\"50\" r=\"22\"/><circle cx=\"42\" cy=\"46\" r=\"3\" fill=\"#1F2933\"/><circle cx=\"58\" cy=\"46\" r=\"3\" fill=\"#1F2933\"/><path d=\"M40 56 Q50 64 60 56\" fill=\"none\"/></svg>",
  cloud: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 120 80\" fill=\"#fff\" stroke=\"#1F2933\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M28 68 A18 18 0 0 1 30 32 A26 26 0 0 1 78 22 A20 20 0 0 1 100 46 A16 16 0 0 1 96 68 Z\"/></svg>",
  sparkle: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 60 60\" fill=\"#fff\" stroke=\"#1F2933\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M30 4 Q34 26 56 30 Q34 34 30 56 Q26 34 4 30 Q26 26 30 4 Z\"/></svg>",
)
#let doodle(name, width: 1in) = image(bytes(doodle-svg.at(name)), format: "svg", width: width)
#let star-num(n, size: 30pt, fill: rgb("#ffe08a")) = box(width: size, height: size, {
  let pts = range(10).map(i => {
    let r = if calc.even(i) { size / 2 } else { size / 4.4 }
    let a = -90deg + i * 36deg
    (size / 2 + r * calc.cos(a), size / 2 + 1.5pt + r * calc.sin(a))
  })
  place(polygon(fill: fill, stroke: (paint: rgb("#1F2933"), thickness: 1.4pt, join: "round"), ..pts))
  place(center + horizon, dy: 1.5pt, text(font: playful-round, size: size * 0.4, weight: 700, fill: rgb("#1F2933"))[#n])
})
#let work-box(height: 1.2in, body) = block(width: 100%, height: height, inset: 10pt, radius: 14pt,
  stroke: (paint: rgb("#8a97a8"), thickness: 1.5pt, dash: "dashed"), body)

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
  layout: none,           // "poster" for posters; "playful" for younger students; anything else is a worksheet
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

  // --- Playful layout (layout: playful) -------------------------------------
  // For younger students: handwriting fonts, a hand-drawn double frame, a dashed "cloud" title,
  // a big Name line, and room to work. Teacher copies still get the orange corner tab.
  } else if layout == "playful" {
    let k = brand-colors(colors)
    let tab = if is-teacher {
      place(top + right, dx: -0.42in, dy: 0.42in,
        block(fill: orange, inset: (x: 12pt, y: 6pt), radius: (bottom-left: 10pt, top-right: 14pt))[
          #set text(font: playful-round, size: 8pt, weight: 700, fill: navy)
          #upper(edition)
        ])
    }
    let frame = {
      place(top + left, dx: 0.32in, dy: 0.32in,
        rect(width: 100% - 0.64in, height: 100% - 0.64in, radius: 22pt, stroke: 2.4pt + ink))
      place(top + left, dx: 0.42in, dy: 0.42in,
        rect(width: 100% - 0.84in, height: 100% - 0.84in, radius: 16pt,
          stroke: (paint: k.blue.lighten(30%), thickness: 1.2pt, dash: "dashed")))
      tab
    }
    set page(
      margin: (x: 0.7in, top: 0.7in, bottom: 0.95in),
      background: frame,
      header: none,
      footer: context {
        set text(font: playful-hand, size: 10pt, fill: navy.lighten(30%))
        align(center)[#if school != none [#school] #if doc-type != none [ · #doc-type] · page #counter(page).display() of #counter(page).final().first()]
      },
      footer-descent: 0.12in,
    )
    set text(font: playful-hand, size: 15pt, fill: ink)
    set par(leading: 0.65em, spacing: 1em)
    show heading: set text(font: playful-round, fill: navy, weight: 700)
    show heading.where(level: 1): it => block(above: 1.1em, below: 0.6em, sticky: true)[
      #box(baseline: 20%, doodle("sparkle", width: 16pt)) #h(4pt) #text(size: 1.3em, it.body)]
    show heading.where(level: 2): it => block(above: 0.9em, below: 0.5em, sticky: true, text(size: 1.1em, it.body))
    show strong: set text(fill: navy)

    // the title, in a dashed cloud-shaped box, and the Name line
    block(width: 100%, fill: k.sky, radius: 30pt, inset: (x: 20pt, y: 12pt),
      stroke: (paint: navy, thickness: 2pt, dash: "dashed"))[
      #set text(font: playful-round)
      #text(size: 26pt, weight: 700, fill: navy)[#title]
      #if subtitle != none { linebreak(); text(size: 13pt, fill: navy.lighten(15%))[#subtitle] }
    ]
    if name-box {
      v(4pt)
      grid(columns: (auto, 1fr, auto, 0.55fr), column-gutter: 8pt, align: bottom,
        text(font: playful-round, size: 14pt, fill: navy)[Name:], line(length: 100%, stroke: 1.3pt + ink),
        text(font: playful-round, size: 14pt, fill: navy)[Date:], line(length: 100%, stroke: 1.3pt + ink))
    }
    v(6pt)
    doc
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
