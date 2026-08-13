# HyperSol Clinical Management

HyperSol Clinical Management is a local-first Provider demo for exploring clinical workflows while preserving the underlying FHIR and Medplum-compatible contracts.

## What the demo covers

- Patient registration, search, and clinical records
- Visit documentation, tasks, messaging, and scheduling
- Sample patient, visit, ICD-10, and order-set data
- Medication, lab, billing, fax, SMART Health Link, and integration surfaces

The customer-facing application is English-only and light-mode for this demo. Missing HyperSol documentation, support, and integration-request destinations are represented as disabled `Coming soon` controls.

## Local prerequisites

- Node.js `v24.13.0` (the repository `.nvmrc` is authoritative)
- npm
- Docker Desktop with Compose
- A running local Medplum-compatible API/database stack

## Run locally

Install exactly from the lockfile:

```bash
npm ci
```

Start the local stack without deleting data:

```bash
docker compose -f infra/local/docker-compose.yml config --quiet
docker compose -f infra/local/docker-compose.yml up -d
```

Start the Provider UI:

```bash
npm run dev
```

Local URLs:

- Provider customer demo: <http://localhost:3001>
- Local API healthcheck: <http://localhost:8103/healthcheck>
- Admin operator tool: <http://localhost:3002> — operator-only; do not link or show it in the customer demo

Port 3000 belongs to an unrelated local application and must not be stopped, restarted, or modified by this project.

## Local-only configuration

`.env.defaults` contains the safe local application defaults. Vite creates an ignored `.env` from those defaults on first run when no local file exists. Local demo login credentials belong only in `.env` and must never be committed. Google identity and reCAPTCHA values remain empty; no real OAuth, email, domain, or reCAPTCHA credentials are required or included.

The application may use `@medplum/*` packages, `MedplumClient`, `MEDPLUM_*` environment keys, and FHIR canonical/system identifiers internally. These are compatibility contracts and are intentionally not renamed. See [NOTICE.md](NOTICE.md) for upstream attribution.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
docker compose -f infra/local/docker-compose.yml config --quiet
```

The known standalone baseline includes React Compiler lint warnings and a Vite large-chunk warning; they must not become errors or be hidden by new configuration.

## Customer-demo boundaries

- Provider port 3001 is the customer-facing surface.
- Admin port 3002 is for operators only and is not part of the HyperSol rebrand.
- No cloud deployment, SaaS dependency, schema migration, FHIR data reset, or database-volume reset is part of this repository.
- `docker compose down -v` is prohibited because it can remove demo data.

## Brand assets

The approved mark is documented in [docs/branding/HYPERSOL_BRAND.md](docs/branding/HYPERSOL_BRAND.md). The local web asset is `public/brand/hypersol-mark.png`; it is copied from the approved transparent source without redrawing or distortion.
