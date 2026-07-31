import "server-only";
import { env } from "@/lib/env";
import { ConsoleEmail } from "./console";
import { ResendEmail } from "./resend";

/**
 * EmailService — provider-agnostic (D8). Resend in production; a console
 * transport locally (invite/reset links print to the dev server console),
 * so the full flow is testable without sending real mail.
 */
export interface EmailService {
  sendInvite(to: string, name: string, link: string): Promise<void>;
  sendPasswordReset(to: string, link: string): Promise<void>;
}

let instance: EmailService | null = null;

export function emailService(): EmailService {
  if (instance) return instance;
  instance = env.resendApiKey ? new ResendEmail() : new ConsoleEmail();
  return instance;
}
