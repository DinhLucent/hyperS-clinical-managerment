# HyperSol Full White-Label — Implementation Notes

## Environment baseline

Prepared on 2026-08-13 before UI implementation.

- Repository: `C:\Users\ADMIN\Documents\ChatGPT\medplum clone\medplum-provider`
- Active follow-up branch: `codex/hypersol-white-label-fixes`
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
- Playwright security boundary: local HyperSol URLs only; no real credentials or persisted authentication state.

Baseline evidence before environment repair:

- `npm run build`: PASS.
- `docker compose -f ..\medplum-local-stack\docker-compose.yml config --quiet`: PASS.
- `npm run lint`: FAIL because ESLint 9 could not find `eslint.config.*`.
- `npm test`: 110/116 files and 1,271/1,285 tests passed; 14 failed.
  - Ten failures traversed the upstream Medplum `<Logo>` and failed while reading `import.meta.env.MEDPLUM_LOGO_URL` from an externalized dependency.
  - Four failures attempted `vi.spyOn` on non-configurable ESM namespace exports in notifications, ExportTab, and PatientPage tests.

## Deviations

- Local Admin host port is `3002` instead of the originally planned `3000` because port 3000 is owned by an unrelated PM2 application. The container still listens on port 3000 internally; only the host mapping and `MEDPLUM_APP_BASE_URL` changed. Provider remains on 3001 and customer-demo scope is unchanged.
- The handoff limited the task to presentation branding. The previous app-owned `HyperSAppShell` and `HyperSRegisterForm` replacement introduced runtime responsibility for navigation and registration. Under explicit user direction, the follow-up keeps those bounded wrappers but adds pending-state protection, safe error copy, state preservation, responsive navigation behavior, a safe view error boundary, and regression tests without changing Medplum/FHIR API contracts.
- The approved display name changed from `HyperS` to `HyperSol`. The follow-up renames app-owned symbols/assets/copy and package metadata while retaining the existing GitHub repository URL and all Medplum/FHIR technical identifiers.

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

- Tracer implementation completed locally: HyperSol brand constants/tokens, Mantine blue theme with forced light mode, accessible local HyperSolLogo, local mark/favicon/apple-touch assets, browser metadata, AppShell logo prop, and Sign In/Register branding were added without modifying any dependency package.
- `npm run typecheck`: PASS after the tracer changes.
- Focused tests: the final rerun of `HyperSolLogo`, `SignInPage`, `RegisterPage`, and `ResourcePage` passed 4/4 files and 16/16 tests. An earlier run briefly failed only because the post-login assertion was changed ahead of the Get Started sweep; that temporary assertion was removed before the passing rerun, and the full-sweep expectation remains a resume task.
- STOP CONDITION 5 reached: the public `AppShellProps` declaration in `node_modules/@medplum/react/dist/esm/index.d.ts` exposes `logo` but no accessible-label override. The shipped implementation in `node_modules/@medplum/react/dist/esm/index.mjs` hardcodes `aria-label="Medplum Logo"` on the navbar toggle around `props.logo`. The focused Vitest DOM failure captured the same customer-surface evidence: a button with `aria-label="Medplum Logo"` wrapping a `HyperSol` logo with `/brand/hypersol-mark.png`.
- Conservative decision: do not patch `node_modules`, fork `@medplum/react`, post-process the DOM, or replace the dependency AppShell wholesale. Stop before the broad customer-visible sweep until a supported public override or an explicit human decision is available.
- Tracer browser evidence after implementation: desktop `output/playwright/tracer-signin-desktop.png` at 1440x900 and mobile `output/playwright/tracer-signin-mobile.png` at 390x844 both show the supplied HyperSol mark/wordmark, `Sign in to HyperSol`, and blue primary controls without horizontal overflow. DOM snapshot exposed accessible image name `HyperSol`; document title was `HyperSol Clinical Management`. Console had no page errors; network requests were local `localhost:3001` assets only, with `/brand/hypersol-mark.png` returning 304 and no Google identity or Medplum Cloud host observed.
- Post-tracer source audit: no `<Logo>` usage remains in `src`; the planned customer-visible Medplum copy/outbound links remain in Get Started, Integrations, and DocsLink, and violet presentation matches remain in the release banner, medication badge, Spaces, and claim status. Those are intentionally unmodified because the dependency stop precedes Phase 2.
- Resume point: the working tree contains only the HyperSol tracer changes and notes/assets from this task; the exact next action is to resolve the dependency AppShell accessible-label blocker, then rerun the tracer tests before Phase 2.

