"use client";

import { useSignIn } from "@clerk/nextjs";
import { FormEvent, useState } from "react";

import { GoogleIcon } from "@/components/google-icon";
import { signInSchema } from "@/lib/validation";

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
  identifier_already_signed_in: "Jestes juz zalogowany na to konto.",
  verification_failed: "Weryfikacja nie powiodla sie. Sprawdz kod.",
  verification_expired: "Kod wygasl. Sprobuj ponownie.",
};

type SignInFormProps = {
  registrationSuccess: boolean;
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

export function SignInForm({ registrationSuccess }: SignInFormProps) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    if (!isLoaded || !signIn) {
      setError("Logowanie jest jeszcze inicjalizowane. Sprobuj ponownie za chwile.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Sprawdz dane logowania.");
      return;
    }

    setIsPending(true);

    try {
      const result = await signIn.create({
        strategy: "password",
        identifier: parsed.data.email,
        password: parsed.data.password,
      });

      if (result.status === "complete") {
        await activateSession(result.createdSessionId);
        return;
      }

      if (result.status === "needs_second_factor") {
        const supportsEmailCode = result.supportedSecondFactors?.some(
          (factor) => factor.strategy === "email_code",
        );

        if (supportsEmailCode) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
          });
          setNeedsVerification(true);
          return;
        }
      }

      setError("Nie udalo sie dokonczyc logowania. Sprobuj ponownie.");
    } catch (clerkError) {
      setError(getClerkErrorMessage(clerkError, "Nie udalo sie zalogowac. Sprawdz email i haslo."));
    } finally {
      setIsPending(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!signIn) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim();

    if (!code) {
      setError("Wpisz kod przeslany na adres email.");
      return;
    }

    setIsPending(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await activateSession(result.createdSessionId);
        return;
      }

      setError("Nie udalo sie dokonczyc weryfikacji logowania.");
    } catch (clerkError) {
      setError(getClerkErrorMessage(clerkError, "Kod weryfikacyjny jest niepoprawny."));
    } finally {
      setIsPending(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");

    if (!isLoaded || !signIn) {
      return;
    }

    setIsPending(true);

    try {
      await signIn.authenticateWithRedirect({
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
      {registrationSuccess ? (
        <div className="rounded-lg border border-primary/20 bg-primary-fixed px-4 py-3 font-body-md text-body-md text-on-primary-fixed">
          Konto zostalo utworzone. Mozesz sie teraz zalogowac.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-error bg-error-container px-4 py-3 font-body-md text-body-md text-on-error-container">
          {error}
        </div>
      ) : null}

      {needsVerification ? (
        <form className="flex flex-col gap-5" onSubmit={handleVerify}>
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="code">
              Kod weryfikacyjny
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                password
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
              "Potwierdz kod"
            )}
          </button>
        </form>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                Haslo
              </label>
              <a
                className="font-label-sm text-label-sm text-primary transition-colors hover:underline"
                href="/reset-hasla"
              >
                Zapomniales hasla?
              </a>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                lock
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
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

          <div className="flex flex-col gap-4 pt-2">
            <button
              className="flex h-14 items-center justify-center gap-2 rounded-lg bg-primary-container font-label-md text-label-md font-bold text-on-primary shadow-soft transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <>
                  <Spinner />
                  Logowanie...
                </>
              ) : (
                "Zaloguj sie"
              )}
            </button>
            <button
              className="flex h-14 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-transparent font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-low"
              disabled={isPending}
              onClick={() => {
                void handleGoogleSignIn();
              }}
              type="button"
            >
              <GoogleIcon />
              Kontynuuj z Google
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
