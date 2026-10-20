---
name: DevCodex
description: Learn software engineering one collectible concept card at a time.
colors:
  binder-felt: "#121016"
  sleeve: "#1c1823"
  sleeve-raised: "#262030"
  sleeve-edge: "#322b3e"
  ink: "#f5f2f9"
  ink-soft: "#c0b8cf"
  ink-faint: "#938aa5"
  web-ember: "#ff7a3d"
  web-ember-ink: "#2a1003"
  code-violet: "#a387ff"
  code-violet-ink: "#170c3a"
  data-teal: "#1fcfa9"
  data-teal-ink: "#032a21"
  reward-gold: "#ffc94a"
  reward-gold-ink: "#1d1400"
  miss-rose: "#ff6b81"
  miss-rose-ink: "#2a0710"
  level-easy: "#86e06f"
  level-easy-ink: "#0c2405"
  level-medium: "#59b0ff"
  level-medium-ink: "#04203d"
  level-hard: "#ff4b62"
  level-hard-ink: "#2e040c"
  veil-light: "rgb(255 255 255 / 0.24)"
  veil-dark: "rgb(0 0 0 / 0.16)"
  syntax-keyword: "#b9a3ff"
  syntax-string: "#4fdcbc"
  syntax-number: "#ff935f"
  syntax-function: "#ffd36e"
  syntax-property: "#e7def5"
  editor-ground: "#0b0a0e"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, Avenir Next, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 7vw, 3.3rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.04em"
  page-title:
    fontFamily: "Bricolage Grotesque Variable, Avenir Next, system-ui, sans-serif"
    fontSize: "clamp(2rem, 6vw, 2.75rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque Variable, Avenir Next, system-ui, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  subhead:
    fontFamily: "Bricolage Grotesque Variable, Avenir Next, system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Bricolage Grotesque Variable, Avenir Next, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  reading:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 400
    lineHeight: 1.7
  lead:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  ui:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.45
  small:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 700
    lineHeight: 1.3
  caption:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.3
  code:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "0.86rem"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  micro: "3px"
  xs: "6px"
  sm: "8px"
  chip: "10px"
  md: "14px"
  card: "16px"
  tile: "18px"
  block: "22px"
  panel: "24px"
  feature: "28px"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.1rem"
  lg: "2rem"
  xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.data-teal}"
    textColor: "{colors.data-teal-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.pill}"
    height: "3.25rem"
    padding: "0 1.4rem"
  button-reward:
    backgroundColor: "{colors.reward-gold}"
    textColor: "{colors.reward-gold-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.pill}"
    height: "3.25rem"
    padding: "0 1.4rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "3rem"
    padding: "0 1.1rem"
  panel:
    backgroundColor: "{colors.sleeve}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "1.1rem"
  meta-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
  level-tag:
    backgroundColor: "transparent"
    textColor: "{colors.level-easy}"
    typography: "{typography.label}"
  input:
    backgroundColor: "{colors.binder-felt}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "3rem"
    padding: "0 1rem"
  nav-dock:
    backgroundColor: "{colors.sleeve}"
    textColor: "{colors.ink-faint}"
    rounded: "{rounded.block}"
    padding: "0.3rem"
---

# Design System: DevCodex

## Overview

**Creative North Star: "The Binder"**

DevCodex treats every software engineering concept as a collectible trading card. Finishing an article opens a pack, and the trivia deck is your binder. The world comes from card binders and collectible sets: felt-dark sleeves, numbered cards with a level and a rarity, and saturated track colours that fill whole surfaces instead of tinting small accents. That energy belongs to the frame. Inside an article, the reading column stays calm, with a hyperlegible reading face at a real measure, so the binder rewards learning without competing with it.

The app is dark first because people learn in it at night and on phones. Every screen is designed for a 390px phone first and then rearranged for desktop, not just stretched.

