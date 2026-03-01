# Releasing to Production

How to deploy the site to production. This guide assumes your changes are
already merged to `main` and verified on QA.

For background on environments and secrets, see
[08-ENVIRONMENTS.md](08-ENVIRONMENTS.md).

---

## Before you start

- [ ] Your PR is merged to `main`.
- [ ] CI passed on the merge commit (check the Actions tab).
- [ ] QA deploy completed (the "Deploy to QA" workflow shows green).
- [ ] You have verified your changes on the QA site in a browser.

If any of these are not true, fix them first. Do not deploy broken code
to production.

---

## Step 1 — Verify QA

Open the QA site and check that:

- The pages you changed look correct.
- Any new functionality works as expected.
- The schedule, today view, and form are not broken.

This is a manual check. There is no automated QA gate beyond CI.

---

## Step 2 — Trigger the production deploy

### Option A: GitHub web UI

1. Go to the repository on GitHub.
2. Click the **Actions** tab.
3. In the left sidebar, click **Deploy to Production**.
4. Click **Run workflow** (top right).
5. Select the `main` branch (default).
6. Click **Run workflow**.

### Option B: GitHub CLI

```bash
gh workflow run "Deploy to Production"
```

After triggering, the workflow pauses and waits for approval from a
[required reviewer](08-ENVIRONMENTS.md#production-approvers).

---

## Step 3 — Approve the deploy

If you are a required reviewer:

### GitHub web UI

1. Go to the **Actions** tab.
2. Open the running "Deploy to Production" workflow.
3. Click **Review deployments**.
4. Select the `production` environment and click **Approve and deploy**.

### GitHub CLI

```bash
gh run list --workflow="Deploy to Production" --limit 1
```

Note the run ID, then:

```bash
gh run view <run-id>
```

Approval must be done in the web UI — the CLI does not support approving
environment deployments.

---

## Step 4 — Verify production

Once the workflow completes (typically under 2 minutes):

- [ ] Open the production site and verify it loads.
- [ ] Check the pages you changed.
- [ ] Test the activity form if API changes were included.
- [ ] Confirm the schedule renders correctly.

---

## Rollback

If something is wrong on production after a deploy:

### Quick rollback — redeploy the previous version

1. Find the last known good commit on `main`:

   ```bash
   git log --oneline -10
   ```

2. If the problem was introduced in the latest merge, revert it:

   ```bash
   git revert <merge-commit-hash>
   git push
   ```

3. After the revert merges, trigger a new production deploy (Step 2 above).

### Server-side rollback

The deploy uses a zero-downtime swap. The previous release is kept on the
server as a backup directory. If you have SSH access, you can swap back
manually — but prefer the git revert approach when possible.

---

## Release tags (optional)

Tags are not required for every deploy. Use them to mark milestones —
major launches, end-of-camp snapshots, or significant feature releases.

### Creating a release

```bash
git checkout main
git pull
git tag v1.0.0
git push origin v1.0.0
```

Then create a GitHub Release:

```bash
gh release create v1.0.0 --title "v1.0.0" --notes "First production release."
```

### Versioning convention

Use [semantic versioning](https://semver.org/):

- **Patch** (`v1.0.1`) — bug fixes, text corrections, small tweaks.
- **Minor** (`v1.1.0`) — new features, new pages, new form fields.
- **Major** (`v2.0.0`) — breaking changes, major redesigns.

Tags do not affect deployment. They are bookmarks in the git history.

---

## Summary

```text
Merge to main
  → CI passes
  → QA auto-deploys
  → You verify on QA
  → You trigger "Deploy to Production"
  → Approver approves
  → Production deploys
  → You verify on production
```

For event data submitted via the form, both QA and Production update
automatically — no manual step needed.
