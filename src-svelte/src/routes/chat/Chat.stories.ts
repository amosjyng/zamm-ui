import Chatcomponent from "./Chat.svelte";
import type { StoryObj } from "@storybook/svelte";
import type { ChatMessage } from "$lib/bindings";

export default {
  component: Chatcomponent,
  title: "Screens/Chat/Conversation",
  argTypes: {},
};

const Template = ({ ...args }) => ({
  Component: Chatcomponent,
  props: args,
});

export const Empty: StoryObj = Template.bind({}) as any;
Empty.parameters = {
  viewport: {
    defaultViewport: "tablet",
  },
};

export const NotEmpty: StoryObj = Template.bind({}) as any;
const conversation: ChatMessage[] = [
  {
    role: "System",
    text: "You are ZAMM, a chat program. Respond in first person.",
  },
  {
    role: "Human",
    text: "Hello, does this work?",
  },
  {
    role: "AI",
    text:
      "Hello! I'm ZAMM, a chat program. I'm here to assist you. " +
      "What can I help you with today?",
  },
  {
    role: "Human",
    text: "Tell me something really funny, like really funny. Make me laugh hard.",
  },
  {
    role: "AI",
    text:
      "Sure, here's a light-hearted joke for you:\n\n" +
      "Why don't scientists trust atoms?\n\n" +
      "Because they make up everything!",
  },
];
NotEmpty.args = {
  conversation,
};
NotEmpty.parameters = {
  viewport: {
    defaultViewport: "tablet",
  },
};
