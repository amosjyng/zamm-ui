import { get } from "svelte/store";
import { playSound, type Sound } from "./bindings";
import { soundOn, volume } from "./preferences";

export function playSoundEffect(sound: Sound) {
  if (get(soundOn)) {
    const soundEffectVolume = get(volume);
    try {
      playSound(sound, soundEffectVolume);
    } catch (e) {
      console.error(`Problem playing ${sound}: ${e}`);
    }
    if (window._testRecordSoundPlayed !== undefined) {
      window._testRecordSoundPlayed();
    }
  }
}