### 2026-08-13 Phase 2-3 sweep

- Get Started: removed the decorative vendor-logo collage and its dead CSS, replaced pricing/subscription/support destinations with local explanatory copy, changed the heading to `Get Started with HyperSol`, converted guide cards to static workflow summaries with disabled `Coming soon` buttons, and made HyperSol Support non-interactive.
- Customer-visible sweep: removed `DocsLink` and all callers, removed the ReleaseStageBanner docs CTA, changed schedule guidance and visible fallback copy to HyperSol/local wording, removed the fake `href="#"` encounter-template link, disabled integration-request CTAs, and changed SMART Health Link fallback to `HyperSol`.
- Color sweep: non-test `src` now has no `violet`, `purple`, or `magenta` matches; semantic red/green/yellow colors were not changed.
- Documentation/reproducibility: rewrote `README.md`, added `NOTICE.md`, added `docs/branding/HYPERSOL_BRAND.md`, and changed package metadata to `hypersol-clinical-management@0.1.0` while preserving all `@medplum/*` dependencies.
- Focused verification after the sweep: `npm run typecheck` PASS; `npm run lint` PASS with 36 known upstream React Compiler warnings and no errors; focused suite PASS, 10 files and 65 tests.
- Source audit results: no matches for the required customer-visible legacy strings, Medplum outbound href/mailto/Discord patterns, dependency `<Logo>` usage, or old purple color names. Remaining `medplum.com` matches are FHIR canonical URLs, bot identifiers, systems, test fixtures, or a technical documentation comment; none are rendered customer links.
- Remaining blocker: the dependency AppShell runtime still emits `aria-label="Medplum Logo"` on authenticated navigation because no public override exists. This remains the handoff STOP condition 5 and is not hidden by source-level audits.

### 2026-08-13 Phase 4 verification and stop

- `npm run verify`: PASS. Typecheck passed; ESLint passed with 36 warnings and 0 errors; Vitest passed 119/119 files and 1,285/1,285 tests; the production build passed after transforming 8,137 modules. The known Vite large-chunk warning remains.
- `docker compose -f infra/local/docker-compose.yml config --quiet`: PASS.
- Final public browser QA used only `http://localhost:3001`: `/signin` and `/register` were checked at 1440x900 and 390x844. Both rendered the HyperSol logo and HyperSol headings, and both had no horizontal overflow. Sign-in DOM had no visible `Medplum` text or outbound anchors. Sign-in and register page-load console error counts were zero; the observed request list contained only `localhost:3001` assets, including `/brand/hypersol-mark.png`, with no Google identity or Medplum Cloud host.
- Final browser evidence: `output/playwright/final-signin-desktop.png`, `output/playwright/final-signin-mobile.png`, `output/playwright/final-register-desktop.png`, and `output/playwright/final-register-mobile.png`.
- Register DOM audit found dependency-rendered outbound anchors to `https://www.medplum.com/privacy`, `https://www.medplum.com/terms`, `https://policies.google.com/privacy`, and `https://policies.google.com/terms`, plus visible copy naming Medplum and Google. The public `RegisterFormProps` declaration exposes no footer, legal-copy, or branding override. The shipped `NewUserForm` implementation hardcodes those strings and links.
- AppShell remains independently blocked by the same dependency boundary: `AppShellProps` exposes `logo` but no accessible-label override, while the shipped navbar toggle hardcodes `aria-label="Medplum Logo"`. The focused DOM test already captured that label wrapping the HyperSol logo.
- STOP CONDITION 5 therefore remains active. Conservative decision: do not patch `node_modules`, fork `@medplum/react`, post-process dependency DOM, remove legal disclosures without an approved replacement, or replace the dependency auth/shell surfaces without explicit human authority. The completed Phase 2-3 sweep and local verification remain in the working tree, but the completion claim, commit/push, and unmerged PR are withheld until the dependency-rendered branding has a supported resolution.
- Current resume point: obtain a supported `@medplum/react` API/version that allows the AppShell accessible label and RegisterForm legal footer to be branded, or receive explicit authority for a bounded replacement that preserves auth/legal/FHIR behavior; then rerun the auth and shell browser audits before committing.

