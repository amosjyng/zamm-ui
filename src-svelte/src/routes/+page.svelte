<script lang="ts">
  import { getApiKeys } from "$lib/bindings";

  let api_keys = getApiKeys();
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
  <h1>ZAMM</h1>

  <p>
    Your OpenAI API key:
    {#await api_keys}
      ...loading
    {:then keys}
      {#if keys.openai !== undefined && keys.openai !== null}
        {keys.openai.value}
      {:else}
        not set
      {/if}
    {:catch error}
      <span style="color: red">{error.message}</span>
    {/await}
  </p>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }

  h1 {
    width: 100%;
  }
</style>
