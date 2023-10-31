<script lang="ts" context="module">
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
    spacingFraction: number,
  ): TransitionTiming {
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
    spacingFraction: number,
  ): Transitions {
    const { duration, delay } = getTransitionTiming(
      totalDurationMs,
      spacingFraction,
    );
    const commonalities = { x: "-20%", duration };
    return {
      out: {
        ...commonalities,
        easing: cubicIn,
      },
      in: {
        ...commonalities,
        easing: cubicOut,
        delay,
      },
    };
  }
</script>

<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicIn, cubicOut } from "svelte/easing";
  import { animationSpeed } from "$lib/preferences";

  export let currentRoute: string;

  // same speed as sidebar UI
  $: totalDurationMs = 100 / $animationSpeed;
  $: transitions = getTransitions(totalDurationMs, 0.2);
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
