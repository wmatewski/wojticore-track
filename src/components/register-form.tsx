"use client";

import { useAuth, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { GoogleIcon } from "@/components/google-icon";
import { registerSchema } from "@/lib/validation";

const CLERK_ERROR_TRANSLATIONS: Record<string, string> = {
  form_password_incorrect: "Niepoprawne haslo. Sprobuj ponownie.",
  form_identifier_not_found: "Nie znaleziono konta z podanym adresem email.",
  form_code_incorrect: "Podany kod jest niepoprawny.",
  form_password_pwned: "To haslo jest zbyt powszechne. Wybierz inne haslo.",
  form_password_length_too_short: "Haslo musi miec co najmniej 8 znakow.",
  form_param_format_invalid: "Podany adres email jest niepoprawny.",
  too_many_requests: "Zbyt wiele prob. Poczekaj chwile i sprobuj ponownie.",
  user_locked: "Konto zostalo tymczasowo zablokowane. Sprobuj pozniej.",
  session_exists: "Jestes juz zalogowany.",
  form_identifier_exists: "Konto z tym adresem email juz istnieje. Zaloguj sie.",
  verification_failed: "Weryfikacja nie powiodla sie. Sprawdz kod.",
  verification_expired: "Kod wygasl. Sprobuj zarejestrowac sie ponownie.",
};

function getClerkErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray(error.errors) &&
    error.errors.length > 0
  ) {
    const firstError = error.errors[0];

    if (firstError && typeof firstError === "object" && "code" in firstError) {
      const code = typeof firstError.code === "string" ? firstError.code : null;

      if (code && CLERK_ERROR_TRANSLATIONS[code]) {
        return CLERK_ERROR_TRANSLATIONS[code];
      }
    }

    if (firstError && typeof firstError === "object") {
      if ("longMessage" in firstError && typeof firstError.longMessage === "string") {
        const msg = firstError.longMessage;

        if (!msg.toLowerCase().includes("clerk") && !msg.includes("_code") && msg.length < 200) {
          return msg;
        }
      }

      if ("message" in firstError && typeof firstError.message === "string") {
        const msg = firstError.message;

        if (!msg.toLowerCase().includes("clerk") && !msg.includes("_code") && msg.length < 200) {
          return msg;
        }
      }
    }
  }

  return fallback;
}

function Spinner() {
  return (
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? undefined,
    lastName: parts.slice(1).join(" ") || undefined,
  };
}

export function RegisterForm() {
  const { isSignedIn } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  async function activateSession(sessionId: string | null) {
    if (!setActive || !sessionId) {
      return;
    }

    await setActive({
      session: sessionId,
      redirectUrl: "/dashboard",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isLoaded || !signUp) {
      setError("Rejestracja jest jeszcze inicjalizowana. Sprobuj ponownie za chwile.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Sprawdz formularz rejestracji.");
      return;
    }

    setIsPending(true);

    try {
      const result = await signUp.create({
        emailAddress: parsed.data.email.toLowerCase(),
        password: parsed.data.password,
        ...splitName(parsed.data.name),
      });

      if (result.status === "complete") {
        await activateSession(result.createdSessionId);
        return;
      }

      await result.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setNeedsVerification(true);
    } catch (clerkError) {
      setError(getClerkErrorMessage(clerkError, "Nie udalo sie rozpocząc rejestracji."));
    } finally {
      setIsPending(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!signUp) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim();

    if (!code) {
      setError("Wpisz kod weryfikacyjny z wiadomosci email.");
      return;
    }

    setIsPending(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await activateSession(result.createdSessionId);
        return;
      }

      setError("Nie udalo sie dokonczyc rejestracji.");
    } catch (clerkError) {
      setError(getClerkErrorMessage(clerkError, "Kod weryfikacyjny jest niepoprawny."));
    } finally {
      setIsPending(false);
    }
  }

  async function handleGoogleSignUp() {
    setError("");

    if (!isLoaded || !signUp) {
      setError("Logowanie przez Google nie jest jeszcze gotowe. Sprobuj ponownie za chwile.");
      return;
    }

    setIsPending(true);

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/oauth-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (clerkError) {
      setError(getClerkErrorMessage(clerkError, "Nie udalo sie rozpocząc logowania przez Google."));
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {error ? (
        <div className="rounded-lg border border-error bg-error-container px-4 py-3 font-body-md text-body-md text-on-error-container">
          {error}
        </div>
      ) : null}

      {needsVerification ? (
        <form className="flex flex-col gap-5" onSubmit={handleVerify}>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Wysłaliśmy kod weryfikacyjny na Twój adres email. Wpisz 6-cyfrowy kod poniżej.
          </p>
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="code">
              Kod weryfikacyjny
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                mark_email_unread
              </span>
              <input
                autoComplete="one-time-code"
                className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-12 pr-4 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary-container"
                id="code"
                inputMode="numeric"
                maxLength={8}
                name="code"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
                }}
                pattern="[0-9]*"
                placeholder="123456"
                required
                type="text"
              />
            </div>
          </div>

          <button
            className="flex h-14 items-center justify-center gap-2 rounded-lg bg-primary-container font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <>
                <Spinner />
                Weryfikacja...
              </>
            ) : (
              "Potwierdz konto"
            )}
          </button>
        </form>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="name">
              Nazwa wyswietlana
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                person
              </span>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jan Kowalski"
                className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-12 pr-4 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary-container"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
              Adres email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                mail
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="jan@kowalski.pl"
                className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-12 pr-4 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary-container"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
              Haslo
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                lock
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimum 8 znakow"
                className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-12 pr-12 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary-container"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
                onClick={() => {
                  setShowPassword((value) => !value);
                }}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">
              Powtorz haslo
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                verified_user
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Powtorz haslo"
                className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-12 pr-12 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary-container"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
                onClick={() => {
                  setShowConfirmPassword((value) => !value);
                }}
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <button
              className="flex h-14 items-center justify-center gap-2 rounded-lg bg-primary-container font-label-md text-label-md font-bold text-on-primary shadow-soft transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <>
                  <Spinner />
                  Tworzenie konta...
                </>
              ) : (
                "Utworz konto"
              )}
            </button>
            <button
              className="flex h-14 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-transparent font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-low"
              disabled={isPending}
              onClick={() => {
                void handleGoogleSignUp();
              }}
              type="button"
            >
              <GoogleIcon />
              Kontynuuj z Google
            </button>
          </div>

          <div id="clerk-captcha" />
        </form>
      )}
    </div>
  );
}
