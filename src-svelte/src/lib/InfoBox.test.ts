import {
  getAnimationTiming,
  PrimitiveTimingMs,
  PrimitiveTimingFraction,
  TimingGroupAsCollection,
  TimingGroupAsIndividual,
} from "./InfoBox.svelte";

describe("InfoBox animation timing", () => {
  it("should enable ms timings to be defined in different ways", () => {
    const timingMs1 = new PrimitiveTimingMs({ startMs: 100, endMs: 300 });
    const timingMs2 = new PrimitiveTimingMs({ delayMs: 100, durationMs: 200 });
    expect(timingMs1).toEqual(timingMs2);
  });

  it("should enable fractional timings to be defined in different ways", () => {
    const timingMs1 = new PrimitiveTimingFraction({
      startFraction: 0.2,
      endFraction: 0.7,
    });
    const timingMs2 = new PrimitiveTimingFraction({
      delayFraction: 0.2,
      durationFraction: 0.5,
    });
    expect(timingMs1.round()).toEqual(timingMs2.round());
  });

  it("should nest and unnest timings correctly", () => {
    const timingMs = new PrimitiveTimingMs({ startMs: 200, endMs: 400 });
    const timingFraction = new PrimitiveTimingFraction({
      startFraction: 0.2,
      endFraction: 0.6,
    });
    const overall = new PrimitiveTimingMs({ startMs: 100, endMs: 600 });
    expect(timingMs.nestInside(overall).round()).toEqual(
      timingFraction.round(),
    );
    expect(timingFraction.unnestFrom(overall).round()).toEqual(timingMs);
  });

  it("should correctly combine groups of sub-animations into one", () => {
    const collectionMs = new TimingGroupAsCollection([
      new PrimitiveTimingMs({ startMs: 100, endMs: 400 }),
      new PrimitiveTimingMs({ startMs: 200, endMs: 500 }),
    ]);
    const collectionFraction = new TimingGroupAsIndividual({
      overall: new PrimitiveTimingMs({ startMs: 100, endMs: 500 }),
      children: [
        new PrimitiveTimingFraction({ startFraction: 0.0, endFraction: 0.75 }),
        new PrimitiveTimingFraction({ startFraction: 0.25, endFraction: 1.0 }),
      ],
    });
    expect(collectionMs.asIndividual()).toEqual(collectionFraction);
    expect(collectionFraction.asCollection()).toEqual(collectionMs);
  });

  it("should be the default if no additional scaling or delay", () => {
    const preDelay = 0;
    const timingScaleFactor = 1;
    const timing = getAnimationTiming(preDelay, timingScaleFactor);

    // regular border box animation values
    expect(timing.borderBox.growX().startFraction()).toEqual(0.0);
    expect(timing.borderBox.growX().endFraction()).toEqual(0.5);
    expect(timing.borderBox.growY().startFraction()).toEqual(0.4);
    expect(timing.borderBox.growY().endFraction()).toEqual(1.0);
    expect(timing.borderBox.overall.startMs()).toEqual(0);
    expect(timing.borderBox.overall.endMs()).toEqual(200);

    // regular title animation values
    const titleCollectionMs = new TimingGroupAsCollection([
      new PrimitiveTimingMs({ startMs: 20, endMs: 80 }),
      new PrimitiveTimingMs({ startMs: 80, endMs: 200 }),
    ]);
    expect(timing.title.asCollection()).toEqual(titleCollectionMs);

    // regular info box animation values
    expect(timing.infoBox.delayMs()).toEqual(150);
    expect(timing.infoBox.durationMs()).toEqual(100);
  });

  it("should not let delays affect fractions or durations", () => {
    const preDelay = 100;
    const timingScaleFactor = 1;
    const timing = getAnimationTiming(preDelay, timingScaleFactor);

    // regular border box animation values
    expect(timing.borderBox.growX().startFraction()).toEqual(0.0);
    expect(timing.borderBox.growX().endFraction()).toEqual(0.5);
    expect(timing.borderBox.growY().startFraction()).toEqual(0.4);
    expect(timing.borderBox.growY().endFraction()).toEqual(1.0);
    expect(timing.borderBox.overall.startMs()).toEqual(100);
    expect(timing.borderBox.overall.endMs()).toEqual(300);

    // regular title animation values
    const titleCollectionMs = new TimingGroupAsCollection([
      new PrimitiveTimingMs({ startMs: 120, endMs: 180 }),
      new PrimitiveTimingMs({ startMs: 180, endMs: 300 }),
    ]);
    expect(timing.title.asCollection()).toEqual(titleCollectionMs);

    // regular info box animation values
    expect(timing.infoBox.delayMs()).toEqual(250);
    expect(timing.infoBox.durationMs()).toEqual(100);
  });

  it("should not let scaling affect fractions", () => {
    const preDelay = 100;
    const timingScaleFactor = 10;
    const timing = getAnimationTiming(preDelay, timingScaleFactor);

    // regular border box animation values
    expect(timing.borderBox.growX().startFraction()).toEqual(0.0);
    expect(timing.borderBox.growX().endFraction()).toEqual(0.5);
    expect(timing.borderBox.growY().startFraction()).toEqual(0.4);
    expect(timing.borderBox.growY().endFraction()).toEqual(1.0);
    expect(timing.borderBox.overall.startMs()).toEqual(1000);
    expect(timing.borderBox.overall.endMs()).toEqual(3000);

    // regular title animation values
    const titleCollectionMs = new TimingGroupAsCollection([
      new PrimitiveTimingMs({ startMs: 1200, endMs: 1800 }),
      new PrimitiveTimingMs({ startMs: 1800, endMs: 3000 }),
    ]);
    expect(timing.title.asCollection()).toEqual(titleCollectionMs);

    // regular info box animation values
    expect(timing.infoBox.delayMs()).toEqual(2500);
    expect(timing.infoBox.durationMs()).toEqual(1000);
  });
});
