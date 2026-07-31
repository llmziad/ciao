import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";
import type { EmailService } from "./index";

/** Production transport — sends from ICAO's verified domain (D8, PRD §6.5). */
export class ResendEmail implements EmailService {
  private client = new Resend(env.resendApiKey);

  async sendInvite(to: string, name: string, link: string): Promise<void> {
    await this.send(
      to,
      "You're invited to ICAO Digital Identity",
      inviteHtml(name, link),
    );
  }

  async sendPasswordReset(to: string, link: string): Promise<void> {
    await this.send(to, "Reset your ICAO Digital Identity password", resetHtml(link));
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const { error } = await this.client.emails.send({
      from: env.emailFrom,
      to,
      subject,
      html,
    });
    if (error) throw new Error(`Resend failed: ${error.message}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(body: string): string {
  return `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#0F172A">
    <div style="background:#002B5C;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;font-weight:700">ICAO Digital Identity</div>
    <div style="border:1px solid #E2E8F0;border-top:none;padding:24px;border-radius:0 0 12px 12px">${body}</div>
  </div>`;
}

function button(link: string, label: string): string {
  return `<a href="${link}" style="display:inline-block;background:#0072BC;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">${label}</a>`;
}

function inviteHtml(name: string, link: string): string {
  return shell(
    `<p>Hello ${escapeHtml(name)},</p><p>You've been invited to create your ICAO digital profile. Set your password to get started:</p><p>${button(link, "Set your password")}</p><p style="color:#5B6B7F;font-size:13px">This link expires in 7 days.</p>`,
  );
}

function resetHtml(link: string): string {
  return shell(
    `<p>We received a request to reset your password.</p><p>${button(link, "Reset password")}</p><p style="color:#5B6B7F;font-size:13px">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
  );
}
