'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const WORKFLOW_PATH = path.resolve(
  __dirname,
  '../.github/workflows/event-data-deploy-post-merge.yml'
);

const workflow = yaml.load(fs.readFileSync(WORKFLOW_PATH, 'utf8'));
const jobNames = Object.keys(workflow.jobs);

// ── 02-§51.1  No separate detect job ─────────────────────────────────────────

describe('02-§51.1 — No separate detect job (EDW-01)', () => {
  it('EDW-01: workflow has no job named "detect"', () => {
    assert.ok(
      !jobNames.includes('detect'),
      'workflow must not contain a standalone detect job'
    );
  });
});

// ── 02-§51.3  All deploy jobs start in parallel (no serial dependency) ───────

describe('02-§51.3 — Deploy jobs have no inter-job dependencies (EDW-02..04)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  it('EDW-02: at least two deploy jobs exist', () => {
    assert.ok(deployJobs.length >= 2, `found ${deployJobs.length} deploy jobs`);
  });

  for (const name of deployJobs) {
    it(`EDW-03: ${name} has no "needs" key`, () => {
      assert.strictEqual(
        workflow.jobs[name].needs,
        undefined,
        `${name} must not depend on another job`
      );
    });
  }
});

// ── 02-§51.4  Each deploy job checks out with fetch-depth: 2 ────────────────

describe('02-§51.4 — Checkout with fetch-depth: 2 (EDW-05..07)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  for (const name of deployJobs) {
    it(`EDW-05: ${name} checks out with fetch-depth: 2`, () => {
      const steps = workflow.jobs[name].steps || [];
      const checkout = steps.find(
        (s) => s.uses && s.uses.startsWith('actions/checkout')
      );
      assert.ok(checkout, `${name} must have a checkout step`);
      assert.strictEqual(
        checkout.with?.['fetch-depth'],
        2,
        `${name} checkout must use fetch-depth: 2`
      );
    });
  }
});

// ── 02-§51.2 / 02-§51.5  Inline detection per job ──────────────────────────

describe('02-§51.2 — Each deploy job has inline event-data detection (EDW-08..10)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  for (const name of deployJobs) {
    it(`EDW-08: ${name} has a gate step that runs git diff`, () => {
      const steps = workflow.jobs[name].steps || [];
      const gate = steps.find((s) => s.id === 'gate');
      assert.ok(gate, `${name} must have a step with id "gate"`);
      assert.ok(
        gate.run && gate.run.includes('git diff'),
        `${name} gate step must run git diff`
      );
      assert.ok(
        gate.run.includes('HEAD~1..HEAD'),
        `${name} gate step must compare HEAD~1..HEAD`
      );
    });
  }
});

// ── 02-§51.6  Skip build/deploy when no event data changed ─────────────────

describe('02-§51.6 — Build step gated on detection output (EDW-11..13)', () => {
  const deployJobs = jobNames.filter((n) => n.startsWith('deploy'));

  for (const name of deployJobs) {
    it(`EDW-11: ${name} build step has an if condition referencing gate output`, () => {
      const steps = workflow.jobs[name].steps || [];
      const build = steps.find(
        (s) => s.run && s.run.includes('node source/build/build.js')
      );
      assert.ok(build, `${name} must have a build step`);
      assert.ok(
        build.if && build.if.includes('gate'),
        `${name} build step must be gated on detection output`
      );
    });
  }
});

// ── 02-§51.7 / 02-§51.8  Production QA gating ──────────────────────────────

describe('02-§51.7 — Production job checks QA camp status (EDW-14..15)', () => {
  it('EDW-14: deploy-prod gate step checks camps.yaml for qa field', () => {
    const prod = workflow.jobs['deploy-prod'];
    assert.ok(prod, 'deploy-prod job must exist');
    const steps = prod.steps || [];
    const gate = steps.find((s) => s.id === 'gate');
    assert.ok(gate, 'deploy-prod must have a gate step');
    assert.ok(
      gate.run && gate.run.includes('camps.yaml'),
      'production gate must reference camps.yaml'
    );
    assert.ok(
      gate.run.includes('qa'),
      'production gate must check qa field'
    );
  });

  it('EDW-15: QA deploy jobs do NOT check camps.yaml for qa field', () => {
    for (const name of ['deploy-qa', 'deploy-qa-node']) {
      const job = workflow.jobs[name];
      if (!job) continue;
      const gate = (job.steps || []).find((s) => s.id === 'gate');
      if (!gate) continue;
      assert.ok(
        !gate.run.includes('camps.yaml'),
        `${name} gate should not check camps.yaml (QA always deploys)`
      );
    }
  });
});
