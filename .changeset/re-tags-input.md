---
"@relements/core": minor
---

Add the `<re-tags-input>` custom element and a no-reparent **container mode** for `enhanceTagsInput` — the framework-safe ways to use the token editor.

`enhanceTagsInput` on a bare `<input data-re-tags-input>` builds the chip editor by **moving** the input into a wrapper it creates. That's ideal for plain HTML, but a vdom framework (React/Vue/Svelte/Angular) that owns the input can throw `insertBefore … not a child` when it later mutates the input's slot. Two additive, non-breaking forms leave the input where it was rendered:

- **`<re-tags-input>`** — the editor as a light-DOM custom element. It owns its subtree, so a framework treats it as opaque. Author an inner `<input>` (the no-JS fallback); reflected attributes (`name`, `value`, `placeholder`, `disabled`, `max`, `allow-duplicates`, `tone`, `tags-name`) apply to it. Exposes `.values` (read) and `.clear()`, and emits the bubbling `re-tags-change`. Give it an `aria-label` / `aria-labelledby` (it has no `<label>`) so the group is named.
- **Container mode** — put `data-re-tags-input` on a **container** that holds the input; the behavior adopts that element as the `.re-tags-input` group and injects the chips as siblings, never moving the input.

The existing `<input data-re-tags-input>` (input) mode is unchanged.
