import Sidebar from "./Sidebar.svelte";
import type { StoryObj } from "@storybook/svelte";

export default {
  component: Sidebar,
  title: "Navigation/Sidebar",
  argTypes: {},
};

const Template = ({ ...args }) => ({
  Component: Sidebar,
  props: args,
});

export const SettingsSelected: StoryObj = Template.bind({}) as any;
