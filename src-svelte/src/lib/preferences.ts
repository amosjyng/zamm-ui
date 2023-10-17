import { writable } from "svelte/store";
import type { Preferences } from "./bindings";

export const unceasingAnimations = writable(false);
export const soundOn = writable(true);

export const NullPreferences: Preferences = {
  unceasing_animations: null,
  sound_on: null,
};
