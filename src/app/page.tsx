import Link from "next/link";

import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getAuthSession } from "@/lib/auth";

type HomePageProps = {
  searchParams: Promise<{
    missing?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const session = await getAuthSession();
  const params = await searchParams;
  const missingCode = Array.isArray(params.missing)
    ? params.missing.includes("1")
    : params.missing === "1";
  const primaryHref = session?.user?.id ? "/dashboard" : "/register";
  const secondaryHref = session?.user?.id ? "/dashboard" : "/login";

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background">
      <PublicHeader active="home" />
      <main className="flex-grow">
        <section className="mx-auto flex w-full max-w-container-max flex-col gap-8 px-margin-mobile py-24 text-center md:px-margin-desktop md:py-32">
          {missingCode ? (
            <div className="rounded-xl border border-error bg-error-container px-4 py-3 text-body-md text-on-error-container">
              Podany skrot nie istnieje albo zostal usuniety.
            </div>
          ) : null}

          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="font-display text-display text-on-surface">
              Skracaj linki, sledz analityke
            </h1>
            <p className="font-body-lg text-body-lg text-secondary">
              Minimalistyczne, wydajne i otwarte oprogramowanie do zarzadzania linkami.
              Stworzone dla profesjonalistow, ktorzy cenia prywatnosc i dokladne dane.
            </p>
          </div>

          <div className="relative z-10 mt-8 flex w-full max-w-4xl flex-col items-center gap-2 self-center rounded-xl border border-outline-variant bg-surface p-2 shadow-soft sm:flex-row sm:gap-4 sm:p-4">
            <div className="relative w-full flex-grow">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                link
              </span>
              <input
                className="h-14 w-full rounded-lg border border-transparent bg-surface-container-low pl-12 pr-4 text-body-md text-on-surface outline-none placeholder:text-outline"
                placeholder="Wklej dlugi link tutaj..."
                readOnly
                type="url"
              />
            </div>
            <Link
              className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-8 font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary sm:w-auto"
              href={primaryHref}
              prefetch={false}
            >
              {session?.user?.id ? "Przejdz do panelu" : "Skroc link"}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-surface-variant bg-surface-container-low px-3 py-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
              <span className="font-label-sm text-label-sm uppercase text-secondary">Bez reklam</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-surface-variant bg-surface-container-low px-3 py-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
              <span className="font-label-sm text-label-sm uppercase text-secondary">API dostepne</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link
              className="rounded-lg border border-outline-variant px-5 py-3 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
              href={secondaryHref}
              prefetch={false}
            >
              {session?.user?.id ? "Otworz dashboard" : "Zaloguj sie"}
            </Link>
            <Link
              className="rounded-lg px-5 py-3 font-label-md text-label-md text-primary transition-colors hover:text-on-primary-fixed-variant"
              href="/cennik"
            >
              Zobacz cennik
            </Link>
          </div>
        </section>

        <section id="analityka" className="mx-auto w-full max-w-container-max px-margin-mobile py-16 md:px-margin-desktop">
          <h2 className="mb-12 text-center font-headline-lg text-headline-lg text-on-surface">
            Zaprojektowane dla efektywnosci
          </h2>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
            <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface p-8 shadow-soft md:col-span-8">
              <div className="relative z-10 max-w-md">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container/10">
                  <span className="material-symbols-outlined fill-icon text-[28px] text-primary">
                    bar_chart
                  </span>
                </div>
                <h3 className="mb-3 font-headline-md text-headline-md text-on-surface">
                  Dokladne dane analityczne
                </h3>
                <p className="font-body-md text-body-md text-secondary">
                  Sledz klikniecia w czasie rzeczywistym. Analizuj zrodla ruchu,
                  lokalizacje geograficzna i urzadzenia swoich uzytkownikow w przejrzystym dashboardzie.
                </p>
              </div>
              <div className="-mx-8 -mb-8 mt-8 flex h-40 items-end rounded-b-xl border-t border-outline-variant bg-gradient-to-t from-surface-container-low to-transparent px-8 pb-4 opacity-70">
                <div className="flex h-24 w-full items-end justify-between gap-2">
                  <div className="h-1/3 w-1/6 rounded-t-md bg-primary/20" />
                  <div className="h-2/3 w-1/6 rounded-t-md bg-primary/40" />
                  <div className="h-1/2 w-1/6 rounded-t-md bg-primary/60" />
                  <div className="h-full w-1/6 rounded-t-md bg-primary" />
                  <div className="h-4/5 w-1/6 rounded-t-md bg-primary/80" />
                  <div className="h-1/4 w-1/6 rounded-t-md bg-primary/30" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface p-8 shadow-soft md:col-span-4">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-highest">
                <span className="material-symbols-outlined text-[28px] text-on-surface-variant">
                  speed
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Prostota obslugi</h3>
              <p className="font-body-md text-body-md text-secondary">
                Brak zbednych opcji. Niewidzialny design, ktory skupia sie wylacznie na tym,
                co najwazniejsze: szybkim skracaniu i czytelnych danych.
              </p>
            </div>

            <div id="open-source" className="flex items-center gap-6 rounded-xl border border-outline-variant bg-surface-container-low p-8 md:col-span-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface shadow-soft">
                <span className="material-symbols-outlined text-[32px] text-on-surface">code_blocks</span>
              </div>
              <div>
                <h3 className="mb-2 font-headline-md text-headline-md text-on-surface">Open Source</h3>
                <p className="font-body-md text-body-md text-secondary">
                  Kod zrodlowy jest dostepny publicznie. Mozesz hostowac Wojticore na wlasnym serwerze
                  dla pelnej kontroli nad swoimi danymi i procesem trackingu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 rounded-xl border border-outline-variant bg-surface p-8 shadow-soft md:col-span-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-container">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant">lock</span>
              </div>
              <div>
                <h3 className="mb-2 font-headline-md text-headline-md text-on-surface">Prywatnosc gwarantowana</h3>
                <p className="font-body-md text-body-md text-secondary">
                  Brak ukrytych trackerow stron trzecich. Twoje linki i dane uzytkownikow sa bezpieczne,
                  a szczegoly wizyt zapisywane wyłącznie w Twojej instancji aplikacji.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-container-max px-margin-mobile py-20 md:px-margin-desktop">
          <div className="flex flex-col items-center justify-between gap-10 rounded-2xl border border-outline-variant bg-surface-container-highest p-10 md:flex-row md:p-16">
            <div className="max-w-xl">
              <h2 className="mb-4 font-headline-lg text-headline-lg text-on-surface">
                Darmowe dla uzytkownikow prywatnych
              </h2>
              <p className="mb-8 font-body-lg text-body-lg text-secondary">
                Wierzymy w wolny internet. Podstawowe funkcje skracania i sledzenia linkow
                sa darmowe dla uzytku niekomercyjnego, a plan Pro pojawi sie wkrotce.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">check</span>
                  <span className="font-label-md text-label-md text-on-surface">Nielimitowane linki w planie Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">check</span>
                  <span className="font-label-md text-label-md text-on-surface">Pelna analityka klikniec</span>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <Link
                className="inline-flex h-14 items-center justify-center rounded-lg bg-primary-container px-8 font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary"
                href={session?.user?.id ? "/dashboard" : "/register"}
                prefetch={false}
              >
                Zacznij za darmo
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
