import BackgroundComponent from "./BackgroundUI.svelte";
import type { StoryObj } from "@storybook/svelte";

export default {
  component: BackgroundComponent,
  title: "Background",
  argTypes: {},
};

const Template = ({ ...args }) => ({
  Component: BackgroundComponent,
  props: args,
});

export const Static: StoryObj = Template.bind({}) as any;
Static.args = {
  animated: false,
};
export const Dynamic: StoryObj = Template.bind({}) as any;
Dynamic.args = {
  animated: true,
};
