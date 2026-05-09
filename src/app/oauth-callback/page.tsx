"use client";

import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function getClerkErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray(error.errors) &&
    error.errors.length > 0
  ) {
    const firstError = error.errors[0];

    if (firstError && typeof firstError === "object") {
      if ("longMessage" in firstError && typeof firstError.longMessage === "string") {
        return firstError.longMessage;
      }

      if ("message" in firstError && typeof firstError.message === "string") {
        return firstError.message;
      }
    }
  }

  return fallback;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? undefined,
    lastName: parts.slice(1).join(" ") || undefined,
  };
}

export default function OAuthCallbackPage() {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    let isMounted = true;

    async function resolveRedirect() {
      try {
        await clerk.handleRedirectCallback({
          signInUrl: "/login",
          signUpUrl: "/register",
          firstFactorUrl: "/login",
          secondFactorUrl: "/login",
          continueSignUpUrl: "/oauth-callback",
          afterSignInUrl: "/dashboard",
          afterSignUpUrl: "/dashboard",
        });
      } catch (callbackError) {
        if (isMounted) {
          setError(getClerkErrorMessage(callbackError, "Nie udalo sie dokonczyc logowania przez Google."));
        }
      } finally {
        if (isMounted) {
          setIsResolving(false);
        }
      }
    }

    void resolveRedirect();

    return () => {
      isMounted = false;
    };
  }, [clerk]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!signUp || signUp.status !== "missing_requirements") {
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Podaj nazwe wyswietlana, aby dokonczyc logowanie przez Google.");
      return;
    }

    setIsPending(true);
    setError("");

    const nameParts = splitName(trimmedName);
    const result = await signUp.update({
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
    });

    if (result.status === "complete" && result.createdSessionId && setActive) {
      await setActive({
        session: result.createdSessionId,
        redirectUrl: "/dashboard",
      });
      return;
    }

    setError("Nie udalo sie dokonczyc logowania przez Google.");
    setIsPending(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8">
      <div className="w-full max-w-lg rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-[0_20px_50px_rgba(14,20,32,0.08)]">
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            Google onboarding
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
            Dokoncz tworzenie konta.
          </h1>
          <p className="text-sm leading-7 text-[var(--muted)]">
            Clerk potrzebuje jeszcze podstawowej nazwy wyswietlanej, zanim aktywuje sesje i przekieruje Cie do dashboardu.
          </p>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--foreground)]">
            {error}
          </div>
        ) : null}

        {isResolving ? (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-[var(--background)] px-4 py-6 text-sm leading-7 text-[var(--muted)]">
            Finalizujemy odpowiedz Google i odczytujemy stan konta z Clerk.
          </div>
        ) : isLoaded && signUp?.status === "missing_requirements" ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="name">
                Nazwa wyswietlana
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                }}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/12"
                placeholder="Jan Kowalski"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Konczymy logowanie..." : "Zapisz i przejdz dalej"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm leading-7 text-[var(--muted)]">
              Jezeli sesja nie zostala jeszcze aktywowana, wroc do logowania i sprobuj ponownie.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]"
            >
              Wroc do logowania
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}