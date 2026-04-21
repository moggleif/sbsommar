# SB Sommar – Design Specification

Visual design reference for SB Sommar. Inspired by sbsommar.se, the live production site.
This document is the single source of truth for design decisions.

All CSS must use the custom properties defined in §7. Do not hardcode colors, spacing, or typography values. <!-- 07-§7.1 -->

---

## 1. Design Philosophy

- Warm, welcoming, outdoorsy feel — not corporate or sterile. <!-- 07-§1.1 -->
- Earth tones and natural colors that evoke summer, forest, and water. <!-- 07-§1.2 -->
- Clean and readable. Content first. <!-- 07-§1.3 -->
- Fast and lightweight. No decorative excess. <!-- 07-§1.4 -->

---

## 2. Color Palette

| ID | Name | Hex | Use |
| --- | --- | --- | --- |
| `07-§2.1` | Terracotta | `#C76D48` | Primary accent, buttons, links, highlights |
| `07-§2.2` | Sage green | `#ADBF77` | Secondary accent, section headers, tags |
| `07-§2.3` | Cream | `#F5EEDF` | Page background, warm neutral base |
| `07-§2.4` | Navy | `#192A3D` | Main headings, strong contrast |
| `07-§2.5` | Charcoal | `#3B3A38` | Body text, muted dark |
| `07-§2.6` | White | `#FFFFFF` | Cards, content blocks, contrast surfaces |
| `07-§2.8` | Cream light | `#FAF7EF` | Countdown background, lighter cream variant |

Avoid bright or saturated colors outside this palette. The warmth comes from restraint. <!-- 07-§2.7 -->

---

## 3. Typography

### Font families

- **Headings**: System sans-serif stack, or a single humanist sans-serif web font if added later.
  Fallback: `system-ui, -apple-system, sans-serif` <!-- 07-§3.1 -->
- **Body**: Same sans-serif stack. Clean and readable. <!-- 07-§3.2 -->
- **Pull quotes / callouts**: Georgia, serif. Adds warmth and character in small doses. <!-- 07-§3.3 -->

### Scale

| ID | Element | Size | Weight | Color | Notes |
| --- | --- | --- | --- | --- | --- |
| `07-§3.4` | H1 | 40px | 700 | `#C76D48` | Page titles, hero heading |
| `07-§3.5` | H2 | 35px | 700 | `#C76D48` | Section headings |
| `07-§3.6` | H3 | 30px | 700 | `#C76D48` | Sub-section headings |
| `07-§3.7` | Body | 16px | 400 | `#3B3A38` | All running text |
| `07-§3.8` | Small / meta | 14px | 400 | `#3B3A38` | Dates, labels, captions |
| `07-§3.9` | Pull quote | 25px | 600 | `#3B3A38` | Georgia serif, italic |
| `07-§3.10` | Nav links | 12px | 700 | varies | Uppercase, spaced out |

Line height for body text: `1.65`. Generous — makes Swedish long-form text comfortable to read. <!-- 07-§3.11 -->

---

## 4. Layout & Spacing

### Containers

| ID | Type | Max-width | Use |
| --- | --- | --- | --- |
| `07-§4.1` | Wide | `1290px` | Full layout, header, hero |
| `07-§4.2` | Narrow | `750px` | Reading sections, articles |

Container is centered with `margin: 0 auto` and horizontal padding on small screens. <!-- 07-§4.3 -->

### Spacing rhythm

Base unit: `8px`. Spacing values are multiples of this. <!-- 07-§4.4 -->

| ID | Token name | Value | Use |
| --- | --- | --- | --- |
| `07-§4.5` | `space-xs` | 8px | Tight gaps, icon padding |
| `07-§4.6` | `space-sm` | 16px | Between inline elements |
| `07-§4.7` | `space-md` | 24px | Card padding, form fields |
| `07-§4.8` | `space-lg` | 40px | Between sections within a page |
| `07-§4.9` | `space-xl` | 64px | Between major page sections |
| `07-§4.10` | `space-xxl` | 96px | Hero padding, page top/bottom |

### Grid

- Desktop: up to 3 columns for cards/testimonials. <!-- 07-§4.11 -->
- Tablet: 2 columns. <!-- 07-§4.12 -->
- Mobile: 1 column. <!-- 07-§4.13 -->
- Use CSS Grid. No grid framework. <!-- 07-§4.14 -->

