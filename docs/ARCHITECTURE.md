# SB Sommar – Architecture Overview

This document describes the architectural philosophy of the SB Sommar website.

The goal is long-term stability with the ability to adjust design when needed,
without changing the core system.

The website is updated approximately once per year.

---

# 1. Guiding Philosophy

SB Sommar is built on three principles:

1. Stability
2. Simplicity
3. Regenerability

The core should remain stable for many years.
The presentation layer may evolve.

AI may assist in redesigning or refining the presentation,
but the underlying structure must remain predictable and durable.

---

# 2. Architectural Layers

The system is divided into three clearly separated layers:

DATA  
CONTENT  
PRESENTATION  

Each layer has a specific responsibility.

---

# 3. Data Layer (Stable Core)

The data layer contains structured information required for functionality.

Examples:
- Events
- Locations

This layer:

- Is machine-readable
- Has strict structure
- Is validated
- Is the single source of truth
- Does not contain design decisions

This layer should rarely change in structure.

It must remain consistent year after year.

---

# 4. Content Layer (Human Information)

The content layer contains informational text such as:

- Overview
- FAQ
- Rules
- Food information
- Pricing
- Practical information

This layer:

- Is written in simple structured text
- Contains no layout instructions
- Contains no styling
- Contains no structural HTML

Its purpose is semantic clarity only.

AI may rewrite, restructure or improve this content,
but must not mix presentation into it.

---

# 5. Presentation Layer (Adjustable)

The presentation layer defines:

- Layout
- Visual structure
- Typography
- Colors
- Responsiveness
- Screen display mode

This layer may evolve over time.

It must:

- Never redefine data structure
- Never embed business logic
- Never duplicate event data
- Never change the core model

Design changes should not require changing data or content format.

---

# 6. Event Handling Core

The event system is a functional core of the site.

It must:

- Read structured event data
- Validate required fields
- Sort events chronologically
- Generate:
  - Weekly schedule
  - Daily schedule
  - “Today” view
  - Display mode view
  - RSS feed
  - Future archive pages

This logic should be stable across years.

It is infrastructure, not design.

---

# 7. AI Usage Strategy

AI is used as:

- A design assistant
- A layout refiner
- A content improver

AI is NOT:

- Part of runtime
- Part of the build system
- A required dependency for deployment

The system must be reproducible without AI.

AI can regenerate presentation.
AI must not redefine core structure.

---

# 8. Update Philosophy (Yearly Update Model)

Because the site is updated once per year:

- Dependencies must be minimal.
- The system must not rely on fragile ecosystems.
- Build complexity must be low.
- Documentation must be clear.

The goal is that in five years,
the system can still be understood in one hour.

---

# 9. Long-Term Stability Rules

The following must remain stable:

- Data format
- Folder structure
- Core event validation logic
- Build process
- Deployment flow

The following may change:

- CSS
- Layout
- Visual hierarchy
- Interaction refinements

---

# 10. Core Principle

Content is infrastructure.  
Data is authority.  
Design is replaceable.

The system must remain simple enough that:

- It can be regenerated.
- It can be redesigned.
- It can be understood quickly.
- It does not depend on trends.

Clarity before complexity.
Structure before aesthetics.
Stability before innovation.
