import { expect, test, vi, type Mock } from "vitest";
import { get } from "svelte/store";
import "@testing-library/jest-dom";

import { act, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Settings from "./Settings.svelte";
import { soundOn } from "../../preferences";
import {
  parseSampleCall,
  type ParsedCall,
  TauriInvokePlayback,
} from "$lib/sample-call-testing";

describe("Switch", () => {
  let tauriInvokeMock: Mock;
  let playback: TauriInvokePlayback;

  let playSwitchSoundCall: ParsedCall;
  let setSoundOnCall: ParsedCall;
  let setSoundOffCall: ParsedCall;

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
    tauriInvokeMock = vi.fn();
    vi.stubGlobal("__TAURI_INVOKE__", tauriInvokeMock);
    playback = new TauriInvokePlayback();
    tauriInvokeMock.mockImplementation(
      (...args: (string | Record<string, string>)[]) =>
        playback.mockCall(...args),
    );
  });

  test("can toggle sound on and off while saving setting", async () => {
    render(Settings, {});
    expect(get(soundOn)).toBe(true);
    expect(tauriInvokeMock).not.toHaveBeenCalled();

    const soundSwitch = screen.getByLabelText("Sounds");
    playback.addCalls(setSoundOffCall);
    await act(() => userEvent.click(soundSwitch));
    expect(get(soundOn)).toBe(false);
    expect(tauriInvokeMock).toBeCalledTimes(1);
    expect(playback.unmatchedCalls.length).toBe(0);

    playback.addCalls(setSoundOnCall, playSwitchSoundCall);
    await act(() => userEvent.click(soundSwitch));
    expect(get(soundOn)).toBe(true);
    expect(tauriInvokeMock).toBeCalledTimes(3);
    expect(playback.unmatchedCalls.length).toBe(0);
  });
});
