import { expect, test, vi, assert } from "vitest";
import { get } from "svelte/store";
import "@testing-library/jest-dom";

import { act, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Settings from "./Settings.svelte";
import { soundOn } from "../../preferences";
import { parseSampleCall, type ParsedCall } from "$lib/sample-call-testing";

const tauriInvokeMock = vi.fn();

vi.stubGlobal("__TAURI_INVOKE__", tauriInvokeMock);

describe("Switch", () => {
  let playSwitchSoundCall: ParsedCall;
  let setSoundOnCall: ParsedCall;
  let setSoundOffCall: ParsedCall;
  let unmatchedCalls: ParsedCall[];

  beforeAll(() => {
    playSwitchSoundCall = parseSampleCall(
      "../src-tauri/api/sample-calls/play_sound-switch.yaml",
      true,
    );
    setSoundOnCall = parseSampleCall(
      "../src-tauri/api/sample-calls/set_preferences-sound-on.yaml",
      true,
    );
    setSoundOffCall = parseSampleCall(
      "../src-tauri/api/sample-calls/set_preferences-sound-off.yaml",
      true,
    );
  });

  beforeEach(() => {
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

  test("can toggle sound on and off while saving setting", async () => {
    render(Settings, {});
    expect(get(soundOn)).toBe(true);
    expect(tauriInvokeMock).not.toHaveBeenCalled();

    const soundSwitch = screen.getByLabelText("Sounds");
    unmatchedCalls = [setSoundOffCall];
    await act(() => userEvent.click(soundSwitch));
    expect(get(soundOn)).toBe(false);
    expect(tauriInvokeMock).toBeCalledTimes(1);
    expect(unmatchedCalls.length).toBe(0);

    unmatchedCalls = [setSoundOnCall, playSwitchSoundCall];
    await act(() => userEvent.click(soundSwitch));
    expect(get(soundOn)).toBe(true);
    expect(tauriInvokeMock).toBeCalledTimes(3);
    expect(unmatchedCalls.length).toBe(0);
  });
});
