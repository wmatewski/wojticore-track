"use client";

import { useEffect, useState } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

export function CopyButton({
  value,
  label = "Kopiuj",
  copiedLabel = "Skopiowano",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 1600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-low ${className}`}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
