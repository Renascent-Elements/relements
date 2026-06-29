# Screen-reader test plan

Relements' automated suite (Playwright + axe) verifies the **mechanism** of
assistive-technology (AT) support: roles are present, a live region exists and
its text mutates, `aria-*` flips on interaction. It cannot verify what a screen
reader actually **says** — axe is blind to presentation-only state, and a live
region that's wired correctly can still announce the wrong thing, at the wrong
time, or be swallowed by the AT. PR #111 hardened the dynamic behaviors and noted
this gap explicitly: _"live-region announcements are asserted at the mechanism
level only; real SR speech still needs a manual NVDA/VoiceOver pass."_

This document is that pass, turned into a checklist. Every **Expect** below is
derived from the component's real ARIA in `src/` — not from how it ought to work
— so a tester can confirm the announcement against a stated expectation instead
of exploring blind. It also doubles as documentation of each component's intended
AT behavior.

## How to run

Test against the example pages (the same corpus Playwright uses), served locally:

```bash
pnpm build:examples        # only needed for the docs site / framework apps
pnpm exec http-server . -p 4173 -s -c-1
# then open http://localhost:4173/docs/examples/<component>.html
```

**Matrix** — cover at least one screen reader per engine; AT behavior differs by
pairing, so a pass on one is not a pass on all:

| Screen reader | Browser | Platform | Priority          |
| ------------- | ------- | -------- | ----------------- |
| NVDA          | Firefox | Windows  | primary           |
| NVDA          | Chrome  | Windows  | primary           |
| VoiceOver     | Safari  | macOS    | primary           |
| VoiceOver     | Safari  | iOS      | secondary (touch) |
| JAWS          | Chrome  | Windows  | secondary         |

**Two environment passes** that automation can't reach the same way:

- **Forced colors / High Contrast Mode** (Windows): several components convey
  selected/current/pressed state with a background that the UA flattens in HCM;
  they re-establish it with a `Highlight` ring/fill. Our `forced-colors` Playwright
  tests are **Chromium-only**, and the carousel's Rung-C controls only render on
  Firefox/WebKit — so the carousel HCM story is **not machine-asserted at all**.
  Verify it here, in real HCM.
- **JS disabled** — `dialog`, `accordion`, `tree`, `steps`, `otp`, `range`,
  `rating`, `file-picker`, `number-stepper`, `password-toggle`, `combobox` (base
  tier), and every `<re-*>` element have a documented native fallback. Do a quick
  SR pass with JavaScript off to confirm the no-JS baseline still announces.

### Reading an entry

- **Expect** describes the **semantic** announcement — role + name + state +
  position. Exact wording is the screen reader's to choose (NVDA "checked",
  VoiceOver "selected, checkbox"); verify the _content_ reached you, not a verbatim
  string. Quoted text in `code` is the literal string the component writes to a
  live region (from source) — that part _is_ verbatim.
- **Watch** lists the realistic failure: a missing announcement, a double-speak, a
  state conveyed only by colour, a focus drop.