---

## 5. Responsive Breakpoints

| ID | Breakpoint | Width | Description |
| --- | --- | --- | --- |
| `07-§5.1` | Desktop | > 1000px | Full layout, side-by-side columns |
| `07-§5.2` | Tablet | 690–999px | 2-column grids, condensed header |
| `07-§5.3` | Mobile | < 690px | Single column, stacked layout |

---

## 6. Components

### Header / Navigation

- Full-width, fixed or sticky at top. <!-- 07-§6.1 -->
- Height: `120px` desktop, `70px` mobile. <!-- 07-§6.2 -->
- Background: white or cream, with a subtle bottom border or shadow. <!-- 07-§6.3 -->
- Logo on the left. Navigation links on the right. <!-- 07-§6.4 -->
- Nav links: uppercase, `12px`, `700` weight, spaced with `letter-spacing: 0.08em`. <!-- 07-§6.5 -->
- Active/hover: sage-hover green (`var(--color-sage-hover)`) color shift. <!-- 07-§6.6 -->
- Mobile: hamburger button toggles a dropdown panel containing all links. <!-- 07-§6.7 -->
- Desktop (≥ 768 px): hamburger hidden, all links visible in two rows. <!-- 07-§6.16-impl -->
- Row 1: main page links (uppercase, `13px`, `700`, `letter-spacing: 0.06em`,
  `color: var(--color-terracotta)`, sage-hover green on active/hover). <!-- 07-§6.17-impl -->
- Row 2: section anchor links (no text-transform, `11px`, `700`,
  `color: var(--color-terracotta)`, sage-hover green on hover). <!-- 07-§6.18-impl -->
- Two rows separated by a `1px` rule in `rgba(0,0,0,0.06)`. <!-- 07-§6.19-impl -->
- Mobile panel: `background: var(--color-terracotta)`, white text,
  `z-index: 100`. Fully rounded corners (`--radius-lg`), horizontal inset
  margins so it appears as a floating card. <!-- 07-§6.20-impl -->
- Mobile hamburger button: `background: var(--color-terracotta)`, white icon
  bars, `border-radius: var(--radius-md)`. <!-- 07-§6.21-impl -->
- Mobile menu hierarchy: page links at `15px` / `700` / `opacity: 0.9`;
  section links at `12px` / uppercase / `opacity: 0.6`. Separated by a
  `2px solid rgba(255,255,255,0.3)` rule. <!-- 07-§6.22-impl -->
- Mobile menu transition: `max-height` animation, `250ms ease`. <!-- 07-§6.23-impl -->
- Navigation bar is `position: sticky; top: 0` on all viewports so it
  remains visible when scrolling. A negative `margin-top` equal to `body`
  padding-top pulls the bar up, and an equal `padding-top` compensates, so
  the bar content stays at the same vertical position in both normal flow
  and stuck mode — no visible jump. <!-- 07-§6.24-impl -->
- `html` has `scroll-padding-top` set to account for the sticky navigation
  height, so anchor-link targets are not hidden behind the bar. <!-- 07-§6.25-impl -->

### Hero Section

- Two-column layout on desktop: image area (~2/3) and sidebar panel (~1/3).
  On mobile (<690px), stacks vertically. <!-- 07-§6.8 -->
- A terracotta H1 title "Sommarläger i Sysslebäck" sits above the image
  column, left-aligned. <!-- 07-§6.9 -->
- Image has rounded corners using `--radius-lg` (16px) and uses
  `object-fit: cover`. <!-- 07-§6.10 -->
- The sidebar contains Discord and Facebook icons (~64px), vertically
  centered, followed by a countdown widget. <!-- 07-§6.11 -->
- The countdown shows a large number and "Dagar kvar" label inside a
  subtle cream/sand rounded container. <!-- 07-§6.11a -->
- The countdown background is `#FAF7EF` (near-white cream), solid — not
  semi-transparent. <!-- 07-§6.11b -->
- The sidebar is vertically centered alongside the hero image. <!-- 07-§6.11c -->

### Hero Action Buttons

- A row of pill-shaped action buttons appears below the hero image when
  the camp editing period is active. <!-- 07-§6.78 -->
