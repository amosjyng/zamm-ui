describe("Welcome screen", function () {
  it("should show greet button", async function () {
    const text = await $("button").getText();
    expect(text).toMatch(/^Greet$/);
  });

  it("should greet user when button pressed", async function () {
    const original = await $("p#greet-message").getText();
    expect(original).toMatch(/^$/);

    const greetInput = await $("#greet-input");
    // workaround for https://github.com/tauri-apps/tauri/issues/6541
    await browser.execute(`arguments[0].value="me"`, greetInput);
    await browser.execute(
      'arguments[0].dispatchEvent(new Event("input", { bubbles: true }))',
      greetInput,
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const inputText = await $("#greet-input").getValue();
    expect(inputText).toMatch(/^me$/);

    await browser.execute(() => {
      document.getElementsByTagName("button")[0].click();
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const text = await $("p#greet-message").getText();
    expect(text).toMatch(/^Hello, me! You have been greeted/);
  });
});
