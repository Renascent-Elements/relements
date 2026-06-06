---
title: Frameworks
description: Use Relements with React, Vue, Svelte, or Angular.
---

Relements is framework-agnostic: import the stylesheet once, then write native
HTML with `.re-*` classes and `data-*` attributes. The same API works in every
framework. Pick yours:

- [React](/relements/frameworks/react/)
- [Vue](/relements/frameworks/vue/)
- [Svelte](/relements/frameworks/svelte/)
- [Angular](/relements/frameworks/angular/)

Each example renders the same flow — a `.re-button`, a tabs region enhanced by
`enhanceTabs()`, and a `<re-tabs>` custom element whose `re-change` event drives
an `<output>`. The DOM, class names, `--re-*` tokens, and event contract are
identical everywhere; only the framework glue differs. Browse the source on
[GitHub](https://github.com/Renascent-Elements/relements/tree/main/docs/examples/frameworks).