- Log results in the [template](#results-log) at the bottom.

### Two patterns worth knowing before you start

- **Live regions only announce on _change_.** A `role="status"`/`alert`/`aria-live`
  element is silent on page load; it speaks when its text mutates or a node is
  inserted. For the static `alert`/`banner` demos you must trigger a runtime
  insertion to hear anything.
- **Focus model varies.** Only `command-palette` and the enhanced `combobox` use
  `aria-activedescendant` (DOM focus stays in the input; options are "virtually"
  focused). `tabs` and `toolbar` use **roving tabindex**; `menu-button` and
  `context-menu` **move real focus**. Everything else rides **native focus order**.
  Knowing which tells you where to listen for the announcement.

---

## Tier 1 — Dynamic components with live regions

These inject a polite/assertive live region with an exact text template. They are
the highest-value targets: the announcement is bespoke, timing-sensitive, and
invisible to axe.

### multiselect — `multiselect.html`

Native `<details>` + a `<fieldset>` of real checkboxes; a polite
`<span class="re-sr-only" aria-live="polite">` sibling announces the count.

- **Test:** open the disclosure; check "React".
  **Expect:** the checkbox announces `"React, checkbox, checked"`, then the live
  region announces `"1 selected"` (the count — not the names).
- **Test:** check a second option.
  **Expect:** `"2 selected"`. (The visible summary may abbreviate to "+1 more";
  the live region always speaks the count.)
- **Test:** in a `required` group, uncheck everything and submit the form.
  **Expect:** focus jumps to the summary, which now reads as **invalid**
  (`aria-invalid`), and a `role="alert"` announces the authored message
  (e.g. `"Pick at least one option."`).
- **Test:** press Escape inside the open panel.
  **Expect:** panel collapses, focus returns to the summary (announced collapsed).
- **Watch:** the count and the per-checkbox "checked" are two separate utterances —
  confirm both reach you. Invalid state in HCM relies on the visible message, not
  the (flattened) danger border.

### command-palette — `command-palette.html`

Modal `<dialog>`; the input becomes a `role="combobox"`, the list a
`role="listbox"`, options get `aria-selected`, and a `role="status"` line
announces result counts. **Focus never leaves the input** (activedescendant).

- **Test:** open the palette (trigger or ⌘K/Ctrl+K).
  **Expect:** `"Search commands, combobox, expanded"`. **No count yet** — the
  status line is deliberately silent on open.
- **Test:** type a query that matches (e.g. "set").
  **Expect:** the first match auto-activates — `"Go to Settings, option, selected,
1 of N"` (via activedescendant) — and the status line announces `"1 result"` /
  `"5 results"`.
- **Test:** type a query that matches nothing (e.g. "zzz").
  **Expect:** status announces `"No results for "zzz"."` (curly quotes) and the
  combobox becomes `collapsed` (`aria-expanded="false"`).
- **Test:** ArrowDown / ArrowUp / Home / End.
  **Expect:** active option changes — `"Create document, option, selected"` — while
  DOM focus stays in the input. Enter activates; Escape closes and **returns focus
  to the trigger**.
- **Watch:** the `aria-disabled` option must read as dimmed/unavailable and not
  activate. The footer hint row is `aria-hidden` — SR users get no keyboard hint
  from it. Confirm the active row is distinguishable in HCM (`Highlight`).

### carousel — `carousel.html`

A polite `<div class="re-sr-only" aria-live="polite">` announces the settled slide.
**Critical:** the JS controls + live region are **Rung C only — Firefox/WebKit**.
On Chromium the browser draws native CSS-Carousel controls and there is **no live
region**. Run this one on **Firefox and Safari**.

- **Test:** Tab to the track.
  **Expect:** `"Featured photos, carousel, group"` (role description "carousel"),
  a focusable scroll region.
- **Test:** press Next (or arrow-scroll the track) and let it settle (~150ms debounce).
  **Expect:** live region announces `"Forest trail in autumn (2 of 4)"` (or
  `"Slide 2 of 4"` when a slide has no label). The active dot exposes
  `aria-current="true"`.
- **Test:** reach the last slide.
  **Expect:** the Next button reads **dimmed/unavailable** (`aria-disabled`, _not_
  native `disabled` — it stays focusable).
- **Test:** on an autoplaying carousel, press Pause.
  **Expect:** the button name becomes `"Play automatic slideshow"` and the live
  region announces the current slide. **During** autoplay, slide changes are
  **not** announced (by design — avoids a chatty region).
- **Watch:** play/pause is conveyed only by the button's swapping `aria-label`
  (no `aria-pressed`) — confirm the new name is re-announced on toggle. Slides
  themselves have no `aria-setsize`/`posinset`; position comes only from the live
  region.

### tags-input — `tags-input.html`

A polite live region announces add/remove/reject; chips are a `role="list"` of
`role="listitem"` via `display:contents`.

- **Test:** type "react" and press Enter.
  **Expect:** the editor stays focused; live region announces `"Added react"`. The
  chip, navigated later, reads `"react, list item"` within `"list, N items"`.
- **Test:** press Backspace in the empty editor.
  **Expect:** the last chip is removed, `"Removed eng"`, focus stays in the editor.
- **Test:** click a chip's × button.
  **Expect:** `"Removed design"`; focus moves to the previous chip's remove button
  (`"Remove css, button"`) or back to the editor.
- **Test:** add a duplicate, then exceed `max`.
  **Expect:** `"react is already added"`; then `"Maximum 3 tags reached"`.
- **Watch:** max/invalid is announced **only** by the transient message — there is
  **no persistent `aria-invalid`**, so a user who tabs away and back gets no
  standing "invalid" cue (a real 1.3.1/4.1.2 gap to confirm). Verify `"list, N
items"` actually announces (some engines drop list semantics under
  `display:contents`). Confirm the × isn't double-read with its `aria-label`.

### file-picker — `file-picker.html`

A polite `role="status"` announces the selection; the real `<input type="file">`
carries name/disabled/required.

- **Test:** pick one file.
  **Expect:** `"report.pdf selected"`.
- **Test:** pick or drop several.
  **Expect:** `"3 files selected"`.
- **Test:** clear the selection.
  **Expect:** `"Selection cleared"`.
- **Test:** drop too many / too large / wrong type.
  **Expect:** the input becomes `aria-invalid` (reads "invalid" on next focus).
- **Watch:** there is **no programmatically associated reason** for the invalid
  state — the user hears "invalid" but not _why_ (the reason is only in the
  `re-error` event detail + border colour). Confirm whether your usage wires an
  `aria-describedby` error.

### toast — `toast.html` (and `re-toast.html`)

The toast list is the polite live region; each toast's role depends on tone.

- **Test:** trigger a default/success/warning toast.
  **Expect:** the message text is announced **politely** (`role="status"`), no focus
  change.
- **Test:** trigger a `danger` toast.
  **Expect:** the message is announced **assertively** (`role="alert"`), interrupting
  current speech.
- **Test:** dismiss a toast.
  **Expect:** **silence** — `aria-relevant="additions"` means removals aren't
  announced (by design).
- **Watch:** tone (success/warning/danger) is conveyed **only by colour** — the
  body has no "Success"/"Error" prefix. Danger gets urgency from `role="alert"`,
  but success vs warning vs default are indistinguishable to AT. Confirm the
  **message wording** carries the meaning. Auto-dismiss can race a SR user reading
  the toast (the demo uses `duration: 0`).

---

## Tier 2 — Interactive widgets (state via native control / roving focus)

No live region — state reaches AT through roles, `aria-*`, and focus. Verify the
announcement on each interaction.

### dialog — `dialog.html`

- **Test:** open a modal.
  **Expect:** `"<title>, dialog"` (name via `aria-labelledby` the title); for a
  confirmation use `role="alertdialog"` → `"…, alert dialog"`. Focus lands on the
  first focusable / `autofocus` target.
- **Test:** Tab through; press Escape; submit a `method="dialog"` form.
  **Expect:** focus is **trapped** while open; Escape dismisses (unless
  `data-re-dialog-no-dismiss`); on close, focus **returns to the trigger**.
- **Watch:** a dialog with no `aria-labelledby`/`aria-label` is unnamed — confirm
  every dialog has a name. A `no-dismiss` dialog must still expose an explicit
  Cancel/close control.

### tabs — `tabs.html` (and `re-tabs.html`)

Roving tabindex, **automatic activation** (arrow selects).

- **Test:** focus a tab, press ArrowRight / End.
  **Expect:** `"Security, tab, 2 of 3, selected"` — selection follows focus.
- **Test:** Tab again to enter the panel.
  **Expect:** `"<panel>, tab panel"`, named by its tab. Inactive panels are
  `hidden` (absent from the tree).
- **Watch:** selected state is real `aria-selected`, not the underline colour.

### menu-button — `menu-button.html` (and `re-menu.html`)

`aria-expanded` on the trigger; **real focus** moves into the menu.

- **Test:** activate the trigger (click / ArrowDown / Enter).
  **Expect:** `"Actions, menu button, expanded"`, then focus on the first item
  `"Rename, menu item, 1 of 3"` (separators not counted). ArrowUp on the trigger
  opens onto the **last** item.
- **Test:** type a letter (typeahead); press Escape.
  **Expect:** focus jumps to the matching item; Escape closes and **returns focus
  to the trigger** (`collapsed`).
- **Watch:** a disabled item must use `aria-disabled`/native `disabled` (announced
  "dimmed"), never colour alone.

### combobox (enhanced) — `combobox.html`

`role="combobox"` + `aria-activedescendant`; **no live region**.

- **Test:** focus the enhanced input; type to filter; ArrowDown.
  **Expect:** `"Time zone, combobox, collapsed"` → `expanded` on results →
  `"Europe/Budapest, option, selected, 1 of 3"`. Enter commits (fires `input` +
  `change`); Escape keeps the typed value.
- **Watch:** filtering to **zero** results just closes the popover — **silence**,
  no "no results" cue (unlike command-palette). Confirm the active highlight shows
  in HCM. The **base tier** (native `<datalist>`) is entirely browser-dependent.

### context-menu — `context-menu.html`

Real focus into a `role="menu"`; **no live region**; **no `aria-expanded`** on the
trigger.

- **Test:** focus the region, press the Menu key (or Shift+F10).
  **Expect:** the menu appears and focus lands on `"Open, menu item, 1 of 4"`.
- **Test:** Arrow/Home/End/typeahead; Escape or Tab.
  **Expect:** focus moves between items (separator skipped); Escape/Tab close and
  **return focus to the region**.
- **Watch:** open is conveyed only by the menu entering the tree + focus moving in
  (no "expanded" state) — confirm it's perceivable. A selection that keeps the menu
  open (consumer `preventDefault`) has no announcement by design.

### toolbar — `toolbar.html`

`role="toolbar"`, roving tabindex (one Tab stop), `aria-pressed` toggles.

- **Test:** Tab into the toolbar; ArrowRight/Left (Home/End clamp, no wrap).
  **Expect:** `"Text formatting, toolbar"`, then `"Bold, toggle button, pressed"` →
  `"Italic, toggle button, not pressed"`.
- **Test:** reach a disabled-but-discoverable control; open the hosted menu.
  **Expect:** `"Center, button, dimmed"` (`aria-disabled`, still focusable);
  `"More, menu button, collapsed"` → ArrowDown opens it.
- **Watch:** pressed state is `aria-pressed` (re-established as `Highlight` fill in
  HCM), not colour alone.

### rating — `rating.html`

A native radio group (high→low DOM order, RTL-reversed visually).

- **Test:** Tab to the group; Arrow within.
  **Expect:** `"Rate your experience, group"`, then a radio, e.g. `"No rating,
radio button, checked"` → `"1 star, radio button, checked"` (singular "1 star").
- **Test:** the read-only display variant.
  **Expect:** `"Rated 3.5 out of 5, image"` (`role="img"` carries the value; stars
  are decorative).
- **Watch:** confirm the unselected state has the real "No rating" option.

### range (two-thumb) — `range.html`

Two native sliders in a `<fieldset>`; the combined output is `aria-hidden`.

- **Test:** Tab to each thumb; Arrow/Page/Home/End.
  **Expect:** `"Minimum price, slider, 200, minimum 0, maximum 1000"`; the second
  thumb `"Maximum price, slider, 700"`. Values **clamp** so thumbs can't cross, and
  the announced `valuenow` stays honest (e.g. "690", never a crossed value).
- **Watch:** AT relies on the per-thumb values; the "200 – 700" readout is
  deliberately hidden (no double-speak).

### number-stepper — `number-stepper.html`

Native `<input type="number">` (spinbutton); +/- buttons are `tabindex="-1"`.

- **Test:** focus the input; ArrowUp/Down.
  **Expect:** `"Quantity, spin button, 1, minimum 0, maximum 10"` → `"2"`.
- **Watch:** at min/max the +/- buttons use real `disabled` (not colour). The
  buttons are intentionally keyboard-unreachable; the input is the control.

### otp — `otp.html`

A **single** native text input styled to look segmented (preserves paste / SMS
autofill). `autocomplete="one-time-code"`.

- **Test:** focus and type / paste a full code.
  **Expect:** announced as one `"One-time code, edit text"` field with its hint;
  the "cells" are purely visual and convey nothing (correct — it's one field).
- **Watch:** invalid is `aria-invalid`/`:user-invalid` (not colour). Confirm a
  pasted full code lands in the one field.

### password-toggle — `password-toggle.html`

A real toggle `<button aria-pressed>` with a **stable** name "Show password".

- **Test:** Tab to the toggle; Enter/Space.
  **Expect:** `"Show password, toggle button, not pressed"` → `"…, pressed"`. The
  **name stays "Show password"** (pressed conveys revealed); focus returns into the
  field at the prior caret.
- **Test:** with JS disabled.
  **Expect:** the button is `hidden` — **no dead control announced**.
- **Watch:** some SRs announce `aria-pressed` changes quietly; confirm the state is
  conveyed.

### tree — `tree.html` · steps — `steps.html` · accordion — `accordion.html` / `disclosure.html`

Zero-JS, native semantics — verify the no-JS baseline.

- **tree:** a `<nav aria-label>` of `<details>` branches + `<a>` leaves, each `<ul>`
  is `role="list"`. **Expect** branches as native disclosures ("collapsed/expanded"),
  the current leaf as `"Select, current page, link"` (`aria-current="page"`).
  **Watch:** it is deliberately **not** an ARIA `tree` — do **not** expect "level N
  / N of M". Position/level is not announced.
- **steps:** an `<ol>` (ordered-list position kept). **Expect** the current step via
  `aria-current="step"`; completed/upcoming via authored `.re-sr-only` "Completed: /
  Upcoming:" prefixes. **Watch:** if a consumer drops those sr-only spans, status
  becomes glyph/colour-only — confirm the spans are present.
- **accordion:** native `<details name>` (exclusive). **Expect** "collapsed/expanded";
  opening one collapses its sibling. **Watch:** native `<details>` announcement
  varies by SR/browser — verify on each.

---

## Tier 3 — Stateful CSS over native controls

The AT story comes from the **native element** (checkbox/radio/`<details>`), not
added ARIA. Spot-check that the native state announces and that nothing is
colour-only.

- **switch** (`switch.html`) — native checkbox + `role="switch"`. **Expect** "on/off".
- **toggle-group** (`toggle-group.html`) — checkboxes in a `<fieldset aria-label>`,
  multi-select. **Expect** group name + per-item "checked"; icon-only members carry
  their own `aria-label`.
- **segmented** (`segmented.html`) — radios in a `<fieldset>`, single-select. **Expect**
  arrow-roving + "selected" from the native radio.
- **button-group** (`button-group.html`) — `role="group"`; toggle members need
  author `aria-pressed`, disabled needs `aria-disabled`. **Watch:** the component
  does **not** add these — confirm they're in the markup; the pressed fill has **no
  forced-colors block**, so it's backed only by `aria-pressed`.
- **breadcrumb** (`breadcrumb.html`) — `<nav aria-label="Breadcrumb">`; current via
  `aria-current="page"`; `/` separators are CSS pseudo-content (not announced).
- **pagination** (`pagination.html`) — `<nav aria-label="Pagination">`; `aria-current
="page"`; disabled prev/next via `aria-disabled`; ellipsis `aria-hidden`.
- **alert** (`alert.html`) — `role="status"` (polite) / `role="alert"` (danger,
  assertive). **Test by injecting at runtime** — static alerts don't announce on
  load. **Watch:** tone is colour-only; severity must be in the text.
- **banner** (`banner.html`) — a `role="region"` **landmark**, **not** a live region —
  content is not auto-announced. **Watch:** tone colour-only.
- **tooltip** (`tooltip.html`) — `role="tooltip"` linked by `aria-describedby`, so the
  description reaches AT on trigger focus even while visually hidden. **Watch:** the
  CSS-only tooltip is **not Dismissable** (no Escape) — a WCAG 1.4.13 gap to note.
- **table** (`table.html`) — native table; the sticky-header demo wraps the scroller
  as a focusable `role="region"`. **Watch:** `<th>` cells lack `scope` — confirm
  row/column header association announces on complex tables.
- **description-list** (`description-list.html`) — native `<dl>`/`<dt>`/`<dd>`. **Watch:**
  `dl` term/definition pairing support varies across SRs — confirm it's announced.

---

## Tier 4 — Custom elements

Light-DOM elements that wrap a behavior and add no new ARIA — the AT story is the
underlying pattern's (test as the Tier 1/2 entry above). What's **unique** here is
the **upgrade / late-projection lifecycle**: confirm the announcement is correct
both right after the element upgrades and after a framework projects children late.

- **re-tabs** — wraps `enhanceTabs`; `MutationObserver` handles late children.
  Verify selection still announces "selected", roving tabindex intact, inactive
  panels still `hidden`, and **no double-wiring** after a move/reconnect (selection
  announces once). Fires `re-change`.
- **re-toast** — **builds** the live region (`role="region"` "Notifications" + an
  `aria-live` list). Verify the region exists named "Notifications" **before** any
  toast, then that `.show()` announces (danger → assertive).
- **re-menu** — wraps `enhanceMenuButton`; **no MutationObserver** (children must be
  present at connect). Verify trigger `aria-haspopup`+`aria-expanded`, focus into
  the menu, focus return on Escape/select.
- **re-popover** — adds `popover` on connect + native invoker. Verify the
  invoker/`:popover-open` relationship works **after upgrade** (a pre-upgrade
  trigger click), and Esc/light-dismiss. The panel has **no name** of its own —
  content is read on open.
- **re-file-picker** — reflects `name/disabled/multiple/accept/required` onto the
  inner `<input type="file">`. Verify after upgrade + late projection that the input
  keeps its `aria-label`, reflected `disabled`/`required` reach AT, and the
  `role="status"` region announces selection/clear.
- **re-tags-input** — container mode (the element **is** the group; the `<input>` is
  not reparented). The **group's name must come from `aria-label`/`aria-labelledby`
  on the element** (no `<label>`). Verify the name announces, add/remove announces
  (behavior-owned live region), and **no focus loss** on a framework re-render.

---

## Tier 5 — Static components (quick scan)

One read each — confirm the role + name announce; nothing dynamic.

| Component          | Expect (role · name)                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| card               | `article` (interactive variant: `link` named by content)                                                               |
| avatar             | `image`, name from `aria-label` / `<img alt>`                                                                          |
| avatar-group       | `group` named e.g. "5 collaborators"; **the "+2" overflow is `aria-hidden`** — the count lives only in the group label |
| separator          | native `separator`; labeled variant reads its `<span>` ("OR")                                                          |
| stat               | text (label/value/description); trend exposed via `.re-sr-only` "Trending up" — **not** colour-only                    |
| timeline           | ordered `list` (position kept); current item `aria-current="step"`                                                     |
| kbd / code         | read as text; code block `figure` named by its `<figcaption>`                                                          |
| skeleton / spinner | wrap as `role="status"` `aria-label="Loading"` (placeholders `aria-hidden`)                                            |
| badge              | **no role/name** — read as text only; **tone is colour-only** (a danger count reads just "3")                          |
| link               | native `link`; **external variant has no "opens in new tab" cue** (glyph is CSS-only)                                  |

---

## Known WCAG 1.3.1 / 1.4.1 watch-items (meaning by colour or glyph only)

Confirm AT conveys these — or that the meaning is carried by text:

- **Tone by colour, no text/ARIA backing:** `alert`, `banner`, `badge`, `toast`
  tones, `popover` `data-tone`. Severity must live in the wording.
- **`tags-input`** invalid/max — transient live message only, no persistent
  `aria-invalid`.
- **`file-picker`** `aria-invalid` with **no associated reason** message.
- **`combobox`** (enhanced) — zero-results is **silent** (no "no results").
- **`steps`** completion depends on consumer-supplied `.re-sr-only` "Completed:/
  Upcoming:" spans.
- **`button-group`** pressed members — backed only by author `aria-pressed`, and
  **no forced-colors block** (HCM users lose the visual pressed fill).
- **`link`** external — no programmatic "opens in new tab".
- **`table`** — missing `scope` on complex headers.
- **Forced-colors highlights to verify in real HCM:** `command-palette`, `combobox`,
  `carousel` (FF/WebKit only — not machine-tested), `tabs`, `toolbar`, `rating`,
  `pagination`, `tree`, `switch`/`segmented`/`toggle-group` selection.

---

## Results log

Copy per testing session:

```
Component:
AT + browser + OS:
Date / tester:

[ ] Name announced correctly
[ ] State changes announced (per the Expect entries)
[ ] Live-region text matches the documented template
[ ] Focus lands / returns where expected
[ ] Meaning not lost in forced-colors (if applicable)
[ ] No-JS baseline OK (if applicable)

Notes / deviations:
```

Found a real deviation from an **Expect**? It's a bug — open an issue referencing
this plan and the component, with the AT/browser pairing. If an **Expect** itself
is wrong, the component's ARIA changed — fix this doc in the same PR.
