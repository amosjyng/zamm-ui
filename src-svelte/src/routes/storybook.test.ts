import {
  type Browser,
  chromium,
  type Page,
  type BrowserContext,
} from "@playwright/test";
import {
  afterAll,
  beforeAll,
  afterEach,
  beforeEach,
  describe,
  test,
  type TestContext,
} from "vitest";
import {
  toMatchImageSnapshot,
  type MatchImageSnapshotOptions,
} from "jest-image-snapshot";
import type { ChildProcess } from "child_process";
import { ensureStorybookRunning, killStorybook } from "$lib/test-helpers";
import sizeOf from "image-size";

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
    path: ["reusable", "slider"],
    variants: [
      "tiny-phone-screen",
      "tiny-phone-screen-with-long-label",
      "tablet",
    ],
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
    path: ["layout", "app"],
    variants: ["static"],
  },
  {
    path: ["layout", "sidebar"],
    variants: ["dashboard-selected", "settings-selected"],
  },
  {
    path: ["screens", "dashboard", "api-keys-display"],
    variants: ["loading", "unknown", "known"],
    screenshotEntireBody: true,
  },
  {
    path: ["screens", "dashboard", "metadata"],
    variants: ["metadata"],
    screenshotEntireBody: true,
  },
  {
    path: ["screens", "settings"],
    variants: ["tiny-phone-screen", "large-phone-screen", "tablet"],
    screenshotEntireBody: true,
  },
];

interface StorybookTestContext {
  page: Page;
}

describe.concurrent("Storybook visual tests", () => {
  let storybookProcess: ChildProcess | undefined;
  let browser: Browser;
  let browserContext: BrowserContext;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    browserContext = await browser.newContext();
    storybookProcess = await ensureStorybookRunning();
  });

  afterAll(async () => {
    await browserContext.close();
    await browser.close();
    await killStorybook(storybookProcess);
  });

  beforeEach<StorybookTestContext>(
    async (context: TestContext & StorybookTestContext) => {
      context.page = await browserContext.newPage();
      context.expect.extend({ toMatchImageSnapshot });
    },
  );

  afterEach<StorybookTestContext>(
    async (context: TestContext & StorybookTestContext) => {
      await context.page.close();
    },
  );

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

  const baseMatchOptions: MatchImageSnapshotOptions = {
    allowSizeMismatch: true,
    storeReceivedOnFailure: true,
    customSnapshotsDir: "screenshots/baseline",
    customDiffDir: "screenshots/testing/diff",
    customReceivedDir: "screenshots/testing/actual",
    customReceivedPostfix: "",
  };

  for (const config of components) {
    const storybookUrl = config.path.join("-");
    const storybookPath = config.path.join("/");
    for (const variant of config.variants) {
      const variantConfig =
        typeof variant === "string"
          ? {
              name: variant,
            }
          : variant;
      const testName = `${storybookPath}/${variantConfig.name}.png`;
      test(
        `${testName} should render the same`,
        async ({ expect, page }: TestContext & StorybookTestContext) => {
          const variantPrefix = `--${variantConfig.name}`;

          await page.goto(
            `http://localhost:6006/?path=/story/${storybookUrl}${variantPrefix}`,
          );
          await page.locator("button[title='Hide addons [A]']").click();

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
          const matchOptions = {
            ...baseMatchOptions,
            diffDirection,
            customSnapshotIdentifier: `${storybookPath}/${variantConfig.name}`,
          };

          if (!variantConfig.assertDynamic) {
            // don't compare dynamic screenshots against baseline
            // @ts-ignore
            expect(screenshot).toMatchImageSnapshot(matchOptions);
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
              expect(newScreenshot).toMatchImageSnapshot(matchOptions);
            }
          }
        },
        {
          retry: 4,
          timeout: 10_000,
        },
      );
    }
  }
});
