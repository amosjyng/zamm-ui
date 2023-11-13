<script lang="ts" context="module">
  export interface TransitionTimingMs {
    durationMs(): number;
    delayMs(): number;
    startMs(): number;
    endMs(): number;
    round(): TransitionTimingMs;
    delayByMs(delayMs: number): TransitionTimingMs;
    hastenByMs(hastenMs: number): TransitionTimingMs;
    scaleBy(factor: number): TransitionTimingMs;
    nestInside(container: TransitionTimingMs): TransitionTimingFraction;
  }

  export interface TransitionTimingFraction {
    durationFraction(): number;
    delayFraction(): number;
    startFraction(): number;
    endFraction(): number;
    round(): TransitionTimingFraction;
    unnestFrom(container: TransitionTimingMs): TransitionTimingMs;
    localize(globalTimeFraction: number): number;
  }

  export class PrimitiveTimingMs implements TransitionTimingMs {
    _durationMs: number;
    _delayMs: number;

    constructor({
      durationMs,
      delayMs,
      startMs,
      endMs,
    }: {
      durationMs?: number;
      delayMs?: number;
      startMs?: number;
      endMs?: number;
    }) {
      if ((delayMs === undefined) === (startMs === undefined)) {
        throw new Error("Exactly one of delayMs or startMs must be provided");
      }
      if ((durationMs === undefined) === (endMs === undefined)) {
        throw new Error("Exactly one of durationMs or endMs must be provided");
      }
      this._delayMs = (delayMs ?? startMs) as number;
      this._durationMs = durationMs ?? (endMs as number) - this._delayMs;
    }

    round(): PrimitiveTimingMs {
      return new PrimitiveTimingMs({
        durationMs: Math.round(this._durationMs),
        delayMs: Math.round(this._delayMs),
      });
    }

    durationMs(): number {
      return this._durationMs;
    }

    delayMs(): number {
      return this._delayMs;
    }

    startMs(): number {
      return this._delayMs;
    }

    endMs(): number {
      return this._delayMs + this._durationMs;
    }

    delayByMs(delayMs: number): PrimitiveTimingMs {
      return new PrimitiveTimingMs({
        durationMs: this._durationMs,
        delayMs: this._delayMs + delayMs,
      });
    }

    hastenByMs(hastenMs: number): PrimitiveTimingMs {
      return this.delayByMs(-hastenMs);
    }

    scaleBy(factor: number): PrimitiveTimingMs {
      return new PrimitiveTimingMs({
        durationMs: this._durationMs * factor,
        delayMs: this._delayMs * factor,
      });
    }

    toFraction(totalDurationMs: number): PrimitiveTimingFraction {
      if (totalDurationMs === 0) {
        return new PrimitiveTimingFraction({
          // if duration is total, then the fraction is meaningless
          // might as well set it to 1 to prevent further division by zero
          durationFraction: 1,
          delayFraction: 1,
        });
      }
      return new PrimitiveTimingFraction({
        durationFraction: this._durationMs / totalDurationMs,
        delayFraction: this._delayMs / totalDurationMs,
      });
    }

    nestInside(container: TransitionTimingMs): PrimitiveTimingFraction {
      return this.hastenByMs(container.delayMs()).toFraction(
        container.durationMs(),
      );
    }
  }

  export class PrimitiveTimingFraction implements TransitionTimingFraction {
    _durationFraction: number;
    _delayFraction: number;

    constructor({
      durationFraction,
      delayFraction,
      startFraction,
      endFraction,
    }: {
      durationFraction?: number;
      delayFraction?: number;
      startFraction?: number;
      endFraction?: number;
    }) {
      if ((delayFraction === undefined) === (startFraction === undefined)) {
        throw new Error(
          "Exactly one of delayFraction or startMs must be provided",
        );
      }
      if ((durationFraction === undefined) === (endFraction === undefined)) {
        throw new Error(
          "Exactly one of durationFraction or endMs must be provided",
        );
      }
      this._delayFraction = (delayFraction ?? startFraction) as number;
      this._durationFraction =
        durationFraction ?? (endFraction as number) - this._delayFraction;
    }

    round(): PrimitiveTimingFraction {
      const precision = 10_000;
      return new PrimitiveTimingFraction({
        durationFraction:
          Math.round(this._durationFraction * precision) / precision,
        delayFraction: Math.round(this._delayFraction * precision) / precision,
      });
    }

    delayFraction(): number {
      return this._delayFraction;
    }

    durationFraction(): number {
      return this._durationFraction;
    }

    startFraction(): number {
      return this._delayFraction;
    }

    endFraction(): number {
      return this._delayFraction + this._durationFraction;
    }

    toMs(totalDurationMs: number): PrimitiveTimingMs {
      return new PrimitiveTimingMs({
        durationMs: this._durationFraction * totalDurationMs,
        delayMs: this._delayFraction * totalDurationMs,
      });
    }

    unnestFrom(container: TransitionTimingMs): PrimitiveTimingMs {
      return this.toMs(container.durationMs()).delayByMs(container.delayMs());
    }

    localize(globalTimeFraction: number): number {
      if (globalTimeFraction < this.startFraction()) {
        return 0;
      } else if (globalTimeFraction > this.endFraction()) {
        return 1;
      }

      const localTimeFraction =
        (globalTimeFraction - this._delayFraction) / this._durationFraction;
      return localTimeFraction;
    }
  }

  export class TimingGroupAsCollection implements TransitionTimingMs {
    children: TransitionTimingMs[];

    constructor(children: TransitionTimingMs[]) {
      this.children = children;
    }

    startMs(): number {
      const startTimes = this.children.map((child) => child.startMs());
      return Math.min(...startTimes);
    }

    endMs(): number {
      const endTimes = this.children.map((child) => child.endMs());
      return Math.max(...endTimes);
    }

    durationMs(): number {
      return this.endMs() - this.startMs();
    }

    delayMs(): number {
      return this.startMs();
    }

    overallTiming(): PrimitiveTimingMs {
      return new PrimitiveTimingMs({
        durationMs: this.durationMs(),
        delayMs: this.delayMs(),
      });
    }

    round(): TimingGroupAsCollection {
      return new TimingGroupAsCollection(
        this.children.map((child) => child.round()),
      );
    }

    delayByMs(delayMs: number): TimingGroupAsCollection {
      return new TimingGroupAsCollection(
        this.children.map((child) => child.delayByMs(delayMs)),
      );
    }

    hastenByMs(hastenMs: number): TimingGroupAsCollection {
      return new TimingGroupAsCollection(
        this.children.map((child) => child.hastenByMs(hastenMs)),
      );
    }

    scaleBy(factor: number): TimingGroupAsCollection {
      return new TimingGroupAsCollection(
        this.children.map((child) => child.scaleBy(factor)),
      );
    }

    nestInside(_: TransitionTimingMs): TransitionTimingFraction {
      throw new Error("Recursive nesting not implemented");
    }

    asIndividual(): TimingGroupAsIndividual {
      const overall = this.overallTiming();
      const nestedChildren = this.children.map((child) =>
        child.nestInside(overall),
      );
      return new TimingGroupAsIndividual({
        overall,
        children: nestedChildren,
      });
    }
  }

  export class TimingGroupAsIndividual implements TransitionTimingMs {
    overall: TransitionTimingMs;
    children: TransitionTimingFraction[];

    constructor({
      overall,
      children,
    }: {
      overall: TransitionTimingMs;
      children: TransitionTimingFraction[];
    }) {
      this.overall = overall;
      this.children = children;
    }

    durationMs(): number {
      return this.overall.durationMs();
    }

    delayMs(): number {
      return this.overall.delayMs();
    }

    startMs(): number {
      return this.overall.startMs();
    }

    endMs(): number {
      return this.overall.endMs();
    }

    round(): TimingGroupAsIndividual {
      return new TimingGroupAsIndividual({
        overall: this.overall.round(),
        children: this.children.map((child) => child.round()),
      });
    }

    delayByMs(delayMs: number): TimingGroupAsIndividual {
      return new TimingGroupAsIndividual({
        overall: this.overall.delayByMs(delayMs),
        children: this.children,
      });
    }

    hastenByMs(hastenMs: number): TimingGroupAsIndividual {
      return new TimingGroupAsIndividual({
        overall: this.overall.hastenByMs(hastenMs),
        children: this.children,
      });
    }

    scaleBy(factor: number): TimingGroupAsIndividual {
      return new TimingGroupAsIndividual({
        overall: this.overall.scaleBy(factor),
        children: this.children,
      });
    }

    nestInside(_: TransitionTimingMs): TransitionTimingFraction {
      throw new Error("Recursive nesting not implemented");
    }

    asCollection(): TimingGroupAsCollection {
      const unnestedChildren = this.children.map((child) =>
        child.unnestFrom(this.overall),
      );
      return new TimingGroupAsCollection(unnestedChildren);
    }
  }

  class BorderBoxTimingCollection extends TimingGroupAsCollection {
    growX(): TransitionTimingMs {
      return this.children[0];
    }

    growY(): TransitionTimingMs {
      return this.children[1];
    }

    round(): BorderBoxTimingCollection {
      return new BorderBoxTimingCollection(super.round().children);
    }

    delayByMs(delayMs: number): BorderBoxTimingCollection {
      return new BorderBoxTimingCollection(super.delayByMs(delayMs).children);
    }

    scaleBy(factor: number): BorderBoxTimingCollection {
      return new BorderBoxTimingCollection(super.scaleBy(factor).children);
    }

    asIndividual(): BorderBoxTiming {
      const groupTimingFraction = super.asIndividual();
      return new BorderBoxTiming({
        overall: groupTimingFraction.overall,
        children: groupTimingFraction.children,
      });
    }
  }

  export function newBorderBoxTimingCollection({
    growX,
    growY,
  }: {
    growX: TransitionTimingMs;
    growY: TransitionTimingMs;
  }): BorderBoxTimingCollection {
    return new BorderBoxTimingCollection([growX, growY]);
  }

  export class BorderBoxTiming extends TimingGroupAsIndividual {
    growX(): TransitionTimingFraction {
      return this.children[0];
    }

    growY(): TransitionTimingFraction {
      return this.children[1];
    }

    round(): BorderBoxTiming {
      const rounded = super.round();
      return new BorderBoxTiming({
        overall: rounded.overall,
        children: rounded.children,
      });
    }

    asCollection(): BorderBoxTimingCollection {
      const groupTimingMs = super.asCollection();
      return new BorderBoxTimingCollection(groupTimingMs.children);
    }
  }

  class TitleTimingCollection extends TimingGroupAsCollection {
    typewriter(): TransitionTimingMs {
      return this.children[0];
    }

    cursorFade(): TransitionTimingMs {
      return this.children[1];
    }

    delayByMs(delayMs: number): TitleTimingCollection {
      return new TitleTimingCollection(super.delayByMs(delayMs).children);
    }

    scaleBy(factor: number): TitleTimingCollection {
      return new TitleTimingCollection(super.scaleBy(factor).children);
    }

    asIndividual(): TitleTiming {
      const groupTimingFraction = super.asIndividual();
      return new TitleTiming({
        overall: groupTimingFraction.overall,
        children: groupTimingFraction.children,
      });
    }
  }

  export function newTitleTimingCollection({
    typewriter,
    cursorFade,
  }: {
    typewriter: TransitionTimingMs;
    cursorFade: TransitionTimingMs;
  }): TitleTimingCollection {
    return new TitleTimingCollection([typewriter, cursorFade]);
  }

  export class TitleTiming extends TimingGroupAsIndividual {
    typewriter(): TransitionTimingFraction {
      return this.children[0];
    }

    cursorFade(): TransitionTimingFraction {
      return this.children[1];
    }

    asCollection(): TitleTimingCollection {
      const groupTimingMs = super.asCollection();
      return new TitleTimingCollection(groupTimingMs.children);
    }
  }

  export interface InfoBoxTiming {
    borderBox: BorderBoxTiming;
    title: TitleTiming;
    infoBox: TransitionTimingMs;
  }

  class InfoBoxTimingCollection extends TimingGroupAsCollection {
    borderBox(): BorderBoxTimingCollection {
      return this.children[0] as BorderBoxTimingCollection;
    }

    title(): TitleTimingCollection {
      return this.children[1] as TitleTimingCollection;
    }

    infoBox(): TransitionTimingMs {
      return this.children[2];
    }

    delayByMs(delayMs: number): InfoBoxTimingCollection {
      return new InfoBoxTimingCollection(super.delayByMs(delayMs).children);
    }

    scaleBy(factor: number): InfoBoxTimingCollection {
      return new InfoBoxTimingCollection(super.scaleBy(factor).children);
    }

    finalize(): InfoBoxTiming {
      return {
        borderBox: this.borderBox().asIndividual(),
        title: this.title().asIndividual(),
        infoBox: this.infoBox(),
      };
    }
  }

  function newInfoBoxTimingCollection({
    borderBox,
    title,
    infoBox,
  }: {
    borderBox: BorderBoxTimingCollection;
    title: TitleTimingCollection;
    infoBox: TransitionTimingMs;
  }) {
    return new InfoBoxTimingCollection([borderBox, title, infoBox]);
  }

  export function getAnimationTiming(
    overallDelayMs: number,
    timingScaleFactor: number,
  ): InfoBoxTiming {
    const growX = new PrimitiveTimingMs({
      startMs: 0,
      durationMs: 200,
    });
    const growY = new PrimitiveTimingMs({
      startMs: growX.endMs() - 20,
      durationMs: 150,
    });
    const borderBox = newBorderBoxTimingCollection({ growX, growY });
    const typewriter = new PrimitiveTimingMs({
      // give X a head start
      startMs: growX.startMs() + 20,
      // but finish at the same time
      endMs: growX.endMs(),
    });
    const cursorFade = new PrimitiveTimingMs({
      // stay for a second after typewriter finishes
      startMs: typewriter.endMs() + 40,
      // finishes simultaneously with Y
      endMs: growY.endMs(),
    });
    const infoBox = new PrimitiveTimingMs({
      // can start fading in before border box finishes growing completely, so long as
      // border box growth is *mostly* done and already contains the entirety of the
      // info box
      delayMs: growY.startMs(),
      durationMs: 260,
    });
    const title = newTitleTimingCollection({ typewriter, cursorFade });
    const infoBoxTimingCollection = newInfoBoxTimingCollection({
      borderBox,
      title,
      infoBox,
    });
    return infoBoxTimingCollection
      .delayByMs(overallDelayMs)
      .scaleBy(timingScaleFactor)
      .finalize();
  }

  class SubAnimation<T> {
    timing: TransitionTimingFraction;
    tick: (tLocalFraction: number) => T;

    constructor(anim: {
      timing: TransitionTimingFraction;
      tick: (tLocalFraction: number) => T;
    }) {
      this.timing = anim.timing;
      this.tick = anim.tick;
    }

    tickForGlobalTime(tGlobalFraction: number): T {
      return this.tick(this.timing.localize(tGlobalFraction));
    }
  }

  export function inverseCubicInOut(t: number) {
    if (t < 0.5) {
      // Solve the cubic equation for t < 0.5
      return Math.cbrt(t / 4.0);
    } else {
      // Solve the cubic equation for t >= 0.5
      return (Math.cbrt(2.0 * (t - 1.0)) + 2.0) / 2.0;
    }
  }
