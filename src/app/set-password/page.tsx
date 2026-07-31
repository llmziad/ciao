import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { SetPasswordForm } from "@/components/SetPasswordForm";
import { peekToken } from "@/lib/auth/tokens";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string; mode?: string };
}) {
  const mode = searchParams.mode === "invite" ? "invite" : "reset";
  const token = searchParams.token ?? "";
  const valid = token ? await peekToken(token, mode === "invite" ? "INVITE" : "RESET") : null;

  const title = mode === "invite" ? "Welcome to ICAO Digital Identity" : "Choose a new password";

  if (!valid) {
    return (
      <AuthShell title="Link expired" subtitle="This link is invalid or has already been used.">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Password links are single-use and time-limited. Ask your administrator to
            generate a new one for you.
          </p>
          <Link href="/login" className="btn-ghost w-full">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={title}
      subtitle={mode === "invite" ? "Set a password to activate your account." : undefined}
    >
      <SetPasswordForm token={token} mode={mode} />
    </AuthShell>
  );
}
