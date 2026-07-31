import { AuthShell } from "@/components/AuthShell";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset password" subtitle="We'll email you a secure link to reset it.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
