# 04 — Technical Architecture

_Status: Draft (proposed stack) · Last updated: 2026-07-31_

Proposed architecture for **ICAO Digital Identity v1** (single-tenant — D10). Stack is a
**recommendation**; the client may veto/substitute. Decisions referenced as **D1–D10** live
in [decisions-log.md](./decisions-log.md); requirements as `FR-*`/`NFR-*` in
[03-requirements-prd.md](./03-requirements-prd.md).

---

## 1. Recommended stack

| Layer | Choice | Why |
|-------|--------|-----|
| **App framework** | **Next.js (React, App Router, TypeScript)** | One codebase serves the dashboard, the public profile pages, and the API. SSR gives fast, shareable public pages. |
| **Language** | TypeScript | Type safety across UI + API. |
| **Database** | **PostgreSQL** | Reliable relational fit for the User/Profile model; portable (managed or self-hosted). |
| **ORM** | **Prisma** (or Drizzle) | Typed schema + migrations. |
| **Auth** | **Auth.js (credentials)** with **argon2** password hashing | Invite-only email/password + roles (D2); no third-party identity dependency. |
| **Object storage** | **Vercel Blob** for POC (S3-compatible; R2/MinIO later) — D11 | Stores profile photos off the DB; behind an interface so it's swappable for residency. |
| **Email** | **Resend** behind an `EmailService` interface (D8) | Invite/reset emails from ICAO's domain; swappable. |
| **QR generation** | `qrcode` / `qr-code-styling` + server-side compositing | Generate QR at error-correction **H** (FR-Q3) and overlay the centered ICAO logo. |
| **PDF/SVG export** | `pdf-lib` / native SVG | Badge/card-ready QR downloads (FR-Q4). |
| **Image crop** | `react-easy-crop` (client) | Circular crop UX (FR-E3), store normalized image. |
| **Styling** | Tailwind CSS + design tokens from doc 05 | Fast, consistent, matches the ICAO Modern palette. |

**Deployment flexibility (important — see §6):** the app is containerizable (Docker) so it
can run on **Vercel** *or* on **ICAO-controlled infrastructure** if data-residency/governance
requires it.

---

## 2. System overview

```
                        ┌─────────────────────────────┐
   Staff / Super admin  │   Next.js app (SSR + API)    │
   (dashboard, auth) ──▶│  - Dashboard UI              │──▶ PostgreSQL (Users, Profiles, Tokens)
                        │  - Public profile pages      │──▶ Object storage (photos)
   Public (scan) ──────▶│  - API routes (RBAC enforced)│──▶ Resend (invite/reset email)
                        │  - QR + vCard generation     │
                        └─────────────────────────────┘
```

- **Access control enforced server-side** on every API route (NFR-2): a staff user can only
  read/write their own profile; super-admin-only routes gated by role.
- Public profile pages are unauthenticated, read-only, and served by slug (D5).

---

## 3. Data model (finalized from PRD §4)

**users**
- `id` (uuid, pk), `email` (unique), `password_hash`, `role` (`admin` | `super_admin`),
  `status` (`active` | `deactivated`), `created_at`, `updated_at`, `last_login_at`.

**profiles** (1:1 with users — D1)
- `id` (uuid, pk), `user_id` (fk unique), `slug` (unique, random — D5),
  `name` (required), `title`, `phone`, `address`, `photo_url` (nullable — D6),
  `social_instagram`, `social_twitter`, `social_facebook`, `social_linkedin` (nullable),
  `created_at`, `updated_at`.

**auth_tokens**
- `id` (uuid, pk), `user_id` (fk), `token_hash`, `type` (`invite` | `reset`),
  `expires_at`, `used_at` (nullable).

_No scan-event table in v1 (D4)._

---

## 4. Key pipelines

### 4.1 QR generation (FR-Q)
1. On first profile save, generate a **short random slug** (D5) → public URL `/<domain>/p/<slug>`.
2. Render QR at **EC level H** encoding that URL.
3. Composite the **ICAO logo** (D9) centered, covering ≤ ~30% area.
4. **Verify the composited code still scans** before offering download (automated check).
5. Offer PNG / SVG / PDF (FR-Q4). QR/URL stay stable across content edits (FR-E8).

### 4.2 Photo pipeline (FR-E3/E4)
- Client circular-crop → upload → server validates type/size (default max 5 MB) →
  store in object storage → save `photo_url`. Absent photo → branded fallback (D6) at render.

### 4.3 vCard (FR-P6, PRD §6)
- Server builds a vCard 3.0 `.vcf` from profile fields on the public page's "Save to contacts".

### 4.4 Invite / reset (FR-A2/A4, §6.5)
- Super admin invites → create user + single-use expiring `auth_token` → Resend email from
  ICAO domain → user sets password (argon2) → token marked used.

---

## 5. Security (NFR-2)

- HTTPS everywhere; argon2 password hashing; single-use, expiring invite/reset tokens
  (hashed at rest); login rate-limiting (FR-A6).
- Server-side RBAC on all mutating/reading endpoints; never trust client role claims.
- Stored-XSS protection: sanitize/escape all profile fields on the public page (FR-E9).
- Random non-enumerable slugs (D5); deactivated/deleted profiles hidden (FR-P7).
- Admin action audit log (NFR-8).
- Secrets (DB, Resend key, storage creds) via environment/secret manager, never in repo.

---

## 6. Hosting & data residency — DECIDED (POC): Managed — D11

**POC uses managed hosting (D11):**
- **App:** Vercel (Next.js).
- **Database:** Neon (managed Postgres).
- **Photos:** Vercel Blob (S3-compatible object storage in the Vercel project).
- **Email:** Resend (D8).

Rationale: fastest path to a working proof-of-concept, minimal ops. Storage and email stay
behind interfaces so migrating to **ICAO-controlled infra** (Docker + self-hosted Postgres +
MinIO) later is low-friction — the app architecture does not change.

**⚠️ Before any production / real-PII rollout:** revisit ICAO's data-governance / residency
requirements (a UN agency may require specific regions or self-hosting). Confirm Vercel/Neon
region + DPA acceptability at that point. Not a blocker for the POC.

---

## 7. Third-party services summary

| Service | Purpose | Notes |
|---------|---------|-------|
| Resend | Invite/reset email | From ICAO domain; SPF/DKIM/DMARC (D8). |
| Vercel Blob (POC) | Profile photos | Behind a storage interface; swap for R2/MinIO for residency. |
| Neon (managed Postgres) | Primary data | Portable to self-hosted Postgres either way. |

---

## 8. Open items feeding execution

- ~~Hosting / data residency~~ — decided for POC: managed Vercel + Neon + Vercel Blob (D11).
  (Residency to be revisited before production/PII rollout — §6.)
- Public **domain/subdomain** (e.g. `id.icao.int`) + DNS access for email + app.
- **Official ICAO logo vector file** + brand hex values (design system A2).
- Final password policy + session duration (FR-A3/A5).

## 9. Suggested next step after plan sign-off
Scaffold the repo (Next.js + TS + Prisma + Tailwind on Vercel/Neon), define the schema, and
stub the `EmailService`, storage, and QR pipeline. The logo file + brand hex can slot in as
they arrive — placeholder assets and the proposed palette (doc 05) unblock a first build.
