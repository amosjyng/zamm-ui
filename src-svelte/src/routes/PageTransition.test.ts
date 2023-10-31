import { getTransitionTiming } from "./PageTransition.svelte";

describe("PageTransition", () => {
  it("should halve the duration if no overlap", () => {
    const totalTime = 100;
    const spacingFraction = 0;
    const expectedDuration = 50;
    const expectedDelay = 50;
    // check that our test is doing the math right
    // both durations will have the same length, so the total time is the time delay
    // before the second one starts plus the length of the second one
    expect(expectedDuration + expectedDelay).toEqual(totalTime);
    // check that our function is doing the math right
    expect(getTransitionTiming(totalTime, spacingFraction)).toEqual({
      duration: expectedDuration,
      delay: expectedDelay,
    });
  });

  it("should increase delay if positive overlap", () => {
    const totalTime = 220;
    const spacingFraction = 0.2;
    const expectedDuration = 100;
    const expectedDelay = 120;
    expect(expectedDuration + expectedDelay).toEqual(totalTime);
    expect(getTransitionTiming(totalTime, spacingFraction)).toEqual({
      duration: expectedDuration,
      delay: expectedDelay,
    });
  });

  it("should increase duration if negative overlap", () => {
    const totalTime = 180;
    const spacingFraction = -0.2;
    const expectedDuration = 100;
    const expectedDelay = 80;
    expect(expectedDuration + expectedDelay).toEqual(totalTime);
    expect(getTransitionTiming(totalTime, spacingFraction)).toEqual({
      duration: expectedDuration,
      delay: expectedDelay,
    });
  });
});
