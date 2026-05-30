<script setup>
import { ref } from "vue";
import Tabs from "./Tabs.vue";

const mounted = ref(true);
</script>

<template>
  <main style="padding: var(--re-space-8); max-width: 48rem; margin: 0 auto">
    <h1>Vue</h1>

    <p><button class="re-button" type="button">Save</button></p>

    <button id="toggle" type="button" @click="mounted = !mounted">Toggle tabs</button>

    <Tabs v-if="mounted" />
  </main>
</template>
