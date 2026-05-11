import dns from "node:dns/promises";

import { UAParser } from "ua-parser-js";

function isPrivateIp(ipAddress: string) {
  const ip = ipAddress.trim().toLowerCase();

  return (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
}

function withTimeout<T>(promise: Promise<T>, fallback: T, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), timeoutMs);
    }),
  ]);
}

function formatAgentPart(name?: string, version?: string | null) {
  return name ? [name, version].filter(Boolean).join(" ") : null;
}

export function parseAcceptLanguageHeader(headerValue: string | null) {
  if (!headerValue) {
    return null;
  }

  const languages = headerValue
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter(Boolean)
    .slice(0, 6);

  return languages.length > 0 ? languages.join(", ") : null;
}

export function parsePlatformHint(headerValue: string | null) {
  const trimmed = headerValue?.replace(/"/g, "").trim();
  return trimmed ? trimmed : null;
}

export function getRequestIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return headers.get("x-real-ip")?.trim() ?? null;
}

export function parseUserAgent(userAgent: string | null) {
  const parser = new UAParser(userAgent ?? undefined);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  return {
    device: device.type ? `${device.type[0].toUpperCase()}${device.type.slice(1)}` : "Desktop",
    os: formatAgentPart(os.name, os.version),
    browser: formatAgentPart(browser.name, browser.version),
  };
}

async function lookupGeo(ipAddress: string | null) {
  if (!ipAddress || isPrivateIp(ipAddress)) {
    return {
      country: null,
      city: null,
      isp: null,
    };
  }

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ipAddress)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });

    if (!response.ok) {
      return {
        country: null,
        city: null,
        isp: null,
      };
    }

    const data = (await response.json()) as {
      success?: boolean;
      country?: string;
      city?: string;
      connection?: {
        isp?: string;
      };
    };

    if (data.success === false) {
      return {
        country: null,
        city: null,
        isp: null,
      };
    }

    return {
      country: data.country ?? null,
      city: data.city ?? null,
      isp: data.connection?.isp ?? null,
    };
  } catch {
    return {
      country: null,
      city: null,
      isp: null,
    };
  }
}

async function resolveHostname(ipAddress: string | null) {
  if (!ipAddress || isPrivateIp(ipAddress)) {
    return null;
  }

  try {
    return await withTimeout(
      dns.reverse(ipAddress).then((records) => records[0] ?? null),
      null,
      800,
    );
  } catch {
    return null;
  }
}

export async function collectRequestVisitSeed(headers: Headers) {
  const ipAddress = getRequestIp(headers);
  const userAgent = headers.get("user-agent");
  const referer = headers.get("referer");
  const language = parseAcceptLanguageHeader(headers.get("accept-language"));
  const platform = parsePlatformHint(headers.get("sec-ch-ua-platform"));
  const geo = await lookupGeo(ipAddress);
  const hostname = await resolveHostname(ipAddress);
  const parsedUserAgent = parseUserAgent(userAgent);

  return {
    ipAddress,
    userAgent,
    referer,
    country: geo.country,
    city: geo.city,
    isp: geo.isp,
    hostname,
    language,
    platform,
    device: parsedUserAgent.device,
    os: parsedUserAgent.os,
    browser: parsedUserAgent.browser,
  };
}
