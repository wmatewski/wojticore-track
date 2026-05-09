import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteLinkAction } from "@/actions/links";
import { CopyButton } from "@/components/copy-button";
import { LinkUpdateForm } from "@/components/link-update-form";
import { LinkVisitsPanel } from "@/components/link-visits-panel";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildShortUrl, formatRelativeDate, shortenUrlForDisplay } from "@/lib/site";

type LinkDetailsPageProps = {
  params: Promise<{
    linkId: string;
  }>;
};

function serializeVisit(visit: NonNullable<Awaited<ReturnType<typeof prisma.visit.findFirst>>>) {
  return {
    ...visit,
    createdAt: visit.createdAt.toISOString(),
    updatedAt: visit.updatedAt.toISOString(),
  };
}

export default async function LinkDetailsPage({ params }: LinkDetailsPageProps) {
  const session = await requireUser();
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
    notFound();
  }

  const shortUrl = buildShortUrl(link.shortCode);
  const uniqueIps = new Set(link.visits.map((visit) => visit.ipAddress).filter(Boolean)).size;
  const latestVisit = link.visits[0]?.createdAt;

  return (
    <>
      <div className="mb-6 flex items-center gap-2">
        <Link
          className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
          href="/dashboard"
          prefetch={false}
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Wroc do listy
        </Link>
      </div>

      <header className="mb-gutter flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-display text-display text-on-surface">Szczegoly linku</h1>
            <span className="rounded-full bg-surface-container-high px-2.5 py-1 font-label-sm text-label-sm uppercase tracking-wider text-on-surface">
              Aktywny
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Zarzadzaj ustawieniami i analizuj ruch dla wybranego skrotu.
          </p>
        </div>
        <form action={deleteLinkAction}>
          <input name="linkId" type="hidden" value={link.id} />
          <button
            className="flex h-10 items-center gap-2 rounded-lg border border-error bg-transparent px-4 py-2 font-label-md text-label-md text-error transition-colors hover:bg-error-container hover:text-on-error-container"
            type="submit"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
            Usun link
          </button>
        </form>
      </header>

      <div className="mb-gutter grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <section className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft lg:col-span-2">
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm uppercase text-secondary">Skrocony adres URL</label>
            <div className="flex items-center gap-3 rounded-lg border border-surface-variant bg-surface p-4">
              <span className="material-symbols-outlined text-[24px] text-primary">link</span>
              <span className="flex-1 truncate font-headline-md text-headline-md text-on-surface select-all">
                {shortUrl}
              </span>
              <CopyButton value={shortUrl} className="shrink-0" copiedLabel="Gotowe" label="Kopiuj" />
            </div>
          </div>

          <div className="h-px w-full bg-outline-variant" />

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm uppercase text-secondary">
              Docelowy adres URL (mozna zmienic)
            </label>
            <LinkUpdateForm initialUrl={link.originalUrl} linkId={link.id} />
          </div>
        </section>

        <aside className="relative overflow-hidden rounded-xl bg-primary-container p-6 text-on-primary-container shadow-[0_4px_12px_rgba(37,99,235,0.1)]">
          <div className="absolute -right-4 -top-4 opacity-10">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: '"FILL" 1' }}>
              ads_click
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="mb-2 font-label-md text-label-md uppercase opacity-90">Calkowita liczba klikniec</h3>
            <div className="mb-1 font-display text-display text-on-primary-container">
              {link.visits.length.toLocaleString("pl-PL")}
            </div>
            <p className="font-label-sm text-label-sm opacity-80">
              Unikalne IP: {uniqueIps.toLocaleString("pl-PL")}
            </p>
          </div>
          <div className="relative z-10 mt-6 flex items-center justify-between border-t border-on-primary-container/20 pt-6">
            <span className="font-label-sm text-label-sm">Ostatnie klikniecie:</span>
            <span className="font-label-sm text-label-sm font-bold">
              {latestVisit ? formatRelativeDate(latestVisit) : "Brak wizyt"}
            </span>
          </div>
        </aside>
      </div>

      <section className="mb-gutter flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft">
        <div className="flex flex-col gap-2">
          <h2 className="font-headline-md text-headline-md text-on-surface">Szczegoly linku</h2>
          <p className="font-body-md text-body-md text-secondary">
            {shortenUrlForDisplay(link.originalUrl, 100)}
          </p>
        </div>
      </section>

      <LinkVisitsPanel
        linkId={link.id}
        linkShortCode={link.shortCode}
        visits={link.visits.map((visit) => serializeVisit(visit))}
      />
    </>
  );
}
