"use client";

import { useState } from "react";
import { generateAuthLinkAction } from "@/app/dashboard/users/actions";

/**
 * Super-admin action: generate a fresh invite or reset link for a user and
 * reveal it inline with a copy button. Emails are disabled in V1.
 */
export function AuthLinkButton({
  userId,
  kind,
  label,
}: {
  userId: string;
  kind: "invite" | "reset";
  label: string;
}) {
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setBusy(true);
    setError(null);
    const res = await generateAuthLinkAction(userId, kind);
    setBusy(false);
    if (res.ok && res.link) setLink(res.link);
    else setError(res.error || "Could not generate link.");
  };

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (link) {
    return (
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="input w-56 font-mono text-[11px]"
        />
        <button type="button" className="btn-ghost shrink-0" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    );
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button type="button" className="btn-ghost" onClick={generate} disabled={busy}>
        {busy ? "Generating…" : label}
      </button>
      {error && <span className="field-error">{error}</span>}
    </span>
  );
}
