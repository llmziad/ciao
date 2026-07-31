"use client";

import { useFormState } from "react-dom";
import { setPasswordAction } from "@/app/set-password/actions";
import { emptyFormState } from "@/lib/form";
import { SubmitButton } from "@/components/SubmitButton";

export function SetPasswordForm({
  token,
  mode,
}: {
  token: string;
  mode: "invite" | "reset";
}) {
  const [state, action] = useFormState(setPasswordAction, emptyFormState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="mode" value={mode} />

      {state.error && (
        <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="label">
          {mode === "invite" ? "Create a password" : "New password"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="input"
        />
        {state.fieldErrors?.password && (
          <p className="field-error">{state.fieldErrors.password}</p>
        )}
        <p className="hint mt-1">At least 10 characters, with a letter and a number.</p>
      </div>

      <div>
        <label htmlFor="confirm" className="label">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className="input"
        />
        {state.fieldErrors?.confirm && <p className="field-error">{state.fieldErrors.confirm}</p>}
      </div>

      <SubmitButton className="btn-primary w-full" pendingText="Saving…">
        {mode === "invite" ? "Set password & continue" : "Update password"}
      </SubmitButton>
    </form>
  );
}
