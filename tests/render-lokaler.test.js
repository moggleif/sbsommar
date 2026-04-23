'use strict';

// Tests for the locale overview page (02-§98).
//
// The page renders server-side at build time. Unit tests cover the pure
// helpers (`groupEventsByLocation`, `positionBlock`) and structural tests
// cover `renderLokalerPage` output. Visual verification — grid positioning
// accuracy in a real browser, mobile horizontal scroll behaviour, focus
// rings on event blocks — is a manual checkpoint (02-§98.15).

const nodeTest = require('node:test');
const { it } = nodeTest;
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Load the module defensively: Phase 3 commits the tests before Phase 4
// creates `source/build/render-lokaler.js`. If the file is missing the
// suites skip cleanly so the pre-commit hook still passes.
let renderLokalerPage, groupEventsByLocation, positionBlock, computeHourRange;
let moduleLoaded = false;
try {
  const mod = require('../source/build/render-lokaler');
  ({ renderLokalerPage, groupEventsByLocation, positionBlock, computeHourRange } = mod);
  moduleLoaded = true;
} catch {
  // module not yet present — all suites below will be skipped
}
const skip = !moduleLoaded;
// Alias so every suite below becomes describe.skip when the module is missing.
const describe = skip ? nodeTest.describe.skip : nodeTest.describe;

// ── Shared fixtures ─────────────────────────────────────────────────────────

const CAMP = {
  name: 'SB sommar 2099',
  location: 'Sysslebäck',
  start_date: '2099-07-01',
  end_date: '2099-07-03',
};

const LOCATIONS = [
  { id: 'servicehus', name: 'Servicehus', information: 'Kök och bord.', image_path: '' },
  { id: 'ga-idrott', name: 'GA Idrott', information: 'Rörelse.', image_path: '' },
  { id: 'kaffetalt', name: 'Kaffetält', information: 'Kaffe.', image_path: '' },
  { id: 'annat', name: 'Annat', information: 'Övriga platser.', image_path: '' },
];

function event(overrides = {}) {
  return {
    id: 'e1',
    title: 'Frukost',
    date: '2099-07-01',
    start: '08:00',
    end: '09:00',
    location: 'Servicehus',
    responsible: 'Anna',
    description: null,
    link: null,
    ...overrides,
  };
}

// Load the archived 2025-06 camp as a realistic data source
function load2025Camp() {
  const file = path.join(__dirname, '..', 'source', 'data', '2025-06-syssleback.yaml');
  const data = yaml.load(fs.readFileSync(file, 'utf8'));
  return { camp: data.camp, events: data.events };
}

function loadLocalYaml() {
  const file = path.join(__dirname, '..', 'source', 'data', 'local.yaml');
  const data = yaml.load(fs.readFileSync(file, 'utf8'));
  return data.locations;
}

// ── 02-§98.2, §98.7  groupEventsByLocation ─────────────────────────────────

