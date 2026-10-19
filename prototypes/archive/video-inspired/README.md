# Video-inspired DevCodex concepts

These three paired desktop and phone mockups adapt the supplied `example.mp4` (reviewed at roughly 1.4, 3.8, and 10.2 seconds). The reference's filing cards, ticket edges, thin rules, shelf-like navigation, and generous reading space become a software engineering learning interface. The book-tracking content and bright paper/magenta palette are replaced with DevCodex lessons and quieter, darker colors.

These are **visual concepts**, not interactive Svelte screens. Sample copy and diagram labels in generated images need editorial and accessibility review before implementation. Color values and type choices are proposed design tokens, not yet final selections.

| Direction | Palette | Type direction | Character |
| --- | --- | --- | --- |
| [Cinder & Sage](cinder-and-sage.png) | Graphite `#252923`, warm charcoal cards `#30362F`, sage `#A7B896`, muted copper `#C69376` | Fraunces for expressive headings; Atkinson Hyperlegible for controls and body | Warm, calm, closest to the reference's tactile archive feel |
| [Blue Hour Index](blue-hour-index.png) | Blue slate `#293842`, ink `#202C33`, sea glass `#8BB8B3`, soft ochre `#D1B07A` | Bricolage Grotesque for headings; Newsreader for long lessons | Cooler, more technical, with an especially clear split between navigation and reading |
| [Copper Ledger](copper-ledger.png) | Aubergine graphite `#302B30`, deep plum `#252126`, terracotta `#C99378`, dusty lilac `#B5A5B9` | Newsreader for editorial headings; Atkinson Hyperlegible for body and controls | Richest color personality, more literary |

## Reading and interaction requirements for the selected version

- Keep lesson text on a comfortable reading measure with roomy line height; use an actual font file and selectable text in implementation.
- Give the lesson diagram its own uncluttered stage, with a written explanation immediately nearby.
- Keep navigation and progress visible without competing with the current paragraph.
- Keep buttons and small labels high contrast against dark surfaces; check real color pairs in code rather than relying on image-generation fidelity.
- On phones, preserve the reference's compact card language while making the primary next action easy to reach.
- Honor reduced motion, keyboard focus, text zoom, and narrow screens.

## Recommendation

**Cinder & Sage** is the most balanced starting point for a long-form learning product. **Blue Hour Index** is a good alternative if a cooler, more technical mood feels more like DevCodex. A hybrid could pair Cinder's warmth and type with Blue Hour's clearer content organization.

No direction has been approved for implementation yet.
