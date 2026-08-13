# HyperSol brand guide

## Identity

- Name: `HyperSol`
- Product title: `HyperSol Clinical Management`
- UI language: English
- Presentation: light-only for the local customer demo

## Palette

| Role | Value |
| --- | --- |
| Primary | `#1264FF` |
| Deep primary | `#084ABF` |
| Ink | `#0B2944` |
| Deep ink | `#061B2D` |
| Muted text | `#5C6F82` |
| Border | `#DFE6EE` |
| Surface | `#FFFFFF` |
| Soft surface | `#F4F7FB` |
| Focus ring | `rgba(18, 100, 255, 0.35)` |

Mantine's `blue` palette is overridden in `src/brand/theme.ts` so existing primary controls follow the HyperSol blue scale. Red, green, and yellow remain available for semantic error, success, and warning states.

## Typography

- Body and form copy: local system stack led by `Segoe UI Variable Text`; no font is fetched from a CDN.
- Headings and wordmark: `Segoe UI Variable Display`, weight 650–750, compact negative tracking.
- Clinical identifiers and machine-readable values: `Cascadia Mono` with system monospace fallbacks.
- Default body copy is 15px with 1.5 line height; mobile inputs are at least 16px to prevent browser zoom.
- Heading sizes use a compact clinical scale from 13px to 26px. Titles use deep ink; helper text uses muted ink.
- Primary controls are at least 42px high on desktop and 44px on mobile; labels use sentence case.

## Logo and asset provenance

The approved source is:

`D:\MyProject\my-landingpage\public\brand-mark.png`

The source was verified as a transparent 655×807 ARGB PNG. The repository asset is `public/brand/hypersol-mark.png`, preserving the source proportions and transparency. `public/favicon.ico` and `public/apple-touch-icon.png` use the same mark on transparent square canvases with containment padding; they do not redraw or reinterpret the identity.

Use `src/brand/HyperSolLogo.tsx` for application lockups. The component exposes an accessible `HyperSol` name and keeps the image itself decorative when the parent supplies the accessible name.
The wordmark renders `Hyper` in deep ink and `Sol` in the primary blue to provide one consistent visual signature across authentication and navigation surfaces.

## Usage rules

- Use the local HyperSol asset for brand lockups and browser icons.
- Keep the mark's proportions; use containment rather than stretching or cropping.
- Keep primary actions blue and body text ink or muted gray.
- Preserve vendor logos only when they identify a real integration card.
- Do not use vendor-logo collages as decorative brand imagery.
- Do not add Google Fonts, CDN assets, cloud deployment, or a multi-brand runtime.
- Missing HyperSol destinations must be static content or genuinely disabled `Coming soon` controls.
- Do not replace Medplum/FHIR technical identifiers, package names, or API contracts merely because they contain the upstream name.
