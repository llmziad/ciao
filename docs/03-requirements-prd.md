# 03 — Project Requirements (PRD)

_Status: Draft · Last updated: 2026-07-31_

Detailed requirements for **ICAO Digital Identity v1**. Requirements are numbered
(`FR-*` functional, `NFR-*` non-functional) for traceability into tickets and tests.
Decisions referenced as **D1–D7** live in [decisions-log.md](./decisions-log.md).

---

## 1. Purpose & scope

Build an internal, invite-only web app where ICAO staff each manage a single profile that
generates an ICAO-branded QR code. Scanning the QR opens a read-only public profile page
with contact details, optional socials, and a "Save to contacts" action.

**In scope (v1):** invite-only auth, two roles, single profile per user, profile editor,
QR generation with centered ICAO logo, public read-only page, vCard download, super-admin
management, ICAO-branded modern design, English-only.

**Out of scope (v1):** scan analytics (D4), multiple profiles per user (D1), public
self-signup (D2), ICAO SSO, localization/RTL (D7).

---

## 2. Roles & permissions

| Capability | Public (unauth) | Admin (staff) | Super admin |
|---|---|---|---|
| View a public profile page (via scan/link) | ✅ | ✅ | ✅ |
| Save contact / vCard | ✅ | ✅ | ✅ |
| Log in to dashboard | ❌ | ✅ | ✅ |
| Edit **own** profile & QR | ❌ | ✅ | ❌ (no personal profile — D14) |
| View/edit/delete **any** profile | ❌ | ❌ | ✅ |
| Invite / create users | ❌ | ❌ | ✅ |
| Deactivate / delete users | ❌ | ❌ | ✅ |
| Assign / revoke super-admin role | ❌ | ❌ | ✅ |

_There is no public signup (D2). Every account is created by a super admin._

---

## 3. Functional requirements

### 3.1 Authentication & account (FR-A)
- **FR-A1** Users log in with email + password.
- **FR-A2** A super admin can invite a user by email; the invite email contains a
  single-use, time-limited link to set an initial password. Invite (and reset) emails are
  sent **from ICAO's own domain** via a transactional email provider (see §6.5, D8).
- **FR-A3** Passwords must meet a minimum policy (≥10 chars, at least one letter + number;
  final policy TBD in architecture). Stored only as a salted hash.
- **FR-A4** "Forgot password" sends a single-use, time-limited reset link.
- **FR-A5** Sessions expire after inactivity (duration TBD, default 12h) and on logout.
- **FR-A6** Login attempts are rate-limited to deter brute-force attacks.
- **FR-A7** A deactivated user cannot log in and their public page is hidden (see FR-P7).

### 3.2 Super-admin management (FR-M)
- **FR-M1** Super admin sees a searchable/filterable list of all users & profiles
  (name, email, role, status, last updated).
- **FR-M2** Super admin can create/invite, deactivate, reactivate, and delete a user.
- **FR-M3** Super admin can open and edit any profile (same editor as the owner).
- **FR-M4** Super admin can delete any profile; deletion invalidates its public URL/QR.
- **FR-M5** Super admin can grant or revoke the super-admin role on another account.
- **FR-M6** The system prevents removing the **last** super admin (no lockout).
- **FR-M7** Destructive actions (delete user/profile) require an explicit confirmation.

### 3.3 Profile editor (FR-E) — one profile per user (D1)
- **FR-E1** Fields: photo, name (required), title/role, phone, address, and optional social
  links (Instagram, Twitter/X, Facebook, LinkedIn).
- **FR-E2** **Name is required.** All other fields optional; empty socials are omitted from
  the public page.
- **FR-E3** Photo upload supports common formats (JPG/PNG/WebP), with a **circular crop**
  UI and a preview matching the public rendering. Max source file size 10 MB.
- **FR-E4** Photo is optional; when absent, a branded fallback (initials or ICAO monogram
  in a circle) renders (D6).
- **FR-E5** Phone captured with country code; validated for basic format.
- **FR-E6** Social inputs accept a full URL or a handle; the system normalizes to a valid
  profile URL and validates the domain per network.
- **FR-E7** A **live preview** shows the public page and QR as fields change.
- **FR-E8** Saving persists the profile and (re)generates the public page; the public URL
  and QR image **do not change** on content edits (D5 stable slug).
- **FR-E9** Basic input sanitization on all fields to prevent stored XSS on the public page.

### 3.4 QR code generation (FR-Q)
- **FR-Q1** On first save, the system assigns a **short random slug** (D5) and builds the
  public URL (e.g. `https://<domain>/p/<slug>`).
- **FR-Q2** A QR encoding that URL is generated with the **ICAO logo centered**.
- **FR-Q3** Error-correction level **H** is used so the centered logo (covering ≤ ~30% of
  the code) does not break scannability; generated codes must be verified scannable.
- **FR-Q4** QR is downloadable as **PNG, SVG, and PDF** (PDF sized for badge/card print).
- **FR-Q5** The QR image is stable across content edits (only the profile data changes).
- **FR-Q6** Regeneration is possible if branding changes, but the encoded URL stays the
  same unless a super admin explicitly rotates the slug.

### 3.5 Public profile page (FR-P) — read-only
- **FR-P1** Accessible without authentication at the profile's public URL.
- **FR-P2** Displays circular photo (or fallback), name, title/role.
- **FR-P3** Phone renders as a tap-to-call link (`tel:`).
- **FR-P4** Address renders as a tap-to-open maps link.
- **FR-P5** Only provided social links appear, as branded icons opening in a new tab.
- **FR-P6** **Save to contacts** downloads a vCard (`.vcf`) with name, title, phone,
  address, and social URLs (D3). See §6.
