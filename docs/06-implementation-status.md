# 06 — Implementation Status (POC)

_Status: POC built & locally verified · Last updated: 2026-07-31_

Local proof-of-concept of ICAO Digital Identity, per docs 01–05. Stack + hosting per D11
(Next.js on Vercel-target, Neon Postgres, Vercel Blob / local storage, Resend / console email).

## Built & verified

| Area | Requirement | Status |
|------|-------------|--------|
| Auth | Invite-only email/password, sessions, forgot/reset, RBAC, middleware (FR-A) | ✅ |
| Roles | ADMIN (own) vs SUPER_ADMIN (all + user mgmt) enforced server-side | ✅ |
| Profile editor | Photo circular crop, name/title/phone/address, optional socials, live QR (FR-E) | ✅ |
| QR | Centered ICAO logo, EC level H, **decodes correctly with logo** (FR-Q3), PNG/SVG/PDF | ✅ |
| Public page | Read-only, tap-to-call/map, socials, vCard, "unavailable" for deactivated (FR-P) | ✅ |
| vCard | vCard 3.0 `.vcf`, valid output (PRD §6) | ✅ |
| Super admin | Invite, deactivate/reactivate, role change, delete, edit any profile; last-super-admin guard (FR-M) | ✅ |
| Design | ICAO Modern palette + type, modern (non-aviation) UI (doc 05) | ✅ |
| Services | EmailService (Resend/console) + StorageService (Blob/local) behind interfaces (D8/D11) | ✅ |

### Verification performed
- `npm run typecheck` — clean.
- `npm run build` — clean (9 routes + middleware compiled).
- Live server smoke test: `/` → `/login` redirect; `/dashboard` gated when unauthenticated;
  authenticated dashboard + users pages render; public page renders; unknown slug → "unavailable".
- QR PNG/SVG/PDF generated; **QR decoded back to the correct public URL with the logo overlaid**.
- vCard downloads with valid content.

## Known limitations / pre-production work
- **Brand assets:** placeholder ICAO monogram (`public/brand/icao-logo.svg`) + proposed
  palette — swap official ICAO vector + hex (docs/05 A2).
- **Password hashing:** bcryptjs for POC; argon2 recommended for production (doc 04 §1).
- **Rate limiting:** in-memory (per-instance); move to Redis/Upstash for production (FR-A6).
- **Data residency:** managed Vercel/Neon for POC; revisit before real PII (D11, doc 04 §6).
- **Domain:** uses `NEXT_PUBLIC_APP_URL`; set the real ICAO subdomain for production.
- **Email:** console transport in dev; set `RESEND_API_KEY` + verify domain (SPF/DKIM/DMARC).

## How to run
See the project [`README.md`](../README.md). Test account: `admin@icao.local` /
`ChangeMe!2026`.

## Independent review — completed, all findings resolved
An independent security + code review confirmed the core authorization model is correct
(no IDOR: every mutating server action re-derives the caller from the session; client
`userId` is only ever a target). It found **no critical/high** issues and six lower-severity
items, **all now fixed & re-verified**:

| # | Severity | Finding | Fix |
|---|----------|---------|-----|
| 1 | Medium | Open redirect via backslash in login `next` param | Hardened `safeNext` (rejects `\`, control chars, `//`); unit-tested |
| 2 | Low | Unescaped name in invite email HTML | `escapeHtml()` on dynamic values |
| 3 | Low | vCard `\r` line-injection | Strip CR in vCard `esc` + control-char stripping in `profileSchema` |
| 4 | Low | set-password wrote hash before status check | Check active status (peek) before consuming token/writing hash |
| 5 | Low | Sessions survived password reset (12h) | Added `User.tokenVersion`, embedded in JWT, bumped on password change, checked in `getCurrentUser` |
| 6 | Low | `ensureProfile` first-write TOCTOU | Switched to `upsert` |

Re-verification after fixes: `typecheck` + `build` clean; stale session cookie now rejected;
valid session accepted; public page / QR (decoded OK) / vCard all pass; `safeNext` unit test all-pass.
