<script lang="ts">
  import { soundOn } from "../preferences";
  import { customAlphabet } from "nanoid/non-secure";
  import {
    draggable,
    type DragOptions,
    type DragEventData,
  } from "@neodrag/svelte";
  import clickSound from "$lib/sounds/switch.ogg";

  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  const switchSize = 1 * rootFontSize;
  const labelWidth = 3 * switchSize;
  const offLeft = -labelWidth;
  const onLeft = 0;
  const transitionAnimation = `
    transition: left 0.1s;
    transition-timing-function: cubic-bezier(0, 0, 0, 1.3);
  `;
  const nanoid = customAlphabet("1234567890", 6);
  const switchId = `switch-${nanoid()}`;

  export let label: string | undefined = undefined;
  export let toggledOn = false;
  export let letParentToggle = false;
  let toggleBound: HTMLElement;
  let left = 0;
  let transition = transitionAnimation;
  let startingOffset = 0;
  let dragging = false;
  let dragPositionOnLeft = false;

  function playClick() {
    if (!$soundOn) {
      return;
    }

    const audio = new Audio(clickSound);
    audio.volume = 0.05;
    audio.play();
    if (window._testRecordSoundPlayed !== undefined) {
      window._testRecordSoundPlayed();
    }
  }

  function playDragClick(offsetX: number) {
    if (dragging) {
      if (dragPositionOnLeft && offsetX >= onLeft) {
        playClick();
        dragPositionOnLeft = false;
      } else if (!dragPositionOnLeft && offsetX <= offLeft) {
        playClick();
        dragPositionOnLeft = true;
      }
    }
  }

  let toggleDragOptions: DragOptions = {
    axis: "x",
    bounds: () => toggleBound,
    inverseScale: 1,
    render: (data: DragEventData) => {
      left = data.offsetX;
    },
    onDragStart: (data: DragEventData) => {
      transition = "";
      dragging = false;
      startingOffset = data.offsetX;
      dragPositionOnLeft = !toggledOn;
    },
    onDrag: (data: DragEventData) => {
      // if we ever start dragging, then the toggle state will depend on the final
      // resting position, even if it gets returned back to the very beginning.
      // On the other hand, if we never drag at all, then thet toggle state will simply
      // flip because it's just a click.
      //
      // offsetX starts based on the current position of the switch, not at 0, so we
      // have to keep track of the starting offset to determine if we've actually
      // moved
      dragging = dragging || data.offsetX !== startingOffset;
      playDragClick(data.offsetX);
    },
    onDragEnd: (data: DragEventData) => {
      transition = transitionAnimation;
      if (dragging) {
        toggledOn = data.offsetX > offLeft / 2;
      }
      playDragClick(toggledOn ? onLeft : offLeft);
      // even if toggle state didn't change, reset back to resting position
      toggleDragOptions = updatePosition(toggledOn);
    },
  };

  function updatePosition(toggledOn: boolean) {
    return {
      ...toggleDragOptions,
      position: toggledOn ? { x: onLeft, y: 0 } : { x: offLeft, y: 0 },
    };
  }

  export function toggle() {
    if (!dragging) {
      toggledOn = !toggledOn;
      playClick();
    }
    dragging = false; // subsequent clicks should register
  }

  function buttonClicked() {
    if (!letParentToggle) {
      toggle();
    }
  }

  $: toggleDragOptions = updatePosition(toggledOn);
  $: left = toggleDragOptions.position?.x ?? 0;
</script>

<div class="container">
  {#if label}
    <label for={switchId}>{label}</label>
  {/if}
  <button
    type="button"
    role="switch"
    tabIndex="0"
    aria-checked={toggledOn}
    id={switchId}
    on:click={buttonClicked}
    style="font-size: {switchSize}px;"
  >
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
    </div>
  </button>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;

    /* button stats */
    --label-width: 3em;
    --label-height: 1.5em;
    --toggle-height: calc(1.2 * var(--label-height));
    height: var(--toggle-height);
  }

  label {
    flex: 1;
    cursor: pointer;
  }

  @media (min-width: 52rem) {
    label {
      white-space: nowrap;
    }
  }

  button {
    --skew: -20deg;
    --groove-contents-layer: 1;
    --groove-layer: 2;
    --toggle-layer: 3;
    cursor: pointer;
    transform: skew(var(--skew));
    margin-right: calc(-0.5 * var(--toggle-height) * sin(var(--skew)));
    padding: 0;
    border: none;
    background: transparent;
  }

  .groove-layer {
    --groove-width: calc(2 * var(--label-width));
    width: var(--groove-width);
    height: var(--label-height);
    border-radius: var(--corner-roundness);
    z-index: var(--groove-layer);
    position: relative;
  }

  .groove-layer.groove {
    overflow: hidden;
  }

  .groove-layer.shadow {
    box-shadow: inset 0.05em 0.05em 0.3em rgba(0, 0, 0, 0.4);
  }

  .groove-layer.bounds {
    /* How much overshoot to allow */
    --overshoot: 0.2;
    /* unskew bounds to make reasoning easier */
    transform: skew(calc(-1 * var(--skew)));
    width: calc((1 + var(--overshoot)) * var(--groove-width));
    margin-left: calc(var(--overshoot) / -2 * var(--groove-width));
    background: transparent;
    position: absolute;
    top: 0;
  }

  .groove-contents {
    --left: 0;
    z-index: var(--groove-contents-layer);
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    top: 0;
    left: var(--left);
  }

  .toggle-label {
    width: var(--label-width);
    height: var(--label-height);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-label.on {
    background: green;
    padding-left: var(--label-width);
    margin-left: calc(-1 * var(--label-width));
  }

  .toggle-label.off {
    background: red;
    padding-right: var(--label-width);
    margin-right: calc(-1 * var(--label-width));
  }

  .toggle-label span {
    --shadow-offset: 0.05em;
    --shadow-intensity: 0.3;
    transform: skew(calc(-1 * var(--skew)));
    color: white;
    font-size: 0.9em;
    font-family: Nasalization, sans-serif;
    text-transform: uppercase;
    text-shadow:
      calc(-1 * var(--shadow-offset)) calc(-1 * var(--shadow-offset)) 0
        rgba(0, 0, 0, var(--shadow-intensity)),
      var(--shadow-offset) var(--shadow-offset) 0
        rgba(255, 255, 255, var(--shadow-intensity));
  }

  .groove-contents.toggle-layer {
    z-index: var(--toggle-layer);
  }

  .toggle {
    position: absolute;
    width: calc(1.05 * var(--label-width));
    height: var(--toggle-height);
    background-color: #ddd;
    box-shadow:
      0.1em 0.1em 0.15em rgba(0, 0, 0, 0.1),
      inset -0.1em -0.1em 0.15em rgba(0, 0, 0, 0.3),
      inset 0.1em 0.1em 0.15em rgba(255, 255, 255, 0.7);
    border-radius: var(--corner-roundness);
  }
</style>
