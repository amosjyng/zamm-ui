import { writable, type Writable } from "svelte/store";
import type { SystemInfo } from "./bindings";

export const systemInfo: Writable<SystemInfo | undefined> = writable(undefined);
