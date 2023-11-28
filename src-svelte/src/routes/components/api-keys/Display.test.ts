import { expect, test, vi, type Mock } from "vitest";
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/svelte";
import ApiKeysDisplay from "./Display.svelte";
import { within, waitFor } from "@testing-library/dom";
import { TauriInvokePlayback } from "$lib/sample-call-testing";
import { tickFor } from "$lib/test-helpers";

describe("API Keys Display", () => {
  let tauriInvokeMock: Mock;
  let playback: TauriInvokePlayback;

  beforeEach(() => {
    tauriInvokeMock = vi.fn();
    vi.stubGlobal("__TAURI_INVOKE__", tauriInvokeMock);
    playback = new TauriInvokePlayback();
    tauriInvokeMock.mockImplementation(
      (...args: (string | Record<string, string>)[]) =>
        playback.mockCall(...args),
    );
  });

  async function checkSampleCall(filename: string, expected_display: string) {
    expect(tauriInvokeMock).not.toHaveBeenCalled();
    playback.addSamples(filename);

    render(ApiKeysDisplay, {});
    await tickFor(3);
    expect(tauriInvokeMock).toBeCalledTimes(1);

    const openAiRow = screen.getByRole("row", { name: /OpenAI/ });
    const openAiKeyCell = within(openAiRow).getAllByRole("cell")[1];
    await waitFor(() =>
      expect(openAiKeyCell).toHaveTextContent(expected_display),
    );
  }

  test("loading by default", async () => {
    playback.addSamples(
      "../src-tauri/api/sample-calls/get_api_keys-empty.yaml",
    );

    render(ApiKeysDisplay, {});

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/^...loading$/);
  });

  test("no API key set", async () => {
    await checkSampleCall(
      "../src-tauri/api/sample-calls/get_api_keys-empty.yaml",
      "Inactive",
    );
  });

  test("some API key set", async () => {
    await checkSampleCall(
      "../src-tauri/api/sample-calls/get_api_keys-openai.yaml",
      "Active",
    );
  });

  test("API key error", async () => {
    const spy = vi.spyOn(window, "__TAURI_INVOKE__");
    expect(spy).not.toHaveBeenCalled();
    tauriInvokeMock.mockRejectedValueOnce("testing");

    render(ApiKeysDisplay, {});
    expect(spy).toHaveBeenLastCalledWith("get_api_keys");

    await waitFor(() => {
      const status = screen.getByRole("status");
      expect(status).toHaveTextContent(/^error: testing$/);
    });
  });
});
