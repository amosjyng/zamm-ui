import { type Browser, chromium, expect, type Page } from "@playwright/test";
import { afterAll, beforeAll, describe, test } from "vitest";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

interface ComponentTestConfig {
  path: string[]; // Represents the Storybook hierarchy path
  variants: string[];
}

const components: ComponentTestConfig[] = [
  {
    path: ["settings", "api-keys-display"],
    variants: ["loading", "unknown", "known"],
  },
];

describe("Storybook visual tests", () => {
  let page: Page;
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  for (const config of components) {
    const storybookUrl = config.path.join("-");
    const storybookPath = config.path.join("/");
    describe(storybookPath, () => {
      for (const variant of config.variants) {
        const testName = variant
          ? variant
          : config.path[config.path.length - 1];
        test(`${testName} should render the same`, async () => {
          const variantPrefix = variant ? `--${variant}` : "";

          await page.goto(
            `http://localhost:6006/?path=/story/${storybookUrl}${variantPrefix}`,
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
            customSnapshotIdentifier: `${storybookPath}/${testName}`,
          });
        });
      }
    });
  }
});
