"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { createLinkAction } from "@/actions/links";
import { QRCodeModal } from "@/components/qr-code-modal";
import { initialLinkActionState } from "@/lib/validation";

export function CreateLinkForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [state, formAction, isPending] = useActionState(createLinkAction, initialLinkActionState);

  useEffect(() => {
    if (state.status === "success" && state.shortUrl) {
      formRef.current?.reset();
      setShowQRModal(true);
    }
  }, [state.status, state.shortUrl]);

  return (
    <section
      id="create-link"
      className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-soft md:p-8"
    >
      <h3 className="font-headline-md text-headline-md text-on-surface">Utworz nowy link</h3>
      <form ref={formRef} action={formAction} className="relative flex flex-col gap-4 md:flex-row">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
            link
          </span>
          <input
            className="h-14 w-full rounded-lg border border-outline-variant bg-surface pl-12 pr-4 font-body-md text-body-md text-on-surface outline-none transition-colors placeholder:text-secondary focus:border-primary"
            name="url"
            placeholder="Wklej dlugi adres URL tutaj..."
            required
            type="url"
          />
        </div>
        <button
          className="flex h-14 items-center justify-center gap-2 rounded-lg bg-primary-container px-8 font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Zapisywanie..." : "Skroc"}
          <span className="material-symbols-outlined">auto_awesome</span>
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          className="flex items-center gap-1 rounded-full border border-outline-variant bg-surface px-3 py-1.5 font-label-sm text-label-sm text-secondary transition-colors hover:bg-surface-container-low"
          type="button"
          disabled
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          Opcje zaawansowane wkrotce
        </button>
      </div>

      {state.message && state.status === "error" ? (
        <div className="rounded-lg border border-error bg-error-container px-4 py-3 font-body-md text-body-md text-on-error-container">
          {state.message}
        </div>
      ) : null}

      <QRCodeModal
        title="Link zostal utworzony!"
        url={state.shortUrl || ""}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </section>
  );
}
