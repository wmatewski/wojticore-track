import Link from "next/link";

import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getAuthSession } from "@/lib/auth";

export default async function PricingPage() {
  const session = await getAuthSession();
  const freeHref = session?.user?.id ? "/dashboard" : "/register";

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background">
      <PublicHeader active="pricing" />
      <main className="flex flex-grow flex-col items-center justify-center bg-gradient-to-b from-surface-container-lowest to-background px-margin-mobile py-20 md:px-margin-desktop">
        <div className="mb-16 max-w-2xl text-center">
          <h1 className="mb-4 font-display text-display text-on-surface">
            Prosty cennik. Bez niespodzianek.
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Zacznij za darmo i skaluj swoje linki w miare wzrostu potrzeb.
            Narzedzie stworzone z mysla o analitykach i marketerach.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-gutter md:grid-cols-2">
          <div className="flex h-full flex-col rounded-xl border border-outline-variant bg-surface p-8">
            <div className="mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface">Darmowy</h2>
              <p className="mt-1 font-body-md text-body-md text-secondary">
                Idealny na start dla pojedynczych projektow.
              </p>
            </div>
            <div className="mb-8 flex items-baseline">
              <span className="font-display text-display text-on-surface">0 zl</span>
              <span className="ml-2 font-body-md text-body-md text-secondary">/ mc</span>
            </div>
            <div className="flex-grow">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[24px] text-primary">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface">Domena wojticore.pl</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[24px] text-primary">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface">Nielimitowane linki</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="material-symbols-outlined text-[24px] text-secondary">cancel</span>
                  <span className="font-body-md text-body-md text-secondary">Brak API</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="material-symbols-outlined text-[24px] text-secondary">cancel</span>
                  <span className="font-body-md text-body-md text-secondary">Brak white-labelingu</span>
                </li>
              </ul>
            </div>
            <Link
              className="mt-8 flex w-full items-center justify-center rounded-lg border border-outline-variant py-3 font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-low"
              href={freeHref}
              prefetch={false}
            >
              Rozpocznij za darmo
            </Link>
          </div>

          <div className="relative flex h-full flex-col rounded-xl border-2 border-primary bg-surface p-8 shadow-soft">
            <div className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-surface-container-high px-4 py-1 font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              Wkrotce
            </div>
            <div className="mb-6">
              <h2 className="font-headline-md text-headline-md text-on-surface">Pro</h2>
              <p className="mt-1 font-body-md text-body-md text-secondary">
                Dla profesjonalistow wymagajacych pelnej kontroli.
              </p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline">
                <span className="font-display text-display text-on-surface">10 zl</span>
                <span className="ml-2 font-body-md text-body-md text-secondary">/ mc</span>
              </div>
              <div className="mt-1 inline-block rounded bg-surface-container-low px-2 py-1 font-label-sm text-label-sm text-secondary">
                lub 110 zl/rok (oszczedzasz 10 zl)
              </div>
            </div>
            <div className="flex-grow">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[24px] text-primary">check_circle</span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">Wlasna domena</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[24px] text-primary">check_circle</span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">Nielimitowane linki</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[24px] text-primary">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface">Pelny dostep do API</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[24px] text-primary">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface">White-labelling</span>
                </li>
              </ul>
            </div>
            <button
              className="mt-8 w-full cursor-not-allowed rounded-lg bg-primary-container/50 py-3 font-label-md text-label-md font-bold text-on-primary opacity-80"
              disabled
              type="button"
            >
              Plan Pro wkrotce
            </button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
