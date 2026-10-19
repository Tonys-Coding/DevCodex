# DevCodex product context

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

SvelteKit and TypeScript, exported as static files for the `Tonys-Coding/DevCodex` GitHub Pages project path (`/DevCodex`), installable as a PWA (Add to Home Screen on iOS, Add to Dock on macOS). Progress is stored on the device first (IndexedDB); Supabase sync may come later.

## Users

Beginners learning software engineering concepts on phones and desktop computers, including iPhone, Android, and Mac users.

## Product Purpose

Make foundational software engineering ideas easier to understand and remember through interactive lessons, short visual explainers, and trivia.

## Operating Context

Learners may read a lesson in a longer desktop session or review a single concept on a phone. Lessons should be comfortable to read; shorter content should work in brief sessions.

## Capabilities and Constraints

- The intended learning loop is lesson → trivia → related deeper concept cards.
- The short feed uses swipeable visual explainers and engineering scenarios, not video at launch.
- Initial topics span web fundamentals, programming concepts, and basic data structures.
- Coding practice is a smaller section: write and run Python (Pyodide) and JavaScript (Web Worker) solutions in the browser against tests; problems are written in our own words and link out to LeetCode/NeetCode.
- No accounts at first: progress lives on the device with JSON export/import. Cross-device sync via Supabase is a later option.
- GitHub Pages serves static files; it does not run a SvelteKit server.
- The user wants no required purchases. Public email/password signup remains unresolved because Supabase's default sender is limited to development use.

## Article levels

Every article has a level, shown as a coloured border and a tag (`src/lib/content/levels.ts`). Write for the level:

- **Entry-level · Easy (green):** plain words for someone with basic tech knowledge. Define every term on first use, use everyday comparisons, short sentences, a "Words you will meet" glossary and a "You will learn" list.
- **Experienced · Medium (blue):** assumes the reader writes code. Use real terminology with brief definitions, code samples, trade-off tables, pitfalls and sources.
- **Senior · Hard (red):** no guardrails. Specs, internals, edge cases and numbers, as long as it stays understandable. Nothing missing, redundant or unverified: run every code sample and check every claim, and cite sources.

All levels use structure: tables, bullet and numbered lists, highlighted code (`teach/Code.svelte`), notes (`tone`: tip, warn, plain), a recap and a quiz. Each article sets an `assumes` line.

## Brand Commitments

The working name is DevCodex. ByteByteGo is a teaching-style reference, not a content source. All lessons, diagrams, and cards should be original.

## Evidence on Hand

The Binder direction (C) was chosen from three coded prototypes (screenshots in `prototypes/coded/`). The app ships six original articles, 32 concept cards, 8 shorts and 12 practice problems. No user-supplied lessons, brand assets, or product usage data exist yet.

## Product Principles

- Explain one idea clearly before asking the learner to act on it.
- Keep article reading and phone interactions legible.
- Use short content to reinforce lessons, not replace them.
- Show useful progress without pretending demo data is real.
