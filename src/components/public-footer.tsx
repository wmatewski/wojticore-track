import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-outline-variant bg-surface-container-low py-8 px-margin-mobile md:px-margin-desktop">
      <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-4 md:flex-row">
        <div className="font-label-md text-label-md font-bold text-on-surface">
          © 2026 Wojticore. Wszelkie prawa zastrzezone.
        </div>
        <nav className="flex items-center gap-6">
          <Link className="font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-primary" href="/#privacy">
            Prywatnosc
          </Link>
          <Link className="font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-primary" href="/#terms">
            Regulamin
          </Link>
          <Link className="font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-primary" href="/#api">
            API
          </Link>
          <Link className="font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-primary" href="/#contact">
            Kontakt
          </Link>
        </nav>
      </div>
    </footer>
  );
}
