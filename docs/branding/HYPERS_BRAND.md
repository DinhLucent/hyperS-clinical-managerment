# HyperS brand guide

## Identity

- Name: `HyperS`
- Product title: `HyperS Clinical Management`
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

Mantine's `blue` palette is overridden in `src/brand/theme.ts` so existing primary controls follow the HyperS blue scale. Red, green, and yellow remain available for semantic error, success, and warning states.

## Logo and asset provenance

The approved source is:

`D:\MyProject\my-landingpage\public\brand-mark.png`

The source was verified as a transparent 655×807 ARGB PNG. The repository asset is `public/brand/hypers-mark.png`, preserving the source proportions and transparency. `public/favicon.ico` and `public/apple-touch-icon.png` use the same mark on transparent square canvases with containment padding; they do not redraw or reinterpret the identity.

Use `src/brand/HyperSLogo.tsx` for application lockups. The component exposes an accessible `HyperS` name and keeps the image itself decorative when the parent supplies the accessible name.

## Usage rules

- Use the local HyperS asset for brand lockups and browser icons.
- Keep the mark's proportions; use containment rather than stretching or cropping.
- Keep primary actions blue and body text ink or muted gray.
- Preserve vendor logos only when they identify a real integration card.
- Do not use vendor-logo collages as decorative brand imagery.
- Do not add Google Fonts, CDN assets, cloud deployment, or a multi-brand runtime.
- Missing HyperS destinations must be static content or genuinely disabled `Coming soon` controls.
- Do not replace Medplum/FHIR technical identifiers, package names, or API contracts merely because they contain the upstream name.