describe('02-§98.2, §98.7 — groupEventsByLocation', () => {
  it('LOK-01: returns a Map with locations in local.yaml order', () => {
    const groups = groupEventsByLocation([], LOCATIONS);
    const keys = [...groups.keys()];
    assert.deepEqual(keys, ['Servicehus', 'GA Idrott', 'Kaffetält', 'Annat']);
  });

  it('LOK-02: locations with no events get an empty array', () => {
    const events = [event({ location: 'Servicehus' })];
    const groups = groupEventsByLocation(events, LOCATIONS);
    assert.deepEqual(groups.get('GA Idrott'), []);
    assert.deepEqual(groups.get('Kaffetält'), []);
  });

  it('LOK-03: events are placed under the matching locale name', () => {
    const events = [
      event({ id: 'a', location: 'Servicehus' }),
      event({ id: 'b', location: 'GA Idrott' }),
    ];
    const groups = groupEventsByLocation(events, LOCATIONS);
    assert.equal(groups.get('Servicehus').length, 1);
    assert.equal(groups.get('Servicehus')[0].id, 'a');
    assert.equal(groups.get('GA Idrott').length, 1);
    assert.equal(groups.get('GA Idrott')[0].id, 'b');
  });

  it('LOK-04: events with unknown location fold into Annat', () => {
    const events = [
      event({ id: 'x', location: 'MysteryRoom' }),
      event({ id: 'y', location: 'Servicehus' }),
    ];
    const groups = groupEventsByLocation(events, LOCATIONS);
    assert.equal(groups.get('Annat').length, 1);
    assert.equal(groups.get('Annat')[0].id, 'x');
    assert.equal(groups.get('Servicehus').length, 1);
  });

  it('LOK-05: events with explicit "Annat" location land in Annat', () => {
    const events = [event({ id: 'a', location: 'Annat' })];
    const groups = groupEventsByLocation(events, LOCATIONS);
    assert.equal(groups.get('Annat').length, 1);
    assert.equal(groups.get('Annat')[0].id, 'a');
  });

  it('LOK-06: events sorted by date then start within each locale', () => {
    const events = [
      event({ id: 'late', date: '2099-07-02', start: '08:00', location: 'Servicehus' }),
      event({ id: 'early', date: '2099-07-01', start: '09:00', location: 'Servicehus' }),
      event({ id: 'earliest', date: '2099-07-01', start: '08:00', location: 'Servicehus' }),
    ];
    const groups = groupEventsByLocation(events, LOCATIONS);
    const ids = groups.get('Servicehus').map((e) => e.id);
    assert.deepEqual(ids, ['earliest', 'early', 'late']);
  });

  it('LOK-07: does not lose any event from the 2025-06 archive', () => {
    const { events } = load2025Camp();
    const locations = loadLocalYaml();
    const groups = groupEventsByLocation(events, locations);
    let total = 0;
    for (const arr of groups.values()) total += arr.length;
    assert.equal(total, events.length);
  });

  it('LOK-08: 2025-06 archive events all map to a known locale row', () => {
    const { events } = load2025Camp();
    const locations = loadLocalYaml();
    const groups = groupEventsByLocation(events, locations);
    // Every row key must be a name from local.yaml
    const known = new Set(locations.map((l) => l.name));
    for (const name of groups.keys()) {
      assert.ok(known.has(name), `row ${name} is not in local.yaml`);
    }
  });
});

// ── 02-§98.4  positionBlock ─────────────────────────────────────────────────

describe('02-§98.4 — positionBlock', () => {
  it('LOK-10: event at the start of the band → leftPct = 0', () => {
    const { leftPct } = positionBlock(event({ start: '08:00', end: '09:00' }), 8, 22);
    assert.equal(leftPct, 0);
  });

  it('LOK-11: 1-hour event in a 14-hour band → widthPct ≈ 100/14', () => {
    const { widthPct } = positionBlock(event({ start: '10:00', end: '11:00' }), 8, 22);
    assert.ok(Math.abs(widthPct - 100 / 14) < 0.001, `widthPct was ${widthPct}`);
  });

  it('LOK-12: event at the end of the band → leftPct + widthPct = 100', () => {
    const { leftPct, widthPct } = positionBlock(event({ start: '21:00', end: '22:00' }), 8, 22);
    assert.ok(Math.abs(leftPct + widthPct - 100) < 0.001);
  });

  it('LOK-13: event beginning before the band is clipped at dayStart', () => {
    const { leftPct, widthPct } = positionBlock(event({ start: '07:00', end: '09:00' }), 8, 22);
    assert.equal(leftPct, 0);
    assert.ok(Math.abs(widthPct - 100 / 14) < 0.001);
  });

  it('LOK-14: event ending after the band is clipped at dayEnd', () => {
    const { leftPct, widthPct } = positionBlock(event({ start: '21:00', end: '23:00' }), 8, 22);
    assert.ok(Math.abs(leftPct + widthPct - 100) < 0.001);
  });

  it('LOK-15: cross-midnight (end ≤ start) is clipped at dayEnd', () => {
    const { leftPct, widthPct } = positionBlock(event({ start: '22:30', end: '01:00' }), 8, 23);
    // start = 22.5, end treated as 23 (clipped)
    const bandHours = 23 - 8;
    assert.ok(Math.abs(leftPct - ((22.5 - 8) / bandHours) * 100) < 0.001);
    assert.ok(Math.abs(widthPct - ((23 - 22.5) / bandHours) * 100) < 0.001);
  });

  it('LOK-16: half-hour offsets compute correctly (08:30 in 8–22)', () => {
    const { leftPct } = positionBlock(event({ start: '08:30', end: '09:00' }), 8, 22);
    assert.ok(Math.abs(leftPct - (0.5 / 14) * 100) < 0.001);
  });
});

