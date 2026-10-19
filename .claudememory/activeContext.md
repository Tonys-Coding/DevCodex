# Active Context

_Last updated: 2026-10-18_

## Now

Phase 2 is built and verified. **Binder (direction C)** is the app. On 2026-10-19 it was committed in nine feature commits and pushed to `Tonys-Coding/DevCodex` main. Pages is on (source: GitHub Actions), and the site is live at https://tonys-coding.github.io/DevCodex/.

## What exists

- Routes:
  - `/` Binder home (quest, tracks, binder)
  - `/learn` and `/learn/[slug]` (6 live articles)
  - `/shorts`, `/trivia`
  - `/practice` and `/practice/[slug]` (12 problems)
  - `/you`
- Content lives in `src/lib/content/`. Articles are Svelte components named by id. Every card gets its own art in `src/lib/components/cardArt.ts`.
- Progress is stored in IndexedDB through `src/lib/progress/progress.svelte.ts`, with export/import, a streak, and drafts per problem and language.
- Runner: `src/lib/runner/`
  - JS worker with a 4 s limit
  - Pyodide v314.0.7 worker with an 8 s limit
  - a stuck worker is terminated and restarted
  - comparison modes: exact, unordered, unordered-deep
- PWA:
  - `static/manifest.webmanifest` and icons
  - `src/service-worker.ts`, built on Kit 3's `$app/manifest`, `$app/env` and `$app/service-worker`; `$service-worker` is removed in Kit 3
  - each file is precached separately, and dotfiles are skipped
  - Pyodide is cached at runtime
- Deploy: `.github/workflows/deploy.yml` (Pages via Actions).

## Verified (2026-10-18)

- `npm run check` and `npm run build` are clean.
- In headless Chrome over CDP against `vite preview`:
  - the service worker activates with 91 files precached
  - finishing an article unlocks its cards, and that persists across a reload
  - offline navigation works on unvisited routes
  - Python passes in the production build, and Pyodide is cached
- Both runners were checked in the pane for pass, fail, syntax errors, exceptions, stdout and infinite-loop timeouts.
- Impeccable finish review: inline (degraded) pass, verdict ship after one fix round. DESIGN.md and `.impeccable/design.json` were written from the build.

## Article levels (2026-10-18)

- Articles are ranked Entry-level / Experienced / Senior (rules in PRODUCT.md "Article levels"). Live: load-a-page and values-references (Entry), http-caching and two-pointer-pattern (Experienced), js-event-loop and hash-maps (Senior). The reading path (`liveArticles`) runs easiest first.
- All six articles were rewritten and expanded, with tables, lists, highlighted code (`teach/Code.svelte`, `teach/highlight.ts`), note tones, recaps, quizzes and sources. Code samples were run in Node and Python.
- Tables stack into labelled cards under 560px; `src/lib/content/table-labels.ts` is a build-time preprocessor (wired in vite.config.ts) that adds data-labels and ARIA roles.
- Level colours, the Level Tag component and "The Level Frames The Lesson Rule" are in DESIGN.md and `.impeccable/design.json`.
- The four soon articles are proposed as a separate session (task card "Write the four coming-soon DevCodex articles by level").

## Wide layout and diagrams (2026-10-18)

- Article pages use the full 78rem app width: a split cover, a 52rem text measure, full-width blocks, and an "On this page" rail at 1100px and up (folding list below that). Labs adapt with `@container prose`.
- `src/lib/content/article-markup.ts` (renamed from table-labels.ts) is the build-time preprocessor. It adds table data-labels and roles, plus h2 ids and a `toc` export per article.
- Diagrams: sysketch 0.5.0 (devDependency) renders `src/lib/content/diagrams/*.yaml` to SVG, plus `sizes.json`, via `npm run diagrams`. They are placed with `teach/Diagram.svelte`. Two exist so far: the load-a-page sequence and the http-caching topology. Algorithm articles deliberately have none.
- The session "Write the four coming-soon DevCodex articles by level" (soon-articles) is writing recursion, stacks-queues, cookies-sessions and cors in this checkout.

## Known quirks

- CI runs `npm ci` from scratch. A stale local `.svelte-kit/` can hide type errors, so clear it before trusting a local `npm run check`. `@types/node` is a direct dev dependency for vite.config.ts.

- The in-app browser pane cannot register service workers and sometimes renders phone screenshots scaled. Use CDP headless Chrome for screenshots: `Emulation.setDeviceMetricsOverride`.

## Next

1. Done: Pages is live.
2. The user tests installing on iPhone (Add to Home Screen) and Mac (Add to Dock).
3. Content backlog:
   - four "soon" articles: cookies-sessions, cors, recursion, stacks-queues
   - more problems
   - Supabase sync later
