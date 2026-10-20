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
- Learn is a grid of topics, each with its own page (lessons, progress, concept cards, practice, shorts, achievement), so the catalogue can grow to many topics.
- Every lesson has two mid-lesson checkpoints (one question each) besides its quick check. Lessons can name prerequisites (`builds` in the catalog).
- Packs are earned, not clicked: a lesson's pack opens only after most sections are read past, real time is spent (counted only while the tab is visible and the reader is active), and its quick checks are passed. All checks run on the device; there is no server to cheat against, so this is a guardrail for honest learners, not anti-tampering.
- The short feed uses swipeable visual explainers and engineering scenarios, not video at launch.
- Initial topics span web fundamentals, programming concepts, and basic data structures.
- Coding practice is a smaller section: write and run Python (Pyodide) and JavaScript (Web Worker) solutions in the browser against tests; problems are written in our own words and link out to LeetCode/NeetCode.
- No accounts at first: progress lives on the device with JSON export/import. Cross-device sync via Supabase is a later option.
- The Binder home is the learner's dashboard. It leads with one next step (resume or start), then covers this week (streak dots, weekly goal), lessons in progress, the binder of collected lessons by track, a card of the day with a sized review, and achievements. New users get a how-it-works panel and pick how deep lessons open. Settings (name, depth, weekly goal), the full achievement gallery and backups live on the You page. Because progress is device-only and some browsers clear site data, the dashboard reminds uninstalled users to install or export.
- GitHub Pages serves static files; it does not run a SvelteKit server.
- The user wants no required purchases. Public email/password signup remains unresolved because Supabase's default sender is limited to development use.

## Difficulty and depth

Two separate ideas, kept apart on purpose.

**Difficulty describes the concept, not the reader** (`src/lib/content/levels.ts`). It is shown as a coloured border and a tag.

| Difficulty | Rubric | Examples |
| --- | --- | --- |
| **Easy (green)** | A fundamental idea: few prerequisites and one concept to hold. | Stacks and queues, hash maps, two pointers, recursion, values and references, loading a page |
| **Medium (blue)** | Builds on fundamentals: an idea plus rules or invariants to keep in mind. | Binary trees, caching, cookies and sessions, CORS, the event loop |
| **Hard (red)** | Several interacting ideas and invariants, after Medium topics. | Balanced trees, dynamic programming, consensus |

A lesson's `builds` lists the lessons it relies on, and its `assumes` line says what the reader should already know, in plain words.

**Depth is how far a reader goes inside one lesson.** Every lesson has three layers:

- **Core** (always open): plain words for someone with basic tech knowledge. Define every term on first use ("Words you will meet"), use everyday comparisons, short sentences, one interactive piece where it helps, a recap and a quick check. The Core alone earns the lesson's pack, and `minutes` in the catalog is the Core's reading time. It ends with `<CorePack />`.
- **Going deeper** (`<Layer depth="deeper">`): assumes the reader writes code. Real terminology with brief definitions, code samples, trade-off tables, pitfalls, and two one-question checkpoints titled "Going deeper checkpoint".
- **Under the hood** (`<Layer depth="hood">`): specs, internals, edge cases and numbers, as long as it stays understandable. Ends with a recap, a multi-question "Under the hood check" and sources.

Finishing a layer (its sections read, its checks passed, and the Core already finished) collects its bonus cards: Going deeper cards are level 2, Under the hood cards are level 3 and rare. The learner's depth preference (onboarding and the You page) decides which layers open by default; every layer can be opened or closed in place.

All layers use structure: tables, bullet and numbered lists, highlighted code (`teach/Code.svelte`), notes (`tone`: tip, warn, plain). Nothing missing, redundant or unverified: run every code sample and check every claim.

## Brand Commitments

The working name is DevCodex. ByteByteGo is a teaching-style reference, not a content source. All lessons, diagrams, and cards should be original.

## Evidence on Hand

The Binder direction (C) was chosen from three coded prototypes (screenshots in `prototypes/coded/`). The app ships six original articles, 32 concept cards, 8 shorts and 12 practice problems. No user-supplied lessons, brand assets, or product usage data exist yet.

## Product Principles

- Explain one idea clearly before asking the learner to act on it.
- Keep article reading and phone interactions legible.
- Use short content to reinforce lessons, not replace them.
- Show useful progress without pretending demo data is real.
