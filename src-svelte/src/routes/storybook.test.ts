import { type Browser, chromium, expect, type Page } from "@playwright/test";
import { afterAll, beforeAll, describe, test } from "vitest";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import type { ChildProcess } from "child_process";
import { ensureStorybookRunning, killStorybook } from "$lib/test-helpers";
import sizeOf from "image-size";

expect.extend({ toMatchImageSnapshot });

interface ComponentTestConfig {
  path: string[]; // Represents the Storybook hierarchy path
  variants: string[] | VariantConfig[];
  screenshotEntireBody?: boolean;
}

interface VariantConfig {
  name: string;
  assertDynamic?: boolean;
}

const components: ComponentTestConfig[] = [
  {
    path: ["reusable", "switch"],
    variants: ["on", "off"],
    screenshotEntireBody: true,
  },
  {
    path: ["background"],
    variants: [
      {
        name: "static",
        assertDynamic: false,
      },
      {
        name: "dynamic",
        assertDynamic: true,
      },
    ],
  },
  {
    path: ["dashboard", "api-keys-display"],
    variants: ["loading", "unknown", "known"],
    screenshotEntireBody: true,
  },
  {
    path: ["dashboard", "metadata"],
    variants: ["metadata"],
    screenshotEntireBody: true,
  },
  {
    path: ["navigation", "sidebar"],
    variants: ["settings-selected"],
  },
];

describe("Storybook visual tests", () => {
  let storybookProcess: ChildProcess | undefined;
  let page: Page;
  let browser: Browser;

  beforeAll(async () => {
    storybookProcess = await ensureStorybookRunning();

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();
  });

  afterAll(async () => {
    await browser.close();
    await killStorybook(storybookProcess);
  });

  const takeScreenshot = (page: Page, screenshotEntireBody?: boolean) => {
    const frame = page.frame({ name: "storybook-preview-iframe" });
    if (!frame) {
      throw new Error("Could not find Storybook iframe");
    }
    const locator = screenshotEntireBody
      ? "body"
      : "#storybook-root > :first-child";
    return frame.locator(locator).screenshot();
  };

  for (const config of components) {
    const storybookUrl = config.path.join("-");
    const storybookPath = config.path.join("/");
    describe(storybookPath, () => {
      for (const variant of config.variants) {
        const variantConfig =
          typeof variant === "string"
            ? {
                name: variant,
              }
            : variant;
        const testName = variantConfig.name;
        test(
          `${testName} should render the same`,
          async () => {
            const variantPrefix = `--${variantConfig.name}`;

            await page.goto(
              `http://localhost:6006/?path=/story/${storybookUrl}${variantPrefix}`,
            );

            const screenshot = await takeScreenshot(
              page,
              config.screenshotEntireBody,
            );

            const screenshotSize = sizeOf(screenshot);
            const diffDirection =
              screenshotSize.width &&
              screenshotSize.height &&
              screenshotSize.width > screenshotSize.height
                ? "vertical"
                : "horizontal";

            if (!variantConfig.assertDynamic) {
              // don't compare dynamic screenshots against baseline
              // @ts-ignore
              expect(screenshot).toMatchImageSnapshot({
                diffDirection,
                storeReceivedOnFailure: true,
                customSnapshotsDir: "screenshots/baseline",
                customSnapshotIdentifier: `${storybookPath}/${testName}`,
                customDiffDir: "screenshots/testing/diff",
                customReceivedDir: "screenshots/testing/actual",
                customReceivedPostfix: "",
              });
            }

            if (variantConfig.assertDynamic !== undefined) {
              await new Promise((r) => setTimeout(r, 1000));
              const newScreenshot = await takeScreenshot(
                page,
                config.screenshotEntireBody,
              );

              if (variantConfig.assertDynamic) {
                expect(
                  Buffer.compare(screenshot, newScreenshot) !== 0,
                ).toBeTruthy();
              } else {
                // do the same assertion from before so that we can see what changed the
                // second time around if a static screenshot turns out to be dynamic
                //
                // @ts-ignore
                expect(newScreenshot).toMatchImageSnapshot({
                  diffDirection,
                  storeReceivedOnFailure: true,
                  customSnapshotsDir: "screenshots/baseline",
                  customSnapshotIdentifier: `${storybookPath}/${testName}`,
                  customDiffDir: "screenshots/testing/diff",
                  customReceivedDir: "screenshots/testing/actual",
                  customReceivedPostfix: "",
                });
              }
            }
          },
          {
            retry: 3,
          },
        );
      }
    });
  }
});
