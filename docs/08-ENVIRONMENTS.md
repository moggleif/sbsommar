# SB Sommar – Environments

Three environments serve different stages of the development-to-production pipeline.
All environments deploy from the `main` branch.

For CI/CD workflow details, see [04-OPERATIONS.md](04-OPERATIONS.md).

---

## Overview

| Environment    | Host        | API stack | Full site deploy             | Event data deploy      | Secrets source                  |
| -------------- | ----------- | --------- | ---------------------------- | ---------------------- | ------------------------------- |
| **Local**      | localhost   | Node.js   | `npm start`                  | N/A                    | `.env` file                     |
| **QA**         | Loopia      | PHP       | Auto on push to `main`       | Auto on event PR merge | GitHub Environment `qa`         |
| **Production** | Loopia      | PHP       | Manual (`workflow_dispatch`) | Auto on event PR merge | GitHub Environment `production` |

**Key rule:** code changes reach Production only when manually triggered.
Event data reaches both QA and Production immediately — because events are
time-sensitive (camp is running).

**QA camp isolation:** A dedicated QA camp (`qa: true` in `camps.yaml`) allows
testing the full event flow without polluting production data. Production builds
and APIs filter out QA camps entirely. See `02-REQUIREMENTS.md §42`.

---

## Deploy triggers

| What changed              | QA                                | Production                         |
| ------------------------- | --------------------------------- | ---------------------------------- |
| Code (features, fixes)    | Auto — full site rebuild + deploy | Manual — `workflow_dispatch`       |
| Event data (from form)    | Auto — event pages only           | Auto — event pages only            |

---

## Event data flow

1. A participant submits an event via the form. The API validates the data (injection
   patterns, link protocol, length limits) and rejects invalid input immediately.
2. The API commits the validated event to a temporary branch and opens an auto-merge PR.
3. `event-data-deploy.yml` runs a no-op check that satisfies branch protection.
4. The PR auto-merges to `main`.
5. `event-data-deploy-post-merge.yml` triggers: two parallel jobs install
   production dependencies via `setup-node` + `npm ci --omit=dev`, build the
   site, and deploy event-data pages — one each to QA (rsync) and
   Production (SCP).
6. Each job builds with its own environment's `SITE_URL` and `API_URL` so that
   per-event page links point to the correct domain.

All environments receive event data within minutes of submission — no manual step needed.

---

## Workflows

| Workflow                  | Trigger                                                | Environment(s)       |
| ------------------------- | ------------------------------------------------------ | -------------------- |
| `ci.yml`                  | Every push and PR                                      | — (repo-level)       |
| `deploy-qa.yml`           | Push to `main` (paths-ignore data YAMLs)               | `qa`                 |
| `deploy-prod.yml`         | `workflow_dispatch` (manual)                            | `production`         |
| `event-data-deploy.yml`   | PR from `event/` or `event-edit/` changing data YAMLs  | — (no-op gate)       |
| `event-data-deploy-post-merge.yml` | Push to `main` (data YAMLs only)              | `qa` + `production`  |
| `docker-build.yml`        | Push to `main` (package.json or Dockerfile)            | — (GHCR, no longer used by event-data deploy) |

`deploy-qa.yml` and `deploy-prod.yml` both call the shared reusable workflow
`deploy-reusable.yml`, which builds the static site, deploys it via SCP,
and deploys the PHP API (with `composer install` on the server).
The only difference is the trigger and the GitHub Environment that provides
the secrets.

---

## Secrets schema

### Repository-level secrets (not environment-scoped)

| Secret     | Used by    | Purpose                                           |
| ---------- | ---------- | ------------------------------------------------- |
| `SITE_URL` | `ci.yml`   | Any valid URL — just needs to pass the build step |

### GitHub Environment: `qa` (PHP on Loopia)

| Secret            | Purpose                          |
| ----------------- | -------------------------------- |
| `SITE_URL`        | QA base URL                      |
| `API_URL`         | QA PHP API endpoint              |
| `SERVER_HOST`     | QA SSH/SCP host                  |
| `SERVER_USER`     | QA SSH username                  |
| `SERVER_SSH_KEY`  | QA SSH private key               |
| `SERVER_SSH_PORT` | QA SSH port                      |
| `DEPLOY_DIR`      | QA deploy directory              |

Example values: `SITE_URL=https://qa.sbsommar.se`,
`API_URL=https://qa.sbsommar.se/api/add-event`.

The PHP API is deployed alongside the static site via SCP. The `api/.env`
file on the server is managed manually and contains the `GITHUB_*`,
`ALLOWED_ORIGIN`, `QA_ORIGIN`, `COOKIE_DOMAIN`, and `BUILD_ENV` variables
needed by the PHP API at runtime.

### GitHub Environment: `production`

Same secret names as `qa`, but with production values:

| Secret            | Purpose                                               |
| ----------------- | ----------------------------------------------------- |
| `SITE_URL`        | Production base URL (e.g. `https://sommar.example.com`)          |
| `API_URL`         | Production API endpoint (e.g. `https://api.sommar.example.com/add-event`) |
| `SERVER_HOST`     | Production SSH/SCP host                               |
| `SERVER_USER`     | Production SSH username                               |
| `SERVER_SSH_KEY`  | Production SSH private key                            |
| `SERVER_SSH_PORT` | Production SSH port                                   |
| `DEPLOY_DIR`      | Production deploy directory                           |

---

## GitHub Environments setup guide

After merging the environment management changes, set up GitHub Environments:

1. Go to the repository on GitHub.
2. Open **Settings > Environments**.
3. Click **New environment**, name it `qa`, and click **Configure environment**.
4. Under **Environment secrets**, add each secret from the `qa` table above.
5. Click **New environment** again, name it `production`, and click **Configure environment**.
6. Under **Environment secrets**, add each secret from the `production` table above.
7. Optionally, under **Environment protection rules** for `production`, add:
   - **Required reviewers** — to require approval before production deploys.
   - **Wait timer** — to add a delay before the deploy runs.
8. Verify that `SITE_URL` also exists as a **repository-level** secret (Settings > Secrets and variables > Actions > Repository secrets). This is used by `ci.yml` for build validation.

---

## Local development

Local development uses a `.env` file for all environment variables.
See `.env.example` for the full list of variables and their descriptions.

The `.env` file is ignored by git and is never committed.
Without `API_URL` set, the built form will have no submit endpoint — this is
expected for local builds that only need to test the static site.
