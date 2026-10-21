---
name: lesson-writer
description: "Write a complete DevCodex lesson from a brief: the Core, Going deeper and Under the hood layers, quizzes, concept cards with art, a banner scene, a catalog entry, and an optional practice problem, then run every check and hand back a claims ledger and a lab spec. Use when asked to write, draft or add a lesson listed in CURRICULUM.md. Not for TL;DR reads, interactive labs (the reviewer builds those) or app code."
user-invocable: true
argument-hint: "[path to a lesson brief, or a lesson id from CURRICULUM.md]"
---

# Writing a DevCodex lesson

You write one lesson, end to end, from a brief. A reviewer then checks every fact you hand back and builds the interactive lab. Your job is a lesson that is **correct, plain and complete**, plus an honest record of what you checked. Accuracy matters more than speed: a wrong fact in a learning app does real harm.

**Writing from a web AI instead?** Paste `web-edition.md` (in this folder) and a brief into it. It returns one Markdown file in the lesson format; `npm run lesson:import -- incoming` turns that into the files below, and `npm run content:check` runs its code. The format is implemented in `scripts/lesson-format.mjs`, and `npm run lesson:roundtrip` proves it covers every live lesson.

Read these first, in this order:
1. The brief you were given. If you only have a lesson id, write the brief yourself from its entry in `CURRICULUM.md`, using `templates/lesson-brief.md`.
2. `PRODUCT.md`, the section "Difficulty and depth" (the rubric and the voice for each layer).
3. `reference/lesson-skeleton.md` in this skill: the exact file layout, with every rule annotated.
4. One finished lesson at the same difficulty as yours, to match its tone and density:
   - Easy: `src/lib/content/articles/binary-search.svelte`
   - Medium: `src/lib/content/articles/binary-trees.svelte`

Do not edit components, routes, styles or the checker. Do not commit or push. If something you need doesn't exist (a component, a helper), say so in the handoff instead of building it.

## What you produce

| File | What to add |
|---|---|
| `src/lib/content/articles/<id>.svelte` | The lesson body: Core, `<CorePack />`, then the two layers. |
| `src/lib/content/catalog.ts` | One `ArticleMeta` entry in the `articles` array, at its place in the topic's path order. |
| `src/lib/content/cards.ts` | 4 Core cards, 1 Going deeper bonus card and 1 Under the hood bonus card, appended at the end of the array. |
| `src/lib/components/cardArt.ts` | One line drawing per new card. |
| `src/lib/components/isoScenes.ts` | One banner scene in `lessonScenes`, using the topic's shape vocabulary. |
| `src/lib/content/problems.ts` and `practiceFor` in catalog.ts | Only if the brief asks for a practice problem. |
| A handoff report | From `templates/handoff.md`, as your final message (or the file the brief names). |

## The lesson body

Follow `reference/lesson-skeleton.md` exactly. In short:

**Core: plain words, everything needed to use the idea. It earns the card pack.**
- Open with two short paragraphs that start from something familiar, then "In this lesson you will learn:" and a list of 4 or 5 outcomes.
- `<h2>Words you will meet</h2>`, a `<dl>` with 5 to 8 terms. Each term is used later in the Core, and its first use is wrapped in `<Term def="…">` with the same definition.
- The idea through an everyday comparison: one `<Note title="An everyday picture" tone="plain">`.
- `<h2>Try it</h2>` where the interactive lab goes. Write the lead-in paragraph and the "Things to try on purpose" list as if the lab exists, then put the lab placeholder (see "The lab" below).
- `<Quiz variant="checkpoint" title="Checkpoint 1" …/>` and `"Checkpoint 2"`, one question each, placed after the section each one tests.
- The code: one JavaScript and one Python sample of the core technique, runnable on their own.
- A table where a comparison helps; "Where it shows up"; "Common mistakes"; "Recap" as a bullet list.
- A final `<Quiz questions={[…]} />` (title defaults to "Quick check") with **exactly 5 questions**.
- Then `<CorePack />` on its own line.
- About 1,300 to 1,800 words for Easy; up to 2,000 for Medium and Hard.

**Going deeper (`<Layer depth="deeper" summary="…">`): assumes the reader writes code.**
- Real terminology with brief definitions, trade-offs, pitfalls and more code. 2 to 4 `<h2>` sections, about 600 to 800 words.
- Two checkpoints, titled exactly "Going deeper checkpoint 1" and "Going deeper checkpoint 2".

