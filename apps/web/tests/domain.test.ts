import { describe, it, expect } from "vitest";
import { isBaseHost, isSafeHttpUrl } from "../src/lib/domain";

describe("domain utils", () => {
  it("isBaseHost detects localhost and base domain", () => {
    expect(isBaseHost("localhost")).toBe(true);
    expect(isBaseHost("localhost:5173")).toBe(true);
    expect(isBaseHost("example.onemeet.app")).toBe(true);
    expect(isBaseHost("foo.bar")).toBe(false);
  });

  it("isSafeHttpUrl accepts http/https only", () => {
    expect(isSafeHttpUrl("http://example.com")).toBe(true);
    expect(isSafeHttpUrl("https://example.com")).toBe(true);
    expect(isSafeHttpUrl("ftp://example.com")).toBe(false);
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("not a url")).toBe(false);
  });
});


