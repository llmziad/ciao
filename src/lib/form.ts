export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
  message?: string;
  /** Dev-only: invite/reset link surfaced when the console email transport is used. */
  devLink?: string;
};

export const emptyFormState: FormState = {};

import type { ZodError } from "zod";
export function zodToFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
