import { Logo } from "@/components/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Modern, restrained brand backdrop — no aviation clichés */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-icao-navy via-[#013a72] to-icao-blue" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-icao-cyan/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-icao-blue/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="rounded-xl bg-white px-4 py-3 shadow-pop">
              <Logo />
            </div>
          </div>
          <div className="card p-7">
            <h1 className="text-xl font-bold text-icao-navy">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          <p className="mt-6 text-center text-xs text-white/70">
            © {new Date().getFullYear()} International Civil Aviation Organization
          </p>
        </div>
      </div>
    </main>
  );
}
