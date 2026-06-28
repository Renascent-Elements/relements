<script>
  import { onMount } from "svelte";
  import { enhanceDialog } from "@relements/core/behaviors/dialog";
  import { enhanceCommandPalette } from "@relements/core/behaviors/command-palette";

  let wrap;
  let renders = $state(0);

  onMount(() => {
    // enhanceDialog wires #cmd-open → #cmdk; enhanceCommandPalette applies
    // combobox/listbox ARIA and injects an sr-only status announcer as a sibling
    // of the list (additive — it never moves author DOM).
    const dialog = enhanceDialog(wrap);
    const cmd = enhanceCommandPalette(wrap);
    return () => {
      dialog.destroy();
      cmd.destroy();
    };
  });
</script>

<section id="cmd-wrap" aria-labelledby="cmd-h" bind:this={wrap}>
  <h2 id="cmd-h">enhanceCommandPalette</h2>
  <p>
    <button id="cmd-rerender" type="button" onclick={() => renders++}>Re-render</button>
    <output id="cmd-renders">{renders}</output> renders
  </p>
  <button
    id="cmd-open"
    type="button"
    class="re-button"
    data-re-dialog-trigger
    data-re-dialog-target="cmdk">Search</button
  >
  <dialog
    id="cmdk"
    class="re-dialog re-command-palette"
    aria-label="Commands"
    data-re-dialog-close-on-backdrop
    data-re-command-palette
  >
    <form class="re-command-palette__search" role="search" method="dialog">
      <input
        type="search"
        class="re-command-palette__input"
        id="cmd-input"
        autocomplete="off"
        aria-label="Search commands"
      />
      <button type="submit" class="re-sr-only" data-re-dialog-close>Close</button>
    </form>
    <ul class="re-command-palette__list">
      <li class="re-command-palette__item">
        <a href="#alpha" class="re-command-palette__action"
          ><span class="re-command-palette__item-label">Alpha</span></a
        >
      </li>
      <li class="re-command-palette__item">
        <a href="#beta" class="re-command-palette__action"
          ><span class="re-command-palette__item-label">Beta</span></a
        >
      </li>
    </ul>
    <div class="re-command-palette__empty" hidden>
      <div class="re-empty-state" data-size="sm" role="status">
        <p class="re-empty-state__description">No results.</p>
      </div>
    </div>
  </dialog>
</section>
