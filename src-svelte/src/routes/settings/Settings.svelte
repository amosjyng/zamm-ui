<script lang="ts">
  import InfoBox from "$lib/InfoBox.svelte";
  import SubInfoBox from "$lib/SubInfoBox.svelte";
  import SettingsSwitch from "./SettingsSwitch.svelte";
  import SettingsSlider from "./SettingsSlider.svelte";
  import {
    animationsOn,
    animationSpeed,
    unceasingAnimations,
    soundOn,
    volume,
    NullPreferences,
  } from "$lib/preferences";
  import { setPreferences } from "$lib/bindings";

  const onUnceasingAnimationsToggle = (newValue: boolean) => {
    setPreferences({
      ...NullPreferences,
      unceasing_animations: newValue,
    });
  };

  const onSoundToggle = (newValue: boolean) => {
    setPreferences({
      ...NullPreferences,
      sound_on: newValue,
    });
  };
</script>

<InfoBox title="Settings">
  <div class="container">
    <SubInfoBox subheading="Animation">
      <SettingsSwitch label="Enabled" bind:toggledOn={$animationsOn} />
      <SettingsSwitch
        label="Background"
        bind:toggledOn={$unceasingAnimations}
        onToggle={onUnceasingAnimationsToggle}
      />
      <SettingsSlider
        label="General speed"
        min={0}
        max={4}
        bind:value={$animationSpeed}
      />
    </SubInfoBox>
  </div>

  <div class="container">
    <SubInfoBox subheading="Sound">
      <SettingsSwitch
        label="Enabled"
        bind:toggledOn={$soundOn}
        onToggle={onSoundToggle}
      />
      <SettingsSlider label="Volume" min={0} max={200} bind:value={$volume} />
    </SubInfoBox>
  </div>
</InfoBox>

<style>
  .container {
    margin-top: 1rem;
  }

  .container {
    margin-top: 0;
  }

  .container :global(h3) {
    margin-left: var(--side-padding);
  }

  .container :global(.sub-info-box .content) {
    --side-padding: 0.8rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.1rem;
    margin: 0 calc(-1 * var(--side-padding)) 0.5rem;
  }

  /* this takes sidebar width into account */
  @media (min-width: 52rem) {
    .container :global(.sub-info-box .content) {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
