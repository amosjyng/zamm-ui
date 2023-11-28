import MetadataComponent from "./Metadata.svelte";
import type { StoryObj } from "@storybook/svelte";
import type { SystemInfo } from "$lib/bindings";
import TauriInvokeDecorator from "$lib/__mocks__/invoke";

export default {
  component: MetadataComponent,
  title: "Screens/Dashboard/Metadata",
  argTypes: {},
  decorators: [TauriInvokeDecorator],
};

const Template = ({ ...args }) => ({
  Component: MetadataComponent,
  props: args,
});

const linuxInfo: SystemInfo = {
  shell: "Zsh",
  shell_init_file: "/home/john.smith/.zshrc",
};

export const Loaded: StoryObj = Template.bind({}) as any;
Loaded.parameters = {
  viewport: {
    defaultViewport: "mobile2",
  },
  resolution: linuxInfo,
};

export const Loading: StoryObj = Template.bind({}) as any;
Loading.parameters = {
  viewport: {
    defaultViewport: "mobile2",
  },
  resolution: linuxInfo,
  shouldWait: true,
};
