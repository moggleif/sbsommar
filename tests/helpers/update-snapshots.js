'use strict';

// Cross-platform way to set UPDATE_SNAPSHOTS before running tests.
// Usage: npm run test:update-snapshots
const { execSync } = require('child_process');

execSync('node --test tests/render.test.js tests/snapshot.test.js', {
  stdio: 'inherit',
  env: { ...process.env, UPDATE_SNAPSHOTS: '1' },
});
