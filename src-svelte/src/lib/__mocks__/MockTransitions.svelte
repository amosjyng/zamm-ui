<script lang="ts">
  let visible = true;

  function toggleVisibility() {
    visible = !visible;

    setTimeout(() => {
      visible = !visible;
    }, 100);
  }
</script>

<div class="storybook-wrapper">
  <button class="visibility-toggle" on:click={toggleVisibility}>Remount</button>
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