**Key Characteristics:**
- A near-black binder-felt ground with three saturated track fields: Web ember, Code violet and Data teal.
- Numbered 5:7 concept cards with a track-colour frame, a per-concept line drawing, level pips and a collector number.
- Gold is the colour of reward: selection, new cards, collected counts, rares.
- Chunky rounded geometry: pills for actions, 16–28px radii for cards and panels.
- One ritual per surface: pack opening, the swipe deck, the auto-playing short.

## Colors

The palette is Committed. Track colours own whole regions (quest panels, short cards, card frames, lab tiles). The neutrals are violet-tinted blacks taken from the felt.

### Primary
- **Web Ember** (#ff7a3d), on **Web Ember Ink** (#2a1003): the How the Web Works track.
- **Code Violet** (#a387ff), on **Code Violet Ink** (#170c3a): the Programming Concepts track.
- **Data Teal** (#1fcfa9), on **Data Teal Ink** (#032a21): the Data Structures track. It is also the "run" and "knew it" action colour.

### Secondary
- **Reward Gold** (#ffc94a): selection, the active nav pill, new-card glow, rare frames, focus rings and hints. Text on gold is #1d1400.
- **Miss Rose** (#ff6b81): wrong answers, failed tests, "again". Never used for decoration.

### Neutral
- **Binder Felt** (#121016): the page ground.
- **Sleeve** (#1c1823) and **Raised Sleeve** (#262030): panels, cards, inputs.
- **Sleeve Edge** (#322b3e): hairlines and resting borders.
- **Ink** (#f5f2f9), **Soft Ink** (#c0b8cf), **Faint Ink** (#938aa5): text in three steps. Faint ink is for metadata only.

### Levels
- **Easy Green** (#86e06f), **Medium Blue** (#59b0ff), **Hard Red** (#ff4b62), each with a dark ink (`--easy`, `--medium`, `--hard`; `--lv`, `--lv-ink` via `.lv-easy`, `.lv-medium`, `.lv-hard`). Difficulty describes the concept (rubric in PRODUCT.md). The colours appear only as a 2px frame around a whole lesson (lesson card, article cover) and as the boxless Level Tag.

### Named Rules
**The Level Frames The Lesson Rule.** A level colour is a full border plus its tag, never a fill or a stripe.

**The No Pills For Facts Rule.** Information never sits in an outlined or filled pill. Reading time, card counts, status, difficulty, pattern and level are set as boxless `.meta-row` text with icons, spaced apart (no separator dots, so a wrapped line never starts with a mark). Pills are for actions (buttons) and the navigation's active state only.

**The Track Owns The Field Rule.** A track colour fills a region (`--t` on the region, `--t-ink` for everything on top of it), or it does not appear. Never use it as a thin stripe or a tint on grey.

**The Gold Means Earned Rule.** Gold marks what the learner selected, collected or unlocked. Do not use it as a generic accent.

## Typography

**Display Font:** Bricolage Grotesque (fallback Avenir Next, system-ui)
**Body Font:** Atkinson Hyperlegible Next (fallback system-ui)
**Code Font:** JetBrains Mono (code, values on the wire and keyboard keys only)

**Character:** Bricolage brings the trading-card swagger: tight, heavy and slightly quirky at display sizes. Atkinson Hyperlegible keeps long reading and small labels clear on a phone.

### Hierarchy
- **Display** (800, clamp(2.1rem, 7vw, 3.3rem), 1.0, -0.04em): article and quest titles.
- **Page title** (800, clamp(2rem, 6vw, 2.75rem)): top-level screen titles (Learn, Trivia, Practice, You).
- **Headline** (800, 1.6rem, 1.15): section headings inside articles and screens.
- **Subhead** (700, 1.35rem): short captions, questions and claims inside shorts.
- **Title** (800, 1.2rem, 1.2): lab headings, card names and buttons.
- **Lead** (400, 1.2rem, 1.5): article deks.
- **Reading** (400, 1.12rem, 1.7): article prose, max about 42rem.
- **Body / UI** (1.0625rem / 1.05rem): interface text and controls.
- **Small** (0.95rem), **Label** (700, 0.88rem), **Caption** (700, 0.8rem): secondary text, chips, metadata, dock labels.
- **Code** (0.86rem): code blocks, test results, wire messages.
- SVG figure labels are sized in the figure's own units (14.5–17 units) and scale with the figure.

### Named Rules
**The Mono Is For Machines Rule.** Monospace sets code, wire messages, hash arithmetic and keys. It never sets prose or headings.

## Layout

- Mobile first. Content is padded 1rem and respects safe areas.
- A floating dock sits at the bottom of the phone layout; below 900px, main content keeps 7rem of bottom padding so the dock never covers it.
- At 900px and up, the dock becomes header pills and pages switch to two-column arrangements: quest and tracks beside the binder, the brief beside the practice workbench, the deck beside sealed cards.
- Articles use the full app width (78rem). On phones and tablets they are one column with a folding "On this page" list. From 900px the cover splits into title and dek beside a facts box, and the glossary goes two-up. From 1100px a sticky "On this page" rail (15rem) sits beside the main column and marks the section being read.
- Inside the article column, reading text (paragraphs, lists, headings) keeps a measure of 52rem at 1.18rem, about 80 characters. Tables, code, labs, notes, quizzes and diagrams take the full column. `.prose` is a size container named `prose`, so labs rearrange with `@container prose (min-width: 46rem)`: StepFlow puts its diagram beside the explanation, and the quiz becomes a two-column grid of cards.
- Spacing rhythm: 0.5 / 0.75 / 1.1 / 2 / 3rem, with more space above a heading than below it.

## Elevation & Depth

Depth comes from cards and sleeves, not from glass. Cards carry one soft drop shadow (`0 18px 36px -18px rgb(0 0 0 / 0.85)`). The floating dock carries `0 16px 40px -12px rgb(0 0 0 / 0.7)`. New cards add a gold ring and glow. Everything else is flat on its sleeve.

## Shapes

Everything is rounded, on one scale:
- 3, 6 and 8px for micro details (brand mark cards, kbd, bucket keys)
- 10px for card frames and segmented-control insides
- 14px for code blocks, examples and result rows
- 16px for cards
- 18px for answer buttons and list rows
- 22px for notes and the dock
- 24px for labs and panels
- 28px for track-coloured feature panels (the quest, shorts)
- 999px pills for every action and chip

## Components

### Buttons
- **Primary run / continue:** a track or teal pill with dark ink, Bricolage 800, at least 3.25rem tall. It lifts 2px on hover and shrinks to 0.98 on press.
- **Reward:** a gold pill for collecting actions ("Finish and open pack").
- **Ghost:** a 2px sleeve-edge outline pill for secondary actions. The outline turns gold or track-coloured on hover.
- **Round:** 3.25rem circles for back/forward steppers and the trivia decide buttons.

### Concept Card (signature)
- A 5:7 card with a 7px frame in its track colour around a sleeve-coloured face.
- The face holds:
  - the term in Bricolage, with level pips
  - a track-coloured art window with a per-concept line drawing
  - the question
  - the collector number (#001/032) and the track
- New cards glow gold until first reviewed, and level-3 cards get a gold inner frame. Core packs hold level 1–2 cards; Going deeper bonus cards are level 2 and Under the hood bonus cards are level 3, so every rare card is earned in a lesson's deepest layer. A locked bonus card's hint names its layer ("Finish Under the hood in …").
- Faces: front, back (gold frame, diagonal pattern, fanned-card mark) and locked (dashed, lock, unlock hint).
- On desktop a pointer-tracked foil sheen appears on hover only.

### Labs (teaching components)
StepFlow, CodeTrace, EventLoopSim, HashMapLab, TwoPointerGame and Choice share one shell:
- a sleeve panel (24px radius) with a Title heading and a step count
- the interactive figure
- an explanation in the reading face
- a dark wire or code block
- a control row with a round back button and a track-coloured "Next" pill

Lit elements fill with the track colour, and message chips are ink pills with dark mono text.

Hands-on games use the same sleeve panel, with a heading and a quiet counter, the interactive row, a message box (rose ring for a wrong move, gold for a win) and outlined pill buttons:
- **TwoPointerGame**
- **BinarySearchLab:** the reader keeps the left or right half; "lo", "mid" and "hi" tags, ruled-out numbers fade
- **LinkedListLab:** nodes as value and next-slot boxes with arrows to `null`; walks light each node in turn
- **TreeLab:** an SVG search tree laid out by in-order position and depth; traversals light nodes in order and build a mono visit line

### Article blocks
- **Level Tag:** boxless: 1–3 pips and "Easy", "Medium" or "Hard" in the level colour (in the surface's ink when it sits on a track-coloured panel). It appears on lesson cards, the article cover, the home quest and "Up next".
- **Layer** (`teach/Layer.svelte`): Going deeper and Under the hood. A layer starts at a full-width 2px rule (a 4px double rule for Under the hood), never a box: gold depth pips, the layer name as an h2-sized title, a one-line summary, "n sections · about n min" and the bonus card count in gold, then an outlined "Open …"/"Close …" button whose chevron turns. Closed, the body is `hidden`. Open, it reads like the rest of the article and ends at a hairline with "Finish Going deeper": the checklist (sections read, checks passed) and a gold "Collect the bonus card" button, locked until the Core pack is open. Collected cards deal in below.
- **Core pack** (`teach/CorePack.svelte`): marks where the Core ends. The article's "Earn your pack" checklist renders there, so the pack sits between the Core and the first layer rather than at the very bottom.
- **Quick check:** one question at a time with a progress bar of segments (teal right, rose wrong). Picking an answer locks it and shows the explanation as plain text, then "Next question"; the last step shows the score and "Try again".
- **Code sample** (`teach/Code.svelte`): an editor-ground block (18px) with a title bar and an optional caption. Highlighting comes from `teach/highlight.ts` with the editor palette (`.tk-*` in app.css). Code text never uses font ligatures, so learners see the characters they will type.
- **Notes:** `tip` (gold), `warn` (miss rose, for real pitfalls), `plain` (sleeve, for everyday comparisons and precision asides).
- **Tables:** under 560px each row becomes a labelled card (labels are added at build time by `src/lib/content/article-markup.ts`).
- **Diagrams** (`teach/Diagram.svelte`): sysketch SVGs in the midnight theme on a matching #070b16 frame, with a caption and an "Open full size" link. On phones a wide diagram scrolls sideways at a minimum of 40rem so its labels stay legible.

### Learn page
- **Built to scale:** a grid of topic cards (as many columns as fit, each at least 22rem), each linking to that topic's own page. Above it sits one "Continue …" line for the most recently read lesson. Old `/learn#topic-<id>` links redirect to the topic page.
- **Topic card:** a quiet landscape binder card linking to its topic page: track art, title, blurb, one segment per lesson (filled in its level colour once finished, striped once started), "4 lessons · about 61 min", finished count, and "Open topic", "Continue" or "Review topic". A topic with a lesson under way gets a muted frame in its colour. Its accessible name is just the title and lesson count.
- **Search:** lesson titles and summaries, section headings, key terms inside sections (indexed at build time) and concept cards, in one flat list under the search box.
- **Level without a search:** lists every lesson at that level across topics, each labelled with its topic, and the topic cards show how many lessons each has at that level.

### Topic page (`/learn/topic/<id>`)
- **Header:** a panel framed in a muted mix of the topic colour, with large art (hidden on phones), title, blurb and lesson counts per level; then the numbers (lessons finished, cards collected, problems solved, minutes left); then a segment per lesson; then the one next step (resume the most recently read lesson, or the next unfinished one) with a track-coloured button. On phones the next step comes right after the title.
- **The path:** the topic's lessons as lesson cards, easiest first.
- **Concept cards:** the topic's cards in a binder sleeve (six, then "Show all"), collected faces or locked hints, and a link to review them in Trivia.
- **Side column:** the topic's achievement medal with progress, related practice problems with difficulty and solved state, and how many shorts come from the topic.
- **Adding a topic:** add it to `tracks` in the catalog and to the `TrackId` type, give it a `.t-<id>` colour pair in app.css and line art in `trackArt` (cardArt.ts), and an achievement title in achievements.ts. Without its own colour, a topic falls back to gold.

### TL;DR (`/learn/tldr`)
- **Paths · TL;DR switch** (`app/LearnSwitch.svelte`): two display-font text tabs under the Learn header, the current one underlined in gold, with "n unread" in gold beside TL;DR. TL;DR is a view of Learn, not a nav tab.
- **List:** a kind filter as text tabs (gold underline). The newest read leads between two 2px gold rules: kind, date and minutes, a large title, the hook, the three TL;DR bullets (short gold dashes, under a gold mono "TL;DR" label) and a gold "Read it in n minutes" button. The rest is a plain list, in two columns from 900px: kind in gold with its icon, date, minutes, "Read" in teal, then title and hook. Read titles dim to soft ink. "Follow by RSS" links the feed (`/learn/tldr/feed.xml`).
- **Kind icons:** spark (What's new), info (Small concept), flame (Incident story), search (How it works), flip (Debate). Kinds have no colours of their own; TL;DR's accent is gold.
- **Reading page:** a back link, the meta row (with "Facts checked …" for time-sensitive pieces), a large title, the hook, then the TL;DR between gold rules ending "That's the short version. The rest takes about n minutes." The body is a 46rem prose column. At the end, a teal "Read" line and, when a full lesson exists, a "Go deeper" lesson link framed in its level colour. From 1100px a sticky "More TL;DR" column lists three more reads, unread first.
- **Read rule:** a brief counts as read once its end has been in view at least 40 seconds after opening.
- **Search:** Learn search also finds TL;DR reads by title, hook, bullets, section headings and key terms, labelled "TL;DR" in gold. They are left out when a difficulty is picked.

### Article reading aids
- **Cover:** a back link to the article's topic page (the topic name in the tags links there too), "Builds on" links (plus a gold "New to this? Start with …" if the prerequisite isn't finished), and "Earn the pack:" with the three steps, ticked as they're met. On phones the summary clamps to three lines with More, which also reveals what the lesson assumes.
- **While reading:** a 3px gold progress line under the header. Below 1100px, a line under it shows the current section and "Pack n/3"; tapping it opens a bottom sheet with the contents and the pack steps. From 1100px, the rail shows "Your pack" (live) above "On this page".
- **Resume:** reopening a half-read lesson offers "You stopped at … Continue there", between hairlines.
- **Checkpoints:** one-question checks set between hairlines with a gold "Checkpoint" flag. Core checkpoints count toward the pack, layer checkpoints toward that layer (answering is enough).
- **Layers in the rail:** "On this page" groups sections as Core, then "Open your pack", then each layer (dimmed while closed, ticked once finished). Choosing a section in a closed layer, or following a link or URL hash to one, opens the layer first. The cover lists the layers with their minutes; selecting one opens it.
- **Depth preference:** the learner's choice (Core only, Going deeper, Under the hood) decides which layers start open.
- **Glossary terms:** the first use of each "Words you will meet" entry is dotted-underlined in the track colour and shows its definition on hover, focus or tap.
- **Code samples:** Copy in the title bar. When lines overflow, the right edge fades and a Wrap toggle appears.

### Binder (the dashboard)
The dashboard leads with one next step and keeps everything else quieter. It renders once stored progress and the device clock are known, and fades in together so nothing jumps.
- **Greeting:** "Welcome to DevCodex" on a first visit, "Welcome back" after learning today, otherwise good morning, afternoon or evening, or "Burning the midnight oil" late at night. The optional name is set in gold. Below it is one line about the streak or open lessons. "Add your name" appears only until a name is set; changing it lives on the You page.
- **Lesson map (desktop, beside the greeting):** every lesson as a star on a night-sky panel. Tracks run across (Web, Code, Data), and levels run left to right in dashed level-colour columns. Finished stars glow in their track colour and twinkle slowly; started ones draw a read-progress arc; the next step pulses gold; unvisited ones are dashed rings. Lines between a track's lessons light up once both ends are finished. Hover or focus shows a tooltip (title, level, status; it flips below for the top row), and each star links to its lesson. It is hidden on phones to keep the next step near the top, and pulse and twinkle stop under reduced motion.
- **Notices:** dismissible lines between hairlines, never boxes. "Since your last visit you collected … and earned …" shows once per win. The backup reminder appears while progress exists only in an uninstalled browser with no backup in 14 days, and offers Install or Export.
- **New users:** in place of the numbers, "How DevCodex works" (four boxless numbered steps) and "How deep do you want to go?" (Core, Going deeper, Under the hood, the choice underlined in gold).
- **Key numbers:** links (Lessons → Learn, Cards → Trivia, Problems → Practice, Streak → This week, Minutes → You), as one swipeable row on phones.
- **Hero:** the single loud, track-filled surface. It resumes a lesson read in the last three days (where you stopped, percent read, a progress bar) or offers the next unstarted lesson on the path, easiest concepts first.
- **This week:** Monday to Sunday dots (filled ember when learned, ringed for today, dashed for the future), the streak with an evening "learn today to keep it" nudge, and a gold weekly-goal ring with a stepper.
- **TL;DR slot:** under This week, after a 2px gold rule: a gold mono "TL;DR" label, then the newest unread read (kind, date, minutes, title, hook), with "Read it" and "n unread".
- **Also in progress:** other open lessons as hairline rows, with where you stopped, when, a level-colour progress line, Resume, and Remove.
- **Your binder:** one row of clear pockets per track, which also serves as track progress. A finished lesson is a mini card (level frame, pips, art, gold date stamp) and slides in with a gold glow the first time it's seen. Empty pockets show the lesson's name; started ones get a level-colour edge, a progress line and "Resume →"; on hover or focus (and always on touch) the pocket shows its action. A pip legend spells out the difficulties.
- **Card of the day:** one unlocked card, face down until "Reveal the answer", then Knew it / Not yet grades it like Trivia. Below it is a sized invitation: "Review 10 cards · about 4 minutes".
- **Achievements:** earned medals as a compact row (new ones strike in with a "New" tag), then "Within reach": the three locked medals closest to done, with counts. The full gallery is on the You page.

### Pack checklist (end of every article)
"Earn your pack" (placed by `<CorePack />` at the end of the Core) lists three requirements for the Core as plain rows, each with a round tick (teal when done), a status line and a thin gold progress line: read through the lesson (80% of sections read past), spend some time with it (active time, 30% of the estimate, between 1 and 5 minutes), and pass the quick checks (every check finished, 60% or better on multi-question ones). Until all three are done, the gold button is a muted "Pack locked" with a lock icon; then the heading becomes "Your pack is ready". A quick check passed earlier reopens on its best score.

### Navigation
- Phone: a floating dock of five sections. The active item gets a gold pill behind its icon.
- Desktop: the same five sections as header pills, with the active one in gold. A collected-cards chip on the right leads to the progress page.

### Inputs
Pill-shaped fields on binder felt with a 2px sleeve edge, which turns gold or track-coloured on focus. The caret is gold. The code editor (CodeMirror 6) sits on a deeper editor ground (#0b0a0e) with syntax colours lifted from the tracks: violet keywords, teal strings, ember numbers, gold function names.

## Do's and Don'ts

### Do:
- **Do** fill whole regions with a track colour and put its paired ink on top.
- **Do** give every new concept card its own line drawing in `cardArt.ts`.
- **Do** keep article prose in Atkinson Hyperlegible at about 1.12rem, max 42rem wide.
- **Do** honour reduced motion: no flips, no travelling packets, no autoplay.
- **Do** label anything that is a demo or a preview, and show progress only from real activity.

### Don't:
- **Don't** use a track colour as a left stripe, a thin border accent or gradient text.
- **Don't** put an eyebrow or kicker label above a heading.
- **Don't** use static holographic stripes; foil appears only as a hover response.
- **Don't** set prose or headings in monospace.
- **Don't** use glass blur, hard offset shadows or bounce easing. Motion is exponential ease-out.
