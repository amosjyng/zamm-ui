import { expect, test, vi } from "vitest";
import { mockIPC } from "@tauri-apps/api/mocks";
import "@testing-library/jest-dom";

import { act, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Greet from "./Greet.svelte";

test("invoke simple", async () => {
  mockIPC((cmd, args) => {
    if (cmd === "greet") {
      return `Hello, ${args.name}! You've been greeted from Rust!`;
    }
  });

  const spy = vi.spyOn(window, "__TAURI_IPC__");
  expect(spy).not.toHaveBeenCalled();

  render(Greet, {});
  const greet_input = screen.getByRole("textbox");
  await act(() => userEvent.type(greet_input, "Vitest"));
  const greet_button = screen.getByRole("button");
  await act(() => userEvent.click(greet_button));

  expect(spy).toHaveBeenCalled();

  const message = screen.getByRole("paragraph");
  expect(message).toHaveTextContent(`Hello, Vitest! You've been greeted`);
});
