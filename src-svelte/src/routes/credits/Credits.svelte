<script lang="ts">
  import InfoBox from "$lib/InfoBox.svelte";
  import SubInfoBox from "$lib/SubInfoBox.svelte";
  import Creditor from "./Creditor.svelte";
</script>

<InfoBox title="Credits">
  <div class="container">
    <SubInfoBox
      subheading="Zen and the Automation of Metaprogramming for the Masses"
    >
      <Creditor name="Amos Jun-yeung Ng" url="https://github.com/amosjyng/" />
    </SubInfoBox>
  </div>
</InfoBox>

<style>
  .container {
    margin-top: 1rem;
  }

  .container :global(.sub-info-box .content) {
    --side-padding: 0.8rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.1rem;
    margin: 0;
  }

  /* this takes sidebar width into account */
  @media (min-width: 52rem) {
    .container :global(.sub-info-box .content) {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
