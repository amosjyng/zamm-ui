import { writable, derived } from "svelte/store";

interface Preferences {
  unceasingAnimations: boolean;
  sounds: boolean;
}

const defaultPreferences: Preferences = {
  unceasingAnimations: false,
  sounds: true,
};

export const preferences = writable(defaultPreferences);
export const soundOn = derived(
  preferences,
  ($preferences) => $preferences.sounds,
);
