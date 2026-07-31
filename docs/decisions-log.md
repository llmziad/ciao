# Decisions Log

Chronological record of locked decisions. Each entry: what was decided, why, and when.
Do not silently reverse a decision — add a new dated entry that supersedes the old one.

| ID | Date | Decision | Rationale | Status |
|----|------|----------|-----------|--------|
| D1 | 2026-07-31 | **One profile per user** — the account *is* the identity; no multi-profile picker. | Simpler UX and data model; user lands directly on their own editor. | Locked |
| D2 | 2026-07-31 | **Admin-invited email/password auth** — no public signup. | Official org; super admin controls who is in. | Locked |
| D3 | 2026-07-31 | **Include vCard** — public page has "Save to contacts". | High-value, low-cost; standard on competitors. | Locked |
| D4 | 2026-07-31 | **No scan analytics in v1.** | Keep v1 lean; can add later. | Locked |
| D5 | 2026-07-31 | **Public URL uses a short random slug** (e.g. `/a1b2c3`), not DB IDs. | Prevents enumeration of staff profiles; cleaner links. | Locked |
| D6 | 2026-07-31 | **Photo optional** with a branded fallback (initials / ICAO monogram in circle). | A profile should never look broken. | Locked |
| D7 | 2026-07-31 | **English-only for v1.** | Keep v1 lean; multi-language (incl. RTL Arabic, CJK) is a large layout/font effort. Revisit post-v1. | Locked |
| D8 | 2026-07-31 | ~~Transactional email via Resend~~ — **superseded by D12.** | — | Superseded |
| D9 | 2026-07-31 | **ICAO logo used in the QR center**, with ICAO's **written consent** (app is being built for ICAO). Resolves OQ-LOGO. | Client confirmed written permission from ICAO; app is an official ICAO deliverable. | Locked |
| D10 | 2026-07-31 | **Single-tenant**: one ICAO organization, many staff users, one super admin. Resolves OQ-TENANCY. | Matches the original brief; simpler architecture; no multi-org isolation needed. | Locked |
| D14 | 2026-07-31 | **Super admins are administrators only — no personal profile, QR, or public page.** Their dashboard is the **Users** tab only (`/dashboard` redirects to `/dashboard/users`); no "My profile". Profiles exist only for staff **ADMIN** users. Invite/edit/role-promote paths never create a super-admin profile; promoting a user to super admin drops their profile. Removed the "ICAO ID" credential pill from the public page. | Client requested super admin be a pure administrator. Keeps the role model clean: staff hold cards, super admins manage them. | Locked |
| D13 | 2026-07-31 | **Profile photos stored in Postgres** (processed 512px WebP as `bytea`), served via `/api/photo/[slug]`. Replaces Vercel Blob for the POC. HEIC uploads supported via client-side conversion (`heic2any`) before cropping. Max source size 10 MB. | Vercel's serverless FS is read-only and no Blob store was configured → uploads failed in prod. In-DB storage works identically local/prod with zero external setup; images are tiny (~30 KB). Revisit object storage (Blob/R2/MinIO) if photo volume grows. | Locked |
| D12 | 2026-07-31 | **Emails disabled for V1.** No email provider. Invite and password-reset links are generated in the dashboard by the super admin and copied/shared manually (tokenized `/set-password?mode=…&token=…` URLs). Public self-service "forgot password" removed. Supersedes D8. | Simplest V1 — avoids email provider setup, domain verification (SPF/DKIM/DMARC), and deliverability concerns. Links are single-use + time-limited (invite 7d, reset 1h). Revisit adding email later. | Locked |
| D11 | 2026-07-31 | **Managed hosting for POC**: app on **Vercel**, Postgres on **Neon**, photos on **Vercel Blob**. Storage/email stay behind interfaces so a later move to ICAO-controlled infra (Docker + self-hosted Postgres + MinIO) is low-friction. | Fastest path to a working proof-of-concept; minimal ops. Data-residency revisited before any production/PII rollout. | Locked (POC) |

## Two roles (from client brief)
- **Admin (staff user):** create/edit/delete **their own** profile + QR only.
- **Super admin:** view/edit/delete **all** profiles + manage users.

## Open questions (to resolve during PRD)
- Public URL/domain — will ICAO provide a subdomain (e.g. `id.icao.int`)?
- ICAO SSO — deferred (D2 chose email/password); revisit if IT provides access.
- Where are photos stored (object storage vs DB)? — architecture doc.
- ~~Localization~~ — resolved: English-only for v1 (D7).
- ~~OQ-LOGO~~ — resolved: ICAO logo in QR center, written consent confirmed (D9).
- ~~OQ-TENANCY~~ — resolved: single-tenant (D10).
