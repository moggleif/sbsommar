# SB Sommar

SB Sommar is a family camp in Sysslebäck for particularly gifted children, young people, and their parents.

This is the camp's official website — the single place where families find everything they need to understand, trust, and decide to attend.

---

## The Camp

SB Sommar is not a standard summer camp. It is a community week for families who often feel out of place elsewhere.

It offers:

- A safe and welcoming environment where gifted children meet peers
- Space for parents to connect with others who share the same experiences
- Participant-driven activities — the schedule is built by those attending
- Shared meals, shared time, shared experiences
- A week where being different is completely normal

The camp takes place in Sysslebäck, a small and peaceful location that sets the tone for the whole week.

---

## The Problem This Site Solves

Families considering the camp need to make a real decision. They need to understand what they are signing up for, whether it is right for their child, what it costs, and what to practically expect.

Without clear information, families hesitate or drop out. With it, they arrive prepared and confident.

This site replaces scattered emails, outdated PDFs, and word-of-mouth with one complete and trustworthy source of information.

---

## What the Site Provides

- Who the camp is for and what makes it different
- Dates, location, and how to get there
- Registration process and deadlines
- Pricing and what is included
- Accommodation and food
- Camp rules and practical preparation
- Frequently asked questions
- Testimonials from previous participants
- The live activity schedule for the current camp week
- A form where participants add their own activities during camp

Everything in one place. Updated before every camp. Easy to navigate on any device.

---

## The Activity Schedule

One of the site's most-used features during camp week is the live activity schedule.

Participants can view the full **weekly overview**, a focused **daily view**, and a simplified **Today view** designed for mobile phones and shared display screens. Each activity shows its time, location, and who is responsible. Clicking an activity reveals the full description and any communication link.

Participants sign up to lead activities — a chess tournament, a hike, a film screening, a workshop — and add them directly through the site. The schedule updates within minutes. No admin needed. No emails back and forth.

This reflects the camp's philosophy: the participants shape the week.

---

## Tone and Principles

The site is written for families, not for organizations.

Warm but structured. Calm and trustworthy. Clear and precise. In Swedish.

No hype. No corporate language. No complexity.

> If a parent visits for the first time, they should leave feeling:
> *"I understand what this is. I know how it works. And I feel comfortable taking the next step."*

---

## For Developers

### Quick Start

Requires Node.js 18 or later.

```bash
npm install
npm run build
npm start          # http://localhost:3000
```

The project has two parts: a **static site** generated at build time from YAML and Markdown, and a small **API server** (`app.js`) that handles event submissions by committing directly to GitHub and triggering an automated rebuild and deploy.

Start by reading [docs/01-CONTRIBUTORS.md](docs/01-CONTRIBUTORS.md). It covers setup, git workflow, linting, and testing. The rest of the documentation is listed below in suggested reading order.

### Documentation

| # | Doc | What it covers |
| - | --- | -------------- |
| 1 | [docs/01-CONTRIBUTORS.md](docs/01-CONTRIBUTORS.md) | Setup, git workflow, linting, testing, contribution rules |
| 2 | [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) | System structure, data layers, rendering logic, API server |
| 3 | [docs/03-OPERATIONS.md](docs/03-OPERATIONS.md) | Commands, camp lifecycle, deployment, disaster recovery |
| 4 | [docs/04-DATA_CONTRACT.md](docs/04-DATA_CONTRACT.md) | YAML schema, required fields, ID format, stability policy |
| 5 | [docs/05-EVENT_REQUIREMENTS.md](docs/05-EVENT_REQUIREMENTS.md) | Schedule views and event behaviour requirements |
| 6 | [docs/06-EVENT_DATA_MODEL.md](docs/06-EVENT_DATA_MODEL.md) | Event field definitions, ownership, and metadata |
| 7 | [docs/07-DESIGN.md](docs/07-DESIGN.md) | Colors, typography, spacing tokens, component rules |
