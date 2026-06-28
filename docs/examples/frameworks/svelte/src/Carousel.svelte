<script>
  import { onMount } from "svelte";
  import { enhanceCarousel } from "@relements/core/behaviors/carousel";

  let wrap;
  let renders = $state(0);

  onMount(() => {
    // enhanceCarousel searches descendants for [data-re-carousel]; its controls
    // (including the autoplay button injected on every rung) append as trailing
    // CHILDREN of #car — outside Svelte's managed nodes — so they survive
    // re-renders.
    const controller = enhanceCarousel(wrap);
    return () => controller.destroy();
  });
</script>

<section id="car-wrap" aria-labelledby="car-h" bind:this={wrap}>
  <h2 id="car-h">enhanceCarousel</h2>
  <!-- Bumping `renders` re-renders without unmounting. -->
  <p>
    <button id="car-rerender" type="button" onclick={() => renders++}>Re-render</button>
    <output id="car-renders">{renders}</output> renders
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
