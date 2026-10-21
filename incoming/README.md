# Incoming lessons

Drop lesson files written by a web AI here, one `<id>.md` per lesson, in the format from `.claude/skills/lesson-writer/web-edition.md`.

1. Paste `web-edition.md` and a brief into ChatGPT, Gemini or similar, and save its answer here as `<id>.md`.
2. Run:

   ```bash
   npm run lesson:import -- incoming
   ```

   This writes each lesson, its catalog entry, its cards and its practice links into the app. Re-importing a file replaces the lesson in place.
3. Run:

   ```bash
   npm run content:check
   ```

   This runs every code sample, checks the structure, and lists the card art and banner scene still to draw.
4. The reviewer checks the claims ledger (the `=== HANDOFF ===` section), fixes what's wrong, draws the cards and banner, and builds the lab from the `<!-- LAB: … -->` placeholder.

To edit an existing lesson outside the repo, export it first:

```bash
npm run lesson:export -- binary-search incoming/binary-search.md
```