### 2026-08-13 dependency API follow-up

- `npm view @medplum/react version dist-tags --json`: current npm `latest` remains `5.1.29`; the `backport` tag is `4.1.18`.
- The installed `5.1.29` declarations confirm `AppShellProps` has `logo` but no accessible-label property, and `RegisterFormProps` has no legal-footer, legal-copy, or branding property. The package implementation hardcodes the affected strings and label.
- No supported dependency upgrade is available from the published package tags, so the existing STOP CONDITION 5 is unchanged. No dependency source or installed package was modified.

### 2026-08-13 app-owned branding override and final verification

- Original requirement: remove dependency-rendered Medplum branding while preserving Medplum/FHIR behavior. The earlier dependency stop was based on the absence of public `AppShell` and `RegisterForm` branding props.
- Human direction: the user explicitly instructed the task to continue past that stop. The conservative bounded resolution was to replace only the Provider-owned presentation wrappers, without modifying `node_modules`, forking `@medplum/react`, or changing any `@medplum/*` package contract.
- Added `src/components/HyperSolAppShell.tsx` and its stylesheet/test. It uses Mantine's public AppShell primitives plus public Medplum hooks/client methods for HyperSol navigation, notification counts, spotlight actions, account settings, and sign-out. The logo control is explicitly labelled `HyperSol navigation`; no dependency `AppShell` is rendered.
- Added `src/components/HyperSolRegisterForm.tsx`. It preserves the public Medplum client registration sequence (`startNewUser`, optional public reCAPTCHA helpers, `processCode`, and `startNewProject`) while rendering HyperSol-owned copy and local-demo legal text. Google identity registration is not initialized or loaded.
- Focused replacement tests: PASS, 3 files and 12 tests. Full `npm run verify`: PASS; 120/120 test files and 1,287/1,287 tests, typecheck PASS, lint PASS with 36 existing warnings and 0 errors, and production build PASS after 8,140 modules transformed.
- Compose validation: `docker compose -f infra/local/docker-compose.yml config --quiet` PASS. Runtime endpoints returned HTTP 200 for `http://localhost:8103/healthcheck`, `http://localhost:3001/signin`, and operator-only `http://localhost:3002`.
- Fresh Playwright session on `http://localhost:3001` inspected `/signin` and `/register` at 1440x900 and 390x844. DOM contained HyperSol branding with no visible Medplum text; register had no anchors; both had no horizontal overflow; console error count was zero; performance resource hosts were only `localhost:3001`; no Google identity or Medplum Cloud host was observed.
- Final browser evidence: `output/playwright/final-clean-signin-desktop.png`, `output/playwright/final-clean-signin-mobile.png`, `output/playwright/final-clean-register-desktop.png`, and `output/playwright/final-clean-register-mobile.png`. Authenticated visual navigation was covered by `HyperSolAppShell.test.tsx`; no real credentials or persisted auth state were used for browser QA.
- Final source audit: no customer-visible legacy product strings, marketing mailto/Discord links, dependency `<Logo>`/`<AppShell>`/`<RegisterForm>` usage, or old purple color names remain in app-owned source. Retained `medplum.com` occurrences are FHIR canonical URLs, bot/system identifiers, fixtures, or technical comments; `google.com/recaptcha` remains only as a vendor integration card destination and is not loaded during ordinary page load.
- Current status: the previous STOP CONDITION 5 is resolved by the bounded app-owned wrapper implementation under explicit human direction. The next action is to stage only task files, commit coherent changes, push `codex/hypers-white-label` to `origin`, and open an unmerged PR into `main`.

### 2026-08-13 delivery

- Commit `3edc6aa` (`feat: complete HyperSol Provider white-label`) was created from the audited task files and pushed to `origin/codex/hypers-white-label`.
- Pull request opened: `https://github.com/DinhLucent/hyperS-clinical-managerment/pull/3`, base `main`, state `OPEN`, unmerged.
- Temporary `.playwright-cli/` session state remains untracked and was intentionally excluded from the commit. No unrelated source changes remain unstaged.

