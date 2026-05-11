"use client";

import { useAuth, useClerk, useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

type SupportedMissingField = "first_name" | "last_name" | "username";
type SupportedUpdateField = "firstName" | "lastName" | "username";
type OAuthSignUpSnapshot = {
  missingFields: string[];
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  emailAddress: string | null;
};

const supportedMissingFieldConfig: Record<
  SupportedMissingField,
  {
    autoComplete: string;
    label: string;
    name: SupportedUpdateField;
    placeholder: string;
  }
> = {
  first_name: {
    autoComplete: "given-name",
    label: "Imie",
    name: "firstName",
    placeholder: "Jan",
  },
  last_name: {
    autoComplete: "family-name",
    label: "Nazwisko",
    name: "lastName",
    placeholder: "Kowalski",
  },
  username: {
    autoComplete: "username",
    label: "Nazwa uzytkownika",
    name: "username",
    placeholder: "jan.kowalski",
  },
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

function isSupportedMissingField(field: string): field is SupportedMissingField {
  return Object.prototype.hasOwnProperty.call(supportedMissingFieldConfig, field);
}

function normalizeNameToken(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  return trimmedValue[0].toUpperCase() + trimmedValue.slice(1).toLowerCase();
}

function getEmailLocalPart(emailAddress: string | null) {
  return emailAddress?.split("@")[0] ?? "";
}

function getEmailNameParts(emailAddress: string | null) {
  return getEmailLocalPart(emailAddress)
    .split(/[^a-zA-Z0-9]+/)
    .map(normalizeNameToken)
    .filter(Boolean);
}

function sanitizeUsername(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 32);
}

function buildSuggestedFieldValues(signUp: OAuthSignUpSnapshot) {
  const emailNameParts = getEmailNameParts(signUp.emailAddress);
  const firstName = signUp.firstName?.trim() || emailNameParts[0] || "Uzytkownik";
  const lastName = signUp.lastName?.trim() || emailNameParts[1] || "Uzytkownik";
  const usernameSeed =
    signUp.username?.trim() || getEmailLocalPart(signUp.emailAddress) || `${firstName}.${lastName}`;

  return {
    firstName,
    lastName,
    username: sanitizeUsername(usernameSeed) || "uzytkownik",
  };
}

function buildAutoCompleteValues(signUp: OAuthSignUpSnapshot) {
  const suggestedValues = buildSuggestedFieldValues(signUp);
  const missingFields = new Set(signUp.missingFields);
  const values: Partial<Record<SupportedUpdateField, string>> = {};

  if (missingFields.has("first_name")) {
    values.firstName = suggestedValues.firstName;
  }

  if (missingFields.has("last_name")) {
    values.lastName = suggestedValues.lastName;
  }

  if (missingFields.has("username")) {
    values.username = suggestedValues.username;
  }

  return values;
}

function getMissingFieldsKey(missingFields: string[]) {
  return [...missingFields].sort().join("|");
}

function getMissingFieldLabel(field: string) {
  if (isSupportedMissingField(field)) {
    return supportedMissingFieldConfig[field].label.toLowerCase();
  }

  return field.replace(/_/g, " ");
}

function buildUnsupportedFieldsMessage(fields: string[]) {
  const labels = fields.map(getMissingFieldLabel).join(", ");

  return `Nie udalo sie automatycznie dokonczyc tworzenia konta. Brakuje jeszcze: ${labels}.`;
}

export default function OAuthCallbackPage() {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const redirectHandledRef = useRef(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isResolving, setIsResolving] = useState(true);
  const [autoFillAttemptedFor, setAutoFillAttemptedFor] = useState<string | null>(null);

  const missingFields = isLoaded && signUp?.status === "missing_requirements" ? signUp.missingFields : [];
  const missingFieldsKey = getMissingFieldsKey(missingFields);
  const supportedMissingFields = missingFields.filter(isSupportedMissingField);
  const unsupportedMissingFields = missingFields.filter((field) => !isSupportedMissingField(field));
  const suggestedFieldValues = signUp ? buildSuggestedFieldValues(signUp) : null;
  const canAutoComplete = signUp ? Object.keys(buildAutoCompleteValues(signUp)).length > 0 : false;
  const shouldAttemptAutoFill =
    !isResolving &&
    !!signUp &&
    signUp.status === "missing_requirements" &&
    missingFields.length > 0 &&
    canAutoComplete &&
    autoFillAttemptedFor !== missingFieldsKey;
  const requiresManualInput =
    !isResolving &&
    !isPending &&
    !!signUp &&
    signUp.status === "missing_requirements" &&
    supportedMissingFields.length > 0 &&
    unsupportedMissingFields.length === 0 &&
    !shouldAttemptAutoFill;

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    if (redirectHandledRef.current) {
      return;
    }

    redirectHandledRef.current = true;

    let isMounted = true;

    async function resolveRedirect() {
      try {
        await clerk.handleRedirectCallback({
          signInUrl: "/login",
          signUpUrl: "/register",
          firstFactorUrl: "/login",
          secondFactorUrl: "/login",
          continueSignUpUrl: "/oauth-callback",
          signInForceRedirectUrl: "/dashboard",
          signUpForceRedirectUrl: "/dashboard",
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

  useEffect(() => {
    if (!signUp || signUp.status !== "missing_requirements" || !shouldAttemptAutoFill) {
      return;
    }

    const currentSignUp = signUp;

    let isMounted = true;

    async function finalizeMissingFields() {
      const autoCompleteValues = buildAutoCompleteValues(currentSignUp);

      setAutoFillAttemptedFor(missingFieldsKey);
      setIsPending(true);
      setError("");

      try {
        const result = await currentSignUp.update(autoCompleteValues);

        if (result.status === "complete" && result.createdSessionId && setActive) {
          await setActive({
            session: result.createdSessionId,
            redirectUrl: "/dashboard",
          });
          return;
        }

        if (
          isMounted &&
          result.status === "missing_requirements" &&
          result.missingFields.some((field) => !isSupportedMissingField(field))
        ) {
          setError(
            buildUnsupportedFieldsMessage(
              result.missingFields.filter((field) => !isSupportedMissingField(field)),
            ),
          );
        }
      } catch (autoFillError) {
        if (isMounted) {
          setError(
            getClerkErrorMessage(
              autoFillError,
              "Nie udalo sie automatycznie dokonczyc logowania przez Google.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsPending(false);
        }
      }
    }

    void finalizeMissingFields();

    return () => {
      isMounted = false;
    };
  }, [missingFieldsKey, setActive, shouldAttemptAutoFill, signUp]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!signUp || signUp.status !== "missing_requirements") {
      return;
    }

    setIsPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const updateValues: Partial<Record<SupportedUpdateField, string>> = {};

    for (const field of supportedMissingFields) {
      const fieldConfig = supportedMissingFieldConfig[field];
      const rawValue = String(formData.get(fieldConfig.name) ?? "").trim();

      if (!rawValue) {
        setError(`Uzupelnij pole: ${fieldConfig.label.toLowerCase()}.`);
        setIsPending(false);
        return;
      }

      if (field === "username") {
        const username = sanitizeUsername(rawValue);

        if (!username) {
          setError("Podaj poprawna nazwe uzytkownika.");
          setIsPending(false);
          return;
        }

        updateValues.username = username;
        continue;
      }

      updateValues[fieldConfig.name] = rawValue;
    }

    try {
      const result = await signUp.update(updateValues);

      if (result.status === "complete" && result.createdSessionId && setActive) {
        await setActive({
          session: result.createdSessionId,
          redirectUrl: "/dashboard",
        });
        return;
      }

      if (result.status === "missing_requirements") {
        const remainingUnsupportedFields = result.missingFields.filter(
          (field) => !isSupportedMissingField(field),
        );

        setError(
          remainingUnsupportedFields.length > 0
            ? buildUnsupportedFieldsMessage(remainingUnsupportedFields)
            : "Uzupelnij brakujace dane konta i sprobuj ponownie.",
        );
        return;
      }

      setError("Nie udalo sie dokonczyc logowania przez Google.");
    } catch (submitError) {
      setError(
        getClerkErrorMessage(submitError, "Nie udalo sie zapisac brakujacych danych konta."),
      );
    } finally {
      setIsPending(false);
    }
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
            Finalizujemy odpowiedz Google i upewniamy sie, ze konto ma komplet danych wymaganych do wejscia do dashboardu.
          </p>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--foreground)]">
            {error}
          </div>
        ) : null}

        {isResolving || isPending || shouldAttemptAutoFill ? (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-[var(--background)] px-4 py-6 text-sm leading-7 text-[var(--muted)]">
            {isResolving
              ? "Finalizujemy odpowiedz Google i odczytujemy stan konta z Clerk."
              : "Uzupelniamy brakujace dane konta i aktywujemy sesje."}
          </div>
        ) : requiresManualInput ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {supportedMissingFields.map((field) => {
              const fieldConfig = supportedMissingFieldConfig[field];

              return (
                <div className="space-y-2" key={field}>
                  <label
                    className="block text-sm font-medium text-[var(--foreground)]"
                    htmlFor={fieldConfig.name}
                  >
                    {fieldConfig.label}
                  </label>
                  <input
                    id={fieldConfig.name}
                    name={fieldConfig.name}
                    type="text"
                    autoComplete={fieldConfig.autoComplete}
                    defaultValue={suggestedFieldValues?.[fieldConfig.name] ?? ""}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/12"
                    placeholder={fieldConfig.placeholder}
                    required
                  />
                </div>
              );
            })}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Konczymy logowanie..." : "Zapisz i przejdz dalej"}
            </button>
          </form>
        ) : unsupportedMissingFields.length > 0 ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm leading-7 text-[var(--muted)]">
              {buildUnsupportedFieldsMessage(unsupportedMissingFields)}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]"
            >
              Wroc do logowania
            </Link>
          </div>
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