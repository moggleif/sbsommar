'use strict';

// Tests for synchronous API error visibility (02-§53.1–53.5).
//
// The PHP API runs on the server and cannot be executed in Node.js.
// These tests are source-code structural checks: they verify that
// api/index.php no longer uses the fire-and-forget pattern.
//
// Manual checkpoints (must be verified via the API):
//   SYNC-M01: Submit an event with valid data → API returns { success: true }
//     (GitHub PR is created before the response arrives).
//   SYNC-M02: Stop the API .env (remove GITHUB_TOKEN) → submit an event →
//     API returns { success: false, error: "..." } with HTTP 500.
//   SYNC-M03: Error message is in Swedish and contains no stack trace.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(
  path.join(__dirname, '..', 'api', 'index.php'),
  'utf8',
);

describe('02-§53.5 — flushToClient and ob_start removed (SYNC-01..02)', () => {
  it('SYNC-01: api/index.php does not call flushToClient()', () => {
    assert.ok(
      !SRC.includes('flushToClient'),
      'flushToClient() must be removed — synchronous flow does not need it',
    );
  });

  it('SYNC-02: api/index.php does not call ob_start()', () => {
    assert.ok(
      !SRC.includes('ob_start'),
      'ob_start() must be removed — synchronous flow does not need it',
    );
  });
});

describe('02-§53.1–53.2 — GitHub operation before response (SYNC-03..04)', () => {
  // In the synchronous pattern, addEventToActiveCamp / updateEventInActiveCamp
  // must be called BEFORE jsonResponse (success).  We verify this by checking
  // that the PHP source does NOT contain the old fire-and-forget pattern where
  // jsonResponse comes before the GitHub call.

  it('SYNC-03: addEventToActiveCamp is called before the success response in handleAddEvent', () => {
    // Extract the handleAddEvent function body
    const fnMatch = SRC.match(/function handleAddEvent[\s\S]*?^}/m);
    assert.ok(fnMatch, 'handleAddEvent function must exist');
    const fnBody = fnMatch[0];

    const ghCallIdx = fnBody.indexOf('addEventToActiveCamp');
    const successIdx = fnBody.indexOf("jsonResponse(['success' => true");
    assert.ok(ghCallIdx > 0, 'addEventToActiveCamp must be called in handleAddEvent');
    assert.ok(successIdx > 0, 'success jsonResponse must exist in handleAddEvent');
    assert.ok(
      ghCallIdx < successIdx,
      'addEventToActiveCamp must be called BEFORE the success response',
    );
  });

  it('SYNC-04: updateEventInActiveCamp is called before the success response in handleEditEvent', () => {
    const fnMatch = SRC.match(/function handleEditEvent[\s\S]*?^}/m);
    assert.ok(fnMatch, 'handleEditEvent function must exist');
    const fnBody = fnMatch[0];

    const ghCallIdx = fnBody.indexOf('updateEventInActiveCamp');
    const successIdx = fnBody.indexOf("jsonResponse(['success' => true");
    assert.ok(ghCallIdx > 0, 'updateEventInActiveCamp must be called in handleEditEvent');
    assert.ok(successIdx > 0, 'success jsonResponse must exist in handleEditEvent');
    assert.ok(
      ghCallIdx < successIdx,
      'updateEventInActiveCamp must be called BEFORE the success response',
    );
  });
});

describe('02-§53.3–53.4 — Error response on GitHub failure (SYNC-05..06)', () => {
  it('SYNC-05: handleAddEvent has a catch block that returns success: false', () => {
    const fnMatch = SRC.match(/function handleAddEvent[\s\S]*?^}/m);
    assert.ok(fnMatch, 'handleAddEvent function must exist');
    const fnBody = fnMatch[0];

    assert.ok(
      fnBody.includes("'success' => false"),
      'catch block must return success: false on GitHub failure',
    );
  });

  it('SYNC-06: handleEditEvent has a catch block that returns success: false', () => {
    const fnMatch = SRC.match(/function handleEditEvent[\s\S]*?^}/m);
    assert.ok(fnMatch, 'handleEditEvent function must exist');
    const fnBody = fnMatch[0];

    assert.ok(
      fnBody.includes("'success' => false"),
      'catch block must return success: false on GitHub failure',
    );
  });
});