- Three buttons: **Schema**, **Idag**, **Lägg till aktivitet**, linking
  to `schema.html`, `idag.html`, `lagg-till.html`. <!-- 07-§6.79 -->
- Background: `var(--color-terracotta)` (`#C76D48`), text white, `700`
  weight, `border-radius: 999px`, `padding: 10px 24px`. <!-- 07-§6.80 -->
- Hover: darken background to `#b35e3a`, `200ms ease`
  transition. <!-- 07-§6.81 -->
- The row is centred within the hero container using `display: flex;
  justify-content: center; gap: var(--space-sm)`. <!-- 07-§6.82 -->
- On mobile the buttons wrap and remain centred. <!-- 07-§6.83 -->
- Visibility is controlled by inline client-side JS that reads
  `data-opens` / `data-closes` attributes and toggles the `hidden`
  attribute. <!-- 07-§6.84 -->

### Registration Banners

- A vertical stack of banners appears directly below the hero image when
  one or more non-archived camps have an active registration window. <!-- 07-§6.89 -->
- One banner per camp, ordered by `start_date` ascending (closest camp
  on top). <!-- 07-§6.90 -->
- Each banner is a full-width `<a>` card with a terracotta left border
  accent (`border-left: 4px solid var(--color-terracotta)`), background
  `var(--color-cream-light)`, `border-radius: var(--radius-md)`,
  `padding: var(--space-sm) var(--space-md)`. <!-- 07-§6.91 -->
- Banner title: `700` weight, `color: var(--color-terracotta)`,
  `font-size: var(--font-size-base)`. <!-- 07-§6.92 -->
- Banner meta line: `font-size: var(--font-size-small)`,
  `color: var(--color-charcoal)`, displayed on its own line beneath the
  title. <!-- 07-§6.93 -->
- Container (`.hero-registration-banners`): `display: flex;
  flex-direction: column; gap: var(--space-sm)`, centred within the hero
  container width. <!-- 07-§6.94 -->
- Hover: background shifts to
  `color-mix(in srgb, var(--color-terracotta) 6%, var(--color-cream-light))`,
  `200ms ease`, no scale transform. <!-- 07-§6.95 -->
- Focus-visible: standard outline
  (`2px solid var(--color-terracotta); outline-offset: 2px`). <!-- 07-§6.96 -->
- Visibility is controlled by the same inline client-side JS as Hero
  Action Buttons: banners stay `hidden` outside the window defined by
  `data-opens` / `data-closes`. <!-- 07-§6.97 -->

### Registration CTA (in the anmälan section)

- The "Hur anmäler jag oss?" section carries a single prominent "Anmäl
  er här" call-to-action button injected by the build-time renderer, not
  authored in markdown. <!-- 07-§6.98 -->
- The button reuses `.btn-primary` styling (terracotta background, white
  text). <!-- 07-§6.99 -->
- Wrapper `.registration-cta` — `display: block; margin: 0 0
  var(--space-md) 0`: the button sits on its own line directly under
  the "Hur anmäler jag oss?" heading. <!-- 07-§6.100 -->
- `.registration-cta-btn` — `display: inline-block; text-decoration:
  none`: the button is sized to its own content. Same layout on
  desktop and mobile — no float, no breakpoint-dependent width
  change. <!-- 07-§6.101 -->
- The CTA opens the external registration service in a new tab
  (`target="_blank"`, `rel="noopener noreferrer"`). <!-- 07-§6.102 -->

### Buttons

- Min height: `40px`. <!-- 07-§6.12 -->
- Padding: `10px 24px`. <!-- 07-§6.13 -->
- Border-radius: `4px` (subtle, not fully rounded). <!-- 07-§6.14 -->
- **Primary**: Background `#C76D48`, text white, no border. <!-- 07-§6.15 -->
- **Secondary**: Border `#C76D48`, text `#C76D48`, transparent background. <!-- 07-§6.16 -->
- Hover: darken background by ~10%, smooth transition `200ms ease`. <!-- 07-§6.17 -->
- Font: same as body, `700` weight, `14–16px`. <!-- 07-§6.18 -->
- **Destructive**: Border `var(--color-error, #b91c1c)`, text
  `var(--color-error, #b91c1c)`, transparent background. Same sizing
  and font rules as secondary. Hover: background
  `var(--color-error, #b91c1c)`, text white. <!-- 07-§6.85 -->

