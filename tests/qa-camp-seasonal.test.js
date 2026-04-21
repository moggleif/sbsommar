'use strict';

// Verifies the seasonal QA camp model in source/data/camps.yaml (02-§42.31–42.34).
//
// The site keeps two QA-only camps (qa: true): a "spring" camp that closes two
// weeks before the next real camp begins, and an "autumn" camp covering Oct 1
// – Dec 31 of the current year. Together they leave the real-camp window
// QA-free while ensuring continuous QA coverage outside that window.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const CAMPS_PATH = path.join(__dirname, '..', 'source', 'data', 'camps.yaml');
const camps = yaml.load(fs.readFileSync(CAMPS_PATH, 'utf8')).camps;

const qaCamps = camps.filter((c) => c.qa === true);
const realCamps = camps.filter((c) => !c.qa && c.archived !== true);

function daysBetween(a, b) {
  const ms = (new Date(b) - new Date(a));
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

describe('camps.yaml – seasonal QA camp model (02-§42.31–42.34)', () => {
  it('QSEAS-01 (02-§42.31): exactly two QA-only camps exist', () => {
    assert.equal(
      qaCamps.length, 2,
      `Expected 2 qa: true camps, found ${qaCamps.length}: ${qaCamps.map((c) => c.id).join(', ')}`,
    );
  });

  it('QSEAS-02 (02-§42.34): an autumn QA camp runs Oct 1 – Dec 31 of its year', () => {
    const autumn = qaCamps.find((c) => /-10-01$/.test(c.start_date));
    assert.ok(autumn, 'No QA camp starts on Oct 1');
    assert.match(autumn.end_date, /-12-31$/, 'Autumn QA camp must end on Dec 31');
    assert.equal(
      autumn.start_date.slice(0, 4),
      autumn.end_date.slice(0, 4),
      'Autumn QA camp start and end years must match',
    );
  });

  it('QSEAS-03 (02-§42.31): a spring QA camp exists (the non-autumn QA camp)', () => {
    const spring = qaCamps.find((c) => !/-10-01$/.test(c.start_date));
    assert.ok(spring, 'No spring QA camp found');
  });

  it('QSEAS-04 (02-§42.32): spring QA camp end_date is exactly 14 days before the next real camp', () => {
    const spring = qaCamps.find((c) => !/-10-01$/.test(c.start_date));
    assert.ok(spring, 'No spring QA camp found');

    const upcomingReal = realCamps
      .filter((c) => c.start_date > spring.end_date)
      .sort((a, b) => a.start_date.localeCompare(b.start_date))[0];

    assert.ok(upcomingReal, 'No upcoming real camp after spring QA camp end_date');

    const gap = daysBetween(spring.end_date, upcomingReal.start_date);
    assert.equal(
      gap, 14,
      `Spring QA camp must end exactly 14 days before next real camp (${upcomingReal.id} on ${upcomingReal.start_date}); got ${gap} days from ${spring.end_date}`,
    );
  });

  it('QSEAS-05 (02-§42.33): no QA camp covers any date during the real-camp season window', () => {
    if (realCamps.length === 0) return;
    const seasonStart = realCamps.reduce((min, c) => c.start_date < min ? c.start_date : min, realCamps[0].start_date);
    const seasonEnd = realCamps.reduce((max, c) => c.end_date > max ? c.end_date : max, realCamps[0].end_date);

    for (const qc of qaCamps) {
      const overlaps = qc.start_date <= seasonEnd && qc.end_date >= seasonStart;
      assert.ok(
        !overlaps,
        `QA camp "${qc.id}" (${qc.start_date}..${qc.end_date}) overlaps real-camp season (${seasonStart}..${seasonEnd})`,
      );
    }
  });
});
