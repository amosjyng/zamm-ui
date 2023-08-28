import { expect, test, vi } from "vitest";
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/svelte";
import ApiKeysDisplay from "./+page.svelte";
import type { ApiKeys } from "$lib/bindings";
import { within, waitFor } from "@testing-library/dom";
import fs from "fs";
import { Convert } from "$lib/sample-call";

const tauriInvokeMock = vi.fn();

vi.stubGlobal("__TAURI_INVOKE__", tauriInvokeMock);

test("loading by default", async () => {
  const spy = vi.spyOn(window, "__TAURI_INVOKE__");
  expect(spy).not.toHaveBeenCalled();
  const mockApiKeys: ApiKeys = {
    openai: null,
  };
  tauriInvokeMock.mockResolvedValueOnce(mockApiKeys);

  render(ApiKeysDisplay, {});
  expect(spy).toHaveBeenLastCalledWith("get_api_keys");

  const openAiRow = screen.getByRole("row", { name: /OpenAI/ });
  const openAiKeyCell = within(openAiRow).getAllByRole("cell")[1];
  expect(openAiKeyCell).toHaveTextContent(/^...loading$/);
});

test("no API key set", async () => {
  const spy = vi.spyOn(window, "__TAURI_INVOKE__");
  expect(spy).not.toHaveBeenCalled();
  const sample_call_json = fs.readFileSync(
    "../src-tauri/api/sample-calls/get_api_keys-empty.json",
    "utf-8",
  );
  const sampleCall = Convert.toSampleCall(sample_call_json);
  const apiKeys: ApiKeys = JSON.parse(sampleCall.response);
  tauriInvokeMock.mockResolvedValueOnce(apiKeys);

  render(ApiKeysDisplay, {});
  expect(sampleCall.request.length).toEqual(0);
  expect(spy).toHaveBeenLastCalledWith("get_api_keys");

  const openAiRow = screen.getByRole("row", { name: /OpenAI/ });
  const openAiKeyCell = within(openAiRow).getAllByRole("cell")[1];
  await waitFor(() => expect(openAiKeyCell).toHaveTextContent(/^not set$/));
});

test("some API key set", async () => {
  const spy = vi.spyOn(window, "__TAURI_INVOKE__");
  expect(spy).not.toHaveBeenCalled();
  const sample_call_json = fs.readFileSync(
    "../src-tauri/api/sample-calls/get_api_keys-openai.json",
    "utf-8",
  );
  const sampleCall = Convert.toSampleCall(sample_call_json);
  const apiKeys: ApiKeys = JSON.parse(sampleCall.response);
  tauriInvokeMock.mockResolvedValueOnce(apiKeys);

  render(ApiKeysDisplay, {});
  expect(sampleCall.request.length).toEqual(0);
  expect(spy).toHaveBeenLastCalledWith("get_api_keys");

  const openAiRow = screen.getByRole("row", { name: /OpenAI/ });
  const openAiKeyCell = within(openAiRow).getAllByRole("cell")[1];
  await waitFor(() =>
    expect(openAiKeyCell).toHaveTextContent(/^0p3n41-4p1-k3y$/),
  );
});

test("API key error", async () => {
  const spy = vi.spyOn(window, "__TAURI_INVOKE__");
  expect(spy).not.toHaveBeenCalled();
  tauriInvokeMock.mockRejectedValueOnce("testing");

  render(ApiKeysDisplay, {});
  expect(spy).toHaveBeenLastCalledWith("get_api_keys");

  const openAiRow = screen.getByRole("row", { name: /OpenAI/ });
  const openAiKeyCell = within(openAiRow).getAllByRole("cell")[1];
  await waitFor(() =>
    expect(openAiKeyCell).toHaveTextContent(/^error: testing$/),
  );
});
