'use strict';

// Tests for renderAddPage() — structural requirements for the submit UX flow.
//
// All 17 requirements (02-§19.1–19.17) involve browser DOM or network behaviour
// that cannot be exercised in Node.js.  The subset tested here are structural:
// they verify the HTML string returned by renderAddPage() contains (or omits)
// specific elements that are required for the submit flow to work.
//
// Browser-only requirements (field locking, modal opening/closing, focus trap,
// scroll lock, fetch, consent banner interaction) must be verified manually:
//   1. Open lagg-till.html in a browser.
//   2. Fill in all required fields and press Skicka.
//   3. Confirm all inputs are disabled before the modal opens (02-§19.1/19.2).
//   4. If consent has not been given: confirm the banner appears after the
//      submit button, then resolves before the modal opens (02-§19.3/19.4).
//   5. Confirm the modal opens with a spinner and "Skickar till GitHub…"
//      (02-§19.5/19.6).
//   6. Confirm Tab does not leave the modal while open (02-§19.8).
//   7. Confirm the page does not scroll behind the modal (02-§19.9).
//   8. On success: confirm title, confirmation text, "Gå till schemat →" link,
//      and "Lägg till en till" button appear (02-§19.10).
//   9. After declining consent: confirm the no-edit note appears in the success
//      modal (02-§19.11).
//  10. Click "Lägg till en till": confirm the form is blank and enabled
//      (02-§19.12).
//  11. Simulate a server error: confirm the error message and "Försök igen"
//      button appear (02-§19.13).
//  12. Click "Försök igen": confirm the form is re-enabled with data intact
//      (02-§19.14).
//  13. Inspect modal CSS in DevTools: confirm only CSS custom properties are
//      used — no hardcoded hex colors or px spacing values (02-§19.15).
//  14. Check package.json: confirm no new npm dependencies were added for the
//      modal (02-§19.16).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { renderAddPage } = require('../source/build/render-add');

const CAMP = {
  name: 'SB Sommar 2026',
  start_date: '2026-06-21',
  end_date: '2026-06-27',
};
const LOCATIONS = ['Servicehus', 'Badet', 'Annat'];
const API_URL = 'https://api.example.com/add-event';

function render() {
  return renderAddPage(CAMP, LOCATIONS, API_URL);
}

describe('renderAddPage – submit UX structure', () => {
  // 02-§19.17: the old #result section is replaced by the modal
  it('ADD-01 (02-§19.17): does not render a #result section', () => {
    assert.ok(
      !render().includes('id="result"'),
      'Found id="result" — the #result section must be removed and replaced by the modal',
    );
  });

  // 02-§19.1: form fields must be inside a <fieldset> so they can all be
  // locked with a single fieldset.disabled = true
  it('ADD-02 (02-§19.1): wraps form inputs in a <fieldset>', () => {
    assert.ok(
      render().includes('<fieldset'),
      'No <fieldset> found — form fields must be wrapped in a fieldset for locking',
    );
  });

  // 02-§19.5: the modal skeleton must be present in the static HTML so JS
  // can show/update it without creating elements from scratch on every submit
  it('ADD-03 (02-§19.5): renders a #submit-modal element', () => {
    assert.ok(
      render().includes('id="submit-modal"'),
      'No id="submit-modal" found — modal skeleton must be in the static HTML',
    );
  });

  // 02-§19.7: accessibility attributes
  it('ADD-04 (02-§19.7): modal has role="dialog"', () => {
    assert.ok(render().includes('role="dialog"'), 'Modal is missing role="dialog"');
  });

  it('ADD-05 (02-§19.7): modal has aria-modal="true"', () => {
    assert.ok(render().includes('aria-modal="true"'), 'Modal is missing aria-modal="true"');
  });

  it('ADD-06 (02-§19.7): modal aria-labelledby references an element that exists in the HTML', () => {
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
