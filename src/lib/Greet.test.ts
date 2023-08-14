import { expect, test, vi } from "vitest";
import { mockIPC } from "@tauri-apps/api/mocks";
import "@testing-library/jest-dom";

import { act, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Greet from "./Greet.svelte";
import { type SidecarArgs } from "../types/tauri";

test("invoke simple", async () => {
  mockIPC((_, args) => {
    const sidecarArgs = args as unknown as SidecarArgs;
    if (sidecarArgs.message.cmd === "execute") {
      const eventCallbackId = `_${sidecarArgs.message.onEventFn}`;
      const eventEmitter = window[eventCallbackId];

      // 'Stdout' event can be called multiple times
      eventEmitter({
        event: "Stdout",
        payload: `Hello, ${sidecarArgs.message.args[0]}! You've been greeted from Python`,
      });

      // 'Terminated' event must be called at the end to resolve the promise
      eventEmitter({
        event: "Terminated",
        payload: {
          code: 0,
          signal: "kill",
        },
      });
    }
  });

  // @ts-ignore
  const spy = vi.spyOn(window, "__TAURI_IPC__");
  expect(spy).not.toHaveBeenCalled();

  render(Greet, {});
  const greet_input = screen.getByRole("textbox");
  await act(() => userEvent.type(greet_input, "Vitest"));
  const greet_button = screen.getByRole("button");
  await act(() => userEvent.click(greet_button));

  expect(spy).toHaveBeenCalled();

  const message = screen.getByRole("paragraph");
  expect(message).toHaveTextContent(
    /^Hello, Vitest! You've been greeted from Python via JavaScript!$/,
  );
});
