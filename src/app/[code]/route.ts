import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { collectRequestVisitSeed } from "@/lib/request";

export const dynamic = "force-dynamic";

type RedirectRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(request: Request, { params }: RedirectRouteProps) {
  const { code } = await params;
  const shortCode = code.trim();
  const url = new URL(request.url);
  const showInfo = url.searchParams.has("coto");

  const link = await prisma.link.findUnique({
    where: {
      shortCode,
    },
    select: {
      id: true,
      originalUrl: true,
      createdAt: true,
    },
  });

  if (!link) {
    return NextResponse.redirect(new URL("/?missing=1", request.url));
  }

  // If showing info, don't create visit yet and return JSON
  if (showInfo) {
    const visitCount = await prisma.visit.count({
      where: {
        linkId: link.id,
      },
    });

    return NextResponse.json({
      shortCode,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt.toISOString(),
      visitCount,
    });
  }

  // Create visit record
  const visitSeed = await collectRequestVisitSeed(request.headers);
  const visit = await prisma.visit.create({
    data: {
      linkId: link.id,
      ...visitSeed,
    },
  });

  return NextResponse.redirect(new URL(`/visit/${visit.id}`, request.url));
}
