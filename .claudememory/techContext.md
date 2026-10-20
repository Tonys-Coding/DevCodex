# Technical Context

## Stack

- SvelteKit 3, Svelte 5 (runes), TypeScript, Vite 8, `@sveltejs/adapter-static`.
- The SvelteKit config lives in `vite.config.ts`, including the adapter and the `paths.base`:
  - production builds use `/DevCodex`
  - dev serves at `/`
- `#lib/*` import alias, defined in the package.json `imports`.
- Planned:
  - mdsvex
  - CodeMirror 6
  - Pyodide, from jsDelivr, lazy-loaded inside a worker
  - idb-keyval
  - MiniSearch

## Hosting

- GitHub Pages (`https://github.com/Tonys-Coding/DevCodex.git`), deployed by a GitHub Actions workflow (`actions/deploy-pages`).
- Nothing has been pushed yet. Pushing needs the user's explicit OK.
- Free alternatives considered: Cloudflare Pages, only if server functions are ever needed. Store builds via Capacitor need Apple's $99/yr account, so they are deferred.

## Tooling

- Impeccable 4.6.0 is installed in the project at `.claude/skills/impeccable/`. It also exists globally for Codex at `~/.codex/skills/impeccable`.
- The design detector is run by hand: `.claude/skills/impeccable/scripts/impeccable detect --json <targets>`.

## Content check

- `npm run content:check` runs `scripts/content-check.mjs` (plain Node 24, no dependencies). It imports `catalog.ts`, `cards.ts`, `briefs.ts`, `cardArt.ts` and `article-markup.ts` directly, using Node's built-in type stripping plus a small `registerHooks` resolver that adds the `.ts` extension to the modules' extensionless imports.
- Lessons: every live catalog entry has a body and every body has an entry; Core first, ending with `<CorePack />`, then `<Layer depth="deeper">` and `<Layer depth="hood">` with nothing between them; the Core has a Quiz; deeper checks are titled "Going deeper checkpoint …"; hood checks are "Under the hood checkpoint …" and the last is "Under the hood check", followed by a final "Sources…" h2 with links; quiz titles are unique (progress keys them by title), and every `<Quiz>` closes with `/>` on its own line so `quizzesOf` sees it.
- Cards: unique ids, art in `cardArt.ts`, `unlockedBy` names a catalog article (warning if not live), and each bonus card's layer exists and has sections. Warnings: art with no card, a layer with no bonus card, a lesson with no Core cards.
- TL;DR: meta and body files match both ways, exactly 3 bullets, YYYY-MM-DD dates, kind `new` has `checked`, `deeper` is a live lesson, the body has "Why it matters to you" and a final Sources h2, and `wordCount` stays under 900 (warning) or 1000 (error).
- Code samples: every `<Code lang="js|py" code={`…`}>` is cooked as a template literal (so `\x3C` and `` \` `` become real characters) and run in a temp dir, Python with `python3 -I`, JS with `node`, 10 s each, in parallel. Failures point at the failing line of the article when the traceback names one. `run={false}` skips a fragment (browser APIs, servers, pseudocode, a sample that continues an earlier one); `run="fails"` expects a non-zero exit (error demos). `Code.svelte` accepts and ignores `run`. Other languages (http, text) are not run.
- Exit code 1 on any error; warnings don't fail it. It takes about 10 s.
- `npm run art:sheet` (scripts/art-sheet.mjs, plain Node) renders every banner scene from `components/isoScenes.ts` with `iso/geometry.ts` and `iso/iso.css` into one HTML page (default in the OS temp dir; pass a path to choose). Use it for a close look after art changes; content:check also lints scene geometry.
