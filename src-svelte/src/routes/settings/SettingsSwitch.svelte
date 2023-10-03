<script lang="ts">
  import Switch from "$lib/Switch.svelte";

  export let label: string;
  export let toggledOn = false;
</script>

<div class="container">
  <Switch {label} {toggledOn} />
</div>

<style>
  .container {
    padding: calc(0.5 * var(--side-padding)) var(--side-padding);
    border-radius: var(--corner-roundness);
    transition: background 0.5s;
  }

  .container:hover {
    background: hsla(60, 100%, 50%, 0.2);
  }
</style>
