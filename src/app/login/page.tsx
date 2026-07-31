import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth/rbac";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell title="Sign in" subtitle="Access your ICAO digital identity dashboard.">
      <LoginForm next={searchParams.next} />
    </AuthShell>
  );
}
