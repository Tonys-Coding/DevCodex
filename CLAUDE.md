# DevCodex

At the start of every session, read the memory bank in `.claudememory/` in this order:
1. `projectbrief.md`
2. `productContext.md`
3. `activeContext.md`
4. `systemPatterns.md`
5. `techContext.md`
6. `progress.md`

Update `activeContext.md` and `progress.md` whenever a decision or milestone changes.

- `PRODUCT.md` holds product truth. `DESIGN.md` holds the visual system; it is only final once a direction is approved.
- UI work follows the Impeccable skill in `.claude/skills/impeccable/`. For a hookless check, run `.claude/skills/impeccable/scripts/impeccable detect --json <files>` on changed UI.
- Commands:
  - `npm run dev`
  - `npm run check` must pass
  - `npm run build` writes static output to `build/` with base `/DevCodex`
  - `npm run diagrams` renders sysketch specs in `src/lib/content/diagrams/` (see the README there)
  - `npm run content:check` checks lessons, TL;DR reads and cards, and runs every JS/Python code sample; it must pass before content ships. Mark a fragment `run={false}` on its `<Code>`, or `run="fails"` if it is meant to error
- Do not push to GitHub or enable Pages without the user's explicit OK.
