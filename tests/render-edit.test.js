'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { editApiUrl } = require('../source/build/render-edit');

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
