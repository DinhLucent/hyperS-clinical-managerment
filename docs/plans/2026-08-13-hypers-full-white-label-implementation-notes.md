# HyperS Full White-Label — Implementation Notes

## Environment baseline

Prepared on 2026-08-13 before UI implementation.

- Repository: `C:\Users\ADMIN\Documents\ChatGPT\medplum clone\medplum-provider`
- Branch: `codex/hypers-white-label`
- `origin`: `https://github.com/DinhLucent/hyperS-clinical-managerment.git`
- `upstream`: `https://github.com/medplum/medplum-provider.git`
- Baseline commit pushed to `origin/main`: `ad8451d`
- Node: `v24.13.0`
- npm/npx: `11.7.0`
- Git: `2.51.1.windows.1`
- Docker: `29.4.0`
- Docker Compose: `v5.1.2`
- GitHub CLI: `2.88.1`
- Python: `3.11.14`
- Repository-local skills: `frontend-design` and `playwright`, pinned by `skills-lock.json`.
- Playwright security boundary: local HyperS URLs only; no real credentials or persisted authentication state.

Baseline evidence before environment repair:

- `npm run build`: PASS.
- `docker compose -f ..\medplum-local-stack\docker-compose.yml config --quiet`: PASS.
- `npm run lint`: FAIL because ESLint 9 could not find `eslint.config.*`.
- `npm test`: 110/116 files and 1,271/1,285 tests passed; 14 failed.
  - Ten failures traversed the upstream Medplum `<Logo>` and failed while reading `import.meta.env.MEDPLUM_LOGO_URL` from an externalized dependency.
  - Four failures attempted `vi.spyOn` on non-configurable ESM namespace exports in notifications, ExportTab, and PatientPage tests.

## Deviations

- Local Admin host port is `3002` instead of the originally planned `3000` because port 3000 is owned by an unrelated PM2 application. The container still listens on port 3000 internally; only the host mapping and `MEDPLUM_APP_BASE_URL` changed. Provider remains on 3001 and customer-demo scope is unchanged.

When the implementation differs from the handoff, append an entry with:

1. What the handoff required.
2. What the code or runtime required instead.
3. The conservative decision taken.
4. Command, test, DOM, screenshot, or source evidence.

## Verification log

### 2026-08-13 environment preparation

- `npm install --package-lock-only --ignore-scripts`: PASS; lockfile synchronized.
- `npm ci`: PASS; 606 packages audited, 0 npm vulnerabilities reported.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS with 37 upstream React Compiler warnings and no errors.
- `npm test -- --reporter=dot`: PASS; 116/116 files and 1,285/1,285 tests in 348.16 seconds.
  - All `@medplum/*` test dependencies are processed in one Vite pipeline so `import.meta.env`, ESM spies, and React context identity remain correct.
  - Vitest is capped at two workers to avoid false timeouts on local and two-core CI runners.
- `npm run build`: PASS; 8,134 modules transformed. Vite still reports the known large-chunk warning.
- `docker compose -f infra/local/docker-compose.yml config --quiet`: PASS.
- Focused post-config smoke test `src/pages/RegisterPage.test.tsx`: PASS, 5/5 tests.
- Repository-local `frontend-design` and `playwright` skills installed and pinned in `skills-lock.json`.
- `.gitattributes` enforces LF text files across Windows and Linux; common binary asset formats are marked binary.
- Runtime smoke check: PASS. API health `http://localhost:8103/healthcheck`, Provider `http://localhost:3001/signin`, and operator-only Admin `http://localhost:3002` all returned HTTP 200; all four Compose services reported healthy.

Keep appending dated implementation results here. Do not replace the baseline evidence above.
