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
- GitHub Actions workflow validation: repository Actions is enabled with `allowed_actions=all`, and the official `rhysd/actionlint` Docker image reports no workflow errors. GitHub still ends both the full workflow and a one-step `echo` control workflow with `startup_failure` before creating any job or log. This is an external account/private-repository Actions restriction, most likely Billing & Licensing or an Actions budget; review the personal account's **Settings > Billing & Licensing > Budgets and alerts** before relying on hosted CI.

### 2026-08-13 implementation preflight

- Repository verification: root is `C:\Users\ADMIN\Documents\ChatGPT\medplum clone\medplum-provider`; branch is `codex/hypers-white-label`; working tree was clean; `origin` and `upstream` match the required URLs.
- Current branch history includes the already-identified environment/bootstrap commits `7770382`, `ed0e00d`, and merge `af5a056`; no rebase, reset, or history rewrite was performed. This supersedes the older handoff assumption that the destination `main` remained only at `ad8451d`.
- `npm ci`: first attempt hit `EPERM` unlinking the in-use `@rolldown` Windows native binding because the existing Provider Vite process held it; only the Provider process on port 3001 was stopped, the install was rerun, and `npm ci` then passed with 605 packages added, 606 audited, and 0 vulnerabilities.
- `npm run typecheck`: PASS.
- `docker compose -f infra/local/docker-compose.yml config --quiet`: PASS.
- Runtime preflight: API `http://localhost:8103/healthcheck` returned HTTP 200; Provider `http://localhost:3001/signin` returned HTTP 200 after restart; operator-only Admin `http://localhost:3002` returned HTTP 200. Port 3000 was not inspected or modified.
- Baseline browser evidence: `output/playwright/baseline-signin-desktop-rendered.png` shows the original purple Medplum mark and `Sign in to Provider`; `output/playwright/baseline-signin-desktop.png` preserves the transient blank page captured during the interrupted install. DOM snapshot contained `img "Medplum Logo"` and heading `Sign in to Provider`; title was `Medplum Provider`.
- Baseline browser console/network: no app error after dependency repair; the dev server still returned `404` for `http://localhost:3001/@vite/client`, recorded as pre-existing setup evidence to revisit during final QA. No external Google request was observed in the baseline request summary.

### 2026-08-13 tracer slice and stop

- Tracer implementation completed locally: HyperS brand constants/tokens, Mantine blue theme with forced light mode, accessible local HyperSLogo, local mark/favicon/apple-touch assets, browser metadata, AppShell logo prop, and Sign In/Register branding were added without modifying any dependency package.
- `npm run typecheck`: PASS after the tracer changes.
- Focused tests: the final rerun of `HyperSLogo`, `SignInPage`, `RegisterPage`, and `ResourcePage` passed 4/4 files and 16/16 tests. An earlier run briefly failed only because the post-login assertion was changed ahead of the Get Started sweep; that temporary assertion was removed before the passing rerun, and the full-sweep expectation remains a resume task.
- STOP CONDITION 5 reached: the public `AppShellProps` declaration in `node_modules/@medplum/react/dist/esm/index.d.ts` exposes `logo` but no accessible-label override. The shipped implementation in `node_modules/@medplum/react/dist/esm/index.mjs` hardcodes `aria-label="Medplum Logo"` on the navbar toggle around `props.logo`. The focused Vitest DOM failure captured the same customer-surface evidence: a button with `aria-label="Medplum Logo"` wrapping a `HyperS` logo with `/brand/hypers-mark.png`.
- Conservative decision: do not patch `node_modules`, fork `@medplum/react`, post-process the DOM, or replace the dependency AppShell wholesale. Stop before the broad customer-visible sweep until a supported public override or an explicit human decision is available.
- Tracer browser evidence after implementation: desktop `output/playwright/tracer-signin-desktop.png` at 1440x900 and mobile `output/playwright/tracer-signin-mobile.png` at 390x844 both show the supplied HyperS mark/wordmark, `Sign in to HyperS`, and blue primary controls without horizontal overflow. DOM snapshot exposed accessible image name `HyperS`; document title was `HyperS Clinical Management`. Console had no page errors; network requests were local `localhost:3001` assets only, with `/brand/hypers-mark.png` returning 304 and no Google identity or Medplum Cloud host observed.
- Post-tracer source audit: no `<Logo>` usage remains in `src`; the planned customer-visible Medplum copy/outbound links remain in Get Started, Integrations, and DocsLink, and violet presentation matches remain in the release banner, medication badge, Spaces, and claim status. Those are intentionally unmodified because the dependency stop precedes Phase 2.
- Resume point: the working tree contains only the HyperS tracer changes and notes/assets from this task; the exact next action is to resolve the dependency AppShell accessible-label blocker, then rerun the tracer tests before Phase 2.

