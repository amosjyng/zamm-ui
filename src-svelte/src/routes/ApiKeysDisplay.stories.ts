import ApiKeysDisplay from "./ApiKeysDisplay.svelte";
import type { ApiKeys } from "$lib/bindings";
import type { StoryObj } from "@storybook/svelte";

export default {
  component: ApiKeysDisplay,
  title: "Screens/Dashboard/API Keys Display",
  argTypes: {},
};

const Template = ({ ...args }) => ({
  Component: ApiKeysDisplay,
  props: args,
});

const unknownKeys: ApiKeys = {
  openai: null,
};

const knownKeys: ApiKeys = {
  openai: {
    value: "sk-1234567890",
    source: "Environment",
  },
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