### Cards (info blocks, testimonials)

- Background: white `#FFFFFF`. <!-- 07-§6.19 -->
- Border-radius: `6px`. <!-- 07-§6.20 -->
- Box shadow: `0 4px 12px rgba(0, 0, 0, 0.04)`. <!-- 07-§6.21 -->
- Padding: `24px`. <!-- 07-§6.22 -->
- Testimonial cards: circular profile image (`border-radius: 50%`, ~`60px`). <!-- 07-§6.23 -->
- Testimonial card layout: header row (image + name) above blockquote.
  `.testimonial-card` wraps each testimonial, constrained to
  `--container-narrow`. <!-- 07-§6.76 -->
- The testimonial card structure is generated at build time by splitting
  the Markdown output on h3 tags. Content Markdown files are unchanged. <!-- 07-§6.77 -->

### Accordion (FAQ)

- Header: sage green `#ADBF77` background, dark text. <!-- 07-§6.24 -->
- Body: cream `#F5EEDF` or white background. <!-- 07-§6.25 -->
- Toggle icon: `+` / `−` or a chevron. <!-- 07-§6.26 -->
- Animate open/close with CSS `max-height` transition. <!-- 07-§6.27 -->
- No JavaScript framework — plain JS or CSS-only if feasible. <!-- 07-§6.28 -->

### Section headings

- H2 with a short decorative sage-green line (`48px × 3px`) underneath,
  via `::after` pseudo-element. <!-- 07-§6.29 -->
- Or: a sage-green label above the heading at `12px` uppercase. <!-- 07-§6.30 -->

### Alternating section backgrounds

- Every other content section (starting from the second) receives a
  `--color-cream-light` background that stretches edge-to-edge across the
  viewport, creating horizontal colour bands. Uses the full-bleed technique
  (`margin-left: calc(-50vw + 50%)` etc.) to break out of the body
  container. `html` has `overflow-x: hidden` to prevent scrollbar from the
  `100vw` calculation. Class: `.section-alt`. <!-- 07-§6.78 -->
- The first section (`section-first`) is excluded from alternation. <!-- 07-§6.79 -->
- Alternating sections suppress the default `border-top` divider. <!-- 07-§6.80 -->

### Back-to-top link

- A "Till toppen" link is the last item in the navigation, inside the
  nav-menu so it is part of the mobile hamburger panel. <!-- 07-§6.81 -->
- Styled as a subtle nav link on desktop; inside the terracotta menu
  panel on mobile. <!-- 07-§6.82 -->

### Event / schedule items

- Clear time display: bold start time, lighter end time. <!-- 07-§6.31 -->
- Location as small text below. <!-- 07-§6.32 -->

### Display sidebar — portrait layout

`/live.html` is optimised for portrait-orientation screens (e.g. 1080 × 1920 px). The heading moves into the sidebar so events use the full available height from the top of the page. <!-- 07-§6.44 -->

- Layout: two columns. Events column `flex: 3`; sidebar `flex: 1` (~75 % / 25 %). <!-- 07-§6.45 -->
- The heading (`h1#today-heading`) sits at the top of the sidebar. It shows only the current day and date; no page-title prefix. <!-- 07-§6.46 -->
- Sidebar heading: sage green (`var(--color-sage)`), `22px`, `700`, line-height `1.2`, margin-bottom `var(--space-sm)`. <!-- 07-§6.47 -->
- Display-mode event rows are compact: `font-size: 13px`, reduced vertical padding (`6px` top/bottom). <!-- 07-§6.48 -->

### Display sidebar status widget

The sidebar of `/live.html` shows a compact status widget above the descriptive text and QR code.

- The widget contains a live clock (current time, updated every second) and a line showing when events were last updated. <!-- 07-§6.40 -->
- Clock text: sage green (`var(--color-sage)`), `48px`, `700` weight, tabular-nums, line-height `1`. <!-- 07-§6.41 -->
- Update time text: `12px`, muted white (`rgba(255,255,255,0.4)`), block, margin-top `var(--space-xs)`. <!-- 07-§6.42 -->
- The widget sits above the existing sidebar text and QR code, separated by `var(--space-md)` margin-bottom. <!-- 07-§6.43 -->

### Form field errors (inline)

Per-field validation errors appear directly below the input they relate to. <!-- 07-§6.34 -->

