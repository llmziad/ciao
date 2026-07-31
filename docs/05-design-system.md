# 05 — Design System

_Status: Draft (proposed) · Last updated: 2026-07-31_

> **Proposed** palette & type. Swap in **official ICAO brand values** once provided
> (assumption A2 in the PRD). Modern, confident, blue-forward — **no** aviation clichés
> (no runways, planes, clouds, sky gradients).

## Color tokens

| Token | Hex | Use |
|-------|-----|-----|
| `--color-primary` (ICAO Blue) | `#0055A5` | Primary buttons, links, active states — **sampled from the official ICAO logo** |
| `--color-navy` (Deep Navy / ink) | `#002B5C` | Headings, top bar, footer, high-emphasis text |
| `--color-accent` (Cyan) | `#00B5E2` | Sparing highlights, focus rings, small flourishes |
| `--color-text` | `#0F172A` | Body text |
| `--color-text-muted` | `#5B6B7F` | Secondary text, labels |
| `--color-surface` | `#FFFFFF` | Cards, editor surfaces |
| `--color-bg` | `#F5F8FB` | App background (cool near-white) |
| `--color-border` | `#E2E8F0` | Dividers, input borders |
| `--color-success` | `#16A34A` | Saved / active |
| `--color-warning` | `#D97706` | Caution / deactivation |
| `--color-error` | `#DC2626` | Errors / destructive confirm |

All foreground/background pairings must meet **WCAG 2.1 AA** contrast (NFR-4).

## Typography
- **UI / body:** Inter (or system humanist sans fallback).
- **Headings:** Space Grotesk (or similar geometric sans) for a modern, authoritative feel.
- Clear type scale, generous line-height, strong hierarchy. Legibility on the mobile
  public page is the priority.

## Look & feel principles
- Generous whitespace; content-first, uncluttered.
- Rounded-but-restrained corners; soft, subtle shadows (no heavy skeuomorphism).
- Blue used with intent; neutrals carry most surfaces.
- Subtle, purposeful motion (state transitions), never decorative animation.
- **Modern, not "airy/aviation."**

## Signature components (to spec during build)
- **Circular photo** avatar with branded fallback (initials / ICAO monogram) — D6.
- **QR card**: generated QR with **centered ICAO logo**, download actions (PNG/SVG/PDF).
- **Public profile page**: circular photo, name/title, tap-to-call, tap-to-map, social
  icons, "Save to contacts" button.
- **Dashboard shell**: navy top bar with ICAO logo, clean content area.

## Logo — INTEGRATED
- **Source:** the official ICAO logo was extracted from ICAO's Security Culture resources
  (`.docx`, embedded `word/media/image3.png`) — the horizontal lockup (roundel emblem +
  "ICAO" wordmark).
- **Assets in the app:**
  - `public/brand/icao-logo.png` — full lockup, used in headers/nav (`Logo` component).
  - `public/brand/icao-mark.png` — roundel emblem only, square, used at the **QR center**
    (the wide lockup doesn't fit a square; the emblem is the recognizable mark).
- **QR center plate:** small **square with square corners** (`LOGO_RATIO` 0.22, corner
  radius 0) — verified still scannable at EC level H.
- **Usage rights: CONFIRMED (D9).** Client has ICAO's written consent; this is an official
  ICAO deliverable.
- Higher-resolution official vector (SVG/EPS) can replace these PNGs later if provided.

## Brand assets — status
- ~~ICAO logo~~ — **obtained & integrated** (lockup + emblem, from ICAO's own resources).
- Official **brand color hex values** — still using the proposed "ICAO Modern" palette;
  swap when ICAO provides official values.
- (Optional) higher-res official **vector** logo (SVG/EPS) to replace the extracted PNGs.
- ~~Written confirmation of ICAO logo-usage rights~~ — obtained (D9).
