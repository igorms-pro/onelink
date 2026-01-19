import { describe, it, expect } from "vitest";
import {
  isBaseHost,
  isSafeHttpUrl,
  isAppDomain,
  isLandingDomain,
} from "../src/lib/domain";
import {
  ONELINK_APP,
  ONELINK_LANDING,
  ONELINK_APP_DEV,
  LOCALHOST_PORT_DEV,
  LOCALHOST_PORT_ALT,
} from "../src/lib/constants";

describe("domain utils", () => {
  it("isBaseHost detects localhost and base domain", () => {
    expect(isBaseHost("localhost")).toBe(true);
    expect(isBaseHost(`localhost:${LOCALHOST_PORT_DEV}`)).toBe(true);
    expect(isBaseHost(`localhost:${LOCALHOST_PORT_ALT}`)).toBe(true);
    expect(isBaseHost(`example.${ONELINK_APP_DEV}`)).toBe(true);
    expect(isBaseHost(ONELINK_APP)).toBe(true);
    expect(isBaseHost(ONELINK_LANDING)).toBe(true);
    expect(isBaseHost("foo.bar")).toBe(false);
  });

  it("isSafeHttpUrl accepts http/https only", () => {
    expect(isSafeHttpUrl("http://example.com")).toBe(true);
    expect(isSafeHttpUrl("https://example.com")).toBe(true);
    expect(isSafeHttpUrl("ftp://example.com")).toBe(false);
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("not a url")).toBe(false);
  });

  it("isSafeHttpUrl handles edge cases", () => {
    expect(isSafeHttpUrl("http://localhost:3000")).toBe(true);
    expect(isSafeHttpUrl("https://subdomain.example.com/path?query=1")).toBe(
      true,
    );
    expect(isSafeHttpUrl("http://192.168.1.1")).toBe(true);
    expect(isSafeHttpUrl("data:text/plain,hello")).toBe(false);
    expect(isSafeHttpUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeHttpUrl("")).toBe(false);
  });

  it("isBaseHost handles edge cases", () => {
    expect(isBaseHost("GETONELINK.APP")).toBe(true); // case insensitive
    expect(isBaseHost(`sub.${ONELINK_APP_DEV}`)).toBe(true);
    expect(isBaseHost("localhost:8080")).toBe(false); // different port
    expect(isBaseHost(`example.${ONELINK_APP_DEV}.com`)).toBe(false); // different domain
    expect(isBaseHost("")).toBe(false);
  });

  it("isAppDomain correctly identifies app domain", () => {
    expect(isAppDomain(ONELINK_APP)).toBe(true);
    expect(isAppDomain(`sub.${ONELINK_APP}`)).toBe(true);
    expect(isAppDomain("localhost")).toBe(true);
    expect(isAppDomain(`localhost:${LOCALHOST_PORT_DEV}`)).toBe(true);
    expect(isAppDomain(`localhost:${LOCALHOST_PORT_ALT}`)).toBe(true);
    expect(isAppDomain(`example.${ONELINK_APP_DEV}`)).toBe(true);
    expect(isAppDomain(ONELINK_LANDING)).toBe(false);
    expect(isAppDomain(`sub.${ONELINK_LANDING}`)).toBe(false);
    expect(isAppDomain("example.com")).toBe(false);
  });

  it("isLandingDomain correctly identifies landing domain", () => {
    expect(isLandingDomain(ONELINK_LANDING)).toBe(true);
    expect(isLandingDomain(`sub.${ONELINK_LANDING}`)).toBe(true);
    expect(isLandingDomain(ONELINK_APP)).toBe(false); // Critical: app.getonelink.io should NOT match
    expect(isLandingDomain(`sub.${ONELINK_APP}`)).toBe(false);
    expect(isLandingDomain("localhost")).toBe(false);
    expect(isLandingDomain("example.com")).toBe(false);
  });

  it("isAppDomain and isLandingDomain are mutually exclusive for app domain", () => {
    // Critical test: app.getonelink.io should be app domain, NOT landing domain
    // This prevents redirect loops
    expect(isAppDomain(ONELINK_APP)).toBe(true);
    expect(isLandingDomain(ONELINK_APP)).toBe(false);

    // Landing domain should be landing, not app
    expect(isLandingDomain(ONELINK_LANDING)).toBe(true);
    expect(isAppDomain(ONELINK_LANDING)).toBe(false);
  });
});
