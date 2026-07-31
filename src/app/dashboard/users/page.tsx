import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { Avatar } from "@/components/Avatar";
import { InviteUserForm } from "@/components/InviteUserForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import {
  deactivateUserAction,
  reactivateUserAction,
  deleteUserAction,
  resendInviteAction,
  setRoleAction,
} from "@/app/dashboard/users/actions";

export default async function UsersPage() {
  const me = await requireSuperAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { profile: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-icao-navy">Users</h1>
        <p className="text-sm text-muted">{users.length} account(s). Manage profiles and access.</p>
      </div>

      <InviteUserForm />

      <div className="space-y-3">
        {users.map((u) => {
          const pending = !u.passwordHash;
          const isSelf = u.id === me.id;
          const publicUrl = u.profile ? `${env.appUrl}/p/${u.profile.slug}` : null;
          return (
            <div key={u.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={u.profile?.name || u.email} photoUrl={u.profile?.photoUrl} size={48} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-ink">
                      {u.profile?.name || "—"}
                    </span>
                    {u.role === "SUPER_ADMIN" && (
                      <span className="rounded bg-icao-navy px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                        Super
                      </span>
                    )}
                    {u.status === "DEACTIVATED" && (
                      <span className="rounded bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-danger">
                        Deactivated
                      </span>
                    )}
                    {pending && u.status === "ACTIVE" && (
                      <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-warning">
                        Invite pending
                      </span>
                    )}
                  </div>
                  <div className="truncate text-sm text-muted">{u.email}</div>
                  {publicUrl && (
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-icao-blue hover:underline"
                    >
                      View public page ↗
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/dashboard/users/${u.id}`} className="btn-ghost">
                  Edit profile
                </Link>

                {pending && u.status === "ACTIVE" && (
                  <form action={resendInviteAction}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button type="submit" className="btn-ghost">
                      Resend invite
                    </button>
                  </form>
                )}

                {!isSelf && (
                  <form action={setRoleAction}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input
                      type="hidden"
                      name="role"
                      value={u.role === "SUPER_ADMIN" ? "ADMIN" : "SUPER_ADMIN"}
                    />
                    <button type="submit" className="btn-ghost">
                      {u.role === "SUPER_ADMIN" ? "Make admin" : "Make super"}
                    </button>
                  </form>
                )}

                {u.status === "ACTIVE" ? (
                  !isSelf && (
                    <form action={deactivateUserAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <ConfirmButton
                        message={`Deactivate ${u.email}? Their public page will be hidden.`}
                        className="btn-ghost text-warning"
                      >
                        Deactivate
                      </ConfirmButton>
                    </form>
                  )
                ) : (
                  <form action={reactivateUserAction}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button type="submit" className="btn-ghost text-success">
                      Reactivate
                    </button>
                  </form>
                )}

                {!isSelf && (
                  <form action={deleteUserAction}>
                    <input type="hidden" name="userId" value={u.id} />
                    <ConfirmButton
                      message={`Permanently delete ${u.email} and their profile? This cannot be undone.`}
                      className="btn-danger"
                    >
                      Delete
                    </ConfirmButton>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
