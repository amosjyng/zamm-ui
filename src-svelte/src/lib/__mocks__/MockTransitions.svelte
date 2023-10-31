<script lang="ts">
  let visible = true;

  function toggleVisibility() {
    visible = !visible;
  }
</script>

<div class="storybook-wrapper">
  <button class="visibility-toggle" on:click={toggleVisibility}
    >Toggle visibility</button
  >
  {#if visible}
    <slot />
  {/if}
</div>

<style>
  .storybook-wrapper {
    --base-animation-speed: 0.1;
  }

  .visibility-toggle {
    margin-bottom: 1rem;
  }
</style>
