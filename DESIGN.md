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
  level-entry: "#86e06f"
  level-entry-ink: "#0c2405"
  level-experienced: "#59b0ff"
  level-experienced-ink: "#04203d"
  level-senior: "#ff4b62"
  level-senior-ink: "#2e040c"
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
  chip:
    backgroundColor: "{colors.sleeve}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.75rem"
  level-tag:
    backgroundColor: "transparent"
    textColor: "{colors.level-entry}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.75rem"
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
- **Entry Green** (#86e06f), **Experienced Blue** (#59b0ff), **Senior Red** (#ff4b62), each with a dark ink (`--lv`, `--lv-ink` via `.lv-*`). They appear only as a 2px frame around a whole lesson (library card, article cover) and as the LevelTag pill with 1–3 pips.

### Named Rules
**The Level Frames The Lesson Rule.** A level colour is a full border plus its tag, never a fill or a stripe.

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
- New cards glow gold until first reviewed, and level-3 cards get a gold inner frame.
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

### Article blocks
- **Level Tag:** a pill outlined in the level colour with 1–3 pips, "Entry-level · Easy". It appears on library cards, the article cover, the home quest and "Up next".
- **Code sample** (`teach/Code.svelte`): an editor-ground block (18px) with a title bar and an optional caption. Highlighting comes from `teach/highlight.ts` with the editor palette (`.tk-*` in app.css).
- **Notes:** `tip` (gold), `warn` (miss rose, for real pitfalls), `plain` (sleeve, for everyday comparisons and precision asides).
- **Tables:** under 560px each row becomes a labelled card (labels are added at build time by `src/lib/content/article-markup.ts`).
- **Diagrams** (`teach/Diagram.svelte`): sysketch SVGs in the midnight theme on a matching #070b16 frame, with a caption and an "Open full size" link. On phones a wide diagram scrolls sideways at a minimum of 40rem so its labels stay legible.

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
