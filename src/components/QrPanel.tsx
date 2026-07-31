"use client";

import { useState } from "react";

export function QrPanel({ slug, publicUrl }: { slug: string; publicUrl: string }) {
  const [copied, setCopied] = useState(false);
  const qrSrc = `/api/qr/${slug}?format=svg`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-base font-bold text-icao-navy">Your QR code</h2>
      <p className="mt-1 text-sm text-muted">
        Scanning opens your public profile. The code stays the same even when you edit your details.
      </p>

      <div className="mt-4 flex justify-center rounded-xl border border-line bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrSrc} alt="Your ICAO QR code" width={220} height={220} className="h-56 w-56" />
      </div>

      <div className="mt-4">
        <label className="label">Public link</label>
        <div className="flex gap-2">
          <input readOnly value={publicUrl} className="input font-mono text-xs" />
          <button type="button" className="btn-ghost shrink-0" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <a className="btn-navy" href={`/api/qr/${slug}?format=png&download=1`}>
          PNG
        </a>
        <a className="btn-navy" href={`/api/qr/${slug}?format=svg&download=1`}>
          SVG
        </a>
        <a className="btn-navy" href={`/api/qr/${slug}?format=pdf&download=1`}>
          PDF
        </a>
      </div>

      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost mt-2 w-full"
      >
        View public page ↗
      </a>
    </div>
  );
}
