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
| `07-§3.4` | H1 | 40px | 700 | `#192A3D` | Page titles, hero heading |
| `07-§3.5` | H2 | 35px | 700 | `#192A3D` | Section headings |
| `07-§3.6` | H3 | 30px | 700 | `#192A3D` | Sub-section headings |
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
- Active/hover: terracotta underline or color shift. <!-- 07-§6.6 -->
- Mobile: hamburger button toggles a dropdown panel containing all links. <!-- 07-§6.7 -->
- Desktop (≥ 768 px): hamburger hidden, all links visible in two rows. <!-- 07-§6.16-impl -->
- Row 1: main page links (uppercase, `13px`, `700`, `letter-spacing: 0.06em`, opacity `0.5`
  until active/hover). <!-- 07-§6.17-impl -->
- Row 2: section anchor links (no text-transform, `11px`, `700`, opacity `0.45` until hover). <!-- 07-§6.18-impl -->
- Two rows separated by a `1px` rule in `rgba(0,0,0,0.06)`. <!-- 07-§6.19-impl -->
- Mobile panel: `background: var(--color-cream)`, `box-shadow` beneath nav,
  `z-index: 100`. <!-- 07-§6.20-impl -->

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

### Buttons

- Min height: `40px`. <!-- 07-§6.12 -->
- Padding: `10px 24px`. <!-- 07-§6.13 -->
- Border-radius: `4px` (subtle, not fully rounded). <!-- 07-§6.14 -->
- **Primary**: Background `#C76D48`, text white, no border. <!-- 07-§6.15 -->
- **Secondary**: Border `#C76D48`, text `#C76D48`, transparent background. <!-- 07-§6.16 -->
- Hover: darken background by ~10%, smooth transition `200ms ease`. <!-- 07-§6.17 -->
- Font: same as body, `700` weight, `14–16px`. <!-- 07-§6.18 -->

### Cards (info blocks, testimonials)

- Background: white `#FFFFFF`. <!-- 07-§6.19 -->
- Border-radius: `6px`. <!-- 07-§6.20 -->
- Box shadow: `0 4px 12px rgba(0, 0, 0, 0.04)`. <!-- 07-§6.21 -->
- Padding: `24px`. <!-- 07-§6.22 -->
- Testimonial cards: circular profile image (`border-radius: 50%`, ~`60px`). <!-- 07-§6.23 -->

### Accordion (FAQ)

- Header: sage green `#ADBF77` background, dark text. <!-- 07-§6.24 -->
- Body: cream `#F5EEDF` or white background. <!-- 07-§6.25 -->
- Toggle icon: `+` / `−` or a chevron. <!-- 07-§6.26 -->
- Animate open/close with CSS `max-height` transition. <!-- 07-§6.27 -->
- No JavaScript framework — plain JS or CSS-only if feasible. <!-- 07-§6.28 -->

### Section headings

- H2 with a short decorative line or color block underneath (optional). <!-- 07-§6.29 -->
- Or: a sage-green label above the heading at `12px` uppercase. <!-- 07-§6.30 -->

### Event / schedule items

- Clear time display: bold start time, lighter end time. <!-- 07-§6.31 -->
- Location as small text below. <!-- 07-§6.32 -->

### Form field errors (inline)

Per-field validation errors appear directly below the input they relate to. <!-- 07-§6.34 -->

- Each `.field` div may contain a `<span class="field-error">` after the input element. <!-- 07-§6.35 -->
- Error text: `14px`, `var(--color-terracotta)`. <!-- 07-§6.36 -->
- Invalid inputs receive a terracotta bottom border (`2px solid var(--color-terracotta)`) via `aria-invalid="true"`. <!-- 07-§6.37 -->
- Each error span is linked to its input with `aria-describedby` so screen readers announce the error in context. <!-- 07-§6.38 -->
- On successful revalidation (next submit attempt), the error text is removed, `aria-invalid` is cleared, and the border returns to normal. <!-- 07-§6.39 -->

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

---

## 10. What Not to Do

- No gradients or drop shadows heavier than specified. <!-- 07-§10.1 -->
- No animations beyond subtle transitions (`200–300ms`). <!-- 07-§10.2 -->
- No decorative fonts or display typefaces. <!-- 07-§10.3 -->
- No full-width text at desktop widths — always constrain with container. <!-- 07-§10.4 -->
- No whitespace-heavy "agency" layouts. Content density matters here. <!-- 07-§10.5 -->
- No dark mode for the main site. The Today/Display view uses a dark theme — but that is a separate, purpose-built view for shared screens and is not a site-wide dark mode. <!-- 07-§10.6 -->
