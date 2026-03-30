# CI/CD Pipeline

> Complete reference for the OpenCosmos UI's continuous integration and deployment pipeline.

Last updated: 2026-02-22

---

## The "Zero-Touch" Release Workflow

**tl;dr:** You merge your feature PR. The system handles the rest.

### 1. Developer Action (Your Part)
1.  **Create Changeset:** `pnpm changeset` (select packages, bump type, add summary).
2.  **Open PR:** Push branch and open a Pull Request.
3.  **Merge:** Squash and merge to `main`. **You are done.**

### 2. System Automation (The "Consume & Publish" Loop)
The confusion often lies here: **Publishing only happens when the system sees NO changeset files.**
1.  **Consume (Pass 1):** System detects raw changeset files. It opens a "Version Packages" PR to "consume" them (Apply bumps -> Update logs -> **Delete** changeset files).
2.  **Publish (Pass 2):** System runs again, detects **no** changeset files (because they were consumed), so it **Publishes to npm**.

---

## Visual Overview

```
[USER ACTION]
  Run `pnpm changeset`
        │
        ▼
  Open Feature PR ──► CI Passes ──► Squash & Merge to `main`
                                            │
                                            ▼
[SYSTEM ACTION]
                                    Release Workflow
                                            │
                            ┌───────────────┴───────────────┐
                            ▼                               ▼
                  [Has .changeset files]           [No .changeset files]
                  "I need to apply these"          "I am ready to publish"
                            │                               │
                            ▼                               ▼
                  1. Consumes changesets          **PUBLISHES TO NPM**
                  2. Bumps package.json           (via Trusted Publishing)
                  3. Opens "Version PR"
                            │
                            ▼
                    Auto-Merge Workflow
                    approves & merges
                            │
                            ▼
                    Triggers Release Workflow
                    (Loop back to top)
```

---

## Detailed Workflows

### 1. CI (`ci.yml`)

**Trigger:** Pull requests to `main` and pushes to `main`

**What it does:**
1. Installs dependencies (`pnpm install --frozen-lockfile`)
2. Builds all packages (`pnpm build` via Turborepo)
3. Lints `@opencosmos/ui` (`pnpm --filter @opencosmos/ui lint`)
4. Typechecks `@opencosmos/ui` (`pnpm --filter @opencosmos/ui typecheck`)
5. Runs tests (`pnpm --filter @opencosmos/ui test`)
6. Checks bundle sizes (`pnpm --filter @opencosmos/ui size:check`)

**Required status check:** The `build` job is required to pass before merging to `main`.

**Concurrency:** Cancels in-progress runs when new commits are pushed to the same branch. This saves Actions minutes.

---

### 2. Release (`release.yml`)

**Trigger:** Push to `main` only (not PRs)

**Authentication:** npm Trusted Publishing via GitHub OIDC. No `NPM_TOKEN` secret is needed.

