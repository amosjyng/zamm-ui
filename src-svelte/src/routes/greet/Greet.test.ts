import { expect, test, vi } from "vitest";
import "@testing-library/jest-dom";

import { act, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Greet from "./+page.svelte";

const tauriInvokeMock = vi.fn();

vi.stubGlobal("__TAURI_INVOKE__", tauriInvokeMock);

test("invoke simple", async () => {
  const spy = vi.spyOn(window, "__TAURI_INVOKE__");
  expect(spy).not.toHaveBeenCalled();
  tauriInvokeMock.mockReturnValueOnce(
    Promise.resolve("Hello, Vitest! You've been greeted from Python"),
  );

  render(Greet, {});
  const greet_input = screen.getByRole("textbox");
  await act(() => userEvent.type(greet_input, "Vitest"));
  const greet_button = screen.getByRole("button");
  await act(() => userEvent.click(greet_button));

  expect(spy).toHaveBeenLastCalledWith("greet", { name: "Vitest" });

  const message = screen.getByRole("paragraph");
  expect(message).toHaveTextContent(
    /^Hello, Vitest! You've been greeted from Python via TypeScript!$/,
  );
});
