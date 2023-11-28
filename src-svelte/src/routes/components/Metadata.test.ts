import { expect, test, vi, type Mock } from "vitest";
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/svelte";
import Metadata from "./Metadata.svelte";
import { within, waitFor } from "@testing-library/dom";
import { parseSampleCall, TauriInvokePlayback } from "$lib/sample-call-testing";
import { tickFor } from "$lib/test-helpers";

describe("Metadata", () => {
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

  test("loading by default", async () => {
    const getSystemInfoCall = parseSampleCall(
      "../src-tauri/api/sample-calls/get_system_info-linux.yaml",
    );
    playback.addCalls(getSystemInfoCall);

    render(Metadata, {});

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/^...loading$/);
  });

  test("linux system info returned", async () => {
    expect(tauriInvokeMock).not.toHaveBeenCalled();
    const getSystemInfoCall = parseSampleCall(
      "../src-tauri/api/sample-calls/get_system_info-linux.yaml",
    );
    playback.addCalls(getSystemInfoCall);

    render(Metadata, {});
    await tickFor(3);
    expect(tauriInvokeMock).toBeCalledTimes(1);

    const shellRow = screen.getByRole("row", { name: /Shell/ });
    const shellValueCell = within(shellRow).getAllByRole("cell")[1];
    await waitFor(() => expect(shellValueCell).toHaveTextContent("Zsh"));
  });

  test("API key error", async () => {
    const spy = vi.spyOn(window, "__TAURI_INVOKE__");
    expect(spy).not.toHaveBeenCalled();
    tauriInvokeMock.mockRejectedValueOnce("testing");

    render(Metadata, {});
    expect(spy).toHaveBeenLastCalledWith("get_system_info");

    await waitFor(() => {
      const status = screen.getByRole("status");
      expect(status).toHaveTextContent(/^error: testing$/);
    });
  });
});