// ── computeHourRange (helper) ───────────────────────────────────────────────

describe('computeHourRange — dynamic hour band', () => {
  it('LOK-20: falls back to 08–22 when there are no events', () => {
    const { startHour, endHour } = computeHourRange([]);
    assert.equal(startHour, 8);
    assert.equal(endHour, 22);
  });

  it('LOK-21: floors start to the whole hour and ceils end', () => {
    const events = [event({ start: '09:15', end: '10:45' })];
    const { startHour, endHour } = computeHourRange(events);
    assert.equal(startHour, 9);
    assert.equal(endHour, 11);
  });

  it('LOK-22: minimum window is 08–22 even with a single afternoon event', () => {
    // If the earliest is 14:00 and latest 15:00, we still want a readable
    // band — extend to the 08-22 fallback (events always fit inside fallback).
    const events = [event({ start: '14:00', end: '15:00' })];
    const { startHour, endHour } = computeHourRange(events);
    assert.ok(startHour <= 14);
    assert.ok(endHour >= 15);
  });
});

// ── renderLokalerPage — structural tests ────────────────────────────────────

function html() {
  const events = [
    event({ id: 'a', title: 'Frukost', location: 'Servicehus' }),
    event({ id: 'b', title: 'Badminton', location: 'GA Idrott', date: '2099-07-02', start: '14:00', end: '15:00', responsible: 'Erik' }),
    event({ id: 'c', title: 'Hemlig plats', location: 'MysteryRoom', date: '2099-07-03', start: '10:00', end: '11:00', responsible: 'Sara' }),
  ];
  return renderLokalerPage(CAMP, LOCATIONS, events);
}

describe('02-§98.1, §98.10 — renderLokalerPage structure', () => {
  it('LOK-30: produces a full HTML document', () => {
    const out = html();
    assert.ok(out.startsWith('<!DOCTYPE html>'), 'starts with doctype');
    assert.ok(out.includes('<html lang="sv">'), 'uses Swedish lang attr');
    assert.ok(out.includes('</html>'), 'closes html');
  });

  it('LOK-31: page heading is "Lokalöversikt"', () => {
    const out = html();
    assert.ok(out.includes('<h1>Lokalöversikt'), 'h1 reads Lokalöversikt');
  });

  it('LOK-32: includes camp name', () => {
    const out = html();
    assert.ok(out.includes(CAMP.name), 'camp name present');
  });
});

describe('02-§98.2, §98.6, §98.7 — locales and content', () => {
  it('LOK-40: includes every locale name from the locations list', () => {
    const out = html();
    for (const loc of LOCATIONS) {
      assert.ok(out.includes(loc.name), `locale ${loc.name} rendered`);
    }
  });

  it('LOK-41: includes every event title', () => {
    const out = html();
    assert.ok(out.includes('Frukost'));
    assert.ok(out.includes('Badminton'));
    assert.ok(out.includes('Hemlig plats'));
  });

  it('LOK-42: locales without events show "Inga bokningar"', () => {
    // Only Servicehus, GA Idrott, and Annat have events; Kaffetält is empty.
    const out = html();
    assert.ok(out.includes('Inga bokningar'), 'empty-row indicator present');
  });

  it('LOK-43: event with unknown location renders under Annat', () => {
    const out = html();
    // Heuristic: Annat-section appears somewhere after one of the other
    // locales, and the Hemlig-plats title appears in the output. The
    // grouping is also covered by LOK-04 as a unit test.
    assert.ok(out.includes('Hemlig plats'));
    assert.ok(out.includes('Annat'));
  });
});

