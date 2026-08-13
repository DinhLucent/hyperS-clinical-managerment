# HyperSol Clinical Management

React 19 + Vite 8 Provider application backed by the self-hosted Medplum 5.1.29 stack. The active product work is a full HyperSol white-label pass; clinical behavior and FHIR interoperability must remain unchanged.

## Active work

- Read `docs/plans/2026-08-13-hypers-full-white-label-handoff.md` completely before implementing the rebrand.
- Keep `docs/plans/2026-08-13-hypers-full-white-label-implementation-notes.md` current. Record every plan deviation under `## Deviations`.
- Work on `codex/hypersol-white-label-fixes`. Open a pull request into `main`; do not merge it as part of implementation.

## Commands

- Install exactly from the lockfile: `npm ci`
- Start Provider UI on port 3001: `npm run dev`
- Type-check: `npm run typecheck`
- Lint: `npm run lint`
- Run tests once: `npm test`
- Production build: `npm run build`
- Full local verification: `npm run verify`
- Validate local infrastructure: `docker compose -f infra/local/docker-compose.yml config --quiet`
- Start local API/database/operator tools: `docker compose -f infra/local/docker-compose.yml up -d`
- Stop containers without deleting data: `docker compose -f infra/local/docker-compose.yml down`

Provider UI is `http://localhost:3001`; local API is `http://localhost:8103`; Admin is operator-only at `http://localhost:3002` and must not be shown in the customer demo. Port 3000 belongs to an unrelated local PM2 application; do not stop or modify it.

## Repository boundaries

- This repository root is `medplum-provider`; an unrelated outer Git repository also exists. Confirm `git rev-parse --show-toplevel` ends in `medplum-provider` before any commit or push.
- `origin` is the private HyperSol repository. `upstream` is the Medplum source repository and is read-only for this work.
- Preserve the user-owned `.env` locally and never stage it; only safe defaults belong in the tracked `.env.defaults`. Preserve unrelated user changes in `package.json`.
- Never run `docker compose down -v`, rename Compose volumes, reset the database, force-push, or rewrite Git history.

## White-label conventions

- Change only user-visible Medplum branding: rendered logo, favicon, browser metadata, visible copy, outbound docs/pricing/community/support links, and violet/purple presentation colors.
- Preserve all `@medplum/*` imports, `MedplumClient`/hooks, `MEDPLUM_*` environment keys, Docker image names, SPDX notices, and FHIR `system`/`identifier`/canonical URLs. These are technical contracts, not customer-facing branding.
- The approved brand name is `HyperSol`. Keep the UI in English.
- Brand reference: `D:\MyProject\my-landingpage`; approved logo: `D:\MyProject\my-landingpage\public\brand-mark.png`.
- Use the live landing CSS as the color source: primary `#1264FF`, deep primary `#084ABF`, ink `#0B2944`, muted `#5C6F82`, border `#DFE6EE`, soft surface `#F4F7FB`.
- The demo is light-only. Do not add a multi-brand engine, new font/CDN dependency, cloud deployment, docs backend, or Admin App theme fork.
- Missing HyperSol destinations render as non-interactive content or a genuinely disabled `Coming soon` control. Do not use empty URLs or `href="#"`.

## Known baseline and corrective actions

- Baseline build and Compose config pass.
- ESLint 9 requires root `eslint.config.mjs`; it delegates to `@medplum/eslint-config`.
- Vitest previously had 14 failures caused by externalized ESM namespaces and the upstream `<Logo>` reading `import.meta.env`. The standalone Vite test config must inline the affected dependencies; do not skip tests or weaken assertions.
- Vite reports a future `__dirname` config-loader warning and a large-chunk warning. They are outside this rebrand unless a change makes them errors.
- Google OAuth and reCAPTCHA values are intentionally empty for the local demo. Do not invent or commit credentials.
- External scripts must not load just because the app opens. Smoke-test the browser Network panel for Medplum Cloud and Google identity requests.

## Skills and verification roles

- Use `.agents/skills/frontend-design/SKILL.md` for the implementation pass.
- Use `.agents/skills/playwright/SKILL.md` for independent browser QA, screenshots, console inspection, responsive checks, and network audit after implementation.
- Playwright has browser-level permissions. Limit it to `http://localhost:3001` and `http://localhost:8103`; do not browse external sites, enter real credentials, persist authentication state, or upload local files.
- Restore pinned repository skills with `npx skills experimental_install -y` if `.agents/skills` is absent. Review `skills-lock.json` before accepting any update.
- Do not have multiple agents edit the same working tree concurrently. Run the implementer first, then an independent reviewer.

## References

- Implementation handoff: `docs/plans/2026-08-13-hypers-full-white-label-handoff.md`
- Environment status and deviations: `docs/plans/2026-08-13-hypers-full-white-label-implementation-notes.md`
- Local stack: `infra/local/docker-compose.yml`
- License: `LICENSE.txt`
