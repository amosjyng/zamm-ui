import { type Browser, chromium, expect, type Page } from "@playwright/test";
import { afterAll, beforeAll, describe, test } from "vitest";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

describe("Storybook visual tests", () => {
  let page: Page;
  let browser: Browser;

  const components = {
    "settings-api-keys-display": ["loading", "unknown", "known"],
  };

  beforeAll(async () => {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  for (const [component, variants] of Object.entries(components)) {
    describe(component, () => {
      for (const variant of variants) {
        const testName = variant ? variant : component;
        test(`${testName} should render the same`, async () => {
          const variantPrefix = variant ? `--${variant}` : "";

          await page.goto(
            `http://localhost:6006/?path=/story/${component}${variantPrefix}`,
          );

          const frame = page.frame({ name: "storybook-preview-iframe" });
          if (!frame) {
            throw new Error("Could not find Storybook iframe");
          }

          const rootElement = await frame.waitForSelector("#storybook-root");
          const screenshot = await rootElement.screenshot();

          // @ts-ignore
          expect(screenshot).toMatchImageSnapshot({
            customSnapshotsDir: "screenshots",
            customSnapshotIdentifier: `${component}/${testName}`,
          });
        });
      }
    });
  }
});
