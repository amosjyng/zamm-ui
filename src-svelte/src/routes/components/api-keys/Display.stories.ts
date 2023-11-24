import ApiKeysDisplay from "./Display.svelte";
import type { ApiKeys } from "$lib/bindings";
import type { StoryObj } from "@storybook/svelte";
import TauriInvokeDecorator from "$lib/__mocks__/invoke";

export default {
  component: ApiKeysDisplay,
  title: "Screens/Dashboard/API Keys Display",
  argTypes: {},
  decorators: [TauriInvokeDecorator],
};

const Template = ({ ...args }) => ({
  Component: ApiKeysDisplay,
  props: args,
});

const unknownKeys: ApiKeys = {
  openai: null,
};

const knownKeys: ApiKeys = {
  openai: "sk-1234567890",
};

export const Loading: StoryObj = Template.bind({}) as any;
Loading.parameters = {
  resolution: unknownKeys,
  shouldWait: true,
  viewport: {
    defaultViewport: "mobile2",
  },
};

export const Unknown: StoryObj = Template.bind({}) as any;
Unknown.parameters = {
  resolution: unknownKeys,
  viewport: {
    defaultViewport: "mobile2",
  },
};

export const Known: StoryObj = Template.bind({}) as any;
Known.parameters = {
  resolution: knownKeys,
  viewport: {
    defaultViewport: "mobile2",
  },
};

export const Editing: StoryObj = Template.bind({}) as any;
Editing.args = {
  editDemo: true,
};
Editing.parameters = {
  resolution: knownKeys,
  viewport: {
    defaultViewport: "mobile2",
  },
};
