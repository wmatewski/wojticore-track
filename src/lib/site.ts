import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

export const siteConfig = {
  name: "Wojticore",
  description:
    "Nowoczesny panel do prywatnego skracania linkow, analityki klikniec i zarzadzania przekierowaniami.",
};

export function getBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configuredUrl) {
    return "http://localhost:3000";
  }

  return /^https?:\/\//.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`;
}

export function buildShortUrl(shortCode: string) {
  return new URL(`/${shortCode}`, getBaseUrl()).toString();
}

export function normalizeDestinationUrl(input: string) {
  const trimmed = input.trim();
  const withProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatRelativeDate(date: Date) {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: pl,
  });
}

export function shortenUrlForDisplay(url: string, maxLength = 54) {
  return url.length > maxLength ? `${url.slice(0, maxLength - 1)}...` : url;
}