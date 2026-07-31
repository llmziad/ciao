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
| D8 | 2026-07-31 | **Transactional email via Resend**, sending from ICAO's own domain; wrapped behind an `EmailService` interface so the provider stays swappable (Brevo/SendGrid). | Client confirmed prior use of Resend; free tier (3,000/mo) ample for invite/reset volume; reliable deliverability; clean API. | Locked |
| D9 | 2026-07-31 | **ICAO logo used in the QR center**, with ICAO's **written consent** (app is being built for ICAO). Resolves OQ-LOGO. | Client confirmed written permission from ICAO; app is an official ICAO deliverable. | Locked |
| D10 | 2026-07-31 | **Single-tenant**: one ICAO organization, many staff users, one super admin. Resolves OQ-TENANCY. | Matches the original brief; simpler architecture; no multi-org isolation needed. | Locked |
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
