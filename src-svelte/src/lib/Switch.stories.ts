import Switch from "./Switch.svelte";
import type { StoryObj } from "@storybook/svelte";

export default {
  component: Switch,
  title: "Reusable/Switch",
  argTypes: {},
};

const Template = ({ ...args }) => ({
  Component: Switch,
  props: args,
});

export const On: StoryObj = Template.bind({}) as any;
On.args = {
  label: "Simulation",
  toggledOn: true,
};
On.parameters = {
  viewport: {
    defaultViewport: "mobile1",
  },
};

export const Off: StoryObj = Template.bind({}) as any;
Off.args = {
  label: "Simulation",
  toggledOn: false,
};
Off.parameters = {
  viewport: {
    defaultViewport: "mobile1",
  },
};
