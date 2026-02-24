'use strict';

// Tests for renderEditPage() — structural requirements for the edit submit UX flow.
//
// Requirements 02-§20.1–20.13 mirror the add-activity modal flow (02-§19.*).
// The subset tested here are structural: they verify the HTML string returned by
// renderEditPage() contains (or omits) specific elements that the submit flow
// depends on.
//
// Browser-only requirements (field locking, modal open/close, focus trap,
// scroll lock, fetch) must be verified manually:
//   1. Open redigera.html?id=<valid-id> in a browser (with owned session cookie).
//   2. Fill in all required fields and press "Spara ändringar".
//   3. Confirm all inputs are disabled before the modal opens (02-§20.1/20.2).
//   4. Confirm the modal opens with a spinner and "Sparar till GitHub…" (02-§20.3/20.4).
//   5. Confirm Tab does not leave the modal while open (02-§20.6).
//   6. Confirm the page does not scroll behind the modal (02-§20.7).
//   7. On success: confirm title, "Aktiviteten är uppdaterad!", and "Gå till schemat →"
//      link appear (02-§20.8).
//   8. Simulate a server error: confirm the error message and "Försök igen"
//      button appear (02-§20.9).
//   9. Click "Försök igen": confirm the form is re-enabled with data intact (02-§20.10).
//  10. Inspect modal CSS in DevTools: confirm only CSS custom properties are used —
//      no hardcoded hex colors or px spacing values (02-§20.11).
//  11. Check package.json: confirm no new npm dependencies were added (02-§20.12).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderEditPage, editApiUrl } = require('../source/build/render-edit');

const CAMP = {
  name: 'SB Sommar 2026',
  start_date: '2026-06-21',
  end_date: '2026-06-27',
};
const LOCATIONS = ['Servicehus', 'Badet', 'Annat'];
const API_URL = 'https://api.example.com/edit-event';

function render() {
  return renderEditPage(CAMP, LOCATIONS, API_URL);
}

describe('renderEditPage – submit UX structure', () => {
  // 02-§20.13: the old #result section must be removed and replaced by the modal
  it('EDIT-01 (02-§20.13): does not render a #result section', () => {
    assert.ok(
      !render().includes('id="result"'),
      'Found id="result" — the #result section must be removed and replaced by the modal',
    );
  });

  // 02-§20.1: form fields must be inside a <fieldset> so they can all be
  // locked with a single fieldset.disabled = true
  it('EDIT-02 (02-§20.1): wraps form inputs in a <fieldset>', () => {
    assert.ok(
      render().includes('<fieldset'),
      'No <fieldset> found — form fields must be wrapped in a fieldset for locking',
    );
  });

  // 02-§20.3: the modal skeleton must be present in the static HTML
  it('EDIT-03 (02-§20.3): renders a #submit-modal element', () => {
    assert.ok(
      render().includes('id="submit-modal"'),
      'No id="submit-modal" found — modal skeleton must be in the static HTML',
    );
  });

  // 02-§20.5: accessibility attributes
  it('EDIT-04 (02-§20.5): modal has role="dialog"', () => {
    assert.ok(render().includes('role="dialog"'), 'Modal is missing role="dialog"');
  });

  it('EDIT-05 (02-§20.5): modal has aria-modal="true"', () => {
    assert.ok(render().includes('aria-modal="true"'), 'Modal is missing aria-modal="true"');
  });

  it('EDIT-06 (02-§20.5): modal aria-labelledby references an element that exists in the HTML', () => {
    const html = render();
    const match = html.match(/aria-labelledby="([^"]+)"/);
    assert.ok(match, 'Modal is missing aria-labelledby attribute');
    const headingId = match[1];
    assert.ok(
      html.includes(`id="${headingId}"`),
      `aria-labelledby="${headingId}" but no element with that id found in the HTML`,
    );
  });
});

// ── editApiUrl (02-§18.44) ────────────────────────────────────────────────────

describe('editApiUrl', () => {
  it('BUILD-01: replaces /add-event with /edit-event', () => { // BUILD-01
    assert.strictEqual(
      editApiUrl('https://api.example.com/add-event'),
      'https://api.example.com/edit-event',
    );
  });

  it('BUILD-02: falls back to /edit-event when no URL is given', () => { // BUILD-02
    assert.strictEqual(editApiUrl(undefined), '/edit-event');
    assert.strictEqual(editApiUrl(''), '/edit-event');
  });

  it('BUILD-03: does not mangle a URL that already ends with /edit-event', () => { // BUILD-03
    assert.strictEqual(
      editApiUrl('https://api.example.com/edit-event'),
      'https://api.example.com/edit-event',
    );
  });

  it('BUILD-04: does not replace /add-event in the middle of a URL', () => { // BUILD-04
    assert.strictEqual(
      editApiUrl('https://api.example.com/add-event/extra'),
      'https://api.example.com/add-event/extra',
    );
  });
});
