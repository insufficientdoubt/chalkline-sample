--[[
Classroom filter. Lets content stay plain: authors write semantic markers and
this file turns them into the right thing for each output format.

Slides (reveal.js):
  - adds the corner clock to every deck (turn off with `clock: false`)
  - adds the classroom toolbox to every deck (turn off with `classroom-tools: false`):
    scoreboard, voice level, traffic light, noise meter, QR code, stopwatch and dice,
    in panels that float above the slides (see toolbox/toolbox.js). Optional, in _quarto.yml:
      classroom-tools:
        qr-site: "https://example.github.io/my-course/"   # the QR code points here, not at localhost
  - loads the poll code when a slide has  ::: {.poll ...}  or  ::: {.poll-summary}
  - turns  ::: {.jeopardy}  and  ::: {.trivia}  into slide games (see below and games/games.js)

PDF (Typst): a div with one of these classes becomes a call to a layout
function in brand/typst/typst-template.typ, with the div's attributes passed
as named arguments:
  ::: {.keep}                          keep everything inside on one page
  ::: {.write-in}                      taller table rows for handwriting
  ::: {.value word="Respect" zh="尊重" pinyin="zūnzhòng"}   poster value row
  ::: {.big-quote zh="..."}            poster quote
  ::: {.steps title="..."}             numbered list drawn as a row of cards

Web pages: the same classes are styled in brand/styles.scss; for .value this
file also adds the heading (big first letter, Chinese, pinyin).
]]

local TYPST_FUNCTIONS = {
  ["keep"] = "keep",
  ["write-in"] = "write-in",
  ["value"] = "poster-value",
  ["big-quote"] = "poster-quote",
  ["steps"] = "poster-steps",
}

local included = {}
local function include_once(file)
  if included[file] then return end
  included[file] = true
  quarto.doc.include_file("after-body", quarto.utils.resolve_path(file))
end

local function typst_string(s)
  return '"' .. s:gsub("\\", "\\\\"):gsub('"', '\\"') .. '"'
end

local function html_escape(s)
  return (s:gsub("&", "&amp;"):gsub("<", "&lt;"):gsub(">", "&gt;"))
end

local function to_typst(el, fn)
  local args = {}
  for k, v in pairs(el.attributes) do
    table.insert(args, k .. ": " .. typst_string(v))
  end
  table.sort(args)
  local blocks = pandoc.List({ pandoc.RawBlock("typst", "#" .. fn .. "(" .. table.concat(args, ", ") .. ")[") })
  blocks:extend(el.content)
  blocks:insert(pandoc.RawBlock("typst", "]"))
  return blocks
end

local function value_heading_html(el)
  local word = el.attributes["word"] or ""
  local first, rest = word:sub(1, 1), word:sub(2)
  local zh = el.attributes["zh"] or ""
  local pinyin = el.attributes["pinyin"] or ""
  return pandoc.RawBlock("html",
    '<div class="value-head"><span class="value-word"><span class="value-letter">' .. html_escape(first) ..
    '</span>' .. html_escape(rest) .. '</span> <span class="value-zh">' .. html_escape(zh) ..
    '</span> <span class="value-pinyin">' .. html_escape(pinyin) .. '</span></div>')
end

-- Slide games you write yourself (the vocab versions are shortcodes, in shortcodes.lua):
--   ::: {.jeopardy}                       ::: {.trivia seconds="10" title="Greece review"}
--   - **Places**                          - Which city had the first democracy? | Athens
--     - Land with sea on three sides | peninsula     - ...
--     - ... (each row is worth more)      :::
--   - **People**
--     - ...
--   :::
-- A clue or question, a |, then its answer. jeopardy: points="100,200,300,400" sets the values.
local games = dofile(quarto.utils.resolve_path("games/games.lua"))

local function list_items(blocks)
  for _, b in ipairs(blocks) do
    if b.t == "BulletList" or b.t == "OrderedList" then return b.content end
  end
  return {}
end

local function clue(item)
  local text = {}
  for _, b in ipairs(item) do
    if b.t == "Plain" or b.t == "Para" then table.insert(text, pandoc.utils.stringify(b)) end
  end
  local q, a = games.split(table.concat(text, " "))
  if a == "" then quarto.log.warning('game: no answer after "|" in: ' .. q) end
  return { q = q, a = a }
end

local function game_from_div(el)
  if el.classes:includes("jeopardy") then
    local categories = {}
    for _, item in ipairs(list_items(el.content)) do
      local name = item[1] and pandoc.utils.stringify(item[1]) or ""
      local clues = {}
      for _, c in ipairs(list_items(item)) do table.insert(clues, clue(c)) end
      table.insert(categories, { name = name, clues = clues })
    end
    local points = {}
    for n in (el.attributes["points"] or ""):gmatch("%d+") do table.insert(points, tonumber(n)) end
    return games.div("jeopardy", { categories = categories, points = points, random = false })
  end
  local questions = {}
  for _, item in ipairs(list_items(el.content)) do table.insert(questions, clue(item)) end
  return games.div("trivia", { questions = questions, random = false,
    seconds = tonumber(el.attributes["seconds"] or "10") or 10, title = el.attributes["title"] or "Quick-fire!" })
end

local function Div(el)
  if el.classes:includes("jeopardy") or el.classes:includes("trivia") then
    if quarto.doc.is_format("revealjs") then return game_from_div(el) end
    return games.placeholder(el.classes:includes("jeopardy") and "Jeopardy" or "Quick-fire questions")
  end
  if quarto.doc.is_format("typst") then
    for cls, fn in pairs(TYPST_FUNCTIONS) do
      if el.classes:includes(cls) then return to_typst(el, fn) end
    end
    return nil
  end
  if quarto.doc.is_format("html") then
    if el.classes:includes("poll") or el.classes:includes("poll-summary") then
      if quarto.doc.is_format("revealjs") then include_once("poll.html") end
    end
    if el.classes:includes("value") then
      el.content:insert(1, value_heading_html(el))
      return el
    end
  end
  return nil
end

local function Meta(meta)
  local clock = meta.clock
  local off = clock ~= nil and pandoc.utils.stringify(clock) == "false"
  if quarto.doc.is_format("revealjs") and not off then include_once("clock.html") end
  -- Slides: the classroom toolbox (toolbox/toolbox.js; turn off with `classroom-tools: false`).
  local tools = meta["classroom-tools"]
  local tools_off = tools ~= nil and pandoc.utils.type(tools) ~= "table" and pandoc.utils.stringify(tools) == "false"
  if quarto.doc.is_format("revealjs") and not tools_off then
    local site = pandoc.utils.type(tools) == "table" and tools["qr-site"] and pandoc.utils.stringify(tools["qr-site"]) or ""
    quarto.doc.add_html_dependency({
      name = "classroom-tools",
      version = "1.0.0",
      scripts = { { path = "toolbox/toolbox.js", afterBody = true } },
      stylesheets = { "toolbox/toolbox.css" },
      resources = { "toolbox/qrcode.js" },
      meta = site ~= "" and { ["chalkline-qr-site"] = site } or nil,
    })
  end
  -- Web pages: links to slideshows open in a new tab (slides-new-tab: false turns it off).
  local nt = meta["slides-new-tab"]
  local nt_off = nt ~= nil and pandoc.utils.stringify(nt) == "false"
  if quarto.doc.is_format("html") and not quarto.doc.is_format("revealjs") and not nt_off then
    include_once("new-tab.html")
  end
  return nil
end

return {
  { Meta = Meta },
  { Div = Div },
}
