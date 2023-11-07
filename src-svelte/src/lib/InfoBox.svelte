<script lang="ts">
  import getComponentId from "./label-id";
  import { cubicInOut } from "svelte/easing";
  import { animationSpeed, animationsOn } from "./preferences";
  import { fade } from "svelte/transition";
  import { firstPageLoad } from "./firstPageLoad";

  export let title = "";
  const infoboxId = getComponentId("infobox");
  const heightDelayFraction = 0.4;

  class SubAnimation {
    delayFraction: number;
    durationFraction: number;
    css: (t: number) => string;

    constructor(anim: {
      delayFraction: number;
      durationFraction: number;
      css: (t: number) => string;
    }) {
      this.delayFraction = anim.delayFraction;
      this.durationFraction = anim.durationFraction;
      this.css = anim.css;
    }

    cssForGlobalTime(t: number) {
      if (t < this.delayFraction) {
        return this.css(0);
      } else if (t > this.delayFraction + this.durationFraction) {
        return this.css(1);
      }

      const subAnimationTime = (t - this.delayFraction) / this.durationFraction;
      return this.css(subAnimationTime);
    }
  }

  class ProperyAnimation extends SubAnimation {
    constructor(anim: {
      delayFraction: number;
      durationFraction: number;
      property: string;
      min: number;
      max: number;
      unit: string;
      easingFunction?: (t: number) => number;
    }) {
      const growth = anim.max - anim.min;
      const easingFunction = anim.easingFunction ?? cubicInOut;
      const css = (t: number) => {
        const easing = easingFunction(t);
        const value = anim.min + growth * easing;
        return `${anim.property}: ${value}${anim.unit};`;
      };
      super({
        delayFraction: anim.delayFraction,
        durationFraction: anim.durationFraction,
        css,
      });
    }
  }

  interface AnimationParams {
    delay: number;
    duration: number;
  }

  function reveal(node: Element, { delay, duration }: AnimationParams) {
    const actualWidth = node.clientWidth;
    const actualHeight = node.clientHeight;
    const minDimensions = 3 * 18; // 3 rem

    const growWidth = new ProperyAnimation({
      delayFraction: 0,
      durationFraction: 0.5,
      property: "width",
      min: minDimensions,
      max: actualWidth,
      unit: "px",
    });

    const growHeight = new ProperyAnimation({
      delayFraction: heightDelayFraction,
      durationFraction: 1 - heightDelayFraction,
      property: "height",
      min: minDimensions,
      max: actualHeight,
      unit: "px",
    });

    return {
      delay,
      duration,
      css: (t: number) => {
        const width = growWidth.cssForGlobalTime(t);
        const height = growHeight.cssForGlobalTime(t);
        return width + height;
      },
    };
  }

  function typewriter(node: Element, { delay, duration }: AnimationParams) {
    const valid =
      node.childNodes.length === 1 &&
      node.childNodes[0].nodeType === Node.TEXT_NODE;

    if (!valid) {
      throw new Error(
        `This transition only works on elements with a single text node child`,
      );
    }

    const text = node.textContent ?? "";
    const length = text.length + 1;

    return {
      delay,
      duration,
      tick: (t: number) => {
        if (duration === 0) {
          return;
        }
        const i = Math.trunc(length * t);
        node.textContent = i === 0 ? "" : text.slice(0, i - 1);
        if (t == 0) {
          node.classList.remove("typewriting");
          node.classList.remove("done");
        } else if (t == 1) {
          node.classList.add("done");
        } else {
          node.classList.add("typewriting");
        }
      },
    };
  }

  $: shouldAnimate = $animationsOn && $firstPageLoad;
  // let the first half of page transition play before starting
  $: borderBoxDelay = shouldAnimate ? 100 / $animationSpeed : 0;
  $: borderBoxDuration = shouldAnimate ? 200 / $animationSpeed : 0;
  $: infoBoxDelay = shouldAnimate ? 260 / $animationSpeed : 0;
  $: infoBoxDuration = shouldAnimate ? 100 / $animationSpeed : 0;
  $: heightStart = borderBoxDelay + heightDelayFraction * borderBoxDuration;
  $: titleDelay = shouldAnimate ? 120 / $animationSpeed : 0;
  // title typing should end when height starts growing
  $: titleDuration = heightStart - titleDelay;
  // cursor fade should end when height stops growing
  $: cursorFadeDuration = (1 - heightDelayFraction) * borderBoxDuration;
</script>

<section class="container" aria-labelledby={infoboxId}>
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
    <div
      class="border-box"
      in:reveal|global={{ delay: borderBoxDelay, duration: borderBoxDuration }}
    ></div>
    <div class="info-box">
      <h2
        in:typewriter|global={{ delay: titleDelay, duration: titleDuration }}
        id={infoboxId}
        style="--fade-duration: {cursorFadeDuration}ms;"
      >
        {title}
      </h2>
      <div
        class="info-content"
        in:fade|global={{ delay: infoBoxDelay, duration: infoBoxDuration }}
      >
        <slot />
      </div>
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

  .info-box :global(h2.typewriting::after) {
    content: "█";
    transition: opacity var(--fade-duration) ease-out;
  }

  .info-box :global(h2.typewriting.done::after) {
    opacity: 0;
  }
</style>
