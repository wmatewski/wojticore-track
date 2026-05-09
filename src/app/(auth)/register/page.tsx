import Link from "next/link";

import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex w-full max-w-[440px] flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container shadow-soft">
          <span className="material-symbols-outlined text-on-primary" style={{ fontSize: 28 }}>
            person_add
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Wojticore</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Utworz konto i zarzadzaj swoimi linkami.
        </p>
      </div>

      <div className="flex w-full flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-soft">
        <div className="flex flex-col gap-1">
          <h2 className="font-headline-md text-headline-md text-on-surface">Zarejestruj sie</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Otwarta rejestracja dla kazdego konta. Google i email dzialaja przez Clerk.
          </p>
        </div>
        <RegisterForm />
      </div>

      <div className="text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Masz juz konto?{" "}
          <Link
            className="font-label-md text-label-md font-bold text-primary transition-colors hover:text-primary-container"
            href="/login"
          >
            Przejdz do logowania
          </Link>
        </p>
      </div>
    </div>
  );
}
