import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { parseAcceptLanguageHeader, parsePlatformHint, parseUserAgent } from "@/lib/request";
import { visitMetadataSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type VisitDetailsRouteProps = {
  params: Promise<{
    visitId: string;
  }>;
};

function normalizeString(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeScalar<T>(value: T | null | undefined) {
  return value === undefined ? undefined : value;
}

export async function POST(request: Request, { params }: VisitDetailsRouteProps) {
  const { visitId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = visitMetadataSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const normalizedUserAgent = normalizeString(parsed.data.userAgent);
  const normalizedLanguage =
    normalizeString(parsed.data.language) ?? parseAcceptLanguageHeader(request.headers.get("accept-language"));
  const normalizedPlatform =
    normalizeString(parsed.data.platform) ?? parsePlatformHint(request.headers.get("sec-ch-ua-platform"));
  const userAgentInfo = parseUserAgent(normalizedUserAgent ?? request.headers.get("user-agent"));

  const result = await prisma.visit.updateMany({
    where: {
      id: visitId,
    },
      data: {
        screen: normalizeString(parsed.data.screen),
        orientation: normalizeString(parsed.data.orientation),
        language: normalizedLanguage,
        timezone: normalizeString(parsed.data.timezone),
        userTime: normalizeString(parsed.data.userTime),
        platform: normalizedPlatform,
        userAgent: normalizedUserAgent,
        cores: normalizeScalar(parsed.data.cores),
        ram: normalizeScalar(parsed.data.ram),
      cookies: normalizeScalar(parsed.data.cookies),
      touchPoints: normalizeScalar(parsed.data.touchPoints),
      webdriver: normalizeScalar(parsed.data.webdriver),
      plugins: normalizeString(parsed.data.plugins),
      fonts: normalizeString(parsed.data.fonts),
      gpu: normalizeString(parsed.data.gpu),
      device: userAgentInfo.device,
      os: userAgentInfo.os,
      browser: userAgentInfo.browser,
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
