import type { StoryFn, Decorator, StoryContext } from "@storybook/svelte";

let nextResolution: any;
let nextShouldWait = false;

window.__TAURI_INVOKE__ = () => {
  return new Promise((resolve) => {
    if (nextShouldWait) {
      setTimeout(() => {
        resolve(nextResolution);
      }, 0); // the re-render never happens, so any timeout is fine
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

const tauri_invoke_decorator: Decorator = (
  story: StoryFn,
  context: StoryContext,
) => {
  const { args, parameters } = context;
  const { resolution, shouldWait } = parameters as TauriInvokeArgs;
  nextResolution = resolution;
  nextShouldWait = shouldWait || false;
  return story(args, context);
};

export default tauri_invoke_decorator;
