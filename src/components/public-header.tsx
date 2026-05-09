import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { getAuthSession } from "@/lib/auth";

type PublicHeaderProps = {
  active?: "home" | "pricing";
};

function navLinkClass(active: boolean) {
  return active
    ? "border-b-2 border-primary pb-1 font-label-md text-label-md text-primary transition-colors"
    : "font-label-md text-label-md text-secondary transition-colors hover:text-primary";
}

export async function PublicHeader({ active = "home" }: PublicHeaderProps) {
  const session = await getAuthSession();
  const dashboardHref = session?.user?.id ? "/dashboard" : "/login";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-container-max items-center justify-between gap-6 px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-8 md:gap-12">
          <Link className="text-headline-md font-headline-md font-bold text-primary transition-opacity hover:opacity-90" href="/">
            Wojticore
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link className={navLinkClass(active === "pricing")} href="/cennik">
              Cennik
            </Link>
            <Link className={navLinkClass(false)} href={active === "home" ? "#analityka" : "/#analityka"}>
              Analityka
            </Link>
            <Link className={navLinkClass(false)} href={active === "home" ? "#open-source" : "/#open-source"}>
              Open Source
            </Link>
            <Link className={navLinkClass(false)} href={dashboardHref} prefetch={false}>
              Moje Linki
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {session?.user?.id ? (
            <>
              <Link
                className="hidden rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low md:block"
                href="/dashboard"
                prefetch={false}
              >
                Moje Linki
              </Link>
              <SignOutButton
                className="rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                label="Wyloguj"
                pendingLabel="Wylogowywanie..."
              />
            </>
          ) : (
            <>
              <Link
                className="hidden rounded-lg border border-transparent px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:border-outline-variant hover:bg-surface-container-low md:block"
                href="/login"
              >
                Zaloguj sie
              </Link>
              <Link
                className="rounded-lg bg-primary-container px-5 py-2.5 font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary"
                href="/register"
              >
                Zarejestruj sie
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
