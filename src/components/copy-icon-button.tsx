"use client";

import { useEffect, useState } from "react";

type CopyIconButtonProps = {
  value: string;
  className?: string;
  title?: string;
};

export function CopyIconButton({
  value,
  className = "",
  title = "Kopiuj",
}: CopyIconButtonProps) {
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
      title={copied ? "Skopiowano" : title}
      aria-label={copied ? "Skopiowano" : title}
      onClick={handleCopy}
      className={`inline-flex items-center justify-center rounded-md p-2 text-secondary transition-colors hover:bg-surface-container hover:text-primary ${className}`}
    >
      <span className="material-symbols-outlined text-[16px]">
        {copied ? "check" : "content_copy"}
      </span>
    </button>
  );
}
