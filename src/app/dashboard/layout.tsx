import Link from "next/link";
import { requireUser } from "@/lib/auth/rbac";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/app/dashboard/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const isSuper = user.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" aria-label="Dashboard home">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {isSuper ? (
                <Link
                  href="/dashboard/users"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-bg"
                >
                  Users
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-bg"
                >
                  My profile
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-ink">{user.email}</div>
              <div className="text-[11px] uppercase tracking-wide text-muted">
                {isSuper ? "Super admin" : "Admin"}
              </div>
            </div>
            <form action={logoutAction}>
              <button className="btn-ghost" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
