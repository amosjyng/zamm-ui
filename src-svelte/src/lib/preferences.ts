import { writable } from "svelte/store";
import type { Preferences } from "./bindings";

export const animationsOn = writable(true);
export const unceasingAnimations = writable(false);
export const animationSpeed = writable(4);
export const soundOn = writable(true);
export const volume = writable(100);

export const NullPreferences: Preferences = {
  unceasing_animations: null,
  sound_on: null,
  volume: null,
};
