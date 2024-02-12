import { expect, test } from "vitest";
import { formatUrl } from "./Creditor.svelte";

describe("URL formatter", () => {
  test("formats HTTP(S) URL correctly", () => {
    expect(formatUrl("http://yahoo.com")).toEqual("yahoo.com");
    expect(formatUrl("https://google.com")).toEqual("google.com");
  });

  test("formats Github URLs correctly", () => {
    expect(formatUrl("https://github.com/amosjyng/")).toEqual("amosjyng");
  });

  test("strips ending slash from URL", () => {
    expect(formatUrl("https://tauri.app/")).toEqual("tauri.app");
  });
});
