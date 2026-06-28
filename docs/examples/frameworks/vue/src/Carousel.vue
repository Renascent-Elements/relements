<script setup>
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { enhanceCarousel } from "@relements/core/behaviors/carousel";

const wrap = useTemplateRef("wrap");
const renders = ref(0);
let controller = null;

onMounted(() => {
  // enhanceCarousel searches descendants for [data-re-carousel]; its controls
  // (including the autoplay button injected on every rung) append as trailing
  // CHILDREN of #car — outside Vue's patch tree — so they survive re-renders.
  controller = enhanceCarousel(wrap.value);
});
onUnmounted(() => {
  controller?.destroy();
});
</script>

<template>
  <section id="car-wrap" aria-labelledby="car-h" ref="wrap">
    <h2 id="car-h">enhanceCarousel</h2>
    <!-- Bumping `renders` re-renders this component without unmounting it. -->
    <p>
      <button id="car-rerender" type="button" @click="renders++">Re-render</button>
      <output id="car-renders">{{ renders }}</output> renders
    </p>
    <div class="re-carousel" id="car" data-re-carousel data-re-carousel-autoplay="100000">
      <div
        class="re-carousel__track"
        role="group"
        aria-roledescription="carousel"
        aria-label="Demo carousel"
        tabindex="0"
      >
        <figure class="re-carousel__slide" aria-roledescription="slide" aria-label="Slide one">
          One
        </figure>
        <figure class="re-carousel__slide" aria-roledescription="slide" aria-label="Slide two">
          Two
        </figure>
        <figure class="re-carousel__slide" aria-roledescription="slide" aria-label="Slide three">
          Three
        </figure>
      </div>
    </div>
  </section>
</template>
