import { expect, test } from "vitest";
import "@testing-library/jest-dom";

import { act, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Switch from "./Switch.svelte";

describe("Switch", () => {
  test("can be toggled on", async () => {
    render(Switch, {});

    const onOffSwitch = screen.getByRole("switch");
    expect(onOffSwitch).toHaveClass("button off");
    await act(() => userEvent.click(onOffSwitch));
    expect(onOffSwitch).toHaveClass("button on");
  });

  test("can be toggled off", async () => {
    render(Switch, { toggledOn: true });

    const onOffSwitch = screen.getByRole("switch");
    expect(onOffSwitch).toHaveClass("button on");
    await act(() => userEvent.click(onOffSwitch));
    expect(onOffSwitch).toHaveClass("button off");
  });
});
