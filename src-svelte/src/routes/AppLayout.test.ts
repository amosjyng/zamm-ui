import { expect, test, vi, assert } from "vitest";
import { get } from "svelte/store";
import "@testing-library/jest-dom";
import { tick } from "svelte";

import { render } from "@testing-library/svelte";
import AppLayout from "./AppLayout.svelte";
import { soundOn } from "../preferences";
import fs from "fs";
import yaml from "js-yaml";
import { Convert } from "$lib/sample-call";

const tauriInvokeMock = vi.fn();

vi.stubGlobal("__TAURI_INVOKE__", tauriInvokeMock);

interface ParsedCall {
  request: (string | Record<string, string>)[];
  response: Record<string, string>;
}

function parseSampleCall(
  sampleFile: string,
  argumentsExpected: boolean,
): ParsedCall {
  const sample_call_yaml = fs.readFileSync(sampleFile, "utf-8");
  const sample_call_json = JSON.stringify(yaml.load(sample_call_yaml));
  const rawSample = Convert.toSampleCall(sample_call_json);

  const numExpectedArguments = argumentsExpected ? 2 : 1;
  assert(rawSample.request.length === numExpectedArguments);
  const parsedRequest = argumentsExpected
    ? [rawSample.request[0], JSON.parse(rawSample.request[1])]
    : rawSample.request;
  const parsedSample: ParsedCall = {
    request: parsedRequest,
    response: JSON.parse(rawSample.response),
  };
  return parsedSample;
}

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
