<script>
  import Tabs from "./Tabs.svelte";
  let mounted = $state(true);
</script>

<main style="padding: var(--re-space-8); max-width: 48rem; margin: 0 auto">
  <h1>Svelte</h1>

  <p><button class="re-button" type="button">Save</button></p>

  <p><button id="toggle" type="button" onclick={() => (mounted = !mounted)}>Toggle tabs</button></p>

  {#if mounted}
    <Tabs />
  {/if}
</main>
