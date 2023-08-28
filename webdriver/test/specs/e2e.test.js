describe("Welcome screen", function () {
  afterEach(async function () {
    // Check if the test failed
    const screenshotPath = `./screenshots/${this.currentTest.title.replace(
      /\s+/g,
      "_",
    )}.png`;
    // Capture a screenshot and save it
    await browser.saveScreenshot(screenshotPath);
    console.log(`Screenshot saved to ${screenshotPath}`);
  });

  it("should show unset OpenAI API key", async function () {
    const openAiCell = await $("tr*=OpenAI").$("td:nth-child(2)");
    expect(await openAiCell.getText()).toMatch(/^not set$/);
  });
});
