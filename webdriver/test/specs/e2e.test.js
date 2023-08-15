describe("Welcome screen", function () {
  const click = async (selector) => {
    // workaround for https://github.com/tauri-apps/tauri/issues/6541
    const element = await $(selector);
    await element.waitForClickable();
    await browser.execute("arguments[0].click();", element);
  };

  it("should show greet button", async function () {
    const text = await $("a=Greet").getText();
    expect(text).toMatch(/^GREET$/);
  });

  it("should greet user when button pressed", async function () {
    await click("a=Greet");

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

    await click("button=Greet");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const text = await $("p#greet-message").getText();
    expect(text).toMatch(/^Hello, me! You have been greeted/);
  });
});
