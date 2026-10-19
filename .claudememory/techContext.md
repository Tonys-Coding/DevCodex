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
