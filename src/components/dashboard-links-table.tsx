"use client";

import Link from "next/link";
import { useState } from "react";

import { deleteLinkAction } from "@/actions/links";
import { CopyIconButton } from "@/components/copy-icon-button";
import { QRCodeModal } from "@/components/qr-code-modal";
import { buildShortUrl, shortenUrlForDisplay } from "@/lib/site";

type LinkWithCount = {
  id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: Date;
  _count: {
    visits: number;
  };
};

type DashboardLinksTableProps = {
  links: LinkWithCount[];
  currentPage: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  filteredCount: number;
  query: string;
  prevPageHref: string;
  nextPageHref: string;
};

export function DashboardLinksTable({
  links,
  currentPage,
  totalPages,
  pageStart,
  pageEnd,
  filteredCount,
  query,
  prevPageHref,
  nextPageHref,
}: DashboardLinksTableProps) {
  const [selectedQRCode, setSelectedQRCode] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-outline-variant bg-surface-bright">
            <tr>
              <th className="px-6 py-4 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                Skrocony link
              </th>
              <th className="px-6 py-4 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                Oryginalny URL
              </th>
              <th className="px-6 py-4 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                Klikniecia
              </th>
              <th className="px-6 py-4 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                Status
              </th>
              <th className="px-6 py-4 text-right font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant font-label-md text-label-md text-on-surface">
            {links.length === 0 ? (
              <tr>
                <td className="px-6 py-16 text-center font-body-md text-body-md text-secondary" colSpan={5}>
                  {query
                    ? "Brak linkow pasujacych do wyszukiwania."
                    : "Nie masz jeszcze zadnych linkow. Dodaj pierwszy skrot powyzej."}
                </td>
              </tr>
            ) : (
              links.map((link) => {
                const shortUrl = buildShortUrl(link.shortCode);

                return (
                  <tr key={link.id} className="group transition-colors hover:bg-surface-bright">
                    <td className="px-6 py-4 font-semibold text-primary">
                      <div className="flex items-center gap-2">
                        <span>/{link.shortCode}</span>
                        <CopyIconButton
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          value={shortUrl}
                        />
                        <button
                          className="opacity-0 transition-opacity group-hover:opacity-100 rounded-md p-2 text-secondary hover:bg-surface-container hover:text-primary"
                          onClick={() => setSelectedQRCode(shortUrl)}
                          title="Kod QR"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">qr_code</span>
                        </button>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-secondary" title={link.originalUrl}>
                      {shortenUrlForDisplay(link.originalUrl, 40)}
                    </td>
                    <td className="px-6 py-4 font-semibold">{link._count.visits.toLocaleString("pl-PL")}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-secondary-container px-2 py-1 font-label-sm text-label-sm text-on-secondary-container">
                        Aktywny
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-container hover:text-primary"
                          href={`/dashboard/links/${link.id}`}
                          prefetch={false}
                          title="Edytuj"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </Link>
                        <form action={deleteLinkAction}>
                          <input name="linkId" type="hidden" value={link.id} />
                          <button
                            className="rounded-md p-2 text-secondary transition-colors hover:bg-error-container hover:text-error"
                            title="Usun"
                            type="submit"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant bg-surface p-4">
        <span className="font-label-sm text-label-sm text-secondary">
          Pokazuje {pageStart}-{pageEnd} z {filteredCount} linkow.
        </span>
        <div className="flex gap-1">
          <Link
            aria-disabled={currentPage <= 1}
            className={`rounded-md border border-outline-variant p-2 text-secondary transition-colors ${
              currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-surface-container-low"
            }`}
            href={prevPageHref}
            prefetch={false}
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </Link>
          <Link
            aria-disabled={currentPage >= totalPages}
            className={`rounded-md border border-outline-variant p-2 text-secondary transition-colors ${
              currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-surface-container-low"
            }`}
            href={nextPageHref}
            prefetch={false}
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </Link>
        </div>
      </div>

      {selectedQRCode ? (
        <QRCodeModal
          title="Kod QR linku"
          url={selectedQRCode}
          isOpen={true}
          onClose={() => setSelectedQRCode(null)}
        />
      ) : null}
    </>
  );
}
