"use client";

import { useSignIn } from "@clerk/nextjs";
import { FormEvent, useState } from "react";

const CLERK_ERROR_TRANSLATIONS: Record<string, string> = {
  form_identifier_not_found: "Nie znaleziono konta z podanym adresem email.",
  form_code_incorrect: "Podany kod jest niepoprawny.",
  form_password_pwned: "To haslo jest zbyt powszechne. Wybierz inne haslo.",
  form_password_length_too_short: "Haslo musi miec co najmniej 8 znakow.",
  form_param_format_invalid: "Podany adres email jest niepoprawny.",
  too_many_requests: "Zbyt wiele prob. Poczekaj chwile i sprobuj ponownie.",
  user_locked: "Konto zostalo tymczasowo zablokowane. Sprobuj pozniej.",
  verification_failed: "Weryfikacja nie powiodla sie. Sprawdz kod.",
  verification_expired: "Kod wygasl. Sprobuj ponownie.",
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

type Stage = "email" | "code";

export function ResetPasswordForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [stage, setStage] = useState<Stage>("email");
  const [successEmail, setSuccessEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isLoaded || !signIn) {
      setError("Serwis jest jeszcze inicjalizowany. Sprobuj ponownie za chwile.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string | null)?.trim() ?? "";

    if (!email) {
      setError("Podaj adres email.");
      return;
    }

    setIsPending(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setSuccessEmail(email);
      setStage("code");
    } catch (clerkError) {
      setError(
        getClerkErrorMessage(
          clerkError,
          "Nie udalo sie wyslac kodu resetowania. Sprawdz adres email.",
        ),
      );
    } finally {
      setIsPending(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!signIn) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const code = (formData.get("code") as string | null)?.trim() ?? "";
    const password = (formData.get("password") as string | null) ?? "";
    const confirmPassword = (formData.get("confirmPassword") as string | null) ?? "";

    if (!code) {
      setError("Wpisz kod z wiadomosci email.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Haslo musi miec co najmniej 8 znakow.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasla nie sa identyczne.");
      return;
    }

    setIsPending(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete" && setActive) {
        await setActive({
          session: result.createdSessionId,
          redirectUrl: "/dashboard",
        });

        return;
      }

      setError("Nie udalo sie zresetowac hasla. Sprobuj ponownie.");
    } catch (clerkError) {
      setError(
        getClerkErrorMessage(clerkError, "Nie udalo sie zresetowac hasla. Sprawdz kod i sprobuj ponownie."),
      );
    } finally {
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

      {stage === "email" ? (
        <form className="flex flex-col gap-5" onSubmit={handleSendCode}>
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
              Adres email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                mail
              </span>
              <input
                autoComplete="email"
                className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-12 pr-4 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary-container"
                id="email"
                name="email"
                placeholder="jan@kowalski.pl"
                required
                type="email"
              />
            </div>
          </div>

          <button
            className="flex h-14 items-center justify-center gap-2 rounded-lg bg-primary-container font-label-md text-label-md font-bold text-on-primary shadow-soft transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <>
                <Spinner />
                Wysylanie...
              </>
            ) : (
              "Wyslij kod resetowania"
            )}
          </button>
        </form>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleResetPassword}>
          <div className="rounded-lg border border-primary/20 bg-primary-fixed px-4 py-3 font-body-md text-body-md text-on-primary-fixed">
            Wysłaliśmy kod na adres <strong>{successEmail}</strong>. Sprawdz skrzynke odbiorczą i wpisz kod poniżej.
          </div>

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

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
              Nowe haslo
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                lock
              </span>
              <input
                autoComplete="new-password"
                className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-12 pr-12 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary-container"
                id="password"
                name="password"
                placeholder="Minimum 8 znakow"
                required
                type={showPassword ? "text" : "password"}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
                onClick={() => {
                  setShowPassword((value) => !value);
                }}
                type="button"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">
              Powtorz nowe haslo
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                verified_user
              </span>
              <input
                autoComplete="new-password"
                className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-12 pr-4 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-secondary focus:border-transparent focus:ring-2 focus:ring-primary-container"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Powtorz nowe haslo"
                required
                type={showPassword ? "text" : "password"}
              />
            </div>
          </div>

          <button
            className="flex h-14 items-center justify-center gap-2 rounded-lg bg-primary-container font-label-md text-label-md font-bold text-on-primary shadow-soft transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <>
                <Spinner />
                Resetowanie...
              </>
            ) : (
              "Ustaw nowe haslo"
            )}
          </button>

          <button
            className="font-label-sm text-label-sm text-secondary underline transition-colors hover:text-primary"
            onClick={() => {
              setStage("email");
              setError("");
            }}
            type="button"
          >
            Wyslij kod ponownie
          </button>
        </form>
      )}
    </div>
  );
}
