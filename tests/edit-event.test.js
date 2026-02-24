'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const yaml = require('js-yaml');

const { isEventPast, patchEventInYaml } = require('../source/api/edit-event');

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

// ── isEventPast ───────────────────────────────────────────────────────────────

describe('isEventPast', () => {
  it('EDIT-01: returns true for a clearly past date', () => { // EDIT-01
    assert.strictEqual(isEventPast('2000-01-01'), true);
  });

  it('EDIT-02: returns false for a clearly future date', () => { // EDIT-02
    assert.strictEqual(isEventPast('9999-12-31'), false);
  });

  it('EDIT-03: returns false for today (today is not yet past)', () => { // EDIT-03
    const today = new Date().toISOString().slice(0, 10);
    assert.strictEqual(isEventPast(today), false);
  });
});

// ── patchEventInYaml ──────────────────────────────────────────────────────────

describe('patchEventInYaml', () => {
  it('EDIT-04: returns null when the event ID is not found', () => { // EDIT-04
    const result = patchEventInYaml(SAMPLE_YAML, 'no-such-id', { title: 'X' });
    assert.strictEqual(result, null);
  });

  it('EDIT-05: updates the title of the target event', () => { // EDIT-05
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { title: 'Ny titel' });
    const parsed = yaml.load(result);
    const ev = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');
    assert.strictEqual(ev.title, 'Ny titel');
  });

  it('EDIT-06: updates the start time of the target event', () => { // EDIT-06
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { start: '11:00' });
    const parsed = yaml.load(result);
    const ev = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');
    assert.strictEqual(ev.start, '11:00');
  });

  it('EDIT-07: updates the end time of the target event', () => { // EDIT-07
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { end: '12:00' });
    const parsed = yaml.load(result);
    const ev = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');
    assert.strictEqual(ev.end, '12:00');
  });

  it('EDIT-08: clears end time when empty string is provided', () => { // EDIT-08
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { end: '' });
    const parsed = yaml.load(result);
    const ev = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');
    assert.strictEqual(ev.end, null);
  });

  it('EDIT-09: updates the location of the target event', () => { // EDIT-09
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { location: 'Ny plats' });
    const parsed = yaml.load(result);
    const ev = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');
    assert.strictEqual(ev.location, 'Ny plats');
  });

  it('EDIT-10: updates the responsible person of the target event', () => { // EDIT-10
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { responsible: 'Karin' });
    const parsed = yaml.load(result);
    const ev = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');
    assert.strictEqual(ev.responsible, 'Karin');
  });

  it('EDIT-11: updates the description of the target event', () => { // EDIT-11
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { description: 'Ny beskrivning.' });
    const parsed = yaml.load(result);
    const ev = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');
    assert.strictEqual(ev.description, 'Ny beskrivning.');
  });

  it('EDIT-12: updates the link of the target event', () => { // EDIT-12
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { link: 'https://new.example.com' });
    const parsed = yaml.load(result);
    const ev = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');
    assert.strictEqual(ev.link, 'https://new.example.com');
  });

  it('EDIT-13: preserves the event ID after patching', () => { // EDIT-13
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { title: 'Ändrad' });
    const parsed = yaml.load(result);
    const ev = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');
    assert.ok(ev, 'Event should still be findable by its original ID');
    assert.strictEqual(ev.id, 'event-one-2099-06-01-1000');
  });

  it('EDIT-14: preserves the owner block after patching', () => { // EDIT-14
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { title: 'Ändrad' });
    const parsed = yaml.load(result);
    const ev = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');
    assert.deepStrictEqual(ev.owner, { name: '', email: '' });
  });

  it('EDIT-15: updates meta.updated_at to a current timestamp', () => { // EDIT-15
    const beforeMs = Date.now();
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { title: 'Ändrad' });
    const afterMs = Date.now();
    const parsed = yaml.load(result);
    const ev = parsed.events.find(e => e.id === 'event-one-2099-06-01-1000');

    // updated_at format: "YYYY-MM-DD HH:MM"
    assert.ok(typeof ev.meta.updated_at === 'string', 'updated_at should be a string');
    assert.ok(ev.meta.updated_at !== '2099-05-01 12:00', 'updated_at should have changed');

    // Verify the timestamp is plausible (within the test run window)
    const parsedDate = new Date(ev.meta.updated_at.replace(' ', 'T'));
    assert.ok(parsedDate.getTime() >= beforeMs - 1000, 'updated_at should not be before test start');
    assert.ok(parsedDate.getTime() <= afterMs + 1000, 'updated_at should not be after test end');
  });

  it('EDIT-16: leaves other events in the file unchanged', () => { // EDIT-16
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { title: 'Ändrad' });
    const parsed = yaml.load(result);
    const unchanged = parsed.events.find(e => e.id === 'event-two-2099-06-02-1400');
    assert.strictEqual(unchanged.title, 'Event Two');
    assert.strictEqual(unchanged.location, 'Matsalen');
    assert.strictEqual(unchanged.responsible, 'Bo');
  });

  it('EDIT-17: result is parseable as valid YAML', () => { // EDIT-17
    const result = patchEventInYaml(SAMPLE_YAML, 'event-one-2099-06-01-1000', { title: 'Ändrad', description: 'Text med\ndouble radbrytning.' });
    assert.doesNotThrow(() => yaml.load(result), 'Result should be valid YAML');
    const parsed = yaml.load(result);
    assert.ok(Array.isArray(parsed.events), 'events should be an array');
    assert.strictEqual(parsed.events.length, 2);
  });
});
