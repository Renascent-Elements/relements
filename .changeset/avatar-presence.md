---
"@relements/core": minor
---

Add avatar presence dot (`.re-avatar__presence`) — a status dot pinned to the avatar's bottom-end corner. `data-presence` sets the state: `online`, `away`, `busy` (with a do-not-disturb bar), `offline` (hollow); no attribute renders a neutral "unknown" grey. The filled/hollow/bar shape split survives forced colors via system-color re-establishment, and the docs/tests enforce that the exact state reaches assistive tech as text (sr-only word in the dot for image avatars, status folded into the `aria-label` for `role="img"` initials avatars). CSS-only, extends `avatar.css`.