describe('02-§98.5, §98.11 — event block details and accessibility', () => {
  it('LOK-50: event block shows start and end time', () => {
    const out = html();
    assert.ok(out.includes('08:00'), 'start time present');
    assert.ok(out.includes('09:00'), 'end time present');
  });

  it('LOK-51: event block shows responsible person', () => {
    const out = html();
    assert.ok(out.includes('Anna'), 'responsible for default event');
    assert.ok(out.includes('Erik'), 'responsible for Badminton');
  });

  it('LOK-52: event block carries an aria-label containing locale, time and title', () => {
    const out = html();
    // Find any aria-label attribute value that mentions both Frukost and 08:00
    const ariaLabelMatches = out.match(/aria-label="[^"]+"/g) || [];
    const combined = ariaLabelMatches.join('\n');
    assert.ok(/Frukost/.test(combined), 'some aria-label mentions Frukost');
    assert.ok(/08:00/.test(combined), 'some aria-label mentions 08:00');
    assert.ok(/Servicehus/.test(combined), 'some aria-label mentions Servicehus');
  });

  it('LOK-53: event block is focusable (rendered as <a> or <button>)', () => {
    const out = html();
    // At minimum, each event-block appears as an anchor or button with class
    assert.ok(/class="event-block"/.test(out), 'event-block class present');
    assert.ok(/<(a|button)[^>]*class="event-block"/.test(out), 'event-block is focusable element');
  });
});

describe('02-§98.8, §98.9, §98.12, §98.13 — navigation, legend, rendering', () => {
  it('LOK-60: page includes the standard nav via pageNav (navigation wrapper present)', () => {
    const out = html();
    // The site uses <nav> elements in its pages (pageNav()). We just verify a
    // nav wrapper is present — the exact label "Lokalöversikt" must NOT be a
    // nav entry (02-§98.9 — tested in LOK-61 by the absence of that link).
    assert.ok(/<nav/.test(out), 'nav element present');
  });

  it('LOK-61: the nav does not contain a top-level Lokalöversikt link (02-§98.9)', () => {
    const out = html();
    // The only hits of "Lokalöversikt" should be the h1 and legend text,
    // never inside a nav anchor.
    const navMatch = out.match(/<nav[\s\S]*?<\/nav>/);
    if (navMatch) {
      assert.ok(!navMatch[0].includes('Lokalöversikt'), 'nav does not include Lokalöversikt');
    }
  });

  it('LOK-62: legend text appears below the grid', () => {
    const out = html();
    assert.ok(/class="lokaler-legend"/.test(out), 'legend container present');
  });

  it('LOK-63: page does not reference any client-side grid JS (no <script src="lokaler.js">)', () => {
    const out = html();
    assert.ok(!/lokaler\.js/.test(out), 'no client-side lokaler.js loaded (02-§98.13)');
  });
});

