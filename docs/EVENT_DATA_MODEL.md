# SB Sommar -- Event Data Model

This document defines the structural design of event data storage.

It applies to all camps (lägerveckor).

No implementation details are included. This document defines structure
and intent only.

------------------------------------------------------------------------

## 1. File Strategy

One YAML file per camp.

Location:

/data

Example:

- 2025-06-syssleback.yaml
- 2025-08-syssleback.yaml
- 2026-06-syssleback.yaml

Each file is self-contained and independent.

------------------------------------------------------------------------

## 2. Camp Structure

Each file must contain:

- camp metadata
- events list

Nothing else.

------------------------------------------------------------------------

## 3. Camp Metadata

Required fields:

- id
- name
- location
- start_date
- end_date

Example:

    camp:
      id: 2025-08-syssleback
      name: SB Sommar Augusti 2025
      location: Sysslebäck
      start_date: 2025-08-03
      end_date: 2025-08-10

Dates must use ISO format (YYYY-MM-DD).

Camp ID must remain stable permanently.

------------------------------------------------------------------------

## 4. Event Structure

Each event must include:

Required:

- id
- title
- date
- start
- end
- location
- responsible

Optional:

- description
- link
- owner
- meta

Dates must use ISO format (YYYY-MM-DD). Time must use 24-hour format
(HH:MM).

Event IDs must be globally unique.

Events must be chronologically sortable.

------------------------------------------------------------------------

## 5. Ownership (Future-Proofing)

Ownership is not yet active functionality, but must be structurally
supported from the beginning.

Each event contains an owner object.

Structure:

    owner:
      name: ""
      email: ""

Initial state:

- Fields may be empty strings.
- Email is not yet used.
- Email is not publicly displayed.
- Ownership logic is not implemented.

This structure allows future:

- Self-editing functionality
- Token-based editing links
- Week-based session validation
- Ownership verification

Ownership design will be defined separately.

------------------------------------------------------------------------

## 6. Metadata (System Fields)

Each event contains a meta object.

Structure:

    meta:
      created_at: null
      updated_at: null

Format (when populated):

ISO datetime: YYYY-MM-DDTHH:MM:SS

Initial state:

- Fields may be null.
- Fields may be empty.
- Not required for MVP.
- Not publicly displayed.

Meta is for system integrity only.

------------------------------------------------------------------------

## 7. Full Example YAML

File: /data/2025-08-syssleback.yaml

    camp:
      id: 2025-08-syssleback
      name: SB Sommar Augusti 2025
      location: Sysslebäck
      start_date: 2025-08-03
      end_date: 2025-08-10

    events:
      - id: schack-2025-08-04-1400
        title: Schack
        date: 2025-08-04
        start: 14:00
        end: 16:00
        location: Samlingssalen
        responsible: Anna

        description: >
          Öppet parti för alla åldrar.
          Ta med eget schackbräde om du vill.

        link: null

        owner:
          name: ""
          email: ""

        meta:
          created_at: null
          updated_at: null

------------------------------------------------------------------------

## 8. Stability Rules

The data model must:

- Remain stable across years
- Be readable by humans
- Be deterministic
- Be future-compatible
- Avoid breaking structural changes

Fields may be added in future versions. Fields must not be removed
without migration plan.

------------------------------------------------------------------------

## 9. Core Principle

Event data is infrastructure.

It must survive:

- Design changes
- Generator changes
- Build changes
- AI regeneration

Structure first. Function later. Presentation never.
