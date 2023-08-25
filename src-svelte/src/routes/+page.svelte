<script lang="ts">
  import { getApiKeys } from "$lib/bindings";

  let api_keys = getApiKeys();
</script>

<section>
  <table>
    <tr>
      <th class="header-text" colspan="2">API Keys</th>
    </tr>
    {#await api_keys}
      <tr><td colspan="2">...loading</td></tr>
    {:then keys}
      <tr>
        <td>OpenAI</td>
        <td class="key">
          {#if keys.openai !== undefined && keys.openai !== null}
            {keys.openai.value}
          {:else}
            <span class="unset">not set</span>
          {/if}
        </td>
      </tr>
    {:catch error}
      <tr><td colspan="2">{error.message}</td></tr>
    {/await}
  </table>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    flex: 0.6;
  }

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
