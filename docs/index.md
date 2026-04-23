---
title: Project Documentation
---

# Project Documentation

> **📦 Source:**
> [moggleif/sbsommar](https://github.com/moggleif/sbsommar)
> · [README](https://github.com/moggleif/sbsommar#readme)
> · [Issues](https://github.com/moggleif/sbsommar/issues)

This is the developer-facing documentation for a static-site project.
Start with the [README](https://github.com/moggleif/sbsommar#readme)
on GitHub for project context, then use the index below to dive into
contribution rules, architecture, data contracts, design tokens,
environments, releasing, and the full requirements traceability matrix.

## Documentation index

| File | What it covers |
| --- | --- |
| [01-CONTRIBUTORS.md](01-CONTRIBUTORS.md) | Contribution guidelines, git workflow, setup, linting |
| [02-REQUIREMENTS.md](02-REQUIREMENTS.md) | What the system must do — user, site, and API requirements |
| [03-ARCHITECTURE.md](03-ARCHITECTURE.md) | System structure, data layers, rendering logic, fallback rules |
| [04-OPERATIONS.md](04-OPERATIONS.md) | Operational lifecycle, deployment, disaster recovery |
| [05-DATA_CONTRACT.md](05-DATA_CONTRACT.md) | YAML schema, required fields, validation rules, ID format |
| [06-EVENT_DATA_MODEL.md](06-EVENT_DATA_MODEL.md) | Why event data is shaped the way it is — ownership, metadata, stability |
| [07-DESIGN.md](07-DESIGN.md) | Color palette, typography scale, spacing tokens, component rules |
| [08-ENVIRONMENTS.md](08-ENVIRONMENTS.md) | Local / QA / Production environments, secrets schema, this docs site |
| [09-RELEASING.md](09-RELEASING.md) | Step-by-step guide for deploying to production, rollback, release tagging |
| [99-traceability.md](99-traceability.md) | Requirements traceability matrix — every requirement, its tests, and its implementation |

## About this site

This documentation site is intentionally hidden from search engines:
it is served with a `Disallow: /` `robots.txt` and every rendered
page emits a `<meta name="robots" content="noindex, nofollow">` tag.
Reach it through a direct link only.

To suggest a change, edit the relevant Markdown file in the repository
and open a pull request — see
[01-CONTRIBUTORS.md](01-CONTRIBUTORS.md) for the workflow.
