import Chatcomponent from "./Chat.svelte";
import type { StoryObj } from "@storybook/svelte";

export default {
  component: Chatcomponent,
  title: "Screens/Chat/Conversation",
  argTypes: {},
};

const Template = ({ ...args }) => ({
  Component: Chatcomponent,
  props: args,
});

export const Tablet: StoryObj = Template.bind({}) as any;
Tablet.parameters = {
  viewport: {
    defaultViewport: "tablet",
  },
};
