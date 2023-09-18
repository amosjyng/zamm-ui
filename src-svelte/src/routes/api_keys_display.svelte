<script lang="ts">
  import { getApiKeys } from "$lib/bindings";
  import InfoBox from "$lib/InfoBox.svelte";

  let api_keys = getApiKeys();
</script>

<InfoBox title="API Keys">
  <table>
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
</InfoBox>

<style>
  table {
    width: 0.1%;
    white-space: nowrap;
  }

  td {
    text-align: left;
  }

  td {
    font-family: var(--font-body);
  }

  .key {
    color: var(--color-faded);
    padding-left: 1rem;
  }

  .actual-key {
    color: var(--color-text);
    font-family: var(--font-mono);
    font-weight: bold;
  }
</style>
