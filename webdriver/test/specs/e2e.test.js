describe("Welcome screen", function () {
  it("should show unset OpenAI API key", async function () {
    await expect(
      await browser.checkElement(await $("table"), "apiKeys", {}),
    ).toEqual(0);

    const openAiCell = await $("tr*=OpenAI").$("td:nth-child(2)");
    expect(await openAiCell.getText()).toMatch(/^not set$/);
  });
});
