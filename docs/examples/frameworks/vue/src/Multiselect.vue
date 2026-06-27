<script setup>
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { enhanceMultiSelect } from "@relements/core/behaviors/multiselect";

const wrap = useTemplateRef("wrap");
const renders = ref(0);
let controller = null;

onMounted(() => {
  // Enhance the WRAPPER, not the <details>: the behavior injects its live region
  // as a sibling via host.after(), landing as a trailing child of #ms-wrap — a
  // node Vue doesn't patch against the template, so it survives re-renders.
  controller = enhanceMultiSelect(wrap.value);
});
onUnmounted(() => {
  controller?.destroy();
});
</script>

<template>
  <section aria-labelledby="ms-h">
    <h2 id="ms-h">enhanceMultiSelect</h2>
    <!-- Above the field so the open (absolute) panel can't cover it; bumping
         `renders` re-renders this component without unmounting it. -->
    <p>
      <button id="ms-rerender" type="button" @click="renders++">Re-render</button>
      <output id="ms-renders">{{ renders }}</output> renders
    </p>
    <div class="re-field">
      <span class="re-field__label" id="ms-label">Frameworks</span>
      <div id="ms-wrap" ref="wrap">
        <details class="re-multiselect" id="ms" data-re-multiselect>
          <summary class="re-multiselect__summary" aria-labelledby="ms-label ms-value">
            <span class="re-multiselect__value" id="ms-value" data-placeholder
              >Select frameworks</span
            >
          </summary>
          <fieldset class="re-multiselect__panel">
            <legend class="re-sr-only">Frameworks</legend>
            <label class="re-multiselect__option">
              <input type="checkbox" class="re-checkbox" name="fw" value="react" /> React
            </label>
            <label class="re-multiselect__option">
              <input type="checkbox" class="re-checkbox" name="fw" value="vue" /> Vue
            </label>
            <label class="re-multiselect__option">
              <input type="checkbox" class="re-checkbox" name="fw" value="svelte" /> Svelte
            </label>
          </fieldset>
        </details>
      </div>
    </div>
  </section>
</template>