</script>

<script lang="ts">
  import getComponentId from "./label-id";
  import { cubicInOut, cubicOut, linear } from "svelte/easing";
  import { animationSpeed, animationsOn } from "./preferences";
  import type { TransitionConfig } from "svelte/transition";
  import { firstAppLoad, firstPageLoad } from "./firstPageLoad";

  export let title = "";
  export let childNumber = 0;
  export let preDelay = $firstAppLoad ? 0 : 100;
  export let maxWidth = "50rem";
  const infoboxId = getComponentId("infobox");
  let titleElement: HTMLElement | undefined;
  const perChildStagger = 100;
  const totalDelay = preDelay + childNumber * perChildStagger;

  class ProperyAnimation extends SubAnimation<string> {
    constructor(anim: {
      timing: TransitionTimingFraction;
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
      super({ timing: anim.timing, tick: css });
    }
  }

  function revealOutline(
    node: Element,
    timing: BorderBoxTiming,
  ): TransitionConfig {
    const actualWidth = node.clientWidth;
    const actualHeight = node.clientHeight;
    const heightPerTitleLinePx = 26;
    const titleHeight = (titleElement as HTMLElement).clientHeight;
    // multiply by 1.3 to account for small pixel differences between browsers
    const titleIsMultiline = titleHeight > heightPerTitleLinePx * 1.3;
    const minHeight = titleHeight + heightPerTitleLinePx; // add a little for padding
    const minWidth = 3.5 * heightPerTitleLinePx;

    const growWidth = new ProperyAnimation({
      timing: timing.growX(),
      property: "width",
      min: minWidth,
      max: actualWidth,
      unit: "px",
      easingFunction: titleIsMultiline ? cubicOut : linear,
    });

    const growHeight = new ProperyAnimation({
      timing: timing.growY(),
      property: "height",
      min: minHeight,
      max: actualHeight,
      unit: "px",
      easingFunction: cubicInOut,
    });

    return {
      delay: timing.overall.delayMs(),
      duration: timing.overall.durationMs(),
      css: (tFraction: number) => {
        const width = growWidth.tickForGlobalTime(tFraction);
        const height = growHeight.tickForGlobalTime(tFraction);
        return width + height;
      },
    };
  }

  class TypewriterEffect extends SubAnimation<void> {
    constructor(anim: { node: Element; timing: TransitionTimingFraction }) {
      const text = anim.node.textContent ?? "";
      const length = text.length + 1;
      super({
        timing: anim.timing,
        tick: (tLocalFraction: number) => {
          const i = Math.trunc(length * tLocalFraction);
          anim.node.textContent = i === 0 ? "" : text.slice(0, i - 1);
        },
      });
    }
  }

  class FadeCursorEffect extends SubAnimation<void> {
    constructor(anim: { node: Element; timing: TransitionTimingFraction }) {
      const easingFunction = cubicOut;
      super({
        timing: anim.timing,
        tick: (tLocalFraction: number) => {
          const opacity = 1 - easingFunction(tLocalFraction);
          anim.node.setAttribute("style", `--cursor-opacity: ${opacity};`);
        },
      });
    }
  }

  function revealTitle(node: Element, timing: TitleTiming): TransitionConfig {
    const typewriter = new TypewriterEffect({
      node,
      timing: timing.typewriter(),
    });
    const cursorFade = new FadeCursorEffect({
      node,
      timing: timing.cursorFade(),
    });

    return {
      delay: timing.overall.delayMs(),
      duration: timing.overall.durationMs(),
      tick: (tGlobalFraction: number) => {
        if (timing.durationMs() === 0) {
          return;
        }
        typewriter.tickForGlobalTime(tGlobalFraction);
        cursorFade.tickForGlobalTime(tGlobalFraction);
      },
    };
  }

  class RevealContent extends SubAnimation<void> {
    constructor(anim: { node: Element; timing: TransitionTimingFraction }) {
      const easingFunction = linear;
      super({
        timing: anim.timing,
        tick: (tLocalFraction: number) => {
          const opacity = easingFunction(tLocalFraction);
          anim.node.setAttribute("style", `opacity: ${opacity};`);
        },
      });
    }
  }

  function revealInfoBox(node: Element, timing: InfoBoxTiming) {
    // the items near the bottom can be revealed early instead of waiting for the
    // border box to completely finish growing. This is because the cubic in-out growth
    // feels very slow towards the end, and to wait for this to finish before starting
    // the fade-in makes the fade-in of the last item in particular feel
    // disproportionately slow. Therefore, we cap the "effective" bottom of the node
    // at 70% of the parent's actual height.
    const earlyRevealFraction = 0.3;
    const revealCutoffFraction = 1 - earlyRevealFraction;
    // how much time we have in total to kick off animations:
    // 1. This should actually take the same amount of time as Y takes to grow,
    //    except that it's slightly delayed to give Y growth a headstart
    // 2. This should leave enough time for the last element to transition
    const totalKickoffMs = timing.borderBox.asCollection().growY().durationMs();
    const theoreticalTotalKickoffFraction =
      totalKickoffMs / timing.infoBox.durationMs();
    if (theoreticalTotalKickoffFraction > 1) {
      throw new Error("Info box animation is too short to reveal all elements");
    }
    const actualTotalKickoffFraction =
      theoreticalTotalKickoffFraction * revealCutoffFraction;
    const perElementRevealFraction = 1 - actualTotalKickoffFraction;
    const { height: infoBoxHeight, top: infoBoxTop } =
      node.getBoundingClientRect();
    const revealAnimations: RevealContent[] = [];

    const getChildKickoffFraction = (child: Element) => {
      const childRect = child.getBoundingClientRect();
      const childBottomYRelativeToInfoBox =
        childRect.top + childRect.height - infoBoxTop;
      const equivalentYProgress = inverseCubicInOut(
        childBottomYRelativeToInfoBox / infoBoxHeight,
      );
      const adjustedYProgress = Math.min(
        revealCutoffFraction,
        equivalentYProgress,
      );
      const delayFraction = adjustedYProgress * theoreticalTotalKickoffFraction;
      return new PrimitiveTimingFraction({
        delayFraction,
        durationFraction: perElementRevealFraction,
      });
    };

    const addNodeAnimations = (currentNode: Element) => {
      // if there are text-only elements that are not part of any node, we fade-in the
      // whole parent at once to avoid the text appearing before anything else -- e.g.
      // if there's something like "some text in <em>some tag</em>", the "some text in"
      // will appear immediately while "some tag" takes a moment to fade in
      if (
        currentNode.children.length === 0 ||
        currentNode.children.length === currentNode.childNodes.length
      ) {
        revealAnimations.push(
          new RevealContent({
            node: currentNode,
            timing: getChildKickoffFraction(currentNode),
          }),
        );
      } else {
        for (const child of currentNode.children) {
          addNodeAnimations(child);
        }
      }
    };

    addNodeAnimations(node);

    return {
      delay: timing.infoBox.delayMs(),
      duration: timing.infoBox.durationMs(),
      tick: (tGlobalFraction: number) => {
        if (timing.infoBox.durationMs() === 0) {
          return;
        }

        revealAnimations.forEach((anim) => {
          anim.tickForGlobalTime(tGlobalFraction);
        });
      },
    };
  }

  $: shouldAnimate = $animationsOn && $firstPageLoad;
  $: timingScaleFactor = shouldAnimate ? 1 / $animationSpeed : 0;
  $: timing = getAnimationTiming(totalDelay, timingScaleFactor);
</script>

<section
  class="container"
  aria-labelledby={infoboxId}
  style="max-width: {maxWidth};"
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
    <div class="border-box" in:revealOutline|global={timing.borderBox}></div>
    <div class="info-box">
      <h2
        in:revealTitle|global={timing.title}
        id={infoboxId}
        bind:this={titleElement}
      >
        {title}
      </h2>
      <div class="info-content" in:revealInfoBox|global={timing}>
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
    --cursor-opacity: 0;
    margin: -0.25rem 0 0.5rem var(--cut);
  }

  .info-box h2::after {
    content: "█";
    opacity: var(--cursor-opacity);
  }
</style>
