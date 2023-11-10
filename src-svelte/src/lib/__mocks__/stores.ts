import type { StoryFn, Decorator, StoryContext } from "@storybook/svelte";
import {
  animationsOn,
  unceasingAnimations,
  animationSpeed,
} from "$lib/preferences";
import { firstAppLoad, firstPageLoad } from "$lib/firstPageLoad";

interface Preferences {
  animationsOn?: boolean;
  unceasingAnimations?: boolean;
  animationSpeed?: number;
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

  // set to their defaults on first load
  firstAppLoad.set(true);
  firstPageLoad.set(true);

  if (preferences?.animationsOn === undefined) {
    animationsOn.set(true);
  } else {
    animationsOn.set(preferences.animationsOn);
  }

  if (preferences?.unceasingAnimations !== undefined) {
    unceasingAnimations.set(preferences.unceasingAnimations);
  }

  if (preferences?.animationSpeed === undefined) {
    animationSpeed.set(1);
  } else {
    animationSpeed.set(preferences.animationSpeed);
  }

  return story(args, context);
};

export default SvelteStoresDecorator;
