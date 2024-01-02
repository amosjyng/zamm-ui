<script lang="ts">
  import { animationSpeed } from "$lib/preferences";
  import Snackbar from "$lib/snackbar/Snackbar.svelte";
</script>

<div
  class="storybook-wrapper"
  style="--base-animation-speed: {$animationSpeed};"
>
  <slot />
  <Snackbar />
</div>
