import {
  type Browser,
  type BrowserContext,
  chromium,
  expect,
  type Page,
  type Frame,
} from "@playwright/test";
import { afterAll, beforeAll, describe, test } from "vitest";
import type { ChildProcess } from "child_process";
import { ensureStorybookRunning, killStorybook } from "$lib/test-helpers";

describe("Switch drag test", () => {
  let storybookProcess: ChildProcess | undefined;
  let page: Page;
  let frame: Frame;
  let browser: Browser;
  let context: BrowserContext;
  let numSoundsPlayed: number;

  beforeAll(async () => {
    storybookProcess = await ensureStorybookRunning();

    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    await context.exposeFunction(
      "_testRecordSoundPlayed",
      () => numSoundsPlayed++,
    );
    page = await context.newPage();
  });

  afterAll(async () => {
    await browser.close();
    await killStorybook(storybookProcess);
  });

  beforeEach(() => {
    numSoundsPlayed = 0;
  });

  const getSwitchAndToggle = async (initialState = "off") => {
    await page.goto(
      `http://localhost:6006/?path=/story/reusable-switch--${initialState}`,
    );

    const maybeFrame = page.frame({ name: "storybook-preview-iframe" });
    if (!maybeFrame) {
      throw new Error("Could not find Storybook iframe");
    }
    frame = maybeFrame;
    const onOffSwitch = frame.getByRole("switch");
    const toggle = onOffSwitch.locator(".toggle");
    const switchBounds = await onOffSwitch.boundingBox();
    if (!switchBounds) {
      throw new Error("Could not get switch bounding box");
    }

    return { onOffSwitch, toggle, switchBounds };
  };

  test(
    "switches state when drag released at end",
    async () => {
      const { onOffSwitch, toggle, switchBounds } = await getSwitchAndToggle();
      await expect(onOffSwitch).toHaveAttribute("aria-checked", "false");
      expect(numSoundsPlayed).toBe(0);

      await toggle.dragTo(onOffSwitch, {
        targetPosition: { x: switchBounds.width, y: switchBounds.height / 2 },
      });
      await expect(onOffSwitch).toHaveAttribute("aria-checked", "true");
      expect(numSoundsPlayed).toBe(1);
    },
    { retry: 2 },
  );

  test(
    "switches state when drag released more than halfway to end",
    async () => {
      const { onOffSwitch, toggle, switchBounds } = await getSwitchAndToggle();
      await expect(onOffSwitch).toHaveAttribute("aria-checked", "false");
      expect(numSoundsPlayed).toBe(0);

      await toggle.dragTo(onOffSwitch, {
        targetPosition: {
          x: switchBounds.width * 0.75,
          y: switchBounds.height / 2,
        },
      });
      await expect(onOffSwitch).toHaveAttribute("aria-checked", "true");
      expect(numSoundsPlayed).toBe(1);
    },
    { retry: 2 },
  );

  test(
    "maintains state when drag released less than halfway to end",
    async () => {
      const { onOffSwitch, toggle, switchBounds } = await getSwitchAndToggle();
      await expect(onOffSwitch).toHaveAttribute("aria-checked", "false");
      expect(numSoundsPlayed).toBe(0);

      await toggle.dragTo(onOffSwitch, {
        targetPosition: {
          x: switchBounds.width * 0.25,
          y: switchBounds.height / 2,
        },
      });
      await expect(onOffSwitch).toHaveAttribute("aria-checked", "false");
      expect(numSoundsPlayed).toBe(0);
    },
    { retry: 2 },
  );

  test(
    "clicks twice when dragged to end and back",
    async () => {
      const { onOffSwitch, toggle, switchBounds } = await getSwitchAndToggle();
      const finalY = switchBounds.y + switchBounds.height / 2;
      await expect(onOffSwitch).toHaveAttribute("aria-checked", "false");
      expect(numSoundsPlayed).toBe(0);

      await toggle.hover();
      await page.mouse.down();

      // move to the very end
      await page.mouse.move(switchBounds.x + switchBounds.width, finalY);
      expect(numSoundsPlayed).toBe(1);

      // move back to the beginning
      await page.mouse.move(switchBounds.x, finalY);
      await expect(onOffSwitch).toHaveAttribute("aria-checked", "false");
      expect(numSoundsPlayed).toBe(2);
    },
    { retry: 2 },
  );
});
