"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { loginAction } from "@/app/login/actions";
import { emptyFormState } from "@/lib/form";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState(loginAction, emptyFormState);

  return (
    <form action={action} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.error && (
        <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
        {state.fieldErrors?.email && <p className="field-error">{state.fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
        {state.fieldErrors?.password && (
          <p className="field-error">{state.fieldErrors.password}</p>
        )}
      </div>

      <SubmitButton className="btn-primary w-full" pendingText="Signing in…">
        Sign in
      </SubmitButton>

      <div className="text-center">
        <Link href="/forgot-password" className="text-sm font-medium text-icao-blue hover:underline">
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}
