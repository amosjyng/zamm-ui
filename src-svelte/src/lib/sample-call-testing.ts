import { assert } from "vitest";
import fs from "fs";
import yaml from "js-yaml";
import { Convert } from "./sample-call";

export interface ParsedCall {
  request: (string | Record<string, string>)[];
  response: Record<string, string>;
}

export function parseSampleCall(
  sampleFile: string,
  argumentsExpected: boolean,
): ParsedCall {
  const sample_call_yaml = fs.readFileSync(sampleFile, "utf-8");
  const sample_call_json = JSON.stringify(yaml.load(sample_call_yaml));
  const rawSample = Convert.toSampleCall(sample_call_json);

  const numExpectedArguments = argumentsExpected ? 2 : 1;
  assert(rawSample.request.length === numExpectedArguments);
  const parsedRequest = argumentsExpected
    ? [rawSample.request[0], JSON.parse(rawSample.request[1])]
    : rawSample.request;
  const parsedSample: ParsedCall = {
    request: parsedRequest,
    response: JSON.parse(rawSample.response),
  };
  return parsedSample;
}

export class TauriInvokePlayback {
  unmatchedCalls: ParsedCall[];

  constructor() {
    this.unmatchedCalls = [];
  }

  mockCall(
    ...args: (string | Record<string, string>)[]
  ): Promise<Record<string, string>> {
    const jsonArgs = JSON.stringify(args);
    const matchingCallIndex = this.unmatchedCalls.findIndex(
      (call) => JSON.stringify(call.request) === jsonArgs,
    );
    assert(matchingCallIndex !== -1, `No matching call found for ${jsonArgs}`);
    const matchingCall = this.unmatchedCalls[matchingCallIndex].response;
    this.unmatchedCalls.splice(matchingCallIndex, 1);
    return Promise.resolve(matchingCall);
  }

  addCalls(...calls: ParsedCall[]): void {
    this.unmatchedCalls.push(...calls);
  }
}
