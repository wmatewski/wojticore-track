"use client";

import { useActionState } from "react";

import { updateLinkDestinationAction } from "@/actions/links";
import { initialLinkActionState } from "@/lib/validation";

type LinkUpdateFormProps = {
  linkId: string;
  initialUrl: string;
};

export function LinkUpdateForm({ linkId, initialUrl }: LinkUpdateFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateLinkDestinationAction,
    initialLinkActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="linkId" value={linkId} />
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          className="h-12 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-secondary focus:border-primary focus:ring-1 focus:ring-primary"
          defaultValue={initialUrl}
          name="url"
          placeholder="Wprowadz nowy URL docelowy"
          required
          type="url"
        />
        <button
          className="h-12 rounded-lg border border-outline-variant bg-surface-container-high px-6 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-variant"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Zapisywanie..." : "Zapisz"}
        </button>
      </div>
      {state.message ? (
        <div
          className={`rounded-lg px-4 py-3 font-body-md text-body-md ${
            state.status === "error"
              ? "border border-error bg-error-container text-on-error-container"
              : "border border-primary/20 bg-primary-fixed text-on-primary-fixed"
          }`}
        >
          {state.message}
        </div>
      ) : null}
    </form>
  );
}
