<script lang="ts">
  import InfoBox from "$lib/InfoBox.svelte";
  import SubInfoBox from "$lib/SubInfoBox.svelte";
  import Creditor from "./Creditor.svelte";
  import Grid from "./Grid.svelte";
</script>

<InfoBox title="Credits">
  <div class="container">
    <SubInfoBox
      subheading="Zen and the Automation of Metaprogramming for the Masses"
    >
      <Grid>
        <Creditor name="Amos Jun-yeung Ng" url="https://github.com/amosjyng/" />
      </Grid>
    </SubInfoBox>
  </div>
  <div class="container">
    <SubInfoBox subheading="Frameworks">
      <Grid>
        <Creditor name="Tauri" logo="tauri" url="https://tauri.app/" />
      </Grid>
    </SubInfoBox>
  </div>
</InfoBox>

<style>
  .container {
    margin-top: 1rem;
  }
</style>
