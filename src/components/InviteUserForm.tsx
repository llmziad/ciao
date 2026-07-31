"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { inviteUserAction } from "@/app/dashboard/users/actions";
import { emptyFormState } from "@/lib/form";
import { SubmitButton } from "@/components/SubmitButton";

export function InviteUserForm() {
  const [state, action] = useFormState(inviteUserAction, emptyFormState);
  const [copied, setCopied] = useState(false);

  return (
    <form action={action} className="card p-6">
      <h2 className="text-base font-bold text-icao-navy">Invite a user</h2>
      <p className="mt-1 text-sm text-muted">
        They&apos;ll receive an email link to set a password and activate their account.
      </p>

      {state.ok && state.message && (
        <div className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
          {state.message}
        </div>
      )}

      {state.link && (
        <div className="mt-3 rounded-lg border border-icao-blue/30 bg-icao-blue/5 p-3">
          <p className="text-xs font-semibold text-icao-navy">
            Invite link — send this to the new user so they can set a password:
          </p>
          <div className="mt-2 flex gap-2">
            <input readOnly value={state.link} className="input font-mono text-[11px]" />
            <button
              type="button"
              className="btn-ghost shrink-0"
              onClick={async () => {
                await navigator.clipboard.writeText(state.link!);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-muted">The link expires in 7 days.</p>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inv-name" className="label">
            Name <span className="text-danger">*</span>
          </label>
          <input id="inv-name" name="name" required className="input" placeholder="Jane Doe" />
          {state.fieldErrors?.name && <p className="field-error">{state.fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="inv-email" className="label">
            Email <span className="text-danger">*</span>
          </label>
          <input id="inv-email" name="email" type="email" required className="input" placeholder="jane@icao.int" />
          {state.fieldErrors?.email && <p className="field-error">{state.fieldErrors.email}</p>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <label htmlFor="inv-role" className="label">
            Role
          </label>
          <select id="inv-role" name="role" defaultValue="ADMIN" className="input w-auto">
            <option value="ADMIN">Admin (own profile)</option>
            <option value="SUPER_ADMIN">Super admin (all profiles)</option>
          </select>
        </div>
        <SubmitButton className="btn-primary" pendingText="Inviting…">
          Send invitation
        </SubmitButton>
      </div>
    </form>
  );
}
