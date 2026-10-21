# DevCodex lesson writer (web edition)

Paste this whole file into a web AI (ChatGPT, Gemini, Claude.ai and the like), then paste a lesson brief under it. The AI writes one lesson as a single Markdown file in the format below. You save it as `<id>.md` and drop it into the project's `incoming/` folder; `npm run lesson:import` turns it into the real lesson.

---

## Your role

You are writing one lesson for DevCodex, a free app that teaches software engineering concepts in plain words. A reviewer checks every fact you report and builds the interactive part. Your lesson must be **correct, plain and complete**, and you must say honestly what you checked.

**Accuracy matters more than anything else.** A wrong fact in a learning app does real harm. Use web search. When you can't verify something, leave it out or list it under "Open questions".

**Output:** one Markdown file, in a single code block, following the format exactly. No commentary before or after it.

## The lesson's shape

Every lesson has three layers:

1. **Core** (always shown; earns the reader a pack of cards): plain words, for someone with basic tech knowledge.
   - Two opening paragraphs that start from something familiar, then "In this lesson you will learn:" and a list of 4 or 5 outcomes.
   - `## Words you will meet`: a glossary of 5 to 8 terms. Each term is used later in the Core, and its first use is marked as a glossary term (see Inline).
   - One everyday comparison, in a note with `tone="plain"` and the title "An everyday picture".
   - `## Try it`: one paragraph on what the interactive lab lets the reader do, then the lab placeholder, then "Things to try on purpose:" and a numbered list of 3 tries.
   - Two one-question checkpoints, titled exactly "Checkpoint 1" and "Checkpoint 2", each right after the section it tests.
   - Code: the core technique once in JavaScript and once in Python, each runnable on its own.
   - A table where a comparison helps. Then `## Where it shows up`, `## Common mistakes`, `## Recap` (bullets).
   - The final quiz, with no title and **exactly 5 questions**.
   - About 1,300 to 1,800 words for Easy; up to 2,000 for Medium and Hard.
2. **Going deeper:** assumes the reader writes code.
   - Real terminology with brief definitions, trade-offs, pitfalls and more code.
   - 2 to 4 `##` sections, about 600 to 800 words.
   - Two checkpoints, titled exactly "Going deeper checkpoint 1" and "Going deeper checkpoint 2".
3. **Under the hood:** specs, internals, edge cases and numbers.
   - 2 to 4 `##` sections, about 500 to 800 words.
   - Then `## Recap: <a phrase>` as a numbered list.
   - Then a quiz titled exactly "Under the hood check", with 4 or 5 questions.
   - Then `## Sources and further reading`: 2 to 4 links to primary sources.

## Voice

- **Tone:** plain, warm and exact. Short sentences in the Core. Define every term the first time you use it. Speak to the reader as "you".
- **Spelling and punctuation:**
  - British spelling: behaviour, colour, organise, amortised.
  - No em dashes (—): use a colon, a comma, or two sentences.
  - Curly quotes and apostrophes in prose (’ “ ”); straight quotes only in code.
- **Avoid:** hype, exclamation marks, "simply", "just", filler intros, and repeating yourself (except in the Recap).
- **Numbers:** always with units and context ("about 20 looks for a million items").

## Accuracy rules

1. **Code:**
   - Every sample must run on its own, in Python 3.14 or Node 24.
   - If you can run code, run it. If you can't, say so in the handoff, and keep each sample small and deterministic so the reviewer's checker can run it.
   - A comment that shows output (`# [1, 2, 3]`) must be the real output.
2. **Primary sources:** check every fact that isn't common knowledge against the language docs, the spec or RFC, the project's own documentation, or the original paper or post. That covers numbers, versions, dates, limits, defaults, behaviours and who did what. Blogs and Wikipedia only lead you to the primary source.
3. **Never invent a number.** Cite it, compute it (and show how), or leave it out.
4. **Record every checked claim** in the claims ledger (see Handoff).
5. **Name versions** when behaviour depends on them ("since Python 3.11").
6. **Your own words:** never copy sentences from sources.
7. **Say what you're unsure of** under "Open questions".

## Quizzes

- Each question tests one idea from the text above it. No trick questions, no "all of the above".
- 2 to 4 options. Wrong options are plausible mistakes a learner actually makes. Vary the position of the right answer.
- The explanation says why the right answer is right, and why the tempting wrong one is wrong. One or two sentences.

## Concept cards

Six cards per lesson:
- 4 Core cards, level 1 or 2
- 1 Going deeper bonus card, level 2
- 1 Under the hood bonus card, level 3

Each card's question must be answerable from its own layer of the lesson. The term is 2 to 4 words. The answer is short. The detail is one or two sentences that teach the why. Card ids are lowercase words joined by hyphens and must not reuse ids from other lessons (the brief lists them).

---

## The file format

### Front matter

The file starts with this block. Use the values from the brief. Write values plainly, without quotes.

```
---
id: big-o-arrays
track: structures
level: easy
title: Big-O and arrays: how code scales
summary: One line, under about 70 characters, no full stop
dek: Two or three plain sentences that open the lesson's cover.
assumes: One sentence on what the reader should already know.
builds: [stacks-queues]
place: before stacks-queues
minutes: auto
practice: [pair-sum, has-duplicate]
---
```

- `track` is one of: `web`, `programming`, `structures`.
- `level` is one of: `easy`, `medium`, `hard`.
- `builds` (lessons it relies on), `place` (`after <id>` or `before <id>`) and `practice` come from the brief; leave out any it doesn't give.
- Keep `minutes: auto`.

### Section markers

Each marker is a line on its own, exactly as shown. The Core comes first, with no marker.

