'use strict';

// Tests for the feedback button feature – 02-§73.
//
// Browser-only requirements (§73.2, §73.3, §73.5, §73.6, §73.10,
// §73.15, §73.17, §73.18, §73.19) cannot be unit-tested in Node.js.
// Manual checkpoint: open any page, click the feedback button, and verify:
//   - Modal opens with category, title, description, name fields.
//   - Submit is disabled until required fields are filled.
//   - Progress steps appear during submission.
//   - Escape / click outside / close button closes the modal.
//   - Success shows a clickable link to the created issue.
//   - Failure shows an error with retry option.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { pageNav } = require('../source/build/layout');
const { validateFeedbackRequest } = require('../source/api/feedback');

// ── Navigation: feedback button present (02-§73.1, §73.16) ──────────────────

describe('pageNav – feedback button (02-§73.1, §73.16)', () => {
  it('FB-01: renders a feedback button in the layout output', () => {
    const html = pageNav('index.html', []);
    assert.ok(html.includes('feedback-btn'), `Expected feedback-btn. Got: ${html}`);
  });

  it('FB-02: feedback button has aria-label="Ge feedback"', () => {
    const html = pageNav('index.html', []);
    assert.ok(
      html.includes('aria-label="Ge feedback"'),
      `Expected aria-label. Got: ${html}`,
    );
  });

  it('FB-03: feedback button contains an SVG icon', () => {
    const html = pageNav('index.html', []);
    // The button should contain an inline SVG speech bubble
    const btnMatch = html.match(/class="feedback-btn"[^>]*>[\s\S]*?<\/button>/);
    assert.ok(btnMatch, 'Expected feedback button markup');
    assert.ok(btnMatch[0].includes('<svg'), 'Expected SVG inside feedback button');
  });
});

// ── Validation: validateFeedbackRequest (02-§73.11, §73.12, §73.13) ─────────

function validFeedback(overrides = {}) {
  return {
    category: 'bug',
    title: 'Something is broken',
    description: 'The schedule page does not load.',
    ...overrides,
  };
}

describe('validateFeedbackRequest – required fields (02-§73.11)', () => {
  it('FB-04: accepts a valid feedback request', () => {
    const r = validateFeedbackRequest(validFeedback());
    assert.strictEqual(r.ok, true);
  });

  it('FB-05: rejects missing title', () => {
    const r = validateFeedbackRequest(validFeedback({ title: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('FB-06: rejects missing description', () => {
    const r = validateFeedbackRequest(validFeedback({ description: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('description'));
  });

  it('FB-07: rejects missing category', () => {
    const r = validateFeedbackRequest(validFeedback({ category: '' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('category'));
  });

  it('FB-08: rejects invalid category value', () => {
    const r = validateFeedbackRequest(validFeedback({ category: 'rant' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('category'));
  });

  it('FB-09: accepts all three valid categories', () => {
    for (const cat of ['bug', 'suggestion', 'question']) {
      const r = validateFeedbackRequest(validFeedback({ category: cat }));
      assert.strictEqual(r.ok, true, `Expected ok for category '${cat}'`);
    }
  });
});

describe('validateFeedbackRequest – length limits (02-§73.11)', () => {
  it('FB-10: rejects title exceeding 200 characters', () => {
    const r = validateFeedbackRequest(validFeedback({ title: 'A'.repeat(201) }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('title'));
  });

  it('FB-11: rejects description exceeding 2000 characters', () => {
    const r = validateFeedbackRequest(validFeedback({ description: 'B'.repeat(2001) }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('description'));
  });

  it('FB-12: rejects name exceeding 200 characters', () => {
    const r = validateFeedbackRequest(validFeedback({ name: 'C'.repeat(201) }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.error.includes('name'));
  });

  it('FB-13: accepts name at exactly 200 characters', () => {
    const r = validateFeedbackRequest(validFeedback({ name: 'D'.repeat(200) }));
    assert.strictEqual(r.ok, true);
  });
});

describe('validateFeedbackRequest – injection scan (02-§73.12)', () => {
  it('FB-14: rejects <script> in title', () => {
    const r = validateFeedbackRequest(validFeedback({ title: 'Test <script>alert(1)</script>' }));
    assert.strictEqual(r.ok, false);
  });

  it('FB-15: rejects javascript: URI in description', () => {
    const r = validateFeedbackRequest(validFeedback({ description: 'See javascript:void(0)' }));
    assert.strictEqual(r.ok, false);
  });

  it('FB-16: rejects event handler in name', () => {
    const r = validateFeedbackRequest(validFeedback({ name: 'onclick=alert(1)' }));
    assert.strictEqual(r.ok, false);
  });
});

describe('validateFeedbackRequest – honeypot (02-§73.13)', () => {
  it('FB-17: flags honeypot when website field is filled', () => {
    const r = validateFeedbackRequest(validFeedback({ website: 'http://spam.com' }));
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.honeypot, true);
  });

  it('FB-18: no honeypot flag when website is empty', () => {
    const r = validateFeedbackRequest(validFeedback({ website: '' }));
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.honeypot, undefined);
  });

  it('FB-19: no honeypot flag when website is absent', () => {
    const r = validateFeedbackRequest(validFeedback());
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.honeypot, undefined);
  });
});

// ── Validation: body guard ───────────────────────────────────────────────────

describe('validateFeedbackRequest – body guard', () => {
  it('FB-20: rejects null body', () => {
    const r = validateFeedbackRequest(null);
    assert.strictEqual(r.ok, false);
  });

  it('FB-21: rejects non-object body', () => {
    const r = validateFeedbackRequest('string');
    assert.strictEqual(r.ok, false);
  });
});