### 2026-08-13 Phase 2-3 sweep

- Get Started: removed the decorative vendor-logo collage and its dead CSS, replaced pricing/subscription/support destinations with local explanatory copy, changed the heading to `Get Started with HyperS`, converted guide cards to static workflow summaries with disabled `Coming soon` buttons, and made HyperS Support non-interactive.
- Customer-visible sweep: removed `DocsLink` and all callers, removed the ReleaseStageBanner docs CTA, changed schedule guidance and visible fallback copy to HyperS/local wording, removed the fake `href="#"` encounter-template link, disabled integration-request CTAs, and changed SMART Health Link fallback to `HyperS`.
- Color sweep: non-test `src` now has no `violet`, `purple`, or `magenta` matches; semantic red/green/yellow colors were not changed.
- Documentation/reproducibility: rewrote `README.md`, added `NOTICE.md`, added `docs/branding/HYPERS_BRAND.md`, and changed package metadata to `hypers-clinical-management@0.1.0` while preserving all `@medplum/*` dependencies.
- Focused verification after the sweep: `npm run typecheck` PASS; `npm run lint` PASS with 36 known upstream React Compiler warnings and no errors; focused suite PASS, 10 files and 65 tests.
- Source audit results: no matches for the required customer-visible legacy strings, Medplum outbound href/mailto/Discord patterns, dependency `<Logo>` usage, or old purple color names. Remaining `medplum.com` matches are FHIR canonical URLs, bot identifiers, systems, test fixtures, or a technical documentation comment; none are rendered customer links.
- Remaining blocker: the dependency AppShell runtime still emits `aria-label="Medplum Logo"` on authenticated navigation because no public override exists. This remains the handoff STOP condition 5 and is not hidden by source-level audits.

### 2026-08-13 Phase 4 verification and stop

- `npm run verify`: PASS. Typecheck passed; ESLint passed with 36 warnings and 0 errors; Vitest passed 119/119 files and 1,285/1,285 tests; the production build passed after transforming 8,137 modules. The known Vite large-chunk warning remains.
- `docker compose -f infra/local/docker-compose.yml config --quiet`: PASS.
- Final public browser QA used only `http://localhost:3001`: `/signin` and `/register` were checked at 1440x900 and 390x844. Both rendered the HyperS logo and HyperS headings, and both had no horizontal overflow. Sign-in DOM had no visible `Medplum` text or outbound anchors. Sign-in and register page-load console error counts were zero; the observed request list contained only `localhost:3001` assets, including `/brand/hypers-mark.png`, with no Google identity or Medplum Cloud host.
- Final browser evidence: `output/playwright/final-signin-desktop.png`, `output/playwright/final-signin-mobile.png`, `output/playwright/final-register-desktop.png`, and `output/playwright/final-register-mobile.png`.
- Register DOM audit found dependency-rendered outbound anchors to `https://www.medplum.com/privacy`, `https://www.medplum.com/terms`, `https://policies.google.com/privacy`, and `https://policies.google.com/terms`, plus visible copy naming Medplum and Google. The public `RegisterFormProps` declaration exposes no footer, legal-copy, or branding override. The shipped `NewUserForm` implementation hardcodes those strings and links.
- AppShell remains independently blocked by the same dependency boundary: `AppShellProps` exposes `logo` but no accessible-label override, while the shipped navbar toggle hardcodes `aria-label="Medplum Logo"`. The focused DOM test already captured that label wrapping the HyperS logo.
- STOP CONDITION 5 therefore remains active. Conservative decision: do not patch `node_modules`, fork `@medplum/react`, post-process dependency DOM, remove legal disclosures without an approved replacement, or replace the dependency auth/shell surfaces without explicit human authority. The completed Phase 2-3 sweep and local verification remain in the working tree, but the completion claim, commit/push, and unmerged PR are withheld until the dependency-rendered branding has a supported resolution.
- Current resume point: obtain a supported `@medplum/react` API/version that allows the AppShell accessible label and RegisterForm legal footer to be branded, or receive explicit authority for a bounded replacement that preserves auth/legal/FHIR behavior; then rerun the auth and shell browser audits before committing.

