---
title: SB Sommar – Project Documentation
---

# SB Sommar – Project Documentation

This is the project documentation for [SB Sommar](https://sbsommar.se),
a Swedish summer-camp website. The pages below cover everything from
contributing edits to architecture, design, and operations.

The documentation lives in the `docs/` folder of the
[`moggleif/sbsommar`](https://github.com/moggleif/sbsommar) repository
and is published to this site automatically by GitHub Pages whenever a
change to a `docs/` file lands on `main`.

## Documentation index

| File | What it covers |
| --- | --- |
| [01-CONTRIBUTORS.md](01-CONTRIBUTORS.md) | How to contribute — content edits, developer setup, git workflow, testing |
| [02-REQUIREMENTS.md](02-REQUIREMENTS.md) | What the site must do and for whom — user, site, and API requirements |
| [03-ARCHITECTURE.md](03-ARCHITECTURE.md) | System structure, data layers, rendering logic, fallback rules |
| [04-OPERATIONS.md](04-OPERATIONS.md) | Camp lifecycle: before/during/after, deployment, disaster recovery |
| [05-DATA_CONTRACT.md](05-DATA_CONTRACT.md) | YAML schema, required fields, validation rules, ID format |
| [06-EVENT_DATA_MODEL.md](06-EVENT_DATA_MODEL.md) | Why event data is shaped the way it is — ownership, metadata, stability |
| [07-DESIGN.md](07-DESIGN.md) | Color palette, typography scale, spacing tokens, component rules |
| [08-ENVIRONMENTS.md](08-ENVIRONMENTS.md) | Local / QA / Production environments, secrets schema, this docs site |
| [09-RELEASING.md](09-RELEASING.md) | Step-by-step guide for deploying to production, rollback, release tagging |
| [99-traceability.md](99-traceability.md) | Requirements traceability matrix — every requirement, its tests, and its implementation |

## About this site

This is a read-only documentation site. To suggest a change, edit the
relevant Markdown file in the repository and open a pull request. See
[01-CONTRIBUTORS.md](01-CONTRIBUTORS.md) for the workflow.
