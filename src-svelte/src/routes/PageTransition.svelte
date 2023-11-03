<script lang="ts" context="module">
  import { cubicIn, backOut } from "svelte/easing";

  interface TransitionTiming {
    duration: number;
    delay?: number;
  }

  interface Transition extends TransitionTiming {
    x: string;
    easing: (t: number) => number;
  }

  interface Transitions {
    out: Transition;
    in: Transition;
  }

  export function getTransitionTiming(
    totalDurationMs: number,
    overlapFraction: number,
  ): TransitionTiming {
    const spacingFraction = -overlapFraction;
    // let
    //   d = duration of a single transition
    //   s = spacing between transitions as fraction of d
    //   and T = total duration of entire transition,
    // then
    //   d + (d * (1 + spacing)) = T
    //   d * (2 + spacing) = T
    //   d = T / (2 + spacing)
    const transitionDurationMs = totalDurationMs / (2 + spacingFraction);
    const transitionDelayMs = transitionDurationMs * (1 + spacingFraction);
    return {
      duration: Math.round(transitionDurationMs),
      delay: Math.round(transitionDelayMs),
    };
  }

  export function getTransitions(
    totalDurationMs: number,
    overlapFraction: number,
  ): Transitions {
    const { duration, delay } = getTransitionTiming(
      totalDurationMs,
      overlapFraction,
    );
    const out = { x: "-20%", duration, easing: cubicIn };
    return {
      out,
      in: { ...out, delay, easing: backOut },
    };
  }
</script>

<script lang="ts">
  import { fly } from "svelte/transition";
  import { animationsOn, animationSpeed } from "$lib/preferences";
  import { firstPageLoad } from "$lib/firstPageLoad";

  export let currentRoute: string;
  const visitedKeys = new Set<string>();

  function checkFirstPageLoad(key: string) {
    if (visitedKeys.has(key)) {
      firstPageLoad.set(false);
    } else {
      visitedKeys.add(key);
      firstPageLoad.set(true);
    }
  }

  // twice the speed of sidebar UI slider
  $: totalDurationMs = $animationsOn ? 200 / $animationSpeed : 0;
  $: transitions = getTransitions(totalDurationMs, 0);
  $: checkFirstPageLoad(currentRoute);
</script>

{#key currentRoute}
  <div
    class="transition-container"
    in:fly={transitions.in}
    out:fly={transitions.out}
  >
    <slot />
  </div>
{/key}

<style>
  .transition-container {
    position: absolute;
    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
  }
</style>