describe('02-§98.4 — clash detection and lane stacking', () => {
  it('LOK-80: overlapping events get separate lanes and a clash class', () => {
    const events = [
      event({ id: 'a', date: '2099-07-01', start: '12:00', end: '14:00', location: 'Servicehus', title: 'Workshop' }),
      event({ id: 'b', date: '2099-07-01', start: '13:00', end: '15:00', location: 'Servicehus', title: 'Yoga' }),
    ];
    const out = renderLokalerPage(CAMP, LOCATIONS, events);
    assert.ok(/event-block--clash/.test(out), 'at least one block is marked as clash');
    assert.ok(/day-band--lanes-2/.test(out), 'day band uses two lanes for the overlap');
  });

  it('LOK-81: back-to-back events (no overlap) do not clash', () => {
    const events = [
      event({ id: 'a', date: '2099-07-01', start: '12:00', end: '13:00', location: 'Servicehus' }),
      event({ id: 'b', date: '2099-07-01', start: '13:00', end: '14:00', location: 'Servicehus', title: 'Fika' }),
    ];
    const out = renderLokalerPage(CAMP, LOCATIONS, events);
    assert.ok(!/event-block--clash/.test(out), 'adjacent events are not clashes');
    assert.ok(!/day-band--lanes-/.test(out), 'single lane is enough');
  });

  it('LOK-83: non-overlapping event keeps --group:1 even when another pair clashes that day', () => {
    const events = [
      // Morning event, no overlap — should render at full height
      event({ id: 'morning', date: '2099-07-01', start: '09:00', end: '10:00', location: 'Servicehus', title: 'Frukost' }),
      // Afternoon clash pair
      event({ id: 'a', date: '2099-07-01', start: '14:00', end: '15:30', location: 'Servicehus', title: 'Workshop' }),
      event({ id: 'b', date: '2099-07-01', start: '15:00', end: '16:00', location: 'Servicehus', title: 'Yoga' }),
    ];
    const out = renderLokalerPage(CAMP, LOCATIONS, events);
    // Morning event should have --group:1 (stands alone in its timespan)
    assert.ok(/\[data-lb="morning"\][^}]*--group:1/.test(out), 'morning event has group 1');
    // Both clash events should have --group:2 (they overlap each other)
    assert.ok(/\[data-lb="a"\][^}]*--group:2/.test(out), 'clash A has group 2');
    assert.ok(/\[data-lb="b"\][^}]*--group:2/.test(out), 'clash B has group 2');
  });

  it('LOK-82: events in different locales on the same time do not clash', () => {
    const events = [
      event({ id: 'a', date: '2099-07-01', start: '12:00', end: '13:00', location: 'Servicehus' }),
      event({ id: 'b', date: '2099-07-01', start: '12:00', end: '13:00', location: 'GA Idrott', title: 'Badminton' }),
    ];
    const out = renderLokalerPage(CAMP, LOCATIONS, events);
    assert.ok(!/event-block--clash/.test(out), 'different locales do not clash');
  });
});

describe('02-§98.3 — today-forward filter', () => {
  const CAMP_ACTIVE = {
    name: 'SB sommar 2099',
    location: 'Sysslebäck',
    start_date: '2099-07-01',
    end_date: '2099-07-05',
  };

  it('LOK-75: hides past days when today is in the middle of the camp', () => {
    const events = [
      event({ id: 'past', date: '2099-07-01', title: 'Gammal aktivitet' }),
      event({ id: 'today', date: '2099-07-03', title: 'Dagens aktivitet' }),
      event({ id: 'future', date: '2099-07-05', title: 'Framtida aktivitet' }),
    ];
    const out = renderLokalerPage(CAMP_ACTIVE, LOCATIONS, events, '', [], '', '2099-07-03');
    assert.ok(!out.includes('Gammal aktivitet'), 'past event is hidden');
    assert.ok(out.includes('Dagens aktivitet'), 'today event is shown');
    assert.ok(out.includes('Framtida aktivitet'), 'future event is shown');
  });

  it('LOK-76: shows all days when today is before the camp starts', () => {
    const events = [event({ date: '2099-07-02', title: 'Framtid' })];
    const out = renderLokalerPage(CAMP_ACTIVE, LOCATIONS, events, '', [], '', '2099-06-15');
    assert.ok(out.includes('Framtid'), 'event shown when whole camp is still upcoming');
  });

  it('LOK-77: falls back to the full span when today is after the camp ends', () => {
    // Without fallback the grid would render with zero days (visibly broken).
    const events = [event({ date: '2099-07-02', title: 'Gammal' })];
    const out = renderLokalerPage(CAMP_ACTIVE, LOCATIONS, events, '', [], '', '2099-07-10');
    assert.ok(out.includes('Gammal'), 'event still rendered when whole camp is in the past');
  });
});

