import ApiKeysDisplay from "./Display.svelte";
import type { StoryFn, StoryObj } from "@storybook/svelte";
import TauriInvokeDecorator from "$lib/__mocks__/invoke";
import MockAppLayout from "$lib/__mocks__/MockAppLayout.svelte";

export default {
  component: ApiKeysDisplay,
  title: "Screens/Dashboard/API Keys Display",
  argTypes: {},
  decorators: [
    TauriInvokeDecorator,
    (story: StoryFn) => {
      return {
        Component: MockAppLayout,
        slot: story,
      };
    },
  ],
};

const Template = ({ ...args }) => ({
  Component: ApiKeysDisplay,
  props: args,
});

const writeToFile = "/api/sample-calls/set_api_key-existing-no-newline.yaml";
const unknownKeys = "/api/sample-calls/get_api_keys-empty.yaml";
const knownKeys = "/api/sample-calls/get_api_keys-openai.yaml";

export const Loading: StoryObj = Template.bind({}) as any;
Loading.parameters = {
  shouldWait: true,
  viewport: {
    defaultViewport: "mobile2",
  },
};

export const Unknown: StoryObj = Template.bind({}) as any;
Unknown.parameters = {
  sampleCallFiles: [unknownKeys, writeToFile],
  viewport: {
    defaultViewport: "mobile2",
  },
};

export const Known: StoryObj = Template.bind({}) as any;
Known.parameters = {
  sampleCallFiles: [knownKeys, writeToFile],
  viewport: {
    defaultViewport: "mobile2",
  },
};

export const Editing: StoryObj = Template.bind({}) as any;
Editing.args = {
  editDemo: true,
};
Editing.parameters = {
  sampleCallFiles: [knownKeys, writeToFile],
  viewport: {
    defaultViewport: "mobile2",
  },
};
