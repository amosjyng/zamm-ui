<script lang="ts">
  import {
    Switch,
    SwitchLabel,
    SwitchGroup,
  } from "@rgossiaux/svelte-headlessui";
  import {
    draggable,
    type DragOptions,
    type DragEventData,
  } from "@neodrag/svelte";

  const labelWidth = 3 * 18;
  const offLeft = -labelWidth;
  const onLeft = 0;

  export let label: string | undefined = undefined;
  export let toggledOn = false;
  let toggleBound: HTMLElement;
  let left = 0;
  let transition = "";

  let toggleDragOptions: DragOptions = {
    axis: "x",
    bounds: () => toggleBound,
    render: (data: DragEventData) => {
      left = data.offsetX;
    },
    onDragStart: (_: DragEventData) => {
      transition = "";
    },
    onDragEnd: (_: DragEventData) => {
      transition = `
        transition: left 0.1s;
        transition-timing-function: cubic-bezier(0, 0, 0, 1.3);
      `;
      toggleDragOptions = updatePosition(toggledOn);
      console.log("drag ended");
    },
  };

  function updatePosition(toggledOn: boolean) {
    return {
      ...toggleDragOptions,
      position: toggledOn ? { x: onLeft, y: 0 } : { x: offLeft, y: 0 },
    };
  }

  $: toggleDragOptions = updatePosition(toggledOn);
  $: left = toggleDragOptions.position?.x ?? 0;
  $: console.log(`current state: toggle=${toggledOn}, left=${left}`);
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
          style="--left: {left}px; {transition}"
        >
          <div class="toggle-label on"><span>On</span></div>
          <div class="toggle-label"></div>
          <div class="toggle-label off"><span>Off</span></div>
        </div>
      </div>
      <div class="groove-layer bounds" bind:this={toggleBound}></div>
      <div
        class="groove-contents toggle-layer"
        class:on={toggledOn}
        class:off={!toggledOn}
        style="--left: {left}px; {transition}"
      >
        <div class="toggle-label"></div>
        <div class="toggle-label" use:draggable={toggleDragOptions}>
          <div class="toggle"></div>
        </div>
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
    --groove-width: calc(2 * var(--label-width));
    width: var(--groove-width);
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

  *:global(.groove-layer.bounds) {
    width: calc(1.3 * var(--groove-width));
    margin-left: calc(-0.05 * var(--groove-width));
    background: transparent;
    position: absolute;
    top: 0;
  }

  * :global(.groove-contents) {
    --left: 0;
    z-index: var(--groove-contents-layer);
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    top: 0;
    left: var(--left);
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
    padding-left: var(--label-width);
    margin-left: calc(-1 * var(--label-width));
  }

  * :global(.toggle-label.off) {
    background: red;
    padding-right: var(--label-width);
    margin-right: calc(-1 * var(--label-width));
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
