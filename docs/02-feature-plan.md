# 02 — Feature Plan (v1)

_Status: Draft · Last updated: 2026-07-31_

Complete feature set for v1. Decisions referenced as **D1–D6** live in
[decisions-log.md](./decisions-log.md).

## 1. Authentication & roles
- Email/password login (**invite-only**, no public signup — D2).
- Forgot-password / reset flow.
- Session management (logout, expiry).
- Two roles:
  - **Admin (staff):** manage only their own profile + QR.
  - **Super admin:** manage all profiles + all users.

## 2. Super admin — user & profile management
- Invite / create a new user (triggers set-password email).
- Deactivate or delete a user (offboarding).
- List all users & profiles with search / filter.
- View, edit, or delete **any** profile.

## 3. Profile editor (one per user — D1)
- **Photo** upload with **circular crop preview** (photo optional, branded fallback — D6).
- Name, title / role.
- Phone number (with country code).
- Address.
- Optional socials: **Instagram, Twitter/X, Facebook, LinkedIn** — hidden when empty.
- Live preview of both the public page and the QR while editing.

## 4. QR code generation
- Auto-generated on save.
- **ICAO logo centered** in the QR, with high error-correction so it still scans.
- Points to a **stable** unique public URL (edit info without reprinting — short random
  slug, D5).
- Download as **PNG / SVG / PDF** (PDF for badge/card printing).

## 5. Public profile page (read-only)
- Circular photo (or branded fallback), name, title.
- Tap-to-call phone; tap-to-open address in maps.
- Social icons (only those provided).
- **Save to contacts (vCard)** — D3.
- Mobile-first, fast, ICAO-branded.

## 6. Design & branding
- ICAO color palette; **modern** execution (no dated aviation clichés).
- ICAO logo in QR center and on the public page.
- Detailed tokens/components to be captured in `05-design-system.md`.

## 7. Dashboard essentials
- Staff: land directly on own profile editor (single profile — D1).
- Super admin: list/grid of all profiles with search/filter and quick actions
  (edit, download QR, delete, copy public link).

## Out of scope for v1
- Scan analytics (D4) — planned for later.
- Multiple profiles per user (D1).
- Public self-signup (D2).
- ICAO SSO (deferred; revisit if IT provides access).
- Localization / multi-language (open question — see decisions log).

## Open items feeding the PRD
- Public domain/subdomain from ICAO (e.g. `id.icao.int`).
- Photo storage approach (architecture doc).
- Multi-language need (ICAO official languages).
