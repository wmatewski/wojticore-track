"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

type SignOutButtonProps = {
  className?: string;
  label?: string;
  pendingLabel?: string;
};

export function SignOutButton({
  className = "",
  label = "Wyloguj",
  pendingLabel = "Wylogowywanie...",
}: SignOutButtonProps) {
  const { signOut } = useClerk();
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        setIsPending(true);
        await signOut({ redirectUrl: "/" });
      }}
      className={`inline-flex items-center justify-center rounded-full border border-black/10 bg-white/75 px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] ${className}`}
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}