- Each `.field` div may contain a `<span class="field-error">` after the input element. <!-- 07-§6.35 -->
- Error text: `14px`, `var(--color-terracotta)`. <!-- 07-§6.36 -->
- Invalid inputs receive a terracotta bottom border (`2px solid var(--color-terracotta)`) via `aria-invalid="true"`. <!-- 07-§6.37 -->
- Each error span is linked to its input with `aria-describedby` so screen readers announce the error in context. <!-- 07-§6.38 -->
- On successful revalidation (next submit attempt), the error text is removed, `aria-invalid` is cleared, and the border returns to normal. <!-- 07-§6.39 -->

### Form field info messages (inline)

Per-field informational messages (non-error) appear below the input, reusing
the same `<span>` element as errors but with a different class. <!-- 07-§6.44a -->

- The `.field-info` class provides non-error informational feedback. <!-- 07-§6.44b -->
- Info text color: `var(--color-charcoal)`. <!-- 07-§6.44c -->
- Info background: `color-mix(in srgb, var(--color-sage) 20%, var(--color-cream))`. <!-- 07-§6.44d -->
- Info left border: `3px solid var(--color-sage)`. <!-- 07-§6.44e -->
- Info does **not** set `aria-invalid` on the input — the input border remains normal. <!-- 07-§6.44f -->
- When switching between error and info states, the previous class must be removed (toggle `span.className` between `field-error` and `field-info`). <!-- 07-§6.44g -->

### Submit modal (progress / success / error)

The submit modal overlays the page during form submission and shows progress, success, or error states. <!-- 07-§6.49 -->

- Box: white background, `--radius-lg` (16 px) border-radius, generous shadow (`0 8px 32px rgba(0,0,0,0.16)`). <!-- 07-§6.50 -->
- Padding: `--space-lg` top/bottom, `--space-md` left/right — extra vertical breathing room. <!-- 07-§6.51 -->
- Heading and progress steps are center-aligned. <!-- 07-§6.52 -->
- The heading receives programmatic focus (`tabindex="-1"`) but must not display a visible focus outline since it is not interactive. <!-- 07-§6.53 -->
- Entry animation: fade-in + slide-up, 250 ms, `ease-out`. Within the 300 ms ceiling in `07-§10.2`. <!-- 07-§6.54 -->
- Backdrop: semi-transparent navy using `color-mix(in srgb, var(--color-navy) 60%, transparent)`. <!-- 07-§6.55 -->

### Markdown toolbar (description field)

A row of small icon buttons directly above the description `<textarea>`. <!-- 07-§6.56 -->

- Container (`.md-toolbar`): `display: flex`, `gap: 4px`, `padding: 4px`, background `var(--color-cream-light)`, border `1px solid rgba(0,0,0,0.1)`, `border-radius: var(--radius-sm) var(--radius-sm) 0 0` (top corners only). The textarea below it gets `border-radius: 0 0 var(--radius-sm) var(--radius-sm)` and `border-top: none` so they feel like one component. <!-- 07-§6.57 -->
- Buttons: `background: transparent`, no border, `padding: 6px`, `border-radius: var(--radius-sm)`, `color: var(--color-charcoal)`, `cursor: pointer`. <!-- 07-§6.58 -->
- Hover: `background: rgba(0,0,0,0.06)`. <!-- 07-§6.59 -->
- Focus-visible: same outline as other interactive elements (`2px solid var(--color-terracotta)`, `outline-offset: 2px`). <!-- 07-§6.60 -->
- Icons: `16px × 16px` inline SVGs, `stroke: currentColor`, `fill: none`, `stroke-width: 2`. <!-- 07-§6.61 -->
- A thin `1px solid rgba(0,0,0,0.1)` separator between the toolbar and textarea is achieved by the toolbar's bottom border matching the textarea's side borders. <!-- 07-§6.62 -->
- On narrow viewports the buttons simply wrap to a second row (flex-wrap). No special mobile treatment. <!-- 07-§6.63 -->

### Markdown preview (description field)

A read-only preview area below the description `<textarea>` that shows live-rendered Markdown. <!-- 07-§6.64 -->

