--[[
Slide games, shared by shortcodes.lua (games from the vocab list) and filter.lua (games you
write out yourself in a ::: div). Each game becomes an empty <div> with its settings as JSON;
games.js draws it in the browser. Slides only: in other formats you get one line saying so.
]]

local M = {}

local function html_escape(s)
  return (s:gsub("&", "&amp;"):gsub("<", "&lt;"):gsub(">", "&gt;"):gsub('"', "&quot;"))
end

-- Chalkline's design values (ui/ui.css), shared by the games and the toolbox (filter.lua).
function M.ui()
  quarto.doc.add_html_dependency({ name = "chalkline-ui", version = "1.0.0", stylesheets = { "ui/ui.css" } })
end

function M.div(kind, config)
  M.ui()
  quarto.doc.add_html_dependency({
    name = "classroom-games",
    version = "1.0.0",
    scripts = {   -- paths are from _extensions/classroom/; timeline.js and activities.js add their games to games.js
      { path = "games/games.js", afterBody = true },
      { path = "games/timeline.js", afterBody = true },
      { path = "games/activities.js", afterBody = true },   -- uses timeline.js's drag helper
    },
    stylesheets = { "games/games.css", "games/timeline.css", "games/activities.css" },
    -- Bingo makes its printable cards in the browser with pdf-lib (the PDF viewer's copy; MIT).
    resources = { "../pdf-viewer/pdf-lib.esm.min.js" },
  })
  return pandoc.RawBlock("html", '<div class="cg-game cg-' .. kind .. '" data-game="' .. kind ..
    '" data-config="' .. html_escape(quarto.json.encode(config)) .. '" data-prevent-swipe></div>')
end

-- Outside slides (web page, PDF, Word): a line saying the game is on the slides.
function M.placeholder(name)
  return pandoc.Para({ pandoc.Emph({ pandoc.Str(name .. " (a game on the slides)") }) })
end

-- "Question | Answer" -> "Question", "Answer" (the first | splits them).
function M.split(text)
  local q, a = text:match("^(.-)%s*|%s*(.-)%s*$")
  if not q then return text, "" end
  return q, a
end

return M
