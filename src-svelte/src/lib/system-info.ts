import { writable, type Writable } from "svelte/store";
import type { SystemInfo, ApiKeys } from "./bindings";

export const systemInfo: Writable<SystemInfo | undefined> = writable(undefined);
export const apiKeys: Writable<ApiKeys> = writable({
  openai: null,
});
