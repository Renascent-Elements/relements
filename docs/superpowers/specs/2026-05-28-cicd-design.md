# CI/CD Design — `@relements/core`

**Date:** 2026-05-28
**Status:** Approved, ready for implementation plan
**Scope:** GitHub Actions workflows + Changesets-driven release flow for the `relements` monorepo.

## Purpose

Set up automated continuous integration and a release pipeline so:

- Every PR validates lint, unit tests, build, and full Playwright suite (functional, a11y, visual) without manual effort.
- Version bumps, changelogs, and npm publishes happen via a reproducible workflow rather than ad-hoc local commands.
- Releases carry an npm provenance attestation linking each published package to the GitHub Actions run that built it.

## Constraints and Assumptions

- Monorepo uses pnpm 10 workspaces; `@relements/core` is currently the only publishable package.
- Tests already exist locally: `pnpm lint`, `pnpm test:unit`, `pnpm test:browser` (Playwright with a11y + visual subsets), `pnpm build`.
- `prepublishOnly` already builds the package before publish.
- Squash-merge workflow on `main`; feature branches off fresh `origin/main`.
- Repo runs on macOS for development; CI runs on Linux.
- Existing Playwright visual snapshots were generated on macOS.

## Architecture

Two workflows plus Changesets tooling.

```
.github/
  workflows/
    ci.yml          # PRs + push to main: lint, unit, build, e2e (parallel)
    release.yml     # push to main only: opens Version Packages PR or publishes
.changeset/
  config.json       # Changesets configuration
```

New devDependency at workspace root: `@changesets/cli`.

## Release Flow (Changesets)

1. Contributor opens a PR with code changes.
2. Locally runs `pnpm changeset` — picks affected package (`@relements/core`), version bump (patch/minor/major), writes a short summary. A markdown file lands in `.changeset/`.
3. CI on the PR runs the full check matrix.
4. PR merges to `main` (squash). The changeset file lands on `main`.
5. `release.yml` detects pending changesets and opens (or updates) a "Version Packages" PR that:
   - Bumps `packages/core/package.json` version.
   - Regenerates `packages/core/CHANGELOG.md`.
   - Deletes consumed `.changeset/*.md` files.
6. Maintainer reviews and merges the Version Packages PR.
7. `release.yml` re-runs on `main` with no pending changesets, detects the new version isn't on npm yet, runs `pnpm build`, then `changeset publish` → npm publish with provenance.

## `ci.yml` Specification

**Triggers:** `pull_request`, `push` to `main`.

**Concurrency:** Group `ci-${{ github.ref }}`, `cancel-in-progress: true` — new commits cancel stale runs on the same branch.

**Jobs (parallel, single OS / single Node version):**

| Job                | Trigger                | Steps                                                                  |
| ------------------ | ---------------------- | ---------------------------------------------------------------------- |
| `lint`             | PR + push to main      | checkout → setup pnpm/node → install → `pnpm lint`                     |
| `unit-build`       | PR + push to main      | checkout → setup pnpm/node → install → `pnpm test:unit` → `pnpm build` |
| `e2e`              | PR + push to main      | checkout → setup pnpm/node → install → install Chromium → `pnpm test:browser` |
| `update-snapshots` | `workflow_dispatch`    | checkout → setup pnpm/node → install → install Chromium → `pnpm test:update-snapshots` → upload `-linux.png` artifact |

**Shared setup steps** in every job:

- `actions/checkout@v4`
- `pnpm/action-setup@v4` (reads `packageManager` from root `package.json`)
- `actions/setup-node@v4` with `node-version: 20` and `cache: pnpm`
- `pnpm install --frozen-lockfile`

**`e2e` job specifics:**

- Cache Playwright browser binaries keyed on `pnpm-lock.yaml` hash so we only pay the download once per lockfile change.
- `npx playwright install --with-deps chromium` (only Chromium; matches local dev).
- On failure: upload `playwright-report/` and `test-results/` as workflow artifacts (lets you download visual diff PNGs locally).

**Acceptance:** PR is blocked from merging until all three jobs pass.

## `release.yml` Specification

**Trigger:** `push` to `main` only (never on PR — secrets must not be exposed to forks).