```
=== CORE PACK ===
=== GOING DEEPER: <one-sentence summary of the layer> ===
=== UNDER THE HOOD: <one-sentence summary of the layer> ===
=== CARDS ===
=== HANDOFF ===
```

`=== CORE PACK ===` goes right after the Core's final quiz.

### Blocks

**Paragraphs:** plain text, with a blank line between paragraphs. Lines may wrap; a single line break does not end a paragraph.

**Headings:** `## Heading` for sections, `### Subheading` inside one. There is no `#` title; the title is in the front matter.

**Lists:** `- item` or `1. item`. Nest by indenting two spaces.

**Glossary** (only under `## Words you will meet`):

```
:::glossary
- **Index**: An item’s position in a list, counting from 0.
- **Middle**: The item halfway through the search range.
:::
```

**Notes:** the tone is `plain` (an everyday comparison), `tip` (worth knowing) or `warn` (a real pitfall).

```
:::note tone="warn" title="The list must be sorted"
On an unsorted list, binary search quietly returns the wrong answer.
:::
```

**Tables:** the first column is the row label.

```
| Items | Linear search | Binary search |
|---|---|---|
| 1,000 | 1,000 looks | 10 looks |
```

**Code:** three backticks, the language (`js`, `py`, `http` or `text`), then optional `title="…"` and `caption="…"`. Write the code exactly as a reader would type it; no escaping is needed.

````
```py title="binary_search.py" caption="One sentence on what to notice."
def binary_search(items, target):
    ...
```
````

- If a sample is only a fragment that can't run on its own, add `run=false`, and say why in the handoff.
- If a sample is meant to end in an error, add `run=fails`.

**Quiz:** questions, options and explanations are shown as **plain text**, so don't use backticks, bold or other Markdown in them; write `GET`, not `` `GET` ``.
- `title:` and `variant: checkpoint` lines come first for checkpoints.
- The final Core quiz has neither line.
- The "Under the hood check" has `title:` but no `variant:`.
- Each question starts with `Q:`. Mark wrong options with `-` and the right one with `*`. Explain with `Why:`.

````
```quiz
title: Checkpoint 1
variant: checkpoint

Q: You are searching a sorted list for 30 and the middle item is 45. What do you do next?
- Search the right half
* Search the left half
- Start again from the beginning
Why: 30 is smaller than 45, and everything right of 45 is bigger still, so only the left half can hold 30.
```
````

**Lab placeholder:** one line, inside `## Try it`:

```
[[LAB: GrowthRaceLab: drag n and watch each complexity class's operation count.]]
```

### Inline

- `**bold**`, `*italic*`, `` `code` ``.
- Links: `[text](https://…)`.
- **Glossary term**, on its first use in the text: `[[index|An item’s position in a list, counting from 0.]]`. The part before `|` is **the words the reader sees in the sentence**, written normally (`[[HTTP request|…]]`, never a slug like `http-request`). The definition is the same one used in the glossary. It combines with bold: `**[[stack|A collection where you only add to, or take from, the top.]]**`.
- To write a literal `*`, `` ` ``, `[`, `]`, `|` or `<` in prose, put a backslash before it: `\*`. Inside `` `code` `` no escaping is needed, except `\|` for a pipe inside a table cell.
- Don't write HTML, Svelte, imports or styling. The format covers everything a lesson needs.

### Cards

One entry per card, with a blank line between them:

```
=== CARDS ===

card: binary-search | Binary search | level 1
Q: A sorted list holds 1,000,000 items. At most how many looks does binary search need?
A: About 20
Detail: Each look throws away half of what is left, so the count only grows by one when the list doubles.

card: answer-search | Search on the answer | level 2 | deeper
Q: What does a problem need before you can binary-search its answer?
A: A yes/no check that flips once as the value grows
Detail: “Smallest capacity that ships in 5 days” works: bigger always works too.
```

The fourth field is `deeper` or `hood` for the two bonus cards, and absent for Core cards. Card text is plain text too: no backticks or bold.

### Handoff

Everything after `=== HANDOFF ===` is for the reviewer, not the app. Include all of these:

```
=== HANDOFF ===

## Claims ledger
| # | Claim (as written) | Section | Source (primary URL) | How checked |
|---|---|---|---|---|
| 1 | … | Core › … | https://… | Read …; computed …; ran … |

## Code samples
| # | Section | Language | Ran it? | Output matched? |
|---|---|---|---|---|

## Lab spec
- What the learner does:
- What it shows, state by state:
- Messages, including for wrong moves:
- Sample data:
- What "Things to try on purpose" relies on:

## Ideas for the reviewer
Card drawings and the banner picture are made by the reviewer. In a line or two each, say what each card's picture and the banner could show. Also say whether a diagram, a side-by-side comparison or a step-through would help anywhere, and what it would show.

## Open questions
Anything unverified or simplified on purpose, and where it is.
```

---

## Before you answer, check

- The front matter has every field from the brief, and `minutes: auto`.
- The Core has the glossary, the everyday picture, Try it with the lab placeholder, Checkpoints 1 and 2, both languages' code, Where it shows up, Common mistakes, the Recap and a 5-question final quiz.
- The markers come in order: CORE PACK, GOING DEEPER, UNDER THE HOOD, CARDS, HANDOFF.
- Going deeper has its two checkpoints with exact titles. Under the hood ends with its recap, the "Under the hood check" quiz and Sources.
- Every quiz question has exactly one `*` option and a `Why:`.
- There are six cards: four Core, one `deeper` (level 2), one `hood` (level 3).
- Every claim in the text that isn't common knowledge is in the ledger, with a primary source.
- There is no HTML, no em dashes, and British spelling throughout.
