'use strict';

// Tests for §65 — Client-side date and regex robustness.
//
// ROB-01..02: inline scripts use formatToParts, not toLocaleDateString.
// ROB-03: countdown injection regex anchors on </ul> and <script>.
// ROB-04: testimonial image src extraction is attribute-order independent.
// ROB-05: testimonial <p> removal tolerates whitespace.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  renderIndexPage,
  renderUpcomingCampsHtml,
  wrapTestimonialCards,
} = require('../source/build/render-index');

// ── Locale-independent date formatting (02-§65.1, 02-§65.2) ─────────────────

describe('Inline scripts use formatToParts (02-§65.1, 02-§65.2)', () => {
  it('ROB-01: hero countdown script uses formatToParts, not toLocaleDateString', () => {
    const html = renderIndexPage({
      heroSrc: 'images/hero.webp',
      heroAlt: 'Hero',
      sections: [{ id: 'intro', navLabel: 'Intro', html: '<p>Hello</p>' }],
      countdownTarget: '2026-08-02',
    });
    const countdownScript = html.match(/<script>\s*\(function \(\) \{\s*var el = document\.querySelector[\s\S]*?<\/script>/);
    assert.ok(countdownScript, 'Expected countdown script in HTML');
    assert.ok(
      countdownScript[0].includes('formatToParts'),
      `Countdown script must use formatToParts, got: ${countdownScript[0]}`,
    );
    assert.ok(
      !countdownScript[0].includes('toLocaleDateString'),
      `Countdown script must not use toLocaleDateString, got: ${countdownScript[0]}`,
    );
  });

  it('ROB-02: camp-past script uses formatToParts, not toLocaleDateString', () => {
    const html = renderUpcomingCampsHtml([{
      id: '2026-08-test',
      name: 'Test Camp',
      start_date: '2026-08-02',
      end_date: '2026-08-09',
      location: 'Testort',
      link: '',
      information: '',
      archived: false,
    }], 2026);
    assert.ok(
      html.includes('formatToParts'),
      `Camp-past script must use formatToParts, got: ${html}`,
    );
    assert.ok(
      !html.includes('toLocaleDateString'),
      `Camp-past script must not use toLocaleDateString, got: ${html}`,
    );
  });
});

// ── Countdown injection regex (02-§65.3) ─────────────────────────────────────

describe('Countdown injection regex (02-§65.3)', () => {
  it('ROB-03: camps-row wraps the UL and its companion script via </ul>+<script> anchoring', () => {
    const upcomingHtml = renderUpcomingCampsHtml([{
      id: '2026-08-test',
      name: 'Test Camp',
      start_date: '2026-08-02',
      end_date: '2026-08-09',
      location: 'Testort',
      link: '',
      information: '',
      archived: false,
    }], 2026);

    const html = renderIndexPage({
      heroSrc: 'images/hero.webp',
      heroAlt: 'Hero',
      sections: [{ id: 'intro', navLabel: 'Intro', html: upcomingHtml }],
      countdownTarget: '2026-08-02',
    });

    // The camps-row must contain both the closing </ul> AND the companion </script>
    const campsRow = html.match(/<div class="camps-row">([\s\S]*?)hero-countdown/);
    assert.ok(campsRow, 'Expected camps-row div with countdown');
    assert.ok(
      campsRow[1].includes('</ul>'),
      'camps-row must contain the closing </ul>',
    );
    assert.ok(
      campsRow[1].includes('</script>'),
      'camps-row must include the companion script',
    );
    // Verify the regex is structurally anchored: the source must use </ul> in the regex
    const fs = require('node:fs');
    const path = require('node:path');
    const src = fs.readFileSync(path.join(__dirname, '..', 'source', 'build', 'render-index.js'), 'utf8');
    assert.ok(
      src.includes('<\\/ul>\\s*<script>'),
      'Source regex must anchor on </ul> followed by <script>',
    );
  });
});

// ── Testimonial image regex robustness (02-§65.4, 02-§65.5) ─────────────────

describe('Testimonial image regex robustness (02-§65.4, 02-§65.5)', () => {
  it('ROB-04: extracts image src regardless of attribute order', () => {
    // Simulate HTML where class comes before src (non-standard order).
    // Must include content before the first h3 so wrapTestimonialCards processes it.
    const html = [
      '<h2>Röster</h2>',
      '<h3>Anna Svensson</h3>',
      '<p><img class="content-img" src="images/anna.webp" alt="Anna Svensson" loading="lazy"></p>',
      '<blockquote><p>Fantastiskt läger!</p></blockquote>',
    ].join('\n');

    const wrapped = wrapTestimonialCards(html);
    assert.ok(
      wrapped.includes('src="images/anna.webp"'),
      `Should extract src even when class precedes it, got: ${wrapped}`,
    );
    assert.ok(
      wrapped.includes('testimonial-img'),
      `Should produce testimonial-img, got: ${wrapped}`,
    );
  });

  it('ROB-05: removes <p>-wrapped image even with inner whitespace', () => {
    // Simulate HTML where there is whitespace between <p> and <img>.
    // Must include content before the first h3 so wrapTestimonialCards processes it.
    const html = [
      '<h2>Röster</h2>',
      '<h3>Erik Lindgren</h3>',
      '<p> <img src="images/erik.webp" alt="Erik Lindgren" class="content-img" loading="lazy"> </p>',
      '<blockquote><p>Bästa veckan!</p></blockquote>',
    ].join('\n');

    const wrapped = wrapTestimonialCards(html);
    // The standalone <p><img></p> should be removed from the card body
    assert.ok(
      !wrapped.includes('<p> <img'),
      `Should remove whitespace-padded <p><img> block, got: ${wrapped}`,
    );
    // But the image should appear in the testimonial header
    assert.ok(
      wrapped.includes('testimonial-header'),
      `Should have testimonial header, got: ${wrapped}`,
    );
  });
});
