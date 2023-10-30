<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicIn, cubicOut } from "svelte/easing";
  import { animationSpeed } from "$lib/preferences";

  export let currentRoute: string;
  let transitionDuration: number;
  let transitionDelay: number;

  $: transitionDuration = 50 / $animationSpeed;
  $: transitionDelay = 60 / $animationSpeed;
</script>

{#key currentRoute}
  <div
    class="transition-container"
    out:fly={{ x: "-20%", duration: transitionDuration, easing: cubicIn }}
    in:fly={{
      x: "-20%",
      duration: transitionDuration,
      easing: cubicOut,
      delay: transitionDelay,
    }}
  >
    <slot />
  </div>
{/key}

<style>
  .transition-container {
    position: absolute;
    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
  }
</style>
