<script lang="ts">
  import { getApiKeys } from "$lib/bindings";
  import InfoBox from "$lib/InfoBox.svelte";
  import Loading from "$lib/Loading.svelte";
  import Service from "./Service.svelte";

  export let editDemo = false;
  let apiKeys = getApiKeys();
</script>

<InfoBox title="API Keys" {...$$restProps}>
  {#await apiKeys}
    <Loading />
  {:then keys}
    <div class="api-keys" role="table">
      <Service name="OpenAI" apiKey={keys.openai} editing={editDemo} />
    </div>
  {:catch error}
    <span role="status">error: {error}</span>
  {/await}
</InfoBox>
