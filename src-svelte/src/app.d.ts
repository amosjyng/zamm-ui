// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  interface Window {
    __TAURI_IPC__?: () => void;
    // @ts-ignore
    [key: string]: any;
  }
}

export {};
