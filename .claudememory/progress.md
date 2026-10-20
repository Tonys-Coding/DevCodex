# Progress

## Done

- 2026-10 (Codex session):
  - created the repo and the first image mockups (now in `prototypes/archive/`)
  - wrote `PRODUCT.md`
  - started a SvelteKit scaffold, which was left broken
- 2026-10-18 (Claude Code, setup):
  - the plan was approved
  - Impeccable is installed for Claude Code
  - the memory bank is consolidated and `CLAUDE.md` added
- 2026-10-18, Phase 0:
  - the scaffold is fixed
  - `npm run check` passes and `npm run build` works with base `/DevCodex` (404 fallback verified)
- 2026-10-18, Phase 1:
  - three coded directions, each with five screens (home, article, shorts, trivia, practice)
  - shared content is in `src/lib/proto/`
  - the gallery is at `/`
  - the Impeccable detector is clean
  - screenshots are in `prototypes/coded/`

- 2026-10-18, the user chose **C (Binder)**. Phase 2 was built: 6 articles, 32 cards, 8 shorts, 12 problems, the Python/JS runners, IndexedDB progress, the PWA and the service worker, and the deploy workflow. The Impeccable finish review shipped, and DESIGN.md was documented from the build.

- 2026-10-18: articles got difficulty levels (borders, tags, library filter) and full rewrites per level. Check, build and the detector are clean; phone and desktop were checked over CDP.

- 2026-10-18 (side session): the four soon articles are live:
  - recursion (Entry), stacks-queues (Entry), cookies-sessions (Experienced), cors (Senior)
  - new labs: `teach/CallStackTrace.svelte`, `teach/StackQueueLab.svelte`, `teach/CorsLab.svelte`; cookies-sessions uses `Choice`
  - sysketch diagrams: `cookies-sessions-sign-in` and `cors-preflight`
  - 17 new cards with art (49 total); practiceFor maps stacks-queues to valid-brackets and warmer-days
  - every code sample was run in Node 24 / Python 3.14. The CORS claims were checked against the Fetch Standard and a two-origin test harness in headless Chrome 155. Two findings: the spec's "Authorization is not covered by `*`" rule isn't enforced by default in any major browser, and `method: 'patch'` isn't uppercased.
  - check, build and the detector are clean (2 existing advisories); all four pages were checked at 375 and 1440 over CDP, with no overflow and no console errors.

- 2026-10-18: the wide desktop article layout with an On this page rail, and sysketch diagrams (2 so far). Check and build are clean, and it was checked at 375, 1000 and 1440px.

- 2026-10-19: first commits (nine, one per feature, with no type prefixes in the messages) pushed to origin/main.

- 2026-10-19: CI fixed (`@types/node` added, the config import uses a .ts extension). The first deploy succeeded and the site is live at https://tonys-coding.github.io/DevCodex/.

- 2026-10-19: Learn revamp (topic cards dealing lesson cards), boxless metadata sitewide, and the one-at-a-time quiz. Check, build and the detector are clean; checked at 375 and 1440px.

- 2026-10-19: Binder dashboard revamp (greeting, metrics, featured, continue reading, lesson pockets, tracks, achievements, cards), with reading and quiz tracking. Tested end to end over CDP. Check, build and the detector are clean.

- 2026-10-19: Dashboard UX pass built in full from a 17-point senior review: adaptive hero, phone fold, onboarding, backup reminder, wins since last visit, week streak, trimmed medals, sized review, binder rows by track, text-size floor, a level legend, no greeting jump, linked stats, removable in-progress, pocket actions, plus start level, weekly goal and card of the day. Tested new and returning users at 375 and 1440px.

- 2026-10-19: Packs gated behind real reading (sections, active time, quick checks), and an interactive lesson star map beside the greeting. The gate was tested over CDP: jumping to the end, failing then passing the quiz, and the time requirement.

- 2026-10-19: All 20 points from the Learn senior review built and tested at 375 and 1440px. The article bundle went from 88 KB to about 6 KB plus about 9 KB per article.

- 2026-10-19: Topic pages: Learn became a scalable topic grid, and each topic got its own page. Tested at 375 and 1440px, including the old-link redirect.

- 2026-10-19: Difficulty now describes the concept (Easy/Medium/Hard), and every lesson has Core, Going deeper and Under the hood layers. The six deep lessons got a new plain-words Core; the four entry lessons got new deeper layers (code run in Node and Python). There are 21 bonus cards with art, and the depth preference replaces the start level. Docs are updated.

- 2026-10-19: TL;DR built: Learn's Paths · TL;DR switch, list and reading pages, a Binder slot, Learn search over briefs, an RSS feed, and five sample reads. Read tracking counts toward the streak.

- 2026-10-19: `npm run content:check` added: structure, cards and briefs checks plus running every JS/Python code sample. Fixed the two content bugs it found (js-event-loop checkpoint titles, two-pointer-pattern Sources).

- 2026-10-19: Three Data Structures lessons added: binary search, linked lists and binary trees, each with a lab, both layers, 6 cards and a practice problem. `npm run content:check` passes on all 13 lessons.

- 2026-10-20: Eight more TL;DR reads from current news (dated 2026-10-19): AI agent break-ins (NorForge), the UK data-centre power wall (Microsoft and Nscale), Python 3.15 lazy imports, TypeScript 7 in Go, AI agents on Wikipedia (Wikimedia report), OAuth with the Personal Agent Protocol, prompt injection, and tokens. Facts come from primary sources where possible; content:check passes. Code ligatures are now off sitewide.

- 2026-10-20: Card redesign: topic and lesson cards got isometric clay banners on top (chosen from three prototypes), and lesson cards were condensed (no concept or layer lists). The topic page header uses the same art. Then the renderer was rebuilt for precision: surface-to-surface arrows, true depth order, one scale per banner kind, contact shadows, a scene geometry lint in content:check, and `npm run art:sheet`. Then each topic got its own shape vocabulary (new prisms, pyramids, spheres, pipes and surface marks), and all 16 scenes were recomposed.

## Next checkpoint

The user commits and pushes the layers work by feature (from the commands given), then tests installs on devices.
