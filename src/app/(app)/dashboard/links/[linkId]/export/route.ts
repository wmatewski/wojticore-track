import { NextResponse } from "next/server";
import type { Visit } from "@prisma/client";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ExportRouteProps = {
  params: Promise<{
    linkId: string;
  }>;
};

function escapeCsv(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value).replace(/"/g, '""');

  return `"${stringValue}"`;
}

export async function GET(_request: Request, { params }: ExportRouteProps) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { linkId } = await params;
  const link = await prisma.link.findFirst({
    where: {
      id: linkId,
      userId: session.user.id,
    },
    include: {
      visits: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!link) {
    return new NextResponse("Not found", { status: 404 });
  }

  const header = [
    "visitId",
    "createdAt",
    "shortCode",
    "originalUrl",
    "ipAddress",
    "referer",
    "country",
    "city",
    "isp",
    "hostname",
    "device",
    "os",
    "browser",
    "screen",
    "orientation",
    "language",
    "timezone",
    "userTime",
    "platform",
    "cores",
    "ram",
    "cookies",
    "touchPoints",
    "gpu",
    "fonts",
    "plugins",
    "webdriver",
    "userAgent",
  ];

  const rows = link.visits.map((visit: Visit) => [
    escapeCsv(visit.id),
    escapeCsv(visit.createdAt.toISOString()),
    escapeCsv(link.shortCode),
    escapeCsv(link.originalUrl),
    escapeCsv(visit.ipAddress),
    escapeCsv(visit.referer),
    escapeCsv(visit.country),
    escapeCsv(visit.city),
    escapeCsv(visit.isp),
    escapeCsv(visit.hostname),
    escapeCsv(visit.device),
    escapeCsv(visit.os),
    escapeCsv(visit.browser),
    escapeCsv(visit.screen),
    escapeCsv(visit.orientation),
    escapeCsv(visit.language),
    escapeCsv(visit.timezone),
    escapeCsv(visit.userTime),
    escapeCsv(visit.platform),
    escapeCsv(visit.cores),
    escapeCsv(visit.ram),
    escapeCsv(visit.cookies),
    escapeCsv(visit.touchPoints),
    escapeCsv(visit.gpu),
    escapeCsv(visit.fonts),
    escapeCsv(visit.plugins),
    escapeCsv(visit.webdriver),
    escapeCsv(visit.userAgent),
  ]);

  const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${link.shortCode}-visits.csv"`,
    },
  });
}