**What it does:**
- Uses [changesets/action](https://github.com/changesets/action) to manage versioning and publishing
- **If changeset files exist in `.changeset/`:** Creates a "Version Packages" PR that bumps versions in `package.json` files and updates CHANGELOGs
- **If no changeset files exist:** Runs `pnpm run release` which builds all packages and publishes to npm via `changeset publish`

**Permissions:**
```yaml
permissions:
  contents: write       # Create PRs, push branches
  pull-requests: write  # Update PRs
  id-token: write       # Required for OIDC token exchange (Trusted Publishing)
```

**How Trusted Publishing works here:**
1. `id-token: write` allows GitHub to generate an OIDC token
2. `actions/setup-node` with `registry-url: https://registry.npmjs.org` configures npm for registry auth
3. Node 24 ships npm >= 11.5.1 which supports OIDC authentication natively
4. `NPM_CONFIG_PROVENANCE: true` creates verifiable provenance attestations on each published package
5. No `NPM_TOKEN` secret needed — authentication happens automatically via OIDC

**Secret required:** `GH_TOKEN_FOR_CI` (for creating Version Packages PRs)

**Concurrency:** Only one Release workflow runs at a time per branch.

---

### 3. Auto Merge Release PR (`auto-merge.yml`)

**Trigger:** Pull requests to `main` (filtered to only `changeset-release/*` branches)

**Note:** This is the magic sauce. You will rarely see the "Version Packages" PR because this workflow merges it almost immediately.

**What it does:**
1. Enables auto-merge (squash) so it merges once CI passes

**Configuration Requirements:**
- You must add the user associated with `GH_TOKEN_FOR_CI` (e.g. yourself) to the **"Allow specific actors to bypass required pull request reviews"** list in your repository Settings > Branches > main.
- This allows the automation to merge without a second review.

**Why a PAT is required:** Merging with a PAT (`GH_TOKEN_FOR_CI`) ensures that the subsequent **Release workflow** is triggered. Merges performed by the default `GITHUB_TOKEN` do not trigger other workflows.

**Secret required:** `GH_TOKEN_FOR_CI`

---

## Release Flow (Step by Step)

### 1. Adding a new changeset (You)

```bash
pnpm changeset
```

This creates a markdown file in `.changeset/` describing the change and which packages are affected. Commit this file with your PR.

**Important:** Only reference packages that exist in the workspace. Check package names with:
```bash
pnpm ls -r --depth -1
```

Private packages (like `web`) don't need changeset entries — they get bumped automatically as dependents.

### 2. The Feedback Loop (The System)

1.  **You merge the feature PR to main** — triggers CI + Release workflows.
2.  **Release workflow** sees changeset files, creates "Version Packages" PR.
    *   *Note:* GitHub Actions bot is the author.
3.  **Auto-merge workflow** triggers on the PR and enables auto-merge.
4.  **CI runs** on the Version Packages PR.
5.  **CI passes** — GitHub auto-merges the PR.
    *   *Note:* If you look away for 2 minutes, you might miss this entirely. That's good!
6.  **Merge triggers Release workflow again** — this time no changesets exist, so it publishes:
    *   `turbo run build` — builds all packages.
    *   `changeset publish` — publishes bumped packages to npm via Trusted Publishing.
7.  **Vercel** deploys all apps from the new main commit.

### Timeline

A typical release cycle takes ~5 minutes total:
- CI build (Feature PR): ~2 minutes
- Release workflow (Create PR): ~30 seconds
- Auto-merge + CI (Version PR): ~2 minutes
- Release workflow (Publish): ~30 seconds
- Vercel deployment: ~1-2 minutes (parallel)

---

## npm Trusted Publishing Setup

Trusted Publishing uses GitHub's OIDC identity provider to authenticate with npm — no long-lived tokens to manage or rotate.

### How it works

1. GitHub Actions generates a short-lived OIDC token (`id-token: write`)
2. npm (>= 11.5.1, bundled with Node 24) exchanges the OIDC token for temporary publish credentials
3. `NPM_CONFIG_PROVENANCE: true` creates a verifiable link between each published package and its source commit

### One-time setup on npmjs.com

For each package (`@opencosmos/ui`, `@opencosmos/tokens`, `@opencosmos/mcp`):

1. Go to the package on [npmjs.com](https://www.npmjs.com) > **Settings** > **Trusted Publishers**
2. Click **Add GitHub Actions**
3. Fill in:
   - **Repository owner:** `shalomormsby`
   - **Repository name:** `opencosmos-ui`
   - **Workflow filename:** `release.yml`
   - **Environment:** *(leave blank)*
4. Save

### Requirements

- **Node.js 24** — ships with npm >= 11.5.1, which supports Trusted Publishing
- **`registry-url`** must be set in `actions/setup-node` (configured in `release.yml`)
- **`id-token: write`** permission (configured in `release.yml`)
- No `NPM_TOKEN` secret needed in GitHub repository settings

---

## Vercel Deployments

Vercel is connected directly to the GitHub repo and deploys independently of GitHub Actions.

| App | URL | Build command |
|-----|-----|---------------|
| OpenCosmos Studio | opencosmos.ai/studio | `pnpm turbo run build --filter=web` |

**Preview deployments:** Every PR gets preview URLs from Vercel automatically.

**Production deployments:** Triggered on every push to `main`.

---

## Secrets Management

All secrets are stored in GitHub repository settings under **Settings > Secrets and variables > Actions**.

| Secret | Type | Purpose | Rotation |
|--------|------|---------|----------|
| `GH_TOKEN_FOR_CI` | GitHub PAT (classic) | Create PRs, approve PRs, enable auto-merge | When expired or compromised |

### PAT permissions required for `GH_TOKEN_FOR_CI`

- `repo` (full control) — needed to create/approve PRs and push branches
- `workflow` — needed to trigger workflows from automated commits

**Note:** npm publishing no longer requires a secret. Authentication is handled automatically via Trusted Publishing (OIDC).

---

## Repository Settings

These settings must be enabled for the pipeline to work:

| Setting | Location | Required value |
|---------|----------|----------------|
| Allow auto-merge | Settings > General > Pull Requests | Enabled |
| Allow squash merging | Settings > General > Pull Requests | Enabled |
| Required status check: `build` | Settings > Rules > main | Enabled |
| Require PRs before merging | Settings > Rules > main | Enabled |

---

## Troubleshooting

### Release workflow fails with "package not in workspace"

A changeset file references a package name that doesn't match `package.json`. Check:
```bash
pnpm ls -r --depth -1  # List all workspace package names
```
Fix the changeset file to use the exact `"name"` from `package.json`.

### Auto-merge workflow fails

1. **"Auto merge is not allowed"** — Enable auto-merge in repo settings
2. **"GH_TOKEN: "** (empty) — The `GH_TOKEN_FOR_CI` secret is missing or expired. Recreate the PAT.
3. **Workflow doesn't trigger** — Reopening a PR may not trigger `pull_request` events. Close and re-create the PR, or manually run `gh pr merge --squash --auto <url>`.

### Vercel doesn't deploy

Vercel deploys are independent of GitHub Actions. Check:
1. Vercel dashboard for build logs
2. That the Vercel GitHub integration is connected
3. That the production branch is set to `main`

### npm publish fails

1. Verify Trusted Publishing is configured for the package on npmjs.com (Settings > Trusted Publishers)
2. Confirm the workflow filename matches exactly what's configured on npm (`release.yml`)
3. Check package `"access": "public"` in `.changeset/config.json`
4. Check package is not `"private": true` in its `package.json`
5. Check GitHub Actions logs for OIDC token exchange errors

### CI is slow

Turborepo caches builds. If cache misses are high:
```bash
# Clear all caches and rebuild
rm -rf .turbo packages/ui/dist apps/*/.next
pnpm build
```

---

## Architecture Decisions

### Why Trusted Publishing over npm tokens?

- **No secrets to rotate** — OIDC tokens are generated per-run, expire immediately
- **Provenance** — `NPM_CONFIG_PROVENANCE: true` creates a verifiable link between package and source
- **No token leaks** — There's no long-lived token that could be compromised
- **Audit trail** — npm shows exactly which workflow published each version

### Why Changesets over semantic-release?

- **Explicit versioning** — developers choose the bump level (patch/minor/major) per changeset
- **Batched releases** — multiple PRs can contribute changesets, released together
- **Human-readable** — changeset files are markdown, reviewable in PRs
- **Monorepo native** — designed for workspaces with inter-package dependencies

### Why auto-merge the Version Packages PR?

The Version Packages PR only changes `package.json` versions and `CHANGELOG.md` files. It's mechanical, not creative. Auto-merging it:
- Removes a manual step from every release
- Prevents the PR from going stale
- Keeps the release cycle fast

### Why squash merge?

- Keeps main branch history clean (one commit per PR)
- The Version Packages PR has a single logical change
- Feature branches retain full history if needed