- **FR-P7** If the profile is deactivated/deleted, the page returns a friendly
  "profile unavailable" state (not raw 404 content), and the vCard is not offered.
- **FR-P8** Page is read-only — no edit affordances, no auth prompts.

### 3.6 Dashboard (FR-D)
- **FR-D1** Staff land directly on their own profile editor after login (single profile, D1).
- **FR-D2** Every dashboard screen offers: download QR, copy public link, view public page.
- **FR-D3** Super admin has an additional "All profiles" view (FR-M1) with quick actions
  (edit, download QR, delete, copy link).

---

## 4. Data model (initial)

> Finalized in `04-technical-architecture.md`; captured here for requirements traceability.

**User**
- id, email (unique), password_hash, role (`admin` | `super_admin`),
  status (`active` | `deactivated`), created_at, updated_at, last_login_at.

**Profile** (1:1 with User — D1)
- id, user_id (FK), slug (unique, random — D5), name, title, phone, address,
  photo_url (nullable — D6), social_instagram, social_twitter, social_facebook,
  social_linkedin (all nullable), created_at, updated_at.

**Invite / password-reset token**
- id, user_id (FK), token_hash, type (`invite` | `reset`), expires_at, used_at.

_Note: scan events are intentionally NOT modeled in v1 (D4)._

---

## 5. Non-functional requirements

- **NFR-1 Performance:** public profile page loads in < 2s on a typical mobile connection;
  images served optimized/responsive.
- **NFR-2 Security:** HTTPS everywhere; hashed passwords; single-use, expiring invite/reset
  tokens; rate-limited auth; stored-XSS protection on public fields; access control enforced
  server-side (staff cannot reach another user's edit endpoints).
- **NFR-3 Privacy:** public slugs are random and non-enumerable (D5); deactivated profiles
  are hidden (FR-P7).
- **NFR-4 Accessibility:** public page and dashboard target WCAG 2.1 AA — color contrast,
  keyboard navigation, alt text, focus states.
- **NFR-5 Responsive:** mobile-first public page; dashboard usable on tablet/desktop.
- **NFR-6 Browsers:** current versions of Chrome, Safari, Firefox, Edge; iOS Safari &
  Android Chrome for scanning.
- **NFR-7 Branding fidelity:** ICAO palette and logo per `05-design-system.md`; QR always
  carries the centered ICAO logo.
- **NFR-8 Auditability:** log administrative actions (user create/deactivate/delete, role
  changes) for accountability.
- **NFR-9 Language:** English-only (D7); copy externalized enough to ease future i18n.

---

## 6. vCard specification (FR-P6)

- Format: vCard 3.0 (`.vcf`), one contact.
- Fields mapped: `FN` (name), `TITLE` (title/role), `TEL` (phone),
  `ADR` (address), `URL` (each social link), `PHOTO` (embedded or referenced if present).
- Filename: `<name>.vcf`.
- Must import cleanly on iOS Contacts and Android Contacts.

---

## 6.5 Transactional email (invites & resets) — D8

- **Purpose:** send invite and password-reset emails **from ICAO's own domain**.
- **Provider: Resend** — free tier of 3,000 emails/month (100/day), reliable deliverability,
  custom-domain sending via SPF/DKIM, clean developer API. Volume here is tiny
  (invites/resets only), so the free tier is ample.
- **Alternatives** (drop-in, if ever needed): Brevo (~300/day free) or SendGrid (100/day
  free). Selection is not locked to code — see abstraction below.
- **Abstraction requirement:** all sending goes through a single `EmailService` interface
  (`sendInvite`, `sendPasswordReset`). Switching providers must be a one-file/config change,
  no changes to call sites.
- **Domain setup:** verify ICAO's sending domain with SPF, DKIM, and DMARC records before
  go-live to maximize deliverability and avoid spam foldering (depends on A3).
- **Reliability:** send failures are logged and surfaced to the super admin; invites can be
  re-sent.

## 7. Assumptions & dependencies

- **A1** ICAO provides a domain/subdomain for public URLs (e.g. `id.icao.int`). Until then,
  a placeholder domain is used. _(Open — decisions log.)_
- **A2** ICAO provides official logo assets (QR-center mark + full logo) and brand color
  values. _(Needed for design system.)_
- **A3** Transactional email provider configured for invite/reset emails (see §6.5, D8);
  ICAO provides DNS access to verify the sending domain (SPF/DKIM/DMARC).
- **A4** Photo storage via object storage (finalized in architecture doc).
- **A5** Client authorized this as an internal ICAO tool (staff data handled accordingly).

---

## 8. Acceptance criteria (representative)

- **AC-1** A super admin invites a new staff member; the member sets a password and logs in.
- **AC-2** A staff member fills name + phone + one social, uploads and circular-crops a
  photo, saves, and sees a QR with the ICAO logo centered that they can download as PNG/SVG/PDF.
- **AC-3** Scanning that QR on a phone opens the public page; tap-to-call works; "Save to
  contacts" imports a valid vCard.
- **AC-4** A staff member cannot access or edit another staff member's profile via URL or API.
- **AC-5** A super admin edits and then deletes another user's profile; the public URL then
  shows "profile unavailable".
- **AC-6** A profile with no photo shows the branded fallback, not a broken image.
- **AC-7** Editing profile text does not change the public URL or require reprinting the QR.

---

## 9. Open items to resolve before/within architecture

- Public domain/subdomain (A1).
- Password policy + session duration specifics (FR-A3, FR-A5).
- Max photo size/dimensions (FR-E3).
- Object storage choice & image pipeline (A4).
- Tech stack selection → `04-technical-architecture.md`.