**Under the hood (`<Layer depth="hood" summary="…">`): specs, internals, edge cases and numbers.**
- 2 to 4 `<h2>` sections, about 500 to 800 words, then `<h2>Recap: …</h2>` as a numbered list.
- The last quiz is titled exactly "Under the hood check", with 4 or 5 questions. Any earlier hood checkpoint is titled "Under the hood checkpoint".
- End with `<h2>Sources and further reading</h2>` and 2 to 4 links to primary sources, using `rel="external"`.

**Summaries.** Each layer's `summary` attribute is one sentence listing what's inside, with no full stop at the end of a list fragment. Write it in the existing lessons' style.

## Voice

- Plain, warm and exact. Short sentences in the Core. Define every term the first time you use it.
- British spelling (behaviour, colour, organise, amortised). No em dashes: use a colon, a comma or two sentences.
- Curly quotes and apostrophes in prose (’ “ ”). Straight quotes only inside code.
- Second person ("you"). No hype, no "simply", no "just" for things that aren't simple, no exclamation marks.
- Every paragraph earns its place: no filler intros, no summary of what you just said, except in the Recap.
- Numbers come with units and context ("about 20 looks for a million items"), not bare.

## Accuracy rules (the important part)

1. **Run every code sample**, in Python 3.14 (`python3 -I`) and Node 24, before you put it in. Comments showing output (`# [1, 2, 3]`) must be the real output. Only mark a sample `run={false}` if it is a fragment that can't run on its own, and say why in the handoff. A sample that is meant to fail is `run="fails"`.
2. **Check every fact that isn't common knowledge** against a primary source: the language docs, the RFC or spec, the project's own documentation, the original paper or post. That covers numbers, versions, dates, limits, defaults, who did what, and how a system behaves. Use secondary sources (blogs, Wikipedia) only to find the primary one.
3. **Never invent a number.** Measure it (and say so, "on a laptop"), compute it (and show the arithmetic), or cite it. If you can't, write around it.
4. **Record every checked claim** in the handoff's claims ledger: the claim, where it is (section), the source URL, and how you checked it. The reviewer verifies the ledger, so a missing entry looks like an unchecked fact.
5. **Name versions** when behaviour depends on them ("since Python 3.11", "in Chrome").
6. **Write in your own words.** Never copy sentences from sources; quotes are rare and under 15 words.
7. **Say what you're unsure about.** List it under "Open questions" in the handoff instead of guessing.

## Quizzes

- Each question tests one idea from the text above it. No trick questions, no "all of the above".
- 2 to 4 options. Wrong options are plausible mistakes a learner actually makes.
- `answer` is the 0-based index. Vary its position across questions.
- `explain` says why the right answer is right, and, when useful, why the tempting wrong one is wrong. One or two sentences.
- Titles are unique within a lesson, because progress is stored by title.

## Concept cards (`cards.ts`)

Append six cards at the **end** of the `cards` array; never insert in the middle, because a card's position is its collector number.

| Cards | `layer` | `level` |
|---|---|---|
| 4 Core cards | none | 1 or 2 |
| 1 Going deeper bonus | `'deeper'` | 2 |
| 1 Under the hood bonus | `'hood'` | 3 (rare) |

- Fields: `id` (kebab-case, unique across all cards), `term` (2 to 4 words), `track`, `question` (a real question the lesson answers), `answer` (short, no full stop unless it is a sentence), `detail` (one or two sentences that teach), `unlockedBy: '<lesson id>'`, `level`, and `layer` for bonus cards.
- Each card's question must be answerable from its layer of the lesson.

## Card art (`cardArt.ts`)

One entry per new card id: SVG markup drawn on a **120 × 64** grid, kept inside x 6 to 114 and y 6 to 58.
- Line drawings only: `<rect>`, `<circle>`, `<path>`, `<line>`. The renderer sets the stroke (4 px, round caps) and no fill.
- Exactly one focal shape gets `class="hot"`, which fills it.
- Draw the concept, not letters or numbers. Look at nearby entries for the house style, and avoid drawings that look like an existing card's.

## Banner scene (`isoScenes.ts`)

