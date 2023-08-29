<script lang="ts">
  import { getApiKeys } from "$lib/bindings";

  let api_keys = getApiKeys();
</script>

<table>
  <tr>
    <th class="header-text" colspan="2">API Keys</th>
  </tr>
  <tr>
    <td>OpenAI</td>
    <td class="key">
      {#await api_keys}
        ...loading
      {:then keys}
        {#if keys.openai !== undefined && keys.openai !== null}
          {keys.openai.value}
        {:else}
          <span class="unset">not set</span>
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

  th {
    color: var(--color-header);
  }

  th,
  td {
    padding: 0 0.5rem;
    text-align: left;
  }

  .key {
    font-weight: bold;
    text-transform: lowercase;
  }

  .unset {
    color: var(--color-faded);
  }
</style>
