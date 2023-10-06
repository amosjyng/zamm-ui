import type { StoryFn, Decorator, StoryContext } from "@storybook/svelte";

let nextResolution: any;
let nextShouldWait = false;

window.__TAURI_INVOKE__ = () => {
  return new Promise((resolve) => {
    if (nextShouldWait) {
      setTimeout(() => {
        resolve(nextResolution);
      }, 1_000_000); // the re-render never happens, so any timeout is fine
    } else {
      resolve(nextResolution);
    }
  });
};

interface TauriInvokeArgs {
  resolution: any;
  shouldWait?: boolean | undefined;
  [key: string]: any;
}

const TauriInvokeDecorator: Decorator = (
  story: StoryFn,
  context: StoryContext,
) => {
  const { args, parameters } = context;
  const { resolution, shouldWait } = parameters as TauriInvokeArgs;
  nextResolution = resolution;
  nextShouldWait = shouldWait || false;
  return story(args, context);
};

export default TauriInvokeDecorator;
