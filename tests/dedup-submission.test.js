'use strict';

// Structural checks for the duplicate-submission pre-check (02-§110.1–110.5).
//
// The pre-check lives inside the network-touching add flow (github.js / GitHub.php)
// and its entrypoints (app.js / index.php), which cannot run in Node tests. As with
// api-sync-errors.test.js, these are source-code structural checks: they pin the
// ordering and the 409/Swedish-message contract. The live behaviour is a manual
// checkpoint:
//   DEDUP-M01: submit an activity that already exists → API answers 409 with
//     "Den här aktiviteten finns redan i schemat." and no PR is created.
//   DEDUP-M02: submit the same activity twice concurrently → one lands; the
//     redundant PR is auto-closed by close-redundant-event-prs (02-§110.6–110.9).

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = (...p) => path.join(__dirname, '..', ...p);
const read = (...p) => fs.readFileSync(root(...p), 'utf8');

const GH_JS = read('source', 'api', 'github.js');
const APP_JS = read('app.js');
const GH_PHP = read('api', 'src', 'GitHub.php');
const INDEX_PHP = read('api', 'index.php');

// Slice out one function/method body so ordering checks are scoped to it.
function slice(src, startNeedle, endNeedle) {
  const start = src.indexOf(startNeedle);
  assert.ok(start >= 0, `expected to find "${startNeedle}"`);
  const end = endNeedle ? src.indexOf(endNeedle, start + startNeedle.length) : src.length;
  return src.slice(start, end > start ? end : src.length);
}

describe('02-§110 — github.js duplicate pre-check (DEDUP-01..03)', () => {
  const body = slice(GH_JS, 'async function addEventToActiveCamp', 'async function updateEventInActiveCamp');

  it('DEDUP-01: addEventToActiveCamp checks getFileMaybe before creating a branch', () => {
    const guardIdx = body.indexOf('getFileMaybe');
    const branchIdx = body.indexOf('createBranch');
    assert.ok(guardIdx > 0, 'add flow must call getFileMaybe');
    assert.ok(branchIdx > 0, 'add flow must call createBranch');
    assert.ok(guardIdx < branchIdx, 'duplicate pre-check must run BEFORE createBranch');
  });

  it('DEDUP-02: a duplicate throws an error carrying HTTP 409 and the Swedish message', () => {
    assert.ok(body.includes('duplicateEventError'), 'add flow must throw the duplicate error');
    assert.ok(GH_JS.includes('err.status = 409'), 'duplicate error must carry status 409');
    assert.ok(
      GH_JS.includes("DUPLICATE_EVENT_MESSAGE = 'Den här aktiviteten finns redan i schemat.'"),
      'Swedish duplicate message must be defined',
    );
  });

  it('DEDUP-03: isDuplicateEvent and DUPLICATE_EVENT_MESSAGE are exported', () => {
    const mod = require('../source/api/github');
    assert.equal(typeof mod.isDuplicateEvent, 'function');
    assert.equal(mod.DUPLICATE_EVENT_MESSAGE, 'Den här aktiviteten finns redan i schemat.');
  });
});

describe('02-§110.3 — app.js surfaces the duplicate synchronously (DEDUP-04)', () => {
  const handler = slice(APP_JS, "app.post('/add-event'", "app.post('/edit-event'");

  it('DEDUP-04: the handler awaits isDuplicateEvent and answers 409 before the success response', () => {
    const checkIdx = handler.indexOf('isDuplicateEvent');
    const successIdx = handler.indexOf('res.json({ success: true');
    assert.ok(checkIdx > 0, 'handler must call isDuplicateEvent');
    assert.ok(successIdx > 0, 'handler must send the success response');
    assert.ok(checkIdx < successIdx, 'duplicate check must run BEFORE res.json(success)');
    assert.ok(handler.includes('res.status(409)'), 'duplicate path must answer 409');
    assert.ok(handler.includes('await isDuplicateEvent'), 'pre-check must be awaited (not fire-and-forget)');
  });
});

describe('02-§110 — GitHub.php duplicate pre-check (DEDUP-05..07)', () => {
  const addBody = slice(GH_PHP, 'function addEventToActiveCamp', 'function addEventsToActiveCamp');
  const batchBody = slice(GH_PHP, 'function addEventsToActiveCamp', 'function updateEventInActiveCamp');

  it('DEDUP-05: addEventToActiveCamp checks getFileMaybe before createBranch and throws DuplicateEventException', () => {
    const guardIdx = addBody.indexOf('getFileMaybe');
    const branchIdx = addBody.indexOf('createBranch');
    assert.ok(guardIdx > 0 && branchIdx > 0, 'add flow must call getFileMaybe and createBranch');
    assert.ok(guardIdx < branchIdx, 'duplicate pre-check must run BEFORE createBranch');
    assert.ok(addBody.includes('DuplicateEventException'), 'duplicate must throw DuplicateEventException');
  });

  it('DEDUP-06: addEventsToActiveCamp checks every target before createBranch (atomic batch reject)', () => {
    const guardIdx = batchBody.indexOf('getFileMaybe');
    const branchIdx = batchBody.indexOf('createBranch');
    assert.ok(guardIdx > 0 && branchIdx > 0, 'batch flow must call getFileMaybe and createBranch');
    assert.ok(guardIdx < branchIdx, 'batch pre-check must run BEFORE createBranch');
    assert.ok(batchBody.includes('DuplicateEventException'), 'batch duplicate must throw DuplicateEventException');
  });

  it('DEDUP-07: DuplicateEventException exists and extends RuntimeException', () => {
    const ex = read('api', 'src', 'DuplicateEventException.php');
    assert.ok(ex.includes('class DuplicateEventException extends \\RuntimeException'));
    assert.ok(ex.includes('namespace SBSommar;'));
  });
});

describe('02-§110.2/110.5 — index.php maps duplicates to 409 (DEDUP-08..09)', () => {
  const single = slice(INDEX_PHP, 'function handleAddEvent(', 'function handleAddEvents(');
  const batch = slice(INDEX_PHP, 'function handleAddEvents(', 'function handleEditEvent(');

  it('DEDUP-08: handleAddEvent catches DuplicateEventException → 409 with the Swedish message, before the generic catch', () => {
    const dupIdx = single.indexOf('catch (DuplicateEventException');
    const genIdx = single.indexOf('catch (\\Throwable');
    assert.ok(dupIdx > 0, 'must catch DuplicateEventException');
    assert.ok(genIdx > 0, 'must keep the generic Throwable catch');
    assert.ok(dupIdx < genIdx, 'duplicate catch must precede the generic catch');
    assert.ok(single.includes('Den här aktiviteten finns redan i schemat.'), 'Swedish message');
    assert.ok(single.includes('], 409)'), 'must answer 409');
  });

  it('DEDUP-09: handleAddEvents catches DuplicateEventException → 409 (atomic batch reject)', () => {
    const dupIdx = batch.indexOf('catch (DuplicateEventException');
    const genIdx = batch.indexOf('catch (\\Throwable');
    assert.ok(dupIdx > 0 && genIdx > 0 && dupIdx < genIdx, 'duplicate catch must precede the generic catch');
    assert.ok(batch.includes('för ett eller flera av de valda datumen'), 'batch Swedish message');
    assert.ok(batch.includes('], 409)'), 'must answer 409');
  });
});
