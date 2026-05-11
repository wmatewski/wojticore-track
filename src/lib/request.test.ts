import { describe, expect, it } from "vitest";

import { parseAcceptLanguageHeader, parsePlatformHint } from "@/lib/request";

describe("parseAcceptLanguageHeader", () => {
  it("returns normalized languages without quality values", () => {
    expect(parseAcceptLanguageHeader("pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7")).toBe("pl-PL, pl, en-US, en");
  });

  it("limits the number of stored languages", () => {
    expect(parseAcceptLanguageHeader("a,b,c,d,e,f,g")).toBe("a, b, c, d, e, f");
  });

  it("returns null for empty values", () => {
    expect(parseAcceptLanguageHeader(null)).toBeNull();
    expect(parseAcceptLanguageHeader(" , ;q=0.9 ")).toBeNull();
  });
});

describe("parsePlatformHint", () => {
  it("strips quotes from sec-ch-ua-platform", () => {
    expect(parsePlatformHint('"Windows"')).toBe("Windows");
  });

  it("returns null for blank values", () => {
    expect(parsePlatformHint("   ")).toBeNull();
    expect(parsePlatformHint(null)).toBeNull();
  });
});
