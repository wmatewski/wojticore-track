import { afterEach, describe, expect, it } from "vitest";

import {
  buildShortUrl,
  getBaseUrl,
  normalizeDestinationUrl,
  shortenUrlForDisplay,
} from "@/lib/site";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_APP_URL;
});

describe("site helpers", () => {
  it("returns localhost base url when NEXT_PUBLIC_APP_URL is missing", () => {
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("normalizes NEXT_PUBLIC_APP_URL without protocol", () => {
    process.env.NEXT_PUBLIC_APP_URL = "l.wojmatech.com";

    expect(getBaseUrl()).toBe("https://l.wojmatech.com");
  });

  it("builds short urls from configured base url", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://l.wojmatech.com";

    expect(buildShortUrl("abc123")).toBe("https://l.wojmatech.com/abc123");
  });

  it("normalizes destination urls and rejects unsupported schemes", () => {
    expect(normalizeDestinationUrl("example.com/path")).toBe("https://example.com/path");
    expect(normalizeDestinationUrl("https://example.com/path")).toBe("https://example.com/path");
    expect(normalizeDestinationUrl("ftp://example.com/file")).toBeNull();
  });

  it("shortens long urls for display", () => {
    expect(shortenUrlForDisplay("1234567890", 6)).toBe("12345...");
    expect(shortenUrlForDisplay("short", 10)).toBe("short");
  });
});
