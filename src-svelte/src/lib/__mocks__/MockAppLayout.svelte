<script lang="ts">
  import { animationSpeed } from "$lib/preferences";
</script>

<div
  class="storybook-wrapper"
  style="--base-animation-speed: {$animationSpeed};"
>
  <slot />
</div>
