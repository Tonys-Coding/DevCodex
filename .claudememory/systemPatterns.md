# System Patterns

## Architecture (planned for Phase 2)

- SvelteKit routes and components own the UI. Everything is prerendered by `adapter-static`, with `404.html` as the fallback for GitHub Pages.
- Content is versioned in the repo:
  - articles are mdsvex `.md` files that embed interactive Svelte components
  - concepts, shorts and problems are TypeScript data modules
- Concept cards declare `unlockedBy: <articleId>`. Seed cards are open from the start.
- Progress is a Svelte 5 runes store backed by IndexedDB. Its schema is versioned so Supabase sync can be added later.
- The code runner uses one message format over two Web Workers, one for JS and one for Pyodide, with a timeout and terminate.
- PWA: SvelteKit `src/service-worker.ts` plus a web manifest. The UI respects safe-area insets.

## Content patterns

- **Add an article:**
  1. Add a meta entry in `src/lib/content/catalog.ts` with status `live`.
  2. Write `src/lib/content/articles/<id>.svelte`. The body only: the shell adds the title, pack and next link.
  3. Add cards with `unlockedBy: <id>` in `cards.ts`, each with art in `components/cardArt.ts`.
  - Give the lesson a banner scene in `components/isoScenes.ts` (keyed by its id).
  4. Optionally map practice problems in `practiceFor`.
- **Add a problem:** add it to `problems.ts` with a starter, a solution and tests. Verify the solutions in Node and Python before shipping (no starter may pass).
- **Imports:** use `#lib/...` with explicit `.js` extensions for TS modules (package.json subpath imports). Kit 3 has no `$lib`.

## Design workflow

Impeccable lives at `.claude/skills/impeccable/`. `PRODUCT.md` is product truth. `DESIGN.md` gets rewritten from the built world once a direction ships (the Impeccable documenter step).
