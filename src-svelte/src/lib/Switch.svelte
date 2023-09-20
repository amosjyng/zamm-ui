<script lang="ts">
  import {
    Switch,
    SwitchLabel,
    SwitchGroup,
  } from "@rgossiaux/svelte-headlessui";

  export let label: string | undefined = undefined;
  export let toggledOn = false;
</script>

<div class="container">
  <SwitchGroup class="switch-group">
    {#if label}
      <SwitchLabel>
        <div class="label">
          {label}
        </div>
      </SwitchLabel>
    {/if}
    <Switch bind:checked={toggledOn} class="button">
      <div class="groove-layer groove">
        <div class="groove-layer shadow"></div>
        <div
          class="groove-contents"
          class:on={toggledOn}
          class:off={!toggledOn}
        >
          <div class="toggle-label on"><span>On</span></div>
          <div class="toggle-label"></div>
          <div class="toggle-label off"><span>Off</span></div>
        </div>
      </div>
      <div
        class="groove-contents toggle-layer"
        class:on={toggledOn}
        class:off={!toggledOn}
      >
        <div class="toggle-label"></div>
        <div class="toggle-label"><div class="toggle"></div></div>
        <div class="toggle-label"></div>
      </div>
    </Switch>
  </SwitchGroup>
</div>

<style>
  .container {
    display: inline-block;
  }

  * :global(.switch-group) {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }

  * :global(.button) {
    --skew: -20deg;
    --label-width: 3rem;
    --label-height: 1.5rem;
    --groove-contents-layer: 1;
    --groove-layer: 2;
    --toggle-layer: 3;
    cursor: pointer;
    transform: skew(var(--skew));
    padding: 0;
    border: none;
    background: transparent;
  }

  * :global(.groove-layer) {
    width: calc(2 * var(--label-width));
    height: var(--label-height);
    border-radius: var(--corner-roundness);
    z-index: var(--groove-layer);
    position: relative;
  }

  * :global(.groove-layer.groove) {
    overflow: hidden;
  }

  * :global(.groove-layer.shadow) {
    box-shadow: inset 0.05rem 0.05rem 0.3rem rgba(0, 0, 0, 0.4);
  }

  * :global(.groove-contents) {
    z-index: var(--groove-contents-layer);
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    transition: left 0.05s ease-out;
  }

  * :global(.groove-contents.off) {
    left: calc(-1 * var(--label-width));
  }

  * :global(.toggle-label) {
    width: var(--label-width);
    height: var(--label-height);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  * :global(.toggle-label.on) {
    background: green;
  }

  * :global(.toggle-label.off) {
    background: red;
  }

  * :global(.toggle-label span) {
    --shadow-offset: 0.05rem;
    --shadow-intensity: 0.3;
    transform: skew(calc(-1 * var(--skew)));
    color: white;
    font-size: 0.9rem;
    font-family: Nasalization, sans-serif;
    text-transform: uppercase;
    text-shadow:
      calc(-1 * var(--shadow-offset)) calc(-1 * var(--shadow-offset)) 0
        rgba(0, 0, 0, var(--shadow-intensity)),
      var(--shadow-offset) var(--shadow-offset) 0
        rgba(255, 255, 255, var(--shadow-intensity));
  }

  * :global(.groove-contents.toggle-layer) {
    z-index: var(--toggle-layer);
  }

  * :global(.toggle) {
    position: absolute;
    width: calc(1.05 * var(--label-width));
    height: calc(1.2 * var(--label-height));
    background-color: #ddd;
    box-shadow:
      0.1rem 0.1rem 0.15rem rgba(0, 0, 0, 0.1),
      inset -0.1rem -0.1rem 0.15rem rgba(0, 0, 0, 0.3),
      inset 0.1rem 0.1rem 0.15rem rgba(255, 255, 255, 0.7);
    border-radius: var(--corner-roundness);
  }
</style>
