<script lang="ts">
  import getComponentId from "./label-id";
  import { fly } from "svelte/transition";
  import { animationSpeed } from "$lib/preferences";

  export let title = "";
  const infoboxId = getComponentId("infobox");
  let transitionSpeedMs: number;
  $: transitionSpeedMs = 100 / $animationSpeed;
</script>

<section
  class="container"
  aria-labelledby={infoboxId}
  transition:fly={{ x: "-20%", duration: transitionSpeedMs }}
>
  <svg
    style="visibility: hidden; position: absolute;"
    width="0"
    height="0"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
  >
    <defs>
      <filter id="round">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>

  <div class="border-container">
    <div class="border-box"></div>
    <div class="info-box">
      <h2 id={infoboxId}>{title}</h2>
      <slot />
    </div>
  </div>
</section>

<style>
  .container {
    --cut: 1rem;
    position: relative;
    flex: 1;
    padding: 0;
  }

  .border-container {
    filter: drop-shadow(0px 1px 4px rgba(26, 58, 58, 0.4));
  }

  .border-box {
    width: 100%;
    height: 100%;
    position: absolute;
    filter: url(#round);
    z-index: 1;
  }

  .border-box::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-foreground);
    -webkit-mask:
      linear-gradient(-45deg, transparent 0 var(--cut), #fff 0) bottom right,
      linear-gradient(135deg, transparent 0 var(--cut), #fff 0) top left;
    -webkit-mask-size: 51% 100%;
    -webkit-mask-repeat: no-repeat;
    mask:
      linear-gradient(-45deg, transparent 0 var(--cut), #fff 0) bottom right,
      linear-gradient(135deg, transparent 0 var(--cut), #fff 0) top left;
    mask-size: 51% 100%;
    mask-repeat: no-repeat;
  }

  .info-box {
    position: relative;
    z-index: 2;
    padding: 1rem;
  }

  .info-box h2 {
    margin: -0.25rem 0 0.5rem var(--cut);
  }
</style>
