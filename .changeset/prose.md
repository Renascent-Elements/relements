---
"@relements/core": minor
---

Add prose (`.re-prose`) — typographic flow for rendered content (markdown output, CMS bodies, articles). Restores the vertical rhythm reset.css zeroes and styles the flow-only elements base.css doesn't cover: blockquote (logical start border + byline `footer`/`cite`), figure/figcaption, lists, fluid media, bare tables, and bare `dl`. Line length caps at a readable `65ch` measure. All selectors are wrapped in `:where()` so prose adds zero specificity — components dropped inside the flow keep their own look. CSS-only.
