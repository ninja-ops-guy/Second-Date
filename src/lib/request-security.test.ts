import assert from "node:assert/strict";
import test from "node:test";
import { isTrustedBrowserMutation } from "./request-security";

function req(headers: Record<string,string> = {}, url = "https://second-date.example/api/items") {
  return new Request(url, { method: "POST", headers });
}

test("accepts same-origin browser mutations", () => {
  assert.equal(isTrustedBrowserMutation(req({ origin: "https://second-date.example", "sec-fetch-site": "same-origin" })), true);
});

test("rejects cross-origin browser mutations", () => {
  assert.equal(isTrustedBrowserMutation(req({ origin: "https://evil.example", "sec-fetch-site": "cross-site" })), false);
  assert.equal(isTrustedBrowserMutation(req({ origin: "https://evil.example" })), false);
});

test("allows non-browser/server requests with no origin metadata", () => {
  assert.equal(isTrustedBrowserMutation(req()), true);
});

test("rejects malformed origins", () => {
  assert.equal(isTrustedBrowserMutation(req({ origin: "not a url" })), false);
});
