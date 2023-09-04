import "../src/routes/styles.css";
import tauri_invoke_decorator from "../src/lib/__mocks__/invoke";

/** @type { import('@storybook/svelte').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [tauri_invoke_decorator],
};

export default preview;
