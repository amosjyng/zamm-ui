import InfoBox from "./InfoBoxView.svelte";
import type { StoryFn, StoryObj } from "@storybook/svelte";
import SvelteStoresDecorator from "$lib/__mocks__/stores";
import MockTransitions from "$lib/__mocks__/MockTransitions.svelte";

export default {
  component: InfoBox,
  title: "Reusable/InfoBox",
  argTypes: {},
};

const Template = ({ ...args }) => ({
  Component: InfoBox,
  props: args,
});

export const Regular: StoryObj = Template.bind({}) as any;
Regular.args = {
  title: "Simulation",
};
Regular.parameters = {
  viewport: {
    defaultViewport: "tablet",
  },
};

export const MountTransition: StoryObj = Template.bind({}) as any;
MountTransition.args = {
  title: "Simulation",
};
MountTransition.parameters = {
  viewport: {
    defaultViewport: "tablet",
  },
};
MountTransition.decorators = [
  SvelteStoresDecorator,
  (story: StoryFn) => {
    return {
      Component: MockTransitions,
      slot: story,
    };
  },
];

export const SlowMotion: StoryObj = Template.bind({}) as any;
SlowMotion.args = {
  title: "Simulation",
};
SlowMotion.parameters = {
  viewport: {
    defaultViewport: "tablet",
  },
  preferences: {
    animationSpeed: 0.1,
  },
};
SlowMotion.decorators = [
  SvelteStoresDecorator,
  (story: StoryFn) => {
    return {
      Component: MockTransitions,
      slot: story,
    };
  },
];
