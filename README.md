# ICAO Digital Identity

QR-based digital identity platform for ICAO staff. Each user manages one profile;
saving it generates an ICAO-branded QR code that opens a read-only public profile page
with a "Save to contacts" (vCard) action.

Planning docs live in [`/docs`](./docs) (start with `docs/README.md`). This file covers
running the app locally.

## Stack
Next.js 14 (App Router, TypeScript) · Prisma + PostgreSQL (Neon) · custom auth
(bcryptjs + jose sessions) · sharp + pdf-lib (QR) · Resend email · Vercel Blob / local
storage. See `docs/04-technical-architecture.md`.

## Prerequisites
- Node 18+ (built on Node 22)
- The Neon Postgres connection string (already in `.env.local` for this POC)

## Run locally

```bash
npm install
npm run db:push     # sync schema to the database (already done for the POC)
npm run db:seed     # create the super-admin account (already done for the POC)
npm run dev         # http://localhost:3000
```

### Test account (from the seed)
- **URL:** http://localhost:3000/login
- **Email:** `admin@icao.local`
- **Password:** `ChangeMe!2026`

(Change these via `SEED_SUPERADMIN_*` in `.env.local`, then re-run `npm run db:seed`.)

## What to try
1. **Sign in** with the test account (super admin).
2. **Edit your profile** — add a photo (drag/zoom to crop the circle), name, title,
   phone, address, and social links. Save.
3. **QR panel** (right side) — copy your public link, download the QR as **PNG / SVG / PDF**,
   and open your public page.
4. **Public page** — visit the public link (or scan the QR). Try **Save to contacts**.
5. **Users** (super-admin only, top nav) — **invite a user**. Emails are disabled in V1, so
   the **invite link** is shown with a Copy button; share it manually. Open it to set a
   password and activate the account. For existing users you can generate a **reset link**
   the same way.
6. As the super admin, **Edit profile** of any user, deactivate/reactivate, change roles,
   or delete — note the guards (can't remove the last super admin, can't delete yourself).
7. **Deactivate** a user and confirm their public page shows "profile unavailable".

## Email & storage
- **Email:** disabled in V1 — no provider needed. Invite/reset links are generated in the
  dashboard (super admin) and shared manually. See decision D12.
- **Storage:** profile photos are processed to a 512px WebP and stored in Postgres
  (`Profile.photoData`), served via `/api/photo/[slug]`. No object storage needed; works
  the same locally and on Vercel. HEIC is converted to JPEG in the browser before cropping.
  See decision D13.

## Scripts
| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm run typecheck` | TypeScript check, no emit |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Prisma schema to the DB |
| `npm run db:seed` | Seed / reset the super admin |
| `npm run db:studio` | Prisma Studio (inspect data) |

## Security notes (POC)
- `.env`, `.env.local` are gitignored — **never commit secrets**.
- The Neon password was shared in plaintext during setup; **rotate it** before production.
- Pre-production hardening tracked in `docs/04-technical-architecture.md` (argon2,
  data-residency, distributed rate-limiting, official ICAO brand assets).
