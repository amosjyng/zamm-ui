<script lang="ts">
  import { cubicInOut } from "svelte/easing";
  import { setApiKey, type Service } from "$lib/bindings";
  import { animationSpeed, animationsOn } from "$lib/preferences";
  import { systemInfo } from "$lib/system-info";
  import TextInput from "$lib/controls/TextInput.svelte";
  import Button from "$lib/controls/Button.svelte";

  export let service: Service;
  export let apiKey = "";
  export let saveKeyLocation = $systemInfo?.shell_init_file ?? "";
  export let formClose: () => void = () => undefined;
  let saveKey = true;

  function growY(node: HTMLElement) {
    const rem = 18;
    const totalFinalPadding = 1 * rem;

    const height = node.offsetHeight;
    const duration = $animationsOn ? 200 / $animationSpeed : 0;
    return {
      duration,
      easing: cubicInOut,
      tick: (t: number) => {
        const totalHeight = height * t;
        const totalCurrentPadding = Math.min(totalFinalPadding, totalHeight);
        const contentHeight = totalHeight - totalCurrentPadding;
        node.style.setProperty(
          "--vertical-padding",
          `${totalCurrentPadding / 2}px`,
        );
        node.style.setProperty("--form-height", `${contentHeight}px`);
      },
    };
  }

  function submitApiKey() {
    setApiKey(saveKey ? saveKeyLocation : null, service, apiKey).finally(() => {
      formClose();
    });
  }
</script>

<div class="container" transition:growY>
  <div class="inset-container">
    <form on:submit|preventDefault={submitApiKey}>
      <div class="form-row">
        <label for="apiKey">API key:</label>
        <TextInput name="apiKey" bind:value={apiKey} />
      </div>

      <div class="form-row">
        <label for="saveKey" class="accessibility-only">Save key to disk?</label
        >
        <input
          type="checkbox"
          id="saveKey"
          name="saveKey"
          bind:checked={saveKey}
        />
        <label for="saveKeyLocation">Save key to:</label>
        <TextInput name="saveKeyLocation" bind:value={saveKeyLocation} />
      </div>

      <div class="save-button">
        <Button text="Save" />
      </div>
    </form>
  </div>
</div>

<style>
  .container {
    --form-height: 100%;
    --vertical-padding: 0.5rem;
    --horizontal-overshoot: 1rem;
    overflow: hidden;
    margin: 0 calc(-1 * var(--horizontal-overshoot));
    padding: var(--vertical-padding) 0;
  }

  .inset-container {
    height: var(--form-height);
    overflow: hidden;
    box-shadow: inset 0.05em 0.05em 0.3em rgba(0, 0, 0, 0.4);
    background-color: var(--color-background);
  }

  form {
    padding: 0.5rem var(--horizontal-overshoot);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex-wrap: nowrap;
  }

  label {
    white-space: nowrap;
  }

  .form-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .save-button {
    align-self: flex-start;
  }
</style>
