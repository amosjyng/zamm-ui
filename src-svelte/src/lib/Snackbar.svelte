<script lang="ts" context="module">
  import { writable, type Writable } from "svelte/store";
  import { fly, fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import IconClose from "~icons/ep/close-bold";

  interface SnackbarMessage {
    id: number;
    msg: string;
  }

  export const snackbars: Writable<SnackbarMessage[]> = writable([]);
  export let durationMs = 5_000;
  let baseAnimationDurationMs = 100;
  let animateDurationMs = baseAnimationDurationMs;

  function setBaseAnimationDurationMs(newDurationMs: number) {
    baseAnimationDurationMs = newDurationMs;
  }

  let nextId = 0;

  // Function to show a new snackbar message
  export function snackbarError(msg: string) {
    animateDurationMs = baseAnimationDurationMs;
    const id = nextId++;
    snackbars.update((current) => [...current, { id, msg }]);

    // Auto-dismiss after 'duration'
    setTimeout(() => {
      dismiss(id);
    }, durationMs);
  }

  // Function to manually dismiss a snackbar
  function dismiss(id: number) {
    animateDurationMs = 2 * baseAnimationDurationMs;
    snackbars.update((current) =>
      current.filter((snackbar) => snackbar.id !== id),
    );
  }
</script>

<script lang="ts">
  import { animationSpeed } from "$lib/preferences";

  $: baseDurationMs = 100 / $animationSpeed;
  $: setBaseAnimationDurationMs(baseDurationMs);
</script>

<div class="snackbars">
  {#each $snackbars as snackbar (snackbar.id)}
    <div
      class="snackbar"
      in:fly|global={{ y: "1rem", duration: baseDurationMs }}
      out:fade|global={{ duration: baseDurationMs }}
      animate:flip={{ duration: animateDurationMs }}
    >
      {snackbar.msg}
      <button on:click={() => dismiss(snackbar.id)}>
        <IconClose />
      </button>
    </div>
  {/each}
</div>

<style>
  .snackbars {
    width: 100%;
    position: fixed;
    bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .snackbar {
    padding: 0.5rem 1rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    background-color: var(--color-error);
    color: white;
    border-radius: 4px;
    filter: drop-shadow(0px 1px 4px #cc0000);
    width: fit-content;
    margin: 0 auto;
  }

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.5rem;
    margin: -0.5rem;
    align-self: flex-end;
  }
</style>
