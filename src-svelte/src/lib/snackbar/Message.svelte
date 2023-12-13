<script lang="ts">
  import IconClose from "~icons/ep/close-bold";

  export let dismiss: () => void;
  export let message: string;
</script>

<div class="snackbar">
  {message}
  <button on:click={dismiss}>
    <IconClose />
  </button>
</div>

<style>
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
    margin-top: -0.3rem;
    align-self: flex-center;
  }
</style>
