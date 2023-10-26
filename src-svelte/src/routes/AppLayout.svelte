<script>
  import Sidebar from "./Sidebar.svelte";
  import Background from "./Background.svelte";
  import "./styles.css";
  import { onMount } from "svelte";
  import { getPreferences } from "$lib/bindings";
  import {
    soundOn,
    unceasingAnimations,
    animationSpeed,
    volume,
    animationsOn,
  } from "$lib/preferences";

  onMount(async () => {
    const prefs = await getPreferences();
    if (prefs.sound_on !== null) {
      soundOn.set(prefs.sound_on);
    }

    if (prefs.volume !== null) {
      volume.set(prefs.volume);
    }

    if (prefs.animations_on !== null) {
      animationsOn.set(prefs.animations_on);
    }

    if (prefs.unceasing_animations === null) {
      unceasingAnimations.set(true);
    } else {
      unceasingAnimations.set(prefs.unceasing_animations);
    }

    if (prefs.animation_speed !== null) {
      animationSpeed.set(prefs.animation_speed);
    }
  });
</script>

<div
  id="app"
  class:animations-disabled={!$animationsOn}
  style="--base-animation-speed: {$animationSpeed};"
>
  <Sidebar />

  <div class="main-container">
    <div class="background-layout">
      <Background />
    </div>
    <main>
      <slot />
    </main>
  </div>
</div>

<style>
  #app {
    box-sizing: border-box;
    height: 100vh;
    width: 100vw;
    position: absolute;
    top: 0;
    left: 0;
    background-color: var(--color-background);
    --main-corners: var(--corner-roundness) 0 0 var(--corner-roundness);
  }

  #app.animations-disabled :global(*) {
    animation-play-state: paused !important;
    transition: none !important;
  }

  .main-container {
    height: 100vh;
    box-sizing: border-box;
    margin-left: var(--sidebar-width);
    overflow: scroll;
    border-radius: var(--main-corners);
    background-color: var(--color-foreground);
    box-shadow: calc(-1 * var(--shadow-offset)) 0 var(--shadow-blur) 0 #ccc;
  }

  .background-layout {
    z-index: 0;
    border-radius: var(--main-corners);
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--sidebar-width);
    right: 0;
  }

  main {
    position: relative;
    z-index: 1;
    padding: 1em;
  }
</style>
