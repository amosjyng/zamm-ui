import { expect, test, vi, type SpyInstance } from "vitest";
import { get } from "svelte/store";
import "@testing-library/jest-dom";

import { act, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Settings from "./Settings.svelte";
import { soundOn } from "../../preferences";
import fs from "fs";
import yaml from "js-yaml";
import { Convert, type SampleCall } from "$lib/sample-call";

const tauriInvokeMock = vi.fn();

vi.stubGlobal("__TAURI_INVOKE__", tauriInvokeMock);

describe("Switch", () => {
  let switchCall: SampleCall;
  let switchRequest: (string | Record<string, string>)[];
  let spy: SpyInstance;

  beforeAll(() => {
    const sample_call_yaml = fs.readFileSync(
      "../src-tauri/api/sample-calls/play_sound-switch.yaml",
      "utf-8",
    );
    const sample_call_json = JSON.stringify(yaml.load(sample_call_yaml));
    switchCall = Convert.toSampleCall(sample_call_json);
    switchRequest = switchCall.request;
    switchRequest[1] = JSON.parse(switchCall.request[1]);
  });

  beforeEach(() => {
    spy = vi.spyOn(window, "__TAURI_INVOKE__");
    const response = JSON.parse(switchCall.response);
    tauriInvokeMock.mockResolvedValueOnce(response);
  });

  test("can toggle sound on and off", async () => {
    render(Settings, {});
    expect(get(soundOn)).toBe(true);
    expect(spy).not.toHaveBeenCalled();

    const soundSwitch = screen.getByLabelText("Sounds");
    await act(() => userEvent.click(soundSwitch));
    expect(get(soundOn)).toBe(false);
    expect(spy).not.toHaveBeenCalled();

    await act(() => userEvent.click(soundSwitch));
    expect(get(soundOn)).toBe(true);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(...switchRequest);
  });
});
