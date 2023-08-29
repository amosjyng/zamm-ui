describe("Welcome screen", function () {
  it("should render the welcome screen correctly", async function () {
    await $("table"); // ensure page loads before taking screenshot
    await expect(
      await browser.checkFullPageScreen("welcome-screen", {}),
    ).toEqual(0);
  });

  it("should render the API keys table correctly", async function () {
    await expect(
      await browser.checkElement(await $("table"), "api-keys", {}),
    ).toEqual(0);
  });

  it("should show unset OpenAI API key", async function () {
    const openAiCell = await $("tr*=OpenAI").$("td:nth-child(2)");
    expect(await openAiCell.getText()).toMatch(/^not set$/);
  });
});
