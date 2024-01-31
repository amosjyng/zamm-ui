const maxMismatch =
  process.env.MISMATCH_TOLERANCE === undefined
    ? 0
    : parseFloat(process.env.MISMATCH_TOLERANCE);

async function findAndClick(selector, timeout) {
  const button = await $(selector);
  await button.waitForClickable({
    timeout,
  });
  await browser.execute("arguments[0].click();", button);
}

describe("App", function () {
  it("should render the welcome screen correctly", async function () {
    this.retries(2);
    await $("table"); // ensure page loads before taking screenshot
    await browser.pause(500); // for CSS transitions to finish
    expect(
      await browser.checkFullPageScreen("welcome-screen", {}),
    ).toBeLessThanOrEqual(maxMismatch);
  });

  it("should allow navigation to the chat page", async function () {
    this.retries(2);
    await findAndClick('a[title="Chat"]');
    await $("button");
    await browser.pause(2500); // for page to finish rendering
    expect(
      await browser.checkFullPageScreen("chat-screen", {}),
    ).toBeLessThanOrEqual(maxMismatch);
  });

  it("should allow navigation to the settings page", async function () {
    this.retries(2);
    await findAndClick('a[title="Settings"]');
    await $("label");
    await browser.pause(2500); // for page to finish rendering
    expect(
      await browser.checkFullPageScreen("settings-screen", {}),
    ).toBeLessThanOrEqual(maxMismatch);
  });
});
