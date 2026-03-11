'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const yaml = require('js-yaml');

const { removeEventFromYaml } = require('../source/api/edit-event');
const { renderEditPage } = require('../source/build/render-edit');

// ── Helpers ───────────────────────────────────────────────────────────────────

const SAMPLE_YAML = `\
camp:
  id: test-camp
  name: Test Camp
  location: Testort
  start_date: '2099-06-01'
  end_date: '2099-06-07'
events:
- id: event-one-2099-06-01-1000
  title: Event One
  date: '2099-06-01'
  start: '10:00'
  end: '11:00'
  location: Stor scenen
  responsible: Anna
  description: null
  link: null
  owner:
    name: ''
    email: ''
  meta:
    created_at: 2099-05-01 12:00
    updated_at: 2099-05-01 12:00
- id: event-two-2099-06-02-1400
  title: Event Two
  date: '2099-06-02'
  start: '14:00'
  end: '15:00'
  location: Matsalen
  responsible: Bo
  description: Med lite text.
  link: https://example.com
  owner:
    name: ''
    email: ''
  meta:
    created_at: 2099-05-02 09:00
    updated_at: 2099-05-02 09:00
`;

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

// ── removeEventFromYaml (02-§89.17) ──────────────────────────────────────────

describe('removeEventFromYaml', () => {
  it('DEL-01: returns null when the event ID is not found', () => {
    const result = removeEventFromYaml(SAMPLE_YAML, 'no-such-id');
    assert.strictEqual(result, null);
  });

  it('DEL-02: removes the target event from the events array', () => {
    const result = removeEventFromYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000');
    const parsed = yaml.load(result);
    const found = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');
    assert.strictEqual(found, undefined, 'Deleted event should not be present');
  });

  it('DEL-03: leaves other events unchanged', () => {
    const result = removeEventFromYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000');
    const parsed = yaml.load(result);
    assert.strictEqual(parsed.events.length, 1);
    const remaining = parsed.events[0];
    assert.strictEqual(remaining.id, 'event-two-2099-06-02-1400');
    assert.strictEqual(remaining.title, 'Event Two');
    assert.strictEqual(remaining.responsible, 'Bo');
  });

  it('DEL-04: preserves camp metadata', () => {
    const result = removeEventFromYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000');
    const parsed = yaml.load(result);
    assert.strictEqual(parsed.camp.id, 'test-camp');
    assert.strictEqual(parsed.camp.name, 'Test Camp');
  });

  it('DEL-05: result is parseable as valid YAML', () => {
    const result = removeEventFromYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000');
    assert.doesNotThrow(() => yaml.load(result), 'Result should be valid YAML');
  });

  it('DEL-06: returns null for invalid YAML content', () => {
    const result = removeEventFromYaml('not: valid: yaml: [', 'event-one');
    assert.strictEqual(result, null);
  });

  it('DEL-07: returns null when events array is missing', () => {
    const noEvents = 'camp:\n  id: test\n';
    const result = removeEventFromYaml(noEvents, 'event-one');
    assert.strictEqual(result, null);
  });
});

// ── Delete button on edit page (02-§89.1, 02-§89.2) ─────────────────────────

describe('renderEditPage – delete button', () => {
  it('DEL-08 (02-§89.1): renders a delete button', () => {
    const html = render();
    assert.ok(
      html.includes('id="btn-delete"'),
      'No id="btn-delete" found — delete button must be present on edit page',
    );
  });

  it('DEL-09 (02-§89.2): delete button has Swedish label', () => {
    const html = render();
    assert.ok(
      html.includes('Radera aktivitet'),
      'Delete button must have label "Radera aktivitet"',
    );
  });

  it('DEL-10 (02-§89.2): delete button has destructive styling class', () => {
    const html = render();
    assert.ok(
      html.includes('btn-destructive'),
      'Delete button must have class btn-destructive',
    );
  });
});

// ── Confirmation dialog (02-§89.3, 02-§89.5) ────────────────────────────────

describe('renderEditPage – delete confirmation dialog', () => {
  it('DEL-11 (02-§89.3): renders a delete confirmation dialog', () => {
    const html = render();
    assert.ok(
      html.includes('id="delete-confirm"'),
      'No id="delete-confirm" found — confirmation dialog must be present',
    );
  });

  it('DEL-12 (02-§89.5): dialog has confirm button with Swedish text', () => {
    const html = render();
    assert.ok(
      html.includes('Ja, radera'),
      'Confirmation dialog must have "Ja, radera" button',
    );
  });

  it('DEL-13 (02-§89.5): dialog has cancel button with Swedish text', () => {
    const html = render();
    assert.ok(
      html.includes('Avbryt'),
      'Confirmation dialog must have "Avbryt" button',
    );
  });

  it('DEL-14 (02-§89.3): dialog has role="alertdialog"', () => {
    const html = render();
    assert.ok(
      html.includes('role="alertdialog"'),
      'Delete confirmation dialog must have role="alertdialog"',
    );
  });
});

// ── deleteApiUrl (02-§89.12) ─────────────────────────────────────────────────

describe('deleteApiUrl', () => {
  // Import after implementation adds the function
  const { deleteApiUrl } = require('../source/build/render-edit');

  it('DEL-15: replaces /add-event with /delete-event', () => {
    assert.strictEqual(
      deleteApiUrl('https://api.example.com/add-event'),
      'https://api.example.com/delete-event',
    );
  });

  it('DEL-16: falls back to /delete-event when no URL is given', () => {
    assert.strictEqual(deleteApiUrl(undefined), '/delete-event');
    assert.strictEqual(deleteApiUrl(''), '/delete-event');
  });

  it('DEL-17: does not mangle a URL that already ends with /delete-event', () => {
    assert.strictEqual(
      deleteApiUrl('https://api.example.com/delete-event'),
      'https://api.example.com/delete-event',
    );
  });
});
