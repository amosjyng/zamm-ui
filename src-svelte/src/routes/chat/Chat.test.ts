import { expect, test, vi, type Mock } from "vitest";
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/svelte";
import Chat from "./Chat.svelte";
import userEvent from "@testing-library/user-event";
import { TauriInvokePlayback } from "$lib/sample-call-testing";
import { animationSpeed } from "$lib/preferences";

describe("Chat conversation", () => {
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

  async function sendChatMessage(
    message: string,
    correspondingApiCallSample: string,
  ) {
    expect(tauriInvokeMock).not.toHaveBeenCalled();
    playback.addSamples(correspondingApiCallSample);

    const chatInput = screen.getByLabelText("Chat with the AI:");
    expect(chatInput).toHaveValue("");
    await userEvent.type(chatInput, message);
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(tauriInvokeMock).toHaveReturnedTimes(1);
    tauriInvokeMock.mockClear();
  }

  test("can start and continue a conversation", async () => {
    render(Chat, {});
    await sendChatMessage(
      "Hello, does this work?",
      "../src-tauri/api/sample-calls/chat-start-conversation.yaml",
    );
    await sendChatMessage(
      "Tell me something funny.",
      "../src-tauri/api/sample-calls/chat-continue-conversation.yaml",
    );
  });
});
