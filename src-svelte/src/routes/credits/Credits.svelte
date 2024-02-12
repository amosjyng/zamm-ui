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
      <Creditor name="Amos Jun-yeung Ng" url="https://github.com/amosjyng/" />
    </SubInfoBox>
  </div>
  <div class="container">
    <SubInfoBox subheading="Frameworks">
      <Grid>
        <Creditor name="Tauri" logo="tauri.png" url="https://tauri.app/" />
        <Creditor name="Svelte" logo="svelte.svg" url="https://svelte.dev/" />
      </Grid>
    </SubInfoBox>
  </div>
</InfoBox>

<style>
  .container {
    margin-top: 1rem;
  }
</style>
