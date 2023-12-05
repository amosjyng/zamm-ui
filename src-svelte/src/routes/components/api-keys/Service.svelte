<script lang="ts">
  import Form from "./Form.svelte";
  import type { Service } from "$lib/bindings";

  export let name: Service;
  export let apiKey: string | null;
  export let editing = false;

  function toggleEditing() {
    editing = !editing;
  }

  function formClose() {
    editing = false;
  }

  $: active = apiKey !== null;
  $: label = active ? "Active" : "Inactive";
</script>

<div class="container">
  <div
    class="row"
    on:click={toggleEditing}
    on:keypress={toggleEditing}
    role="row"
    tabindex="0"
  >
    <div class="service" role="cell">{name}</div>
    <div class="api-key" class:active role="cell">{label}</div>
  </div>

  {#if editing}
    <Form {formClose} service={name} apiKey={apiKey ?? ""} />
  {/if}
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
  }

  .service {
    text-align: left;
    font-family: var(--font-body);
    flex: 1;
  }

  .api-key {
    text-align: center;
    text-transform: uppercase;
    font-family: var(--font-body);
    background-color: gray;
    color: white;
    flex: 1;
    border-radius: var(--corner-roundness);
  }

  .api-key.active {
    background-color: green;
  }
</style>
