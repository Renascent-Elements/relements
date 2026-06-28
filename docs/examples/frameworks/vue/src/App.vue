<script setup>
import { ref } from "vue";
import Tabs from "./Tabs.vue";
import Multiselect from "./Multiselect.vue";
import Carousel from "./Carousel.vue";
import CommandPalette from "./CommandPalette.vue";

const mounted = ref(true);
</script>

<template>
  <main style="padding: var(--re-space-8); max-width: 48rem; margin: 0 auto">
    <h1>Vue</h1>

    <p><button class="re-button" type="button">Save</button></p>

    <button id="toggle" type="button" @click="mounted = !mounted">Toggle demo</button>

    <template v-if="mounted">
      <Tabs />
      <Multiselect />
      <Carousel />
      <CommandPalette />
    </template>
  </main>
</template>
