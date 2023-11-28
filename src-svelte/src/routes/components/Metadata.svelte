<script lang="ts">
  import InfoBox from "$lib/InfoBox.svelte";
</script>

<InfoBox title="System Info" {...$$restProps}>
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
      <td>Release</td>
      <td>Ubuntu 18.04</td>
    </tr>
  </table>
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
