import { expect, test, vi, type SpyInstance } from "vitest";
import "@testing-library/jest-dom";

import { act, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Switch, { getClickDelayMs } from "./Switch.svelte";
import { soundOn } from "$lib/preferences";
import fs from "fs";
import yaml from "js-yaml";
import { Convert, type SampleCall } from "$lib/sample-call";

const tauriInvokeMock = vi.fn();

vi.stubGlobal("__TAURI_INVOKE__", tauriInvokeMock);

describe("Switch delay", () => {
  test("is 0 under regular animation speeds", () => {
    expect(getClickDelayMs(1)).toBe(0);
  });

  test("increases a little when animation is twice as slow", () => {
    expect(getClickDelayMs(0.5)).toBe(50);
  });

  test("increases a lot when animation is 10x as slow", () => {
    expect(getClickDelayMs(0.1)).toBe(450);
  });
});

describe("Switch", () => {
  let switchCall: SampleCall;
  let switchRequest: (string | Record<string, string>)[];
  let spy: SpyInstance;

  beforeAll(() => {
    const sample_call_yaml = fs.readFileSync(
      "../src-tauri/api/sample-calls/play_sound-switch.yaml",
      "utf-8",
    );
    const sample_call_json = JSON.stringify(yaml.load(sample_call_yaml));
    switchCall = Convert.toSampleCall(sample_call_json);
    switchRequest = switchCall.request;
    switchRequest[1] = JSON.parse(switchCall.request[1]);
  });

  beforeEach(() => {
    spy = vi.spyOn(window, "__TAURI_INVOKE__");
    const response = JSON.parse(switchCall.response);
    tauriInvokeMock.mockResolvedValueOnce(response);
  });

  test("can be toggled on", async () => {
    render(Switch, {});

    const onOffSwitch = screen.getByRole("switch");
    expect(onOffSwitch).toHaveAttribute("aria-checked", "false");
    await act(() => userEvent.click(onOffSwitch));
    expect(onOffSwitch).toHaveAttribute("aria-checked", "true");
  });

  test("can be toggled off", async () => {
    render(Switch, { toggledOn: true });

    const onOffSwitch = screen.getByRole("switch");
    expect(onOffSwitch).toHaveAttribute("aria-checked", "true");
    await act(() => userEvent.click(onOffSwitch));
    expect(onOffSwitch).toHaveAttribute("aria-checked", "false");
  });

  test("can have multiple unique labels", async () => {
    render(Switch, { label: "One" });
    render(Switch, { label: "Two" });

    const switchOne = screen.getByLabelText("One");
    expect(switchOne).toHaveAttribute("aria-checked", "false");
    const switchTwo = screen.getByLabelText("Two");
    expect(switchTwo).toHaveAttribute("aria-checked", "false");

    await act(() => userEvent.click(switchOne));
    expect(switchOne).toHaveAttribute("aria-checked", "true");
    expect(switchTwo).toHaveAttribute("aria-checked", "false");

    await act(() => userEvent.click(switchTwo));
    expect(switchOne).toHaveAttribute("aria-checked", "true");
    expect(switchTwo).toHaveAttribute("aria-checked", "true");
  });

  test("plays clicking sound during toggle", async () => {
    render(Switch, {});
    expect(spy).not.toHaveBeenCalled();

    const onOffSwitch = screen.getByRole("switch");
    await act(() => userEvent.click(onOffSwitch));
    expect(spy).toHaveBeenLastCalledWith(...switchRequest);
  });

  test("does not play clicking sound when sound off", async () => {
    render(Switch, {});
    soundOn.update(() => false);
    expect(spy).not.toHaveBeenCalled();

    const onOffSwitch = screen.getByRole("switch");
    await act(() => userEvent.click(onOffSwitch));
    expect(spy).not.toHaveBeenCalled();
  });

  test("calls onToggle when toggled", async () => {
    const onToggle = vi.fn();
    render(Switch, { onToggle });

    const onOffSwitch = screen.getByRole("switch");
    await act(() => userEvent.click(onOffSwitch));
    expect(onToggle).toBeCalledTimes(1);
  });
});
