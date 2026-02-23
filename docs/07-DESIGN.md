# SB Sommar – Design Specification

Visual design reference for SB Sommar. Inspired by the existing site at sbsommar.se.
This document is the single source of truth for design decisions.

All CSS must use the custom properties defined in §7. Do not hardcode colors, spacing, or typography values.

---

## 1. Design Philosophy

- Warm, welcoming, outdoorsy feel — not corporate or sterile.
- Earth tones and natural colors that evoke summer, forest, and water.
- Clean and readable. Content first.
- Fast and lightweight. No decorative excess.

---

## 2. Color Palette

| Name        | Hex       | Use                                          |
|-------------|-----------|----------------------------------------------|
| Terracotta  | `#C76D48` | Primary accent, buttons, links, highlights   |
| Sage green  | `#ADBF77` | Secondary accent, section headers, tags      |
| Cream       | `#F5EEDF` | Page background, warm neutral base           |
| Navy        | `#192A3D` | Main headings, strong contrast               |
| Charcoal    | `#3B3A38` | Body text, muted dark                        |
| White       | `#FFFFFF` | Cards, content blocks, contrast surfaces     |

Avoid bright or saturated colors outside this palette. The warmth comes from restraint.

---

## 3. Typography

### Font families

- **Headings**: System sans-serif stack, or a single humanist sans-serif web font if added later.
  Fallback: `system-ui, -apple-system, sans-serif`
- **Body**: Same sans-serif stack. Clean and readable.
- **Pull quotes / callouts**: Georgia, serif. Adds warmth and character in small doses.

### Scale

| Element       | Size  | Weight | Color     | Notes                        |
|---------------|-------|--------|-----------|------------------------------|
| H1            | 40px  | 700    | `#192A3D` | Page titles, hero heading    |
| H2            | 35px  | 700    | `#192A3D` | Section headings             |
| H3            | 30px  | 700    | `#192A3D` | Sub-section headings         |
| Body          | 16px  | 400    | `#3B3A38` | All running text             |
| Small / meta  | 14px  | 400    | `#3B3A38` | Dates, labels, captions      |
| Pull quote    | 25px  | 600    | `#3B3A38` | Georgia serif, italic        |
| Nav links     | 12px  | 700    | varies    | Uppercase, spaced out        |

Line height for body text: `1.65`. Generous — makes Swedish long-form text comfortable to read.

---

## 4. Layout & Spacing

### Containers

| Type    | Max-width | Use                          |
|---------|-----------|------------------------------|
| Wide    | `1290px`  | Full layout, header, hero    |
| Narrow  | `750px`   | Reading sections, articles   |

Container is centered with `margin: 0 auto` and horizontal padding on small screens.

### Spacing rhythm

Base unit: `8px`. Spacing values are multiples of this.

| Token name    | Value  | Use                            |
|---------------|--------|--------------------------------|
| `space-xs`    | 8px    | Tight gaps, icon padding       |
| `space-sm`    | 16px   | Between inline elements        |
| `space-md`    | 24px   | Card padding, form fields      |
| `space-lg`    | 40px   | Between sections within a page |
| `space-xl`    | 64px   | Between major page sections    |
| `space-xxl`   | 96px   | Hero padding, page top/bottom  |

### Grid

- Desktop: up to 3 columns for cards/testimonials.
- Tablet: 2 columns.
- Mobile: 1 column.
- Use CSS Grid. No grid framework.

---

## 5. Responsive Breakpoints

| Breakpoint | Width       | Description                        |
|------------|-------------|------------------------------------|
| Desktop    | > 1000px    | Full layout, side-by-side columns  |
| Tablet     | 690–999px   | 2-column grids, condensed header   |
| Mobile     | < 690px     | Single column, stacked layout      |

---

## 6. Components

### Header / Navigation

- Full-width, fixed or sticky at top.
- Height: `120px` desktop, `70px` mobile.
- Background: white or cream, with a subtle bottom border or shadow.
- Logo on the left. Navigation links on the right.
- Nav links: uppercase, `12px`, `700` weight, spaced with `letter-spacing: 0.08em`.
- Active/hover: terracotta underline or color shift.
- Mobile: hamburger menu, full-screen or dropdown.

### Hero Section

- Large background image (Klarälven river / camp landscape).
- Overlay text: camp name, dates, short tagline.
- One or two CTA buttons (see Buttons below).
- Image should use `object-fit: cover` and be responsive.

### Buttons

- Min height: `40px`.
- Padding: `10px 24px`.
- Border-radius: `4px` (subtle, not fully rounded).
- **Primary**: Background `#C76D48`, text white, no border.
- **Secondary**: Border `#C76D48`, text `#C76D48`, transparent background.
- Hover: darken background by ~10%, smooth transition `200ms ease`.
- Font: same as body, `700` weight, `14–16px`.

### Cards (info blocks, testimonials)

- Background: white `#FFFFFF`.
- Border-radius: `6px`.
- Box shadow: `0 4px 12px rgba(0, 0, 0, 0.04)`.
- Padding: `24px`.
- Testimonial cards: circular profile image (`border-radius: 50%`, ~`60px`).

### Accordion (FAQ)

- Header: sage green `#ADBF77` background, dark text.
- Body: cream `#F5EEDF` or white background.
- Toggle icon: `+` / `−` or a chevron.
- Animate open/close with CSS `max-height` transition.
- No JavaScript framework — plain JS or CSS-only if feasible.

### Section headings

- H2 with a short decorative line or color block underneath (optional).
- Or: a sage-green label above the heading at `12px` uppercase.

### Event / schedule items

- Clear time display: bold start time, lighter end time.
- Location as small text below.
- Optional colored left border to categorize activity type.

---

## 7. CSS Strategy

### How to write CSS

Write CSS for a component only once its HTML structure exists. Speculative CSS — written before the markup is settled — creates waste and drift.

### Structure

1. One main CSS file, organized in sections: reset → tokens → base → layout → components → utilities.
2. No preprocessor required. CSS custom properties (variables) are enough.
3. No CSS framework. Hand-written, minimal.

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

  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-serif: Georgia, serif;
  --font-size-base: 16px;
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
  --radius-full: 50%;
}
```

These variables make it trivial to adjust the design globally later.

---

## 8. Imagery

- Natural, warm photography: river, forest, camp activities, families.
- Avoid stock-photo feel. Prefer real photos from actual camps.
- Hero image: landscape format, high resolution, dark enough for text overlay.
- Testimonial avatars: portrait photos, cropped square, displayed circular.
- Optimize all images: use responsive `srcset`, modern formats (WebP with JPEG fallback).

---

## 9. Accessibility

- Color contrast must meet WCAG AA minimum (`4.5:1` for body text).
- Interactive elements must have visible focus states.
- Navigation must be keyboard accessible.
- Images must have descriptive `alt` text.
- Accordion items must use proper ARIA attributes (`aria-expanded`, `aria-controls`).

---

## 10. What Not to Do

- No gradients or drop shadows heavier than specified.
- No animations beyond subtle transitions (`200–300ms`).
- No decorative fonts or display typefaces.
- No full-width text at desktop widths — always constrain with container.
- No whitespace-heavy "agency" layouts. Content density matters here.
- No dark mode for the main site. The Today/Display view uses a dark theme — but that is a separate, purpose-built view for shared screens and is not a site-wide dark mode.
