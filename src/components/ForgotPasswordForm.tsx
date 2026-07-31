"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { forgotPasswordAction } from "@/app/forgot-password/actions";
import { emptyFormState } from "@/lib/form";
import { SubmitButton } from "@/components/SubmitButton";

export function ForgotPasswordForm() {
  const [state, action] = useFormState(forgotPasswordAction, emptyFormState);

  if (state.ok) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
          {state.message}
        </div>
        <Link href="/login" className="btn-ghost w-full">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        {state.fieldErrors?.email && <p className="field-error">{state.fieldErrors.email}</p>}
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Sending…">
        Send reset link
      </SubmitButton>
      <div className="text-center">
        <Link href="/login" className="text-sm font-medium text-icao-blue hover:underline">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
