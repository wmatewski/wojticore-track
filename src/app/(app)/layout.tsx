import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { requireUser } from "@/lib/auth";

function getInitials(name: string | null, email: string | null) {
  const source = name?.trim() || email?.trim() || "WT";

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "WT";
}

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireUser();
  const initials = getInitials(session.user.name, session.user.email);

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <nav className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col gap-2 border-r border-outline-variant bg-surface-container-lowest p-4 md:flex">
        <div className="mb-8 mt-4 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed font-bold text-on-primary-fixed">
            {initials}
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Wojticore</h1>
            <p className="font-label-sm text-label-sm text-secondary">Panel sterowania</p>
          </div>
        </div>

        <Link
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3 font-label-md text-label-md font-bold text-on-primary shadow-soft transition-colors hover:bg-primary-fixed-dim"
          href="/dashboard#create-link"
          prefetch={false}
        >
          <span className="material-symbols-outlined">add_link</span>
          Skroc link
        </Link>

        <div className="flex flex-1 flex-col gap-1">
          <Link
            className="flex items-center gap-3 rounded-lg bg-secondary-container px-4 py-3 font-label-md text-label-md font-bold text-on-secondary-container transition-all"
            href="/dashboard"
            prefetch={false}
          >
            <span className="material-symbols-outlined fill-icon">dashboard</span>
            Dashboard
          </Link>
        </div>

        <div className="mt-auto border-t border-surface-variant pt-2">
          <SignOutButton
            className="w-full justify-start rounded-lg border-transparent bg-transparent px-4 py-3 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            label="Wyloguj"
          />
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-container-max flex-1 flex-col gap-gutter px-margin-mobile py-margin-mobile pb-24 md:ml-64 md:px-margin-desktop md:py-margin-desktop md:pb-margin-desktop">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full justify-around items-center border-t border-outline-variant bg-surface py-2 px-4 pb-safe shadow-sm md:hidden">
        <Link
          className="flex h-14 w-16 flex-col items-center justify-center rounded-lg text-primary"
          href="/dashboard"
          prefetch={false}
        >
          <span className="material-symbols-outlined fill-icon mb-1">home</span>
          <span className="font-label-sm text-label-sm">Home</span>
        </Link>
        <Link
          className="flex h-14 w-16 flex-col items-center justify-center rounded-lg text-on-surface-variant"
          href="/dashboard#create-link"
          prefetch={false}
        >
          <span className="material-symbols-outlined mb-1">link</span>
          <span className="font-label-sm text-label-sm">Linki</span>
        </Link>
      </nav>
    </div>
  );
}
