import SidebarUI from "./SidebarUI.svelte";
import type { StoryObj } from "@storybook/svelte";

export default {
  component: SidebarUI,
  title: "Layout/Sidebar",
  argTypes: {},
  parameters: {
    backgrounds: {
      default: "ZAMM background",
      values: [{ name: "ZAMM background", value: "#f4f4f4" }],
    },
  },
};

const Template = ({ ...args }) => ({
  Component: SidebarUI,
  props: args,
});

export const DashboardSelected: StoryObj = Template.bind({}) as any;
DashboardSelected.args = {
  currentRoute: "/",
  dummyLinks: true,
};

export const SettingsSelected: StoryObj = Template.bind({}) as any;
SettingsSelected.args = {
  currentRoute: "/settings",
  dummyLinks: true,
};
