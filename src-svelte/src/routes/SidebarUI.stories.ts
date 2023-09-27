import SidebarUI from "./SidebarUI.svelte";
import type { StoryObj } from "@storybook/svelte";

export default {
  component: SidebarUI,
  title: "Navigation/Sidebar",
  argTypes: {},
};

const Template = ({ ...args }) => ({
  Component: SidebarUI,
  props: args,
});

export const DashboardSelected: StoryObj = Template.bind({}) as any;
DashboardSelected.args = {
  currentRoute: "/",
};

export const SettingsSelected: StoryObj = Template.bind({}) as any;
SettingsSelected.args = {
  currentRoute: "/settings",
};
