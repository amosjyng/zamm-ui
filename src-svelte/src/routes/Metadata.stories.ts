import MetadataComponent from "./Metadata.svelte";
import type { StoryObj } from "@storybook/svelte";

export default {
  component: MetadataComponent,
  title: "Dashboard/Metadata",
  argTypes: {},
};

const Template = ({ ...args }) => ({
  Component: MetadataComponent,
  props: args,
});

export const Metadata: StoryObj = Template.bind({}) as any;
Metadata.parameters = {
  viewport: {
    defaultViewport: "mobile2",
  },
};
