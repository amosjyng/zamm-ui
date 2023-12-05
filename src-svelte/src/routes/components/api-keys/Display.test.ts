import { expect, test, vi, type Mock } from "vitest";
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/svelte";
import ApiKeysDisplay from "./Display.svelte";
import { within, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { systemInfo } from "$lib/system-info";
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

    vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
      return window.setTimeout(() => fn(Date.now()), 16);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

  async function toggleOpenAIForm() {
    const openAiCell = screen.getByRole("cell", { name: "OpenAI" });
    await userEvent.click(openAiCell);
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
    systemInfo.set({
      shell: "Zsh",
      shell_init_file: "/home/rando/.zshrc",
    });
    await checkSampleCall(
      "../src-tauri/api/sample-calls/get_api_keys-openai.yaml",
      "Active",
    );

    await toggleOpenAIForm();
    const apiKeyInput = screen.getByLabelText("API key:");
    expect(apiKeyInput).toHaveValue("0p3n41-4p1-k3y");
    const saveFileInput = screen.getByLabelText("Save key to:");
    expect(saveFileInput).toHaveValue("/home/rando/.zshrc");
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

  test("can open and close form", async () => {
    await checkSampleCall(
      "../src-tauri/api/sample-calls/get_api_keys-openai.yaml",
      "Active",
    );

    // closed by default
    const formExistenceCheck = () => screen.getByLabelText("API key:");
    expect(formExistenceCheck).toThrow();

    // opens on click
    await toggleOpenAIForm();
    expect(formExistenceCheck).not.toThrow();

    // closes again on click
    await toggleOpenAIForm();
    await waitFor(() => expect(formExistenceCheck).toThrow());
  });

  test("can edit API key", async () => {
    systemInfo.set({
      shell: "Zsh",
      shell_init_file: "no-newline/.bashrc",
    });
    await checkSampleCall(
      "../src-tauri/api/sample-calls/get_api_keys-empty.yaml",
      "Inactive",
    );
    tauriInvokeMock.mockClear();
    playback.addSamples(
      "../src-tauri/api/sample-calls/set_api_key-existing-no-newline.yaml",
    );

    await toggleOpenAIForm();
    const apiKeyInput = screen.getByLabelText("API key:");
    expect(apiKeyInput).toHaveValue("");
    await userEvent.type(apiKeyInput, "0p3n41-4p1-k3y");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(tauriInvokeMock).toBeCalledTimes(1);
    await waitFor(() => expect(apiKeyInput).not.toBeInTheDocument());
  });

  test("can submit with custom file", async () => {
    const defaultInitFile = "/home/rando/.bashrc";
    systemInfo.set({
      shell: "Zsh",
      shell_init_file: defaultInitFile,
    });
    await checkSampleCall(
      "../src-tauri/api/sample-calls/get_api_keys-empty.yaml",
      "Inactive",
    );
    tauriInvokeMock.mockClear();
    playback.addSamples(
      "../src-tauri/api/sample-calls/set_api_key-existing-no-newline.yaml",
    );

    await toggleOpenAIForm();
    const fileInput = screen.getByLabelText("Save key to:");
    defaultInitFile
      .split("")
      .forEach(() => userEvent.type(fileInput, "{backspace}"));
    await userEvent.type(fileInput, "no-newline/.bashrc");
    await userEvent.type(screen.getByLabelText("API key:"), "0p3n41-4p1-k3y");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(tauriInvokeMock).toBeCalledTimes(1);
  });

  test("can submit with no file", async () => {
    const defaultInitFile = "/home/rando/.bashrc";
    systemInfo.set({
      shell: "Zsh",
      shell_init_file: defaultInitFile,
    });
    await checkSampleCall(
      "../src-tauri/api/sample-calls/get_api_keys-empty.yaml",
      "Inactive",
    );
    tauriInvokeMock.mockClear();
    playback.addSamples(
      "../src-tauri/api/sample-calls/set_api_key-no-disk-write.yaml",
    );

    await toggleOpenAIForm();
    await userEvent.click(screen.getByLabelText("Save key to disk?"));
    await userEvent.type(screen.getByLabelText("API key:"), "0p3n41-4p1-k3y");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(tauriInvokeMock).toBeCalledTimes(1);
  });
});
