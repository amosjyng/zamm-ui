import type { StoryFn, Decorator, StoryContext } from "@storybook/svelte";
import { unceasingAnimations } from "../../preferences";

interface Preferences {
  unceasingAnimations?: boolean;
}

interface StoreArgs {
  preferences?: Preferences;
  [key: string]: any;
}

const SvelteStoresDecorator: Decorator = (
  story: StoryFn,
  context: StoryContext,
) => {
  const { args, parameters } = context;
  const { preferences } = parameters as StoreArgs;
  if (preferences?.unceasingAnimations !== undefined) {
    unceasingAnimations.set(preferences.unceasingAnimations);
  }

  return story(args, context);
};

export default SvelteStoresDecorator;
