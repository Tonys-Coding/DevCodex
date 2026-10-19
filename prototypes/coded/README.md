# Coded prototypes: three directions

> **Historical.** C (Binder) was chosen on 2026-10-18 and became the app. The prototype routes were removed from `src/`; these screenshots record the three candidates.

These are working Svelte screens, not images. Run them with `npm run dev` and open `http://localhost:5179/` (the gallery), or go straight to one direction at `/prototypes/a`, `/prototypes/b` or `/prototypes/c`.

Each direction has five screens: home, article, shorts, trivia and practice. All three use the same original sample content from `src/lib/proto/content.ts`.

| Direction | World | Signature | Type | Honest risk |
| --- | --- | --- | --- | --- |
| **A: Margin** | An annotated reference edition: warm iron-black ground, bone text, one vermilion rubric | Notes in the margin, plus a single square “detent” mark for every state | Literata + JetBrains Mono | Least app-like; shorts and trivia feel studious |
| **B: Line Map** | A transit network: three coloured lines, articles as stations | Strip maps per track; the request diagram is a route a “train” rides; ⌘K palette and J/K keys | Overpass + JetBrains Mono | Densest; busier for first-time beginners |
| **C: Binder** | Collectible trading cards in a binder | Finishing an article opens a pack of cards; swipe-right deck; foil tilt on new cards | Bricolage Grotesque + Atkinson Hyperlegible Next | Most game-like; long reading needs care inside a loud frame |

## Screenshots

- Desktop shots are `*-desktop.png`: 1440×900, first viewport, captured with headless Chrome.
- Phone shots are `*-phone.jpg`: 390×844, captured from the in-app browser. Headless Chrome cannot go narrower than about 500px.

## What is real and what is sample

Real:
- Navigation, the step-through diagrams, inline checks, finishing an article and unlocking its cards, the trivia decks (flip, swipe, keyboard), the auto-playing shorts, and B’s command palette.

Sample:
- Progress marks are held in memory and reset on reload.
- Only one article is written.
- The practice runner shows fixed results. Real Python (Pyodide) and JavaScript (Web Worker) execution is part of the full build.

## How the directions were chosen

- **Impeccable 4.6.0**, run as `concept-seed --scope direction --mode read`, dealt the collectible-card world (C). Its challengers raised the other two. The reference-setting challenger, with its margin apparatus and rubric, shaped A.
- The originally planned “Console” look was replaced by B’s transit map. Impeccable’s rules for reading and working screens refuse dressing an app up as the tool its audience uses, such as a terminal. B keeps the dense, keyboard-first intent without that look.
- Seed reference: `seed:e0889be7cba1a30a`.
