<script lang="ts">
  import getComponentId from "./label-id";

  const switchId = getComponentId("switch");

  export let label: string | undefined = undefined;
  export let min = 0;
  export let max: number;
  export let step: number | undefined = undefined;
  export let value: number = min;
  let percentageValue: number;
  let stepAttr: string = step ? step.toString() : "any";

  $: percentageValue = ((value - min) / (max - min)) * 100.0;
</script>

<div class="container">
  {#if label}
    <label for={switchId}>{label}</label>
  {/if}
  <input
    type="range"
    id={switchId}
    {min}
    {max}
    bind:value
    step={stepAttr}
    style="--val: {percentageValue}"
  />
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;

    --skew: -20deg;
    --label-height: 1.5em;
    --thumb-height: calc(1.2 * var(--label-height));
    --thumb-width: 0.75rem;
    --track-height: calc(0.5 * var(--label-height));
  }

  label {
    white-space: nowrap;
    flex: 1;
  }

  input {
    flex: 1;
    min-width: 7rem;
    transform: skew(var(--skew));
    appearance: none;
    -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
    width: 100%; /* Specific width is required for Firefox. */
    background: transparent; /* Otherwise white in Chrome */
  }

  input::-webkit-slider-thumb {
    -webkit-appearance: none;
  }

  input:focus {
    outline: none;
  }

  input::-moz-range-thumb {
    height: var(--thumb-height);
    width: var(--thumb-width);
    background-color: #ddd;
    box-shadow:
      0.1em 0.1em 0.15em rgba(0, 0, 0, 0.1),
      inset -0.1em -0.1em 0.15em rgba(0, 0, 0, 0.3),
      inset 0.1em 0.1em 0.15em rgba(255, 255, 255, 0.7);
    border-radius: var(--corner-roundness);
    cursor: ew-resize;
  }

  input::-webkit-slider-thumb {
    -webkit-appearance: none;
    margin-top: calc(-0.5 * (var(--thumb-height) - var(--track-height)));

    height: var(--thumb-height);
    width: var(--thumb-width);
    background-color: #ddd;
    box-shadow:
      0.1em 0.1em 0.15em rgba(0, 0, 0, 0.1),
      inset -0.1em -0.1em 0.15em rgba(0, 0, 0, 0.3),
      inset 0.1em 0.1em 0.15em rgba(255, 255, 255, 0.7);
    border-radius: var(--corner-roundness);
    cursor: ew-resize;
  }

  input::-moz-range-track {
    width: 100%;
    height: var(--track-height);
    border-radius: var(--corner-roundness);
    box-shadow: inset 0.05em 0.05em 0.3em rgba(0, 0, 0, 0.4);
  }

  input::-webkit-slider-runnable-track {
    width: 100%;
    height: var(--track-height);
    border-radius: var(--corner-roundness);
    box-shadow: inset 0.05em 0.05em 0.3em rgba(0, 0, 0, 0.4);
  }

  input::-moz-range-progress {
    background: linear-gradient(to left, #00f, #bbbbff);
    height: var(--track-height);
    border-radius: var(--corner-roundness);
    box-shadow: inset 0.05em 0.05em 0.3em rgba(0, 0, 0, 0.4);
  }

  input::-webkit-slider-container {
    /* Chrome tries really hard to make this read-only */
    -webkit-user-modify: read-write !important;
    --unit: 1%;
    background: linear-gradient(to left, #00f, #bbbbff) 0 /
      calc(var(--val) * var(--unit)) no-repeat;
    height: var(--track-height);
    border-radius: var(--corner-roundness);
    width: 50%;
  }
</style>
