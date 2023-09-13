<script lang="ts">
  import { getApiKeys } from "$lib/bindings";

  let api_keys = getApiKeys();
</script>

<table>
  <tr class="h2">
    <th class="header-text" colspan="2">API Keys</th>
  </tr>
  <tr>
    <td>OpenAI</td>
    <td class="key">
      {#await api_keys}
        ...loading
      {:then keys}
        {#if keys.openai !== undefined && keys.openai !== null}
          <span class="actual-key">{keys.openai.value}</span>
        {:else}
          unknown
        {/if}
      {:catch error}
        error: {error}
      {/await}
    </td>
  </tr>
</table>

<style>
  table {
    width: 0.1%;
    white-space: nowrap;
  }

  th,
  td {
    padding: 0 0.5rem;
    text-align: left;
  }

  td {
    font-family: var(--font-body);
  }

  .key {
    color: var(--color-faded);
  }

  .actual-key {
    color: var(--color-text);
    font-family: var(--font-mono);
    font-weight: bold;
  }
</style>
