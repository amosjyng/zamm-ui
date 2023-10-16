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
