<script lang="ts">
  import AnimationControl from "../../routes/AnimationControl.svelte";
  import Snackbar from "$lib/snackbar/Snackbar.svelte";
</script>

<div class="storybook-wrapper">
  <AnimationControl>
    <slot />
    <Snackbar />
  </AnimationControl>
</div>

<style>
  .storybook-wrapper {
    height: calc(100vh - 2rem);
    max-width: 50rem;
    position: relative;
    box-sizing: border-box;
  }
</style>
