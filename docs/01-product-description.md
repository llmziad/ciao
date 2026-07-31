# 01 — Product Description

_Status: Draft · Last updated: 2026-07-31_

## Overview
The ICAO Digital Identity platform is an internal web application that lets ICAO staff
present a professional, official digital identity via a personal QR code. Each staff
member manages a single profile from a central dashboard. Saving the profile generates a
QR code with the **ICAO logo in its center**. Anyone who scans it lands on a clean,
read-only public page showing the person's photo, name, title, contact details, and
optional social links — and can save the contact directly to their phone.

It is, in effect, ICAO's official digital business card system: consistent, branded, and
centrally managed.

## Context: ICAO Security Culture program
This product aligns with ICAO's **Security Culture** initiative and its customizable
resources (posters, briefing packs, and **wallet cards**). The physical "wallet card"
carries a security manager's contact details so staff know who to reach to report a
security incident. This app is, in effect, the **digital evolution of that wallet card**:
a scannable, always-current contact identity — which is also why "Save to contacts"
(vCard) is a first-class feature.
_Reference: ICAO Security Culture Customizable Resources – User Guide (ISD-SEC,
isd@icao.int)._

## Problem it solves
- Paper business cards are static, easily lost, and go out of date the moment a role or
  number changes.
- Ad-hoc personal QR tools produce inconsistent, off-brand results for an official body.
- ICAO needs a **centrally governed** way for staff to share verified contact identities,
  with oversight from a super admin.

## Who uses it
| Persona | Goal | Role in system |
|---------|------|----------------|
| **Staff member** | Maintain their own profile, share their QR code. | Admin (own profile only) |
| **Super admin** | Onboard staff, oversee and correct all profiles, remove departed staff. | Super admin |
| **Anyone who scans** | Quickly view and save a staff member's contact info. | Public (no account) |

## What makes it valuable
- **Always current** — update your info once; the printed QR never has to change (stable URL).
- **On-brand & official** — ICAO colors, ICAO logo in the QR, a modern (not dated
  "aviation") design that signals authority.
- **Centrally governed** — super admin controls who exists and can fix/remove anything.
- **Frictionless for the recipient** — scan → view → save to contacts, no app required.

## Core user journeys
1. **Onboarding (super admin):** invites a staff member by email → they set a password.
2. **Profile setup (staff):** log in → add photo (circular), name, title, phone, address,
   optional socials → save → QR generated → download for print/email/badge.
3. **Sharing:** staff shares the QR (badge, email signature, screen). No re-print needed
   when details change.
4. **Scanning (public):** scan → read-only ICAO-branded profile → tap-to-call, open map,
   visit socials, or **Save to contacts** (vCard).
5. **Governance (super admin):** review all profiles, edit/correct, delete or offboard.

## Scope note (v1)
- One profile per user; invite-only access; vCard included; **no** scan analytics in v1.
- See [02-feature-plan.md](./02-feature-plan.md) for the full feature list and
  [decisions-log.md](./decisions-log.md) for locked decisions.

## Design intent
ICAO's brand palette, executed in a **modern, confident** style — generous whitespace,
clean typography, subtle motion. Deliberately *not* skeuomorphic or aviation-clichéd
(no runways, planes, clouds). The QR code carries the ICAO logo at its center.
