<script lang="ts">
  import InfoBox from "$lib/InfoBox.svelte";
  import SettingsSwitch from "./SettingsSwitch.svelte";
  import {
    unceasingAnimations,
    soundOn,
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
    <SettingsSwitch
      label="Unceasing animations"
      bind:toggledOn={$unceasingAnimations}
      onToggle={onUnceasingAnimationsToggle}
    />
    <SettingsSwitch
      label="Sounds"
      bind:toggledOn={$soundOn}
      onToggle={onSoundToggle}
    />
  </div>
</InfoBox>

<style>
  .container {
    --side-padding: 0.8rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.1rem;
    margin: 0 calc(-1 * var(--side-padding)) 0.5rem;
  }

  /* this takes sidebar width into account */
  @media (min-width: 52rem) {
    .container {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
