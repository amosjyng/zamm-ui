import { expect, test, vi } from "vitest";
import { get } from "svelte/store";
import "@testing-library/jest-dom";

import { act, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Settings from "./Settings.svelte";
import { soundOn } from "../../preferences";

const mockAudio = {
  pause: vi.fn(),
  play: vi.fn(),
};

global.Audio = vi.fn().mockImplementation(() => mockAudio);

describe("Switch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("can toggle sound on and off", async () => {
    render(Settings, {});
    expect(get(soundOn)).toBe(true);
    expect(mockAudio.play).not.toHaveBeenCalled();

    const soundSwitch = screen.getByLabelText("Sounds");
    await act(() => userEvent.click(soundSwitch));
    expect(get(soundOn)).toBe(false);
    expect(mockAudio.play).not.toHaveBeenCalled();

    await act(() => userEvent.click(soundSwitch));
    expect(get(soundOn)).toBe(true);
    expect(mockAudio.play).toBeCalledTimes(1);
  });
});
