# ICAO Digital Identity — Documentation

> **For any agent/developer picking up this project:** read this index first, then
> the relevant doc. **Keep these docs updated as part of every change** — if you alter
> scope, a decision, or the architecture, update the matching doc *and* the changelog
> at the bottom of this file in the same session.

## Project in one line
A digital identity platform for ICAO: staff manage a personal profile through a central
dashboard; each profile generates an ICAO-branded QR code that, when scanned, opens a
clean read-only public profile page (a digital business card).

## Document map
| # | Doc | Purpose | Status |
|---|-----|---------|--------|
| 00 | [decisions-log.md](./decisions-log.md) | Every locked product/technical decision + rationale | Living |
| 01 | [01-product-description.md](./01-product-description.md) | The "what & why" — vision, users, value | Draft |
| 02 | [02-feature-plan.md](./02-feature-plan.md) | Complete v1 feature set + out-of-scope | Draft |
| 03 | [03-requirements-prd.md](./03-requirements-prd.md) | Detailed PRD (functional + non-functional) | Draft |
| 04 | [04-technical-architecture.md](./04-technical-architecture.md) | Stack, data model, hosting | Draft (proposed) |
| 05 | [05-design-system.md](./05-design-system.md) | ICAO branding, colors, typography, components | Draft (proposed) |
| 06 | [06-implementation-status.md](./06-implementation-status.md) | What's built, verification, run instructions | POC built |

## Working process (agreed with the client)
1. **Product description** — done in draft (doc 01).
2. **Project requirements (PRD)** — next (doc 03).
3. **Execution** — begins only after the plan is settled.

## Conventions
- Docs are numbered by phase. New docs continue the numbering.
- Decisions go in `decisions-log.md` with a date and rationale — never bury a decision
  only inside prose.
- When scope changes, update the affected doc and add a changelog entry below.

## Changelog
- **2026-07-31** — **Real ICAO logo + professional redesign.** Extracted the official ICAO
  logo from ICAO's resources (lockup for headers, emblem for QR center); QR plate now a small
  square with square corners (scannability re-verified). Redesigned the public profile page as
  an official "digital credential": white app bar (fixes logo/background match), card separated
  from the header, line icons (no emoji), monospace credential-ID signature. Hardened social
  normalization (URLs as-is incl. scheme-less; usernames auto-linked) + editor tooltip;
  12/12 unit cases pass. Calibrated primary blue to the logo's `#0055A5`. Seed now populates
  demo contact/socials. typecheck + build clean.
- **2026-07-31** — **POC built & locally verified.** Full Next.js 14 app: invite-only auth
  (bcryptjs + jose sessions), RBAC, profile editor (circular photo crop), QR with centered
  ICAO logo (EC-H, decode-verified), PNG/SVG/PDF export, public read-only page + vCard,
  super-admin user management with last-super-admin guards. Ran on the Neon DB; typecheck +
  build clean. Independent security review passed — core authz correct, 6 low/medium findings
  **all fixed & re-verified** (see doc 06). Added project `README.md` + doc 06.
- **2026-07-31** — Initial docs created: product description, feature plan, decisions log.
  Locked v1 decisions D1–D6 (see decisions log).
- **2026-07-31** — Locked D5, D6; added D7 (English-only). Drafted PRD (doc 03) with
  numbered FR/NFR requirements, data model, vCard spec, and acceptance criteria.
- **2026-07-31** — Added D8 (transactional email via **Resend**, from ICAO's domain, behind
  a swappable `EmailService` interface); PRD §6.5 added. Drafted proposed design system
  (doc 05) with "ICAO Modern" palette + type direction.
- **2026-07-31** — Reviewed ICAO Security Culture User Guide. Added program context to doc 01
  (wallet-card lineage), logo source + **usage constraint** to doc 05, and open questions
  OQ-LOGO (ICAO logo permission / whose logo) and OQ-TENANCY (single vs. multi-tenant).
- **2026-07-31** — Locked D9 (ICAO logo, **written consent confirmed**) and D10
  (**single-tenant**); OQ-LOGO/OQ-TENANCY resolved. Drafted technical architecture (doc 04):
  recommended Next.js/TS/Postgres/Prisma stack, data model, QR/photo/vCard pipelines,
  security, and a flagged **hosting/data-residency** decision. **Planning docs 01–05 complete.**
- **2026-07-31** — Locked D11: **managed POC hosting** — Vercel (app) + Neon (Postgres) +
  Vercel Blob (photos), storage/email behind swappable interfaces; residency revisited before
  production. Doc 04 §6 finalized. **Plan settled — ready for execution (step 3) once brand
  assets + domain arrive.**
