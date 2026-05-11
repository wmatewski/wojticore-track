"use client";

import { useEffect, useRef } from "react";

type VisitRedirectorProps = {
  visitId: string;
  originalUrl: string;
};

type NavigatorWithMetadata = Navigator & {
  deviceMemory?: number;
  userAgentData?: {
    platform?: string;
  };
};

const COMMON_FONTS = [
  "Arial",
  "Arial Black",
  "Calibri",
  "Cambria",
  "Comic Sans MS",
  "Courier New",
  "Georgia",
  "Helvetica",
  "Impact",
  "Inter",
  "Roboto",
  "Segoe UI",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
];

const FONT_CHECK_TIMEOUT_MS = 150;
const REDIRECT_TIMEOUT_MS = 1200;
const MAX_LANGUAGE_STRING_LENGTH = 256;
const MAX_LIST_FIELD_LENGTH = 4000;
const MAX_GPU_STRING_LENGTH = 400;

function normalizeString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getLanguages() {
  const languages = navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  return joinDistinctValues(languages, MAX_LANGUAGE_STRING_LENGTH);
}

function joinDistinctValues(values: ReadonlyArray<string | null | undefined>, maxLength: number) {
  const result: string[] = [];
  let currentLength = 0;

  for (const value of values) {
    const normalized = normalizeString(value);

    if (!normalized || result.includes(normalized)) {
      continue;
    }

    const nextLength = currentLength + normalized.length + (result.length > 0 ? 1 : 0);
    if (nextLength > maxLength) {
      break;
    }

    result.push(normalized);
    currentLength = nextLength;
  }

  return result.length > 0 ? result.join("\n") : null;
}

function getScreenDetails() {
  if (typeof window === "undefined") {
    return null;
  }

  const pixelRatio = Number(window.devicePixelRatio?.toFixed(2) ?? 1);
  return `${window.screen.width}x${window.screen.height} | viewport ${window.innerWidth}x${window.innerHeight} | dpr ${pixelRatio}`;
}

function getOrientationDetails() {
  if (typeof window === "undefined") {
    return null;
  }

  const orientation = window.screen.orientation;
  if (orientation?.type) {
    return orientation.angle ? `${orientation.type} | ${orientation.angle}deg` : orientation.type;
  }

  return window.innerWidth >= window.innerHeight ? "landscape" : "portrait";
}

function getUserTime() {
  const locale = navigator.language || undefined;

  return new Date().toLocaleString(locale, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function getPlugins() {
  if (typeof navigator === "undefined" || navigator.plugins.length === 0) {
    return null;
  }

  return joinDistinctValues(
    Array.from(navigator.plugins, (plugin) => {
      return plugin.name || plugin.filename || plugin.description || null;
    }),
    MAX_LIST_FIELD_LENGTH,
  );
}

function getGpu() {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  const context =
    canvas.getContext("webgl") ??
    (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

  if (!context) {
    return null;
  }

  const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
  const vendor = debugInfo ? context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : context.getParameter(context.VENDOR);
  const renderer = debugInfo
    ? context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    : context.getParameter(context.RENDERER);

  return joinDistinctValues(
    [
      typeof vendor === "string" ? vendor : null,
      typeof renderer === "string" ? renderer : null,
    ],
    MAX_GPU_STRING_LENGTH,
  );
}

async function getFonts() {
  if (typeof document === "undefined" || !("fonts" in document)) {
    return null;
  }

  await Promise.race([
    document.fonts.ready.catch(() => undefined),
    new Promise((resolve) => {
      window.setTimeout(resolve, FONT_CHECK_TIMEOUT_MS);
    }),
  ]);

  return joinDistinctValues(
    COMMON_FONTS.filter((fontName) => document.fonts.check(`12px "${fontName}"`)),
    MAX_LIST_FIELD_LENGTH,
  );
}

async function collectVisitMetadata() {
  const navigatorObject = navigator as NavigatorWithMetadata;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    screen: getScreenDetails(),
    orientation: getOrientationDetails(),
    language: getLanguages(),
    timezone: normalizeString(timezone),
    userTime: getUserTime(),
    platform: normalizeString(navigatorObject.userAgentData?.platform ?? navigator.platform),
    userAgent: normalizeString(navigator.userAgent),
    cores: navigator.hardwareConcurrency || null,
    ram: navigatorObject.deviceMemory || null,
    cookies: navigator.cookieEnabled,
    touchPoints: navigator.maxTouchPoints || 0,
    webdriver: navigator.webdriver,
    plugins: getPlugins(),
    fonts: await getFonts(),
    gpu: getGpu(),
  };
}

async function persistVisitMetadata(visitId: string, metadata: Awaited<ReturnType<typeof collectVisitMetadata>>) {
  const body = JSON.stringify(metadata);
  const endpoint = `/api/visits/${visitId}/details`;

  if (typeof navigator.sendBeacon === "function") {
    const payload = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(endpoint, payload)) {
      return;
    }
  }

  await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
    cache: "no-store",
    keepalive: true,
  });
}

export function VisitRedirector({ visitId, originalUrl }: VisitRedirectorProps) {
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    const redirectToDestination = () => {
      if (hasRedirectedRef.current) {
        return;
      }

      hasRedirectedRef.current = true;
      window.location.replace(originalUrl);
    };

    const fallbackRedirect = window.setTimeout(redirectToDestination, REDIRECT_TIMEOUT_MS);

    void (async () => {
      try {
        const metadata = await collectVisitMetadata();
        await persistVisitMetadata(visitId, metadata);
      } catch {
        // ignore metadata collection failures and continue redirect
      }

      redirectToDestination();
    })();

    return () => {
      window.clearTimeout(fallbackRedirect);
    };
  }, [originalUrl, visitId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-on-background">
      <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-soft">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
          <span className="material-symbols-outlined text-[28px]">travel_explore</span>
        </div>
        <div className="space-y-2">
          <h1 aria-live="polite" className="font-headline-md text-headline-md text-on-surface">
            Trwa przekierowanie
          </h1>
          <p aria-live="polite" className="font-body-md text-body-md text-secondary">
            Zbieramy pełne metadane wejścia, aby zapis wizyty był jak najdokładniejszy.
          </p>
        </div>
        <a
          className="font-label-md text-label-md text-primary transition-colors hover:text-on-primary-fixed-variant"
          href={originalUrl}
        >
          Kliknij tutaj, jeśli przekierowanie nie nastąpi automatycznie
        </a>
      </div>
    </main>
  );
}
