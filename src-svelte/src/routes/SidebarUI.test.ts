import { expect, test, vi, type SpyInstance } from "vitest";
import "@testing-library/jest-dom";

import { act, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import SidebarUI from "./SidebarUI.svelte";
import { soundOn } from "../preferences";
import fs from "fs";
import yaml from "js-yaml";
import { Convert, type SampleCall } from "$lib/sample-call";

const tauriInvokeMock = vi.fn();

vi.stubGlobal("__TAURI_INVOKE__", tauriInvokeMock);

describe("Sidebar", () => {
  let whooshCall: SampleCall;
  let whooshRequest: (string | Record<string, string>)[];
  let spy: SpyInstance;
  let homeLink: HTMLElement;
  let settingsLink: HTMLElement;

  beforeAll(() => {
    const sample_call_yaml = fs.readFileSync(
      "../src-tauri/api/sample-calls/play_sound-whoosh.yaml",
      "utf-8",
    );
    const sample_call_json = JSON.stringify(yaml.load(sample_call_yaml));
    whooshCall = Convert.toSampleCall(sample_call_json);
    whooshRequest = whooshCall.request;
    whooshRequest[1] = JSON.parse(whooshCall.request[1]);
  });

  beforeEach(() => {
    spy = vi.spyOn(window, "__TAURI_INVOKE__");
    const response = JSON.parse(whooshCall.response);
    tauriInvokeMock.mockResolvedValueOnce(response);

    render(SidebarUI, {
      currentRoute: "/",
      dummyLinks: true,
    });
    homeLink = screen.getByTitle("Home");
    settingsLink = screen.getByTitle("Settings");
    expect(homeLink).toHaveAttribute("aria-current", "page");
    expect(settingsLink).not.toHaveAttribute("aria-current", "page");
    expect(spy).not.toHaveBeenCalled();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("can change page path", async () => {
    await act(() => userEvent.click(settingsLink));
    expect(homeLink).not.toHaveAttribute("aria-current", "page");
    expect(settingsLink).toHaveAttribute("aria-current", "page");
  });

  test("plays whoosh sound during page path change", async () => {
    await act(() => userEvent.click(settingsLink));
    expect(spy).toHaveBeenLastCalledWith(...whooshRequest);
  });

  test("does not play whoosh sound when sound off", async () => {
    soundOn.update(() => false);

    await act(() => userEvent.click(settingsLink));
    expect(homeLink).not.toHaveAttribute("aria-current", "page");
    expect(settingsLink).toHaveAttribute("aria-current", "page");
    expect(spy).not.toHaveBeenCalled();
  });

  test("does not play whoosh sound when path unchanged", async () => {
    await act(() => userEvent.click(homeLink));
    expect(homeLink).toHaveAttribute("aria-current", "page");
    expect(settingsLink).not.toHaveAttribute("aria-current", "page");
    expect(spy).not.toHaveBeenCalled();
  });
});
