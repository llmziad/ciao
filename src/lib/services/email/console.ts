import "server-only";
import type { EmailService } from "./index";

/** Dev transport: logs the actionable link so flows are testable without email. */
export class ConsoleEmail implements EmailService {
  async sendInvite(to: string, name: string, link: string): Promise<void> {
    banner("INVITE", `To: ${to} (${name})`, link);
  }
  async sendPasswordReset(to: string, link: string): Promise<void> {
    banner("PASSWORD RESET", `To: ${to}`, link);
  }
}

function banner(kind: string, who: string, link: string) {
  // eslint-disable-next-line no-console
  console.log(
    `\n────────────────────────────────────────────────────────\n` +
      `📧  [DEV EMAIL · ${kind}]\n` +
      `    ${who}\n` +
      `    Link: ${link}\n` +
      `────────────────────────────────────────────────────────\n`,
  );
}
