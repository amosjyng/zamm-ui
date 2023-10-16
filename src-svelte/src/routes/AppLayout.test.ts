import { expect, test, vi, assert } from "vitest";
import { get } from "svelte/store";
import "@testing-library/jest-dom";
import { tick } from "svelte";

import { render } from "@testing-library/svelte";
import AppLayout from "./AppLayout.svelte";
import { soundOn } from "../preferences";
import { parseSampleCall, type ParsedCall } from "$lib/sample-call-testing";

const tauriInvokeMock = vi.fn();

vi.stubGlobal("__TAURI_INVOKE__", tauriInvokeMock);

async function tickFor(ticks: number) {
  for (let i = 0; i < ticks; i++) {
    await tick();
  }
}

describe("AppLayout", () => {
  let unmatchedCalls: ParsedCall[];

  beforeEach(() => {
    vi.clearAllMocks();
    tauriInvokeMock.mockImplementation(
      (...args: (string | Record<string, string>)[]) => {
        const jsonArgs = JSON.stringify(args);
        const matchingCallIndex = unmatchedCalls.findIndex(
          (call) => JSON.stringify(call.request) === jsonArgs,
        );
        assert(
          matchingCallIndex !== -1,
          `No matching call found for ${jsonArgs}`,
        );
        const matchingCall = unmatchedCalls[matchingCallIndex].response;
        unmatchedCalls.splice(matchingCallIndex, 1);
        return Promise.resolve(matchingCall);
      },
    );
  });

  test("will do nothing if no custom settings exist", async () => {
    expect(get(soundOn)).toBe(true);
    expect(tauriInvokeMock).not.toHaveBeenCalled();

    const getPreferencesCall = parseSampleCall(
      "../src-tauri/api/sample-calls/get_preferences-no-file.yaml",
      false,
    );
    unmatchedCalls = [getPreferencesCall];

    render(AppLayout, {});
    await tickFor(3);
    expect(get(soundOn)).toBe(true);
    expect(tauriInvokeMock).toBeCalledTimes(1);
  });

  test("will set sound if sound preference overridden", async () => {
    expect(get(soundOn)).toBe(true);
    expect(tauriInvokeMock).not.toHaveBeenCalled();

    const getPreferencesCall = parseSampleCall(
      "../src-tauri/api/sample-calls/get_preferences-sound-override.yaml",
      false,
    );
    unmatchedCalls = [getPreferencesCall];

    render(AppLayout, {});
    await tickFor(3);
    expect(get(soundOn)).toBe(false);
    expect(tauriInvokeMock).toBeCalledTimes(1);
  });
});