### 2026-08-13 dependency API follow-up

- `npm view @medplum/react version dist-tags --json`: current npm `latest` remains `5.1.29`; the `backport` tag is `4.1.18`.
- The installed `5.1.29` declarations confirm `AppShellProps` has `logo` but no accessible-label property, and `RegisterFormProps` has no legal-footer, legal-copy, or branding property. The package implementation hardcodes the affected strings and label.
- No supported dependency upgrade is available from the published package tags, so the existing STOP CONDITION 5 is unchanged. No dependency source or installed package was modified.

### 2026-08-13 app-owned branding override and final verification

- Original requirement: remove dependency-rendered Medplum branding while preserving Medplum/FHIR behavior. The earlier dependency stop was based on the absence of public `AppShell` and `RegisterForm` branding props.
- Human direction: the user explicitly instructed the task to continue past that stop. The conservative bounded resolution was to replace only the Provider-owned presentation wrappers, without modifying `node_modules`, forking `@medplum/react`, or changing any `@medplum/*` package contract.
- Added `src/components/HyperSAppShell.tsx` and its stylesheet/test. It uses Mantine's public AppShell primitives plus public Medplum hooks/client methods for HyperS navigation, notification counts, spotlight actions, account settings, and sign-out. The logo control is explicitly labelled `HyperS navigation`; no dependency `AppShell` is rendered.
- Added `src/components/HyperSRegisterForm.tsx`. It preserves the public Medplum client registration sequence (`startNewUser`, optional public reCAPTCHA helpers, `processCode`, and `startNewProject`) while rendering HyperS-owned copy and local-demo legal text. Google identity registration is not initialized or loaded.
- Focused replacement tests: PASS, 3 files and 12 tests. Full `npm run verify`: PASS; 120/120 test files and 1,287/1,287 tests, typecheck PASS, lint PASS with 36 existing warnings and 0 errors, and production build PASS after 8,140 modules transformed.
- Compose validation: `docker compose -f infra/local/docker-compose.yml config --quiet` PASS. Runtime endpoints returned HTTP 200 for `http://localhost:8103/healthcheck`, `http://localhost:3001/signin`, and operator-only `http://localhost:3002`.
- Fresh Playwright session on `http://localhost:3001` inspected `/signin` and `/register` at 1440x900 and 390x844. DOM contained HyperS branding with no visible Medplum text; register had no anchors; both had no horizontal overflow; console error count was zero; performance resource hosts were only `localhost:3001`; no Google identity or Medplum Cloud host was observed.
- Final browser evidence: `output/playwright/final-clean-signin-desktop.png`, `output/playwright/final-clean-signin-mobile.png`, `output/playwright/final-clean-register-desktop.png`, and `output/playwright/final-clean-register-mobile.png`. Authenticated visual navigation was covered by `HyperSAppShell.test.tsx`; no real credentials or persisted auth state were used for browser QA.
- Final source audit: no customer-visible legacy product strings, marketing mailto/Discord links, dependency `<Logo>`/`<AppShell>`/`<RegisterForm>` usage, or old purple color names remain in app-owned source. Retained `medplum.com` occurrences are FHIR canonical URLs, bot/system identifiers, fixtures, or technical comments; `google.com/recaptcha` remains only as a vendor integration card destination and is not loaded during ordinary page load.
- Current status: the previous STOP CONDITION 5 is resolved by the bounded app-owned wrapper implementation under explicit human direction. The next action is to stage only task files, commit coherent changes, push `codex/hypers-white-label` to `origin`, and open an unmerged PR into `main`.

### 2026-08-13 delivery

- Commit `3edc6aa` (`feat: complete HyperS Provider white-label`) was created from the audited task files and pushed to `origin/codex/hypers-white-label`.
- Pull request opened: `https://github.com/DinhLucent/hyperS-clinical-managerment/pull/3`, base `main`, state `OPEN`, unmerged.
- Temporary `.playwright-cli/` session state remains untracked and was intentionally excluded from the commit. No unrelated source changes remain unstaged.

Keep appending dated implementation results here. Do not replace the baseline evidence above.