Add `'<lesson id>': [ … ]` to `lessonScenes`, using **only the helpers for the lesson's topic** (listed at the top of the file):
- How the Web Works: `browser`, `server`, `globe`, `envelope`, `house`, `cookie`, `clock`, `book`, `gate`.
- Programming Concepts: `doc`, `gear`, `tag`, `brace`, plus `path(oval(…), { pipe: true })` for a track.
- Data Structures: `tile`, `node`, `bucket`, `funnel`, `pin`, `hex`, and `path(…, { pipe: true })` for rails.
- Shared: `block`, `disc`, `ball`, `prism`, `link`, `path`.

Rules:
- Exactly one subject in `tone: 'accent'`, the thing the lesson is about. Context can be `'dim'`.
- Place objects by centre with `s` (left to right) and `d` (towards the viewer). Keep the whole scene within about 13 units of `s`.
- Arrows are `link('from-id', 'to-id')` between named objects, never hand-placed lines between objects.
- A square of side k spans 2k along `s`: space rows of equal pieces at least 2k apart.
- `npm run content:check` reports overlaps, hidden arrowheads and fit. Fix every error. Then run `npm run art:sheet`, open the file it prints, and look at your banner next to the others.

## Catalog entry (`catalog.ts`)

```ts
{
	id: '<id>',
	builds: ['<prerequisite id>'],          // omit if none; only ids already in the catalog
	track: 'web' | 'programming' | 'structures',
	level: 'easy' | 'medium' | 'hard',      // from the brief and the PRODUCT.md rubric
	status: 'live',
	title: '…',                             // from CURRICULUM.md
	summary: '…',                           // one line, under about 70 characters, no full stop
	dek: '…',                               // 2 or 3 plain sentences in the Core's voice
	assumes: '…',                           // one sentence: what the reader should already know
	minutes: 0                              // Core reading time: see below
}
```

Set `minutes` from the Core's word count (code counts six words a line, so use this command, not a guess):

```bash
node --input-type=module -e "import { sectionsOf } from './src/lib/content/article-markup.ts'; import { readFileSync } from 'node:fs'; const w = sectionsOf(readFileSync('src/lib/content/articles/ID.svelte','utf8')).filter(s => s.depth === 'core').reduce((n, s) => n + s.words, 0); console.log(w, 'words,', Math.round(w / 160), 'min')"
```

Replace `ID` with the lesson id.

## Practice problem (only if the brief asks)

Follow the shape of an existing problem in `src/lib/content/problems.ts` exactly. You need:
- the statement in your own words
- two examples
- a hint
- a `compare` mode
- `fn` names for both languages
- `starter` code via the `py()` and `js()` helpers
- working `solution`s in both languages
- 5 or 6 `tests`
- an `external` link to the well-known original

Run both solutions against every test in Python and Node before adding them. Add the problem id to `practiceFor['<lesson id>']` in catalog.ts.

## The lab (the reviewer builds it)

Do not build Svelte components. In the Core's "Try it" section, put this placeholder where the lab will go:

```svelte
<!-- LAB: <PascalCaseName>: <one line on what it shows>. Spec in the handoff. -->
```

Then write the lab spec in the handoff:
- what the learner does
- the states it shows
- the messages it gives, including for wrong moves
- props (sample data)
- what the "Things to try on purpose" list relies on

Keep it buildable in about 250 lines, in the style of `BinarySearchLab`, `LinkedListLab` or `TreeLab`.

## Escaping, or the build breaks

- In prose, a literal `{` or `}` is `{'{'}` / `{'}'}`. Use `&lt;` and `&gt;` for `<` and `>`.
- Code goes in a JavaScript template literal: `code={\`…\`}`. Inside it:
  - write a backslash as `\\`
  - write a backtick as `` \` ``
  - write `${` as `\${`
  - write a literal `<script` or `</script` as `\x3Cscript` or `\x3C/script`
- Every `<Quiz … />` and `<Code … />` closes with `/>`.
- Tables are `<div class="table-wrap"><table>…</table></div>`, with `<thead>`, `<th scope="col">`, and `<th scope="row">` for the first cell of each body row.

## Checks: all must pass before you hand off

```bash
npm run content:check
```

```bash
npm run check
```

```bash
npm run build
```

Then `npm run art:sheet` and look at your banner. In the handoff, paste the last line of each command's output.

## Hand off

End with the report from `templates/handoff.md`, filled in completely: what you added, the claims ledger, code runs, the lab spec, open questions and the check results. Do not commit.