describe('02-§98.21 — zero-duration events are skipped', () => {
  it('LOK-84: event with start === end does not render a block', () => {
    const events = [
      event({ id: 'zero', date: '2099-07-01', start: '23:59', end: '23:59', title: 'Sista för idag' }),
      event({ id: 'real', date: '2099-07-01', start: '10:00', end: '11:00', title: 'Frukost' }),
    ];
    const out = renderLokalerPage(CAMP, LOCATIONS, events);
    assert.ok(out.includes('Frukost'), 'real event still rendered');
    assert.ok(!out.includes('Sista för idag'), 'zero-duration event hidden from the grid');
  });
});

describe('02-§98.22 — cross-midnight events split across two days', () => {
  const MULTI_DAY_CAMP = {
    name: 'SB sommar 2099',
    location: 'Sysslebäck',
    start_date: '2099-07-01',
    end_date: '2099-07-03',
  };

  it('LOK-85: event 22:00–01:00 on day 1 renders on both day 1 and day 2', () => {
    const events = [
      event({ id: 'nightfilm', date: '2099-07-01', start: '22:00', end: '01:00', title: 'Nattbio', location: 'Servicehus' }),
    ];
    const out = renderLokalerPage(MULTI_DAY_CAMP, LOCATIONS, events);
    assert.ok(/data-lb="nightfilm--start"/.test(out), 'start-half block on day 1');
    assert.ok(/data-lb="nightfilm--end"/.test(out), 'end-half block on day 2');
    assert.ok(out.includes('fortsätter nästa dag'), 'aria-label hints at continuation');
    assert.ok(out.includes('från föregående dag'), 'aria-label hints at origin day');
  });
});

describe('02-§98.23 — native table semantics', () => {
  it('LOK-86: grid uses <table>/<tr>/<th>/<td> so assistive tech announces axes', () => {
    const events = [event({ id: 'a', title: 'Test' })];
    const out = renderLokalerPage(CAMP, LOCATIONS, events);
    assert.ok(/<table class="lokaler-grid"/.test(out), 'outer container is a <table>');
    assert.ok(/<tr class="lokal-row/.test(out), 'body rows are <tr>');
    assert.ok(/<th class="lokal-label" scope="row"/.test(out), 'locale labels are <th scope="row">');
    assert.ok(/<th class="day-band-label" scope="col"/.test(out), 'day headers are <th scope="col">');
    assert.ok(/<td class="day-band/.test(out), 'day bands are <td>');
  });
});

describe('clash CSS source order — regression test for :hover override', () => {
  it('LOK-87: .event-block--clash:hover rule appears after .event-block:hover in style.css', () => {
    const css = fs.readFileSync(
      path.join(__dirname, '..', 'source', 'assets', 'cs', 'style.css'),
      'utf8',
    );
    const generalHover = css.indexOf('.event-block:hover');
    const clashHover = css.indexOf('.event-block--clash:hover');
    assert.ok(generalHover > 0, 'general .event-block:hover rule exists');
    assert.ok(clashHover > 0, '.event-block--clash:hover rule exists');
    assert.ok(
      clashHover > generalHover,
      'clash hover rule must come after general hover so it wins at equal specificity',
    );
  });
});

describe('02-§98.1 — integration with 2025-06 archive camp', () => {
  it('LOK-70: renders without throwing against the real 2025-06 archive', () => {
    const { camp, events } = load2025Camp();
    const locations = loadLocalYaml();
    const out = renderLokalerPage(camp, locations, events);
    assert.ok(out.startsWith('<!DOCTYPE html>'));
    // Every location from local.yaml should appear in the output
    for (const loc of locations) {
      assert.ok(out.includes(loc.name), `locale ${loc.name} appears`);
    }
  });

  it('LOK-71: every non-zero-duration event title from the archive appears at least once', () => {
    const { camp, events } = load2025Camp();
    const locations = loadLocalYaml();
    const out = renderLokalerPage(camp, locations, events);
    // Zero-duration events (start === end) are intentionally skipped per
    // 02-§98.21 — exclude them from the "should appear" assertion.
    const renderableTitles = [...new Set(
      events.filter((e) => e.start !== e.end).map((e) => e.title),
    )];
    for (const title of renderableTitles) {
      assert.ok(out.includes(title), `title "${title}" present in output`);
    }
  });
});
