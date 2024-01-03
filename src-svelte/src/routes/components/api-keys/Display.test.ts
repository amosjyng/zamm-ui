import { expect, test, vi, type Mock } from "vitest";
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/svelte";
import Snackbar from "$lib/snackbar/Snackbar.svelte";
import ApiKeysDisplay from "./Display.svelte";
import { within, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { systemInfo } from "$lib/system-info";
import { TauriInvokePlayback } from "$lib/sample-call-testing";
import { animationSpeed } from "$lib/preferences";

describe("API Keys Display", () => {
  let tauriInvokeMock: Mock;
  let playback: TauriInvokePlayback;

  beforeAll(() => {
    animationSpeed.set(10);
  });

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
    await waitFor(() =>
      expect(screen.getByRole("row", { name: /OpenAI/ })).toBeInTheDocument(),
    );
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
      os: null,
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
    const errorMessage = "Testing error message";
    const spy = vi.spyOn(window, "__TAURI_INVOKE__");
    expect(spy).not.toHaveBeenCalled();
    tauriInvokeMock.mockRejectedValueOnce(errorMessage);

    render(ApiKeysDisplay, {});
    await waitFor(() =>
      expect(screen.getByRole("row", { name: /OpenAI/ })).toBeInTheDocument(),
    );
    expect(spy).toHaveBeenLastCalledWith("get_api_keys");

    render(Snackbar, {});
    const alerts = screen.queryAllByRole("alertdialog");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent(errorMessage);
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
      os: null,
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
      "../src-tauri/api/sample-calls/get_api_keys-openai.yaml",
    );

    await toggleOpenAIForm();
    const apiKeyInput = screen.getByLabelText("API key:");
    expect(apiKeyInput).toHaveValue("");
    await userEvent.type(apiKeyInput, "0p3n41-4p1-k3y");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(tauriInvokeMock).toBeCalledTimes(2));
    await waitFor(() => expect(apiKeyInput).not.toBeInTheDocument());
  });

  test("preserves unsubmitted changes after opening and closing form", async () => {
    const defaultInitFile = "/home/rando/.bashrc";
    systemInfo.set({
      os: null,
      shell: "Zsh",
      shell_init_file: defaultInitFile,
    });
    const customInitFile = "/home/different/.bashrc";
    const customApiKey = "0p3n41-4p1-k3y";

    // setup largely copied from "can submit with custom file" test
    systemInfo.set({
      os: null,
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

    // open form and type in API key
    await toggleOpenAIForm();
    let apiKeyInput = screen.getByLabelText("API key:");
    let saveKeyCheckbox = screen.getByLabelText("Save key to disk?");
    let fileInput = screen.getByLabelText("Save key to:");

    expect(apiKeyInput).toHaveValue("");
    expect(saveKeyCheckbox).toBeChecked();
    expect(fileInput).toHaveValue(defaultInitFile);

    await userEvent.type(apiKeyInput, customApiKey);
    await userEvent.click(saveKeyCheckbox);
    defaultInitFile
      .split("")
      .forEach(() => userEvent.type(fileInput, "{backspace}"));
    await userEvent.type(fileInput, customInitFile);

    expect(apiKeyInput).toHaveValue(customApiKey);
    expect(saveKeyCheckbox).not.toBeChecked();
    expect(fileInput).toHaveValue(customInitFile);

    // close and reopen form
    await toggleOpenAIForm();
    await waitFor(() => expect(apiKeyInput).not.toBeInTheDocument());
    await toggleOpenAIForm();
    await waitFor(() => {
      const formExistenceCheck = () => screen.getByLabelText("API key:");
      expect(formExistenceCheck).not.toThrow();
    });

    // check that changes to form fields persist
    // need to obtain references to new form fields
    apiKeyInput = screen.getByLabelText("API key:");
    saveKeyCheckbox = screen.getByLabelText("Save key to disk?");
    fileInput = screen.getByLabelText("Save key to:");
    expect(apiKeyInput).toHaveValue(customApiKey);
    expect(saveKeyCheckbox).not.toBeChecked();
    expect(fileInput).toHaveValue(customInitFile);
  });

  test("can submit with custom file", async () => {
    const defaultInitFile = "/home/rando/.bashrc";
    systemInfo.set({
      os: null,
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
      "../src-tauri/api/sample-calls/get_api_keys-openai.yaml",
    );

    await toggleOpenAIForm();
    const fileInput = screen.getByLabelText("Save key to:");
    defaultInitFile
      .split("")
      .forEach(() => userEvent.type(fileInput, "{backspace}"));
    await userEvent.type(fileInput, "no-newline/.bashrc");
    await userEvent.type(screen.getByLabelText("API key:"), "0p3n41-4p1-k3y");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(tauriInvokeMock).toBeCalledTimes(2));
  });

  test("can submit with no file", async () => {
    const defaultInitFile = "/home/rando/.bashrc";
    systemInfo.set({
      os: null,
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
      "../src-tauri/api/sample-calls/get_api_keys-openai.yaml",
    );

    await toggleOpenAIForm();
    await userEvent.click(screen.getByLabelText("Save key to disk?"));
    await userEvent.type(screen.getByLabelText("API key:"), "0p3n41-4p1-k3y");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(tauriInvokeMock).toBeCalledTimes(2));
  });
});
