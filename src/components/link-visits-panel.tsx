"use client";

import { useMemo, useState } from "react";

export type VisitRecord = {
  id: string;
  createdAt: string;
  ipAddress: string | null;
  referer: string | null;
  userAgent: string | null;
  country: string | null;
  city: string | null;
  isp: string | null;
  hostname: string | null;
  screen: string | null;
  orientation: string | null;
  language: string | null;
  timezone: string | null;
  userTime: string | null;
  platform: string | null;
  cores: number | null;
  ram: number | null;
  cookies: boolean | null;
  touchPoints: number | null;
  device: string | null;
  os: string | null;
  browser: string | null;
  gpu: string | null;
  fonts: string | null;
  plugins: string | null;
  webdriver: boolean | null;
};

type LinkVisitsPanelProps = {
  linkId: string;
  linkShortCode: string;
  visits: VisitRecord[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

function countItems(value: string | null) {
  if (!value) {
    return "0";
  }

  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean).length.toString();
}

function formatBoolean(value: boolean | null, trueLabel = "Tak", falseLabel = "Nie") {
  if (value === null) {
    return "Brak danych";
  }

  return value ? trueLabel : falseLabel;
}

function getLocation(visit: VisitRecord) {
  return [visit.city, visit.country].filter(Boolean).join(", ") || "Brak danych";
}

export function LinkVisitsPanel({ linkId, linkShortCode, visits }: LinkVisitsPanelProps) {
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  const visibleVisits = useMemo(() => visits.slice(0, visibleCount), [visibleCount, visits]);

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-soft">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-bright p-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">Ostatnie wizyty</h2>
          <a
            className="flex items-center gap-1 font-label-sm text-label-sm text-primary transition-colors hover:text-on-primary-fixed-variant"
            href={`/dashboard/links/${linkId}/export`}
          >
            Pobierz CSV
            <span className="material-symbols-outlined text-[16px]">download</span>
          </a>
        </div>

        {visits.length === 0 ? (
          <div className="px-6 py-16 text-center font-body-md text-body-md text-secondary">
            Ten link nie ma jeszcze zadnych zapisanych klikniec.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="px-6 py-3 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                      Data i czas
                    </th>
                    <th className="px-6 py-3 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                      Adres IP
                    </th>
                    <th className="px-6 py-3 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                      Lokalizacja
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md">
                  {visibleVisits.map((visit) => (
                    <tr
                      key={visit.id}
                      className="cursor-pointer border-b border-surface-variant transition-colors hover:bg-surface-container-lowest"
                      onClick={() => {
                        setSelectedVisit(visit);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-on-surface">
                        {formatDateTime(visit.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">
                        {visit.ipAddress ?? "Brak IP"}
                      </td>
                      <td className="px-6 py-4 text-on-surface">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-outline">
                            location_on
                          </span>
                          {getLocation(visit)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visibleCount < visits.length ? (
              <div className="flex justify-center border-t border-outline-variant bg-surface-container-lowest p-4">
                <button
                  className="font-label-md text-label-md text-primary transition-all hover:underline"
                  onClick={() => {
                    setVisibleCount((value) => value + 5);
                  }}
                  type="button"
                >
                  Pokaz wiecej
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {selectedVisit ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-on-surface/20 p-margin-mobile backdrop-blur-sm md:p-margin-desktop">
          <div className="relative my-auto flex w-full max-w-[1000px] flex-col rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-outline-variant bg-surface-container-lowest px-gutter py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
                  <span className="material-symbols-outlined">travel_explore</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Szczegoly klikniecia
                  </h2>
                  <p className="mt-1 font-label-md text-label-md text-secondary">
                    Pelny raport analityczny zarejestrowanego wejscia.
                  </p>
                </div>
              </div>
              <button
                aria-label="Zamknij"
                className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
                onClick={() => {
                  setSelectedVisit(null);
                }}
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex max-h-[716px] flex-col gap-6 overflow-y-auto bg-surface p-gutter">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="flex flex-col gap-5 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-surface-variant pb-3">
                    <span className="material-symbols-outlined text-[20px] text-secondary">info</span>
                    <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                      Podstawowe informacje
                    </h3>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
                    <div className="flex flex-col gap-1 min-w-0">
                      <dt className="font-label-sm text-label-sm text-secondary">ID rekordu</dt>
                      <dd className="font-body-md text-body-md font-medium text-on-surface truncate" title={selectedVisit.id}>{selectedVisit.id}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">ID linku</dt>
                      <dd className="font-body-md text-body-md font-medium text-primary">/{linkShortCode}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Data utworzenia</dt>
                      <dd className="font-body-md text-body-md text-on-surface">
                        {formatDateTime(selectedVisit.createdAt)}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Zrodlo (referer)</dt>
                      <dd className="truncate font-body-md text-body-md text-on-surface" title={selectedVisit.referer ?? undefined}>
                        {selectedVisit.referer ?? "Brak danych"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-col gap-5 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-surface-variant pb-3">
                    <span className="material-symbols-outlined text-[20px] text-secondary">public</span>
                    <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                      Siec i lokalizacja
                    </h3>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Adres IP</dt>
                      <dd className="font-body-md text-body-md font-medium text-on-surface">
                        {selectedVisit.ipAddress ?? "Brak danych"}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Dostawca (ISP)</dt>
                      <dd className="font-body-md text-body-md text-on-surface">
                        {selectedVisit.isp ?? "Brak danych"}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Kraj / miasto</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{getLocation(selectedVisit)}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Hostname</dt>
                      <dd className="truncate font-body-md text-body-md text-on-surface" title={selectedVisit.hostname ?? undefined}>
                        {selectedVisit.hostname ?? "Brak danych"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="flex flex-col gap-5 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-surface-variant pb-3">
                  <span className="material-symbols-outlined text-[20px] text-secondary">devices</span>
                  <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                    Urzadzenie i system
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <dl className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Urzadzenie</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{selectedVisit.device ?? "Brak danych"}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">System operacyjny</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{selectedVisit.os ?? "Brak danych"}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Przegladarka</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{selectedVisit.browser ?? "Brak danych"}</dd>
                    </div>
                  </dl>
                  <dl className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Rozdzielczosc ekranu</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{selectedVisit.screen ?? "Brak danych"}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Orientacja</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{selectedVisit.orientation ?? "Brak danych"}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Jezyk przegladarki</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{selectedVisit.language ?? "Brak danych"}</dd>
                    </div>
                  </dl>
                  <dl className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Strefa czasowa</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{selectedVisit.timezone ?? "Brak danych"}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Czas uzytkownika</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{selectedVisit.userTime ?? "Brak danych"}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-label-sm text-label-sm text-secondary">Platforma</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{selectedVisit.platform ?? "Brak danych"}</dd>
                    </div>
                  </dl>
                </div>
                <div className="mt-2 rounded-md bg-surface-container px-4 py-3">
                  <dt className="mb-1 font-label-sm text-label-sm text-secondary">Pelny user agent</dt>
                  <dd className="break-all font-mono text-label-md text-on-surface-variant">
                    {selectedVisit.userAgent ?? "Brak danych"}
                  </dd>
                </div>
              </div>

              <div className="flex flex-col gap-5 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-surface-variant pb-3">
                  <span className="material-symbols-outlined text-[20px] text-secondary">memory</span>
                  <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                    Zaawansowane (fingerprinting)
                  </h3>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
                  <div className="flex flex-col gap-1">
                    <dt className="font-label-sm text-label-sm text-secondary">Liczba rdzeni</dt>
                    <dd className="font-body-md text-body-md text-on-surface">{selectedVisit.cores ?? "Brak"}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="font-label-sm text-label-sm text-secondary">Pamiec RAM</dt>
                    <dd className="font-body-md text-body-md text-on-surface">
                      {selectedVisit.ram ? `${selectedVisit.ram} GB` : "Brak"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="font-label-sm text-label-sm text-secondary">Ekran dotykowy</dt>
                    <dd className="font-body-md text-body-md text-on-surface">
                      {formatBoolean((selectedVisit.touchPoints ?? 0) > 0, "Tak", "Nie")}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="font-label-sm text-label-sm text-secondary">Ciasteczka</dt>
                    <dd className="font-body-md text-body-md text-on-surface">
                      {formatBoolean(selectedVisit.cookies, "Aktywne", "Nieaktywne")}
                    </dd>
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <dt className="font-label-sm text-label-sm text-secondary">Karta graficzna (WebGL GPU)</dt>
                    <dd className="truncate font-body-md text-body-md text-on-surface" title={selectedVisit.gpu ?? undefined}>
                      {selectedVisit.gpu ?? "Brak danych"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="font-label-sm text-label-sm text-secondary">Liczba czcionek</dt>
                    <dd className="font-body-md text-body-md text-on-surface">{countItems(selectedVisit.fonts)}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="font-label-sm text-label-sm text-secondary">Wtyczki</dt>
                    <dd className="font-body-md text-body-md text-on-surface">{countItems(selectedVisit.plugins)}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="font-label-sm text-label-sm text-secondary">Detekcja webdriver</dt>
                    <dd className="font-body-md text-body-md text-on-surface">
                      {formatBoolean(selectedVisit.webdriver, "Wykryto", "Brak")}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="flex justify-end rounded-b-xl border-t border-outline-variant bg-surface-container-lowest px-gutter py-4">
              <button
                className="rounded border border-outline-variant px-6 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => {
                  setSelectedVisit(null);
                }}
                type="button"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
