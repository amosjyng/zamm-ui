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

describe("Welcome screen", function () {
  it("should render the welcome screen correctly", async function () {
    this.retries(2);
    await $("table"); // ensure page loads before taking screenshot
    expect(
      await browser.checkFullPageScreen("welcome-screen", {}),
    ).toBeLessThanOrEqual(maxMismatch);
  });

  it("should show unset OpenAI API key", async function () {
    const openAiCell = await $("tr*=OpenAI").$("td:nth-child(2)");
    expect(await openAiCell.getText()).toMatch(/^unknown$/);
  });

  it("should allow navigation to the settings page", async function () {
    findAndClick('a[title="Settings"]');
    findAndClick("aria/Sounds");
    await browser.pause(500); // for CSS transitions to finish
    expect(
      await browser.checkFullPageScreen("settings-screen", {}),
    ).toBeLessThanOrEqual(maxMismatch);
  });
});
