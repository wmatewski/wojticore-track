import Link from "next/link";

import { CreateLinkForm } from "@/components/create-link-form";
import { DashboardLinksTable } from "@/components/dashboard-links-table";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type DashboardPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

const pageSize = 10;

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildPageHref(page: number, query: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (page > 1) {
    params.set("page", page.toString());
  }

  const search = params.toString();

  return search ? `/dashboard?${search}` : "/dashboard";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await requireUser();
  const params = await searchParams;
  const query = getSingleValue(params.q)?.trim() ?? "";
  const requestedPage = Number.parseInt(getSingleValue(params.page) ?? "1", 10);
  const safeRequestedPage = Number.isNaN(requestedPage) ? 1 : Math.max(1, requestedPage);

  const where = {
    userId: session.user.id,
    ...(query
      ? {
          OR: [
            { shortCode: { contains: query, mode: "insensitive" as const } },
            { originalUrl: { contains: query, mode: "insensitive" as const } },
            { title: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [filteredCount, totalClicks, latestVisit, totalLinks] = await Promise.all([
    prisma.link.count({ where }),
    prisma.visit.count({
      where: {
        link: {
          userId: session.user.id,
        },
      },
    }),
    prisma.visit.findFirst({
      where: {
        link: {
          userId: session.user.id,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    }),
    prisma.link.count({
      where: {
        userId: session.user.id,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const currentPage = Math.min(safeRequestedPage, totalPages);
  const skip = (currentPage - 1) * pageSize;

  const links = await prisma.link.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: pageSize,
    include: {
      _count: {
        select: {
          visits: true,
        },
      },
    },
  });

  const pageStart = filteredCount === 0 ? 0 : skip + 1;
  const pageEnd = filteredCount === 0 ? 0 : Math.min(skip + links.length, filteredCount);

  return (
    <>
      <header className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-display text-on-surface">Przeglad</h2>
          <p className="mt-1 font-body-lg text-body-lg text-secondary">
            Zarzadzaj swoimi linkami i sledz ich wydajnosc.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2">
            <span className="material-symbols-outlined text-secondary">trending_up</span>
            <span className="font-label-md text-label-md text-on-surface">
              Razem klikniec: <strong>{totalClicks.toLocaleString("pl-PL")}</strong>
            </span>
          </div>
        </div>
      </header>

      <CreateLinkForm />

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-soft">
        <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface p-6 md:flex-row md:items-center md:justify-between">
          <h3 className="font-headline-md text-headline-md text-on-surface">Twoje linki</h3>
          <form className="relative" method="get">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
              search
            </span>
            <input
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 font-body-md text-body-md text-on-surface outline-none focus:border-primary md:w-64"
              defaultValue={query}
              name="q"
              placeholder="Szukaj..."
              type="text"
            />
          </form>
        </div>

        <DashboardLinksTable
          links={links}
          currentPage={currentPage}
          totalPages={totalPages}
          pageStart={pageStart}
          pageEnd={pageEnd}
          filteredCount={filteredCount}
          query={query}
          prevPageHref={buildPageHref(currentPage - 1, query)}
          nextPageHref={buildPageHref(currentPage + 1, query)}
        />
      </section>
    </>
  );
}
