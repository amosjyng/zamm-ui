<script lang="ts">
  import InfoBox from "$lib/InfoBox.svelte";
  import Loading from "$lib/Loading.svelte";
  import { getSystemInfo } from "$lib/bindings";

  let systemInfoCall = getSystemInfo();
</script>

<InfoBox title="System Info" {...$$restProps}>
  {#await systemInfoCall}
    <Loading />
  {:then systemInfo}
    <table>
      <tr>
        <th colspan="2">ZAMM</th>
      </tr>
      <tr>
        <td>Version</td>
        <td class="version-value">0.0.0</td>
      </tr>
      <tr>
        <td>Stability</td>
        <td class="stability-value">Unstable (Alpha)</td>
      </tr>
      <tr>
        <td>Fork</td>
        <td>Original</td>
      </tr>
    </table>

    <table class="less-space">
      <tr>
        <th colspan="2">Computer</th>
      </tr>
      <tr>
        <td>OS</td>
        <td>Linux</td>
      </tr>
      <tr>
        <td>Shell</td>
        <td>{systemInfo.shell}</td>
      </tr>
    </table>
  {:catch error}
    <span role="status">error: {error}</span>
  {/await}
</InfoBox>

<style>
  table {
    margin-top: 0.5rem;
  }

  th,
  td {
    text-align: left;
    padding-left: 0;
  }

  td {
    vertical-align: text-top;
  }

  td:first-child {
    color: var(--color-faded);
    padding-right: 1rem;
  }

  .stability-value {
    color: var(--color-caution);
  }

  .less-space {
    margin-bottom: -0.33rem;
  }
</style>