### 2026-08-13 HyperSol runtime corrective follow-up

- Active branch: `codex/hypersol-white-label-fixes`, created from delivered commit `cd15e3a`; no follow-up commit or push was made during this audit.
- Runtime scope verdict: the prior app-owned `HyperSAppShell` and `HyperSRegisterForm` did take responsibility for navigation and registration behavior, so Luna's implementation exceeded a presentation-only branding change. The corrective pass retains the bounded wrappers but preserves the existing Medplum client calls, routes, FHIR identifiers, environment keys, Docker images, and local API endpoints.
- Registration fixes: added an immediate in-flight lock, stable loading/disabled controls, safe customer-facing errors, console-only technical detail, preserved field values, corrected autocomplete metadata, and regression tests for duplicate submission and error leakage.
- Shell fixes: navigation now initializes and follows the desktop breakpoint, remains closed on mobile, the logo routes home instead of toggling navigation, mobile links close the drawer, touch targets are at least 40-44px, a skip link is available, and an app-owned error boundary prevents raw internal errors from reaching customers.
- Design system: renamed app-owned HyperS symbols/assets/copy to HyperSol; the wordmark uses deep ink for `Hyper` and blue for `Sol`; local system font stacks, compact clinical heading sizes, readable body line height, 16px mobile inputs, blue focus treatment, and balanced auth card widths are documented in `docs/branding/HYPERSOL_BRAND.md`.
- Responsive fix found during authenticated QA: the Get Started sample-data grid produced a 473px document width in a 390px viewport. The grid now uses `minmax(0, 1fr)` and collapses to one column below 48em; the measured document width is now exactly 390px.
- Local demo account was created through the real local registration flow: `admin@hypersol.local`, profile `HyperSol Administrator`, project `HyperSol Local Demo`. The local-only credentials are stored in `.env`; the `HYPERSOL_` prefix is not included in Vite's `envPrefix`, so it is not exposed to browser code. Do not commit or reuse the demo password outside localhost.
- Public browser QA: `/signin` and `/register` passed at 1440x900 and 390x844. Both have zero horizontal overflow, local-only resource hosts, zero page-load console errors, no visible Medplum text, and no Medplum/legal outbound anchors. Mobile input font size measured 16px.
- Authenticated browser QA: `/getstarted`, `/Patient`, `/Calendar/Schedule`, `/Communication`, `/Task`, `/integrations`, and `/smart-health-link` passed at 1440x900 and 390x844 with no visible Medplum text or horizontal overflow. Mobile navigation was closed by default, opened through the labelled control, routed to Patients, and closed after navigation. Account menu exposed the expected HyperSol identity, account settings, and sign-out controls.
- Integrations intentionally retains links to the represented vendor sites. The audited customer surface contains no Medplum link. These vendor links identify real integration cards and are not HyperSol routing placeholders.
- Authenticated console limitation: the local project returns HTTP 400 for `$get-ws-binding-token` because WebSocket subscriptions are not enabled for the project. This also occurs outside the branding surfaces; HTTP/FHIR navigation continues to work. It was not changed because enabling project-level realtime is a backend/runtime configuration decision, not a Luna branding regression.
- Verification: `npm run typecheck` PASS; focused HyperSol suite PASS (5 files, 17 tests); `npm run lint` PASS with 36 known upstream warnings and 0 errors; full Vitest PASS (121 files, 1,290 tests); production build PASS (8,143 modules) with only the known large-chunk warning; Compose config PASS.
- Browser evidence: `output/playwright/hypersol-final-signin-desktop.png`, `hypersol-final-signin-mobile.png`, `hypersol-final-register-desktop.png`, `hypersol-final-register-mobile.png`, `hypersol-shell-desktop.png`, `hypersol-shell-mobile-fixed.png`, `hypersol-final-patients-desktop.png`, `hypersol-final-schedule-desktop.png`, `hypersol-final-integrations-desktop.png`, `hypersol-final-mobile-navigation.png`, and `hypersol-final-account-menu.png`.

Keep appending dated implementation results here. Do not replace the baseline evidence above.