**Concurrency:** Group `release`, `cancel-in-progress: false` — never run two release jobs in parallel; queue them.

**Permissions:**

- `contents: write` — push the Version Packages PR branch + create tag.
- `pull-requests: write` — open/update the Version Packages PR.
- `id-token: write` — required for npm provenance (OIDC token from GitHub).

**Single job:**

```
release:
  runs-on: ubuntu-latest
  steps:
    - checkout (fetch-depth: 0)
    - setup pnpm + Node 20 with cache
    - pnpm install --frozen-lockfile
    - pnpm build
    - changesets/action@v1
        with:
          version: pnpm changeset version
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN:    ${{ secrets.NPM_TOKEN }}
```

The `changesets/action@v1` step automatically detects mode:

- Pending changesets on `main` → runs `version` command, opens PR.
- No pending changesets but package version unpublished → runs `publish` command.

**`packages/core/package.json` additions:**

```json
{
  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

## Visual Snapshots — Per-Platform Strategy

Playwright (v1.30+) defaults to a snapshot path template that already includes `{projectName}` and `{platform}` segments. Existing snapshots under `tests/visual/**-snapshots/` are named like `button-default-chromium-darwin.png` — no rename is needed.

**`playwright.config.ts` change:**

Pin the path template explicitly so the convention survives Playwright version upgrades:

```ts
snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-platform}{ext}',
```

This matches the existing default, so committed `-darwin` snapshots remain valid.

**Migration steps (one-time):**

1. Add a `workflow_dispatch`-only job called `update-snapshots` in `ci.yml`. It runs `pnpm test:update-snapshots`, then uploads the generated `tests/visual/**-snapshots/*-linux.png` files as an artifact.
2. Trigger the `update-snapshots` job once from the Actions UI, download the artifact, unzip into the repo, commit the new `-linux.png` files.
3. Subsequent CI `e2e` runs find both `-darwin.png` and `-linux.png` baselines and pass on Linux.

## Root Script Additions

`package.json` (root):

```json
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

The workflow runs `pnpm build` and `pnpm changeset publish` directly (not via the `release` script) so each step is visible as its own log entry. The local `release` script exists as a manual-fallback path if a maintainer ever needs to publish from their machine.

## Repo Housekeeping

- Create `.changeset/config.json` with: base branch `main`, access `public`, changelog generator `@changesets/changelog-github` (links PRs/contributors in entries).
- Create empty `packages/core/CHANGELOG.md` placeholder (Changesets fills it).
- Update `docs/IMPLEMENTATION_PLAN.md`: add Phase 9 ("CI/CD") section documenting goals + acceptance criteria so the plan reflects shipped reality.
- Optional: add CI + npm-version badges to root `README.md`.

## Manual Setup Steps (One-Time, Maintainer)

1. **npm:** Create a granular automation token at npmjs.com → Access Tokens → Granular Access Token → scope: publish on `@relements/core`. No 2FA prompt on publish from this token type.
2. **GitHub:** Settings → Secrets and variables → Actions → New repository secret → name `NPM_TOKEN`, value the token from step 1.
3. **GitHub:** Settings → Actions → General → Workflow permissions → enable "Allow GitHub Actions to create and approve pull requests" (needed so `changesets/action@v1` can open the Version Packages PR).

## Out of Scope

The following are deliberately deferred:

- **Dependabot / Renovate** — separate concern, add when dep-update fatigue starts.
- **Preview deploys / docs site CI** — no docs site exists yet.
- **Release-notes auto-posting** to Slack/Discord — no chat integration in scope.
- **Cross-OS / multi-Node test matrix** — package has no native code; expand later if a Node-version-specific bug appears.

## Acceptance Criteria

- Opening a PR triggers `ci.yml` with three parallel jobs (lint, unit-build, e2e); failures block merge.
- Pushing to `main` with a pending changeset opens or updates a "Version Packages" PR.
- Merging the "Version Packages" PR publishes `@relements/core` to npm with provenance metadata visible on npmjs.com.
- macOS contributors can update visual snapshots locally; CI uses Linux baselines without conflict.
- All workflow YAML, Changesets config, package.json updates, and `playwright.config.ts` template change are committed.
- `docs/IMPLEMENTATION_PLAN.md` documents Phase 9 (CI/CD).
