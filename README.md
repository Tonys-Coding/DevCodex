# DevCodex

A free, installable app for learning software engineering. Concepts are collectible cards: finish an article, open a pack, and keep the cards sharp in the trivia deck.

- **Learn:** six hands-on articles with interactive labs: a request route, a cache flow, a code-and-memory tracer, an event-loop simulator, a hash-map lab and a two-pointer game.
- **Shorts:** a vertical feed of animated explainers, "spot the bug", "which would you pick?" and myth-or-fact cards.
- **Trivia:** a swipe deck of 32 concept cards. Cards unlock as you finish articles, and the ones you miss come back first.
- **Practice:** 12 LeetCode/NeetCode-style problems, solved in Python (Pyodide) or JavaScript, run in a Web Worker with real tests and time limits.
- **You:** progress, streak, and export/import. Everything is stored on the device; nothing is sent anywhere.

Built with SvelteKit 3 + Svelte 5 as a static PWA for GitHub Pages: add it to the Home Screen on iPhone, or the Dock on a Mac, and it works offline.

## Develop

```bash
npm install
npm run dev
```

- `npm run check`: Svelte and TypeScript checks
- `npm run build`: static site in `build/`, served from `/DevCodex`
- `npx vite preview`: serve the production build at `http://localhost:4173/DevCodex/`
- `npm run diagrams`: re-render the sysketch diagrams in `src/lib/content/diagrams/` after editing a `.yaml` spec (commit the `.svg` too)

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. One-time setup in the GitHub repo: **Settings → Pages → Source: GitHub Actions**.

## Where things live

- `src/lib/content/`: tracks, articles (one Svelte component each), cards, shorts and problems
- `src/lib/components/teach/`: the interactive teaching components
- `src/lib/runner/`: the Python and JavaScript test runners (Web Workers)
- `src/lib/progress/`: the on-device progress store (IndexedDB)
- `src/service-worker.ts`: offline caching
- `PRODUCT.md`, `DESIGN.md` and `.claudememory/`: product truth, the design system and the project memory bank
