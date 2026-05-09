"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

type QRCodeModalProps = {
  title: string;
  url: string;
  isOpen: boolean;
  onClose: () => void;
};

export function QRCodeModal({ title, url, isOpen, onClose }: QRCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  async function handleDownloadQR() {
    if (!qrRef.current) {
      return;
    }

    const canvas = qrRef.current.querySelector("canvas");

    if (!canvas) {
      return;
    }

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");

    link.href = url;
    link.download = `qr-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: "Sprawdz ten skrocony link",
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback to copy
      await handleCopyUrl();
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-on-surface/20 p-margin-mobile backdrop-blur-sm md:p-margin-desktop">
      <div className="relative my-auto flex w-full max-w-[500px] flex-col rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between rounded-t-xl border-b border-outline-variant bg-surface-container-lowest px-gutter py-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
          <button
            aria-label="Zamknij"
            className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-6 p-gutter">
          <div className="flex justify-center">
            <div
              ref={qrRef}
              className="rounded-lg border border-outline-variant p-4 bg-white"
            >
              <QRCodeCanvas
                level="H"
                size={256}
                value={url}
                includeMargin
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-center font-body-md text-body-md text-secondary">
              Skrocony adres
            </p>
            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
              <p className="break-all font-mono text-label-sm text-on-surface">
                {url}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-container font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary"
              onClick={handleCopyUrl}
              type="button"
            >
              <span className="material-symbols-outlined">content_copy</span>
              Kopiuj link
            </button>
            <button
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-transparent font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container"
              onClick={handleShare}
              type="button"
            >
              <span className="material-symbols-outlined">share</span>
              Udostepnij
            </button>
            <button
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-transparent font-label-md text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container"
              onClick={handleDownloadQR}
              type="button"
            >
              <span className="material-symbols-outlined">download</span>
              Pobierz QR
            </button>
          </div>
        </div>

        <div className="flex justify-end rounded-b-xl border-t border-outline-variant bg-surface-container-lowest px-gutter py-4">
          <button
            className="rounded border border-outline-variant px-6 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={onClose}
            type="button"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
