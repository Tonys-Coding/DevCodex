# Active Context

_Last updated: 2026-10-19_

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

## Difficulty and depth (2026-10-19, replaces "Article levels")

- Difficulty is Easy / Medium / Hard and describes the concept, not the reader (rubric in PRODUCT.md "Difficulty and depth", data in `src/lib/content/levels.ts`). Easy: load-a-page, values-references, recursion, stacks-queues, hash-maps, two-pointer-pattern. Medium: cookies-sessions, http-caching, cors, js-event-loop. CSS is `--easy`/`--medium`/`--hard` and `.lv-easy`/`.lv-medium`/`.lv-hard`.
- Every lesson has three layers: Core (plain words, earns the pack, ends with `<CorePack />`), then `<Layer depth="deeper">` and `<Layer depth="hood">` (`teach/Layer.svelte`). The `article-markup.ts` preprocessor tags each section and quiz with its depth and word count (code counts six words a line). Catalog `minutes` is Core time only.
- Requirements: `requirements()` is Core-only. `layerRequirements()` needs the layer's sections read and checks passed, and the Core finished. `progress.finishLayer()` stores `layers[id]`; bonus cards (`layer` on ConceptCard) unlock from it. There are 21 bonus cards: deeper ones are level 2, hood ones level 3 (rare). `unlockHint()` names the layer.
- The depth preference (`profile.depth`, migrated from the old start level) decides which layers open by default. Links and hashes into a closed layer open it.
- Achievements: Going Deeper, Under the Hood and Bottom of the Stack replace the old senior and all-levels medals.

## Wide layout and diagrams (2026-10-18)

- Article pages use the full 78rem app width: a split cover, a 52rem text measure, full-width blocks, and an "On this page" rail at 1100px and up (folding list below that). Labs adapt with `@container prose`.
- `src/lib/content/article-markup.ts` (renamed from table-labels.ts) is the build-time preprocessor. It adds table data-labels and roles, plus h2 ids and a `toc` export per article.
- Diagrams: sysketch 0.5.0 (devDependency) renders `src/lib/content/diagrams/*.yaml` to SVG, plus `sizes.json`, via `npm run diagrams`. They are placed with `teach/Diagram.svelte`. Two exist so far: the load-a-page sequence and the http-caching topology. Algorithm articles deliberately have none.
- The session "Write the four coming-soon DevCodex articles by level" (soon-articles) is writing recursion, stacks-queues, cookies-sessions and cors in this checkout.

## Learn revamp (2026-10-19)

- Learn (`src/routes/learn/+page.svelte`) shows the three tracks as landscape topic cards (`app/TopicCard.svelte`, art in `trackArt` in cardArt.ts). Opening one deals its lessons as portrait `app/LessonCard.svelte` cards; the tagline is "Your path to expertise."; search is underlined and the level filter is text tabs.
- No pills for facts anywhere: `.meta-row` in app.css replaces the chips (article cover, practice badges and score, header card count), and LevelTag is boxless.
- Quiz is a one-question-at-a-time stepper with locked answers, Next question, and a final score with Try again.

## Binder dashboard (2026-10-19, revised)

- `/` (`src/routes/+page.svelte`) composes `src/lib/components/home/`: Greeting, Notices (wins since last visit, backup reminder), Onboarding (new users: how it works and start level), StatStrip (linked numbers), Hero (resume within 3 days, or next on the path), ThisWeek (week dots, streak, weekly goal ring), ContinueList (other in-progress, with Remove), LessonBinder (pockets per track, which replace the Tracks section), Review (card of the day with grading, sized review) and Medals (`summary` on the dashboard, `full` on You).
- Helpers: `src/lib/progress/dashboard.ts` (path, hero, week, timeAgo, dueCards, cardOfDay, needsBackup, isInstalled, downloadBackup) and `achievements.ts`.
- Progress (still version 1) gained optional `profile.level`, `profile.weeklyGoal`, `seen` (last dashboard snapshot, via `rememberDashboard`), `backup` (exported/dismissed), plus `forget(id)`. You page: settings, full medals, last backup date, `#install` and `#achievements` anchors.

## Pack gate and lesson map (2026-10-19)

- `src/lib/progress/requirements.ts` defines the pack requirements: 80% of sections, active time of 30% of the estimate (60–300 s), and every quick check passed (≥60% on multi-question ones). ArticleShell counts active time in 5 s ticks (visible tab, activity in the last 60 s) through `progress.readTime`. `progress.read` records `sections`. Quizzes register through the `devcodex:quizzes` context; a passed check reopens on its best score.
- `home/LessonMap.svelte`: a star map of lessons beside the greeting (desktop only).

## Learn review build (2026-10-19)

- Articles load on their own: `learn/[slug]/+page.ts` lazy-imports the body. The article page is now about 6 KB gzipped plus about 9 KB per article, down from 88 KB.
- `learn/+page.server.ts` ships a build-time index (`src/lib/content/article-index.server.ts`): sections with key terms (`keywordsOf`) and quizzes (`quizzesOf`) per article, used for search and for pack status on cards.
- Learn: remembers open topics (sessionStorage `devcodex:learn-open`), honours `#topic-<track>`, allows several open topics, search lists sections, terms and concepts, and a level filter that doesn't clear itself.
- Articles: progress line, phone section line and sheet, rail pack steps, resume prompt, cover "Builds on" and "Earn the pack", phone summary clamp, two checkpoints each (`Quiz variant="checkpoint"`), `teach/Term.svelte` glossary tooltips in the three Entry-level glossaries, and code Copy/Wrap.
- Requirements: the time step is waived when every section is read and every check is fully right. `--header-h` is set by the layout.

## Topic pages (2026-10-19)

- Learn (`/learn`) is a scalable grid of TopicCard links, plus a Continue line, search, and a level list when a level is picked without a search. Each topic has `/learn/topic/[track]` (prerendered via `entries`, with this topic's slice of the article index from `+page.server.ts`): header with the next step, the path, concept cards, the achievement, practice and shorts.
- Article back links and the dashboard binder's track headings point at topic pages. `/learn#topic-x` redirects.
- Adding a topic means: tracks plus TrackId, a `.t-<id>` colour, `trackArt`, and an achievement title. A topic without a colour falls back to gold.

## Known quirks

- CI runs `npm ci` from scratch. A stale local `.svelte-kit/` can hide type errors, so clear it before trusting a local `npm run check`. `@types/node` is a direct dev dependency for vite.config.ts.

- The in-app browser pane cannot register service workers and sometimes renders phone screenshots scaled. Use CDP headless Chrome for screenshots: `Emulation.setDeviceMetricsOverride`.

## Next

1. Done: Pages is live.
2. The user tests installing on iPhone (Add to Home Screen) and Mac (Add to Dock).
3. Content backlog:
   - new topics and lessons (each one written as Core, Going deeper and Under the hood)
   - more problems
   - Supabase sync later
