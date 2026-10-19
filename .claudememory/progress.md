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

## Next checkpoint

The user approves the first commit and push. Then Pages goes live at `https://tonys-coding.github.io/DevCodex/` and installs get tested on devices.