- Container (`.md-preview`): `background: var(--color-cream-light)`, `border: 1px solid rgba(0,0,0,0.10)`, `border-radius: var(--radius-sm)`, `padding: var(--space-sm)`, `margin-top: var(--space-xs)`, `color: var(--color-charcoal)`. <!-- 07-§6.65 -->
- A label line (`.md-preview-label`) above the rendered content: `font-size: var(--font-size-small)`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.04em`, `color: var(--color-charcoal)`, `opacity: 0.5`, `margin: 0 0 var(--space-xs)`, `padding-bottom: var(--space-xs)`, `border-bottom: 1px solid rgba(0,0,0,0.07)` — mirrors the `.event-section-label` pattern with a thin separator line below. <!-- 07-§6.66 -->
- Inner content matches `.event-description` rules: paragraphs get `margin: 0 0 var(--space-xs)`, last paragraph `margin-bottom: 0`. <!-- 07-§6.67 -->
- The preview is hidden (`hidden` attribute) when the textarea is empty. <!-- 07-§6.68 -->
- `pointer-events: none` on inner content to enforce read-only behaviour. <!-- 07-§6.69 -->

### Scoped headings in descriptions

Headings inside event descriptions (`.event-desc`, `.event-description`) and
the Markdown preview (`.md-preview`) must be scaled down from the page-level
heading sizes so they fit the smaller context and follow a strictly decreasing
hierarchy. <!-- 07-§6.70 -->

- h1: `1.4em`, `700`, `color: var(--color-terracotta)`, `margin: 0 0 var(--space-xs)`. <!-- 07-§6.71 -->
- h2: `1.2em`, `700`, `color: var(--color-terracotta)`, `margin: 0 0 var(--space-xs)`. <!-- 07-§6.72 -->
- h3: `1.1em`, `700`, `color: var(--color-terracotta)`, `margin: 0 0 var(--space-xs)`. <!-- 07-§6.73 -->
- h4: `1em`, `700`, `color: inherit`, `margin: 0 0 var(--space-xs)`. <!-- 07-§6.74 -->

Using `em` makes the headings proportional to the container's font-size
(e.g. 13 px in `.event-extra`, 16 px in `.md-preview`). <!-- 07-§6.75 -->

### Character counter (form fields)

A small counter below text input fields showing how many characters have been
typed relative to the maximum. <!-- 07-§6.85 -->

- Counter element (`.char-counter`): `font-size: var(--font-size-small)`,
  `color: var(--color-charcoal)`, `opacity: 0.6`, `text-align: right`,
  `margin-top: 2px`. <!-- 07-§6.86 -->
- Warning state (`.char-counter.warn`): `color: var(--color-terracotta)`,
  `opacity: 1`. Applied when field value reaches or exceeds 90 % of the maximum
  length. <!-- 07-§6.87 -->
- The counter is hidden (`hidden` attribute) when the field value is below 70 %
  of the maximum length. <!-- 07-§6.88 -->

### Day grid (date selection)

A grid of day buttons replaces the native date picker on the add-activity
form. The grid is always multi-select — there is no toggle. <!-- 07-§6.76 -->

- Container (`.day-grid`): `display: flex`, `flex-wrap: wrap`,
  `gap: var(--space-xs)`. <!-- 07-§6.77 -->
- Day button (`.day-btn`): `min-width: 4.5em`, `padding: var(--space-xs)
  var(--space-sm)`, `border: 2px solid rgba(0,0,0,0.12)`,
  `border-radius: var(--radius-sm)`, `background: var(--color-white)`,
  `color: var(--color-charcoal)`, `font-size: var(--font-size-small)`,
  `text-align: center`, `cursor: pointer`. <!-- 07-§6.78 -->
- Hover: `border-color: var(--color-terracotta)`,
  `background: color-mix(in srgb, var(--color-terracotta) 10%, var(--color-white))`. <!-- 07-§6.79 -->
- Selected (`.day-btn.selected`): `border-color: var(--color-sage)`,
  `background: color-mix(in srgb, var(--color-sage) 12%, var(--color-cream))`.
  No `font-weight` change to prevent button size shifts. <!-- 07-§6.80 -->
- Focus-visible: same outline as other interactive elements
  (`2px solid var(--color-terracotta)`, `outline-offset: 2px`). <!-- 07-§6.81 -->
- The weekday abbreviation is displayed on one line, the date on the line
  below, both center-aligned within the button. <!-- 07-§6.82 -->
- Pagination nav (`.day-grid-nav`): `display: flex`, centered, with ← / →
  buttons when the camp has more than 8 days. Page size is set via
  `data-page-size` attribute on the day grid container. <!-- 07-§6.83 -->
- Confirmation summary (`.confirm-summary`): table layout inside the submit
  confirmation modal, with emoji icons in the first column and values in the
  second. Compact padding (`2px`), description row has extra top
  padding. <!-- 07-§6.84 -->

---

## 7. CSS Strategy

### How to write CSS

Write CSS for a component only once its HTML structure exists. Speculative CSS — written before the markup is settled — creates waste and drift. <!-- 07-§7.2 -->

### Structure

1. One main CSS file, organized in sections: reset → tokens → base → layout → components → utilities. <!-- 07-§7.3 -->
2. No preprocessor required. CSS custom properties (variables) are enough. <!-- 07-§7.4 -->
3. No CSS framework. Hand-written, minimal. <!-- 07-§7.5 -->

### CSS custom properties (design tokens)

When CSS is written, start with these at `:root`:

```css
:root {
  /* Colors */
  --color-terracotta: #C76D48;
  --color-sage: #ADBF77;
  --color-cream: #F5EEDF;
  --color-navy: #192A3D;
  --color-charcoal: #3B3A38;
  --color-white: #FFFFFF;
  --color-cream-light: #FAF7EF;

  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-serif: Georgia, serif;
  --font-size-base: 16px;
  --font-size-h1: 40px;
  --font-size-h2: 35px;
  --font-size-h3: 30px;
  --font-size-pullquote: 25px;
  --font-size-small: 14px;
  --font-size-nav: 12px;
  --line-height-body: 1.65;

  /* Spacing */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 40px;
  --space-xl: 64px;
  --space-xxl: 96px;

  /* Layout */
  --container-wide: 1290px;
  --container-narrow: 750px;

  /* Shadows */
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.04);

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 16px;
  --radius-full: 50%;
}
```

These variables make it trivial to adjust the design globally later.

---

## 8. Imagery

- Natural, warm photography: river, forest, camp activities, families. <!-- 07-§8.1 -->
- Avoid stock-photo feel. Prefer real photos from actual camps. <!-- 07-§8.2 -->
- Hero image: landscape format, high resolution, dark enough for text overlay. <!-- 07-§8.3 -->
- Testimonial avatars: portrait photos, cropped square, displayed circular. <!-- 07-§8.4 -->

---

## 9. Accessibility

- Color contrast must meet WCAG AA minimum (`4.5:1` for body text). WCAG is the Web Content Accessibility Guidelines — the international standard for accessible web design. <!-- 07-§9.1 -->
- Interactive elements must have visible `:focus-visible` states: `outline: 2px solid var(--color-terracotta); outline-offset: 2px`. This applies to buttons, navigation links, form inputs, accordion summaries, content links, and any other focusable element. <!-- 07-§9.2 -->
- Navigation must be keyboard accessible. <!-- 07-§9.3 -->
- Images must have descriptive `alt` text. <!-- 07-§9.4 -->
- Accordion items must use proper ARIA attributes (`aria-expanded`, `aria-controls`). Native `<details>/<summary>` elements satisfy this requirement — browsers expose expanded/collapsed state to assistive technology without explicit ARIA attributes. Custom accordion components (e.g. the archive timeline) must use explicit `aria-expanded` and `aria-controls`. <!-- 07-§9.5 -->
- Every page must have exactly one `<main>` landmark element wrapping the primary content (between navigation and footer). This lets screen readers skip past navigation directly to content. <!-- 07-§9.6 -->

---

## 10. What Not to Do

- No gradients or drop shadows heavier than specified. <!-- 07-§10.1 -->
- No animations beyond subtle transitions (`200–300ms`). <!-- 07-§10.2 -->
- No decorative fonts or display typefaces. <!-- 07-§10.3 -->
- No full-width text at desktop widths — always constrain with container. <!-- 07-§10.4 -->
- No whitespace-heavy "agency" layouts. Content density matters here. <!-- 07-§10.5 -->
- No dark mode for the main site. The Today/Display view uses a dark theme — but that is a separate, purpose-built view for shared screens and is not a site-wide dark mode. <!-- 07-§10.6 -->
