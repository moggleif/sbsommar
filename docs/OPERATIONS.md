# SB Sommar – Operations Guide

How to develop, run, and deploy the site.

---

## Architecture overview

The project runs as a Node.js server.

| Layer | Location | Role |
|-------|----------|------|
| Data | `data/*.yaml` | Single source of truth for all events |
| Build | `source/build.js` | Generates HTML from data |
| Server | `source/server.js` | Serves `public/` and handles the add-event API |
| Output | `public/` | Generated HTML + static CSS/JS |

The server (`source/server.js`) does two things:

1. Serves the built static files from `public/`.
2. Handles `POST /api/events`, which appends the new event to the active camp
   YAML and triggers a rebuild. Participants add activities directly — no
   admin step needed.

---

## Local development

### Prerequisites

- Node.js 18 or later
- npm

### First-time setup

```bash
npm install
npm run build
npm start
```

The site is available at <http://localhost:3000>.

The port can be overridden:

```bash
PORT=8080 npm start
```

### Rebuilding manually

If you edit a YAML data file directly (e.g. to correct an event), rebuild:

```bash
npm run build
```

The server does not need to be restarted after a rebuild — it reads files
fresh on each request.

### Other commands

```bash
npm test          # Run tests
npm run lint      # Lint JavaScript
npm run lint:md   # Lint Markdown
```

---

## Data files

Event data lives in `data/`. One YAML file per camp.

Which camp is active is determined by `data/camps.yaml`:

- If any camp has `active: true`, that camp is used.
- If none does, the camp with the most recent `start_date` is used.

Events are sorted chronologically at build time, so their order in the
YAML file does not matter. New events submitted through the form are
appended to the end of the file.

---

## Production deployment

### Why FTP hosting is no longer enough

The previous `deploy.yml` uploaded only `public/` via FTP. That worked
when the site was fully static.

It no longer works. The server is a persistent Node.js process that writes
to `data/*.yaml` and rebuilds HTML on demand. It needs:

- A host that can run a long-lived Node.js process.
- A writable filesystem (the server modifies data files in place).

### Suitable hosting options

| Option | Notes |
|--------|-------|
| VPS (DigitalOcean, Hetzner, Linode, etc.) | Full control. Run with PM2 or systemd. |
| [Railway](https://railway.app) | Simple. Connects to GitHub, auto-deploys on push. |
| [Fly.io](https://fly.io) | Good persistent apps. Needs a `fly.toml`. |
| [Render](https://render.com) | Free tier available. Auto-deploys from Git. |

Traditional shared web hosting (FTP only) is not suitable.

### What must be present on the server

```text
data/          ← YAML source files (must be writable at runtime)
source/        ← Server and build scripts
public/        ← Generated output (written by build at startup)
package.json
node_modules/  ← Run npm install on the server or in CI
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the HTTP server listens on |

### Production startup

```bash
npm install --omit=dev
npm run build
npm start
```

For production, wrap with a process manager so the server restarts
automatically on crash or reboot. Example using PM2:

```bash
npm install -g pm2
pm2 start source/server.js --name sbsommar
pm2 save
pm2 startup
```

---

## CI/CD state

| Workflow | Status | Notes |
|----------|--------|-------|
| `ci.yml` | Works | Runs lint, tests, build on every push |
| `deploy.yml` | Outdated | Uploads only `public/` via FTP — must be replaced |

`deploy.yml` needs to be replaced with a step that deploys the full server
to a Node.js-capable host. Until that is done, production deployments must
be done manually.

---

## Camp lifecycle

### Before camp

1. Create a new YAML file in `data/` (e.g. `2026-06-syssleback.yaml`).
2. Add the camp entry in `data/camps.yaml` with `active: true`.
3. Set the previous camp to `active: false`.
4. Add a `locations:` list under `camp:` in the new file.
5. Run `npm run build` to verify.
6. Deploy.

Minimal camp file structure:

```yaml
camp:
  id: 2026-06-syssleback
  name: SB Sommar Juni 2026
  location: Sysslebäck
  start_date: '2026-06-28'
  end_date: '2026-07-05'
  locations:
    - Servicehus
    - GA Idrott
    - Annat
events: []
```

### During camp

Participants add events through the web form at `/lagg-till.html`.
Events are written directly to the active camp YAML and the schedule is
rebuilt immediately. No manual admin step is needed.

An admin can also edit the YAML file directly on the server and run
`npm run build` to fix or remove entries.

### After camp

1. Set `active: false` for the camp in `data/camps.yaml`.
2. Set `archived: true`.
3. Commit the final YAML file to Git (it is the permanent archive).
4. Deploy. The next most recent camp (or the newly active one) is now shown.

Only one camp should have `active: true` at a time.

---

## Disaster recovery

If an event is incorrectly added or needs to be removed:

1. Open the active camp YAML on the server.
2. Find and delete the event entry.
3. Run `npm run build`.

Git history provides a full audit trail of all manually committed changes.
Events added through the form are appended to the YAML and are visible in
the Git diff next time the file is committed.
