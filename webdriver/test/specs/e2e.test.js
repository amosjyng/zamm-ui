const maxMismatch =
  process.env.MISMATCH_TOLERANCE === undefined
    ? 0
    : parseFloat(process.env.MISMATCH_TOLERANCE);

describe("Welcome screen", function () {
  this.retries(2);

  it("should render the welcome screen correctly", async function () {
    await $("table"); // ensure page loads before taking screenshot
    await expect(
      await browser.checkFullPageScreen("welcome-screen", {}),
    ).toBeLessThanOrEqual(maxMismatch);
  });

  it("should show unset OpenAI API key", async function () {
    const openAiCell = await $("tr*=OpenAI").$("td:nth-child(2)");
    expect(await openAiCell.getText()).toMatch(/^unknown$/);
  });
});
