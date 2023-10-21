import { get } from "svelte/store";
import { playSound, type Sound } from "./bindings";
import { soundOn, volume } from "./preferences";

export function playSoundEffect(sound: Sound) {
  if (get(soundOn)) {
    const soundEffectVolume = get(volume) / 100.0;
    playSound(sound, soundEffectVolume);
    if (window._testRecordSoundPlayed !== undefined) {
      window._testRecordSoundPlayed();
    }
  }
  if (window._testRecordSoundPlayed !== undefined) {
    window._testRecordSoundPlayed();
  }
}
